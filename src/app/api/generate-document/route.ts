import { NextRequest, NextResponse } from 'next/server'
import { generateDocument, OnboardingData } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const { data, documentType } = await request.json()

    if (!data || !documentType) {
      return NextResponse.json(
        { error: 'Data and document type are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!data.clientName || !data.businessName || !data.industry) {
      return NextResponse.json(
        { error: 'Client name, business name, and industry are required' },
        { status: 400 }
      )
    }

    const content = await generateDocument({ data, documentType })
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error in generate-document API:', error)
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    )
  }
}