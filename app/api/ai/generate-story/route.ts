import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createGroq } from '@ai-sdk/groq'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      farmerName, 
      farmName,
      location, 
      farmSize, 
      crops, 
      projectTitle,
      projectDescription,
      fundingGoal 
    } = body
    
    if (!farmerName || !location || !projectTitle) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const prompt = `You are a storyteller for AgriPledge Philippines, a platform connecting Filipino farmers with impact investors.

Generate an inspiring, authentic 200-250 word story about a Filipino farmer seeking funding. The story should:
1. Be written in second person, addressing the reader directly
2. Highlight the farmer's dedication, challenges overcome, and dreams
3. Emphasize the positive impact investor support will have on their family and community
4. Include authentic cultural elements specific to Philippine agriculture
5. Feel personal and emotionally engaging without being manipulative
6. Mention specific details about their farming practices

Farmer Details:
- Name: ${farmerName}
- Farm Name: ${farmName || 'Family Farm'}
- Location: ${location.municipality}, ${location.province}, Philippines
- Farm Size: ${farmSize || 'small'} hectares
- Main Crops: ${Array.isArray(crops) ? crops.join(', ') : crops || 'various crops'}
- Project: ${projectTitle}
- Project Goal: ${projectDescription || 'Improve farm productivity'}
- Funding Needed: ${fundingGoal || 'modest amount'} XLM

Write the story now, starting with an engaging hook about the farmer or their land:`

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt,
      maxTokens: 400,
      temperature: 0.7,
    })

    return NextResponse.json({ 
      success: true, 
      data: { story: text.trim() } 
    })
  } catch (error) {
    console.error('Error generating story:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate story' },
      { status: 500 }
    )
  }
}
