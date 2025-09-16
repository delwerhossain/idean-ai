'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Download,
  Edit,
  FileText,
  Eye,
  Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DocumentState } from '@/types/document'
import 'katex/dist/katex.min.css'

interface DocumentPreviewModalProps {
  document: DocumentState | null
  documents?: DocumentState[]
  isOpen: boolean
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  onEdit?: () => void
  onCopy?: () => void
  onExport?: () => void
  showNavigation?: boolean
}

export function DocumentPreviewModal({
  document,
  documents = [],
  isOpen,
  onClose,
  onPrevious,
  onNext,
  onEdit,
  onCopy,
  onExport,
  showNavigation = false
}: DocumentPreviewModalProps) {
  const content = document?.editedContent || document?.content
  const currentIndex = documents.findIndex(doc => doc.id === document?.id)
  const canGoNext = showNavigation && currentIndex < documents.length - 1
  const canGoPrevious = showNavigation && currentIndex > 0

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && canGoPrevious) onPrevious?.()
    if (e.key === 'ArrowRight' && canGoNext) onNext?.()
  }, [onClose, onPrevious, onNext, canGoPrevious, canGoNext])

  // Add keyboard event listeners
  React.useEffect(() => {
    if (isOpen) {
      window.document?.addEventListener('keydown', handleKeyDown)
      return () => window.document?.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !document) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {document.emoji && (
              <span className="text-2xl">{document.emoji}</span>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {document.title}
              </h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {document.wordCount} words
                </span>
                <span>
                  {document.characterCount} characters
                </span>
                {showNavigation && documents.length > 1 && (
                  <span>
                    Document {currentIndex + 1} of {documents.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center gap-2">
            {showNavigation && documents.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  disabled={!canGoPrevious}
                  className="h-8 w-8 p-0"
                  title="Previous Document (←)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="h-8 w-8 p-0"
                  title="Next Document (→)"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
              </>
            )}

            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
                title="Edit Document"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {onCopy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCopy}
                className="h-8 w-8 p-0"
                title="Copy to Clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}

            {onExport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="h-8 w-8 p-0"
                title="Export Document"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              title="Close (ESC)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Document-like container */}
            <div 
              className="bg-white shadow-sm min-h-[800px] p-12"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                lineHeight: '1.8',
                fontSize: '16px'
              }}
            >
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0 border-b border-gray-200 pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-medium text-gray-700 mb-3 mt-6">
                        {children}
                      </h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-lg font-medium text-gray-700 mb-2 mt-4">
                        {children}
                      </h4>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 leading-relaxed mb-4 text-justify">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc ml-6 space-y-2 mb-4 text-gray-700">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal ml-6 space-y-2 mb-4 text-gray-700">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-400 pl-6 py-4 bg-purple-50 text-purple-900 mb-6 italic rounded-r-lg">
                        {children}
                      </blockquote>
                    ),
                    code: ({ inline, children, ...props }) =>
                      inline ? (
                        <code className="bg-gray-100 text-purple-700 px-2 py-1 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-gray-900 text-green-400 p-6 rounded-lg text-sm font-mono overflow-x-auto mb-6 shadow-inner">
                          <code {...props}>{children}</code>
                        </pre>
                      ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
                        <table className="min-w-full border-collapse">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-800">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">
                        {children}
                      </td>
                    ),
                    hr: () => (
                      <hr className="border-0 h-px bg-gray-300 my-8" />
                    ),
                    img: ({ src, alt }) => (
                      <img 
                        src={src} 
                        alt={alt} 
                        className="max-w-full h-auto rounded-lg shadow-md my-6"
                      />
                    ),
                  }}
                >
                  {content || '*No content available*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Last modified: {document.lastModified.toLocaleString()}
          </div>
          
          {showNavigation && documents.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="gap-1"
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!canGoNext}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// React import fix
import React from 'react'