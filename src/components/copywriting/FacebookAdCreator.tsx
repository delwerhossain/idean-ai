'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Target, 
  Eye, 
  MousePointer, 
  Image, 
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Users,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ideanApi } from '@/lib/api/idean-api'
import { useBusinessDataContext, useBusinessSwitchListener } from '@/lib/contexts/BusinessContext'

interface FacebookAdCreatorProps {
  businessId?: string
  templates: any[]
}

interface AdStepData {
  objective: string
  targetAudience: string
  productService: string
  uniqueValue: string
  painPoints: string
  benefits: string
  callToAction: string
  tone: string
  language: string
}

interface GeneratedContent {
  hook: string
  body: string
  cta: string
  headline: string
  description: string
  creativeIdeas: string[]
}

const WORKFLOW_STEPS = [
  { id: 'setup', title: 'Campaign Setup', description: 'Define your ad objective and audience' },
  { id: 'content', title: 'Content Inputs', description: 'Tell us about your product and value proposition' },
  { id: 'generate', title: 'AI Generation', description: 'Let AI create your ad copy using iDEAN frameworks' },
  { id: 'refine', title: 'Review & Refine', description: 'Edit and optimize your generated content' }
]

const AD_OBJECTIVES = [
  { value: 'awareness', label: 'Brand Awareness', description: 'Increase brand recognition' },
  { value: 'traffic', label: 'Website Traffic', description: 'Drive visitors to your website' },
  { value: 'engagement', label: 'Engagement', description: 'Get likes, comments, and shares' },
  { value: 'leads', label: 'Lead Generation', description: 'Collect emails and contact info' },
  { value: 'conversions', label: 'Conversions', description: 'Drive sales or sign-ups' },
  { value: 'catalog', label: 'Catalog Sales', description: 'Promote product catalog' }
]

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'urgent', label: 'Urgent', description: 'Creates sense of urgency' },
  { value: 'conversational', label: 'Conversational', description: 'Casual and relatable' },
  { value: 'authoritative', label: 'Authoritative', description: 'Expert and confident' },
  { value: 'playful', label: 'Playful', description: 'Fun and energetic' }
]

