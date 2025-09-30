'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Globe, Loader2 } from 'lucide-react'
import BasicInfoStep from '@/components/onboarding/BasicInfoStep'
import WebsiteStep from '@/components/onboarding/WebsiteStep'
import IndustryStep from '@/components/onboarding/IndustryStep'
import KnowledgeBaseStep from '@/components/onboarding/KnowledgeBaseStep'
import BusinessContextStep from '@/components/onboarding/BusinessContextStep'
import { ideanApi } from '@/lib/api/idean-api'

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
  const [isExistingUser, setIsExistingUser] = useState(false)
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

  // Check if user already has businesses (for additional business creation)
  useEffect(() => {
    const checkExistingBusiness = async () => {
      if (!user) return

      try {
        const userResponse = await ideanApi.user.getMe()
        if (userResponse.business) {
          console.log('👤 Existing user detected with business:', userResponse.business.business_name)
          setIsExistingUser(true)
          // Pre-fill user name if available
          if (userResponse.name && !data.userName) {
            updateData('userName', userResponse.name)
          }
        } else {
          console.log('🆕 New user - first business creation')
          setIsExistingUser(false)
        }
      } catch (error) {
        console.log('ℹ️ Could not check existing business status:', error)
        setIsExistingUser(false)
      }
    }

    checkExistingBusiness()
  }, [user, data.userName])

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

    // Prepare business data for API (moved outside try block for proper scope)
    const businessData = {
      business_name: data.businessName.trim(),
      website_url: data.website.trim() || `https://${data.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
      industry_tag: data.industry,
      business_context: data.businessContext.trim() || 'No additional context provided',
      language: language,
      mentor_approval: data.mentorApproval ? 'approved' : 'pending',
      module_select: 'standard' as const,
      readiness_checklist: 'completed'
    }

    try {

      if (isExistingUser) {
        console.log('🏢 Creating additional business for existing user:', businessData.business_name)
      } else {
        console.log('🆕 Creating first business for new user:', businessData.business_name)
      }

      // Debug: Check API URL and authentication
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001')
      console.log('🔐 User authenticated:', !!user)

      let createdBusiness

      // Choose appropriate API method based on user type and documents
      if (data.knowledgeBase.length > 0) {
        // Create business with document upload
        console.log(`📄 Uploading ${data.knowledgeBase.length} document(s)`)

        if (isExistingUser) {
          // Use additional business creation method for existing users
          const response = await ideanApi.business.createAdditionalWithDocument(
            businessData,
            data.knowledgeBase[0] // Upload first document
          )
          console.log('📋 API Response (additional business with documents):', response)
          createdBusiness = response.business
        } else {
          // Use regular method for new users
          const response = await ideanApi.business.createWithDocument(
            businessData,
            data.knowledgeBase[0] // Upload first document
          )
          console.log('📋 API Response (first business with documents):', response)
          createdBusiness = response.business
        }

        console.log('✅ Business created with documents:', createdBusiness)
      } else {
        // Create business without documents
        if (isExistingUser) {
          // Use additional business creation method for existing users
          const response = await ideanApi.business.createAdditional(businessData)
          console.log('📋 API Response (additional business):', response)
          createdBusiness = response
        } else {
          // Use regular method for new users
          const response = await ideanApi.business.create(businessData)
          console.log('📋 API Response (first business):', response)
          createdBusiness = response
        }

        console.log('✅ Business created:', createdBusiness)
      }

      if (!createdBusiness) {
        throw new Error('Business creation failed - no business data returned')
      }

      // Update localStorage as cache
      if (!isExistingUser) {
        // Only set these for first-time users
        localStorage.setItem('onboardingCompleted', 'true')
        localStorage.setItem('hasCompletedOnboarding', 'true')
        localStorage.removeItem('isNewUser')
      }

      // Always update current business info
      const business = 'business' in createdBusiness ? createdBusiness.business : createdBusiness
      localStorage.setItem('businessName', business.business_name)
      localStorage.setItem('industry', business.industry_tag)
      localStorage.setItem('businessId', business.id)
      localStorage.setItem('currentBusiness', JSON.stringify(business))

      // Clear onboarding data
      localStorage.removeItem('onboardingData')

      if (isExistingUser) {
        console.log('🎉 Additional business created successfully!')
        console.log('📊 New business added for existing user:', createdBusiness)
      } else {
        console.log('🎉 First business created successfully!')
        console.log('📊 User onboarding completed:', createdBusiness)
      }

      // Emit business creation event for BusinessContext to pick up
      if (typeof window !== 'undefined') {
        console.log('🎯 Onboarding: Emitting businessCreated event:', {
          businessId: business.id,
          businessName: business.business_name,
          isExistingUser
        })

        window.dispatchEvent(new CustomEvent('businessCreated', {
          detail: business
        }))

        // Also emit business switch event for existing users
        if (isExistingUser) {
          console.log('🔄 Onboarding: Emitting businessSwitched event for existing user')
          window.dispatchEvent(new CustomEvent('businessSwitched', {
            detail: {
              newBusiness: createdBusiness
            }
          }))
        }
      }

      // Small delay to ensure localStorage is written and events are dispatched
      await new Promise(resolve => setTimeout(resolve, 200))

      // Redirect to dashboard
      window.location.href = '/dashboard'

    } catch (error: unknown) {
      console.error('❌ Business creation failed:', error)

      // Handle specific API errors
      let errorMessage = 'Failed to create your business. Please try again.'

      if (error && typeof error === 'object' && 'status' in error) {
        if ((error as any).status === 400) {
          errorMessage = 'Please check your business information and try again.'
        } else if ((error as any).status === 401) {
          errorMessage = 'Authentication failed. Please sign in again.'
        } else if ((error as any).status === 403) {
          errorMessage = 'Permission denied. Please check your account permissions.'
        } else if ((error as any).status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.'
        } else if ((error as any).status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      }

      if (error && typeof error === 'object' && 'message' in error) {
        if ((error as any).message?.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if ((error as any).message?.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.'
        }
      }

      setError(errorMessage)

      // Log detailed error for debugging
      console.log('🔍 Detailed error information:', {
        status: error && typeof error === 'object' && 'status' in error ? (error as any).status : undefined,
        message: error && typeof error === 'object' && 'message' in error ? (error as any).message : undefined,
        name: error && typeof error === 'object' && 'name' in error ? (error as any).name : undefined,
        data: error && typeof error === 'object' && 'data' in error ? (error as any).data : undefined,
        stack: error && typeof error === 'object' && 'stack' in error ? (error as any).stack?.split('\n').slice(0, 5) : undefined
      })

      // Log user authentication status
      if (user) {
        console.log('👤 User info:', {
          id: user.id,
          email: user.email,
          name: user.name
        })
      } else {
        console.log('❌ No user found - this should not happen!')
      }

      // Log the business data we tried to send
      console.log('📋 Business data sent:', businessData)

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
              {isExistingUser ?
                (language === 'en' ? `Create New Business: ${currentSteps[currentStep].title}` : `নতুন ব্যবসা তৈরি করুন: ${currentSteps[currentStep].title}`) :
                currentSteps[currentStep].title
              }
            </h1>
            <p className="text-gray-500 text-base">
              {isExistingUser ?
                (language === 'en' ? `Add another business to your account: ${currentSteps[currentStep].description}` : `আপনার অ্যাকাউন্টে আরেকটি ব্যবসা যোগ করুন: ${currentSteps[currentStep].description}`) :
                currentSteps[currentStep].description
              }
            </p>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[80]">
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