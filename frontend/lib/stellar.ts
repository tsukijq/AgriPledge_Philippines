import * as StellarSdk from "@stellar/stellar-sdk";
import { isConnected, getPublicKey, signTransaction } from "@stellar/freighter-api";
import { DEPLOYED_CONTRACT_ID, USDC_TOKEN_ID } from "./store";

// Stellar network configuration
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const HORIZON_URL = "https://soroban-testnet.stellar.org";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";

// Contract explorer URL
export const getExplorerUrl = (contractId: string) =>
  `https://stellar.expert/explorer/testnet/contract/${contractId}`;

export const getTxExplorerUrl = (txHash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${txHash}`;

// Check if Freighter wallet is available
export async function checkFreighterAvailable(): Promise<boolean> {
  try {
    const connected = await isConnected();
    return connected.isConnected;
  } catch {
    return false;
  }
}

// Connect to Freighter wallet
export async function connectWallet(): Promise<string | null> {
  try {
    const available = await checkFreighterAvailable();
    if (!available) {
      throw new Error("Freighter wallet not found. Please install it.");
    }

    const response = await getPublicKey();
    if (response.error) {
      throw new Error(response.error);
    }
    return response.address;
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw error;
  }
}

// Create Soroban RPC server instance
export function getSorobanServer() {
  return new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL);
}

// Build and sign a Soroban contract call
export async function invokeContract(
  publicKey: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<StellarSdk.SorobanRpc.Api.GetTransactionResponse> {
  const server = getSorobanServer();
  const account = await server.getAccount(publicKey);

  const contract = new StellarSdk.Contract(DEPLOYED_CONTRACT_ID);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // Simulate the transaction
  const simulated = await server.simulateTransaction(transaction);

  if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation failed: ${simulated.error}`);
  }

  // Prepare the transaction with resource estimates
  const prepared = StellarSdk.SorobanRpc.assembleTransaction(
    transaction,
    simulated
  ).build();

  // Sign with Freighter
  const signResult = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (signResult.error) {
    throw new Error(`Signing failed: ${signResult.error}`);
  }

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    NETWORK_PASSPHRASE
  );

  // Submit the transaction
  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    throw new Error("Transaction submission failed");
  }

  // Wait for confirmation
  let response = await server.getTransaction(sendResponse.hash);
  while (response.status === "NOT_FOUND") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    response = await server.getTransaction(sendResponse.hash);
  }

  return response;
}

// Helper to convert number to i128 ScVal
export function toI128(value: number): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(BigInt(value), { type: "i128" });
}

// Helper to convert string to ScVal
export function toScString(value: string): StellarSdk.xdr.ScVal {
  return StellarSdk.nativeToScVal(value, { type: "string" });
}

// Helper to convert address to ScVal
export function toAddress(value: string): StellarSdk.xdr.ScVal {
  return new StellarSdk.Address(value).toScVal();
}

// Contract-specific functions

export async function createCommitment(
  farmerPublicKey: string,
  tokenAddress: string,
  amount: number,
  cropDescription: string
) {
  const args = [
    toAddress(farmerPublicKey),
    toAddress(tokenAddress || USDC_TOKEN_ID),
    toI128(amount * 10_000_000), // Convert to stroops (7 decimals for USDC)
    toScString(cropDescription),
  ];

  return invokeContract(farmerPublicKey, "create_commitment", args);
}

export async function fundCommitment(buyerPublicKey: string) {
  const args = [toAddress(buyerPublicKey)];
  return invokeContract(buyerPublicKey, "fund_commitment", args);
}

export async function submitMidcropProof(farmerPublicKey: string) {
  const args = [toAddress(farmerPublicKey)];
  return invokeContract(farmerPublicKey, "submit_midcrop_proof", args);
}

export async function confirmDelivery(buyerPublicKey: string) {
  const args = [toAddress(buyerPublicKey)];
  return invokeContract(buyerPublicKey, "confirm_delivery", args);
}

export async function cancelCommitment(farmerPublicKey: string) {
  const args = [toAddress(farmerPublicKey)];
  return invokeContract(farmerPublicKey, "cancel", args);
}

// Read-only functions (no wallet needed)

export async function getContractStatus(): Promise<string> {
  const server = getSorobanServer();
  const contract = new StellarSdk.Contract(DEPLOYED_CONTRACT_ID);

  try {
    const result = await server.simulateTransaction(
      new StellarSdk.TransactionBuilder(
        new StellarSdk.Account(
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
          "0"
        ),
        { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
      )
        .addOperation(contract.call("get_status"))
        .setTimeout(30)
        .build()
    );

    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(result) && result.result) {
      return StellarSdk.scValToNative(result.result.retval);
    }
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

export async function getContractMilestones(): Promise<{
  planting: boolean;
  midCrop: boolean;
  delivery: boolean;
}> {
  const server = getSorobanServer();
  const contract = new StellarSdk.Contract(DEPLOYED_CONTRACT_ID);

  try {
    const result = await server.simulateTransaction(
      new StellarSdk.TransactionBuilder(
        new StellarSdk.Account(
          "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
          "0"
        ),
        { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
      )
        .addOperation(contract.call("get_milestones"))
        .setTimeout(30)
        .build()
    );

    if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(result) && result.result) {
      const [planting, midCrop, delivery] = StellarSdk.scValToNative(
        result.result.retval
      ) as [boolean, boolean, boolean];
      return { planting, midCrop, delivery };
    }
    return { planting: false, midCrop: false, delivery: false };
  } catch {
    return { planting: false, midCrop: false, delivery: false };
  }
}

// Format address for display
export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Format USDC amount
export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
