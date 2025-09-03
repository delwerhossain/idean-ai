'use client'

import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Lightbulb, Target, Users, CheckCircle2 } from 'lucide-react'

interface BusinessContextStepProps {
  businessContext: string
  mentorApproval: boolean
  onBusinessContextChange: (value: string) => void
  onMentorApprovalChange: (value: boolean) => void
}

const BUSINESS_CONTEXT_PROMPTS = [
  {
    icon: Target,
    title: "Target Customers",
    description: "Who are your ideal customers?",
    example: "Small business owners aged 25-45 who struggle with digital marketing and need affordable solutions"
  },
  {
    icon: Lightbulb,
    title: "Unique Selling Point", 
    description: "What makes your business different?",
    example: "We provide personalized business coaching in Bengali language with proven frameworks specifically for Bangladesh market"
  },
  {
    icon: Users,
    title: "Business Goals",
    description: "What do you want to achieve?",
    example: "Help 1000+ entrepreneurs grow their business using proven strategies, become the leading business consultant in Bangladesh"
  }
]

export default function BusinessContextStep({ 
  businessContext, 
  mentorApproval,
  onBusinessContextChange, 
  onMentorApprovalChange 
}: BusinessContextStepProps) {
  const characterCount = businessContext.length
  const maxCharacters = 500

  const addPromptExample = (example: string) => {
    const currentContext = businessContext.trim()
    const newContext = currentContext 
      ? `${currentContext}\n\n${example}` 
      : example
    
    if (newContext.length <= maxCharacters) {
      onBusinessContextChange(newContext)
    }
  }

  const generateBusinessSummary = () => {
    const businessName = localStorage.getItem('businessName') || 'Your Business'
    const industry = localStorage.getItem('industry') || 'General'
    
    const summary = `${businessName} operates in the ${industry} industry. ${businessContext || 'We provide quality services to our customers and aim to grow our business through effective marketing and customer satisfaction.'}`
    
    return summary
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Business Context / ব্যবসায়িক তথ্য
        </h3>
        <p className="text-gray-600">
          Tell us more about your business to help iDEAN AI create better content for you.
        </p>
      </div>

      <div className="space-y-4">
        {/* Business Context Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Business Information (Optional)
          </label>
          <Textarea
            placeholder="Tell us about your target customers, unique selling points, business goals, challenges, or any other relevant information..."
            value={businessContext}
            onChange={(e) => onBusinessContextChange(e.target.value)}
            className="min-h-32 resize-none text-base p-3 border-2 border-gray-300 rounded focus:border-blue-500"
            maxLength={maxCharacters}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              This information helps iDEAN AI understand your business better
            </p>
            <Badge variant="outline" className="text-xs">
              {characterCount}/{maxCharacters}
            </Badge>
          </div>
        </div>

        {/* Quick Add Prompts */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Quick Add Information:</h4>
          <div className="grid grid-cols-1 gap-2">
            {BUSINESS_CONTEXT_PROMPTS.map((prompt, index) => {
              const IconComponent = prompt.icon
              return (
                <button
                  key={index}
                  onClick={() => addPromptExample(prompt.example)}
                  className="text-left p-3 bg-white border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors group text-sm"
                  disabled={businessContext.length + prompt.example.length > maxCharacters}
                >
                  <div className="flex items-start gap-2">
                    <IconComponent className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-blue-800">
                        {prompt.title}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        {prompt.description}
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        "{prompt.example}"
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Generated Business Summary */}
        {(businessContext.length > 20) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Generated Business Summary:</h4>
            <p className="text-sm text-blue-700 italic">
              {generateBusinessSummary()}
            </p>
          </div>
        )}

        {/* Mentor Approval Section */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onMentorApprovalChange(!mentorApproval)}
              className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                mentorApproval 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {mentorApproval && <CheckCircle2 className="w-3 h-3" />}
            </button>
            <label className="text-sm text-gray-700 cursor-pointer select-none" onClick={() => onMentorApprovalChange(!mentorApproval)}>
              Has a mentor reviewed and approved your business information?
              <span className="text-gray-500 block text-xs mt-1">
                (Optional) If you have a business mentor or advisor, check this if they've reviewed your info
              </span>
            </label>
          </div>
        </div>

        {/* Mentor Approval Confirmation */}
        {mentorApproval && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 text-sm">Mentor Approved</p>
                <p className="text-xs text-green-600">Your business information has been reviewed by a mentor</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-800 mb-2">💡 What information helps iDEAN AI?</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Target customer demographics and needs</li>
            <li>• What makes your business unique</li>
            <li>• Your main business goals and challenges</li>
            <li>• Preferred communication tone (formal/casual)</li>
            <li>• Key products or services you offer</li>
          </ul>
        </div>
      </div>
    </div>
  )
}