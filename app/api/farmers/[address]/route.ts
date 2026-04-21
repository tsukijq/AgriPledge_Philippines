import { NextRequest, NextResponse } from 'next/server'
import { getFarmersCollection } from '@/lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const collection = await getFarmersCollection()
    const farmer = await collection.findOne({ stellarAddress: address })
    
    if (!farmer) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: farmer })
  } catch (error) {
    console.error('Error fetching farmer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch farmer' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const body = await request.json()
    
    const collection = await getFarmersCollection()
    
    const result = await collection.findOneAndUpdate(
      { stellarAddress: address },
      { 
        $set: { 
          ...body,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    )
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error updating farmer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update farmer' },
      { status: 500 }
    )
  }
}
