'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import BasicInfoStep from '@/components/onboarding/BasicInfoStep'
import WebsiteStep from '@/components/onboarding/WebsiteStep'
import IndustryStep from '@/components/onboarding/IndustryStep'
import KnowledgeBaseStep from '@/components/onboarding/KnowledgeBaseStep'
import BusinessContextStep from '@/components/onboarding/BusinessContextStep'

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
  { title: 'Basic Info', description: 'Name and business' },
  { title: 'Website', description: 'Optional' },
  { title: 'Industry', description: 'Your market' },
  { title: 'Documents', description: 'Optional PDFs' },
  { title: 'Context', description: 'Additional info' }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    userName: '',
    businessName: '',
    website: '',
    industry: '',
    knowledgeBase: [],
    businessContext: '',
    mentorApproval: false
  })

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
      case 3: return true // Knowledge base is optional (max 4 PDFs)
      case 4: return true // Business context is optional
      default: return false
    }
  }

  const handleFinish = () => {
    // Save final data to localStorage
    localStorage.setItem('onboardingData', JSON.stringify(data))
    localStorage.setItem('hasCompletedOnboarding', 'true')
    
    // Save individual fields for easy access
    localStorage.setItem('userName', data.userName)
    localStorage.setItem('businessName', data.businessName)
    localStorage.setItem('industry', data.industry)
    localStorage.setItem('website', data.website)
    localStorage.setItem('businessContext', data.businessContext)
    localStorage.setItem('mentorApproval', data.mentorApproval.toString())
    
    console.log('Onboarding completed:', data)
    window.location.href = '/dashboard'
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
          />
        )
      case 1:
        return (
          <WebsiteStep
            website={data.website}
            onWebsiteChange={(value) => updateData('website', value)}
          />
        )
      case 2:
        return (
          <IndustryStep
            industry={data.industry}
            onIndustryChange={(value) => updateData('industry', value)}
          />
        )
      case 3:
        return (
          <KnowledgeBaseStep
            knowledgeBase={data.knowledgeBase}
            onKnowledgeBaseChange={(value) => updateData('knowledgeBase', value)}
          />
        )
      case 4:
        return (
          <BusinessContextStep
            businessContext={data.businessContext}
            mentorApproval={data.mentorApproval}
            onBusinessContextChange={(value) => updateData('businessContext', value)}
            onMentorApprovalChange={(value) => updateData('mentorApproval', value)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">iD</span>
            </div>
            <span className="font-bold text-xl text-gray-900">iDEAN AI</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {STEPS[currentStep].title}
          </h1>
          <p className="text-gray-600">{STEPS[currentStep].description}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center space-x-2 mb-12">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-12">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
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
              disabled={!isStepValid()}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              Complete
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}