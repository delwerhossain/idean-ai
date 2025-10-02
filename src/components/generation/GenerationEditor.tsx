'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { FileText, Wand2, BookmarkPlus, MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SaveTemplateDialog } from './SaveTemplateDialog'
import { ChatConversationView } from './ChatConversationView'
import { ideanApi } from '@/lib/api/idean-api'

interface Framework {
  id: string
  name: string
  description?: string
}

interface TextSelection {
  text: string
  start: number
  end: number
  rect: DOMRect
}

interface GenerationOptions {
  temperature: number
  maxTokens: number
}

interface GenerationEditorProps {
  content: string
  isGenerating: boolean
  currentStep: 'input' | 'generating' | 'Chating'
  framework: Framework
  onRegenerateSection?: (sectionText: string) => void
  onContentChange?: (content: string) => void
  onRegenerateAll?: () => void
  hasContent?: boolean
  onExport?: (format: 'pdf' | 'markdown' | 'docx' | 'html') => void
  onSaveAsTemplate?: (data: { name: string; description?: string }) => Promise<void>
  documentId?: string
  userInputs?: Record<string, any>
  userSelections?: Record<string, any>
  documentHistory?: Array<{
    id: string
    name: string
    output_content: string
    createdAt: string
    user_request?: string
    generation_type?: string
  }>
  onHistoryUpdate?: (history: Array<{
    id: string
    name: string
    output_content: string
    createdAt: string
    user_request?: string
    generation_type?: string
  }>) => void
}

