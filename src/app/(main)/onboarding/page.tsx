'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
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

const STEPS = [
  { title: 'Basic Info', description: 'Name and business details' },
  { title: 'Website', description: 'Your business website (optional)' },
  { title: 'Industry', description: 'Your business category' },
  { title: 'Documents', description: 'Upload business documents (optional)' },
  { title: 'Context', description: 'Additional business information' }
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('onboardingData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setData(parsedData)
      } catch (error) {
        console.error('Failed to parse saved onboarding data:', error)
      }
    }
  }, [])

  const updateData = (field: keyof OnboardingData, value: string | boolean | File[]) => {
    setData(prev => {
      const newData = { ...prev, [field]: value }
      // Save to localStorage for persistence
      localStorage.setItem('onboardingData', JSON.stringify(newData))
      return newData
    })
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
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
      case 3: return true // Knowledge base is optional
      case 4: return true // Business context is optional
      default: return false
    }
  }

  const handleFinish = () => {
    // Save onboarding completion and redirect to signup
    localStorage.setItem('onboardingCompleted', 'true')
    localStorage.setItem('readyForSignup', 'true')
    window.location.href = '/signup'
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
            language="en"
          />
        )
      case 1:
        return (
          <WebsiteStep
            website={data.website}
            onWebsiteChange={(value) => updateData('website', value)}
            language="en"
          />
        )
      case 2:
        return (
          <IndustryStep
            industry={data.industry}
            onIndustryChange={(value) => updateData('industry', value)}
            language="en"
          />
        )
      case 3:
        return (
          <KnowledgeBaseStep
            knowledgeBase={data.knowledgeBase}
            onKnowledgeBaseChange={(value) => updateData('knowledgeBase', value)}
            language="en"
          />
        )
      case 4:
        return (
          <BusinessContextStep
            businessContext={data.businessContext}
            mentorApproval={data.mentorApproval}
            onBusinessContextChange={(value) => updateData('businessContext', value)}
            onMentorApprovalChange={(value) => updateData('mentorApproval', value)}
            language="en"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Header with login link */}
      <div className="flex justify-between items-center p-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">iA</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">iDEAN AI</span>
        </Link>
        <Link
          href="/login"
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Login
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            {STEPS[currentStep].title}
          </h1>
          <p className="text-gray-500 text-base">
            {STEPS[currentStep].description}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          {STEPS.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-green-500 ring-2 ring-green-100'
                    : index === currentStep
                    ? 'bg-black ring-2 ring-gray-100 scale-125'
                    : 'bg-gray-200'
                }`}
              />
              {index < STEPS.length - 1 && (
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
            Back
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button
              onClick={handleFinish}
              disabled={!isStepValid() || isSubmitting}
              className="bg-black hover:bg-gray-800 px-6 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Complete
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid() || isSubmitting}
              className="bg-black hover:bg-gray-800 px-6 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Privacy Footer */}
      <div className="fixed bottom-16 left-0 right-0 text-center text-sm text-gray-500 pb-4">
        <p>
          Private & secure. See our{' '}
          <Link href="/privacy" className="underline hover:text-gray-700">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Get Started - iDEAN AI',
  description: 'Create your business strategy with iDEAN AI',
}