'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Building2, Sparkles, Loader2 } from 'lucide-react'

interface BasicInfoStepProps {
  userName: string
  businessName: string
  onUserNameChange: (value: string) => void
  onBusinessNameChange: (value: string) => void
}

// Bengali business name suggestions
const BENGALI_BUSINESS_SUGGESTIONS = [
  'TechFlow Solutions',
  'DigitalCraft BD',
  'NextGen Ventures',
  'SmartEdge Consulting', 
  'VisionPoint Labs',
  'CreativeCore',
  'DataDriven Dynamics',
  'FutureForge',
  'AgileWorks BD',
  'InnovatePro',
  'GrowthHub',
  'StrategicMind',
  'BusinessBoost',
  'MarketMaster',
  'ContentCraft',
  'SalesForce BD',
  'BrandBuilder',
  'DigitalEdge',
  'GrowthGuru',
  'BusinessBridge'
]

export default function BasicInfoStep({ 
  userName, 
  businessName, 
  onUserNameChange, 
  onBusinessNameChange 
}: BasicInfoStepProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on business name input
  useEffect(() => {
    if (businessName.trim() && businessName.length > 0) {
      const filtered = BENGALI_BUSINESS_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(businessName.toLowerCase()) ||
        businessName.toLowerCase().length > 2
      ).slice(0, 6)
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0 && businessName.length > 0)
    } else {
      setShowSuggestions(false)
      setFilteredSuggestions([])
    }
  }, [businessName])

  const generateAISuggestions = async () => {
    if (!userName.trim()) {
      alert('অনুগ্রহ করে আপনার নাম লিখুন / Please enter your name first')
      return
    }

    setIsLoadingAI(true)
    setShowSuggestions(true)
    
    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: userName,
          industry: localStorage.getItem('industry') || '',
          additionalContext: 'Bengali business context, suitable for Bangladesh market'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate names')
      }

      const { names } = await response.json()
      setSuggestions(names || BENGALI_BUSINESS_SUGGESTIONS.slice(0, 6))
      setFilteredSuggestions(names || BENGALI_BUSINESS_SUGGESTIONS.slice(0, 6))
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
      // Fallback to predefined names
      const fallbackSuggestions = BENGALI_BUSINESS_SUGGESTIONS
        .filter(name => name.includes(userName) || Math.random() > 0.5)
        .slice(0, 6)
      setSuggestions(fallbackSuggestions)
      setFilteredSuggestions(fallbackSuggestions)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    onBusinessNameChange(suggestion)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleBusinessNameFocus = () => {
    if (businessName.trim()) {
      const filtered = BENGALI_BUSINESS_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(businessName.toLowerCase())
      ).slice(0, 6)
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    }
  }

  const handleBusinessNameBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false)
    }, 150)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* User Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Your Name / আপনার নাম *
          </label>
          <Input
            placeholder="Enter your full name / আপনার পূর্ণ নাম লিখুন"
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            className="w-full text-base p-3 border-2 border-gray-300 rounded focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be used for personalization / এটি ব্যক্তিগতকরণের জন্য ব্যবহৃত হবে
          </p>
        </div>

        {/* Business Name with Auto-suggest */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            Business Name / ব্যবসার নাম *
          </label>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Enter business name / ব্যবসার নাম লিখুন"
                value={businessName}
                onChange={(e) => onBusinessNameChange(e.target.value)}
                onFocus={handleBusinessNameFocus}
                onBlur={handleBusinessNameBlur}
                className="w-full text-base p-3 border-2 border-gray-300 rounded focus:border-blue-500"
              />
              
              {/* Auto-suggest dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-800">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                  
                  {suggestions.length === 0 && !isLoadingAI && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Click "Get AI Suggestions" for personalized names
                    </div>
                  )}
                </div>
              )}

              {/* Loading suggestions dropdown */}
              {isLoadingAI && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded shadow-lg">
                  <div className="px-4 py-4 text-center">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    <span className="text-sm text-gray-600">AI generating suggestions...</span>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              type="button"
              onClick={generateAISuggestions}
              disabled={!userName.trim() || isLoadingAI}
              className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 whitespace-nowrap text-sm"
            >
              {isLoadingAI ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              AI Suggest
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            Don't have a name yet? Click "AI Suggest" for ideas / নাম নেই? "AI Suggest" ক্লিক করুন
          </p>
        </div>
      </div>

      {/* Selected Business Name Display */}
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

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 Tips for Business Name</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Keep it simple and memorable</li>
          <li>• Consider your target market</li>
          <li>• Check if domain name is available</li>
          <li>• Make sure it's easy to pronounce</li>
        </ul>
      </div>
    </div>
  )
}