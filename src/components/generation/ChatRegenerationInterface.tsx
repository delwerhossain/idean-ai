'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, LoaderIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SuggestionChip {
  id: string
  text: string
  category: 'tone' | 'style' | 'urgency' | 'format'
}

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface ChatRegenerationInterfaceProps {
  isVisible: boolean
  isLoading: boolean
  onSendMessage: (message: string) => void
  onClose: () => void
  selectedText?: string
  className?: string
}

const suggestionChips: SuggestionChip[] = [
  { id: 'urgent', text: 'Make it more urgent', category: 'urgency' },
  { id: 'scarcity', text: 'Add scarcity', category: 'urgency' },
  { id: 'friendly', text: 'Make it more friendly', category: 'tone' },
  { id: 'professional', text: 'More professional tone', category: 'tone' },
  { id: 'shorter', text: 'Make it shorter', category: 'format' },
  { id: 'detailed', text: 'Add more details', category: 'format' },
  { id: 'emotional', text: 'More emotional appeal', category: 'style' },
  { id: 'benefits', text: 'Focus on benefits', category: 'style' }
]

export function ChatRegenerationInterface({
  isVisible,
  isLoading,
  onSendMessage,
  onClose,
  selectedText,
  className = ''
}: ChatRegenerationInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-focus input when visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isVisible])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  const handleSendMessage = () => {
    const message = inputValue.trim()
    if (!message || isLoading) return

    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, userMessage])
    setInputValue('')

    // Send message to parent
    onSendMessage(message)
  }

  const handleChipClick = (chipText: string) => {
    if (isLoading) return

    // Add chip message to chat and send
    const chipMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chipText,
      isUser: true,
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, chipMessage])
    onSendMessage(chipText)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ${className}`}>
      <div className="max-w-full mx-auto">
        {/* Chat History - Optional, can be minimal or hidden */}
        {chatHistory.length > 0 && (
          <div
            ref={chatContainerRef}
            className="max-h-32 overflow-y-auto px-4 py-2 border-b border-gray-100"
          >
            {chatHistory.slice(-3).map((message) => (
              <div key={message.id} className="flex items-start gap-2 mb-2 last:mb-0">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div className="text-sm text-gray-700 leading-relaxed">
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestion Chips */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide">
            {suggestionChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleChipClick(chip.text)}
                disabled={isLoading}
                className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200
                         text-gray-700 rounded-full border border-gray-200 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chip.text}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your feedback to regenerate the content..."
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl bg-white
                         text-sm placeholder-gray-500 focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Loading indicator inside input */}
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoaderIcon className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="ml-2 hidden sm:inline">Send</span>
                </>
              )}
            </Button>

            {/* Cancel/Close Button */}
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="h-12 px-4 rounded-xl"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>

          {/* Loading State Text */}
          {isLoading && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Regenerating content with your feedback...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}