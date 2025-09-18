'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Wand2 } from 'lucide-react'

interface TextSelection {
  text: string
  start: number
  end: number
  rect: DOMRect
}

interface FloatingRegenerateToolbarProps {
  selection: TextSelection | null
  onRegenerate: (selectedText: string, start: number, end: number) => void
  isRegenerating?: boolean
}

export function FloatingRegenerateToolbar({
  selection,
  onRegenerate,
  isRegenerating = false
}: FloatingRegenerateToolbarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (selection && selection.text.trim()) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [selection])

  if (!isVisible || !selection) return null

  const handleRegenerate = () => {
    onRegenerate(selection.text, selection.start, selection.end)
  }

  // Enhanced smart positioning for the toolbar
  const getToolbarPosition = () => {
    if (!selection) return {}

    const rect = selection.rect
    const toolbarWidth = 160 // Adjusted for content
    const toolbarHeight = 50 // Adjusted for content
    const padding = 16
    const arrowSize = 8

    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    console.log('Selection rect:', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right
    })
    console.log('Viewport:', { viewportWidth, viewportHeight })

    // Calculate center of selection
    const selectionCenterX = rect.left + (rect.width / 2)
    const selectionCenterY = rect.top + (rect.height / 2)

    // Preferred position: above selection, centered
    let top = rect.top - toolbarHeight - arrowSize - padding
    let left = selectionCenterX - (toolbarWidth / 2)
    let placement = 'top'

    // Check if toolbar fits above selection
    if (top < padding) {
      // Position below selection
      top = rect.bottom + arrowSize + padding
      placement = 'bottom'
    }

    // Check if toolbar fits below selection (if positioned below)
    if (placement === 'bottom' && top + toolbarHeight > viewportHeight - padding) {
      // Position to the right of selection
      top = selectionCenterY - (toolbarHeight / 2)
      left = rect.right + arrowSize + padding
      placement = 'right'
    }

    // Check if toolbar fits to the right (if positioned right)
    if (placement === 'right' && left + toolbarWidth > viewportWidth - padding) {
      // Position to the left of selection
      left = rect.left - toolbarWidth - arrowSize - padding
      placement = 'left'
    }

    // Ensure toolbar doesn't go off screen edges
    left = Math.max(padding, Math.min(left, viewportWidth - toolbarWidth - padding))
    top = Math.max(padding, Math.min(top, viewportHeight - toolbarHeight - padding))

    console.log('Final position:', { top, left, placement })

    return {
      position: 'fixed' as const,
      top: top,
      left: left,
      zIndex: 50 // Use Tailwind z-50 equivalent
    }
  }

  const toolbarStyle = getToolbarPosition()

  return (
    <>
      {/* Backdrop to handle clicks outside */}
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={() => setIsVisible(false)}
      />

      {/* Floating Toolbar */}
      <div
        style={toolbarStyle}
        className="bg-white shadow-2xl border border-gray-200 rounded-lg p-2 flex items-center gap-2 transition-all duration-200 hover:shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-floating-toolbar="true"
      >
        {/* Selection Indicator */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 font-medium hidden sm:block">
            {selection.text.length} chars
          </span>
        </div>

        {/* Regenerate Button */}
        <Button
          variant="default"
          size="sm"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:scale-105 disabled:opacity-50"
        >
          <Wand2 className={`w-3 h-3 mr-1.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-medium">
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </span>
          <span className="sm:hidden font-medium">
            {isRegenerating ? '...' : 'Regen'}
          </span>
        </Button>
      </div>
    </>
  )
}