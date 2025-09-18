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
      <DialogContent className="max-w-2xl" data-regenerate-modal="true">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Regenerate Selected Text
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Text Preview - Enhanced */}
          {selectedText ? (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
              <Label className="text-sm font-medium text-indigo-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Selected Text ({selectedText.length} characters):
              </Label>
              <div className="bg-white border border-indigo-100 rounded-md p-3 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {selectedText.length > 400 ? `${selectedText.substring(0, 400)}...` : selectedText}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
              <Label className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                No Text Selected
              </Label>
              <p className="text-sm text-red-600">
                Please select some text in the editor before trying to regenerate.
              </p>
            </div>
          )}

          {/* Instruction Input */}
          <div className="space-y-3">
            <Label htmlFor="instruction" className="text-sm font-medium">
              How would you like to improve this text?
            </Label>
            <Textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Describe how you want to modify the selected text..."
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />

            {/* Suggested Prompts - Enhanced */}
            <div className="space-y-3">
              <Label className="text-xs text-gray-600 font-medium">💡 Quick suggestions:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInstruction(prompt)}
                    disabled={isLoading}
                    className="text-xs py-2 px-3 h-auto text-left justify-start hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                  >
                    <span className="truncate">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Generation Options */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Creativity: {temperature[0].toFixed(1)}
              </Label>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                max={1}
                min={0}
                step={0.1}
                disabled={isLoading}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Focused</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Max Length: {maxTokens[0]} tokens
              </Label>
              <Slider
                value={maxTokens}
                onValueChange={setMaxTokens}
                max={1000}
                min={100}
                step={50}
                disabled={isLoading}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Short</span>
                <span>Long</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!instruction.trim() || !selectedText.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Regenerating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Regenerate Text
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}