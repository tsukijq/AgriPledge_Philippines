//! AgriPledge PH — Harvest Commitment Escrow Contract
//!
//! Allows a farmer to list a harvest commitment and a buyer to pre-fund it.
//! USDC is held in escrow and released to the farmer in three milestones:
//!   Planting  → 40%
//!   Mid-Crop  → 20%
//!   Delivery  → 40%
//!
//! Only the designated buyer can fund the contract.
//! Only the designated farmer can claim milestones.
//! Only the buyer can confirm final delivery.

#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    token, Address, Env, String, Symbol,
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const FARMER:       Symbol = symbol_short!("FARMER");
const BUYER:        Symbol = symbol_short!("BUYER");
const TOKEN:        Symbol = symbol_short!("TOKEN");
const TOTAL:        Symbol = symbol_short!("TOTAL");
const STATUS:       Symbol = symbol_short!("STATUS");
const CROP_DESC:    Symbol = symbol_short!("CROP");
const PLANTING_PD:  Symbol = symbol_short!("PLT_PAID");
const MIDCROP_PD:   Symbol = symbol_short!("MID_PAID");
const DELIVERY_PD:  Symbol = symbol_short!("DEL_PAID");

// ─── Contract Status Enum ────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum ContractStatus {
    /// Farmer has created the listing; awaiting buyer deposit
    Open,
    /// Buyer has deposited USDC; planting funds released
    Funded,
    /// Farmer has submitted mid-crop proof; 20% released
    MidCrop,
    /// Buyer has confirmed delivery; final 40% released
    Completed,
    /// Contract was cancelled before funding
    Cancelled,
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct AgriPledgeContract;

#[contractimpl]
impl AgriPledgeContract {

    /// Farmer calls this to create a new harvest commitment.
    ///
    /// # Arguments
    /// * `farmer`    - Address of the farmer (must authorize)
    /// * `token`     - USDC token contract address on Stellar
    /// * `amount`    - Total USDC amount agreed for the full harvest
    /// * `crop_desc` - Short description, e.g. "1 Ton Jasmine Rice"
    pub fn create_commitment(
        env: Env,
        farmer: Address,
        token: Address,
        amount: i128,
        crop_desc: String,
    ) {
        // Farmer must sign this transaction
        farmer.require_auth();

        // Contract must be uninitialized (no duplicate creation)
        assert!(
            !env.storage().instance().has(&STATUS),
            "Contract already initialized"
        );
        assert!(amount > 0, "Amount must be positive");

        // Persist all commitment fields to instance storage
        env.storage().instance().set(&FARMER,      &farmer);
        env.storage().instance().set(&TOKEN,       &token);
        env.storage().instance().set(&TOTAL,       &amount);
        env.storage().instance().set(&CROP_DESC,   &crop_desc);
        env.storage().instance().set(&STATUS,      &ContractStatus::Open);
        env.storage().instance().set(&PLANTING_PD, &false);
        env.storage().instance().set(&MIDCROP_PD,  &false);
        env.storage().instance().set(&DELIVERY_PD, &false);
    }

    /// Buyer calls this to deposit USDC and lock in the commitment.
    /// Immediately releases 40% (planting tranche) to the farmer.
    ///
    /// # Arguments
    /// * `buyer` - Address of the buyer (must authorize)
    pub fn fund_commitment(env: Env, buyer: Address) {
        // Buyer must sign this transaction
        buyer.require_auth();

        let status: ContractStatus = env.storage().instance().get(&STATUS).unwrap();
        assert!(status == ContractStatus::Open, "Contract is not open for funding");

        let farmer: Address     = env.storage().instance().get(&FARMER).unwrap();
        let token_addr: Address = env.storage().instance().get(&TOKEN).unwrap();
        let total: i128         = env.storage().instance().get(&TOTAL).unwrap();

        // Calculate planting tranche: 40% of total
        let planting_amount = (total * 40) / 100;

        let token_client = token::Client::new(&env, &token_addr);

        // Transfer full amount from buyer to this contract
        token_client.transfer(&buyer, &env.current_contract_address(), &total);

        // Immediately release planting tranche to farmer
        token_client.transfer(&env.current_contract_address(), &farmer, &planting_amount);

        // Save buyer address and update state
        env.storage().instance().set(&BUYER,       &buyer);
        env.storage().instance().set(&STATUS,      &ContractStatus::Funded);
        env.storage().instance().set(&PLANTING_PD, &true);
    }

