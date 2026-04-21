import { NextRequest, NextResponse } from 'next/server'
import { getProjectsCollection, getFarmersCollection, getPledgesCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const projectsCollection = await getProjectsCollection()
    const farmersCollection = await getFarmersCollection()
    const pledgesCollection = await getPledgesCollection()
    
    const project = await projectsCollection.findOne({ _id: new ObjectId(id) })
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Populate farmer
    const farmer = await farmersCollection.findOne({ 
      _id: new ObjectId(project.farmerId.toString()) 
    })
    
    // Get pledge count
    const pledgeCount = await pledgesCollection.countDocuments({ 
      projectId: new ObjectId(id),
      status: 'confirmed'
    })
    
    return NextResponse.json({ 
      success: true, 
      data: { ...project, farmer, pledgeCount } 
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const collection = await getProjectsCollection()
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
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
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    )
  }
}
