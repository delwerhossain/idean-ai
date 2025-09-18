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
  documentId?: string // Add document ID for template creation
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
  const [mobileView, setMobileView] = useState<'input' | 'editor'>('input')
  const [retryCount, setRetryCount] = useState(0)
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
    if (!framework || !user) {
      setError('Authentication required to generate content.')
      return
    }

    try {
      setIsGenerating(true)
      setError(null)
      setCurrentStep('generating')

      // Prepare API payload
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

      // Handle the backend API response format
      if ('success' in response && 'data' in response) {
        // New backend response format
        if (!response.success) {
          throw new Error(response.message || 'Generation failed')
        }

        const generatedContent = response.data.generatedContent
        const metadata = response.data.generationMetadata

        // Extract document ID from usedDocuments or savedDocument
        const usedDocuments = (response.data as any).usedDocuments || []
        const savedDocument = response.data.savedDocument
        const documentId = usedDocuments.length > 0 ? usedDocuments[0].id : savedDocument?.id

        setGenerationResult({
          content: generatedContent,
          documentId: documentId,
          metadata: {
            framework: response.data.copyWriting.name,
            inputs: response.data.inputsUsed.userInputs,
            timestamp: new Date().toISOString(),
            tokensUsed: metadata.usage.total_tokens,
            model: metadata.model
          }
        })
      } else {
        // Legacy response format (for other API types)
        const apiResponse = response as any
        const generatedContent = apiResponse.content || apiResponse.generatedContent

        if (!generatedContent) {
          throw new Error('No content received from API')
        }

        // Extract document ID from usedDocuments array if available
        const usedDocuments = apiResponse.usedDocuments || []
        const documentId = usedDocuments.length > 0 ? usedDocuments[0].id : undefined

        setGenerationResult({
          content: generatedContent,
          documentId: documentId,
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
      setRetryCount(0) // Reset retry count on success
      // Auto-switch to editor view on mobile after generation
      setMobileView('editor')
    } catch (err: any) {
      console.error('Generation failed:', err)
      let errorMessage = 'Failed to generate content. Please try again.'
      
      // Provide more specific error messages based on error type
      if (err.status === 401) {
        errorMessage = 'Authentication expired. Please refresh and try again.'
      } else if (err.status === 403) {
        errorMessage = 'You don\'t have permission to use this framework.'
      } else if (err.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (err.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setCurrentStep('input')
      setRetryCount(prev => prev + 1)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRetryGeneration = () => {
    setError(null)
    handleGenerate()
  }

  const handleRegenerateSection = async (sectionText: string) => {
    if (!framework || !sectionText.trim() || !user) {
      setError('Authentication required to regenerate content.')
      return
    }

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

      const newSectionContent = (response as any).data?.generatedContent || (response as any).generatedContent || (response as any).content

      if (newSectionContent && generationResult) {
        // Replace the section in the current content
        const updatedContent = generationResult.content.replace(sectionText, newSectionContent)

        setGenerationResult({
          ...generationResult,
          content: updatedContent
        })
      } else {
        throw new Error('No regenerated content received')
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
      // Copy to clipboard as fallback
      try {
        await navigator.clipboard.writeText(generationResult.content)
      } catch (clipboardErr) {
        console.error('Clipboard fallback also failed:', clipboardErr)
      }
    }
  }

  const handleSaveAsTemplate = async (data: { name: string; description?: string }) => {
    if (!framework || !generationResult?.content || !user) {
      console.error('Missing required data for template creation')
      return
    }

    try {
      // Only support template creation for copywriting type for now
      if (type !== 'copywriting') {
        console.error('Template creation only supported for copywriting frameworks')
        return
      }

      console.log('Creating template from copywriting framework:', framework.id)

      // Transform inputs to match backend format
      const inputFields = framework.input_fields || []
      const text_input_queries: string[] = []
      const text_input_given: string[] = []

      // Extract field names and values from inputs
      inputFields.forEach(field => {
        const fieldName = field.includes(':') ? field.split(':')[0] : field
        text_input_queries.push(fieldName)
        text_input_given.push(inputs[fieldName] || '')
      })

      // Transform dropdown selections
      const drop_down: string[] = [
        generationOptions.tone,
        generationOptions.length,
        generationOptions.audience
      ].filter(Boolean)

      const templateData = {
        name: data.name,
        user_given_prompt: data.description || inputs.additionalInstructions || `Template for ${framework.name}`,
        text_input_queries,
        text_input_given,
        drop_down,
        documentIds: generationResult.documentId ? [generationResult.documentId] : []
      }

      const result = await ideanApi.copywriting.createTemplate(framework.id, templateData)

      // Show success message (you can implement a toast notification here)
      alert(`Template "${data.name}" saved successfully! You can find it in your Templates dashboard.`)
    } catch (error) {
      console.error('❌ Failed to create template:', error)
      // You could show an error toast notification here
      throw error // Re-throw so the dialog can handle the error
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Mobile Navigation Bar - Enhanced Design */}
      {currentStep === 'editing' && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 truncate">{framework.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tap to switch views</p>
            </div>
          </div>

          {/* Enhanced Toggle Buttons */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMobileView('input')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                mobileView === 'input'
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  mobileView === 'input' ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                Inputs
              </div>
            </button>
            <button
              onClick={() => setMobileView('editor')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                mobileView === 'editor'
                  ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  mobileView === 'editor' ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                Editor
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 lg:flex-row h-full min-h-0">
        {/* Left Panel - Input Form */}
        <div className={`w-full lg:w-2/5 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          // Desktop: hide when editing, Mobile: show based on mobileView
          currentStep === 'editing'
            ? `${mobileView === 'input' ? 'flex' : 'hidden'} lg:flex`
            : 'flex'
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
            onRetry={handleRetryGeneration}
            onBack={onBack}
          />
        </div>

        {/* Right Panel - Editor Canvas */}
        <div className={`flex flex-col bg-gray-50 transition-all duration-300 ${
          // Desktop: hide when not editing, Mobile: show based on mobileView
          currentStep === 'editing'
            ? `${mobileView === 'editor' ? 'flex-1' : 'hidden'} lg:flex-1`
            : 'flex-1 hidden lg:flex'
        }`}>
          {/* Editor Content */}
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
              onSaveAsTemplate={user ? handleSaveAsTemplate : undefined}
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
    </div>
  )
}