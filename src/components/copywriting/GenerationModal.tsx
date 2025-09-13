'use client'

import { useState, useEffect } from 'react'
import { X, ArrowLeft, ArrowRight, Sparkles, Download, Copy, Save, FileText, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ideanApi, Copywriting } from '@/lib/api/idean-api'
import { useAuth } from '@/contexts/AuthContext'

interface GenerationModalProps {
  isOpen: boolean
  onClose: () => void
  framework?: {
    id: string
    name: string
    description: string
    category: string
    estimatedTime: string
  } | null
  copywriting?: Copywriting | null
}

interface GenerationStep {
  id: string
  title: string
  description: string
  required?: boolean
}

interface GenerationResult {
  content: string
  metadata: {
    framework: string
    inputs: Record<string, any>
    timestamp: string
    tokensUsed?: number
    model?: string
  }
}

const GENERATION_STEPS: GenerationStep[] = [
  {
    id: 'framework',
    title: 'Framework',
    description: 'Choose the copywriting framework to use'
  },
  {
    id: 'inputs',
    title: 'Content Details',
    description: 'Fill in the required information for content generation'
  },
  {
    id: 'options',
    title: 'Settings',
    description: 'Configure AI generation settings'
  },
  {
    id: 'generate',
    title: 'Generate',
    description: 'AI is creating your content'
  },
  {
    id: 'result',
    title: 'Results',
    description: 'Review your generated content and export it'
  }
]

