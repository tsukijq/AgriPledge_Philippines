import { NextResponse } from 'next/server'
import { getProjectsCollection, getFarmersCollection, getPledgesCollection } from '@/lib/mongodb'
import { PlatformStats } from '@/types'

export async function GET() {
  try {
    const projectsCollection = await getProjectsCollection()
    const farmersCollection = await getFarmersCollection()
    const pledgesCollection = await getPledgesCollection()

    // Get total funding from confirmed pledges
    const pledgeAggregation = await pledgesCollection.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray()
    
    const totalFunded = pledgeAggregation[0]?.total || 0

    // Count farmers with at least one project
    const farmersWithProjects = await projectsCollection.distinct('farmerId')
    const farmersHelped = farmersWithProjects.length

    // Count active projects
    const activeProjects = await projectsCollection.countDocuments({
      status: { $in: ['active', 'funded'] }
    })

    // Count total pledges
    const totalPledges = await pledgesCollection.countDocuments({
      status: 'confirmed'
    })

    const stats: PlatformStats = {
      totalFunded,
      farmersHelped,
      activeProjects,
      totalPledges,
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Return demo stats if database is not connected
    const demoStats: PlatformStats = {
      totalFunded: 125000,
      farmersHelped: 48,
      activeProjects: 23,
      totalPledges: 312,
    }
    return NextResponse.json({ success: true, data: demoStats })
  }
}
