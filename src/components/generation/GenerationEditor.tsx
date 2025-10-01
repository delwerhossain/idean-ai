'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { FileText, Edit, Wand2, Copy, Eye, Download, ChevronDown, BookmarkPlus, MessageSquare, X, Send, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'
import { SaveTemplateDialog } from './SaveTemplateDialog'
import { DocumentHistoryPanel } from './DocumentHistoryPanel'
import { ChatConversationView } from './ChatConversationView'
import { ideanApi } from '@/lib/api/idean-api'
import './text-regeneration.css'

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
  currentStep: 'input' | 'generating' | 'editing'
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
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [viewMode, setViewMode] = useState<'editor' | 'conversation'>('conversation')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isChatRegenerating, setIsChatRegenerating] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
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
      // Switch to conversation view when user sends a message
      setViewMode('conversation')
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
        // Auto-resize textarea
        chatInputRef.current.style.height = 'auto'
        chatInputRef.current.style.height = chatInputRef.current.scrollHeight + 'px'
      }
    }, 10)
  }

  // Handle chat send
  const handleChatSend = () => {
    if (chatInput.trim()) {
      handleChatRegenerate(chatInput.trim())
      // Reset textarea height after sending
      setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.style.height = 'auto'
        }
      }, 100)
    }
  }

  // Handle history view
  const handleViewHistory = (item: any) => {
    setEditorContent(item.output_content)
    onContentChange?.(item.output_content)
  }

  // Handle history download
  const handleDownloadHistory = (item: any, format: 'txt' | 'md' | 'pdf') => {
    const content = item.output_content
    const filename = `${item.name}-${new Date(item.createdAt).toISOString().split('T')[0]}`

    switch (format) {
      case 'txt':
        const txtBlob = new Blob([content], { type: 'text/plain' })
        const txtUrl = URL.createObjectURL(txtBlob)
        const txtLink = document.createElement('a')
        txtLink.href = txtUrl
        txtLink.download = `${filename}.txt`
        txtLink.click()
        URL.revokeObjectURL(txtUrl)
        break
      case 'md':
        const mdBlob = new Blob([content], { type: 'text/markdown' })
        const mdUrl = URL.createObjectURL(mdBlob)
        const mdLink = document.createElement('a')
        mdLink.href = mdUrl
        mdLink.download = `${filename}.md`
        mdLink.click()
        URL.revokeObjectURL(mdUrl)
        break
      case 'pdf':
        // Use existing PDF export functionality
        handleExportPDF()
        break
    }
  }

  // Simplified text selection handling for basic editing
  const handleTextSelection = () => {
    // Only basic selection handling needed now since we use chat interface
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) {
      console.log('Text selected:', selection.toString().substring(0, 50))
    }
  }

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editorContent)
      console.log('Content copied to clipboard')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Simple event handlers for basic editor functionality
  const handleEditorMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleTextSelection()
  }

  const handleEditorKeyUp = (e: React.KeyboardEvent) => {
    if (e.shiftKey || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      handleTextSelection()
    }
  }

  // Export handlers
  const handleExportMarkdown = () => {
    if (!editorContent.trim()) {
      console.warn('No content to export')
      return
    }

    try {
      // Create formatted markdown content with metadata
      const markdownContent = `# ${framework.name}

*Generated on: ${new Date().toLocaleString()}*
*Word count: ${editorContent.split(' ').filter(w => w.trim()).length} words*

---

${editorContent}`

      const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${framework.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Failed to export markdown:', error)
      alert('Failed to export markdown file. Please try again.')
    }
  }

  const handleExportPDF = async () => {
    if (!editorContent.trim()) {
      console.warn('No content to export')
      return
    }

    try {
      console.log('Starting PDF export...')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Basic settings
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      let yPosition = 30

      // Add title
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text(framework.name, margin, yPosition)
      yPosition += 15

      // Add metadata
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
      yPosition += 6

      const wordCount = editorContent.split(/\s+/).filter(w => w.trim()).length
      pdf.text(`Words: ${wordCount}`, margin, yPosition)
      yPosition += 15

      // Add separator
      pdf.setDrawColor(200)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      // Simple content processing
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(0)

      const processContent = (text: string) => {
        const lines = text.split('\n')

        for (let line of lines) {
          if (!line.trim()) {
            yPosition += 5
            continue
          }

          // Check page break
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 30
          }

          // Handle headers
          if (line.startsWith('# ')) {
            pdf.setFontSize(16)
            pdf.setFont('helvetica', 'bold')
            const headerText = line.substring(2)
            const wrappedLines = pdf.splitTextToSize(headerText, contentWidth)
            wrappedLines.forEach((wrappedLine: string) => {
              pdf.text(wrappedLine, margin, yPosition)
              yPosition += 8
            })
            yPosition += 5
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'normal')
          } else if (line.startsWith('## ')) {
            pdf.setFontSize(14)
            pdf.setFont('helvetica', 'bold')
            const headerText = line.substring(3)
            const wrappedLines = pdf.splitTextToSize(headerText, contentWidth)
            wrappedLines.forEach((wrappedLine: string) => {
              pdf.text(wrappedLine, margin, yPosition)
              yPosition += 7
            })
            yPosition += 3
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'normal')
          } else if (line.startsWith('### ')) {
            pdf.setFontSize(12)
            pdf.setFont('helvetica', 'bold')
            const headerText = line.substring(4)
            const wrappedLines = pdf.splitTextToSize(headerText, contentWidth)
            wrappedLines.forEach((wrappedLine: string) => {
              pdf.text(wrappedLine, margin, yPosition)
              yPosition += 6
            })
            yPosition += 2
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'normal')
          } else if (line.match(/^[-*+]\s/)) {
            // Bullet list
            const listText = line.replace(/^[-*+]\s/, '')
            pdf.text('•', margin + 5, yPosition)
            const wrappedLines = pdf.splitTextToSize(listText, contentWidth - 15)
            wrappedLines.forEach((wrappedLine: string, idx: number) => {
              pdf.text(wrappedLine, margin + 15, yPosition)
              if (idx < wrappedLines.length - 1) yPosition += 5
            })
            yPosition += 6
          } else {
            // Regular text - remove markdown formatting for simple display
            const cleanText = line
              .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
              .replace(/\*(.*?)\*/g, '$1')     // Remove italic
              .replace(/`(.*?)`/g, '$1')       // Remove code

            const wrappedLines = pdf.splitTextToSize(cleanText, contentWidth)
            wrappedLines.forEach((wrappedLine: string) => {
              pdf.text(wrappedLine, margin, yPosition)
              yPosition += 5
            })
            yPosition += 2
          }
        }
      }

      processContent(editorContent)

      // Generate filename
      const sanitizedName = framework.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 30)

      const filename = `${sanitizedName}-${new Date().toISOString().split('T')[0]}.pdf`

      console.log('Saving PDF:', filename)
      pdf.save(filename)
      console.log('PDF export completed successfully')

    } catch (error) {
      console.error('PDF export error:', error)
      alert(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleExport = (format: 'pdf' | 'markdown' | 'docx' | 'html') => {
    console.log('handleExport called with format:', format)

    if (!editorContent.trim()) {
      console.warn('No content to export')
      return
    }

    // Use external export handler if provided, otherwise use internal methods
    if (onExport) {
      console.log('Using external export handler')
      onExport(format)
      return
    }

    console.log('Using internal export handler')
    switch (format) {
      case 'markdown':
        console.log('Calling handleExportMarkdown')
        handleExportMarkdown()
        break
      case 'pdf':
        console.log('Calling handleExportPDF')
        handleExportPDF()
        break
      default:
        console.warn(`Export format ${format} not supported`)
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
            <Edit className="w-4 h-4" />
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
      {/* Fixed Save Button - Top Right */}
      {onSaveAsTemplate && hasContent && (
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
          className="fixed top-4 right-4 z-50 shadow-lg bg-gray-900 hover:bg-gray-800 text-white"
        >
          <BookmarkPlus className="w-4 h-4 mr-2" />
          Save Template
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
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-3xl mx-auto px-4 py-4">
              {/* Suggestion Chips */}
              {hasContent && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
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
                        className="px-2.5 py-1 text-xs font-medium bg-gray-50 hover:bg-gray-100
                                 text-gray-700 rounded-lg border border-gray-200 transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value)
                      // Auto-resize textarea
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleChatSend()
                      }
                    }}
                    placeholder={hasContent ? "Message to refine content..." : "Generate content first"}
                    disabled={isChatRegenerating || !hasContent}
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl bg-white
                             text-sm placeholder-gray-500 focus:outline-none focus:ring-2
                             focus:ring-gray-400 focus:border-transparent resize-none
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
                             max-h-[200px] overflow-y-auto"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                <Button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || isChatRegenerating || !hasContent}
                  size="sm"
                  className="h-11 w-11 p-0 bg-gray-900 hover:bg-gray-800 text-white rounded-xl
                           disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isChatRegenerating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Mode - Kept for potential future use but hidden */}
      {false && isPreviewMode && (
            <div ref={printRef} className="p-6 sm:p-8 h-full  mt-1 rounded-2xl ">
              {/* Print Header - Hidden on screen, visible when printing */}
              <div className="print:block hidden mb-8 text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-900">{framework.name}</h1>
                <p className="text-gray-600 mt-2">Generated on {new Date().toLocaleString()}</p>
                <p className="text-gray-500 text-sm">
                  {wordCount} words • {charCount} characters • {lineCount} lines
                </p>
              </div>

              <div className="prose max-w-none h-auto">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-6">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-medium text-gray-700 mb-2 mt-4">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
                        {children}
                      </ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-500 bg-purple-50 p-4 italic text-purple-900 mb-4">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-purple-600">
                        {children}
                      </code>
                    )
                  }}
                >
                  {editorContent || '# No content yet\n\nStart typing to see the preview...'}
                </ReactMarkdown>
              </div>
            </div>
          )}

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
        />
      )}

    </div>
  )
}