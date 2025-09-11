'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
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
  const { data: session, update } = useSession()
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
    if (!session?.user) {
      setError('You must be signed in to complete onboarding')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // First, save all data to localStorage for immediate access
      const localBusinessData = {
        business_name: data.businessName.trim(),
        website_url: data.website.trim() || `https://${data.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
        industry_tag: data.industry,
        business_context: data.businessContext.trim() || undefined,
        language: language,
        mentor_approval: data.mentorApproval ? 'approved' : 'pending',
        module_select: 'standard' as const,
        timestamp: new Date().toISOString()
      }
      
      // Save to localStorage regardless of backend status
      localStorage.setItem('hasCompletedOnboarding', 'true')
      localStorage.setItem('businessName', localBusinessData.business_name)
      localStorage.setItem('industry', localBusinessData.industry_tag)
      localStorage.setItem('businessContext', localBusinessData.business_context || '')
      localStorage.setItem('mentorApproval', localBusinessData.mentor_approval)
      localStorage.setItem('currentBusinessData', JSON.stringify(localBusinessData))
      
      // Try to create business via backend API (optional)
      let business = null
      let backendSuccess = false
      
      try {
        // Prepare business data for backend
        const businessData = {
          ...localBusinessData,
          readiness_checklist: JSON.stringify({
            business_info_complete: true,
            website_linked: !!data.website.trim(),
            industry_selected: true,
            mentor_approval_complete: data.mentorApproval,
            knowledge_base_uploaded: data.knowledgeBase.length > 0
          }),
          business_documents: [], // Will be uploaded separately if files exist
          adds_history: [] // Empty initially
        }
        
        // Validate business data
        const validation = ideanUtils.validateBusinessData(businessData)
        if (!validation.isValid) {
          console.warn('Validation issues (continuing with localStorage):', validation.errors)
        }
        
        console.log('🚀 Attempting to create business via backend:', businessData)
        
        // Create business via backend API
        const businessResponse = await ideanApi.business.create(businessData)
        business = businessResponse.data
        backendSuccess = true
        
        console.log('✅ Business created successfully via backend:', business.id)
        
        // Handle file uploads if any
        if (data.knowledgeBase.length > 0) {
          console.log('📁 Uploading knowledge base files...');
          try {
            for (const file of data.knowledgeBase) {
              await ideanApi.documents.upload(
                file,
                business.id,
                (progress) => console.log(`Upload progress: ${progress}%`)
              )
            }
            console.log('✅ Files uploaded successfully');
          } catch (uploadError) {
            console.warn('⚠️ File upload failed:', uploadError);
            // Continue even if file upload fails
          }
        }
        
        // Update localStorage with backend data
        localStorage.setItem('businessId', business.id)
        localStorage.setItem('currentBusiness', JSON.stringify(business))
        
        // Update session with business info
        await update({
          user: {
            ...session.user,
            businessId: business.id,
            role: 'owner' // User becomes owner of their business
          }
        })
        
      } catch (backendError: any) {
        console.warn('⚠️ Backend API not available, using localStorage fallback:', backendError)
        
        // Create a fallback business object for frontend use
        business = {
          id: `local_${Date.now()}`,
          business_name: localBusinessData.business_name,
          website_url: localBusinessData.website_url,
          industry_tag: localBusinessData.industry_tag,
          business_context: localBusinessData.business_context,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        localStorage.setItem('businessId', business.id)
        localStorage.setItem('currentBusiness', JSON.stringify(business))
        
        console.log('🔄 Using localStorage fallback business:', business.id)
      }
      
      console.log(backendSuccess 
        ? '🎉 Onboarding completed successfully with backend!' 
        : '🎉 Onboarding completed successfully with localStorage fallback!'
      )
      
      // Always redirect to dashboard (works with or without backend)
      window.location.href = '/dashboard'
      
    } catch (error: any) {
      console.error('❌ Onboarding completion failed:', error)
      
      // Handle specific API errors
      if (error.status === 401) {
        setError('Your session has expired. Please sign in again.')
        signIn()
      } else if (error.status === 400) {
        setError(error.message || 'Please check your information and try again.')
      } else if (error.status === 409) {
        setError('A business with this information already exists.')
      } else {
        setError('Failed to complete onboarding. Please try again.')
      }
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
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8"></div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">iD</span>
              </div>
              <span className="font-bold text-lg text-gray-900">iDEAN AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'বাং' : 'EN'}
              </span>
            </Button>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            {currentSteps[currentStep].title}
          </h1>
          <p className="text-sm text-gray-600">{currentSteps[currentStep].description}</p>
        </div>

        {/* Animated Visual Element */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-20 overflow-hidden">
            {/* Step-based animated visual */}
            {currentStep === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="relative animate-float">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-glow"></div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">✨</div>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div className="flex items-center justify-center h-full">
                <div className="relative animate-float">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg animate-glow"></div>
                  <div className="absolute top-1 left-1 w-8 h-8 border-2 border-white rounded animate-spin"></div>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">🌐</div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="flex items-center justify-center h-full">
                <div className="relative animate-float">
                  <div className="w-14 h-14 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full animate-glow"></div>
                  <div className="absolute top-2 left-2 w-10 h-10 border-2 border-white rounded-full animate-spin"></div>
                  <div className="absolute top-4 left-4 w-6 h-6 bg-white rounded-full animate-bounce"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600 text-xs">🏢</div>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="flex items-center justify-center h-full">
                <div className="relative flex space-x-1 animate-float">
                  <div className="w-3 h-12 bg-blue-400 rounded animate-pulse" style={{animationDelay: '0s'}}></div>
                  <div className="w-3 h-8 bg-green-400 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-10 bg-purple-400 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <div className="w-3 h-6 bg-orange-400 rounded animate-pulse" style={{animationDelay: '0.6s'}}></div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-lg">📄</div>
                </div>
              </div>
            )}
            {currentStep === 4 && (
              <div className="flex items-center justify-center h-full">
                <div className="relative animate-float">
                  <div className="w-16 h-12 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-lg animate-glow"></div>
                  <div className="absolute top-1 left-1 right-1 bottom-1 border border-white rounded animate-ping"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs">💬</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {currentSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        {/* Backend Status Indicator */}
        {!session?.backendToken && (
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