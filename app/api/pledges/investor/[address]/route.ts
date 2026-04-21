import { NextRequest, NextResponse } from 'next/server'
import { getPledgesCollection, getProjectsCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    
    const pledgesCollection = await getPledgesCollection()
    const projectsCollection = await getProjectsCollection()
    
    const pledges = await pledgesCollection
      .find({ investorAddress: address })
      .sort({ createdAt: -1 })
      .toArray()
    
    // Populate project data for each pledge
    const populatedPledges = await Promise.all(
      pledges.map(async (pledge) => {
        const project = await projectsCollection.findOne({ 
          _id: new ObjectId(pledge.projectId.toString()) 
        })
        return { ...pledge, project }
      })
    )
    
    // Calculate stats
    const totalInvested = pledges
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const activeProjects = new Set(
      pledges
        .filter(p => p.status === 'confirmed')
        .map(p => p.projectId.toString())
    ).size
    
    return NextResponse.json({ 
      success: true, 
      data: {
        pledges: populatedPledges,
        stats: {
          totalInvested,
          activeProjects,
          totalPledges: pledges.length,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching investor pledges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pledges' },
      { status: 500 }
    )
  }
}