export function GenerationEditor({
  content,
  isGenerating,
  currentStep,
  framework,
  onRegenerateSection,
  onContentChange,
  onRegenerateAll,
  hasContent = false,
  onExport,
  onSaveAsTemplate,
  documentId,
  userInputs = {},
  userSelections = {},
  documentHistory = [],
  onHistoryUpdate
}: GenerationEditorProps) {
  const [editorContent, setEditorContent] = useState(content)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isChatRegenerating, setIsChatRegenerating] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditorContent(content)
  }, [content])

  // Transform document history into conversation messages
  const conversationMessages = useMemo(() => {
    const messages: Array<{
      id: string
      type: 'ai' | 'user'
      content: string
      timestamp: string
      metadata?: {
        wordCount?: number
        charCount?: number
      }
    }> = []

    // If we have document history, use that
    if (documentHistory && documentHistory.length > 0) {
      documentHistory.forEach((item, index) => {
        // Add user request as user message (if exists and not initial generation)
        if (item.user_request && item.generation_type === 'feedback_regeneration') {
          messages.push({
            id: `${item.id}-user`,
            type: 'user',
            content: item.user_request,
            timestamp: item.createdAt
          })
        }

        // Add AI response
        messages.push({
          id: item.id,
          type: 'ai',
          content: item.output_content,
          timestamp: item.createdAt,
          metadata: {
            wordCount: item.output_content.split(/\s+/).filter(w => w.trim()).length,
            charCount: item.output_content.length
          }
        })
      })
    } else if (editorContent && editorContent.trim()) {
      // If no history but we have content, show it as first AI message
      messages.push({
        id: 'initial',
        type: 'ai',
        content: editorContent,
        timestamp: new Date().toISOString(),
        metadata: {
          wordCount: editorContent.split(/\s+/).filter(w => w.trim()).length,
          charCount: editorContent.length
        }
      })
    }

    return messages
  }, [documentHistory, editorContent])

  const handleContentEdit = (newContent: string) => {
    setEditorContent(newContent)
    onContentChange?.(newContent)
  }

  // Handle chat-based regeneration
  const handleChatRegenerate = async (userMessage: string) => {
    if (!framework || !userMessage.trim()) {
      console.error('Missing framework or user message for chat regeneration')
      return
    }

    try {
      setIsChatRegenerating(true)
      console.log('🔄 Starting chat-based regeneration with:', {
        userMessage: userMessage.substring(0, 100),
        documentId,
        framework: framework.name
      })

      // Call the new chat regeneration API
      const response = await ideanApi.copywriting.chatRegenerate(framework.id, {
        userMessage,
        documentId,
        userInputs,
        userSelections,
        businessContext: true,
        includeHistory: true,
        generationOptions: {
          temperature: 0.7,
          maxTokens: 2000,
          topP: 0.9
        }
      })

      console.log('✅ Chat regeneration API Response:', response)

      if (response.success && response.data?.regeneratedContent) {
        const newContent = response.data.regeneratedContent.trim()
        console.log('📝 Updating content with regenerated text:', newContent.substring(0, 100))

        // Update the editor content
        setEditorContent(newContent)
        onContentChange?.(newContent)

        // Update document history if available
        if (response.data.documentHistory && onHistoryUpdate) {
          console.log('📁 Document history updated:', response.data.documentHistory.length, 'items')
          onHistoryUpdate(response.data.documentHistory)
        }

        // Clear chat input
        setChatInput('')
      } else {
        throw new Error(response.message || 'No regenerated content received')
      }
    } catch (error: any) {
      console.error('❌ Chat regeneration failed:', error)
      alert(`Regeneration failed: ${error.message || 'Unknown error'}`)
    } finally {
      setIsChatRegenerating(false)
    }
  }

  // Focus chat input
  const focusChatInput = () => {
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.focus()
      }
    }, 100)
  }

  // Handle suggestion chip click
  const handleSuggestionClick = (suggestion: string) => {
    setChatInput(suggestion)
    // Focus the input after setting the text and auto-resize
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.focus()
        chatInputRef.current.setSelectionRange(suggestion.length, suggestion.length)
        // Auto-resize textarea with overflow management
        chatInputRef.current.style.height = 'auto'
        const newHeight = Math.min(chatInputRef.current.scrollHeight, 200)
        chatInputRef.current.style.height = newHeight + 'px'
        chatInputRef.current.style.overflowY = chatInputRef.current.scrollHeight > 200 ? 'auto' : 'hidden'
      }
    }, 10)
  }

  // Handle chat send
  const handleChatSend = () => {
    if (chatInput.trim()) {
      handleChatRegenerate(chatInput.trim())
      // Reset textarea height and overflow after sending
      setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.style.height = 'auto'
          chatInputRef.current.style.overflowY = 'hidden'
        }
      }, 100)
    }
  }


  if (currentStep === 'input') {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to Generate Content
          </h3>
          <p className="text-gray-600 mb-6">
            Fill in the details on the left and click "Generate Content" to create your {framework.name.toLowerCase()}.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>Editor ready</span>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 'generating') {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wand2 className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating Your Content
          </h3>
          <p className="text-gray-600 mb-6">
            AI is crafting your {framework.name.toLowerCase()} using the latest marketing frameworks and your specific requirements.
          </p>
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-500">This may take 15-30 seconds...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!editorContent.trim()) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Content Generated
          </h3>
          <p className="text-gray-600 mb-6">
            Something went wrong during generation. Please try again with your inputs.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Wand2 className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const wordCount = editorContent.split(' ').filter(w => w.trim()).length
  const charCount = editorContent.length
  const lineCount = editorContent.split('\n').length

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Fixed Save Button - Desktop Only (mobile uses header button) */}
      {onSaveAsTemplate && hasContent && (
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
          className="hidden lg:flex fixed top-4 right-4 z-[100] shadow-lg
                   bg-idean-blue hover:bg-idean-blue-dark text-white transition-colors
                   h-10 w-auto px-3 rounded-lg"
        >
          <BookmarkPlus className="w-4 h-4 mr-2" />
          <span className="text-sm">Save Template</span>
        </Button>
      )}

      {/* Content Display */}
      <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
        {/* Conversation View - ChatGPT Style */}
        <div className="h-full flex flex-col relative">
          {/* Loading Overlay for Chat Regeneration */}
          {isChatRegenerating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <MessageSquare className="w-6 h-6 text-gray-600" />
                </div>
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-700 font-medium">Generating response...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            </div>
          )}

          {/* Chat Messages - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <ChatConversationView messages={conversationMessages} />
          </div>

          {/* Chat Input Section - Fixed at bottom, centered with max-width */}
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="max-w-3xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
              {/* Suggestion Chips */}
              {hasContent && (
                <div className="mb-2 sm:mb-3">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {[
                      'Add scarcity',
                      'More friendly',
                      'Professional',
                      'Shorter',
                      'More details',
                      'Emotional',
                      'Benefits'
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isChatRegenerating || !hasContent}
                        className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium
                                 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200
                                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="flex items-end gap-1.5 sm:gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value)
                      // Auto-resize textarea with smooth scrollbar appearance
                      const target = e.target
                      target.style.height = 'auto'
                      const newHeight = Math.min(target.scrollHeight, 200)
                      target.style.height = newHeight + 'px'
                      // Only show scrollbar when content exceeds max height
                      target.style.overflowY = target.scrollHeight > 200 ? 'auto' : 'hidden'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleChatSend()
                      }
                    }}
                    placeholder={hasContent ? "Message to refine..." : "Generate first"}
                    disabled={isChatRegenerating || !hasContent}
                    rows={1}
                    className="w-full px-2.5 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl sm:rounded-2xl bg-white
                             text-xs sm:text-sm placeholder-gray-500 focus:outline-none focus:ring-2
                             focus:ring-gray-400 focus:border-transparent resize-none
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
                             transition-all duration-150 ease-in-out"
                    style={{ minHeight: '38px', maxHeight: '200px', overflowY: 'hidden' }}
                  />
                </div>

                <Button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || isChatRegenerating || !hasContent}
                  size="sm"
                  className="h-[38px] w-[38px] sm:h-11 sm:w-11 p-0 bg-idean-blue hover:bg-idean-blue-dark
                           text-white rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed
                           flex-shrink-0 transition-colors"
                >
                  {isChatRegenerating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar - Compact */}
      {/* <div className="border-t bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            {wordCount} words • {charCount} chars • {lineCount} lines
          </div>
        </div>
      </div> */}

      {/* Save Template Dialog */}
      {onSaveAsTemplate && (
        <SaveTemplateDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          onSave={onSaveAsTemplate}
          frameworkName={framework.name}
          initialAdditionalInstructions={userInputs?.additionalInstructions || ''}
        />
      )}

    </div>
  )
}