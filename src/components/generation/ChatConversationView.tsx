'use client'

import { useEffect, useRef } from 'react'
import { Bot, User, Copy, Clock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'

interface ConversationMessage {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: string
  metadata?: {
    wordCount?: number
    charCount?: number
  }
}

interface ChatConversationViewProps {
  messages: ConversationMessage[]
  className?: string
}

export function ChatConversationView({ messages, className = '' }: ChatConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleExportPDF = async (content: string, messageId: string) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      let yPosition = 30

      // Add title
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('AI Generated Content', margin, yPosition)
      yPosition += 15

      // Add metadata
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition)
      yPosition += 15

      // Add separator
      pdf.setDrawColor(200)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      // Process content
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(0)

      const lines = content.split('\n')
      for (let line of lines) {
        if (!line.trim()) {
          yPosition += 5
          continue
        }

        // Check page break
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = 30
        }

        // Handle headers
        if (line.startsWith('# ')) {
          pdf.setFontSize(16)
          pdf.setFont('helvetica', 'bold')
          const headerText = line.substring(2)
          const wrappedLines = pdf.splitTextToSize(headerText, contentWidth)
          wrappedLines.forEach((wrappedLine: string) => {
            pdf.text(wrappedLine, margin, yPosition)
            yPosition += 8
          })
          yPosition += 5
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'normal')
        } else if (line.startsWith('## ')) {
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          const headerText = line.substring(3)
          const wrappedLines = pdf.splitTextToSize(headerText, contentWidth)
          wrappedLines.forEach((wrappedLine: string) => {
            pdf.text(wrappedLine, margin, yPosition)
            yPosition += 7
          })
          yPosition += 3
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'normal')
        } else if (line.match(/^[-*+]\s/)) {
          const listText = line.replace(/^[-*+]\s/, '')
          pdf.text('•', margin + 5, yPosition)
          const wrappedLines = pdf.splitTextToSize(listText, contentWidth - 15)
          wrappedLines.forEach((wrappedLine: string, idx: number) => {
            pdf.text(wrappedLine, margin + 15, yPosition)
            if (idx < wrappedLines.length - 1) yPosition += 5
          })
          yPosition += 6
        } else {
          const cleanText = line
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')

          const wrappedLines = pdf.splitTextToSize(cleanText, contentWidth)
          wrappedLines.forEach((wrappedLine: string) => {
            pdf.text(wrappedLine, margin, yPosition)
            yPosition += 5
          })
          yPosition += 2
        }
      }

      const filename = `ai-content-${messageId}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(filename)
    } catch (error) {
      console.error('PDF export error:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Conversation Yet
          </h3>
          <p className="text-gray-600 text-sm">
            Start by generating content, then refine it using the chat below.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} ${
              message.type === 'ai' ? 'items-start' : 'items-end'
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                message.type === 'ai'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-700 text-white'
              }`}>
                {message.type === 'ai' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
            </div>

            {/* Message Content */}
            <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
              {/* Message Bubble */}
              <div className={`inline-block text-left rounded-2xl px-4 py-3 max-w-full ${
                message.type === 'ai'
                  ? 'bg-gray-50 text-gray-900'
                  : 'bg-gray-900 text-white'
              }`}>
                {message.type === 'ai' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold text-gray-900 mb-2 mt-1">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-3">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-medium text-gray-700 mb-1 mt-2">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-800 leading-relaxed mb-2 text-sm">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-0.5 text-gray-800 text-sm">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-0.5 text-gray-800 text-sm">
                            {children}
                          </ol>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-3 border-gray-300 bg-white pl-3 py-2 italic text-gray-700 mb-2 text-sm">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono text-gray-900">
                            {children}
                          </code>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-white whitespace-pre-wrap leading-relaxed text-sm">
                    {message.content}
                  </p>
                )}
              </div>

              {/* Message Footer */}
              <div className={`flex items-center gap-2 mt-2 text-xs text-gray-400 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(message.timestamp)}</span>
                </div>

                {message.metadata?.wordCount && (
                  <span>• {message.metadata.wordCount} words</span>
                )}

                {message.type === 'ai' && (
                  <>
                    <button
                      onClick={() => handleCopy(message.content)}
                      className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => handleExportPDF(message.content, message.id)}
                      className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
