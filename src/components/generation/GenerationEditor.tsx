'use client'

import { useState, useEffect } from 'react'
import { FileText, Edit, Wand2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Framework {
  id: string
  name: string
  description?: string
}

interface GenerationEditorProps {
  content: string
  isGenerating: boolean
  currentStep: 'input' | 'generating' | 'editing'
  framework: Framework
  onRegenerateSection?: (sectionText: string) => void
}

export function GenerationEditor({
  content,
  isGenerating,
  currentStep,
  framework,
  onRegenerateSection
}: GenerationEditorProps) {
  const [editorContent, setEditorContent] = useState(content)
  const [selectedText, setSelectedText] = useState('')

  useEffect(() => {
    setEditorContent(content)
  }, [content])

  // Parse generated content into structured sections
  const parseGeneratedContent = (text: string) => {
    if (!text) return []

    const sections = []
    const lines = text.split('\n').filter(line => line.trim())

    let currentSection: any = null

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()

      // Check if line starts with emoji (section header)
      const emojiMatch = trimmedLine.match(/^([📸💬📌📝🎯✨])\s*(.+)/)

      if (emojiMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection)
        }

        // Start new section
        currentSection = {
          emoji: emojiMatch[1],
          title: emojiMatch[2],
          content: []
        }
      } else if (currentSection && trimmedLine) {
        currentSection.content.push(trimmedLine)
      } else if (!currentSection && trimmedLine) {
        // Handle content without section headers
        sections.push({
          emoji: '📝',
          title: 'Generated Content',
          content: [trimmedLine]
        })
      }
    })

    // Add the last section
    if (currentSection) {
      sections.push(currentSection)
    }

    return sections
  }

  const sections = parseGeneratedContent(editorContent)

  if (currentStep === 'input') {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to Generate Content
          </h3>
          <p className="text-gray-600 mb-6">
            Fill in the details on the left and click "Generate Content" to create your {framework.name.toLowerCase()}.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Edit className="w-4 h-4" />
            <span>Rich text editor ready</span>
          </div>
        </div>
      </div>
    )
  }

  if (currentStep === 'generating') {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wand2 className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating Your Content
          </h3>
          <p className="text-gray-600 mb-6">
            Our AI is crafting your {framework.name.toLowerCase()} using the latest marketing frameworks and your specific requirements.
          </p>
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-500">This may take 15-30 seconds...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!editorContent.trim()) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Content Generated
          </h3>
          <p className="text-gray-600 mb-6">
            Something went wrong during generation. Please try again with your inputs.
          </p>
          <Button variant="outline">
            <Wand2 className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Generated Content Display */}
        <div className="space-y-8">
          {sections.length > 0 ? (
            sections.map((section, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{section.emoji}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {section.title}
                    </h3>
                    <div className="space-y-3">
                      {section.content.map((paragraph: string, pIndex: number) => {
                        // Style different types of content
                        if (paragraph.toLowerCase().startsWith('hook:')) {
                          return (
                            <p key={pIndex} className="font-semibold text-purple-700 text-lg">
                              {paragraph}
                            </p>
                          )
                        }
                        if (paragraph.toLowerCase().startsWith('cta:')) {
                          return (
                            <p key={pIndex} className="font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                              {paragraph}
                            </p>
                          )
                        }
                        if (paragraph.toLowerCase().includes('headline') || paragraph.toLowerCase().includes('title')) {
                          return (
                            <h4 key={pIndex} className="text-xl font-bold text-gray-900">
                              {paragraph}
                            </h4>
                          )
                        }
                        return (
                          <p key={pIndex} className="text-gray-700 leading-relaxed">
                            {paragraph}
                          </p>
                        )
                      })}
                    </div>

                    {/* Section Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRegenerateSection?.(section.content.join(' '))}
                        >
                          <Wand2 className="w-3 h-3 mr-1" />
                          Regenerate Section
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            // Fallback for unstructured content
            <Card className="p-6">
              <div className="prose max-w-none">
                {editorContent.split('\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return null
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Content Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Content generated • {sections.length} sections
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit All
              </Button>
              <Button variant="outline" size="sm">
                <Wand2 className="w-4 h-4 mr-2" />
                Regenerate All
              </Button>
            </div>
          </div>
        </div>

        {/* Rich Text Editor Placeholder */}
        <div className="mt-8 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">
            Rich text editor will be integrated here using TipTap
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Coming soon: Full editing capabilities with formatting, export options, and collaborative features
          </p>
        </div>
      </div>
    </div>
  )
}