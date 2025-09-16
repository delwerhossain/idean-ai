'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, AlertCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ideanApi, Copywriting } from '@/lib/api/idean-api'
import { GenerationStudio } from '@/components/generation/GenerationStudio'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function CopywritingGenerationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const copywritingId = params.id as string

  const [copywriting, setCopywriting] = useState<Copywriting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCopywriting = async () => {
      if (!copywritingId) return

      try {
        setLoading(true)
        setError(null)

        console.log('Loading copywriting framework with ID:', copywritingId)

        // Check if this is a predefined framework ID first
        const predefinedFrameworks = {
          'neuro-copy': {
            id: 'neuro-copy',
            name: 'NeuroCopywriting™',
            description: 'Psychology-driven copywriting that triggers buying behavior using proven neuromarketing principles',
            input_fields: [
              'productName:string',
              'targetAudience:string',
              'painPoint:string',
              'mainBenefit:string',
              'socialProof:string',
              'additionalInstructions:text'
            ],
            system_prompt: 'You are an expert copywriter specializing in neuropsychology-based persuasion. Create compelling copy that triggers buying behavior using psychological triggers, emotional appeals, and cognitive biases.',
            user_starting_prompt: 'Let\'s create powerful conversion copy using proven psychological triggers and neuromarketing principles.'
          },
          'sales-pages': {
            id: 'sales-pages',
            name: 'Sales Page Framework',
            description: 'High-converting sales pages with proven structures and psychological elements',
            input_fields: [
              'productName:string',
              'targetAudience:string',
              'problemDescription:string',
              'solutionBenefits:string',
              'ctaText:string',
              'pricePoint:string',
              'additionalInstructions:text'
            ],
            system_prompt: 'You are an expert sales page copywriter. Create high-converting sales pages using proven frameworks like AIDA, PAS, and Before-After-Bridge.',
            user_starting_prompt: 'Let\'s build a compelling sales page that converts visitors into customers using proven sales frameworks.'
          },
          'nuclear-content': {
            id: 'nuclear-content',
            name: 'Nuclear Content™',
            description: 'Viral content creation framework for maximum engagement',
            input_fields: [
              'contentTopic:string',
              'targetAudience:string',
              'platform:string',
              'contentGoal:string',
              'brandVoice:string',
              'additionalInstructions:text'
            ],
            system_prompt: 'You are an expert viral content creator. Create engaging, shareable content that maximizes reach and engagement using proven viral mechanics.',
            user_starting_prompt: 'Let\'s create viral content that captures attention and drives massive engagement.'
          },
          'ad-copy': {
            id: 'ad-copy',
            name: 'Facebook Ad Copy',
            description: 'High-converting Facebook ad copy that drives clicks and conversions',
            input_fields: [
              'productName:string',
              'targetAudience:string',
              'adGoal:string',
              'keyBenefit:string',
              'callToAction:string',
              'additionalInstructions:text'
            ],
            system_prompt: 'You are an expert Facebook ads copywriter. Create compelling ad copy that captures attention, builds interest, and drives conversions.',
            user_starting_prompt: 'Let\'s create high-converting Facebook ad copy that drives results.'
          },
          'email-sequences': {
            id: 'email-sequences',
            name: 'Email Marketing Sequences',
            description: 'Automated email sequences that nurture leads and drive conversions',
            input_fields: [
              'campaignGoal:string',
              'targetAudience:string',
              'productService:string',
              'sequenceType:string',
              'brandTone:string',
              'additionalInstructions:text'
            ],
            system_prompt: 'You are an expert email marketer. Create effective email sequences that build relationships, provide value, and convert subscribers into customers.',
            user_starting_prompt: 'Let\'s build an email sequence that nurtures leads and drives conversions.'
          }
        }

        // Check for predefined framework first
        if (predefinedFrameworks[copywritingId as keyof typeof predefinedFrameworks]) {
          console.log('Loading predefined framework:', copywritingId)
          const framework = predefinedFrameworks[copywritingId as keyof typeof predefinedFrameworks]
          setCopywriting({
            ...framework,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          return
        }

        // If not predefined, check if user is authenticated for backend frameworks
        if (!user) {
          setError('Please sign in to access custom copywriting frameworks.')
          return
        }

        // Try to load from backend
        const response = await ideanApi.copywriting.getById(copywritingId)
        console.log('Copywriting framework loaded from backend:', response)
        setCopywriting(response)
      } catch (err: unknown) {
        console.error('Failed to load copywriting framework:', err)

        // Handle specific error cases
        if (err && typeof err === 'object' && 'status' in err) {
          if ((err as any).status === 401) {
            setError('Authentication required. Please sign in to access this framework.')
          } else if ((err as any).status === 404) {
            setError('Copywriting framework not found. It may have been deleted or you may not have access.')
          } else {
            setError((err as any).message || 'Failed to load copywriting framework. Please try again.')
          }
        } else {
          setError('Failed to load copywriting framework. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadCopywriting()
  }, [copywritingId, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-700 font-medium">Loading copywriting framework...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up your AI-powered content studio</p>
        </div>
      </div>
    )
  }

  if (error || !copywriting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-lg text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Framework Not Found
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error || 'The copywriting framework you\'re looking for doesn\'t exist or may have been moved.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/dashboard/copywriting')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Copywriting
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50">
       {/* Generation Studio - Responsive Height with proper spacing */}
      <div className="h-screen w-full flex flex-col">
        <GenerationStudio
          type="copywriting"
          framework={copywriting}
          onBack={() => router.push('/dashboard/copywriting')}
        />
      </div>
    </div>
  )
}