'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  PenTool,
  Search,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import { ideanApi, Copywriting } from '@/lib/api/idean-api'

// Skeleton Loading Component with Pulse Animation
function CopywritingSkeletonLoader() {
  const shimmerClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200"

  return (
    <div className="p-3 sm:p-6">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg ${shimmerClasses}`}></div>
          <div>
            <div className={`h-8 rounded w-48 mb-2 ${shimmerClasses}`}></div>
            <div className={`h-4 rounded w-80 ${shimmerClasses}`}></div>
          </div>
        </div>
        <div className={`h-6 rounded w-64 mt-4 ${shimmerClasses}`}></div>
      </div>

      {/* Search Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1 max-w-md">
          <div className={`h-10 rounded-md ${shimmerClasses}`}></div>
        </div>
        <div className={`h-10 rounded w-24 ${shimmerClasses}`}></div>
      </div>

      {/* Frameworks Grid Skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className={`h-6 rounded w-64 mb-3 sm:mb-4 ${shimmerClasses}`}></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Card Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${shimmerClasses}`}></div>
                <div className="flex-1">
                  <div className={`h-4 rounded w-32 mb-1 ${shimmerClasses}`}></div>
                  <div className={`h-3 rounded w-16 ${shimmerClasses}`}></div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4 space-y-2">
                <div className={`h-3 rounded w-full ${shimmerClasses}`}></div>
                <div className={`h-3 rounded w-4/5 ${shimmerClasses}`}></div>
                <div className={`h-3 rounded w-3/5 ${shimmerClasses}`}></div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className={`h-3 rounded w-16 ${shimmerClasses}`}></div>
                <div className={`h-8 rounded w-24 ${shimmerClasses}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Loading Indicator */}
      <div className="flex flex-col items-center justify-center mt-8 space-y-4">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="text-center">
          <p className="text-gray-600 font-medium">Loading copywriting frameworks...</p>
          <p className="text-sm text-gray-500 mt-1">Preparing your AI-powered content generation tools</p>
        </div>
      </div>
    </div>
  )
}

export default function CopywritingPage() {
  const { user } = useAuth()
  const [copywritings, setCopywritings] = useState<Copywriting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [showTutorialModal, setShowTutorialModal] = useState(false)

  const loadCopywritings = useCallback(async () => {
    if (hasLoaded) return
    
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        console.log('User not authenticated - no frameworks to load')
        setCopywritings([])
        return
      }

      // Load copywriting frameworks from backend
      const response = await ideanApi.copywriting.getAll({
        limit: 50,
        search: searchTerm
      })

      const copywritingData = response.copyWritings || []
      console.log('✅ Fetched copywriting frameworks:', copywritingData.length)
      setCopywritings(copywritingData)

    } catch (err: unknown) {
      console.error('Failed to load copywriting frameworks:', err)
      setError('Failed to load copywriting frameworks. Please try again.')
      setCopywritings([])
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }, [hasLoaded, searchTerm, user])

  useEffect(() => {
    if (!hasLoaded) {
      loadCopywritings()
    }
  }, [hasLoaded, loadCopywritings])

  const handleSearch = () => {
    setHasLoaded(false)
  }

  const handleCopywritingClick = (copywriting: Copywriting) => {
    // Navigate to the generation page with the real copywriting framework ID
    window.open(`/dashboard/copywriting/${copywriting.id}`, '_blank')
  }



  if (loading) {
    return <CopywritingSkeletonLoader />
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Frameworks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadCopywritings} variant="outline">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-idean-navy rounded-lg flex items-center justify-center">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brand & Content Studio</h1>
              <p className="text-gray-600 text-sm sm:text-base">AI-powered content creation and brand development studio</p>
            </div>
          </div>
          <Button
            onClick={() => setShowTutorialModal(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Watch Tutorial
          </Button>
        </div>

        {user ? (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md inline-block">
            ✅ Backend connected - Full AI capabilities available
          </div>
        ) : (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md inline-block">
            ⚡ Demo mode - Connect backend for AI generation
          </div>
        )}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search copywriting frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <Button onClick={handleSearch} variant="outline" className="flex-1 sm:flex-none">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>
      {/* Available Frameworks */}
      <div className="mb-6 sm:mb-8" data-frameworks-section>
        {copywritings.length > 0 ? (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Available Frameworks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {copywritings.map((copywriting) => (
                <Card
                  key={copywriting.id}
                  className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-gray-300"
                  onClick={() => handleCopywritingClick(copywriting)}
                >
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <PenTool className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-base">{copywriting.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">Framework</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {copywriting.description || 'Advanced copywriting framework for creating compelling content.'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Click to start
                    </div>
                    <Button size="sm" variant="outline">
                      Use Framework
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Copywriting Frameworks</h3>
            <Card className="p-6 text-center">
              <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No frameworks available</h4>
              <p className="text-gray-600 mb-4">
                Connect to the backend to access our library of proven copywriting frameworks and templates.
              </p>
              <Button onClick={loadCopywritings} variant="outline">
                Retry Loading
              </Button>
            </Card>
          </>
        )}
      </div>

      {/* Tutorial Modal */}
      {showTutorialModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowTutorialModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-idean-navy p-6 text-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PenTool className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">How to Use Copywriting Frameworks</h2>
                    <p className="text-blue-100 mt-1">Learn to create compelling content with AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTutorialModal(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* YouTube Video */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/f0i37zHn-e0?si=TGloS0i_06ijh1Bt"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>

              {/* Tutorial Steps */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Quick Start Guide</h3>

                <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-idean-navy text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Choose a Framework</h4>
                    <p className="text-gray-600 text-sm">Browse and select a copywriting framework that matches your content goals.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-idean-navy text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Fill in Details</h4>
                    <p className="text-gray-600 text-sm">Provide information about your product, audience, and goals to guide the AI.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-idean-navy text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Generate & Edit</h4>
                    <p className="text-gray-600 text-sm">Click generate, review the AI-created content, and refine it to perfection.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={() => setShowTutorialModal(false)}
                className="bg-idean-navy hover:bg-idean-navy-dark text-white w-full"
              >
                Got it, Let's Create Content!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}