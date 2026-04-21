// Contract status enum matching Soroban contract
export enum ContractStatus {
  Open = "Open",
  Funded = "Funded",
  MidCrop = "MidCrop",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

// Harvest commitment data structure
export interface HarvestCommitment {
  id: string;
  contractId: string;
  farmer: string;
  buyer?: string;
  token: string;
  totalAmount: number;
  cropDescription: string;
  status: ContractStatus;
  milestones: {
    planting: boolean;
    midCrop: boolean;
    delivery: boolean;
  };
  createdAt: Date;
  fundedAt?: Date;
  completedAt?: Date;
}

// User role type
export type UserRole = "farmer" | "buyer" | null;

// Wallet state
export interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  network: "testnet" | "mainnet";
}

// Transaction result
export interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

// Milestone release info
export interface MilestoneInfo {
  name: string;
  percentage: number;
  amount: number;
  paid: boolean;
  description: string;
}

// Form data for creating commitment
export interface CreateCommitmentForm {
  cropDescription: string;
  totalAmount: string;
  tokenAddress: string;
}

// Mock commitment for demo purposes
export interface MockCommitment extends HarvestCommitment {
  farmerName: string;
  location: string;
  expectedHarvestDate: Date;
  imageUrl?: string;
}
