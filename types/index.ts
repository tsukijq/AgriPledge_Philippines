import { ObjectId } from 'mongodb'

// Farmer types
export interface Farmer {
  _id?: ObjectId
  stellarAddress: string
  name: string
  farmName: string
  location: {
    province: string
    municipality: string
  }
  farmSize: number // hectares
  crops: string[]
  story: string
  profileImage?: string
  documents: FarmerDocument[]
  createdAt: Date
  updatedAt: Date
}

export interface FarmerDocument {
  type: 'id' | 'land_title' | 'farm_registration' | 'other'
  url: string
  verified: boolean
}

// Project types - matching the Soroban contract model
// Contract has fixed 3 milestones: Planting (40%), Mid-Crop (20%), Delivery (40%)
export type ProjectStatus = 'open' | 'funded' | 'midcrop' | 'completed' | 'cancelled'
export type ProjectCategory = 'rice' | 'vegetables' | 'livestock' | 'fishery' | 'coconut' | 'fruits' | 'other'

// Fixed milestones matching contract (Planting 40%, Mid-Crop 20%, Delivery 40%)
export interface ContractMilestones {
  plantingPaid: boolean  // 40% released when buyer funds
  midcropPaid: boolean   // 20% released when farmer submits proof
  deliveryPaid: boolean  // 40% released when buyer confirms delivery
}

export interface Project {
  _id?: ObjectId
  farmerId: ObjectId | string
  contractAddress?: string // The deployed contract instance address
  title: string
  cropDescription: string  // Matches contract's crop_desc field
  description: string
  aiGeneratedStory?: string
  fundingGoal: number // in USDC
  currentFunding: number
  buyerAddress?: string // The investor/buyer who funded
  status: ProjectStatus
  milestones: ContractMilestones
  images: string[]
  category: ProjectCategory
  createdAt: Date
  updatedAt?: Date
  // Populated fields
  farmer?: Farmer
}

// Pledge types
export type PledgeStatus = 'pending' | 'confirmed' | 'refunded'

export interface Pledge {
  _id?: ObjectId
  projectId: ObjectId | string
  investorAddress: string
  amount: number // XLM
  stellarTxHash?: string
  status: PledgeStatus
  createdAt: Date
  // Populated fields
  project?: Project
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Wallet types
export interface WalletState {
  isConnected: boolean
  publicKey: string | null
  isConnecting: boolean
  error: string | null
}

// Stats types
export interface PlatformStats {
  totalFunded: number
  farmersHelped: number
  activeProjects: number
  totalPledges: number
}

// On-chain contract types (matching AgriPledge Soroban contract)
// Contract uses fixed 3-milestone model: Planting (40%), Mid-Crop (20%), Delivery (40%)
export interface OnChainCommitment {
  farmer: string
  buyer?: string
  token: string // USDC token contract
  total: bigint // Total USDC amount
  status: 'Open' | 'Funded' | 'MidCrop' | 'Completed' | 'Cancelled'
  milestones: {
    plantingPaid: boolean
    midcropPaid: boolean
    deliveryPaid: boolean
  }
}

// Form types
export interface FarmerRegistrationForm {
  name: string
  farmName: string
  province: string
  municipality: string
  farmSize: number
  crops: string[]
}

export interface ProjectCreationForm {
  title: string
  cropDescription: string // e.g., "1 Ton Jasmine Rice"
  description: string
  fundingGoal: number // USDC amount
  category: ProjectCategory
  // Note: Milestones are fixed by contract (Planting 40%, Mid-Crop 20%, Delivery 40%)
}

// Philippine provinces for dropdown
export const PHILIPPINE_PROVINCES = [
  'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique',
  'Apayao', 'Aurora', 'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet',
  'Biliran', 'Bohol', 'Bukidnon', 'Bulacan', 'Cagayan', 'Camarines Norte',
  'Camarines Sur', 'Camiguin', 'Capiz', 'Catanduanes', 'Cavite', 'Cebu',
  'Cotabato', 'Davao de Oro', 'Davao del Norte', 'Davao del Sur', 'Davao Occidental',
  'Davao Oriental', 'Dinagat Islands', 'Eastern Samar', 'Guimaras', 'Ifugao',
  'Ilocos Norte', 'Ilocos Sur', 'Iloilo', 'Isabela', 'Kalinga', 'La Union',
  'Laguna', 'Lanao del Norte', 'Lanao del Sur', 'Leyte', 'Maguindanao del Norte',
  'Maguindanao del Sur', 'Marinduque', 'Masbate', 'Misamis Occidental',
  'Misamis Oriental', 'Mountain Province', 'Negros Occidental', 'Negros Oriental',
  'Northern Samar', 'Nueva Ecija', 'Nueva Vizcaya', 'Occidental Mindoro',
  'Oriental Mindoro', 'Palawan', 'Pampanga', 'Pangasinan', 'Quezon', 'Quirino',
  'Rizal', 'Romblon', 'Samar', 'Sarangani', 'Siquijor', 'Sorsogon', 'South Cotabato',
  'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte', 'Surigao del Sur',
  'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte', 'Zamboanga del Sur',
  'Zamboanga Sibugay', 'Metro Manila'
] as const

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'rice', label: 'Rice Farming' },
  { value: 'vegetables', label: 'Vegetable Farming' },
  { value: 'livestock', label: 'Livestock' },
  { value: 'fishery', label: 'Fishery' },
  { value: 'coconut', label: 'Coconut Farming' },
  { value: 'fruits', label: 'Fruit Farming' },
  { value: 'other', label: 'Other' },
]
