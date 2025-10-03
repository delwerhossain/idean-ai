'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ideanApi, Copywriting, Template } from '@/lib/api/idean-api'
import { GenerationStudio } from '@/components/generation/GenerationStudio'
import { LoadingState } from '@/components/ui/loading-states'

export default function CopywritingGenerationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const copywritingId = params.id as string

  // Template loading support - get from URL safely
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState<string | null>(null)

  // Extract URL parameters on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setTemplateId(urlParams.get('templateId'))
      setTemplateName(urlParams.get('templateName'))
    }
  }, [])

  const [copywriting, setCopywriting] = useState<Copywriting | null>(null)
  const [template, setTemplate] = useState<Template | null>(null)
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
        if (templateId) {
          console.log('Loading with template ID:', templateId, 'Name:', templateName)
        }

        // Load framework from backend API
        const response = await ideanApi.copywriting.getById(copywritingId)
        console.log('✅ Backend copywriting framework loaded:', response)
        setCopywriting(response)

        // Load template data if templateId is provided
        if (templateId) {
          try {
            console.log('Loading template data...')
            const templateResponse = await ideanApi.templates.getById(templateId)
            console.log('✅ Template data loaded:', templateResponse)
            setTemplate(templateResponse)
          } catch (templateErr) {
            console.error('Failed to load template:', templateErr)
            // Don't fail the entire page if template loading fails
            // Just proceed without template data
          }
        }

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
  }, [copywritingId, user, templateId])

  if (loading) {
    return (
      <LoadingState
        message="Loading copywriting framework..."
        submessage="Setting up your AI-powered content studio"
        variant="brand"
        size="lg"
      />
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
          template={template}
          onBack={() => router.push('/dashboard/templates')}
        />
      </div>
    </div>
  )
}