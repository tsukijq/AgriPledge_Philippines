import { NextRequest, NextResponse } from 'next/server'
import { getFarmersCollection } from '@/lib/mongodb'
import { Farmer } from '@/types'

export async function GET() {
  try {
    const collection = await getFarmersCollection()
    const farmers = await collection.find({}).toArray()
    
    return NextResponse.json({ success: true, data: farmers })
  } catch (error) {
    console.error('Error fetching farmers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch farmers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { stellarAddress, name, farmName, location, farmSize, crops } = body
    
    if (!stellarAddress || !name || !farmName || !location?.province || !location?.municipality) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const collection = await getFarmersCollection()
    
    // Check if farmer already exists
    const existing = await collection.findOne({ stellarAddress })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Farmer already registered with this wallet' },
        { status: 409 }
      )
    }

    const farmer: Omit<Farmer, '_id'> = {
      stellarAddress,
      name,
      farmName,
      location,
      farmSize: farmSize || 0,
      crops: crops || [],
      story: '',
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(farmer)
    
    return NextResponse.json({
      success: true,
      data: { ...farmer, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating farmer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create farmer' },
      { status: 500 }
    )
  }
}
