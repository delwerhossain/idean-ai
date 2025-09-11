'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Globe, Loader2 } from 'lucide-react'
import BasicInfoStep from '@/components/onboarding/BasicInfoStep'
import WebsiteStep from '@/components/onboarding/WebsiteStep'
import IndustryStep from '@/components/onboarding/IndustryStep'
import KnowledgeBaseStep from '@/components/onboarding/KnowledgeBaseStep'
import BusinessContextStep from '@/components/onboarding/BusinessContextStep'
import { ideanApi, ideanUtils } from '@/lib/api/idean-api'

interface OnboardingData {
  userName: string
  businessName: string
  website: string
  industry: string
  knowledgeBase: File[]
  businessContext: string
  mentorApproval: boolean
}

const STEPS = {
  en: [
    { title: 'Basic Info', description: 'Name and business' },
    { title: 'Website', description: 'Optional' },
    { title: 'Industry', description: 'Your market' },
    { title: 'Documents', description: 'Optional PDFs' },
    { title: 'Context', description: 'Additional info' }
  ],
  bn: [
    { title: 'প্রাথমিক তথ্য', description: 'নাম এবং ব্যবসা' },
    { title: 'ওয়েবসাইট', description: 'ঐচ্ছিক' },
    { title: 'ইন্ডাস্ট্রি', description: 'আপনার বাজার' },
    { title: 'ডকুমেন্ট', description: 'ঐচ্ছিক পিডিএফ' },
    { title: 'প্রসঙ্গ', description: 'অতিরিক্ত তথ্য' }
  ]
}