export function GenerationModal({ isOpen, onClose, framework, copywriting }: GenerationModalProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [selectedFramework, setSelectedFramework] = useState(framework || null)
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [generationOptions, setGenerationOptions] = useState({
    temperature: 0.7,
    maxTokens: 2000,
    includeBusinessContext: true,
    saveDocument: true,
    tone: 'professional',
    length: 'medium',
    audience: 'general'
  })

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(framework ? 1 : 0)
      setSelectedFramework(framework || null)
      setInputs({})
      setGenerationResult(null)
      setError(null)
    }
  }, [isOpen, framework])

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Validate Step 1: Required inputs
      const requiredFields = ['productName', 'targetAudience', 'mainBenefit']
      const missingFields = requiredFields.filter(field => !inputs[field]?.trim())
      
      if (missingFields.length > 0) {
        setError(`Please fill in required fields: ${missingFields.map(f => f.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}`)
        return false
      }
    }
    
    setError(null)
    return true
  }

  const handleNext = () => {
    if (!validateCurrentStep()) return
    
    if (currentStep < GENERATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    if (!selectedFramework || !user) return

    try {
      setIsGenerating(true)
      setError(null)
      setCurrentStep(3) // Move to generation step

      // If using custom copywriting framework from backend
      if (copywriting) {
        // Prepare API payload according to backend expectations
        const apiPayload = {
          userInputs: {
            productName: inputs.productName,
            targetAudience: inputs.targetAudience,
            mainBenefit: inputs.mainBenefit,
            painPoint: inputs.painPoint,
            ctaText: inputs.ctaText
          },
          userSelections: {
            tone: generationOptions.tone,
            length: generationOptions.length,
            audience: generationOptions.audience
          },
          userPrompt: inputs.additionalInstructions || '',
          businessContext: generationOptions.includeBusinessContext,
          generationOptions: {
            temperature: generationOptions.temperature,
            maxTokens: generationOptions.maxTokens,
            topP: 0.9,
            saveDocument: generationOptions.saveDocument
          }
        }
        
        const response = await ideanApi.copywriting.generate(copywriting.id, apiPayload)

        setGenerationResult({
          content: response.content || 'Generated content will appear here.',
          metadata: {
            framework: copywriting.name,
            inputs,
            timestamp: new Date().toISOString(),
            tokensUsed: (response as any).tokensUsed || 0,
            model: (response as any).model || 'gpt-4'
          }
        })
      } else {
        // Use predefined framework (mock generation for now)
        await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate AI generation

        const mockContent = generateMockContent(selectedFramework, inputs, generationOptions)
        
        setGenerationResult({
          content: mockContent,
          metadata: {
            framework: selectedFramework.name,
            inputs,
            timestamp: new Date().toISOString(),
            tokensUsed: Math.floor(Math.random() * 500) + 200,
            model: 'gpt-4'
          }
        })
      }

      setCurrentStep(4) // Move to result step
    } catch (err: any) {
      console.error('Generation failed:', err)
      setError(err.message || 'Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockContent = (framework: any, inputs: Record<string, any>, options: any) => {
    const { name } = framework
    const { tone, length, audience } = options

    // Mock content generation based on framework
    switch (name) {
      case 'NeuroCopywriting™':
        return `# Psychology-Driven Copy for ${inputs.productName || 'Your Product'}

## Hook (Attention Grabber)
${inputs.painPoint ? `Tired of ${inputs.painPoint}? You're not alone.` : 'Stop struggling with ineffective results.'}

## Problem Agitation
${inputs.painPoint ? `Every day you delay solving ${inputs.painPoint}, you're losing potential customers, revenue, and peace of mind. The frustration builds, and your competitors get ahead.` : 'The problem is real, and it\'s costing you daily.'}

## Solution Presentation
Introducing ${inputs.productName || 'our solution'} - the ${tone} approach that ${inputs.mainBenefit || 'delivers results'}.

## Proof & Authority
✅ Proven psychological triggers
✅ ${audience === 'business' ? 'B2B tested' : 'Consumer validated'} approach
✅ ${length === 'long' ? 'Comprehensive' : 'Quick'} implementation

## Call to Action
${inputs.ctaText || 'Get started today'} and transform your ${inputs.targetOutcome || 'results'}.

*Generated using NeuroCopywriting™ framework*`

      case 'Nuclear Content™':
        return `# Viral Content: ${inputs.contentTopic || 'Your Topic'}

## Viral Hook
🚀 ${inputs.contentTopic ? `This ${inputs.contentTopic} secret` : 'This one trick'} will ${inputs.desiredOutcome || 'change everything'}

## Value Explosion
${inputs.mainPoint ? inputs.mainPoint : 'Here\'s what most people don\'t know...'} 

${length === 'long' ? `
### The Complete Method:
1. First, understand the psychology
2. Then, apply the framework
3. Finally, optimize for sharing
` : `
Quick method:
• Apply the principle
• Test the response
• Scale what works
`}

## Social Proof
💬 "This actually works!" - ${audience === 'business' ? 'CEO' : 'User'}
📈 ${Math.floor(Math.random() * 10000) + 1000}+ people have tried this

## Engagement Driver
${inputs.engagementQuestion || 'What\'s your experience with this?'} 
Comment below! 👇

#${inputs.hashtag1 || 'viral'} #${inputs.hashtag2 || 'content'} #${inputs.hashtag3 || 'marketing'}

*Created with Nuclear Content™ framework*`

      case 'Email Sequence Builder':
        return `# Email Sequence: ${inputs.sequenceGoal || 'Nurture Campaign'}

## Email 1: Welcome & Hook
**Subject:** ${inputs.subjectLine1 || `Welcome! Here's what's next...`}

Hi ${inputs.audienceName || '[First Name]'},

${inputs.welcomeMessage || 'Welcome to our community! Here\'s what you can expect...'}

Best regards,
${inputs.senderName || 'Your Name'}

---

## Email 2: Value Delivery
**Subject:** ${inputs.subjectLine2 || 'The secret I promised you...'}

${inputs.valueContent || 'Here\'s the valuable insight I mentioned...'}

---

## Email 3: Social Proof
**Subject:** ${inputs.subjectLine3 || 'What others are saying...'}

${inputs.socialProof || 'Our community members are seeing amazing results...'}

---

## Email 4: Call to Action
**Subject:** ${inputs.subjectLine4 || 'Ready for the next step?'}

${inputs.finalCta || 'You\'ve learned the fundamentals. Now it\'s time to take action...'}

${inputs.ctaButton || '[GET STARTED]'}

*Automated sequence powered by Email Sequence Builder*`

      default:
        return `# Generated Copy: ${name}

${inputs.mainMessage || 'Your compelling message goes here...'}

## Key Benefits:
${inputs.benefit1 ? `• ${inputs.benefit1}` : '• Benefit 1'}
${inputs.benefit2 ? `• ${inputs.benefit2}` : '• Benefit 2'}
${inputs.benefit3 ? `• ${inputs.benefit3}` : '• Benefit 3'}

## Call to Action:
${inputs.ctaText || 'Take action now!'}

*Generated with ${name} framework*`
    }
  }

  const handleCopyContent = () => {
    if (generationResult?.content) {
      navigator.clipboard.writeText(generationResult.content)
      // Could add toast notification here
    }
  }

  const handleSaveDocument = () => {
    // Implementation for saving to documents
    console.log('Saving document...', generationResult)
  }

  const handleDownload = () => {
    if (!generationResult?.content) return

    const blob = new Blob([generationResult.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedFramework?.name || 'generated-copy'}-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Content Generation</h2>
            <p className="text-gray-600 mt-1">
              {GENERATION_STEPS[currentStep]?.description}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            {GENERATION_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : index === currentStep && isGenerating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < GENERATION_STEPS.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${index < currentStep ? 'bg-orange-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {GENERATION_STEPS.map((step, index) => (
              <div key={step.id} className="text-xs text-gray-500 w-16 text-center">
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 0: Framework Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Choose a Copywriting Framework</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`p-4 cursor-pointer hover:shadow-md transition-shadow border-2 ${
                    selectedFramework?.name === 'NeuroCopywriting™' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-orange-200'
                  }`}
                  onClick={() => setSelectedFramework({
                    id: 'neuro-copywriting',
                    name: 'NeuroCopywriting™',
                    description: 'Psychology-driven copywriting that triggers buying behavior',
                    category: 'sales',
                    estimatedTime: '15-20 minutes'
                  })}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-orange-600" />
                    <div>
                      <h4 className="font-medium">NeuroCopywriting™</h4>
                      <p className="text-sm text-gray-500">15-20 minutes</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Psychology-driven copywriting that triggers buying behavior</p>
                </Card>
                
                <Card 
                  className={`p-4 cursor-pointer hover:shadow-md transition-shadow border-2 ${
                    selectedFramework?.name === 'Nuclear Content™' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-orange-200'
                  }`}
                  onClick={() => setSelectedFramework({
                    id: 'nuclear-content',
                    name: 'Nuclear Content™',
                    description: 'Viral content creation using proven engagement triggers',
                    category: 'content',
                    estimatedTime: '10-15 minutes'
                  })}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-6 h-6 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Nuclear Content™</h4>
                      <p className="text-sm text-gray-500">10-15 minutes</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Viral content creation using proven engagement triggers</p>
                </Card>
                
                <Card 
                  className={`p-4 cursor-pointer hover:shadow-md transition-shadow border-2 ${
                    selectedFramework?.name === 'Email Sequence Builder' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-orange-200'
                  }`}
                  onClick={() => setSelectedFramework({
                    id: 'email-sequence',
                    name: 'Email Sequence Builder',
                    description: 'Multi-email nurture sequences that convert',
                    category: 'email',
                    estimatedTime: '20-25 minutes'
                  })}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-orange-600" />
                    <div>
                      <h4 className="font-medium">Email Sequence Builder</h4>
                      <p className="text-sm text-gray-500">20-25 minutes</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Multi-email nurture sequences that convert</p>
                </Card>
              </div>
            </div>
          )}

          {/* Step 1: Input Form */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedFramework?.name}</h3>
                  <p className="text-sm text-gray-500">{selectedFramework?.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="productName">Product/Service Name *</Label>
                    <Input
                      id="productName"
                      value={inputs.productName || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, productName: e.target.value }))}
                      placeholder="Enter your product or service name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience *</Label>
                    <Input
                      id="targetAudience"
                      value={inputs.targetAudience || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="Who is your ideal customer?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mainBenefit">Main Benefit *</Label>
                    <Input
                      id="mainBenefit"
                      value={inputs.mainBenefit || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, mainBenefit: e.target.value }))}
                      placeholder="What's the primary benefit?"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="painPoint">Pain Point</Label>
                    <Input
                      id="painPoint"
                      value={inputs.painPoint || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, painPoint: e.target.value }))}
                      placeholder="What problem does this solve?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ctaText">Call to Action</Label>
                    <Input
                      id="ctaText"
                      value={inputs.ctaText || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="Your call to action text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalInstructions">Additional Instructions</Label>
                    <Textarea
                      id="additionalInstructions"
                      value={inputs.additionalInstructions || ''}
                      onChange={(e) => setInputs(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                      placeholder="Any specific requirements or style preferences?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Generation Options */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Generation Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Tone</Label>
                    <Select 
                      value={generationOptions.tone} 
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, tone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Content Length</Label>
                    <Select 
                      value={generationOptions.length} 
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, length: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (100-300 words)</SelectItem>
                        <SelectItem value="medium">Medium (300-600 words)</SelectItem>
                        <SelectItem value="long">Long (600+ words)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Audience</Label>
                    <Select 
                      value={generationOptions.audience} 
                      onValueChange={(value) => setGenerationOptions(prev => ({ ...prev, audience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Audience</SelectItem>
                        <SelectItem value="business">Business/B2B</SelectItem>
                        <SelectItem value="consumer">Consumer/B2C</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Include Business Context</Label>
                    <Switch
                      checked={generationOptions.includeBusinessContext}
                      onCheckedChange={(checked) => setGenerationOptions(prev => ({ ...prev, includeBusinessContext: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Save as Document</Label>
                    <Switch
                      checked={generationOptions.saveDocument}
                      onCheckedChange={(checked) => setGenerationOptions(prev => ({ ...prev, saveDocument: checked }))}
                    />
                  </div>

                  <div>
                    <Label>Creativity Level: {generationOptions.temperature}</Label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={generationOptions.temperature}
                      onChange={(e) => setGenerationOptions(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Conservative</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Generation in Progress */}
          {currentStep === 3 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-orange-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Generating Your Content...</h3>
              <p className="text-gray-600 mb-4">
                Our AI is crafting compelling copy using {selectedFramework?.name}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Estimated time: {selectedFramework?.estimatedTime}</span>
              </div>
              <LoadingSpinner size="lg" className="mx-auto mt-6" />
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && generationResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Content</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {generationResult.metadata.tokensUsed} tokens used
                  </Badge>
                  <Badge variant="outline">
                    {generationResult.metadata.model}
                  </Badge>
                </div>
              </div>

              <Card className="p-6">
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {generationResult.content}
                  </pre>
                </div>
              </Card>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleCopyContent} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Content
                </Button>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handleSaveDocument} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save to Documents
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h4 className="font-medium">Generation Failed</h4>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setError(null)}
              >
                Try Again
              </Button>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0 || isGenerating}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 2 && (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !selectedFramework) ||
                  (currentStep === 1 && (!inputs.productName || !inputs.targetAudience || !inputs.mainBenefit))
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {currentStep === 2 && (
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !selectedFramework}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </Button>
            )}
            {currentStep === 3 && isGenerating && (
              <Button 
                disabled={true}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <LoadingSpinner size="sm" className="mr-2" />
                Generating...
              </Button>
            )}
            {currentStep === 4 && (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}