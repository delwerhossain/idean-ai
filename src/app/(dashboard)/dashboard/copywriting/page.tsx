'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  PenTool, 
  Plus, 
  Search,
  Filter,
  AlertTriangle
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

      {/* Search and Filter Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1 max-w-md">
          <div className={`h-10 rounded-md ${shimmerClasses}`}></div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className={`h-10 rounded w-24 ${shimmerClasses}`}></div>
          <div className={`h-10 rounded w-32 ${shimmerClasses}`}></div>
        </div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-idean-navy rounded-lg flex items-center justify-center">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brand & Content Studio</h1>
            <p className="text-gray-600 text-sm sm:text-base">AI-powered content creation and brand development studio</p>
          </div>
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search copywriting frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button onClick={handleSearch} variant="outline" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button className="bg-idean-navy hover:bg-idean-navy-dark flex-1 sm:flex-none">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Create Framework</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>


      {/* Content Assistants */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Content Assistants</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Copywriting Assistant */}
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-orange-300 touch-manipulation group">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 text-base">Copywriting Assistant</h4>
                <p className="text-xs text-orange-600 font-medium">AI Assistant</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Create compelling copy for any purpose with AI-powered writing assistance. Perfect for ads, landing pages, product descriptions, and more.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Interactive AI chat</span>
              </div>
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500 w-full sm:w-auto py-2 px-4 min-h-[36px] shadow touch-manipulation"
              >
                <PenTool className="w-4 h-4 mr-2" />
                <span>Start Writing</span>
              </Button>
            </div>
          </Card>

          {/* Content Marketing Assistant */}
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-blue-300 touch-manipulation group">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 text-base">Content Marketing Assistant</h4>
                <p className="text-xs text-blue-600 font-medium">AI Assistant</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Develop comprehensive content marketing strategies, campaigns, and editorial calendars with AI guidance tailored to your business goals.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Strategic planning</span>
              </div>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 w-full sm:w-auto py-2 px-4 min-h-[36px] shadow touch-manipulation"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>Plan Strategy</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}