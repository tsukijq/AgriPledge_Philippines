import * as StellarSdk from '@stellar/stellar-sdk'
import { buildContractCall, submitTransaction, NETWORK_PASSPHRASE, CONTRACT_ID } from './stellar'

// USDC token contract on Stellar testnet
const USDC_TOKEN_CONTRACT = process.env.NEXT_PUBLIC_USDC_TOKEN_CONTRACT || 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA'

// Helper to convert address to ScVal
function addressToScVal(address: string): StellarSdk.xdr.ScVal {
  return StellarSdk.Address.fromString(address).toScVal()
}

// Helper to convert number to ScVal i128
function numberToI128(value: bigint): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(value, { type: 'i128' })
}

// Helper to convert string to ScVal String
function stringToScVal(value: string): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(value, { type: 'string' })
}

// Convert USDC amount (6 decimals) to stroops
export function usdcToStroops(amount: number): bigint {
  return BigInt(Math.floor(amount * 1_000_000))
}

// Contract Status enum matching Rust contract
export enum ContractStatus {
  Open = 'Open',
  Funded = 'Funded',
  MidCrop = 'MidCrop',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

// Milestone structure matching contract's fixed percentages
export const MILESTONES = {
  planting: { name: 'Planting', percentage: 40 },
  midCrop: { name: 'Mid-Crop', percentage: 20 },
  delivery: { name: 'Delivery', percentage: 40 },
}

/**
 * Create a new harvest commitment on the blockchain
 * Farmer calls this to list their harvest for pre-funding
 * 
 * @param farmerAddress - Farmer's Stellar address
 * @param amountUsdc - Total USDC amount for the harvest
 * @param cropDescription - Description of the harvest (e.g., "1 Ton Jasmine Rice")
 */
export async function createCommitmentTx(
  farmerAddress: string,
  amountUsdc: number,
  cropDescription: string
): Promise<string> {
  const amountStroops = usdcToStroops(amountUsdc)
  
  const args = [
    addressToScVal(farmerAddress),
    addressToScVal(USDC_TOKEN_CONTRACT),
    numberToI128(amountStroops),
    stringToScVal(cropDescription),
  ]
  
  const tx = await buildContractCall(farmerAddress, 'create_commitment', args)
  return tx.toXDR()
}

/**
 * Fund a commitment (buyer/investor deposits USDC)
 * This immediately releases 40% planting tranche to farmer
 * 
 * @param buyerAddress - Buyer/investor's Stellar address
 */
export async function fundCommitmentTx(
  buyerAddress: string
): Promise<string> {
  const args = [
    addressToScVal(buyerAddress),
  ]
  
  const tx = await buildContractCall(buyerAddress, 'fund_commitment', args)
  return tx.toXDR()
}

/**
 * Submit mid-crop proof (farmer claims 20% tranche)
 * Contract must be in Funded state
 * 
 * @param farmerAddress - Farmer's Stellar address
 */
export async function submitMidcropProofTx(
  farmerAddress: string
): Promise<string> {
  const args = [
    addressToScVal(farmerAddress),
  ]
  
  const tx = await buildContractCall(farmerAddress, 'submit_midcrop_proof', args)
  return tx.toXDR()
}

/**
 * Confirm delivery (buyer releases final 40% to farmer)
 * Contract must be in MidCrop state
 * 
 * @param buyerAddress - Buyer's Stellar address
 */
export async function confirmDeliveryTx(
  buyerAddress: string
): Promise<string> {
  const args = [
    addressToScVal(buyerAddress),
  ]
  
  const tx = await buildContractCall(buyerAddress, 'confirm_delivery', args)
  return tx.toXDR()
}

/**
 * Cancel commitment (only before funding)
 * Only farmer can cancel
 * 
 * @param farmerAddress - Farmer's Stellar address
 */
export async function cancelCommitmentTx(
  farmerAddress: string
): Promise<string> {
  const args = [
    addressToScVal(farmerAddress),
  ]
  
  const tx = await buildContractCall(farmerAddress, 'cancel', args)
  return tx.toXDR()
}

/**
 * Get current contract status
 */
export async function getContractStatus(): Promise<ContractStatus> {
  const server = new StellarSdk.SorobanRpc.Server(
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'MAINNET'
      ? 'https://soroban-mainnet.stellar.org'
      : 'https://soroban-testnet.stellar.org'
  )
  
  const contract = new StellarSdk.Contract(CONTRACT_ID)
  
  try {
    const result = await server.simulateTransaction(
      new StellarSdk.TransactionBuilder(
        new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
        {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(contract.call('get_status'))
        .setTimeout(30)
        .build()
    )
    
    if ('result' in result && result.result) {
      const statusVal = StellarSdk.scValToNative(result.result.retval)
      return statusVal as ContractStatus
    }
  } catch (error) {
    console.error('Error getting contract status:', error)
  }
  
  return ContractStatus.Open
}

/**
 * Get milestone payment status
 * Returns [plantingPaid, midcropPaid, deliveryPaid]
 */
export async function getMilestones(): Promise<[boolean, boolean, boolean]> {
  const server = new StellarSdk.SorobanRpc.Server(
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'MAINNET'
      ? 'https://soroban-mainnet.stellar.org'
      : 'https://soroban-testnet.stellar.org'
  )
  
  const contract = new StellarSdk.Contract(CONTRACT_ID)
  
  try {
    const result = await server.simulateTransaction(
      new StellarSdk.TransactionBuilder(
        new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
        {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(contract.call('get_milestones'))
        .setTimeout(30)
        .build()
    )
    
    if ('result' in result && result.result) {
      const milestones = StellarSdk.scValToNative(result.result.retval)
      return milestones as [boolean, boolean, boolean]
    }
  } catch (error) {
    console.error('Error getting milestones:', error)
  }
  
  return [false, false, false]
}

/**
 * Get total commitment amount
 */
export async function getTotal(): Promise<bigint> {
  const server = new StellarSdk.SorobanRpc.Server(
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'MAINNET'
      ? 'https://soroban-mainnet.stellar.org'
      : 'https://soroban-testnet.stellar.org'
  )
  
  const contract = new StellarSdk.Contract(CONTRACT_ID)
  
  try {
    const result = await server.simulateTransaction(
      new StellarSdk.TransactionBuilder(
        new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'),
        {
          fee: '100',
          networkPassphrase: NETWORK_PASSPHRASE,
        }
      )
        .addOperation(contract.call('get_total'))
        .setTimeout(30)
        .build()
    )
    
    if ('result' in result && result.result) {
      return BigInt(StellarSdk.scValToNative(result.result.retval))
    }
  } catch (error) {
    console.error('Error getting total:', error)
  }
  
  return BigInt(0)
}

/**
 * Execute a signed transaction and return the result
 */
export async function executeSignedTransaction(signedXdr: string): Promise<{
  success: boolean
  hash?: string
  error?: string
}> {
  try {
    const result = await submitTransaction(signedXdr)
    
    // Extract transaction hash
    const tx = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      NETWORK_PASSPHRASE
    ) as StellarSdk.Transaction
    
    return {
      success: result.status === 'SUCCESS',
      hash: tx.hash().toString('hex'),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    }
  }
}
