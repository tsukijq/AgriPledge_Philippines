# 🌾 AgriPledge PH

> Interest-free harvest pre-financing for Filipino smallholder farmers, powered by Stellar and Soroban.

---

## Problem

Mang Roberto, a rice farmer in Central Luzon, lacks the ₱50,000 needed for seeds and fertilizer before planting season. His only option is a **"5-6" informal loan** from a trader-lender — borrow ₱5, repay ₱6 in 30 days (20% monthly interest) — with a side condition: sell the entire harvest at **30% below market value**. There is no bank that will touch him, no co-op with capital to spare, and no way to prove his future harvest as collateral.

---

## Solution

AgriPledge PH lets a farmer tokenize a **Harvest Commitment** on Stellar. A buyer (restaurant, food co-op, hotel) pre-purchases that commitment using USDC. The funds are locked in a **Soroban escrow contract** and released to the farmer in three milestones:

| Milestone      | Trigger                          | USDC Released |
|----------------|----------------------------------|---------------|
| Planting       | Buyer deposits → contract locks  | 40%           |
| Mid-Crop       | Farmer submits geo-tagged proof  | 20%           |
| Delivery       | Buyer confirms receipt           | 40%           |

Zero interest. Zero middlemen. Sub-cent transaction fees. Funds arrive in seconds.

---

## Vision & Purpose

AgriPledge PH is not a charity product. It is a **market-making tool** that connects capital-starved farmers directly to buyers who want guaranteed supply at below-wholesale prices. The Soroban contract is the trust layer that makes strangers transact: the buyer knows funds only release on proof; the farmer knows funds are locked and can't be clawed back arbitrarily.

Long-term: every Harvest Commitment Token (HCT) issued on-chain becomes a tradable instrument. Buyers can sell forward commitments on Stellar's built-in DEX. Co-ops can pool multiple commitments into a single funding round. NGOs can sponsor milestone releases. The escrow contract is the composable primitive that unlocks all of it.

---

## Stellar Features Used

- **Soroban Smart Contracts** — milestone escrow logic, authorization, and state management
- **USDC on Stellar** — stable-value currency; no XLM volatility exposure for farmers
- **Trustlines** — only wallets holding the "CertifiedFarmer" trustline can create commitments
- **Custom Asset (HarvestToken)** — each commitment mints one HCT to the buyer as proof of purchase
- **XLM** — used for transaction fees only (~$0.00001 per operation)

---

## Timeline

```
Day 1 — Wallet setup, USDC trustlines, UI scaffold
Day 2 — Soroban contract: write, test, deploy to Testnet
Day 3 — HarvestToken minting + Trustline gating
Day 4 — Full MVP flow wired end-to-end, Explorer links
Day 5 — Polish, GCash anchor mock, demo prep
```

---

## Prerequisites

| Tool          | Required Version  | Install                                      |
|---------------|-------------------|----------------------------------------------|
| Rust          | 1.74+             | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Soroban CLI   | 20.x              | `cargo install --locked soroban-cli`         |
| Wasm target   | —                 | `rustup target add wasm32-unknown-unknown`   |

---

## Build

```bash
# Clone the repo
git clone https://github.com/your-org/agripledge-ph
cd agripledge-ph

# Build the Wasm binary (outputs to target/wasm32-unknown-unknown/release/)
soroban contract build
```

---

## Test

```bash
# Run all 5 unit tests
cargo test

# Run with output (useful for debugging)
cargo test -- --nocapture
```

Expected output:

```
running 5 tests
test tests::test_full_mvp_flow           ... ok
test tests::test_unauthorized_fund_panics ... ok
test tests::test_state_after_funding     ... ok
test tests::test_double_midcrop_claim_panics ... ok
test tests::test_cancel_funded_contract_panics ... ok

test result: ok. 5 passed; 0 failed
```

---

## Deploy to Testnet

```bash
# Configure Testnet identity (one-time setup)
soroban keys generate --global alice --network testnet

# Fund the account via Friendbot
soroban keys fund alice --network testnet

# Deploy the compiled contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/agripledge_ph.wasm \
  --source alice \
  --network testnet
```

This returns a **Contract ID** — save it, you'll need it for every invocation.

---

## Sample CLI Invocations

Replace `<CONTRACT_ID>`, `<FARMER_ADDRESS>`, `<BUYER_ADDRESS>`, and `<USDC_TOKEN_ID>` with real values from your Testnet setup.

### Step 1 — Farmer creates a commitment

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- create_commitment \
  --farmer <FARMER_ADDRESS> \
  --token <USDC_TOKEN_ID> \
  --amount 10000000000 \
  --crop_desc "1 Ton Jasmine Rice"
```

### Step 2 — Buyer funds the commitment (releases 40% to farmer)

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source buyer_keypair \
  --network testnet \
  -- fund_commitment \
  --buyer <BUYER_ADDRESS>
```

### Step 3 — Farmer submits mid-crop proof

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- submit_midcrop_proof \
  --farmer <FARMER_ADDRESS>
```

### Step 4 — Buyer confirms delivery (releases final 40%)

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source buyer_keypair \
  --network testnet \
  -- confirm_delivery \
  --buyer <BUYER_ADDRESS>
```

### Check contract status

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- get_status
```

### Check milestone flags

```bash
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- get_milestones
```

---

## Project Structure

```
agripledge-ph/
├── cargo.toml          # Package config + Wasm release profile
├── README.md           # This file
└── src/
    ├── lib.rs          # Soroban contract: storage keys, status enum, all functions
    └── test.rs         # 5 unit tests (happy path, edge cases, state verification)
```

--- 

## Smart Contract

Deployed on Stellar testnet:
```
CAIJY7YRYSZX3JTDMRF35A4QPTRHSMAL3P3GDFKQ5QOBIOTEZSRDI3WW
```

Explorer: https://stellar.expert/explorer/testnet/contract/CAIJY7YRYSZX3JTDMRF35A4QPTRHSMAL3P3GDFKQ5QOBIOTEZSRDI3WW

---

## License

MIT — free to use, fork, and deploy. If you build something real with this, tag us.