    /// Farmer submits mid-crop proof (hash stored off-chain / in memo).
    /// Releases 20% of total to the farmer.
    ///
    /// # Arguments
    /// * `farmer` - Must match original farmer address
    pub fn submit_midcrop_proof(env: Env, farmer: Address) {
        farmer.require_auth();

        // Verify caller is the original farmer
        let stored_farmer: Address = env.storage().instance().get(&FARMER).unwrap();
        assert!(farmer == stored_farmer, "Caller is not the contract farmer");

        let status: ContractStatus = env.storage().instance().get(&STATUS).unwrap();
        assert!(status == ContractStatus::Funded, "Contract must be in Funded state");

        let midcrop_paid: bool = env.storage().instance().get(&MIDCROP_PD).unwrap();
        assert!(!midcrop_paid, "Mid-crop milestone already claimed");

        let token_addr: Address = env.storage().instance().get(&TOKEN).unwrap();
        let total: i128         = env.storage().instance().get(&TOTAL).unwrap();

        // Mid-crop tranche: 20% of total
        let midcrop_amount = (total * 20) / 100;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &farmer, &midcrop_amount);

        env.storage().instance().set(&MIDCROP_PD, &true);
        env.storage().instance().set(&STATUS,     &ContractStatus::MidCrop);
    }

    /// Buyer confirms delivery of goods. Releases the final 40% to the farmer
    /// and marks the contract as Completed.
    ///
    /// # Arguments
    /// * `buyer` - Must match the buyer who funded the contract
    pub fn confirm_delivery(env: Env, buyer: Address) {
        buyer.require_auth();

        let stored_buyer: Address = env.storage().instance().get(&BUYER).unwrap();
        assert!(buyer == stored_buyer, "Caller is not the contract buyer");

        let status: ContractStatus = env.storage().instance().get(&STATUS).unwrap();
        assert!(status == ContractStatus::MidCrop, "Contract must be in MidCrop state");

        let delivery_paid: bool = env.storage().instance().get(&DELIVERY_PD).unwrap();
        assert!(!delivery_paid, "Delivery milestone already paid");

        let farmer: Address     = env.storage().instance().get(&FARMER).unwrap();
        let token_addr: Address = env.storage().instance().get(&TOKEN).unwrap();
        let total: i128         = env.storage().instance().get(&TOTAL).unwrap();

        // Final tranche: 40% of total
        let delivery_amount = (total * 40) / 100;

        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &farmer, &delivery_amount);

        env.storage().instance().set(&DELIVERY_PD, &true);
        env.storage().instance().set(&STATUS,      &ContractStatus::Completed);
    }

    /// Cancel the contract before it is funded. Returns no funds (nothing deposited yet).
    /// Only the farmer can cancel.
    pub fn cancel(env: Env, farmer: Address) {
        farmer.require_auth();

        let stored_farmer: Address = env.storage().instance().get(&FARMER).unwrap();
        assert!(farmer == stored_farmer, "Caller is not the contract farmer");

        let status: ContractStatus = env.storage().instance().get(&STATUS).unwrap();
        assert!(status == ContractStatus::Open, "Can only cancel an Open contract");

        env.storage().instance().set(&STATUS, &ContractStatus::Cancelled);
    }

    // ─── View Functions ─────────────────────────────────────────────────────

    /// Returns the current contract status
    pub fn get_status(env: Env) -> ContractStatus {
        env.storage().instance().get(&STATUS).unwrap()
    }

    /// Returns the total USDC amount committed
    pub fn get_total(env: Env) -> i128 {
        env.storage().instance().get(&TOTAL).unwrap()
    }

    /// Returns which milestones have been paid as (planting, midcrop, delivery)
    pub fn get_milestones(env: Env) -> (bool, bool, bool) {
        let p: bool = env.storage().instance().get(&PLANTING_PD).unwrap_or(false);
        let m: bool = env.storage().instance().get(&MIDCROP_PD).unwrap_or(false);
        let d: bool = env.storage().instance().get(&DELIVERY_PD).unwrap_or(false);
        (p, m, d)
    }

    /// Returns the farmer address
    pub fn get_farmer(env: Env) -> Address {
        env.storage().instance().get(&FARMER).unwrap()
    }
}

#[cfg(test)]
mod test;