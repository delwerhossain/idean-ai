import OpenAI from 'openai'

// AI Provider Types
export type AIProvider = 'openai' | 'openrouter'
export type Language = 'en' | 'bn'

// Initialize AI clients lazily to avoid build-time errors
let openaiClient: OpenAI | null = null
let openrouterClient: OpenAI | null = null

const getOpenAIClient = () => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
    
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://idean-ai.vercel.app',
        'X-Title': 'iDEAN AI'
      }
    })
  }
  return openaiClient
}

const getOpenRouterClient = () => {
  if (!openrouterClient) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required')
    }
    
    openrouterClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://idean-ai.vercel.app',
        'X-Title': 'iDEAN AI'
      }
    })
  }
  return openrouterClient
}

const getAIClient = (provider: AIProvider = 'openai') => {
  return provider === 'openai' ? getOpenAIClient() : getOpenRouterClient()
}

export interface OnboardingData {
  clientName: string
  businessName: string
  website: string
  industry: string
  additionalInfo: string
  knowledgeBase?: string[] // Extracted text from PDFs
  businessOverview?: string // AI-generated 500-word overview
  language?: Language
}

export interface AIGenerationOptions {
  data: OnboardingData
  documentType: 'business_plan' | 'executive_summary' | 'marketing_plan'
  language?: Language
  provider?: AIProvider
}

// iDEAN AI Tool Types
export type StrategyTool = 
  | 'niche-finder'
  | 'core-strategy-builder'
  | 'blue-ocean-navigator'
  | 'category-designer'
  | 'customer-value-journey'
  | 'customer-value-ladder'
  | 'strategic-brand-planner'
  | 'storybrand-builder'

export type ExecutionTool =
  | 'marketing-funnel-builder'
  | 'godfather-offer-builder'
  | 'nuclear-content-planner'
  | 'content-calendar'
  | 'neuro-copywriting'
  | 'magnetic-storytelling'
  | 'campaign-planner'
  | 'festival-campaign-planner'
  | 'growth-hacking-ideas'
  | 'overdemand-planner'

export type ContentTool =
  | 'facebook-ad-builder'
  | 'organic-post-generator'
  | 'video-script-creator'
  | 'email-copy-generator'

export type ToolType = StrategyTool | ExecutionTool | ContentTool

export interface ToolGenerationOptions {
  tool: ToolType
  inputs: Record<string, unknown>
  businessContext: OnboardingData
  language?: Language
  provider?: AIProvider
}

export interface FacebookAdContent {
  hook: string
  body: string
  cta: string
  caption: string
  script?: string
}

export interface StructuredContent {
  title: string
  sections: Array<{
    heading: string
    content: string
  }>
  metadata?: Record<string, unknown>
}

const MODELS = {
  openai: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  openrouter: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
}

const getModel = (provider: AIProvider = 'openai') => {
  return MODELS[provider]
}

