'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Building2, Sparkles, Loader2, HelpCircle } from 'lucide-react'

interface BasicInfoStepProps {
  userName: string
  businessName: string
  onUserNameChange: (value: string) => void
  onBusinessNameChange: (value: string) => void
  language: 'en' | 'bn'
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
  onBusinessNameChange,
  language
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
      alert(language === 'en' ? 'Please enter your name first' : 'অনুগ্রহ করে আপনার নাম লিখুন')
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
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-3">
        {/* User Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            {language === 'en' ? 'Your Name *' : 'আপনার নাম *'}
          </label>
          <Input
            placeholder={language === 'en' ? 'Enter your full name' : 'আপনার পূর্ণ নাম লিখুন'}
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            className="w-full text-base p-3 border-2 border-gray-300 rounded focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'en' ? 'This will be used for personalization' : 'এটি ব্যক্তিগতকরণের জন্য ব্যবহৃত হবে'}
          </p>
        </div>

        {/* Business Name with Auto-suggest */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-2" />
            {language === 'en' ? 'Business Name *' : 'ব্যবসার নাম *'}
            <div className="inline-block ml-2 relative group">
              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-50">
                <div className="font-medium mb-2">💡 {language === 'en' ? 'Tips for Business Name' : 'ব্যবসার নামের জন্য টিপস'}</div>
                <ul className="space-y-1">
                  {language === 'en' ? (
                    <>
                      <li>• Keep it simple and memorable</li>
                      <li>• Consider your target market</li>
                      <li>• Check if domain name is available</li>
                      <li>• Make sure it&apos;s easy to pronounce</li>
                    </>
                  ) : (
                    <>
                      <li>• সহজ এবং স্মরণীয় রাখুন</li>
                      <li>• আপনার টার্গেট মার্কেট বিবেচনা করুন</li>
                      <li>• ডোমেইন নাম পাওয়া যায় কিনা চেক করুন</li>
                      <li>• উচ্চারণ সহজ হওয়া নিশ্চিত করুন</li>
                    </>
                  )}
                </ul>
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </label>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder={language === 'en' ? 'Enter business name' : 'ব্যবসার নাম লিখুন'}
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
                      {language === 'en' ? 'Click "Get AI Suggestions" for personalized names' : '"AI Suggest" এ ক্লিক করুন ব্যক্তিগত নামের জন্য'}
                    </div>
                  )}
                </div>
              )}

              {/* Loading suggestions dropdown */}
              {isLoadingAI && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded shadow-lg">
                  <div className="px-4 py-4 text-center">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    <span className="text-sm text-gray-600">{language === 'en' ? 'AI generating suggestions...' : 'AI সাজেশন তৈরি করছে...'}</span>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              type="button"
              onClick={generateAISuggestions}
              disabled={!userName.trim() || isLoadingAI}
              className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 whitespace-nowrap text-sm hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
            {language === 'en' ? 'Don\'t have a name yet? Click "AI Suggest" for ideas' : 'নাম নেই? "AI Suggest" ক্লিক করুন'}
          </p>
        </div>
      </div>

      {/* Selected Business Name Display */}
      {businessName && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-medium text-green-800 text-sm">{language === 'en' ? 'Business Name Selected' : 'ব্যবসার নাম নির্বাচিত'}</p>
              <p className="text-sm text-green-600">{businessName}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}