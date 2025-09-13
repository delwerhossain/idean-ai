'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { GenerationInputPanel } from './GenerationInputPanel'
import { GenerationEditor } from './GenerationEditor'
import { GenerationToolbar } from './GenerationToolbar'
import { GenerationStatusBar } from './GenerationStatusBar'
import { ideanApi } from '@/lib/api/idean-api'

interface Framework {
  id: string
  name: string
  description?: string
  input_fields?: string[]
  dropdown?: string[]
  system_prompt: string
  user_starting_prompt?: string
}

interface GenerationStudioProps {
  type: 'copywriting' | 'growth-copilot' | 'branding-lab'
  framework: Framework
  onBack?: () => void
}

interface GenerationResult {
  content: string
  metadata?: {
    framework: string
    inputs: Record<string, any>
    timestamp: string
    tokensUsed?: number
    model?: string
  }
}

export function GenerationStudio({ type, framework, onBack }: GenerationStudioProps) {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState<'input' | 'generating' | 'editing'>('input')
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [generationOptions, setGenerationOptions] = useState({
    tone: 'professional',
    length: 'medium',
    audience: 'business',
    temperature: 0.7,
    maxTokens: 2000,
    includeBusinessContext: true,
    saveDocument: true
  })

  // Initialize inputs based on framework fields
  useEffect(() => {
    const initialInputs: Record<string, any> = {}

    if (framework.input_fields) {
      framework.input_fields.forEach(field => {
        const fieldName = field.includes(':') ? field.split(':')[0] : field
        initialInputs[fieldName] = ''
      })
    }

    setInputs(initialInputs)
  }, [framework])

  const handleGenerate = async () => {
    if (!framework) return

    try {
      setIsGenerating(true)
      setError(null)
      setCurrentStep('generating')

      // Check if this is a predefined framework (no backend call needed)
      const predefinedFrameworkIds = ['neuro-copy', 'nuclear-content', 'sales-pages', 'email-sequences', 'social-copy', 'ad-copy']
      const isPredefinedFramework = predefinedFrameworkIds.includes(framework.id)

      if (isPredefinedFramework || !user) {
        // Use mock generation for predefined frameworks or when user is not authenticated
        await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate AI generation

        const mockContent = generateMockContent(framework, inputs, generationOptions)

        setGenerationResult({
          content: mockContent,
          metadata: {
            framework: framework.name,
            inputs,
            timestamp: new Date().toISOString(),
            tokensUsed: Math.floor(Math.random() * 500) + 200,
            model: 'mock-generation'
          }
        })
      } else {
        // Use real backend API for authenticated users with backend frameworks
        const apiPayload = {
          userInputs: inputs,
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

        let response

        // Call appropriate API based on type
        switch (type) {
          case 'copywriting':
            response = await ideanApi.copywriting.generate(framework.id, apiPayload)
            break
          case 'growth-copilot':
            response = await ideanApi.growthCopilot.generate(framework.id, apiPayload)
            break
          case 'branding-lab':
            response = await ideanApi.brandingLab.generate(framework.id, apiPayload)
            break
          default:
            throw new Error('Unsupported generation type')
        }

        setGenerationResult({
          content: response.data?.generatedContent || response.generatedContent || response.content || 'Generated content will appear here.',
          metadata: {
            framework: framework.name,
            inputs,
            timestamp: new Date().toISOString(),
            tokensUsed: response.data?.generationMetadata?.usage?.total_tokens || response.usage?.total_tokens || 0,
            model: response.data?.generationMetadata?.model || response.model || 'gpt-4'
          }
        })
      }

      setCurrentStep('editing')
    } catch (err: any) {
      console.error('Generation failed:', err)
      setError(err.message || 'Failed to generate content. Please try again.')
      setCurrentStep('input')
    } finally {
      setIsGenerating(false)
    }
  }

  // Mock content generation function (from old working GenerationModal)
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

      case 'Sales Page Framework':
        return `# Sales Page: ${inputs.productName || 'Your Product'}

## Headline
${inputs.mainBenefit || 'Transform Your Business'} - The ${tone} Solution That ${inputs.desiredOutcome || 'Delivers Results'}

## Problem Statement
${inputs.problemDescription || 'You\'re struggling with challenges that are holding you back...'}

## Solution Benefits
${inputs.solutionBenefits || 'Our proven system eliminates these problems and delivers:'}
• Benefit 1: Immediate results
• Benefit 2: Long-term success
• Benefit 3: Peace of mind

## Social Proof
"${inputs.testimonial || 'This changed everything for my business!'}" - Satisfied Customer

## Pricing
${inputs.pricePoint ? `Special offer: ${inputs.pricePoint}` : 'Get started today at an exclusive price'}

## Call to Action
${inputs.ctaText || 'Order Now'} - Limited time offer!

*Built with Sales Page Framework*`

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

  const handleRegenerateSection = async (sectionText: string) => {
    // Implementation for regenerating specific sections
    // This will be called from the editor when user selects text and clicks regenerate
  }

  const handleExport = async (format: 'pdf' | 'markdown' | 'docx' | 'html') => {
    // Implementation for exporting generated content
    if (!generationResult?.content) return

    try {
      // For now, copy to clipboard
      await navigator.clipboard.writeText(generationResult.content)
      // TODO: Implement actual PDF/DOCX export
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
      {/* Left Panel - Input Form (40% on desktop, hidden when editing on mobile) */}
      <div className={`w-full lg:w-2/5 bg-white border-r border-gray-200 flex flex-col ${
        currentStep === 'editing' ? 'hidden lg:flex' : 'flex'
      }`}>
        <GenerationInputPanel
          framework={framework}
          inputs={inputs}
          generationOptions={generationOptions}
          currentStep={currentStep}
          isGenerating={isGenerating}
          error={error}
          onInputChange={setInputs}
          onOptionsChange={setGenerationOptions}
          onGenerate={handleGenerate}
          onBack={onBack}
        />
      </div>

      {/* Right Panel - Editor Canvas (60% on desktop, full width when editing on mobile) */}
      <div className={`flex flex-col bg-gray-50 ${
        currentStep === 'editing' ? 'flex-1' : 'flex-1 hidden lg:flex'
      }`}>
        {/* Toolbar */}
        <GenerationToolbar
          isGenerating={isGenerating}
          hasContent={!!generationResult?.content}
          onExport={handleExport}
          onRegenerateAll={() => handleGenerate()}
          onBackToInput={currentStep === 'editing' ? () => setCurrentStep('input') : undefined}
        />

        {/* Editor Content */}
        <div className="flex-1 overflow-hidden">
          <GenerationEditor
            content={generationResult?.content || ''}
            isGenerating={isGenerating}
            currentStep={currentStep}
            framework={framework}
            onRegenerateSection={handleRegenerateSection}
          />
        </div>

        {/* Status Bar */}
        <GenerationStatusBar
          wordCount={generationResult?.content?.split(' ').length || 0}
          tokensUsed={generationResult?.metadata?.tokensUsed || 0}
          model={generationResult?.metadata?.model || ''}
          isGenerating={isGenerating}
          onExport={handleExport}
        />
      </div>
    </div>
  )
}