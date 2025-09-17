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
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  Mail,
  Share2,
  TrendingUp,
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

      // Load real copywriting data from backend
      try {
        const response = await ideanApi.copywriting.getAll({
          limit: 50,
          search: searchTerm
        })

        // Backend returns copyWritings array directly
        const copywritingData = response.copyWritings || []
        console.log('✅ Fetched copywriting data from backend:', copywritingData)
        setCopywritings(copywritingData)

        if (copywritingData.length > 0) {
          console.log(`✅ Loaded ${copywritingData.length} custom copywriting frameworks from backend`)
        } else {
          console.log('ℹ️ No custom copywriting frameworks found - using predefined frameworks only')
        }

      } catch (err: any) {
        console.log('⚠️ Backend copywriting data not available:', err?.message || 'Unknown error')
        console.log('Using predefined frameworks only')
        // No copywriting data available - that's fine, use predefined frameworks
        setCopywritings([])
      }
    } catch (err: unknown) {
      console.error('Failed to load copywriting frameworks:', err)
      setError('Failed to load copywriting frameworks. Please try again.')
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }, [hasLoaded, searchTerm])

  useEffect(() => {
    if (!hasLoaded) {
      loadCopywritings()
    }
  }, [hasLoaded, loadCopywritings])

  const handleSearch = () => {
    setHasLoaded(false)
  }

  const handleFrameworkClick = (framework: { id: string }) => {
    // Navigate to the generation page with the framework ID
    window.open(`/dashboard/copywriting/${framework.id}`, '_blank')
  }

  const handleCopywritingClick = (copywriting: Copywriting) => {
    // Navigate to the generation page with the real copywriting framework ID
    window.open(`/dashboard/copywriting/${copywriting.id}`, '_blank')
  }


  const predefinedFrameworks = [
    {
      id: 'neuro-copy',
      name: 'NeuroCopywriting™',
      description: 'Psychology-driven copywriting that triggers buying behavior',
      category: 'Psychology',
      icon: Zap,
      color: 'bg-idean-navy',
      estimatedTime: '15-20 minutes'
    },
    {
      id: 'nuclear-content',
      name: 'Nuclear Content™',
      description: 'Viral content creation framework for maximum engagement',
      category: 'Content',
      icon: TrendingUp,
      color: 'bg-idean-navy',
      estimatedTime: '20-25 minutes'
    },
    {
      id: 'email-sequences',
      name: 'Email Sequence Builder',
      description: 'Automated email campaigns that convert and nurture',
      category: 'Email',
      icon: Mail,
      color: 'bg-gray-500',
      estimatedTime: '25-30 minutes'
    },
    {
      id: 'social-copy',
      name: 'Social Media Copy',
      description: 'Platform-optimized social media content generation',
      category: 'Social',
      icon: Share2,
      color: 'bg-emerald-500',
      estimatedTime: '10-15 minutes'
    },
    {
      id: 'sales-pages',
      name: 'Sales Page Framework',
      description: 'High-converting sales pages with proven structures',
      category: 'Sales',
      icon: Target,
      color: 'bg-idean-charcoal',
      estimatedTime: '30-40 minutes'
    },
    {
      id: 'ad-copy',
      name: 'Ad Copy Generator',
      description: 'Facebook, Google, and native ad copy that converts',
      category: 'Advertising',
      icon: Sparkles,
      color: 'bg-gray-600',
      estimatedTime: '12-18 minutes'
    }
  ]

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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-idean-navy rounded-lg flex items-center justify-center">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Copywriting</h1>
            <p className="text-gray-600">Content generation frameworks for campaigns and marketing</p>
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
      <div className="flex items-center gap-4 mb-8">
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
        <Button onClick={handleSearch} variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button className="bg-idean-navy hover:bg-idean-navy-dark">
          <Plus className="w-4 h-4 mr-2" />
          Create Framework
        </Button>
      </div>


      {/* Custom Frameworks from Backend */}
      {copywritings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Copywriting Frameworks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copywritings.map((copywriting) => (
              <Card key={copywriting.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleCopywritingClick(copywriting)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <PenTool className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{copywriting.name}</h4>
                    <p className="text-xs text-gray-500">Custom Framework</p>
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
                  >
                    Generate Copy
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Content Types Overview */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <h4 className="font-medium text-gray-900 text-sm mb-1">Sales Copy</h4>
          <p className="text-xs text-gray-500">Converting sales pages</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <h4 className="font-medium text-gray-900 text-sm mb-1">Viral Content</h4>
          <p className="text-xs text-gray-500">Engaging social posts</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-medium text-gray-900 text-sm mb-1">Email Sequences</h4>
          <p className="text-xs text-gray-500">Nurturing campaigns</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <h4 className="font-medium text-gray-900 text-sm mb-1">Ad Copy</h4>
          <p className="text-xs text-gray-500">Converting advertisements</p>
        </Card>
      </div> */}

      {/* Quick Start Guide */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-idean-navy rounded-lg flex items-center justify-center">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Getting Started with AI Copywriting</h3>
            <p className="text-sm text-gray-600 mb-3">
              Generate high-converting copy with proven frameworks from top marketers and behavioral psychology.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>• 10-40 minutes per framework</span>
              <span>• Multiple copy variations</span>
              <span>• A/B testing templates</span>
            </div>
          </div>
          <Button
            className="bg-idean-navy hover:bg-idean-navy-dark"
            onClick={() => {
              if (copywritings.length > 0) {
                handleCopywritingClick(copywritings[0])
              } else {
                // Fallback to first predefined framework if no backend data
                handleFrameworkClick(predefinedFrameworks[0])
              }
            }}
          >
            Generate Your First Copy
          </Button>
        </div>
      </Card>

    </div>
  )
}