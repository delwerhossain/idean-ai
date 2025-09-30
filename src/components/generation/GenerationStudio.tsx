'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { GenerationInputPanel } from './GenerationInputPanel'
import { GenerationEditor } from './GenerationEditor'
import { ideanApi, Template } from '@/lib/api/idean-api'
import { Button } from '@/components/ui/button'
import TutorialModal from '@/components/modals/TutorialModal'
import { Sparkles } from 'lucide-react'

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
  template?: Template | null
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
  documentHistory?: Array<{
    id: string
    name: string
    output_content: string
    createdAt: string
    user_request?: string
    generation_type?: string
  }>
}

export function GenerationStudio({ type, framework, template, onBack }: GenerationStudioProps) {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState<'input' | 'generating' | 'editing'>('input')
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [mobileView, setMobileView] = useState<'input' | 'editor'>('input')
  const [retryCount, setRetryCount] = useState(0)
  const [showTutorialModal, setShowTutorialModal] = useState(false)
  // Initialize generation options with template data if available
  const [generationOptions, setGenerationOptions] = useState(() => {
    const defaultOptions = {
      tone: 'professional',
      length: 'medium',
      audience: 'business',
      temperature: 0.7,
      maxTokens: 2000,
      includeBusinessContext: true,
      saveDocument: true
    }

    // Load dropdown selections from template if available
    if (template?.drop_down) {
      const dropDownOptions = template.drop_down
      return {
        ...defaultOptions,
        tone: dropDownOptions[0] || defaultOptions.tone,
        length: dropDownOptions[1] || defaultOptions.length,
        audience: dropDownOptions[2] || defaultOptions.audience
      }
    }

    return defaultOptions
  })

  // Initialize inputs based on framework fields and template data
  useEffect(() => {
    const initialInputs: Record<string, any> = {}

    if (framework.input_fields) {
      framework.input_fields.forEach((field, index) => {
        const fieldName = field.includes(':') ? field.split(':')[0] : field

        // Use template data if available
        if (template?.text_input_given && template.text_input_given[index]) {
          initialInputs[fieldName] = template.text_input_given[index]
        } else {
          initialInputs[fieldName] = ''
        }
      })
    }

    // Load template's additional prompt if available
    if (template?.user_given_prompt) {
      initialInputs.additionalInstructions = template.user_given_prompt
    }

    console.log('🎨 Initialized inputs:', template ? 'with template data' : 'without template', initialInputs)
    setInputs(initialInputs)
  }, [framework, template])

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
          },
          documentHistory: response.data.documentHistory || []
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

  // Handle document history updates from chat regeneration
  const handleHistoryUpdate = (newHistory: Array<{
    id: string
    name: string
    output_content: string
    createdAt: string
    user_request?: string
    generation_type?: string
  }>) => {
    console.log('📁 Updating document history in GenerationStudio:', newHistory.length, 'items')
    if (generationResult) {
      setGenerationResult({
        ...generationResult,
        documentHistory: newHistory
      })
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

  // Handle updating existing template with new content
  const handleUpdateTemplate = async () => {
    if (!template || !framework || !generationResult?.content || !user) {
      console.error('Missing required data for template update')
      return
    }

    try {
      console.log('Updating template:', template.id)

      // Transform current inputs to match backend format
      const inputFields = framework.input_fields || []
      const text_input_queries: string[] = []
      const text_input_given: string[] = []

      // Extract field names and values from current inputs
      inputFields.forEach(field => {
        const fieldName = field.includes(':') ? field.split(':')[0] : field
        text_input_queries.push(fieldName)
        text_input_given.push(inputs[fieldName] || '')
      })

      // Transform current dropdown selections
      const drop_down: string[] = [
        generationOptions.tone,
        generationOptions.length,
        generationOptions.audience
      ].filter(Boolean)

      const updateData = {
        name: template.name, // Keep existing name
        user_given_prompt: inputs.additionalInstructions || template.user_given_prompt || `Updated template for ${framework.name}`,
        text_input_queries,
        text_input_given,
        drop_down,
        documentIds: generationResult.documentId ? [generationResult.documentId] : template.documentIds || []
      }

      await ideanApi.templates.update(template.id, updateData)

      // Show success message
      alert(`Template "${template.name}" updated successfully!`)
    } catch (error) {
      console.error('❌ Failed to update template:', error)
      alert('Failed to update template. Please try again.')
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Template Header - Show when loaded from template */}
      {template && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">🎨 Using Template: {template.name}</h3>
                <p className="text-xs text-blue-600">Modify the inputs below and regenerate to update your template</p>
              </div>
            </div>
            <Button
              onClick={handleUpdateTemplate}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Save Template Changes
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Navigation Bar - Compact Design */}
      {currentStep === 'editing' && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-3 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700 truncate flex-1">{framework.name}</h2>

            {/* Compact Toggle */}
            <div className="flex items-center bg-gray-100 rounded-full p-0.5">
              <button
                onClick={() => setMobileView('input')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  mobileView === 'input'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Input
              </button>
              <button
                onClick={() => setMobileView('editor')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  mobileView === 'editor'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 lg:flex-row h-full min-h-0">
        {/* Left Panel - Input Form - Reduced width for more content space */}
        <div className={`w-full lg:w-96 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
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
            onShowTutorial={() => setShowTutorialModal(true)}
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
              documentId={generationResult?.documentId}
              userInputs={inputs}
              userSelections={{
                tone: generationOptions.tone,
                length: generationOptions.length,
                audience: generationOptions.audience
              }}
              documentHistory={generationResult?.documentHistory || []}
              onHistoryUpdate={handleHistoryUpdate}
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

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        title="How to Generate Content with AI"
        subtitle="Step-by-step guide to creating compelling content"
        icon={<Sparkles className="w-8 h-8" />}
        steps={[
          {
            title: 'Fill in the Input Fields',
            description: 'Provide details about your product, target audience, and key benefits. The more specific you are, the better the AI-generated content will be.'
          },
          {
            title: 'Customize Generation Options',
            description: 'Adjust tone, length, and audience settings. Advanced users can fine-tune creativity level and token limits for precise control.'
          },
          {
            title: 'Generate Your Content',
            description: 'Click the Generate button and watch as AI creates professional content following your selected framework and inputs.'
          },
          {
            title: 'Edit and Refine',
            description: 'Review the generated content, make edits, regenerate specific sections, and export when satisfied with the results.'
          }
        ]}
        ctaText="Got it, Let's Generate Content!"
      />
    </div>
  )
}