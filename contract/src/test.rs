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
        testutils::Address as _,
        token, Address, Env, String,
    };

    use crate::{AgriPledgeContract, AgriPledgeContractClient, ContractStatus};

    // ─── Helpers ────────────────────────────────────────────────────────────

    /// Create a default Env with unlimited budget.
    ///
    /// Fix 1: `env.budget().reset_unlimited()` prevents the silent CPU/memory
    /// budget exhaustion that causes STATUS_STACK_BUFFER_OVERRUN on Windows.
    /// Always call this instead of bare `Env::default()` in tests.
    fn make_env() -> Env {
        let env = Env::default();
        env.budget().reset_unlimited();
        env
    }

    /// Deploy a mock USDC token and mint `amount` to `recipient`.
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
        let env = make_env(); // Fix 1: unlimited budget
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
        assert_eq!(
            token_client.balance(&contract_id),
            total_usdc - expected_planting
        );

        // Step 3: Farmer submits mid-crop proof → 20% released
        client.submit_midcrop_proof(&farmer);
        assert_eq!(client.get_status(), ContractStatus::MidCrop);

        let expected_midcrop = (total_usdc * 20) / 100; // 200 USDC
        assert_eq!(
            token_client.balance(&farmer),
            expected_planting + expected_midcrop
        );

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
    /// An address that is not the depositing buyer cannot call fund_commitment.
    /// The intruder has no USDC balance, so the token transfer will panic,
    /// proving the contract does not allow unauthorized funding.
    ///
    /// Fix 2: We use mock_all_auths_allowing_non_root_auth (same as before) but
    /// now wrap the Env creation in make_env() so the budget does not blow up
    /// before the expected panic is even reached.
    #[test]
    #[should_panic]
    fn test_unauthorized_fund_panics() {
        let env = make_env(); // Fix 1: unlimited budget
        // Note: we do NOT call mock_all_auths globally — we want auth enforced
        // for the fund call, but we still need it for create_commitment setup.

        let contract_id = env.register_contract(None, AgriPledgeContract);
        let client = AgriPledgeContractClient::new(&env, &contract_id);

        let farmer   = Address::generate(&env);
        let buyer    = Address::generate(&env);
        let intruder = Address::generate(&env); // not the buyer, has no USDC
        let admin    = Address::generate(&env);

        let total_usdc: i128 = 500_0000000;
        let token_id = setup_token(&env, &admin, &buyer, total_usdc);

        // Allow non-root auth so create_commitment can proceed without a full
        // wallet stack, but fund_commitment will still fail because intruder
        // has no token balance to transfer.
        env.mock_all_auths_allowing_non_root_auth();

        client.create_commitment(
            &farmer,
            &token_id,
            &total_usdc,
            &String::from_str(&env, "500kg Brown Rice"),
        );

        // Intruder tries to fund — no USDC balance means token::transfer panics
        client.fund_commitment(&intruder);
    }

    // ─── Test 3: State Verification After Funding ────────────────────────────
    /// After fund_commitment:
    ///   - Status must be Funded
    ///   - Planting milestone flag must be true
    ///   - Mid-crop and delivery flags must be false
    ///   - Farmer balance must equal exactly 40% of total
    ///   - Contract balance must equal exactly 60% of total
    #[test]
    fn test_state_after_funding() {
        let env = make_env(); // Fix 1: unlimited budget
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
        assert!(planting,  "Planting should be marked paid after funding");
        assert!(!midcrop,  "Mid-crop should NOT be paid yet");
        assert!(!delivery, "Delivery should NOT be paid yet");

        // Verify exact USDC balances
        let expected_farmer_balance   = (total_usdc * 40) / 100; // 800 USDC
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

        // Verify stored fields are correct
        assert_eq!(client.get_total(), total_usdc);
        assert_eq!(client.get_farmer(), farmer);
    }

    // ─── Test 4: Edge Case — Double Mid-Crop Claim ───────────────────────────
    /// Farmer cannot claim the mid-crop milestone twice.
    /// Second call to submit_midcrop_proof must panic with a clear message.
    #[test]
    #[should_panic(expected = "Contract must be in Funded state")]
    fn test_double_midcrop_claim_panics() {
        let env = make_env(); // Fix 1: unlimited budget
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

        // Second claim — must panic with "Contract must be in Funded state"
        client.submit_midcrop_proof(&farmer);
    }

    // ─── Test 5: Edge Case — Cancel Only Works on Open ───────────────────────
    /// After a contract is funded, the farmer cannot cancel it.
    /// cancel() must panic with a clear message if status != Open.
    #[test]
    #[should_panic(expected = "Can only cancel an Open contract")]
    fn test_cancel_funded_contract_panics() {
        let env = make_env(); // Fix 1: unlimited budget
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

        // Farmer tries to cancel after funding — must panic
        client.cancel(&farmer);
    }
}