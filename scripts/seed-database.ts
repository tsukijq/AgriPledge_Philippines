/**
 * AgriPledge Database Seed Script
 * Run with: npx tsx scripts/seed-database.ts
 * 
 * This seeds the MongoDB database with sample farmers and projects
 * that match the Soroban contract's data model.
 */

import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is required')
  console.log('Usage: MONGODB_URI="mongodb+srv://..." npx tsx scripts/seed-database.ts')
  process.exit(1)
}

// Sample Stellar testnet addresses (replace with real addresses for testing)
const SAMPLE_ADDRESSES = {
  farmer1: 'GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3UBSNA4TQJXK',
  farmer2: 'GCFXES6DSQ3DNWAYVPQ5MZE4MDMDJ2MVBQZ5QNMSPMPEMFKPWJF4FZEJ',
  farmer3: 'GDDGKFQMRMCAKOHH7STQJQ2QRXUQGAQPQQ5YTVZFZLZDNRB6GFKDHJ2E',
  investor1: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
  investor2: 'GDKJVBKMNYTJFJK6KVTTCHPQZGKNICBQPQPCZC6SLBQQ3QRXF3DXSHKF',
}

interface SeedFarmer {
  walletAddress: string
  name: string
  farmName: string
  location: {
    province: string
    municipality: string
    barangay: string
  }
  farmSize: number
  farmSizeUnit: 'hectares' | 'sqm'
  primaryCrops: string[]
  yearsExperience: number
  bio: string
  profileImage?: string
  isVerified: boolean
  createdAt: Date
}

interface SeedProject {
  farmerId: ObjectId
  title: string
  cropDescription: string
  description: string
  aiGeneratedStory?: string
  fundingGoal: number
  currentFunding: number
  buyerAddress?: string
  status: 'open' | 'funded' | 'midcrop' | 'completed' | 'cancelled'
  milestones: {
    plantingPaid: boolean
    midcropPaid: boolean
    deliveryPaid: boolean
  }
  images: string[]
  category: 'rice' | 'vegetables' | 'livestock' | 'fishery' | 'coconut' | 'fruits' | 'other'
  createdAt: Date
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('agripledge')
    
    // Clear existing data (optional - comment out to keep existing data)
    console.log('Clearing existing data...')
    await db.collection('farmers').deleteMany({})
    await db.collection('projects').deleteMany({})
    await db.collection('pledges').deleteMany({})
    
    // Create indexes
    console.log('Creating indexes...')
    await db.collection('farmers').createIndex({ walletAddress: 1 }, { unique: true })
    await db.collection('projects').createIndex({ farmerId: 1 })
    await db.collection('projects').createIndex({ status: 1 })
    await db.collection('pledges').createIndex({ investorAddress: 1 })
    await db.collection('pledges').createIndex({ projectId: 1 })
    
    // Seed farmers
    console.log('Seeding farmers...')
    const farmers: SeedFarmer[] = [
      {
        walletAddress: SAMPLE_ADDRESSES.farmer1,
        name: 'Juan dela Cruz',
        farmName: 'Dela Cruz Rice Farm',
        location: {
          province: 'Nueva Ecija',
          municipality: 'Cabanatuan City',
          barangay: 'Sumacab Este',
        },
        farmSize: 3.5,
        farmSizeUnit: 'hectares',
        primaryCrops: ['rice', 'vegetables'],
        yearsExperience: 15,
        bio: 'Third-generation rice farmer from the rice granary of the Philippines. Committed to sustainable farming practices and providing quality rice to Filipino families.',
        isVerified: true,
        createdAt: new Date('2024-01-15'),
      },
      {
        walletAddress: SAMPLE_ADDRESSES.farmer2,
        name: 'Maria Santos',
        farmName: 'Santos Organic Vegetables',
        location: {
          province: 'Benguet',
          municipality: 'La Trinidad',
          barangay: 'Balili',
        },
        farmSize: 1.2,
        farmSizeUnit: 'hectares',
        primaryCrops: ['vegetables', 'fruits'],
        yearsExperience: 8,
        bio: 'Organic vegetable farmer specializing in highland crops. Pioneer in chemical-free farming in our community, supplying fresh produce to Metro Manila markets.',
        isVerified: true,
        createdAt: new Date('2024-02-20'),
      },
      {
        walletAddress: SAMPLE_ADDRESSES.farmer3,
        name: 'Pedro Reyes',
        farmName: 'Reyes Coconut Plantation',
        location: {
          province: 'Quezon',
          municipality: 'Lucena City',
          barangay: 'Ibabang Dupay',
        },
        farmSize: 5,
        farmSizeUnit: 'hectares',
        primaryCrops: ['coconut', 'fruits'],
        yearsExperience: 20,
        bio: 'Managing our family coconut plantation since my father passed it to me. We produce virgin coconut oil, coconut sugar, and fresh coconuts for local markets.',
        isVerified: false,
        createdAt: new Date('2024-03-10'),
      },
    ]
    
    const farmerResult = await db.collection('farmers').insertMany(farmers)
    const farmerIds = Object.values(farmerResult.insertedIds)
    console.log(`Inserted ${farmerIds.length} farmers`)
    
