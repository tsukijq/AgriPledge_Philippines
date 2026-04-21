import { NextRequest, NextResponse } from 'next/server'
import { getProjectsCollection, getFarmersCollection } from '@/lib/mongodb'
import { Project, ProjectStatus, ProjectCategory } from '@/types'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ProjectStatus | null
    const category = searchParams.get('category') as ProjectCategory | null
    const farmerId = searchParams.get('farmerId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const featured = searchParams.get('featured') === 'true'

    const collection = await getProjectsCollection()
    const farmersCollection = await getFarmersCollection()
    
    // Build query
    const query: Record<string, unknown> = {}
    if (status) query.status = status
    if (category) query.category = category
    if (farmerId) query.farmerId = new ObjectId(farmerId)
    if (featured) query.status = 'active'

    // Fetch projects
    let projectsCursor = collection.find(query)
    
    if (featured) {
      // For featured, sort by funding progress percentage
      projectsCursor = projectsCursor.sort({ currentFunding: -1 })
    } else {
      projectsCursor = projectsCursor.sort({ createdAt: -1 })
    }
    
    const projects = await projectsCursor.limit(limit).toArray()
    
    // Populate farmer data
    const populatedProjects = await Promise.all(
      projects.map(async (project) => {
        const farmer = await farmersCollection.findOne({ 
          _id: new ObjectId(project.farmerId.toString()) 
        })
        return { ...project, farmer }
      })
    )
    
    return NextResponse.json({ success: true, data: populatedProjects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      farmerId, 
      title, 
      description, 
      fundingGoal, 
      category,
    } = body
    
    if (!farmerId || !title || !description || !fundingGoal || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const collection = await getProjectsCollection()
    
    // Project structure aligned with AgriPledge contract
    // Contract has fixed 3 milestones: Planting (40%), Mid-Crop (20%), Delivery (40%)
    const project: Omit<Project, '_id'> = {
      farmerId: new ObjectId(farmerId),
      title,
      cropDescription: body.cropDescription || title, // For contract's crop_desc field
      description,
      aiGeneratedStory: body.aiGeneratedStory,
      fundingGoal, // In USDC
      currentFunding: 0,
      status: 'open', // Matches contract's Open status
      milestones: {
        plantingPaid: false,
        midcropPaid: false,
        deliveryPaid: false,
      },
      images: body.images || [],
      category,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(project)
    
    return NextResponse.json({
      success: true,
      data: { ...project, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
