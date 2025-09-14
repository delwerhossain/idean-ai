'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Edit, Wand2, Copy, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import ReactMarkdown from 'react-markdown'
import { useReactToPrint } from 'react-to-print'

interface Framework {
  id: string
  name: string
  description?: string
}

interface GenerationEditorProps {
  content: string
  isGenerating: boolean
  currentStep: 'input' | 'generating' | 'editing'
  framework: Framework
  onRegenerateSection?: (sectionText: string) => void
  onContentChange?: (content: string) => void
}

export function GenerationEditor({
  content,
  isGenerating,
  currentStep,
  framework,
  onRegenerateSection,
  onContentChange
}: GenerationEditorProps) {
  const [editorContent, setEditorContent] = useState(content)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditorContent(content)
  }, [content])

  const handleContentEdit = (newContent: string) => {
    setEditorContent(newContent)
    onContentChange?.(newContent)
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editorContent)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  // Export handlers
  const handleExportMarkdown = () => {
    if (!editorContent.trim()) return

    const blob = new Blob([editorContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${framework.name.toLowerCase().replace(/\s+/g, '-')}-content.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportHTML = () => {
    if (!editorContent.trim()) return

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${framework.name} - Generated Content</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #111;
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        h1 { font-size: 2.5rem; border-bottom: 2px solid #eee; padding-bottom: 1rem; }
        h2 { font-size: 2rem; }
        h3 { font-size: 1.5rem; }
        p { margin-bottom: 1rem; }
        ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
        li { margin-bottom: 0.5rem; }
        blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 1.5rem 0;
            padding: 1rem 1.5rem;
            background: #f9fafb;
            font-style: italic;
        }
        code {
            background: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid #eee;
        }
        .meta {
            color: #666;
            font-size: 0.9rem;
            margin-top: 1rem;
        }
        @media print {
            body { margin: 0; padding: 1rem; }
            .header { margin-bottom: 2rem; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${framework.name}</h1>
        <div class="meta">
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Word count:</strong> ${editorContent.split(' ').filter(w => w.trim()).length} words</p>
        </div>
    </div>
    <div class="content">
        ${editorContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/^(.*)$/, '<p>$1</p>')}
    </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${framework.name.toLowerCase().replace(/\s+/g, '-')}-content.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${framework.name} - Generated Content`,
  })

  const handleExport = (format: 'pdf' | 'markdown' | 'docx' | 'html') => {
    if (!editorContent.trim()) {
      console.warn('No content to export')
      return
    }

    switch (format) {
      case 'markdown':
        handleExportMarkdown()
        break
      case 'html':
        handleExportHTML()
        break
      case 'pdf':
        handlePrint()
        break
      case 'docx':
        // For now, export as HTML (DOCX would require additional library)
        handleExportHTML()
        break
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
      {/* Top Toolbar with Edit/Preview Toggle and Export */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Edit/Preview Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={!isPreviewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPreviewMode(false)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant={isPreviewMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPreviewMode(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>

          {/* Center: Stats */}
          <div className="text-sm text-gray-500 hidden sm:block">
            {wordCount} words • {charCount} characters
          </div>

          {/* Right: Export Options */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('markdown')}
              className="px-3"
            >
              <Download className="w-3 h-3 mr-1" />
              MD
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('html')}
              className="px-3"
            >
              <Download className="w-3 h-3 mr-1" />
              HTML
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              className="px-3"
            >
              <Download className="w-3 h-3 mr-1" />
              PDF
            </Button>
            {onRegenerateSection && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRegenerateSection(editorContent)}
                disabled={isGenerating}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {isPreviewMode ? (
            <div ref={printRef} className="p-6 sm:p-8">
              {/* Print Header - Hidden on screen, visible when printing */}
              <div className="print:block hidden mb-8 text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-900">{framework.name}</h1>
                <p className="text-gray-600 mt-2">Generated on {new Date().toLocaleString()}</p>
                <p className="text-gray-500 text-sm">
                  {wordCount} words • {charCount} characters • {lineCount} lines
                </p>
              </div>

              <div className="prose max-w-none">
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
            <div className="p-6 sm:p-8">
              <Card className="p-4">
                <textarea
                  className="w-full min-h-[500px] p-4 border-0 resize-none focus:outline-none font-mono text-sm leading-relaxed bg-transparent"
                  value={editorContent}
                  onChange={(e) => handleContentEdit(e.target.value)}
                  placeholder="Generated content will appear here..."
                />
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Detailed Stats */}
            <div className="text-sm text-gray-500">
              <span className="font-medium">Statistics:</span>
              <span className="ml-2">
                {wordCount} words • {charCount} characters • {lineCount} lines
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex-1 sm:flex-none"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}