    // Seed projects
    console.log('Seeding projects...')
    const projects: SeedProject[] = [
      // Juan's projects
      {
        farmerId: farmerIds[0],
        title: 'Jasmine Rice Harvest 2024',
        cropDescription: '2 Tons Premium Jasmine Rice',
        description: 'Fund our premium jasmine rice cultivation for the wet season. Our farm uses traditional methods combined with modern sustainable practices to produce aromatic, high-quality rice.',
        aiGeneratedStory: 'In the heart of Nueva Ecija, where golden rice paddies stretch to the horizon, Juan dela Cruz continues a legacy that spans three generations. His weathered hands, calloused from years of tending the fields, tell stories of dedication and resilience. This season, Juan dreams of expanding his jasmine rice production, bringing the fragrant grain that has sustained Filipino families for generations to more tables across the nation.',
        fundingGoal: 5000,
        currentFunding: 0,
        status: 'open',
        milestones: { plantingPaid: false, midcropPaid: false, deliveryPaid: false },
        images: [],
        category: 'rice',
        createdAt: new Date('2024-04-01'),
      },
      {
        farmerId: farmerIds[0],
        title: 'Organic Rice Project',
        cropDescription: '1.5 Tons Organic Brown Rice',
        description: 'Transitioning a portion of our farm to fully organic rice production. Support our journey to chemical-free farming.',
        fundingGoal: 3500,
        currentFunding: 3500,
        buyerAddress: SAMPLE_ADDRESSES.investor1,
        status: 'funded',
        milestones: { plantingPaid: true, midcropPaid: false, deliveryPaid: false },
        images: [],
        category: 'rice',
        createdAt: new Date('2024-03-15'),
      },
      // Maria's projects
      {
        farmerId: farmerIds[1],
        title: 'Highland Vegetable Bundle',
        cropDescription: '500kg Mixed Highland Vegetables',
        description: 'Support our organic highland vegetable farm in Benguet. Pre-order fresh lettuce, cabbage, carrots, and bell peppers grown in the cool mountain climate.',
        aiGeneratedStory: 'High in the misty mountains of Benguet, where clouds kiss the terraced slopes each morning, Maria Santos tends to her organic vegetable garden with the same care her grandmother once showed her. Each seedling is planted with hope, each harvest celebrated as a small victory against the challenges of highland farming.',
        fundingGoal: 2000,
        currentFunding: 2000,
        buyerAddress: SAMPLE_ADDRESSES.investor2,
        status: 'midcrop',
        milestones: { plantingPaid: true, midcropPaid: true, deliveryPaid: false },
        images: [],
        category: 'vegetables',
        createdAt: new Date('2024-02-28'),
      },
      {
        farmerId: farmerIds[1],
        title: 'Strawberry Season Pre-Order',
        cropDescription: '200kg Fresh Benguet Strawberries',
        description: 'Pre-order our famous Benguet strawberries! Grown organically in the cool highland climate for maximum sweetness.',
        fundingGoal: 1500,
        currentFunding: 1500,
        buyerAddress: SAMPLE_ADDRESSES.investor1,
        status: 'completed',
        milestones: { plantingPaid: true, midcropPaid: true, deliveryPaid: true },
        images: [],
        category: 'fruits',
        createdAt: new Date('2024-01-10'),
      },
      // Pedro's projects
      {
        farmerId: farmerIds[2],
        title: 'Virgin Coconut Oil Production',
        cropDescription: '100 Liters Virgin Coconut Oil',
        description: 'Fund our virgin coconut oil production. We use traditional cold-press methods to extract the purest, most nutritious coconut oil.',
        fundingGoal: 3000,
        currentFunding: 0,
        status: 'open',
        milestones: { plantingPaid: false, midcropPaid: false, deliveryPaid: false },
        images: [],
        category: 'coconut',
        createdAt: new Date('2024-04-05'),
      },
    ]
    
    const projectResult = await db.collection('projects').insertMany(projects)
    const projectIds = Object.values(projectResult.insertedIds)
    console.log(`Inserted ${projectIds.length} projects`)
    
    // Seed pledges for funded/completed projects
    console.log('Seeding pledges...')
    const pledges = [
      {
        projectId: projectIds[1], // Organic Rice Project
        investorAddress: SAMPLE_ADDRESSES.investor1,
        amount: 3500,
        stellarTxHash: 'sample_tx_hash_1',
        status: 'confirmed',
        createdAt: new Date('2024-03-16'),
      },
      {
        projectId: projectIds[2], // Highland Vegetable Bundle
        investorAddress: SAMPLE_ADDRESSES.investor2,
        amount: 2000,
        stellarTxHash: 'sample_tx_hash_2',
        status: 'confirmed',
        createdAt: new Date('2024-03-01'),
      },
      {
        projectId: projectIds[3], // Strawberry Season
        investorAddress: SAMPLE_ADDRESSES.investor1,
        amount: 1500,
        stellarTxHash: 'sample_tx_hash_3',
        status: 'confirmed',
        createdAt: new Date('2024-01-12'),
      },
    ]
    
    await db.collection('pledges').insertMany(pledges)
    console.log(`Inserted ${pledges.length} pledges`)
    
    // Print summary
    console.log('\n========================================')
    console.log('Database seeded successfully!')
    console.log('========================================')
    console.log('\nSample Wallet Addresses for Testing:')
    console.log('\nFarmers:')
    console.log(`  Juan dela Cruz: ${SAMPLE_ADDRESSES.farmer1}`)
    console.log(`  Maria Santos: ${SAMPLE_ADDRESSES.farmer2}`)
    console.log(`  Pedro Reyes: ${SAMPLE_ADDRESSES.farmer3}`)
    console.log('\nInvestors:')
    console.log(`  Investor 1: ${SAMPLE_ADDRESSES.investor1}`)
    console.log(`  Investor 2: ${SAMPLE_ADDRESSES.investor2}`)
    console.log('\nProject Summary:')
    console.log(`  Open projects: 2 (ready for funding)`)
    console.log(`  Funded projects: 1 (planting tranche released)`)
    console.log(`  Mid-crop projects: 1 (mid-crop tranche released)`)
    console.log(`  Completed projects: 1 (all tranches released)`)
    console.log('\n')
    
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

seedDatabase()