export default function FacebookAdCreator({ businessId, templates }: FacebookAdCreatorProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [stepData, setStepData] = useState<AdStepData>({
    objective: '',
    targetAudience: '',
    productService: '',
    uniqueValue: '',
    painPoints: '',
    benefits: '',
    callToAction: '',
    tone: 'friendly',
    language: 'en'
  })
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const businessData = useBusinessDataContext()

  useEffect(() => {
    // Pre-fill with business context if available
    if (businessData.currentBusiness) {
      setStepData(prev => ({
        ...prev,
        language: businessData.currentBusiness?.language || 'en',
        targetAudience: businessData.currentBusiness?.business_context?.split('.')[0] || '',
      }))
    }
  }, [businessData.currentBusiness])

  // Reset form data when business changes
  useBusinessSwitchListener(({ newBusiness }) => {
    console.log('🔄 Business switched in FacebookAdCreator, resetting form data')
    setStepData(prev => ({
      ...prev,
      language: newBusiness.language || 'en',
      targetAudience: newBusiness.business_context?.split('.')[0] || '',
    }))
    // Clear generated content to avoid confusion
    setGeneratedContent(null)
    setGenerationProgress(0)
    setCurrentStep(0)
  })

  const updateStepData = (field: keyof AdStepData, value: string) => {
    setStepData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < WORKFLOW_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const generateAdContent = async () => {
    if (!selectedTemplate && templates.length === 0) {
      alert('No copywriting templates available. Please contact support.')
      return
    }

    setGenerating(true)
    setGenerationProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const templateId = selectedTemplate || templates[0]?.id
      if (!templateId) {
        throw new Error('No template selected')
      }

      // Prepare inputs based on iDEAN AI framework structure
      const inputs = {
        objective: stepData.objective,
        target_audience: stepData.targetAudience,
        product_service: stepData.productService,
        unique_value_proposition: stepData.uniqueValue,
        pain_points: stepData.painPoints,
        key_benefits: stepData.benefits,
        call_to_action: stepData.callToAction,
        tone: stepData.tone,
        language: stepData.language,
        business_context: businessData.currentBusiness?.business_context || '',
        industry: businessData.currentBusiness?.industry_tag || ''
      }

      const response = await ideanApi.copywriting.generate(templateId, { userInputs: inputs })
      
      // Parse the generated content (assuming structured response)
      const content = response.content
      
      // Mock structured response for now (backend should return structured data)
      const mockStructuredContent: GeneratedContent = {
        hook: extractSection(content, 'Hook', 'Main Text') || "🚀 Transform Your [Target] Results in 30 Days!",
        body: extractSection(content, 'Main Text', 'Call to Action') || content.substring(0, 300),
        cta: extractSection(content, 'Call to Action', null) || "Get Started Today",
        headline: extractSection(content, 'Headline', 'Hook') || `${stepData.productService} - ${stepData.uniqueValue}`,
        description: `${stepData.benefits} Perfect for ${stepData.targetAudience}.`,
        creativeIdeas: [
          "Before/After transformation visual",
          "Customer testimonial video",
          "Product demonstration GIF",
          "Behind-the-scenes content",
          "User-generated content showcase"
        ]
      }

      setGeneratedContent(mockStructuredContent)
      setGenerationProgress(100)
      
      setTimeout(() => {
        nextStep()
        clearInterval(progressInterval)
      }, 1000)
      
    } catch (error) {
      console.error('Failed to generate ad content:', error)
      alert('Failed to generate content. Please try again.')
      setGenerationProgress(0)
    } finally {
      setGenerating(false)
      clearInterval(progressInterval)
    }
  }

  const extractSection = (content: string, startMarker: string, endMarker: string | null): string => {
    const startIndex = content.toLowerCase().indexOf(startMarker.toLowerCase())
    if (startIndex === -1) return ''
    
    const start = startIndex + startMarker.length
    if (!endMarker) return content.substring(start).trim()
    
    const endIndex = content.toLowerCase().indexOf(endMarker.toLowerCase(), start)
    if (endIndex === -1) return content.substring(start).trim()
    
    return content.substring(start, endIndex).trim()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Show success toast (you can implement a toast notification here)
    alert('Content copied to clipboard!')
  }

  const copyAllContent = () => {
    if (!generatedContent) return
    
    const fullContent = `FACEBOOK AD COPY

` +
      `HOOK: ${generatedContent.hook}\n\n` +
      `MAIN COPY: ${generatedContent.body}\n\n` +
      `CALL TO ACTION: ${generatedContent.cta}\n\n` +
      `HEADLINE: ${generatedContent.headline}\n\n` +
      `DESCRIPTION: ${generatedContent.description}\n\n` +
      `CREATIVE IDEAS:\n${generatedContent.creativeIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}`
    
    navigator.clipboard.writeText(fullContent)
    alert('Complete ad copy copied to clipboard!')
  }

  const generateVariations = async () => {
    if (!generatedContent) return
    
    setLoading(true)
    try {
      // Generate 3 variations of the entire ad
      await Promise.all([
        regenerateSection('hook'),
        regenerateSection('body'),
        regenerateSection('cta')
      ])
    } catch (error) {
      console.error('Failed to generate variations:', error)
    } finally {
      setLoading(false)
    }
  }

  const regenerateSection = async (section: keyof GeneratedContent) => {
    if (!generatedContent) return
    
    setLoading(true)
    try {
      const templateId = selectedTemplate || templates[0]?.id
      if (!templateId) {
        throw new Error('No template selected')
      }

      // Prepare focused inputs for the specific section
      const sectionPrompts = {
        hook: `Generate an attention-grabbing hook for: ${stepData.productService} targeting ${stepData.targetAudience}`,
        body: `Create compelling ad body text about: ${stepData.uniqueValue}. Address pain points: ${stepData.painPoints}. Highlight benefits: ${stepData.benefits}`,
        cta: `Generate a strong call-to-action for ${stepData.objective} campaign: ${stepData.callToAction || 'Get Started'}`,
        headline: `Create a compelling headline for: ${stepData.productService}`,
        description: `Write a brief description highlighting: ${stepData.benefits}`,
        creativeIdeas: `Suggest visual creative ideas for ${stepData.productService} targeting ${stepData.targetAudience}`
      }

      const inputs = {
        section_focus: section,
        prompt: sectionPrompts[section],
        context: {
          objective: stepData.objective,
          product: stepData.productService,
          audience: stepData.targetAudience,
          tone: stepData.tone
        }
      }

      const response = await ideanApi.copywriting.generate(templateId, { userInputs: inputs })
      
      // Mock section-specific regeneration
      const variations = {
        hook: [
          `🎯 Stop Scrolling! ${stepData.productService} Can Transform Your ${stepData.targetAudience.split(' ')[0]} Results`,
          `Warning: This ${stepData.productService} Method is NOT for Everyone...`,
          `Finally! A Solution for ${stepData.targetAudience} Who Want Real Results`
        ],
        body: [
          `Transform your approach with ${stepData.productService}. ${stepData.uniqueValue} Say goodbye to ${stepData.painPoints.split(',')[0]} and hello to ${stepData.benefits.split(',')[0]}.`,
          `Here's the truth about ${stepData.productService}: ${stepData.uniqueValue} While others struggle with ${stepData.painPoints.split(',')[0]}, you'll enjoy ${stepData.benefits}.`,
          `Discover why ${stepData.targetAudience} choose ${stepData.productService}. ${stepData.uniqueValue} Get ${stepData.benefits} without ${stepData.painPoints.split(',')[0]}.`
        ],
        cta: ['Start Today', 'Get Instant Access', 'Claim Your Spot', 'Learn More Now', 'Try Risk-Free'],
        headline: [
          `${stepData.productService} - ${stepData.uniqueValue}`,
          `The #1 ${stepData.productService} for ${stepData.targetAudience}`,
          `Revolutionary ${stepData.productService} Solution`
        ],
        description: [
          `${stepData.benefits} Perfect for ${stepData.targetAudience}.`,
          `Exclusive ${stepData.productService} designed for ${stepData.targetAudience}.`,
          `Get ${stepData.benefits.split(',')[0]} with our proven ${stepData.productService}.`
        ]
      }

      const newContent = (variations as any)[section] ? (variations as any)[section][Math.floor(Math.random() * (variations as any)[section].length)] : response.content
      
      if (section === 'creativeIdeas') {
        const newIdeas = [
          `${stepData.productService} before/after showcase`,
          `Customer success story video`,
          `Behind-the-scenes of ${stepData.productService}`,
          `Live demonstration or tutorial`,
          `User testimonial compilation`
        ]
        setGeneratedContent(prev => prev ? { ...prev, [section]: newIdeas } : null)
      } else {
        setGeneratedContent(prev => prev ? { ...prev, [section]: newContent } : null)
      }
      
    } catch (error) {
      console.error(`Failed to regenerate ${section}:`, error)
      alert(`Failed to regenerate ${section}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (WORKFLOW_STEPS[currentStep].id) {
      case 'setup':
        return (
          <div className="space-y-6">
            <div className="text-center py-6">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Campaign Setup</h3>
              <p className="text-gray-600">Let's define your ad objective and target audience</p>
            </div>

            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What&apos;s your primary ad objective?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AD_OBJECTIVES.map((objective) => (
                      <div
                        key={objective.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          stepData.objective === objective.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateStepData('objective', objective.value)}
                      >
                        <div className="font-medium text-gray-900">{objective.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{objective.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Describe your target audience (e.g., Small business owners aged 25-45 who struggle with digital marketing)"
                    value={stepData.targetAudience}
                    onChange={(e) => updateStepData('targetAudience', e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Be specific about demographics, interests, and pain points
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'content':
        return (
          <div className="space-y-6">
            <div className="text-center py-6">
              <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Content Details</h3>
              <p className="text-gray-600">Tell us about your product and value proposition</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Product & Value</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product/Service <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="What are you promoting?"
                      value={stepData.productService}
                      onChange={(e) => updateStepData('productService', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unique Value Proposition <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="What makes you different from competitors?"
                      value={stepData.uniqueValue}
                      onChange={(e) => updateStepData('uniqueValue', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Customer Psychology</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pain Points <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="What problems does your audience face?"
                      value={stepData.painPoints}
                      onChange={(e) => updateStepData('painPoints', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Benefits <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="What benefits will they get from your solution?"
                      value={stepData.benefits}
                      onChange={(e) => updateStepData('benefits', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call to Action
                  </label>
                  <Input
                    placeholder="e.g., Get Started Today, Learn More"
                    value={stepData.callToAction}
                    onChange={(e) => updateStepData('callToAction', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone of Voice
                  </label>
                  <Select value={stepData.tone} onValueChange={(value) => updateStepData('tone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          <div>
                            <div className="font-medium">{tone.label}</div>
                            <div className="text-sm text-gray-500">{tone.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <Select value={stepData.language} onValueChange={(value) => updateStepData('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'generate':
        return (
          <div className="space-y-6">
            <div className="text-center py-6">
              <Sparkles className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Generation</h3>
              <p className="text-gray-600">Ready to create your Facebook ad copy using iDEAN frameworks</p>
            </div>

            {!generating ? (
              <Card className="p-8">
                <div className="text-center space-y-6">
                  {templates.length > 0 && (
                    <div className="max-w-md mx-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Framework Template
                      </label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a copywriting template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name || `Template ${template.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">What we&apos;ll create for you:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Attention-grabbing hooks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Persuasive ad copy body</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Compelling call-to-action</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Creative visual ideas</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4"
                    onClick={generateAdContent}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Facebook Ad Copy
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Ad Copy...</h4>
                    <p className="text-gray-600">Using iDEAN AI frameworks to craft compelling content</p>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>Analyzing your inputs... ✓</p>
                    <p>Applying iDEAN frameworks... {generationProgress > 30 ? '✓' : '⏳'}</p>
                    <p>Generating compelling copy... {generationProgress > 60 ? '✓' : '⏳'}</p>
                    <p>Optimizing for conversions... {generationProgress > 90 ? '✓' : '⏳'}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )

      case 'refine':
        return (
          <div className="space-y-6">
            <div className="text-center py-6">
              <Eye className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Review & Refine</h3>
              <p className="text-gray-600">Edit and optimize your generated Facebook ad content</p>
            </div>

            {generatedContent && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ad Preview */}
                <Card className="p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold text-gray-900">Generated Ad Copy</h4>
                    <div className="flex items-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={generateVariations}
                        disabled={loading}
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="ml-1">Generate Variations</span>
                      </Button>
                      <Button size="sm" variant="outline">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Hook */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Hook / Opening</label>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedContent.hook)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => regenerateSection('hook')}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={generatedContent.hook}
                        onChange={(e) => setGeneratedContent(prev => prev ? {...prev, hook: e.target.value} : null)}
                        className="min-h-[80px] font-medium text-lg"
                      />
                    </div>

                    {/* Body */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Main Copy</label>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedContent.body)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => regenerateSection('body')}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={generatedContent.body}
                        onChange={(e) => setGeneratedContent(prev => prev ? {...prev, body: e.target.value} : null)}
                        className="min-h-[120px]"
                      />
                    </div>

                    {/* CTA */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Call to Action</label>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedContent.cta)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => regenerateSection('cta')}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        value={generatedContent.cta}
                        onChange={(e) => setGeneratedContent(prev => prev ? {...prev, cta: e.target.value} : null)}
                        className="font-medium"
                      />
                    </div>

                    {/* Ad Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Headline</label>
                        <Input
                          value={generatedContent.headline}
                          onChange={(e) => setGeneratedContent(prev => prev ? {...prev, headline: e.target.value} : null)}
                        />
                      </div>
                      <div className="border rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                        <Input
                          value={generatedContent.description}
                          onChange={(e) => setGeneratedContent(prev => prev ? {...prev, description: e.target.value} : null)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Creative Ideas & Actions */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Image className="w-5 h-5 mr-2 text-purple-600" />
                      Creative Ideas
                    </h4>
                    <div className="space-y-3">
                      {generatedContent.creativeIdeas.map((idea, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <span className="text-sm text-gray-700">{idea}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Export & Share</h4>
                    <div className="space-y-3">
                      <Button className="w-full" variant="outline" onClick={copyAllContent}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All Content
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export as PDF
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        Save to Library
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const isStepComplete = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return stepData.objective && stepData.targetAudience.trim().length > 10
      case 1:
        return stepData.productService.trim().length > 0 && 
               stepData.uniqueValue.trim().length > 0 && 
               stepData.painPoints.trim().length > 0 && 
               stepData.benefits.trim().length > 0
      case 2:
        return generatedContent !== null
      case 3:
        return true
      default:
        return false
    }
  }

  const canProceed = () => {
    return isStepComplete(currentStep)
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {WORKFLOW_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-3 ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index < currentStep 
                    ? 'bg-green-100 text-green-600' 
                    : index === currentStep
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <div className="hidden md:block">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < WORKFLOW_STEPS.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-300 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center space-x-4">
          {currentStep === 2 && !generatedContent && !generating && (
            <div className="text-sm text-gray-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Click &quot;Generate Facebook Ad Copy&quot; to continue
            </div>
          )}
          
          {currentStep < WORKFLOW_STEPS.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed() || generating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => alert('Ad copy created successfully!')}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}