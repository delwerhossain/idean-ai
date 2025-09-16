'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { 
  Edit, 
  Eye, 
  Copy, 
  Download,
  MoreHorizontal,
  FileText,
  Clock,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { DocumentState } from '@/types/document'
import 'katex/dist/katex.min.css'

interface DocumentCardProps {
  document: DocumentState
  onEdit: () => void
  onPreview: () => void
  onContentChange: (content: string) => void
  onCopy: () => void
  onExport: () => void
  isActive?: boolean
  className?: string
}

export function DocumentCard({
  document,
  onEdit,
  onPreview,
  onContentChange,
  onCopy,
  onExport,
  isActive = false,
  className
}: DocumentCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(document.title)

  const content = document.editedContent || document.content
  
  const handleTitleSave = () => {
    // This would need to be passed up to parent to update document title
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setEditedTitle(document.title)
    setIsEditingTitle(false)
  }

  const formatLastModified = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className={cn(
      "relative group transition-all duration-200 hover:shadow-lg",
      isActive && "ring-2 ring-purple-500 shadow-lg",
      className
    )}>
      {/* Document Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave()
                    if (e.key === 'Escape') handleTitleCancel()
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTitleSave}
                  className="h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleTitleCancel}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {document.emoji && (
                  <span className="text-xl">{document.emoji}</span>
                )}
                <h3 
                  className="font-semibold text-gray-900 truncate cursor-pointer hover:text-purple-600"
                  onClick={() => setIsEditingTitle(true)}
                  title={document.title}
                >
                  {document.title}
                </h3>
              </div>
            )}
            
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {document.wordCount} words
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatLastModified(document.lastModified)}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                document.status === 'complete' && "bg-green-100 text-green-700",
                document.status === 'editing' && "bg-blue-100 text-blue-700",
                document.status === 'draft' && "bg-gray-100 text-gray-700"
              )}>
                {document.status || 'draft'}
              </span>
            </div>
          </div>

          {/* Document Actions */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="h-8 w-8 p-0 hover:bg-purple-100"
              title={document.isEditing ? 'Switch to Preview' : 'Edit Document'}
            >
              {document.isEditing ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onPreview}
              className="h-8 w-8 p-0 hover:bg-purple-100"
              title="Full Screen Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="p-4">
        {document.isEditing ? (
          <div className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full h-[300px] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              placeholder="Start writing your content here..."
            />
            <div className="text-xs text-gray-500">
              {content.split(' ').filter(word => word.trim()).length} words • {content.length} characters
            </div>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-800 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-medium text-gray-700 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-300 pl-4 py-2 bg-purple-50 text-purple-800 mb-3 italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, ...props }: any) =>
                    (props as any).inline ? (
                      <code className="bg-gray-100 text-purple-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-3" {...props}>
                        {children}
                      </code>
                    ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-3">
                      <table className="min-w-full border-collapse border border-gray-300">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-700">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-3 py-2 text-gray-700">
                      {children}
                    </td>
                  ),
                }}
              >
                {content || '*No content yet. Click Edit to start writing.*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Hover indicator */}
      {!isActive && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-200 rounded-lg pointer-events-none transition-colors" />
      )}
    </Card>
  )
}