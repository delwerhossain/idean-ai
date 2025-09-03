import OpenAI from 'openai'

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_API_URL || 'https://openrouter.ai/api/v1'
})

export interface OnboardingData {
  clientName: string
  businessName: string
  website: string
  industry: string
  additionalInfo: string
  knowledgeBase?: string[] // Extracted text from PDFs
}

export interface AIGenerationOptions {
  data: OnboardingData
  documentType: 'business_plan' | 'executive_summary' | 'marketing_plan'
}

const MODEL = process.env.AI_MODEL || 'openai/gpt-4o-mini'

export const generateBusinessNames = async (clientName: string, industry?: string, additionalContext?: string): Promise<string[]> => {
  try {
    const prompt = `Generate 10 creative and professional business names for a ${industry ? `${industry} ` : ''}business owned by ${clientName}.

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Requirements:
- Professional and memorable
- Relevant to the industry
- Easy to pronounce and remember
- Available as domain names (avoid overly common words)
- Mix of different naming styles (descriptive, abstract, founder-based, etc.)

Return only the business names, one per line, no explanations or numbering.`

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a creative business naming expert. Generate professional, memorable business names that would work well as company names and domain names.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    }, {
      headers: {
        'HTTP-Referer': 'https://idean-ai.vercel.app',
        'X-Title': 'iDEAN AI Business Name Generator'
      }
    })

    const names = response.choices[0]?.message?.content?.trim().split('\n').filter(name => name.trim()) || []
    return names.slice(0, 10)
  } catch (error) {
    console.error('Error generating business names:', error)
    // Fallback names if API fails
    return [
      `${clientName} Enterprises`,
      `${industry} Solutions`,
      'InnovatePro',
      'NextGen Ventures',
      'Strategic Partners',
      'Elite Consulting'
    ]
  }
}

export const generateDocument = async ({ data, documentType }: AIGenerationOptions): Promise<string> => {
  try {
    const documentPrompts = {
      business_plan: `Create a comprehensive business plan for ${data.businessName} in the ${data.industry} industry.`,
      executive_summary: `Create an executive summary for ${data.businessName} in the ${data.industry} industry.`,
      marketing_plan: `Create a detailed marketing strategy and plan for ${data.businessName} in the ${data.industry} industry.`
    }

    const basePrompt = documentPrompts[documentType]
    
    const contextInfo = `
Business Information:
- Business Name: ${data.businessName}
- Owner: ${data.clientName}
- Industry: ${data.industry}
- Website: ${data.website || 'Not provided'}
- Additional Information: ${data.additionalInfo || 'None provided'}
${data.knowledgeBase?.length ? `- Knowledge Base: ${data.knowledgeBase.join('\n')}` : ''}
`

    const documentInstructions = getDocumentInstructions(documentType)

    const fullPrompt = `${basePrompt}

${contextInfo}

${documentInstructions}

IMPORTANT: 
- Use markdown formatting for headers and sections
- Make it professional and comprehensive
- Include specific details relevant to the ${data.industry} industry
- Tailor the content to ${data.businessName}'s unique situation
- Write in a professional, authoritative tone
- Ensure the content is actionable and valuable`

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a professional business consultant and document writer with expertise in creating high-quality business documents. You create comprehensive, well-structured documents that are tailored to each specific business and industry.`
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    }, {
      headers: {
        'HTTP-Referer': 'https://idean-ai.vercel.app',
        'X-Title': 'iDEAN AI Document Generator'
      }
    })

    return response.choices[0]?.message?.content || 'Error generating document content.'
  } catch (error) {
    console.error('Error generating document:', error)
    throw new Error('Failed to generate document. Please try again.')
  }
}

const getDocumentInstructions = (documentType: string): string => {
  switch (documentType) {
    case 'business_plan':
      return `
Create a comprehensive business plan with the following sections:
1. Executive Summary
2. Company Description
3. Market Analysis
4. Organization & Management
5. Products/Services
6. Marketing & Sales Strategy
7. Financial Projections
8. Funding Requirements (if applicable)
9. Implementation Timeline
10. Risk Analysis

Each section should be detailed and professional, providing valuable insights and actionable information.`

    case 'executive_summary':
      return `
Create a concise but comprehensive executive summary with:
1. Company Overview
2. Mission & Vision
3. Market Opportunity
4. Competitive Advantage
5. Products/Services Summary
6. Target Market
7. Revenue Model
8. Financial Highlights
9. Key Success Factors
10. Next Steps

Keep it engaging and focused on the key value propositions.`

    case 'marketing_plan':
      return `
Create a detailed marketing strategy with:
1. Market Research & Analysis
2. Target Audience Definition
3. Competitive Analysis
4. Marketing Objectives & Goals
5. Brand Positioning
6. Marketing Mix (4 Ps)
7. Digital Marketing Strategy
8. Traditional Marketing Channels
9. Budget Allocation
10. Success Metrics & KPIs
11. Implementation Timeline

Focus on actionable strategies and measurable outcomes.`

    default:
      return 'Create a professional business document with relevant sections and detailed content.'
  }
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  // This is a placeholder - in a real implementation, you'd use a PDF parsing library
  // For now, return a placeholder that indicates the file was processed
  return `[Content from ${file.name} would be extracted here. In production, use PDF parsing library like pdf-parse or similar.]`
}