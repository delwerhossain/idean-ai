'use client'

import { useState } from 'react'
import { History, Download, Eye, Clock, FileText, ChevronDown, ChevronRight, Play, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DocumentHistoryItem {
  id: string
  name: string
  output_content: string
  createdAt: string
  user_request?: string
  generation_type?: string
}

interface DocumentHistoryPanelProps {
  history: DocumentHistoryItem[]
  onViewHistory: (item: DocumentHistoryItem) => void
  onDownloadHistory: (item: DocumentHistoryItem, format: 'txt' | 'md' | 'pdf') => void
  onClose?: () => void
  currentContent?: string
  className?: string
}

export function DocumentHistoryPanel({
  history,
  onViewHistory,
  onDownloadHistory,
  onClose,
  currentContent = '',
  className = ''
}: DocumentHistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [previewContent, setPreviewContent] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGenerationTypeLabel = (type?: string) => {
    switch (type) {
      case 'initial_generation':
        return 'Initial'
      case 'feedback_regeneration':
        return 'Feedback'
      default:
        return 'Generated'
    }
  }

  const getGenerationTypeColor = (type?: string) => {
    switch (type) {
      case 'initial_generation':
        return 'bg-blue-100 text-blue-700'
      case 'feedback_regeneration':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Check if this history item is currently active
  const isCurrentlyActive = (item: DocumentHistoryItem) => {
    return currentContent.trim() === item.output_content.trim()
  }

  // Handle view history with auto-close
  const handleViewHistory = (item: DocumentHistoryItem) => {
    onViewHistory(item)
    // Auto close after viewing
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }

  const handleDownloadAll = () => {
    // Create a comprehensive document with all history
    const allContent = history.map((item, index) => {
      return `VERSION ${index + 1} - ${getGenerationTypeLabel(item.generation_type)}
Generated: ${formatDate(item.createdAt)}
${item.user_request ? `User Request: ${item.user_request}` : ''}

${item.output_content}

${'='.repeat(80)}
`
    }).join('\n\n')

    const blob = new Blob([allContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document-history-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!history || history.length === 0) {
    return null
  }

  return (
    <div className={`bg-white shadow-xl border border-gray-200 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <History className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">History</h3>
              <p className="text-xs text-gray-500">{history.length} versions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAll}
              className="h-8 px-3 text-xs border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
            >
              <Download className="w-3 h-3 mr-1" />
              All
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content - Simplified list */}
      <div className="flex-1 overflow-y-auto">
        {history.map((item, index) => {
          const isActive = isCurrentlyActive(item)
          return (
            <div key={item.id} className={`border-b border-gray-100 p-3 transition-colors ${
              isActive
                ? 'bg-gray-100'
                : 'hover:bg-gray-50'
            }`}>
              <div className="flex items-start gap-3">
                {/* Version indicator */}
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isActive
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {history.length - index}
                  </div>
                  {isActive && (
                    <span className="px-1.5 py-0.5 bg-gray-600 text-white text-xs rounded">
                      NOW
                    </span>
                  )}
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0">
                  {/* Type and time */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs rounded ${getGenerationTypeColor(item.generation_type)}`}>
                      {getGenerationTypeLabel(item.generation_type)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {/* User request */}
                  {item.user_request && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 italic line-clamp-1">
                        "{item.user_request}"
                      </p>
                    </div>
                  )}

                  {/* Content preview */}
                  <p className="text-xs text-gray-700 line-clamp-2 mb-2">
                    {item.output_content.substring(0, 100)}
                    {item.output_content.length > 100 && '...'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{item.output_content.split(' ').length} words</span>
                    <span>{item.output_content.length} chars</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={() => handleViewHistory(item)}
                    disabled={isActive}
                    size="sm"
                    className={`h-7 w-7 p-0 ${
                      isActive
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-gray-300 hover:bg-gray-100"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onDownloadHistory(item, 'txt')} className="text-xs">
                        <FileText className="w-3 h-3 mr-2" />
                        TXT
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownloadHistory(item, 'md')} className="text-xs">
                        <FileText className="w-3 h-3 mr-2" />
                        Markdown
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownloadHistory(item, 'pdf')} className="text-xs">
                        <FileText className="w-3 h-3 mr-2" />
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Preview */}
      {previewContent && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Preview</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewContent(null)}
              className="h-6 px-2 text-xs"
            >
              Close
            </Button>
          </div>
          <div className="text-sm text-gray-700 max-h-32 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans">
              {previewContent.substring(0, 500)}
              {previewContent.length > 500 && '...'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}