'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ideanApi, BrandingLab } from '@/lib/api/idean-api'
import { GenerationStudio } from '@/components/generation/GenerationStudio'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function BrandingLabGenerationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const brandingLabId = params.id as string

  const [brandingLab, setBrandingLab] = useState<BrandingLab | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadBrandingLab = async () => {
      if (!brandingLabId || !user) return

      try {
        setLoading(true)
        setError(null)

        const response = await ideanApi.brandingLab.getById(brandingLabId)
        setBrandingLab(response.data)
      } catch (err: any) {
        console.error('Failed to load branding lab framework:', err)
        setError('Failed to load branding lab framework. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadBrandingLab()
  }, [brandingLabId, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading branding lab framework...</p>
        </div>
      </div>
    )
  }

  if (error || !brandingLab) {
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
            {error || 'The branding lab framework you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => router.push('/dashboard/branding-lab')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Branding Lab
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
              onClick={() => router.push('/dashboard/branding-lab')}
              className="w-fit"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {brandingLab.name}
              </h1>
              {brandingLab.description && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base line-clamp-2">
                  {brandingLab.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Studio */}
      <GenerationStudio
        type="branding-lab"
        framework={brandingLab}
        onBack={() => router.push('/dashboard/branding-lab')}
      />
    </div>
  )
}