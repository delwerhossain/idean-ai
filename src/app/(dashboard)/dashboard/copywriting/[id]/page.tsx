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
      if (!copywritingId || !user) {
        setError('Authentication required to access copywriting frameworks.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log('Loading copywriting framework with ID:', copywritingId)

        // Load framework from backend API
        const response = await ideanApi.copywriting.getById(copywritingId)
        console.log('✅ Backend copywriting framework loaded:', response)
        setCopywriting(response)

      } catch (err: unknown) {
        console.error(`Failed to load copywriting framework '${copywritingId}':`, err)

        // Handle specific error cases
        if (err && typeof err === 'object' && 'status' in err) {
          if ((err as any).status === 401) {
            setError('Authentication required. Please sign in to access this framework.')
          } else if ((err as any).status === 404) {
            setError(`Copywriting framework not found. It may have been deleted or you may not have access.`)
          } else {
            setError((err as any).message || `Failed to load framework. Please try again.`)
          }
        } else {
          setError(`Failed to load copywriting framework. Please try again.`)
        }
      } finally {
        setLoading(false)
      }
    }

    loadCopywriting()
  }, [copywritingId, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          </div>
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-700 font-medium text-sm sm:text-base">Loading copywriting framework...</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">Setting up your AI-powered content studio</p>
        </div>
      </div>
    )
  }

  if (error || !copywriting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="p-6 sm:p-8 w-full max-w-lg text-center shadow-lg">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Framework Not Found
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
            {error || 'The copywriting framework you\'re looking for doesn\'t exist or may have been moved.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/dashboard/copywriting')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Copywriting</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto"
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