'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Loader2 } from 'lucide-react'
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
          }
        }

        // Check for predefined framework first
        if (predefinedFrameworks[copywritingId as keyof typeof predefinedFrameworks]) {
          console.log('Loading predefined framework:', copywritingId)
          setCopywriting(predefinedFrameworks[copywritingId as keyof typeof predefinedFrameworks])
          return
        }

        // If not predefined, check if user is authenticated for backend frameworks
        if (!user) {
          setError('Please sign in to access custom copywriting frameworks.')
          return
        }

        // Try to load from backend
        const response = await ideanApi.copywriting.getById(copywritingId)
        console.log('Copywriting framework loaded from backend:', response.data)
        setCopywriting(response.data)
      } catch (err: any) {
        console.error('Failed to load copywriting framework:', err)

        // Handle specific error cases
        if (err.status === 401) {
          setError('Authentication required. Please sign in to access this framework.')
        } else if (err.status === 404) {
          setError('Copywriting framework not found. It may have been deleted or you may not have access.')
        } else {
          setError(err.message || 'Failed to load copywriting framework. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadCopywriting()
  }, [copywritingId, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading copywriting framework...</p>
        </div>
      </div>
    )
  }

  if (error || !copywriting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Framework Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The copywriting framework you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => router.push('/dashboard/copywriting')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Copywriting
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/copywriting')}
              className="w-fit"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {copywriting.name}
              </h1>
              {copywriting.description && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base line-clamp-2">
                  {copywriting.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Studio */}
      <GenerationStudio
        type="copywriting"
        framework={copywriting}
        onBack={() => router.push('/dashboard/copywriting')}
      />
    </div>
  )
}