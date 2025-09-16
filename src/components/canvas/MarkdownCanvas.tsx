'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef } from 'react'
import { EditorToolbar } from './EditorToolbar'
import { cn } from '@/lib/utils'

interface Framework {
  id: string
  name: string
  description?: string
}

interface MarkdownCanvasProps {
  content: string
  onChange: (content: string) => void
  framework: Framework
  isGenerating?: boolean
  className?: string
  onExport?: (format: 'markdown' | 'pdf') => void
}

export function MarkdownCanvas({
  content,
  onChange,
  framework,
  isGenerating = false,
  className,
  onExport
}: MarkdownCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Configure built-in extensions for better styling
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4 text-gray-700 leading-relaxed text-base',
          },
        },
        heading: {
          levels: [1, 2, 3, 4],
          HTMLAttributes: {
            class: 'font-bold text-gray-900 mb-3 mt-6',
          },
        },
        bold: {
          HTMLAttributes: {
            class: 'font-bold text-gray-900',
          },
        },
        italic: {
          HTMLAttributes: {
            class: 'italic text-gray-800',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-inside mb-4 text-gray-700 space-y-1',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-inside mb-4 text-gray-700 space-y-1',
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-1',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 py-2 mb-4 text-gray-600 italic bg-gray-50',
          },
        },
      }),
    ],
    content: content,
    editable: !isGenerating,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      onChange(markdown)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] bg-transparent',
        style: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.8; color: #1f2937; font-size: 16px;',
        spellcheck: 'true',
        'data-placeholder': 'Start writing your content here...',
      },
      handleKeyDown: (view, event) => {
        // Handle common shortcuts like MS Word
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case 'b':
              event.preventDefault()
              editor?.chain().focus().toggleBold().run()
              return true
            case 'i':
              event.preventDefault()
              editor?.chain().focus().toggleItalic().run()
              return true
            case 'z':
              if (event.shiftKey) {
                event.preventDefault()
                editor?.chain().focus().redo().run()
              } else {
                event.preventDefault()
                editor?.chain().focus().undo().run()
              }
              return true
          }
        }
        return false
      },
    },
  })

  // Convert HTML to Markdown (simplified conversion)
  const htmlToMarkdown = (html: string): string => {
    // This is a simplified conversion - in production, use a proper HTML to Markdown converter
    const markdown = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1\n\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
      .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')

    return markdown.trim()
  }

  // Convert Markdown to HTML for display
  const markdownToHtml = (markdown: string): string => {
    // This is a simplified conversion - in production, use a proper Markdown to HTML converter
    const html = markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')

    return `<p>${html}</p>`.replace(/<p><\/p>/g, '')
  }

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const html = markdownToHtml(content)
      editor.commands.setContent(html)
    }
  }, [content, editor])

  // Handle export functionality
  const handleExport = (format: 'markdown' | 'pdf') => {
    if (format === 'markdown') {
      const markdown = editor?.getHTML() ? htmlToMarkdown(editor.getHTML()) : content
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${framework.name.toLowerCase().replace(/\s+/g, '-')}-content.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      // PDF export will be implemented with react-to-print
      onExport?.(format)
    }
  }

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-lg", className)}>
      {/* Editor Toolbar */}
      <EditorToolbar 
        editor={editor} 
        onExport={handleExport}
        framework={framework}
      />
      
      {/* Editor Content - MS Word-like styling */}
      <div 
        ref={canvasRef}
        className={cn(
          "relative bg-white",
          "min-h-[600px] max-h-[800px] overflow-y-auto",
          "shadow-inner",
          isGenerating && "opacity-50 pointer-events-none"
        )}
        style={{
          background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
      >
        {/* Paper-like container */}
        <div className="max-w-4xl mx-auto bg-white shadow-sm min-h-full" style={{
          margin: '20px auto',
          padding: '60px 80px',
          boxShadow: '0 0 20px rgba(0,0,0,0.1)',
          borderRadius: '2px'
        }}>
          <EditorContent 
            editor={editor}
            className="h-full prose-lg"
            style={{
              fontSize: '16px',
              lineHeight: '1.7',
              color: '#1f2937'
            }}
          />
          
          {/* Generation Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center p-6 bg-white rounded-lg shadow-lg border">
                <div className="animate-spin h-8 w-8 border-b-3 border-purple-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Crafting Your Content</h3>
                <p className="text-sm text-gray-600">Using AI to generate professional copy...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Stats - MS Word-like status bar */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Words:</span>
              <span className="font-medium">{editor?.storage?.characterCount?.words() || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Characters:</span>
              <span className="font-medium">{editor?.storage?.characterCount?.characters() || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Pages:</span>
              <span className="font-medium">1</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2 py-1 bg-white rounded border text-gray-600">
              Framework: {framework.name}
            </span>
            <span className="text-xs text-gray-500">
              Ready • Auto-saved
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}