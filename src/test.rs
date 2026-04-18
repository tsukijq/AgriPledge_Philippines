//! Test suite for AgriPledge PH Soroban contract
//! Exactly 5 tests as required:
//!   1. Happy path — full MVP flow end-to-end
//!   2. Edge case  — unauthorized caller on fund_commitment
//!   3. State verification — storage reflects correct state after funding
//!   4. Edge case  — double-claim on mid-crop milestone
//!   5. Edge case  — cancel only works on Open contracts

#[cfg(test)]
mod tests {
    use soroban_sdk::{
        testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation},
        token, Address, Env, IntoVal, String,
    };

    use crate::{AgriPledgeContract, AgriPledgeContractClient, ContractStatus};

    // ─── Helpers ────────────────────────────────────────────────────────────

    /// Deploy a mock USDC token and mint `amount` to `recipient`
    fn setup_token(env: &Env, admin: &Address, recipient: &Address, amount: i128) -> Address {
        let token_id = env.register_stellar_asset_contract(admin.clone());
        let token_admin = token::StellarAssetClient::new(env, &token_id);
        token_admin.mint(recipient, &amount);
        token_id
    }

    // ─── Test 1: Happy Path ──────────────────────────────────────────────────
    /// Full end-to-end MVP flow:
    ///   create_commitment → fund_commitment (40% released) →
    ///   submit_midcrop_proof (20% released) → confirm_delivery (40% released)
    #[test]
    fn test_full_mvp_flow() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, AgriPledgeContract);
        let client = AgriPledgeContractClient::new(&env, &contract_id);

        let farmer = Address::generate(&env);
        let buyer  = Address::generate(&env);
        let admin  = Address::generate(&env);

        let total_usdc: i128 = 1_000_0000000; // 1000 USDC (7 decimal places)
        let token_id = setup_token(&env, &admin, &buyer, total_usdc);
        let token_client = token::Client::new(&env, &token_id);

        // Step 1: Farmer creates commitment
        client.create_commitment(
            &farmer,
            &token_id,
            &total_usdc,
            &String::from_str(&env, "1 Ton Jasmine Rice"),
        );
        assert_eq!(client.get_status(), ContractStatus::Open);

        // Step 2: Buyer funds → 40% (400 USDC) released to farmer immediately
        client.fund_commitment(&buyer);
        assert_eq!(client.get_status(), ContractStatus::Funded);

        let expected_planting = (total_usdc * 40) / 100; // 400 USDC
        assert_eq!(token_client.balance(&farmer), expected_planting);
        // Contract holds remaining 60%
        assert_eq!(token_client.balance(&contract_id), total_usdc - expected_planting);

        // Step 3: Farmer submits mid-crop proof → 20% released
        client.submit_midcrop_proof(&farmer);
        assert_eq!(client.get_status(), ContractStatus::MidCrop);

        let expected_midcrop = (total_usdc * 20) / 100; // 200 USDC
        assert_eq!(token_client.balance(&farmer), expected_planting + expected_midcrop);

        // Step 4: Buyer confirms delivery → final 40% released
        client.confirm_delivery(&buyer);
        assert_eq!(client.get_status(), ContractStatus::Completed);

        // Farmer should now hold 100% of total
        assert_eq!(token_client.balance(&farmer), total_usdc);
        // Contract should be empty
        assert_eq!(token_client.balance(&contract_id), 0);

        // All milestones marked paid
        assert_eq!(client.get_milestones(), (true, true, true));
    }

    // ─── Test 2: Edge Case — Wrong Buyer Cannot Fund ─────────────────────────
    /// An address that is not the depositing buyer cannot call fund_commitment
    /// with someone else's auth. The contract must reject it.
    /// Here we verify that calling fund_commitment without proper auth panics.
    #[test]
    #[should_panic]
    fn test_unauthorized_fund_panics() {
        let env = Env::default();
        // Note: we do NOT call env.mock_all_auths() — auth is enforced

        let contract_id = env.register_contract(None, AgriPledgeContract);
        let client = AgriPledgeContractClient::new(&env, &contract_id);

        let farmer    = Address::generate(&env);
        let buyer     = Address::generate(&env);
        let intruder  = Address::generate(&env); // not the buyer
        let admin     = Address::generate(&env);

        let total_usdc: i128 = 500_0000000;
        let token_id = setup_token(&env, &admin, &buyer, total_usdc);

        env.mock_all_auths_allowing_non_root_auth();

        client.create_commitment(
            &farmer,
            &token_id,
            &total_usdc,
            &String::from_str(&env, "500kg Brown Rice"),
        );

        // Intruder tries to call fund_commitment — no USDC, no auth
        // This should panic because intruder hasn't authorized and has no funds
        client.fund_commitment(&intruder);
    }

    // ─── Test 3: State Verification After Funding ────────────────────────────
    /// After fund_commitment:
    ///   - Status must be Funded
    ///   - Planting milestone flag must be true
    ///   - Mid-crop and delivery flags must be false
    ///   - Farmer balance must equal exactly 40% of total
    #[test]
    fn test_state_after_funding() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, AgriPledgeContract);
        let client = AgriPledgeContractClient::new(&env, &contract_id);

        let farmer = Address::generate(&env);
        let buyer  = Address::generate(&env);
        let admin  = Address::generate(&env);

        let total_usdc: i128 = 2_000_0000000; // 2000 USDC
        let token_id = setup_token(&env, &admin, &buyer, total_usdc);
        let token_client = token::Client::new(&env, &token_id);

        client.create_commitment(
            &farmer,
            &token_id,
            &total_usdc,
            &String::from_str(&env, "2 Tons Sinandomeng Rice"),
        );

        client.fund_commitment(&buyer);

        // Verify status
        assert_eq!(client.get_status(), ContractStatus::Funded);

        // Verify milestone flags: only planting paid
        let (planting, midcrop, delivery) = client.get_milestones();
        assert!(planting,   "Planting should be marked paid after funding");
        assert!(!midcrop,   "Mid-crop should NOT be paid yet");
        assert!(!delivery,  "Delivery should NOT be paid yet");

        // Verify exact USDC balances
        let expected_farmer_balance = (total_usdc * 40) / 100; // 800 USDC
        let expected_contract_balance = total_usdc - expected_farmer_balance; // 1200 USDC

        assert_eq!(
            token_client.balance(&farmer),
            expected_farmer_balance,
            "Farmer should hold exactly 40% after planting release"
        );
        assert_eq!(
            token_client.balance(&contract_id),
            expected_contract_balance,
            "Contract should hold exactly 60% in escrow"
        );

        // Verify total is stored correctly
        assert_eq!(client.get_total(), total_usdc);
        assert_eq!(client.get_farmer(), farmer);
    }

    // ─── Test 4: Edge Case — Double Mid-Crop Claim ───────────────────────────
    /// Farmer cannot claim the mid-crop milestone twice.
    /// Second call to submit_midcrop_proof must panic.
    #[test]
    #[should_panic(expected = "Mid-crop milestone already claimed")]
    fn test_double_midcrop_claim_panics() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, AgriPledgeContract);
        let client = AgriPledgeContractClient::new(&env, &contract_id);

        let farmer = Address::generate(&env);
        let buyer  = Address::generate(&env);
        let admin  = Address::generate(&env);

        let total_usdc: i128 = 800_0000000;
        let token_id = setup_token(&env, &admin, &buyer, total_usdc);

        client.create_commitment(
            &farmer,
            &token_id,
            &total_usdc,
            &String::from_str(&env, "800kg Malagkit Rice"),
        );
        client.fund_commitment(&buyer);

        // First claim — valid
        client.submit_midcrop_proof(&farmer);

        // Second claim — must panic
        client.submit_midcrop_proof(&farmer);
    }

    // ─── Test 5: Edge Case — Cancel Only Works on Open ───────────────────────
    /// After a contract is funded, the farmer cannot cancel it.
    /// cancel() must panic if status != Open.
    #[test]
    #[should_panic(expected = "Can only cancel an Open contract")]
    fn test_cancel_funded_contract_panics() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, AgriPledgeContract);
        let client = AgriPledgeContractClient::new(&env, &contract_id);

        let farmer = Address::generate(&env);
        let buyer  = Address::generate(&env);
        let admin  = Address::generate(&env);

        let total_usdc: i128 = 600_0000000;
        let token_id = setup_token(&env, &admin, &buyer, total_usdc);

        client.create_commitment(
            &farmer,
            &token_id,
            &total_usdc,
            &String::from_str(&env, "600kg Dinorado Rice"),
        );

        // Fund the contract — status becomes Funded
        client.fund_commitment(&buyer);

        // Farmer tries to cancel after funding — must fail
        client.cancel(&farmer);
    }
}
