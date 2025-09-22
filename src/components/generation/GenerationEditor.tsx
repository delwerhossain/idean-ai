'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isChatRegenerating, setIsChatRegenerating] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditorContent(content)
  }, [content])

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
    // Focus the input after setting the text
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.focus()
        chatInputRef.current.setSelectionRange(suggestion.length, suggestion.length)
      }
    }, 10)
  }

  // Handle chat send
  const handleChatSend = () => {
    if (chatInput.trim()) {
      handleChatRegenerate(chatInput.trim())
    }
  }

  // Handle chat input key press
  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleChatSend()
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
    <div className="h-full bg-white flex flex-col">
      {/* Top Toolbar - Compact */}
      <div className="bg-white border-b px-3 sm:px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: View Mode Toggle */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant={!isPreviewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPreviewMode(false)}
              className="h-8 px-2 sm:px-3"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline sm:ml-2">Edit</span>
            </Button>
            <Button
              variant={isPreviewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPreviewMode(true)}
              className="h-8 px-2 sm:px-3"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline sm:ml-2">Preview</span>
            </Button>
          </div>

       
         

          {/* Right: Action Buttons - Compact */}
          <div className="flex items-center gap-1">

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="h-8 px-2"
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline lg:ml-2">Copy</span>
            </Button>

            {onSaveAsTemplate && hasContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="h-8 px-2"
              >
                <BookmarkPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden lg:inline lg:ml-2">Save</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateAll}
              disabled={isGenerating || !hasContent}
              className="h-8 px-2"
            >
              <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden lg:inline lg:ml-2">Regen</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasContent}
                  className="h-8 px-2"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden lg:inline lg:ml-2">Export</span>
                  <ChevronDown className="w-2 h-2 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExportPDF()} disabled={!hasContent}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('markdown')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* History Button Bar - Always visible when history exists */}
      {documentHistory.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <History className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{documentHistory.length} versions available</span>
            </div>
            <Button
              variant={showHistory ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={`h-8 px-4 ${
                showHistory
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "border-blue-300 text-blue-700 hover:bg-blue-50"
              } transition-all`}
            >
              <History className="w-4 h-4 mr-2" />
              {showHistory ? 'Hide History' : 'View History'}
            </Button>
          </div>
        </div>
      )}

      {/* Content Display */}
      <div className=" mb-5 flex-1 overflow-auto min-h-0">
        <div className="max-w-5xl mx-auto h-full">
          {isPreviewMode ? (
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
          ) : (
            <div className="p-6 sm:p-8 h-full relative">
              {/* Loading Overlay for Chat Regeneration */}
              {isChatRegenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <MessageSquare className="w-6 h-6 text-gray-600" />
                    </div>
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-700 font-medium">Regenerating content with your feedback...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                  </div>
                </div>
              )}

              <Card className="h-full flex flex-col">
                <div
                  ref={editorRef}
                  className="w-full flex-1 min-h-0 p-4 border-0 resize-none focus:outline-none font-mono text-sm leading-relaxed bg-transparent overflow-auto select-text pb-20 mb-10"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => handleContentEdit(e.currentTarget.textContent || '')}
                  onMouseUp={handleEditorMouseUp}
                  onKeyUp={handleEditorKeyUp}
                  style={{
                    whiteSpace: 'pre-wrap',
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                    MozUserSelect: 'text',
                    msUserSelect: 'text'
                  }}
                >
                  {editorContent || "Generated content will appear here..."}
                </div>

                {/* Always Visible Chat Interface */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                  {/* Suggestion Chips */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
                      {[
                        'Make it more urgent',
                        'Add scarcity',
                        'Make it more friendly',
                        'More professional tone',
                        'Make it shorter',
                        'Add more details',
                        'More emotional appeal',
                        'Focus on benefits'
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isChatRegenerating || !hasContent}
                          className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200
                                   text-gray-700 rounded-full border border-gray-200 transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          ref={chatInputRef}
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={handleChatKeyPress}
                          placeholder={hasContent ? "Type your feedback to regenerate the content..." : "Generate content first to use chat"}
                          disabled={isChatRegenerating || !hasContent}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-white
                                   text-sm placeholder-gray-500 focus:outline-none focus:ring-2
                                   focus:ring-gray-500 focus:border-transparent
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <Button
                        onClick={handleChatSend}
                        disabled={!chatInput.trim() || isChatRegenerating || !hasContent}
                        size="sm"
                        className="h-12 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChatRegenerating ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span className="ml-2 hidden sm:inline">Send</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Document History Panel - Side panel overlay */}
              {showHistory && documentHistory.length > 0 && (
                <div className="absolute top-0 right-0 bottom-0 w-96 z-40">
                  <DocumentHistoryPanel
                    history={documentHistory}
                    onViewHistory={handleViewHistory}
                    onDownloadHistory={handleDownloadHistory}
                    onClose={() => setShowHistory(false)}
                    currentContent={editorContent}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Bar - Compact */}
      <div className="border-t bg-gray-50 px-3 sm:px-4 py-1.5 sm:py-2">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            {wordCount} words • {charCount} chars • {lineCount} lines
          </div>
        </div>
      </div>

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