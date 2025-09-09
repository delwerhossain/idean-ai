'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, Lightbulb, Zap, Target, BookOpen } from 'lucide-react'

export default function CopilotPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: 'Hello! I\'m your AI Co-Pilot. I can help you with strategy, campaigns, content creation, and business growth. What would you like to work on today?'
    }
  ])

  const quickPrompts = [
    {
      text: 'Create a Facebook funnel for moms',
      icon: Target,
      category: 'Campaign'
    },
    {
      text: 'Analyze my customer value journey',
      icon: Lightbulb,
      category: 'Strategy'
    },
    {
      text: 'Generate ad copy for my product',
      icon: Zap,
      category: 'Content'
    },
    {
      text: 'Explain Blue Ocean Strategy',
      icon: BookOpen,
      category: 'Learning'
    }
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, { type: 'user', content: message }])
      setMessage('')
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: 'I understand you want help with that. Let me analyze your request and provide specific recommendations based on the iDEAN AI frameworks...'
        }])
      }, 1000)
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt)
  }

  return (
    <DashboardLayout>
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Co-Pilot</h1>
          </div>
          <p className="text-gray-600">
            Your intelligent assistant trained on iMarketing, GrowthX, and iMBA frameworks
          </p>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <Card className="flex-1 p-6 mb-6 overflow-hidden">
            <div className="h-full overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Prompts */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Prompts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickPrompts.map((prompt, index) => {
                const Icon = prompt.icon
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => handleQuickPrompt(prompt.text)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{prompt.text}</p>
                        <p className="text-xs text-gray-500">{prompt.category}</p>
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Ask me anything about strategy, campaigns, or business growth..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="px-4">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Capabilities */}
        <div className="mt-6">
          <Card className="p-4 bg-gray-50">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-2">I can help you with:</h4>
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Strategy Planning</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Campaign Creation</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Content Generation</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">Growth Analysis</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded">Framework Guidance</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}