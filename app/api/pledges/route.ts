import { NextRequest, NextResponse } from 'next/server'
import { getPledgesCollection, getProjectsCollection } from '@/lib/mongodb'
import { Pledge } from '@/types'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const investorAddress = searchParams.get('investorAddress')

    const collection = await getPledgesCollection()
    
    const query: Record<string, unknown> = {}
    if (projectId) query.projectId = new ObjectId(projectId)
    if (investorAddress) query.investorAddress = investorAddress

    const pledges = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json({ success: true, data: pledges })
  } catch (error) {
    console.error('Error fetching pledges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pledges' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { projectId, investorAddress, amount, stellarTxHash } = body
    
    if (!projectId || !investorAddress || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const pledgesCollection = await getPledgesCollection()
    const projectsCollection = await getProjectsCollection()
    
    // Create the pledge
    const pledge: Omit<Pledge, '_id'> = {
      projectId: new ObjectId(projectId),
      investorAddress,
      amount,
      stellarTxHash,
      status: stellarTxHash ? 'confirmed' : 'pending',
      createdAt: new Date(),
    }

    const result = await pledgesCollection.insertOne(pledge)
    
    // Update project funding if confirmed
    if (stellarTxHash) {
      await projectsCollection.updateOne(
        { _id: new ObjectId(projectId) },
        { 
          $inc: { currentFunding: amount },
          $set: { updatedAt: new Date() }
        }
      )
      
      // Check if project is now fully funded
      const project = await projectsCollection.findOne({ _id: new ObjectId(projectId) })
      if (project && project.currentFunding >= project.fundingGoal) {
        await projectsCollection.updateOne(
          { _id: new ObjectId(projectId) },
          { $set: { status: 'funded' } }
        )
      }
    }
    
    return NextResponse.json({
      success: true,
      data: { ...pledge, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating pledge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create pledge' },
      { status: 500 }
    )
  }
}
