'use client'

import { useState, useEffect } from 'react'
import { FileText, Edit, Wand2, Download, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

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

  useEffect(() => {
    setEditorContent(content)
  }, [content])

  const handleContentEdit = (newContent: string) => {
    setEditorContent(newContent)
    onContentChange?.(newContent)
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(editorContent)
  }

  const handleExportMarkdown = () => {
    const blob = new Blob([editorContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${framework.name.toLowerCase().replace(/\s+/g, '-')}-content.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <html>
      <head>
        <title>${framework.name} - Generated Content</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 1rem;
            line-height: 1.6;
            color: #333;
          }
          h1, h2, h3 { color: #111; margin-bottom: 1rem; }
          p { margin-bottom: 1rem; }
          .header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #eee; }
          .content { white-space: pre-wrap; }
          @media print { body { margin: 0; padding: 1rem; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${framework.name} - Generated Content</h1>
          <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Word count:</strong> ${editorContent.split(' ').filter(w => w.trim()).length} words</p>
        </div>
        <div class="content">${editorContent.replace(/\n/g, '<br>')}</div>
      </body>
      </html>
    `
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
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

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Content Display */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="p-6">
            <div className="space-y-4">
              {/* Content */}
              <div className="prose max-w-none">
                <textarea
                  className="w-full min-h-[500px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm leading-relaxed"
                  value={editorContent}
                  onChange={(e) => handleContentEdit(e.target.value)}
                  placeholder="Generated content will appear here..."
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Stats */}
            <div className="text-sm text-gray-500">
              <span className="font-medium">Content Statistics:</span>
              <span className="ml-2">{wordCount} words • {charCount} characters</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex-1 sm:flex-none"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportMarkdown}
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex-1 sm:flex-none"
              >
                <FileText className="w-4 h-4 mr-2" />
                Print
              </Button>
              {onRegenerateSection && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRegenerateSection(editorContent)}
                  disabled={isGenerating}
                  className="flex-1 sm:flex-none"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}