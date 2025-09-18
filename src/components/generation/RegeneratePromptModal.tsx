'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Wand2, Sparkles } from 'lucide-react'

interface RegeneratePromptModalProps {
  isOpen: boolean
  onClose: () => void
  selectedText: string
  onRegenerate: (instruction: string, options: GenerationOptions) => Promise<void>
  isLoading?: boolean
}

interface GenerationOptions {
  temperature: number
  maxTokens: number
}

export function RegeneratePromptModal({
  isOpen,
  onClose,
  selectedText,
  onRegenerate,
  isLoading = false
}: RegeneratePromptModalProps) {
  const [instruction, setInstruction] = useState('')
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([500])

  const handleSubmit = async () => {
    if (!instruction.trim()) return
    if (!selectedText.trim()) {
      console.error('No selected text provided for regeneration')
      return
    }

    console.log('Regenerating with:', {
      instruction,
      selectedText: selectedText.substring(0, 100) + '...',
      selectedTextLength: selectedText.length,
      temperature: temperature[0],
      maxTokens: maxTokens[0]
    })

    await onRegenerate(instruction, {
      temperature: temperature[0],
      maxTokens: maxTokens[0]
    })

    // Reset form
    setInstruction('')
    setTemperature([0.7])
    setMaxTokens([500])
  }

  const handleClose = () => {
    if (!isLoading) {
      setInstruction('')
      setTemperature([0.7])
      setMaxTokens([500])
      onClose()
    }
  }

  const suggestedPrompts = [
    "Make this more engaging and conversational",
    "Simplify the language for a general audience",
    "Add more compelling details and examples",
    "Make this more professional and formal",
    "Shorten this while keeping the key points",
    "Add emotional appeal and storytelling",
    "Include specific data and statistics",
    "Make it more actionable with clear steps"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="
          w-[95vw] max-w-2xl
          max-h-[95vh]
          overflow-hidden
          p-3 sm:p-4 lg:p-6
          mx-2 sm:mx-4
          my-2 sm:my-4
          flex flex-col
        "
        data-regenerate-modal="true"
      >
        <DialogHeader className="pb-2 sm:pb-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
            <span className="truncate">Regenerate Selected Text</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 lg:space-y-6 overflow-y-auto flex-1 min-h-0">
          {/* Selected Text Preview - Super Mobile Optimized */}
          {selectedText ? (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-2 sm:p-3 lg:p-4">
              <Label className="text-xs sm:text-sm font-medium text-indigo-800 mb-1.5 sm:mb-2 lg:mb-3 flex items-start gap-1.5 sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                <span className="break-words leading-tight">Selected Text ({selectedText.length} chars)</span>
              </Label>
              <div className="bg-white border border-indigo-100 rounded-md p-2 sm:p-3 max-h-20 sm:max-h-24 lg:max-h-32 overflow-y-auto">
                <p className="text-xs sm:text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                  {selectedText.length > 250 ? `${selectedText.substring(0, 250)}...` : selectedText}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-2 sm:p-3 lg:p-4">
              <Label className="text-xs sm:text-sm font-medium text-red-800 mb-1 sm:mb-2 flex items-start gap-1.5 sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                <span className="break-words">No Text Selected</span>
              </Label>
              <p className="text-xs sm:text-sm text-red-600 break-words leading-tight">
                Please select some text in the editor before trying to regenerate.
              </p>
            </div>
          )}

          {/* Instruction Input - Mobile Optimized */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="instruction" className="text-xs sm:text-sm font-medium break-words">
              How would you like to improve this text?
            </Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                // Handle Enter key to submit (Ctrl+Enter or Cmd+Enter)
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  if (instruction.trim() && selectedText.trim() && !isLoading) {
                    handleSubmit()
                  }
                }
                // Handle plain Enter key for single-line quick submissions
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                  // Only auto-submit if the instruction is not empty and text is short (single line intent)
                  const lines = instruction.split('\n').length
                  if (instruction.trim() && selectedText.trim() && !isLoading && lines === 1) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }
              }}
              placeholder="Describe how you want to modify the selected text... (Press Enter to regenerate or Shift+Enter for new line)"
              className="min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] resize-none text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              disabled={isLoading}
            />

            {/* Suggested Prompts - Super Mobile Optimized */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-600 font-medium">💡 Quick suggestions:</Label>
                <span className="text-xs text-gray-500 hidden lg:inline">
                  Tip: Press Enter to regenerate quickly
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1 sm:gap-1.5 max-h-28 sm:max-h-32 lg:max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {suggestedPrompts.slice(0, 6).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInstruction(prompt)}
                    disabled={isLoading}
                    className="text-xs py-1.5 sm:py-2 px-2 sm:px-3 h-auto text-left justify-start hover:bg-indigo-50 hover:border-indigo-300 transition-all min-h-[32px] sm:min-h-[36px] lg:min-h-[40px] border-gray-200"
                  >
                    <span className="line-clamp-2 text-left break-words leading-tight">{prompt}</span>
                  </Button>
                ))}
                {suggestedPrompts.length > 6 && (
                  <div className="text-center py-1">
                    <span className="text-xs text-gray-400">Scroll to see more suggestions</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generation Options - Super Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
              <Label className="text-xs sm:text-sm font-medium break-words">
                🎨 Creativity: {temperature[0].toFixed(1)}
              </Label>
              <div className="px-1 py-1">
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={1}
                  min={0}
                  step={0.1}
                  disabled={isLoading}
                  className="w-full touch-pan-x slider-thumb-lg"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
              <Label className="text-xs sm:text-sm font-medium break-words">
                📝 Max Length: {maxTokens[0]} tokens
              </Label>
              <div className="px-1 py-1">
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  max={1000}
                  min={100}
                  step={50}
                  disabled={isLoading}
                  className="w-full touch-pan-x slider-thumb-lg"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>Short</span>
                <span>Long</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons - Fixed Bottom for Mobile */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2 sm:pt-3 lg:pt-4 border-t border-gray-200 mt-2 sm:mt-3 flex-shrink-0 bg-white">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto min-h-[42px] sm:min-h-[44px] touch-manipulation text-sm font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!instruction.trim() || !selectedText.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto min-h-[42px] sm:min-h-[44px] touch-manipulation shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm font-medium">Regenerating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">Regenerate Text</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}