export default function OnboardingPage() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [language, setLanguage] = useState<'en' | 'bn'>('en')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<OnboardingData>({
    userName: '',
    businessName: '',
    website: '',
    industry: '',
    knowledgeBase: [],
    businessContext: '',
    mentorApproval: false
  })
  
  const currentSteps = STEPS[language]

  const updateData = (field: keyof OnboardingData, value: string | boolean | File[]) => {
    setData(prev => {
      const newData = { ...prev, [field]: value }
      // Save to localStorage for persistence
      localStorage.setItem('onboardingData', JSON.stringify(newData))
      return newData
    })
  }

  const nextStep = () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return data.userName.trim() !== '' && data.businessName.trim() !== ''
      case 1: return true // Website is optional
      case 2: return data.industry.trim() !== ''
      case 3: return true // Knowledge base is optional (max 4 PDFs)
      case 4: return true // Business context is optional
      default: return false
    }
  }

  const handleFinish = async () => {
    if (!user) {
      setError('You must be signed in to complete onboarding')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Simple localStorage-based onboarding completion
      const localBusinessData = {
        business_name: data.businessName.trim(),
        website_url: data.website.trim() || `https://${data.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
        industry_tag: data.industry,
        business_context: data.businessContext.trim() || 'No additional context provided',
        language: language,
        mentor_approval: data.mentorApproval ? 'approved' : 'pending',
        module_select: 'standard' as const,
        timestamp: new Date().toISOString(),
        knowledgeBase: data.knowledgeBase.length
      }
      
      // Generate a local business ID for offline use
      const localBusinessId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Save all data to localStorage
      localStorage.setItem('onboardingCompleted', 'true')
      localStorage.setItem('hasCompletedOnboarding', 'true')
      localStorage.setItem('businessName', localBusinessData.business_name)
      localStorage.setItem('industry', localBusinessData.industry_tag)
      localStorage.setItem('businessContext', localBusinessData.business_context)
      localStorage.setItem('mentorApproval', localBusinessData.mentor_approval)
      localStorage.setItem('businessId', localBusinessId)
      localStorage.setItem('currentBusinessData', JSON.stringify(localBusinessData))
      
      // Create a local business object for immediate use
      const business = {
        id: localBusinessId,
        business_name: localBusinessData.business_name,
        website_url: localBusinessData.website_url,
        industry_tag: localBusinessData.industry_tag,
        business_context: localBusinessData.business_context,
        user_role: 'owner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem('currentBusiness', JSON.stringify(business))
      
      // Clear any new user flags
      localStorage.removeItem('isNewUser')
      
      console.log('🎉 Onboarding completed successfully with localStorage!')
      console.log('📊 Business data saved:', business)
      
      // TODO: When backend API is ready, add the following to sync data:
      /*
      try {
        await ideanApi.business.create(localBusinessData)
        console.log('✅ Data synced to backend')
      } catch (error) {
        console.log('⚠️ Backend sync failed, continuing with localStorage')
      }
      */
      
      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
      
    } catch (error: any) {
      console.error('❌ Onboarding completion failed:', error)
      setError('Failed to complete onboarding. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            userName={data.userName}
            businessName={data.businessName}
            onUserNameChange={(value) => updateData('userName', value)}
            onBusinessNameChange={(value) => updateData('businessName', value)}
            language={language}
          />
        )
      case 1:
        return (
          <WebsiteStep
            website={data.website}
            onWebsiteChange={(value) => updateData('website', value)}
            language={language}
          />
        )
      case 2:
        return (
          <IndustryStep
            industry={data.industry}
            onIndustryChange={(value) => updateData('industry', value)}
            language={language}
          />
        )
      case 3:
        return (
          <KnowledgeBaseStep
            knowledgeBase={data.knowledgeBase}
            onKnowledgeBaseChange={(value) => updateData('knowledgeBase', value)}
            language={language}
          />
        )
      case 4:
        return (
          <BusinessContextStep
            businessContext={data.businessContext}
            mentorApproval={data.mentorApproval}
            onBusinessContextChange={(value) => updateData('businessContext', value)}
            onMentorApprovalChange={(value) => updateData('mentorApproval', value)}
            language={language}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="w-8"></div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">iDEAN AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-full px-3 py-2"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'বাং' : 'EN'}
              </span>
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {currentSteps[currentStep].title}
            </h1>
            <p className="text-gray-500 text-base">{currentSteps[currentStep].description}</p>
          </div>
        </div>

        {/* Animated Visual Element */}
        <div className="flex justify-center mb-8">
          <div className="relative w-20 h-20 transition-all duration-500 ease-out">
            {/* Step-based animated visual */}
            {currentStep === 0 && (
              <div className="flex items-center justify-center h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg animate-pulse-slow flex items-center justify-center">
                    <div className="text-white text-2xl">👤</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-bounce shadow-lg flex items-center justify-center">
                    <div className="text-white text-xs">✓</div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div className="flex items-center justify-center h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg animate-pulse-slow flex items-center justify-center">
                    <div className="text-white text-2xl">🌐</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-ping"></div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="flex items-center justify-center h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg animate-pulse-slow flex items-center justify-center">
                    <div className="text-white text-2xl">🏢</div>
                  </div>
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-yellow-400 rounded-full animate-bounce shadow-md"></div>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="flex items-center justify-center h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-2xl shadow-lg animate-pulse-slow flex items-center justify-center">
                    <div className="text-white text-2xl">📄</div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full animate-spin-slow shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 4 && (
              <div className="flex items-center justify-center h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl shadow-lg animate-pulse-slow flex items-center justify-center">
                    <div className="text-white text-2xl">💬</div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-md"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          {currentSteps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-green-500 ring-2 ring-green-100' 
                    : index === currentStep 
                    ? 'bg-blue-600 ring-2 ring-blue-100 scale-125' 
                    : 'bg-gray-200'
                }`}
              />
              {index < currentSteps.length - 1 && (
                <div 
                  className={`w-8 h-px mx-1 transition-colors duration-300 ${
                    index < currentStep ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        {/* Backend Status Indicator - Only show if needed */}
        {false && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Backend not connected. Some features may not work properly.
            </p>
          </div>
        )}

        {/* Content */}
        <div className="mb-6">
          {renderStep()}
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back' : 'পূর্ববর্তী'}
          </Button>

          {currentStep === currentSteps.length - 1 ? (
            <Button
              onClick={handleFinish}
              disabled={!isStepValid() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 px-6 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Creating...' : 'তৈরি করা হচ্ছে...'}
                </>
              ) : (
                <>
                  {language === 'en' ? 'Complete' : 'সম্পূর্ণ'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 px-6 disabled:opacity-50"
            >
              {language === 'en' ? 'Continue' : 'চালিয়ে যান'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}