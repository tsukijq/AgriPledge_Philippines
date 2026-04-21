import * as StellarSdk from '@stellar/stellar-sdk'

// Contract ID from your deployed Soroban contract
export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'CCGNHZ2ZUWRTQTFXSLFSTV7AGZWRWMF5EX6FA6MI6G45GBQXWUETRNWF'

// Network configuration
export const NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET'
export const NETWORK_PASSPHRASE = NETWORK === 'TESTNET' 
  ? StellarSdk.Networks.TESTNET 
  : StellarSdk.Networks.PUBLIC

// Soroban RPC server URL
export const SOROBAN_RPC_URL = NETWORK === 'TESTNET'
  ? 'https://soroban-testnet.stellar.org'
  : 'https://soroban.stellar.org'

// Horizon server URL
export const HORIZON_URL = NETWORK === 'TESTNET'
  ? 'https://horizon-testnet.stellar.org'
  : 'https://horizon.stellar.org'

// Create Soroban RPC server instance
export function getSorobanServer(): StellarSdk.SorobanRpc.Server {
  return new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL)
}

// Create Horizon server instance
export function getHorizonServer(): StellarSdk.Horizon.Server {
  return new StellarSdk.Horizon.Server(HORIZON_URL)
}

// Get contract instance
export function getContract(): StellarSdk.Contract {
  return new StellarSdk.Contract(CONTRACT_ID)
}

// Build and prepare a contract call transaction
export async function buildContractCall(
  sourcePublicKey: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<StellarSdk.Transaction> {
  const server = getSorobanServer()
  const contract = getContract()
  
  // Get the source account
  const sourceAccount = await server.getAccount(sourcePublicKey)
  
  // Build the operation
  const operation = contract.call(method, ...args)
  
  // Build the transaction
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build()
  
  // Simulate the transaction
  const simulated = await server.simulateTransaction(transaction)
  
  if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`)
  }
  
  // Prepare the transaction with the simulation result
  const prepared = StellarSdk.SorobanRpc.assembleTransaction(
    transaction,
    simulated
  ).build()
  
  return prepared
}

// Submit a signed transaction
export async function submitTransaction(
  signedXdr: string
): Promise<StellarSdk.SorobanRpc.Api.GetTransactionResponse> {
  const server = getSorobanServer()
  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    NETWORK_PASSPHRASE
  ) as StellarSdk.Transaction
  
  const response = await server.sendTransaction(transaction)
  
  if (response.status === 'ERROR') {
    throw new Error(`Transaction failed: ${response.errorResult}`)
  }
  
  // Poll for transaction completion
  let getResponse = await server.getTransaction(response.hash)
  
  while (getResponse.status === 'NOT_FOUND') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    getResponse = await server.getTransaction(response.hash)
  }
  
  if (getResponse.status === 'FAILED') {
    throw new Error('Transaction failed on chain')
  }
  
  return getResponse
}

// Convert XLM to stroops (1 XLM = 10^7 stroops)
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.floor(xlm * 10_000_000))
}

// Convert stroops to XLM
export function stroopsToXlm(stroops: bigint): number {
  return Number(stroops) / 10_000_000
}

// Format Stellar address for display
export function formatAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

// Validate Stellar address
export function isValidStellarAddress(address: string): boolean {
  try {
    StellarSdk.Keypair.fromPublicKey(address)
    return true
  } catch {
    return false
  }
}

// Get account balance
export async function getAccountBalance(publicKey: string): Promise<number> {
  const server = getHorizonServer()
  try {
    const account = await server.loadAccount(publicKey)
    const nativeBalance = account.balances.find(
      (b) => b.asset_type === 'native'
    )
    return nativeBalance ? parseFloat(nativeBalance.balance) : 0
  } catch {
    return 0
  }
}
