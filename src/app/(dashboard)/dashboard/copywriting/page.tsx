'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Input } from '@/components/ui/input'
import { 
  PenTool, 
  Plus, 
  Search,
  Filter,
  AlertTriangle
} from 'lucide-react'
import { ideanApi, Copywriting } from '@/lib/api/idean-api'

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
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading copywriting frameworks...</span>
        </div>
      </div>
    )
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Copywriting</h1>
            <p className="text-gray-600 text-sm sm:text-base">Content generation frameworks for campaigns and marketing</p>
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


      {/* Copywriting Frameworks */}
      {copywritings.length > 0 ? (
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Available Copywriting Frameworks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {copywritings.map((copywriting) => (
              <Card key={copywriting.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleCopywritingClick(copywriting)}>
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{copywriting.name}</h4>
                    <p className="text-xs text-gray-500">Framework</p>
                  </div>
                </div>

                {copywriting.description && (
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {copywriting.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {copywriting.input_fields && (
                      <span>{copywriting.input_fields.length} inputs</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopywritingClick(copywriting)
                    }}
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Generate Copy</span>
                    <span className="sm:hidden">Generate</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-6 sm:mb-8">
          <Card className="p-8 text-center">
            <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Copywriting Frameworks Found</h3>
            <p className="text-gray-600 mb-4">
              {user ? 
                "No copywriting frameworks are available yet. Create your first framework to get started." :
                "Please sign in to view and use copywriting frameworks."
              }
            </p>
            {user && (
              <Button className="bg-idean-navy hover:bg-idean-navy-dark">
                <Plus className="w-4 h-4 mr-2" />
                Create First Framework
              </Button>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}