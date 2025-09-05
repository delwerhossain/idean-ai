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
  { title: 'Basic Information', description: 'Your name and business name' },
  { title: 'Website', description: 'Business website (optional)' },
  { title: 'Industry', description: 'What industry are you in?' },
  { title: 'Knowledge Base', description: 'Upload business documents (max 4 PDFs)' },
  { title: 'Business Context', description: 'Additional business information' }
]

interface OnboardingModalProps {
  onComplete: () => void
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
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
    onComplete()
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to iDEAN AI</h1>
              <p className="text-gray-600">Let&apos;s set up your business information</p>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{STEPS[currentStep].title}</h2>
            <p className="text-gray-600 text-sm mt-1">{STEPS[currentStep].description}</p>
          </div>
          
          {renderStep()}
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button
              onClick={handleFinish}
              disabled={!isStepValid()}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              Complete Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}