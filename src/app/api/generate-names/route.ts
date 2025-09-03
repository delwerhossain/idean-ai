import { NextRequest, NextResponse } from 'next/server'
import { generateBusinessNames } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const { clientName, industry, additionalContext } = await request.json()

    if (!clientName) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      )
    }

    const names = await generateBusinessNames(clientName, industry, additionalContext)
    
    return NextResponse.json({ names })
  } catch (error) {
    console.error('Error in generate-names API:', error)
    return NextResponse.json(
      { error: 'Failed to generate business names' },
      { status: 500 }
    )
  }
}