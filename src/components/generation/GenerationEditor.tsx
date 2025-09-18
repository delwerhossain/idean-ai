'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Edit, Wand2, Copy, Eye, Download, ChevronDown, BookmarkPlus } from 'lucide-react'
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
import { FloatingRegenerateToolbar } from './FloatingRegenerateToolbar'
import { RegeneratePromptModal } from './RegeneratePromptModal'
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
  documentId
}: GenerationEditorProps) {
  const [editorContent, setEditorContent] = useState(content)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [textSelection, setTextSelection] = useState<TextSelection | null>(null)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditorContent(content)
  }, [content])

  const handleContentEdit = (newContent: string) => {
    setEditorContent(newContent)
    onContentChange?.(newContent)
  }

  // Handle text selection for regeneration - improved version
  const handleTextSelection = () => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection()

      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setTextSelection(null)
        return
      }

      const range = selection.getRangeAt(0)
      const selectedText = selection.toString().trim()

      // Must have actual text and be within our editor
      if (!selectedText || selectedText.length < 3) {
        setTextSelection(null)
        return
      }

      // Check if selection is within our editor
      const editorElement = editorRef.current
      if (!editorElement) {
        setTextSelection(null)
        return
      }

      // More robust check for selection within editor
      let isWithinEditor = false
      try {
        isWithinEditor = editorElement.contains(range.commonAncestorContainer) ||
                        editorElement === range.commonAncestorContainer
      } catch (e) {
        setTextSelection(null)
        return
      }

      if (!isWithinEditor) {
        setTextSelection(null)
        return
      }

      const rect = range.getBoundingClientRect()

      // Debug logging
      console.log('Selection debug:', {
        selectedText: selectedText.substring(0, 50),
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom,
          right: rect.right
        },
        scrollY: window.scrollY,
        scrollX: window.scrollX
      })

      // Ensure we have a valid rect
      if (rect.width === 0 && rect.height === 0) {
        console.log('Invalid rect detected, selection cancelled')
        setTextSelection(null)
        return
      }

      // Ensure rect is actually visible (not completely off-screen)
      if (rect.bottom < 0 || rect.top > window.innerHeight ||
          rect.right < 0 || rect.left > window.innerWidth) {
        console.log('Selection rect is off-screen')
        setTextSelection(null)
        return
      }

      // Calculate text positions more accurately
      let start = 0
      let end = selectedText.length

      try {
        const beforeRange = document.createRange()
        beforeRange.setStart(editorElement, 0)
        beforeRange.setEnd(range.startContainer, range.startOffset)
        start = beforeRange.toString().length
        end = start + selectedText.length
        beforeRange.detach()
      } catch (e) {
        // Fallback calculation
        const fullText = editorElement.textContent || ''
        start = fullText.indexOf(selectedText)
        end = start + selectedText.length
      }

      const newSelection = {
        text: selectedText,
        start: Math.max(0, start),
        end: Math.max(selectedText.length, end),
        rect: {
          ...rect,
          // Add some padding for better positioning
          top: rect.top - 5,
          left: rect.left,
          width: rect.width,
          height: rect.height + 5
        } as DOMRect
      }

      setTextSelection(newSelection)

      console.log('✅ Text selection successfully set:', {
        text: selectedText.substring(0, 50) + (selectedText.length > 50 ? '...' : ''),
        length: selectedText.length,
        hasSelection: !!newSelection.text
      })
    }, 50) // Small delay to ensure selection is stable
  }

  // Handle regenerate toolbar click
  const handleRegenerateToolbarClick = (selectedText: string, start: number, end: number) => {
    console.log('🎯 Toolbar clicked with:', {
      selectedText: selectedText.substring(0, 50) + '...',
      textSelectionState: textSelection?.text?.substring(0, 50) + '...',
      hasTextSelection: !!textSelection
    })

    // Ensure we have a valid text selection before opening modal
    if (!textSelection || !textSelection.text) {
      console.error('❌ No text selection available for regeneration')
      return
    }

    setShowRegenerateModal(true)
  }

  // Handle regeneration with custom instruction
  const handleRegenerateWithInstruction = async (instruction: string, options: GenerationOptions) => {
    if (!textSelection) {
      console.error('No text selection found')
      return
    }

    try {
      setIsRegenerating(true)
      console.log('🔄 Starting regeneration with:', {
        selectedText: textSelection.text.substring(0, 100),
        instruction,
        options
      })

      // Call the regenerate specific API
      const response = await ideanApi.copywriting.regenerateSpecific(framework.id, {
        documentText: textSelection.text, // Send only the selected text
        userInstruction: instruction,
        documentId,
        saveDocument: true,
        generationOptions: {
          temperature: options.temperature,
          maxTokens: options.maxTokens
        }
      })

      console.log('✅ API Response:', response)

      if (response.success && response.data?.modifiedContent) {
        // Extract the modified content, removing document markers if present
        let modifiedContent = response.data.modifiedContent

        // Remove document start/end markers
        modifiedContent = modifiedContent
          .replace(/^===== DOCUMENT START =====\n?/g, '')
          .replace(/\n?===== DOCUMENT END =====$/g, '')
          .trim()

        console.log('📝 Extracted modified content:', modifiedContent.substring(0, 100))

        // Replace only the selected text with the new content
        await replaceSelectedText(modifiedContent)

        // Close modal and clear selection
        setShowRegenerateModal(false)
        setTextSelection(null)
      } else {
        throw new Error('No modified content received from API')
      }
    } catch (error: any) {
      console.error('❌ Regeneration failed:', error)
      // You could show an error toast here
      alert(`Regeneration failed: ${error.message || 'Unknown error'}`)
    } finally {
      setIsRegenerating(false)
    }
  }

  // Function to replace only the selected text with new content
  const replaceSelectedText = async (newContent: string) => {
    if (!textSelection || !editorRef.current) {
      console.error('Missing selection or editor ref for text replacement')
      return
    }

    try {
      const { text: oldText, start, end } = textSelection
      const currentContent = editorContent

      console.log('🔀 Replacing text:', {
        oldText: oldText.substring(0, 50) + '...',
        newContent: newContent.substring(0, 50) + '...',
        positions: { start, end }
      })

      // Create new content by replacing the selected portion
      let updatedContent: string

      if (start >= 0 && end > start) {
        // Use position-based replacement
        updatedContent = currentContent.substring(0, start) + newContent + currentContent.substring(end)
      } else {
        // Fallback: use text-based replacement
        updatedContent = currentContent.replace(oldText, newContent)
      }

      // Animate the replacement with smooth transition
      await animateTextReplacement(updatedContent)

      console.log('✅ Text replacement completed')
    } catch (error) {
      console.error('❌ Error during text replacement:', error)
      throw error
    }
  }

  // Simplified and reliable text replacement animation
  const animateTextReplacement = async (newContent: string) => {
    if (!editorRef.current) return

    try {
      // Add subtle pulse animation to indicate change
      editorRef.current.classList.add('animate-pulse-highlight')

      // Wait for animation start
      await new Promise(resolve => setTimeout(resolve, 150))

      // Update content
      setEditorContent(newContent)
      onContentChange?.(newContent)

      // Clear any existing selection
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
      }

      // Add success glow effect
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.classList.remove('animate-pulse-highlight')
          editorRef.current.classList.add('success-glow')

          // Clean up after success animation
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.classList.remove('success-glow')
            }
          }, 1000)
        }
      }, 300)
    } catch (error) {
      console.error('Animation error:', error)
      // Still update content even if animation fails
      setEditorContent(newContent)
      onContentChange?.(newContent)
    }
  }

  // Enhanced selection handling with better event management
  const handleEditorMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleTextSelection()
  }

  const handleEditorKeyUp = (e: React.KeyboardEvent) => {
    // Handle keyboard selection (Shift+Arrow keys, etc.)
    if (e.shiftKey || e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      handleTextSelection()
    }
  }

  const handleEditorFocus = () => {
    // Don't clear selection when modal is open
    if (showRegenerateModal) {
      console.log('🚫 Preserving selection on focus - modal is open')
      return
    }

    // Clear selection when editor gets focus if no valid selection
    setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        console.log('🗑️ Clearing selection on focus - no valid selection')
        setTextSelection(null)
      }
    }, 100)
  }

  // Clear selection when clicking outside editor (but preserve for modal)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Don't clear selection if modal is open
      if (showRegenerateModal) {
        console.log('🚫 Preserving selection - modal is open')
        return
      }

      // Don't clear selection if clicking on toolbar or modal elements
      const target = e.target as Element
      if (target.closest('[data-floating-toolbar]') ||
          target.closest('[data-regenerate-modal]') ||
          target.closest('[role="dialog"]')) {
        console.log('🚫 Preserving selection - clicked on UI element')
        return
      }

      // Only clear if clicking outside the editor
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        console.log('🗑️ Clearing selection - clicked outside editor')
        setTextSelection(null)
      }
    }

    document.addEventListener('click', handleDocumentClick)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [showRegenerateModal])

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editorContent)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
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
          {/* Left: Edit/Preview Toggle */}
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
                <DropdownMenuItem    onClick={() => handleExportPDF()}
              disabled={!hasContent}  data-export-pdf>
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

      {/* Content Display */}
      <div className="flex-1 overflow-auto min-h-0">
        <div className="max-w-5xl mx-auto h-full">
          {isPreviewMode ? (
            <div ref={printRef} className="p-6 sm:p-8 h-full">
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
              <Card className="p-4 h-full flex flex-col">
                <div
                  ref={editorRef}
                  className="w-full flex-1 min-h-0 p-4 border-0 resize-none focus:outline-none font-mono text-sm leading-relaxed bg-transparent overflow-auto select-text"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => handleContentEdit(e.currentTarget.textContent || '')}
                  onMouseUp={handleEditorMouseUp}
                  onKeyUp={handleEditorKeyUp}
                  onFocus={handleEditorFocus}
                  onDoubleClick={handleTextSelection} // Handle double-click selection
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
              </Card>

              {/* Regenerate Prompt Modal */}
              <RegeneratePromptModal
                isOpen={showRegenerateModal}
                onClose={() => {
                  console.log('🚪 Closing regeneration modal')
                  setShowRegenerateModal(false)
                  // Don't clear selection immediately - let user see the result
                  setTimeout(() => setTextSelection(null), 100)
                }}
                selectedText={textSelection?.text || ''}
                onRegenerate={handleRegenerateWithInstruction}
                isLoading={isRegenerating}
              />
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

      {/* Floating Regenerate Toolbar - Positioned at root level for proper z-indexing */}
      <FloatingRegenerateToolbar
        selection={textSelection}
        onRegenerate={handleRegenerateToolbarClick}
        isRegenerating={isRegenerating}
      />
    </div>
  )
}