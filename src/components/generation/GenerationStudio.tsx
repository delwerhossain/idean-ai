'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { GenerationInputPanel } from './GenerationInputPanel'
import { GenerationEditor } from './GenerationEditor'
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

        // Handle the API response format from the JSON file
        const apiResponse = response.data || response
        const generatedContent = apiResponse.generatedContent || apiResponse.content || 'Generated content will appear here.'

        console.log('API Response:', apiResponse) // Debug logging

        setGenerationResult({
          content: generatedContent,
          metadata: {
            framework: framework.name,
            inputs,
            timestamp: new Date().toISOString(),
            tokensUsed: apiResponse.generationMetadata?.usage?.total_tokens || apiResponse.usage?.total_tokens || 0,
            model: apiResponse.generationMetadata?.model || apiResponse.model || 'gpt-4'
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
    if (!framework || !sectionText.trim()) return

    try {
      setIsGenerating(true)
      setError(null)

      // Create a focused regeneration prompt
      const regenerationPrompt = `Please regenerate this section while maintaining the same style and structure: "${sectionText}"`

      const apiPayload = {
        userInputs: { ...inputs, regenerationFocus: sectionText },
        userSelections: {
          tone: generationOptions.tone,
          length: 'short', // Keep regenerated sections concise
          audience: generationOptions.audience
        },
        userPrompt: regenerationPrompt,
        businessContext: generationOptions.includeBusinessContext,
        generationOptions: {
          temperature: 0.8, // Slightly higher for variation
          maxTokens: 500, // Shorter for section regeneration
          topP: 0.9,
          saveDocument: false // Don't save individual sections
        }
      }

      // Use the same API endpoint but with focused content
      let response
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

      const newSectionContent = response.data?.generatedContent || response.generatedContent

      if (newSectionContent && generationResult) {
        // Replace the section in the current content
        const updatedContent = generationResult.content.replace(sectionText, newSectionContent)

        setGenerationResult({
          ...generationResult,
          content: updatedContent
        })
      }
    } catch (err: any) {
      console.error('Section regeneration failed:', err)
      setError(`Failed to regenerate section: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'markdown' | 'docx' | 'html') => {
    if (!generationResult?.content) return

    try {
      const content = generationResult.content
      const filename = `${framework.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}`

      switch (format) {
        case 'markdown':
          const blob = new Blob([content], { type: 'text/markdown' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${filename}.md`
          a.click()
          URL.revokeObjectURL(url)
          break

        case 'html':
          const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${framework.name} - Generated Content</title>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1, h2, h3 { color: #333; }
    .metadata { background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <div class="metadata">
    <h2>Generated Content</h2>
    <p><strong>Framework:</strong> ${framework.name}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    ${generationResult.metadata?.tokensUsed ? `<p><strong>Tokens:</strong> ${generationResult.metadata.tokensUsed}</p>` : ''}
  </div>
  <div class="content">
    ${content.replace(/\n/g, '<br>').replace(/#{1,3}\s+(.+)/g, '<h3>$1</h3>')}
  </div>
</body>
</html>`

          const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
          const htmlUrl = URL.createObjectURL(htmlBlob)
          const htmlLink = document.createElement('a')
          htmlLink.href = htmlUrl
          htmlLink.download = `${filename}.html`
          htmlLink.click()
          URL.revokeObjectURL(htmlUrl)
          break

        default:
          // Copy to clipboard as fallback
          await navigator.clipboard.writeText(content)
          console.log('Content copied to clipboard')
      }
    } catch (err) {
      console.error('Export failed:', err)
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(generationResult.content)
        console.log('Copied to clipboard as fallback')
      } catch (clipboardErr) {
        console.error('Clipboard fallback also failed:', clipboardErr)
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full">
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
        {/* Editor Content - Now handles its own toolbar and status */}
        <div className="flex-1 overflow-hidden">
          <GenerationEditor
            content={generationResult?.content || ''}
            isGenerating={isGenerating}
            currentStep={currentStep}
            framework={framework}
            onRegenerateSection={handleRegenerateSection}
            onRegenerateAll={() => handleGenerate()}
            hasContent={!!generationResult?.content}
            onExport={handleExport}
            onContentChange={(newContent) => {
              if (generationResult) {
                setGenerationResult({
                  ...generationResult,
                  content: newContent
                })
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}