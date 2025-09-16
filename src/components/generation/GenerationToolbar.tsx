'use client'

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Image,
  Table,
  Minus,
  Undo,
  Redo,
  Download,
  Maximize,
  Settings,
  MoreHorizontal,
  Wand2,
  ChevronDown,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface GenerationToolbarProps {
  isGenerating: boolean
  hasContent: boolean
  onExport: (format: 'pdf' | 'markdown' | 'docx' | 'html') => void
  onRegenerateAll: () => void
  onBackToInput?: () => void
}

export function GenerationToolbar({
  isGenerating,
  hasContent,
  onExport,
  onRegenerateAll,
  onBackToInput
}: GenerationToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 flex items-center justify-between sticky top-0 z-10">
      {/* Mobile Back Button */}
      {onBackToInput && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToInput}
          className="lg:hidden mr-2"
          title="Back to Input"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      )}

      {/* Left Side - Text Formatting Tools */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {/* Text Format Group */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 sm:w-9 sm:h-9 p-0"
            disabled={!hasContent}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 sm:w-9 sm:h-9 p-0"
            disabled={!hasContent}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 sm:w-9 sm:h-9 p-0 hidden sm:flex"
            disabled={!hasContent}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 sm:w-9 sm:h-9 p-0 hidden md:flex"
            disabled={!hasContent}
            title="Strikethrough"
          >
            <Strikethrough className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Heading Dropdown */}
        <Select disabled={!hasContent}>
          <SelectTrigger className="w-24 sm:w-32 h-8 sm:h-9 text-xs sm:text-sm">
            <SelectValue placeholder="Normal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 hidden md:block" />

        {/* List Group - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            disabled={!hasContent}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            disabled={!hasContent}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 hidden md:block" />

        {/* Alignment Group - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            disabled={!hasContent}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            disabled={!hasContent}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 hidden lg:block" />

        {/* Insert Group - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            disabled={!hasContent}
            title="Insert Link (Ctrl+K)"
          >
            <Link className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 hidden lg:block" />

        {/* History Group - Hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 sm:w-9 sm:h-9 p-0"
            disabled={!hasContent}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 sm:w-9 sm:h-9 p-0 hidden md:flex"
            disabled={!hasContent}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Regenerate Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerateAll}
          disabled={isGenerating || !hasContent}
          className="gap-1 sm:gap-2 px-2 sm:px-3"
        >
          <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Regenerate</span>
          <span className="sm:hidden">Regen</span>
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasContent}
              className="gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3" />
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

        {/* More Options - Hidden on small screens */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8 sm:w-9 sm:h-9 p-0 hidden md:flex">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Maximize className="w-4 h-4 mr-2" />
              Full Screen
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Editor Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link className="w-4 h-4 mr-2" />
              Share Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}