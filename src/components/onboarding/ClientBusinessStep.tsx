'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkles, User, Building2 } from 'lucide-react'

interface ClientBusinessStepProps {
  clientName: string
  businessName: string
  onClientNameChange: (value: string) => void
  onBusinessNameChange: (value: string) => void
}

const AI_SUGGESTED_NAMES = [
  'TechFlow Solutions',
  'InnovatePro',
  'DigitalCraft Studio',
  'NextGen Ventures',
  'SmartEdge Consulting',
  'VisionPoint Labs',
  'CreativeCore',
  'DataDriven Dynamics',
  'FutureForge',
  'AgileWorks'
]

export default function ClientBusinessStep({ 
  clientName, 
  businessName, 
  onClientNameChange, 
  onBusinessNameChange 
}: ClientBusinessStepProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestedNames, setSuggestedNames] = useState<string[]>([])

  const generateAISuggestions = () => {
    // Simulate AI generation based on client name
    const suggestions = AI_SUGGESTED_NAMES
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
    
    setSuggestedNames(suggestions)
    setShowSuggestions(true)
  }

  const selectSuggestion = (suggestion: string) => {
    onBusinessNameChange(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Your Full Name *
          </label>
          <Input
            placeholder="Enter your full name"
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Business Name *
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter your business name"
              value={businessName}
              onChange={(e) => onBusinessNameChange(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={generateAISuggestions}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              AI Suggest
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Don't have a business name yet? Click "AI Suggest" for creative ideas!
          </p>
        </div>
      </div>

      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI-Generated Business Names
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Here are some AI-generated business name suggestions based on your information:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedNames.map((name, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => selectSuggestion(name)}
                  className="justify-start h-auto p-3 text-left hover:bg-blue-50"
                >
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Click to select this name
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                onClick={generateAISuggestions}
                className="w-full flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate More Suggestions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {businessName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Business Name Selected</p>
              <p className="text-sm text-green-600">{businessName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}