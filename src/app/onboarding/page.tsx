'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ClientBusinessStep from '@/components/onboarding/ClientBusinessStep'
import WebsiteStep from '@/components/onboarding/WebsiteStep'
import IndustryStep from '@/components/onboarding/IndustryStep'
import KnowledgeBaseStep from '@/components/onboarding/KnowledgeBaseStep'
import AdditionalInfoStep from '@/components/onboarding/AdditionalInfoStep'

interface OnboardingData {
  clientName: string
  businessName: string
  website: string
  industry: string
  knowledgeBase: File[]
  additionalInfo: string
}

const STEPS = [
  { title: 'Client & Business', description: 'Tell us about yourself and your business' },
  { title: 'Website', description: 'Share your website if you have one' },
  { title: 'Industry', description: 'What industry are you in?' },
  { title: 'Knowledge Base', description: 'Upload relevant documents (max 3 PDFs)' },
  { title: 'Additional Info', description: 'Any other details you\'d like to share' }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    clientName: '',
    businessName: '',
    website: '',
    industry: '',
    knowledgeBase: [],
    additionalInfo: ''
  })

  const updateData = (field: keyof OnboardingData, value: any) => {
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
      case 0: return data.clientName.trim() !== '' && data.businessName.trim() !== ''
      case 1: return true // Website is optional
      case 2: return data.industry.trim() !== ''
      case 3: return true // Knowledge base is optional
      case 4: return true // Additional info is optional
      default: return false
    }
  }

  const handleFinish = () => {
    // Save final data to localStorage
    localStorage.setItem('onboardingData', JSON.stringify(data))
    localStorage.setItem('hasCompletedOnboarding', 'true')
    
    // Save individual fields for easy access
    localStorage.setItem('clientName', data.clientName)
    localStorage.setItem('businessName', data.businessName)
    localStorage.setItem('industry', data.industry)
    localStorage.setItem('website', data.website)
    localStorage.setItem('additionalInfo', data.additionalInfo)
    
    console.log('Onboarding completed:', data)
    window.location.href = '/generate-document'
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ClientBusinessStep
            clientName={data.clientName}
            businessName={data.businessName}
            onClientNameChange={(value) => updateData('clientName', value)}
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
          <AdditionalInfoStep
            additionalInfo={data.additionalInfo}
            onAdditionalInfoChange={(value) => updateData('additionalInfo', value)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to iDEAN AI</h1>
          <p className="text-lg text-gray-600">Let's get started with your business documentation</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-xl">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
              </CardTitle>
              <div className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete
              </div>
            </div>
            <Progress value={((currentStep + 1) / STEPS.length) * 100} className="w-full" />
            <p className="text-gray-600 mt-2">{STEPS[currentStep].description}</p>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        <div className="flex justify-between">
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
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Generate Document
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}