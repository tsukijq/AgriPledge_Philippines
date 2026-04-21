import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole, MockCommitment, ContractStatus } from "./types";

// Deployed contract ID on Stellar testnet
export const DEPLOYED_CONTRACT_ID =
  "CAIJY7YRYSZX3JTDMRF35A4QPTRHSMAL3P3GDFKQ5QOBIOTEZSRDI3WW";

// USDC token contract on Stellar testnet (for demo)
export const USDC_TOKEN_ID =
  "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

interface AppState {
  // Wallet
  publicKey: string | null;
  isConnected: boolean;
  network: "testnet" | "mainnet";
  role: UserRole;

  // Commitments (demo data)
  commitments: MockCommitment[];

  // Actions
  setPublicKey: (key: string | null) => void;
  setConnected: (connected: boolean) => void;
  setNetwork: (network: "testnet" | "mainnet") => void;
  setRole: (role: UserRole) => void;
  disconnect: () => void;

  // Commitment actions
  addCommitment: (commitment: MockCommitment) => void;
  updateCommitmentStatus: (id: string, status: ContractStatus) => void;
  updateMilestone: (
    id: string,
    milestone: "planting" | "midCrop" | "delivery"
  ) => void;
  fundCommitment: (id: string, buyer: string) => void;
}

// Sample demo data
const sampleCommitments: MockCommitment[] = [
  {
    id: "1",
    contractId: DEPLOYED_CONTRACT_ID,
    farmer: "GDRQB6WXR6QXRH5YMJLXSIXHCQWXR6QXRH5YMJLX",
    token: USDC_TOKEN_ID,
    totalAmount: 50000,
    cropDescription: "1 Ton Jasmine Rice - Premium Grade",
    status: "Open" as ContractStatus,
    milestones: { planting: false, midCrop: false, delivery: false },
    createdAt: new Date("2026-04-15"),
    farmerName: "Mang Roberto",
    location: "Central Luzon, Philippines",
    expectedHarvestDate: new Date("2026-08-15"),
  },
  {
    id: "2",
    contractId: DEPLOYED_CONTRACT_ID,
    farmer: "GBXRQ6WXR6QXRH5YMJLXSIXHCQWXR6QXRH5YMJLX",
    token: USDC_TOKEN_ID,
    totalAmount: 35000,
    cropDescription: "500kg Organic Mango - Carabao Variety",
    status: "Funded" as ContractStatus,
    milestones: { planting: true, midCrop: false, delivery: false },
    createdAt: new Date("2026-04-10"),
    fundedAt: new Date("2026-04-12"),
    farmerName: "Aling Maria",
    location: "Zambales, Philippines",
    expectedHarvestDate: new Date("2026-07-20"),
    buyer: "GCYXQ6WXR6QXRH5YMJLXSIXHCQWXR6QXRH5YMJLX",
  },
  {
    id: "3",
    contractId: DEPLOYED_CONTRACT_ID,
    farmer: "GCTRQ6WXR6QXRH5YMJLXSIXHCQWXR6QXRH5YMJLX",
    token: USDC_TOKEN_ID,
    totalAmount: 75000,
    cropDescription: "2 Tons Corn - Yellow Dent",
    status: "MidCrop" as ContractStatus,
    milestones: { planting: true, midCrop: true, delivery: false },
    createdAt: new Date("2026-03-20"),
    fundedAt: new Date("2026-03-22"),
    farmerName: "Tatay Pedro",
    location: "Isabela, Philippines",
    expectedHarvestDate: new Date("2026-06-30"),
    buyer: "GDYXQ6WXR6QXRH5YMJLXSIXHCQWXR6QXRH5YMJLX",
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      publicKey: null,
      isConnected: false,
      network: "testnet",
      role: null,
      commitments: sampleCommitments,

      // Wallet actions
      setPublicKey: (key) => set({ publicKey: key }),
      setConnected: (connected) => set({ isConnected: connected }),
      setNetwork: (network) => set({ network }),
      setRole: (role) => set({ role }),
      disconnect: () =>
        set({
          publicKey: null,
          isConnected: false,
          role: null,
        }),

      // Commitment actions
      addCommitment: (commitment) =>
        set((state) => ({
          commitments: [...state.commitments, commitment],
        })),

      updateCommitmentStatus: (id, status) =>
        set((state) => ({
          commitments: state.commitments.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        })),

      updateMilestone: (id, milestone) =>
        set((state) => ({
          commitments: state.commitments.map((c) =>
            c.id === id
              ? {
                  ...c,
                  milestones: { ...c.milestones, [milestone]: true },
                  status:
                    milestone === "delivery"
                      ? ("Completed" as ContractStatus)
                      : milestone === "midCrop"
                        ? ("MidCrop" as ContractStatus)
                        : c.status,
                }
              : c
          ),
        })),

      fundCommitment: (id, buyer) =>
        set((state) => ({
          commitments: state.commitments.map((c) =>
            c.id === id
              ? {
                  ...c,
                  buyer,
                  status: "Funded" as ContractStatus,
                  fundedAt: new Date(),
                  milestones: { ...c.milestones, planting: true },
                }
              : c
          ),
        })),
    }),
    {
      name: "agripledge-storage",
      partialize: (state) => ({
        publicKey: state.publicKey,
        isConnected: state.isConnected,
        network: state.network,
        role: state.role,
      }),
    }
  )
);
