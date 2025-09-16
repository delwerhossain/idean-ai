'use client'

import { useState } from 'react'
import { Copy, Download, Wand2, Save, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface GenerationStatusBarProps {
  wordCount: number
  tokensUsed: number
  model: string
  isGenerating: boolean
  onExport: (format: 'pdf' | 'markdown' | 'docx' | 'html') => void
}

export function GenerationStatusBar({
  wordCount,
  tokensUsed,
  model,
  isGenerating,
  onExport
}: GenerationStatusBarProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [copied, setCopied] = useState(false)

  const handleCopyAll = async () => {
    try {
      // Get the editor content
      const editorElement = document.querySelector('.idean-editor-content')
      const content = editorElement?.textContent || ''

      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy content:', err)
    }
  }

  const handleSave = () => {
    setSaveStatus('saving')
    // Simulate save operation
    setTimeout(() => {
      setSaveStatus('saved')
    }, 1000)
  }

  return (
    <div className="bg-white border-t border-gray-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between text-xs sm:text-sm">
      {/* Left Side - Status Information */}
      <div className="flex items-center gap-2 sm:gap-6 text-gray-600 overflow-hidden">
        {/* Word Count */}
        <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
          <span className="font-medium hidden sm:inline">Words:</span>
          <span className="font-medium sm:hidden">W:</span>
          <span className={wordCount > 0 ? 'text-gray-900' : 'text-gray-400'}>
            {wordCount > 999 ? `${Math.round(wordCount/1000)}k` : wordCount}
          </span>
        </div>

        {/* Tokens Used (if available) - Hidden on small screens */}
        {tokensUsed > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <span className="font-medium">Tokens:</span>
            <span className="text-gray-900">
              {tokensUsed.toLocaleString()}
            </span>
          </div>
        )}

        {/* Model Used - Hidden on mobile */}
        {model && (
          <div className="hidden lg:flex items-center gap-2">
            <span className="font-medium">Model:</span>
            <span className="text-gray-900 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {model}
            </span>
          </div>
        )}

        {/* Save Status - Simplified on mobile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {saveStatus === 'saved' && (
            <>
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              <span className="text-green-600 hidden sm:inline">All changes saved</span>
              <span className="text-green-600 sm:hidden">Saved</span>
            </>
          )}
          {saveStatus === 'saving' && (
            <>
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-spin" />
              <span className="text-blue-600 hidden sm:inline">Saving...</span>
              <span className="text-blue-600 sm:hidden">Saving</span>
            </>
          )}
          {saveStatus === 'unsaved' && (
            <>
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
              <span className="text-orange-600 hidden sm:inline">Unsaved changes</span>
              <span className="text-orange-600 sm:hidden">Unsaved</span>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Save Button - Icon only on mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={isGenerating || saveStatus === 'saving'}
          className="gap-1 sm:gap-2 px-2 sm:px-3"
          title="Save document"
        >
          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        {/* Copy All Button - Hidden on small mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyAll}
          disabled={wordCount === 0}
          className="gap-1 sm:gap-2 px-2 sm:px-3 hidden xs:flex"
          title="Copy all content"
        >
          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy All'}</span>
          <span className="sm:hidden">{copied ? '✓' : 'Copy'}</span>
        </Button>

        {/* Regenerate Button - Hidden on mobile */}
        <Button
          variant="outline"
          size="sm"
          disabled={isGenerating}
          className="gap-1 sm:gap-2 px-2 sm:px-3 hidden md:flex"
          title="Regenerate content"
        >
          <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden lg:inline">Regenerate</span>
          <span className="lg:hidden">Regen</span>
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              disabled={wordCount === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('markdown')}>
              <Download className="w-4 h-4 mr-2" />
              Export as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('docx')}>
              <Download className="w-4 h-4 mr-2" />
              Export as DOCX
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('html')}>
              <Download className="w-4 h-4 mr-2" />
              Export as HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}