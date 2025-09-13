'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ideanApi, GrowthCopilot } from '@/lib/api/idean-api'
import { GenerationStudio } from '@/components/generation/GenerationStudio'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function GrowthCopilotGenerationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const growthCopilotId = params.id as string

  const [growthCopilot, setGrowthCopilot] = useState<GrowthCopilot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGrowthCopilot = async () => {
      if (!growthCopilotId || !user) return

      try {
        setLoading(true)
        setError(null)

        const response = await ideanApi.growthCopilot.getById(growthCopilotId)
        setGrowthCopilot(response.data)
      } catch (err: any) {
        console.error('Failed to load growth copilot framework:', err)
        setError('Failed to load growth copilot framework. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadGrowthCopilot()
  }, [growthCopilotId, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading growth copilot framework...</p>
        </div>
      </div>
    )
  }

  if (error || !growthCopilot) {
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
            {error || 'The growth copilot framework you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => router.push('/dashboard/growth-copilot')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Growth Co-Pilot
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
              onClick={() => router.push('/dashboard/growth-copilot')}
              className="w-fit"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {growthCopilot.name}
              </h1>
              {growthCopilot.description && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base line-clamp-2">
                  {growthCopilot.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Studio */}
      <GenerationStudio
        type="growth-copilot"
        framework={growthCopilot}
        onBack={() => router.push('/dashboard/growth-copilot')}
      />
    </div>
  )
}