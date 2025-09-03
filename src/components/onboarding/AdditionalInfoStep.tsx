'use client'

import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Lightbulb, Target, Users } from 'lucide-react'

interface AdditionalInfoStepProps {
  additionalInfo: string
  onAdditionalInfoChange: (value: string) => void
}

const EXAMPLE_PROMPTS = [
  {
    icon: Target,
    title: "Target Audience",
    description: "Who are your ideal customers?",
    example: "Small businesses with 10-50 employees looking for affordable HR solutions"
  },
  {
    icon: Lightbulb,
    title: "Unique Value Proposition",
    description: "What makes you different?",
    example: "We provide 24/7 customer support with AI-powered chat and human backup"
  },
  {
    icon: Users,
    title: "Company Culture",
    description: "What are your core values?",
    example: "Innovation, transparency, and customer-first approach guide everything we do"
  }
]

export default function AdditionalInfoStep({ additionalInfo, onAdditionalInfoChange }: AdditionalInfoStepProps) {
  const characterCount = additionalInfo.length
  const maxCharacters = 1000

  const addPromptExample = (example: string) => {
    const currentInfo = additionalInfo.trim()
    const newInfo = currentInfo 
      ? `${currentInfo}\n\n${example}` 
      : example
    
    if (newInfo.length <= maxCharacters) {
      onAdditionalInfoChange(newInfo)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Anything else you&apos;d like to share?
        </h3>
        <p className="text-gray-600">
          Share any additional details about your business, goals, or specific requirements. 
          This helps us create more personalized and accurate documentation.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Information (Optional)
          </label>
          <Textarea
            placeholder="Tell us more about your business, target audience, unique selling points, challenges, goals, or any other relevant information..."
            value={additionalInfo}
            onChange={(e) => onAdditionalInfoChange(e.target.value)}
            className="min-h-32 resize-none"
            maxLength={maxCharacters}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              This information will help us create more relevant and targeted content
            </p>
            <Badge variant="outline" className="text-xs">
              {characterCount}/{maxCharacters}
            </Badge>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Need inspiration? Click to add:</h4>
          <div className="grid grid-cols-1 gap-3">
            {EXAMPLE_PROMPTS.map((prompt, index) => {
              const IconComponent = prompt.icon
              return (
                <button
                  key={index}
                  onClick={() => addPromptExample(prompt.example)}
                  className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  disabled={additionalInfo.length + prompt.example.length > maxCharacters}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-blue-800">
                        {prompt.title}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        {prompt.description}
                      </p>
                      <p className="text-sm text-gray-600 italic">
                        &quot;{prompt.example}&quot;
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {additionalInfo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 mb-1">Additional Information Added</p>
                <div className="text-sm text-green-700 bg-white/50 rounded p-2 max-h-24 overflow-y-auto">
                  {additionalInfo}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Be specific about your target market and customer needs</li>
            <li>• Mention any unique features or competitive advantages</li>
            <li>• Include your business goals and what success looks like</li>
            <li>• Share any challenges you&apos;re facing or want to address</li>
            <li>• Mention your preferred tone of voice (formal, casual, technical, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}