// Enhanced AI calling function with fallback support
const callAIWithFallback = async (
  provider: AIProvider = 'openai',
  params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
  maxRetries: number = 2
): Promise<OpenAI.Chat.Completions.ChatCompletion> => {
  const providers: AIProvider[] = provider === 'openai' ? ['openai', 'openrouter'] : ['openrouter', 'openai']
  
  for (let i = 0; i < providers.length && i < maxRetries; i++) {
    try {
      const client = getAIClient(providers[i])
      const modelToUse = getModel(providers[i])
      
      return await client.chat.completions.create({
        ...params,
        model: modelToUse,
        stream: false
      }) as OpenAI.Chat.Completions.ChatCompletion
    } catch (error) {
      console.error(`Error with provider ${providers[i]}:`, error)
      if (i === providers.length - 1) {
        throw error
      }
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('All AI providers failed')
}

export const generateBusinessNames = async (
  clientName: string, 
  industry?: string, 
  additionalContext?: string,
  language: Language = 'en',
  provider: AIProvider = 'openai'
): Promise<string[]> => {
  try {
    const prompt = language === 'bn' 
      ? `${clientName} এর জন্য ${industry ? `${industry} ` : ''}ব্যবসার ১০টি সৃজনশীল এবং পেশাদার নাম তৈরি করুন।

${additionalContext ? `অতিরিক্ত তথ্য: ${additionalContext}` : ''}

প্রয়োজনীয়তা:
- পেশাদার এবং স্মরণযোগ্য
- শিল্পের সাথে প্রাসঙ্গিক
- উচ্চারণে সহজ এবং মনে রাখার মতো
- ডোমেইন নেম হিসেবে উপলব্ধ (খুব সাধারণ শব্দ এড়িয়ে চলুন)
- বিভিন্ন নামকরণ শৈলীর মিশ্রণ

শুধুমাত্র ব্যবসার নামগুলো দিন, প্রতি লাইনে একটি, কোনো ব্যাখ্যা বা নম্বর ছাড়াই।`
      : `Generate 10 creative and professional business names for a ${industry ? `${industry} ` : ''}business owned by ${clientName}.

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Requirements:
- Professional and memorable
- Relevant to the industry
- Easy to pronounce and remember
- Available as domain names (avoid overly common words)
- Mix of different naming styles (descriptive, abstract, founder-based, etc.)

Return only the business names, one per line, no explanations or numbering.`

    const response = await callAIWithFallback(provider, {
      model: getModel(provider),
      messages: [
        {
          role: 'system',
          content: language === 'bn' 
            ? 'আপনি একজন সৃজনশীল ব্যবসায়িক নামকরণ বিশেষজ্ঞ। পেশাদার, স্মরণযোগ্য ব্যবসার নাম তৈরি করুন যা কোম্পানির নাম এবং ডোমেইন নেম হিসেবে ভালো কাজ করবে।'
            : 'You are a creative business naming expert. Generate professional, memorable business names that would work well as company names and domain names.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    })

    const names = response.choices[0]?.message?.content?.trim().split('\n').filter((name: string) => name.trim()) || []
    return names.slice(0, 10)
  } catch (error) {
    console.error('Error generating business names:', error)
    // Fallback names if API fails
    return [
      `${clientName} Enterprises`,
      `${industry || 'Business'} Solutions`,
      'InnovatePro',
      'NextGen Ventures',
      'Strategic Partners',
      'Elite Consulting'
    ]
  }
}

export const generateDocument = async ({ 
  data, 
  documentType, 
  language = 'en', 
  provider = 'openai' 
}: AIGenerationOptions): Promise<string> => {
  try {
    const documentPrompts = language === 'bn' ? {
      business_plan: `${data.businessName} এর জন্য ${data.industry} শিল্পে একটি বিস্তৃত ব্যবসায়িক পরিকল্পনা তৈরি করুন।`,
      executive_summary: `${data.businessName} এর জন্য ${data.industry} শিল্পে একটি নির্বাহী সারসংক্ষেপ তৈরি করুন।`,
      marketing_plan: `${data.businessName} এর জন্য ${data.industry} শিল্পে একটি বিস্তারিত বিপণন কৌশল এবং পরিকল্পনা তৈরি করুন।`
    } : {
      business_plan: `Create a comprehensive business plan for ${data.businessName} in the ${data.industry} industry.`,
      executive_summary: `Create an executive summary for ${data.businessName} in the ${data.industry} industry.`,
      marketing_plan: `Create a detailed marketing strategy and plan for ${data.businessName} in the ${data.industry} industry.`
    }

    const basePrompt = documentPrompts[documentType]
    
    const contextInfo = language === 'bn' ? `
ব্যবসায়িক তথ্য:
- ব্যবসার নাম: ${data.businessName}
- মালিক: ${data.clientName}
- শিল্প: ${data.industry}
- ওয়েবসাইট: ${data.website || 'প্রদান করা হয়নি'}
- অতিরিক্ত তথ্য: ${data.additionalInfo || 'কোনো অতিরিক্ত তথ্য নেই'}
${data.knowledgeBase?.length ? `- জ্ঞান ভান্ডার: ${data.knowledgeBase.join('\n')}` : ''}
${data.businessOverview ? `- ব্যবসায়িক সারসংক্ষেপ: ${data.businessOverview}` : ''}
` : `
Business Information:
- Business Name: ${data.businessName}
- Owner: ${data.clientName}
- Industry: ${data.industry}
- Website: ${data.website || 'Not provided'}
- Additional Information: ${data.additionalInfo || 'None provided'}
${data.knowledgeBase?.length ? `- Knowledge Base: ${data.knowledgeBase.join('\n')}` : ''}
${data.businessOverview ? `- Business Overview: ${data.businessOverview}` : ''}
`

    const documentInstructions = getDocumentInstructions(documentType, language)

    const fullPrompt = `${basePrompt}

${contextInfo}

${documentInstructions}

${language === 'bn' ? `
গুরুত্বপূর্ণ:
- শিরোনাম এবং বিভাগের জন্য মার্কডাউন ফরম্যাটিং ব্যবহার করুন
- পেশাদার এবং বিস্তৃত করুন
- ${data.industry} শিল্পের সাথে প্রাসঙ্গিক নির্দিষ্ট বিবরণ অন্তর্ভুক্ত করুন
- ${data.businessName} এর অনন্য পরিস্থিতির সাথে সামঞ্জস্য রেখে লিখুন
- পেশাদার, প্রভাবশালী টোনে লিখুন
- নিশ্চিত করুন যে বিষয়বস্তু কার্যকর এবং মূল্যবান
- বাংলাদেশী বাজারের প্রেক্ষাপট বিবেচনা করুন` : `
IMPORTANT: 
- Use markdown formatting for headers and sections
- Make it professional and comprehensive
- Include specific details relevant to the ${data.industry} industry
- Tailor the content to ${data.businessName}'s unique situation
- Write in a professional, authoritative tone
- Ensure the content is actionable and valuable
- Consider Bangladeshi market context`}`

    const response = await callAIWithFallback(provider, {
      model: getModel(provider),
      messages: [
        {
          role: 'system',
          content: language === 'bn'
            ? 'আপনি একজন পেশাদার ব্যবসায়িক পরামর্শদাতা এবং নথি লেখক যিনি উচ্চ মানের ব্যবসায়িক নথি তৈরিতে দক্ষ। আপনি প্রতিটি নির্দিষ্ট ব্যবসা এবং শিল্পের সাথে তাল মিলিয়ে বিস্তৃত, সুসংগঠিত নথি তৈরি করেন।'
            : 'You are a professional business consultant and document writer with expertise in creating high-quality business documents. You create comprehensive, well-structured documents that are tailored to each specific business and industry.'
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })

    return response.choices[0]?.message?.content || 'Error generating document content.'
  } catch (error) {
    console.error('Error generating document:', error)
    throw new Error('Failed to generate document. Please try again.')
  }
}

const getDocumentInstructions = (documentType: string, language: Language = 'en'): string => {
  if (language === 'bn') {
    switch (documentType) {
      case 'business_plan':
        return `
নিম্নলিখিত বিভাগগুলি নিয়ে একটি বিস্তৃত ব্যবসায়িক পরিকল্পনা তৈরি করুন:
১. নির্বাহী সারসংক্ষেপ
২. কোম্পানির বিবরণ
৩. বাজার বিশ্লেষণ
৪. সংগঠন ও ব্যবস্থাপনা
৫. পণ্য/সেবা
৬. বিপণন ও বিক্রয় কৌশল
৭. আর্থিক অনুমান
৮. অর্থায়নের প্রয়োজনীয়তা (যদি প্রযোজ্য হয়)
৯. বাস্তবায়নের সময়সূচী
১০. ঝুঁকি বিশ্লেষণ

প্রতিটি বিভাগ বিস্তারিত এবং পেশাদার হওয়া উচিত, মূল্যবান অন্তর্দৃষ্টি এবং কার্যকর তথ্য প্রদান করে।`

      case 'executive_summary':
        return `
নিম্নলিখিত বিষয়গুলি নিয়ে একটি সংক্ষিপ্ত কিন্তু বিস্তৃত নির্বাহী সারসংক্ষেপ তৈরি করুন:
১. কোম্পানির সংক্ষিপ্ত বিবরণ
২. মিশন ও ভিশন
৩. বাজারের সুযোগ
৪. প্রতিযোগিতামূলক সুবিধা
৫. পণ্য/সেবার সারসংক্ষেপ
৬. লক্ষ্য বাজার
৭. আয়ের মডেল
৮. আর্থিক হাইলাইট
৯. প্রধান সাফল্যের কারণ
১০. পরবর্তী পদক্ষেপ

মূল মূল্য প্রস্তাবনাগুলিতে আকর্ষক এবং ফোকাসড রাখুন।`

      case 'marketing_plan':
        return `
নিম্নলিখিত বিষয়গুলি নিয়ে একটি বিস্তারিত বিপণন কৌশল তৈরি করুন:
১. বাজার গবেষণা ও বিশ্লেষণ
২. লক্ষ্য দর্শকদের সংজ্ঞা
৩. প্রতিযোগিতামূলক বিশ্লেষণ
৪. বিপণন উদ্দেশ্য ও লক্ষ্য
৫. ব্র্যান্ড অবস্থান
৬. বিপণন মিশ্রণ (৪ পি)
৭. ডিজিটাল বিপণন কৌশল
৮. ঐতিহ্যবাহী বিপণন চ্যানেল
৯. বাজেট বরাদ্দ
১০. সাফল্যের মেট্রিক্স ও KPI
১১. বাস্তবায়নের সময়সূচী

কার্যকর কৌশল এবং পরিমাপযোগ্য ফলাফলের উপর ফোকাস করুন।`

      default:
        return 'প্রাসঙ্গিক বিভাগ এবং বিস্তারিত বিষয়বস্তু সহ একটি পেশাদার ব্যবসায়িক নথি তৈরি করুন।'
    }
  }
  
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

// iDEAN AI Core Tool Generation Functions

export const generateToolContent = async (options: ToolGenerationOptions): Promise<StructuredContent | FacebookAdContent | string> => {
  const { tool, inputs, businessContext, language = 'en', provider = 'openai' } = options
  
  try {
    switch (tool) {
      // Strategy & Branding Lab Tools
      case 'niche-finder':
        return await generateNicheFinder(inputs, businessContext, language, provider)
      case 'core-strategy-builder':
        return await generateCoreStrategy(inputs, businessContext, language, provider)
      case 'blue-ocean-navigator':
        return await generateBlueOceanStrategy(inputs, businessContext, language, provider)
      case 'storybrand-builder':
        return await generateStoryBrand(inputs, businessContext, language, provider)
      
      // Content Creation Engine
      case 'facebook-ad-builder':
        return await generateFacebookAd(inputs, businessContext, language, provider)
      case 'organic-post-generator':
        return await generateOrganicPost(inputs, businessContext, language, provider)
      case 'email-copy-generator':
        return await generateEmailCopy(inputs, businessContext, language, provider)
      
      // Execution Tools
      case 'campaign-planner':
        return await generateCampaignPlan(inputs, businessContext, language, provider)
      case 'growth-hacking-ideas':
        return await generateGrowthHackingIdeas(inputs, businessContext, language, provider)
      
      default:
        throw new Error(`Tool type ${tool} not implemented yet`)
    }
  } catch (error) {
    console.error(`Error generating content for tool ${tool}:`, error)
    throw error
  }
}

// Strategy Tools Implementation

const generateNicheFinder = async (
  inputs: Record<string, unknown>,
  businessContext: OnboardingData,
  language: Language,
  provider: AIProvider
): Promise<StructuredContent> => {
  const targetMarket = inputs.targetMarket as string || 'general market'
  const budget = inputs.budget as string || 'not specified'
  const timeframe = inputs.timeframe as string || '3-6 months'

  const prompt = language === 'bn'
    ? `${businessContext.businessName} এর জন্য একটি লাভজনক নিশ খুঁজে বের করুন। 
    
    ব্যবসার তথ্য: 
    - শিল্প: ${businessContext.industry}
    - টার্গেট মার্কেট: ${targetMarket}
    - বাজেট: ${budget}
    - সময়সীমা: ${timeframe}
    - অতিরিক্ত তথ্য: ${businessContext.additionalInfo}
    
    নিম্নলিখিত বিষয়গুলি বিশ্লেষণ করুন:
    1. মার্কেট সাইজ এবং সুযোগ
    2. প্রতিযোগিতার অবস্থা
    3. গ্রাহকদের সমস্যা এবং চাহিদা
    4. আয়ের সম্ভাবনা
    5. প্রবেশের বাধা`
    : `Find a profitable niche for ${businessContext.businessName}.
    
    Business Information:
    - Industry: ${businessContext.industry}
    - Target Market: ${targetMarket}
    - Budget: ${budget}
    - Timeframe: ${timeframe}
    - Additional Info: ${businessContext.additionalInfo}
    
    Analyze the following aspects:
    1. Market size and opportunity
    2. Competition landscape
    3. Customer pain points and needs
    4. Revenue potential
    5. Barriers to entry`

  const response = await callAIWithFallback(provider, {
    model: getModel(provider),
    messages: [
      {
        role: 'system',
        content: language === 'bn'
          ? 'আপনি একজন ব্যবসায়িক কৌশল বিশেষজ্ঞ। লাভজনক নিশ খুঁজে বের করার জন্য iMarketing এবং GrowthX ফ্রেমওয়ার্ক ব্যবহার করুন।'
          : 'You are a business strategy expert. Use iMarketing and GrowthX frameworks to identify profitable niches.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  })

  return {
    title: language === 'bn' ? 'নিশ বিশ্লেষণ' : 'Niche Analysis',
    sections: [
      {
        heading: language === 'bn' ? 'মার্কেট সুযোগ' : 'Market Opportunity',
        content: response.choices[0]?.message?.content || 'Content generation failed'
      }
    ],
    metadata: {
      targetMarket,
      budget,
      timeframe,
      generatedAt: new Date().toISOString()
    }
  }
}

const generateFacebookAd = async (
  inputs: Record<string, unknown>,
  businessContext: OnboardingData,
  language: Language,
  provider: AIProvider
): Promise<FacebookAdContent> => {
  const { adObjective, targetAudience, painPoint, solution } = inputs
  
  const prompt = language === 'bn'
    ? `${businessContext.businessName} এর জন্য একটি ফেসবুক বিজ্ঞাপন তৈরি করুন। উদ্দেশ্য: ${adObjective}, টার্গেট অডিয়েন্স: ${targetAudience}, সমস্যা: ${painPoint}, সমাধান: ${solution}. 
    
    ফলাফল এই ফর্ম্যাটে দিন:
    HOOK: [মনোযোগ আকর্ষণকারী হুক]
    BODY: [প্রধান বার্তা]
    CTA: [কল টু অ্যাকশন]
    CAPTION: [পোস্ট ক্যাপশন]`
    : `Create a Facebook ad for ${businessContext.businessName}. Objective: ${adObjective}, Target Audience: ${targetAudience}, Pain Point: ${painPoint}, Solution: ${solution}.
    
    Format the result as:
    HOOK: [attention-grabbing hook]
    BODY: [main message]
    CTA: [call to action]
    CAPTION: [post caption]`

  const response = await callAIWithFallback(provider, {
    model: getModel(provider),
    messages: [
      {
        role: 'system',
        content: language === 'bn'
          ? 'আপনি একজন ডিজিটাল মার্কেটিং বিশেষজ্ঞ। উচ্চ রূপান্তরকারী ফেসবুক বিজ্ঞাপন তৈরি করুন।'
          : 'You are a digital marketing expert. Create high-converting Facebook ads using proven copywriting frameworks.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 1500
  })

  const content = response.choices[0]?.message?.content || ''
  
  // Parse structured response
  const hook = content.match(/HOOK:\s*([\s\S]*?)(?=\n|BODY:|$)/)?.[1]?.trim() || ''
  const body = content.match(/BODY:\s*([\s\S]*?)(?=\n|CTA:|$)/)?.[1]?.trim() || ''
  const cta = content.match(/CTA:\s*([\s\S]*?)(?=\n|CAPTION:|$)/)?.[1]?.trim() || ''
  const caption = content.match(/CAPTION:\s*([\s\S]*?)(?=\n|$)/)?.[1]?.trim() || ''

  return { hook, body, cta, caption }
}

// Additional tool implementations would go here...
const generateCoreStrategy = async (inputs: Record<string, unknown>, businessContext: OnboardingData, language: Language, _provider: AIProvider): Promise<StructuredContent> => {
  const businessModel = inputs.businessModel as string || 'not specified'
  const valueProposition = inputs.valueProposition as string || businessContext.additionalInfo
  
  return { 
    title: language === 'bn' ? 'মূল কৌশল' : 'Core Strategy', 
    sections: [{ 
      heading: language === 'bn' ? 'কৌশল' : 'Strategy', 
      content: `${language === 'bn' ? 'ব্যবসায়িক মডেল:' : 'Business Model:'} ${businessModel}\n${language === 'bn' ? 'মূল্য প্রস্তাব:' : 'Value Proposition:'} ${valueProposition}\n${language === 'bn' ? 'ব্যবসার নাম:' : 'Business:'} ${businessContext.businessName}` 
    }],
    metadata: { businessModel, valueProposition, tool: 'core-strategy-builder' }
  }
}

const generateBlueOceanStrategy = async (inputs: Record<string, unknown>, businessContext: OnboardingData, language: Language, _provider: AIProvider): Promise<StructuredContent> => {
  const marketSpace = inputs.marketSpace as string || businessContext.industry
  const innovation = inputs.innovation as string || 'new approach'
  
  return { 
    title: language === 'bn' ? 'ব্লু ওশান কৌশল' : 'Blue Ocean Strategy', 
    sections: [{ 
      heading: language === 'bn' ? 'সুযোগ' : 'Opportunity', 
      content: `${language === 'bn' ? 'বাজার স্থান:' : 'Market Space:'} ${marketSpace}\n${language === 'bn' ? 'উদ্ভাবন:' : 'Innovation:'} ${innovation}\n${language === 'bn' ? 'ব্যবসা:' : 'Business:'} ${businessContext.businessName}` 
    }],
    metadata: { marketSpace, innovation, tool: 'blue-ocean-navigator' }
  }
}

const generateStoryBrand = async (inputs: Record<string, unknown>, businessContext: OnboardingData, language: Language, _provider: AIProvider): Promise<StructuredContent> => {
  const heroJourney = inputs.heroJourney as string || 'customer transformation'
  const brandMessage = inputs.brandMessage as string || businessContext.additionalInfo
  
  return { 
    title: language === 'bn' ? 'স্টোরিব্র্যান্ড ফ্রেমওয়ার্ক' : 'StoryBrand Framework', 
    sections: [{ 
      heading: language === 'bn' ? 'ব্র্যান্ড গল্প' : 'Brand Story', 
      content: `${language === 'bn' ? 'হিরো যাত্রা:' : 'Hero Journey:'} ${heroJourney}\n${language === 'bn' ? 'ব্র্যান্ড বার্তা:' : 'Brand Message:'} ${brandMessage}\n${language === 'bn' ? 'ব্যবসা:' : 'Business:'} ${businessContext.businessName}` 
    }],
    metadata: { heroJourney, brandMessage, tool: 'storybrand-builder' }
  }
}

const generateOrganicPost = async (inputs: Record<string, unknown>, businessContext: OnboardingData, language: Language, _provider: AIProvider): Promise<string> => {
  const platform = inputs.platform as string || 'Facebook'
  const tone = inputs.tone as string || 'professional'
  const topic = inputs.topic as string || businessContext.industry
  
  return `${language === 'bn' ? 'অর্গানিক পোস্ট' : 'Organic Post'} ${language === 'bn' ? 'প্ল্যাটফর্ম:' : 'for'} ${platform}\n${language === 'bn' ? 'টোন:' : 'Tone:'} ${tone}\n${language === 'bn' ? 'বিষয়:' : 'Topic:'} ${topic}\n${language === 'bn' ? 'ব্যবসা:' : 'Business:'} ${businessContext.businessName}`
}

const generateEmailCopy = async (inputs: Record<string, unknown>, businessContext: OnboardingData, language: Language, _provider: AIProvider): Promise<string> => {
  const emailType = inputs.emailType as string || 'promotional'
  const audience = inputs.audience as string || 'customers'
  const offer = inputs.offer as string || businessContext.additionalInfo
  
  return `${language === 'bn' ? 'ইমেইল কপি' : 'Email Copy'}\n${language === 'bn' ? 'ধরন:' : 'Type:'} ${emailType}\n${language === 'bn' ? 'অডিয়েন্স:' : 'Audience:'} ${audience}\n${language === 'bn' ? 'অফার:' : 'Offer:'} ${offer}\n${language === 'bn' ? 'ব্যবসা:' : 'Business:'} ${businessContext.businessName}`
}

const generateCampaignPlan = async (inputs: Record<string, unknown>, businessContext: OnboardingData, language: Language, _provider: AIProvider): Promise<StructuredContent> => {
  const campaignGoal = inputs.campaignGoal as string || 'brand awareness'
  const duration = inputs.duration as string || '30 days'
  const channels = inputs.channels as string || 'social media'
  
  return { 
    title: language === 'bn' ? 'ক্যাম্পেইন পরিকল্পনা' : 'Campaign Plan', 
    sections: [{ 
      heading: language === 'bn' ? 'কৌশল' : 'Strategy', 
      content: `${language === 'bn' ? 'লক্ষ্য:' : 'Goal:'} ${campaignGoal}\n${language === 'bn' ? 'সময়কাল:' : 'Duration:'} ${duration}\n${language === 'bn' ? 'চ্যানেল:' : 'Channels:'} ${channels}\n${language === 'bn' ? 'ব্যবসা:' : 'Business:'} ${businessContext.businessName}` 
    }],
    metadata: { campaignGoal, duration, channels, tool: 'campaign-planner' }
  }
}

const generateGrowthHackingIdeas = async (inputs: Record<string, unknown>, businessContext: OnboardingData, language: Language, _provider: AIProvider): Promise<StructuredContent> => {
  const growthStage = inputs.growthStage as string || 'early stage'
  const resources = inputs.resources as string || 'limited budget'
  const timeline = inputs.timeline as string || '3 months'
  
  return { 
    title: language === 'bn' ? 'গ্রোথ হ্যাকিং আইডিয়া' : 'Growth Hacking Ideas', 
    sections: [{ 
      heading: language === 'bn' ? 'আইডিয়া' : 'Ideas', 
      content: `${language === 'bn' ? 'গ্রোথ স্টেজ:' : 'Growth Stage:'} ${growthStage}\n${language === 'bn' ? 'রিসোর্স:' : 'Resources:'} ${resources}\n${language === 'bn' ? 'সময়রেখা:' : 'Timeline:'} ${timeline}\n${language === 'bn' ? 'ব্যবসা:' : 'Business:'} ${businessContext.businessName}` 
    }],
    metadata: { growthStage, resources, timeline, tool: 'growth-hacking-ideas' }
  }
}

// Business Overview Generation
export const generateBusinessOverview = async (
  businessContext: OnboardingData,
  language: Language = 'en',
  provider: AIProvider = 'openai'
): Promise<string> => {
  const prompt = language === 'bn'
    ? `${businessContext.businessName} সম্পর্কে একটি বিস্তৃত ৫০০ শব্দের ব্যবসায়িক পরিচিতি তৈরি করুন। ব্যবসার তথ্য: নাম: ${businessContext.businessName}, শিল্প: ${businessContext.industry}, ওয়েবসাইট: ${businessContext.website}, অতিরিক্ত তথ্য: ${businessContext.additionalInfo}। বাংলাদেশী বাজারের প্রেক্ষাপটে লিখুন।`
    : `Create a comprehensive 500-word business overview for ${businessContext.businessName}. Business details: Name: ${businessContext.businessName}, Industry: ${businessContext.industry}, Website: ${businessContext.website}, Additional Info: ${businessContext.additionalInfo}. Write in the context of the Bangladeshi market.`

  try {
    const response = await callAIWithFallback(provider, {
      model: getModel(provider),
      messages: [
        {
          role: 'system',
          content: language === 'bn'
            ? 'আপনি একজন ব্যবসায়িক বিশ্লেষক। বাংলাদেশী বাজারের জন্য বিস্তৃত ব্যবসায়িক পরিচিতি তৈরি করুন।'
            : 'You are a business analyst. Create comprehensive business overviews for the Bangladeshi market context.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    return response.choices[0]?.message?.content || 'Failed to generate business overview'
  } catch (error) {
    console.error('Error generating business overview:', error)
    throw new Error('Failed to generate business overview')
  }
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  // This is a placeholder - in a real implementation, you'd use a PDF parsing library
  // For now, return a placeholder that indicates the file was processed
  return `[Content from ${file.name} would be extracted here. In production, use PDF parsing library like pdf-parse or similar.]`
}