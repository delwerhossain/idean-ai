'use client'

import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  Heading4,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  Download,
  FileText,
  File,
  Undo,
  Redo
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Framework {
  id: string
  name: string
  description?: string
}

interface EditorToolbarProps {
  editor: Editor
  onExport: (format: 'markdown' | 'pdf') => void
  framework: Framework
}

export function EditorToolbar({ editor, onExport, framework }: EditorToolbarProps) {
  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title,
    disabled = false 
  }: {
    onClick: () => void
    isActive?: boolean
    children: React.ReactNode
    title: string
    disabled?: boolean
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0 hover:bg-gray-100",
        isActive && "bg-gray-100 text-purple-600"
      )}
    >
      {children}
    </Button>
  )

  const insertTable = () => {
    // For now, insert HTML table since we removed table extensions
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">
        <thead>
          <tr>
            <th style="border: 1px solid #d1d5db; padding: 8px; background-color: #f9fafb;">Header 1</th>
            <th style="border: 1px solid #d1d5db; padding: 8px; background-color: #f9fafb;">Header 2</th>
            <th style="border: 1px solid #d1d5db; padding: 8px; background-color: #f9fafb;">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px;">Cell 1</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">Cell 2</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">Cell 3</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px;">Cell 4</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">Cell 5</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">Cell 6</td>
          </tr>
        </tbody>
      </table>
    `
    editor.chain().focus().insertContent(tableHTML).run()
  }

  return (
    <div className="border-b border-gray-200 p-3 bg-gradient-to-r from-gray-50 to-white shadow-sm">
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor.isActive('heading', { level: 4 })}
          title="Heading 4"
        >
          <Heading4 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Text Alignment - Note: TipTap's text alignment needs additional extension */}
        <ToolbarButton
          onClick={() => {
            // This would require @tiptap/extension-text-align
            // For now, we'll implement basic functionality
          }}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            // This would require @tiptap/extension-text-align
          }}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            // This would require @tiptap/extension-text-align
          }}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="h-6 mx-2" />

        {/* Table */}
        <ToolbarButton
          onClick={insertTable}
          title="Insert Table"
        >
          <Table className="h-4 w-4" />
        </ToolbarButton>

        <div className="flex-1" />

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport('markdown')}>
              <FileText className="h-4 w-4 mr-2" />
              Download as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf')}>
              <File className="h-4 w-4 mr-2" />
              Download as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Framework Info - MS Word-like ribbon info */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded border">
              {framework.name}
            </span>
            <span className="text-xs text-gray-500">
              Rich Text Editor • Markdown Compatible
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Page 1 of 1</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}