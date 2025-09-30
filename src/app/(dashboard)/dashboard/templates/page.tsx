'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Palette,
  PenTool,
  TrendingUp,
  AlertTriangle,
  Clock,
  Tag,
  User,
  RefreshCw
} from 'lucide-react'
import { ideanApi, Template } from '@/lib/api/idean-api'

// Skeleton Loading Component for Templates Page
function TemplatesSkeletonLoader() {
  const shimmerClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200"

  return (
    <div className="p-3 sm:p-6">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg ${shimmerClasses}`}></div>
          <div>
            <div className={`h-8 rounded w-32 mb-2 ${shimmerClasses}`}></div>
            <div className={`h-4 rounded w-80 ${shimmerClasses}`}></div>
          </div>
        </div>
        <div className={`h-6 rounded w-80 mt-4 ${shimmerClasses}`}></div>
      </div>

      {/* Search and Filter Skeleton */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 max-w-md">
            <div className={`h-10 rounded-md ${shimmerClasses}`}></div>
          </div>
          <div className={`h-10 rounded w-20 ${shimmerClasses}`}></div>
        </div>

        {/* Category Filter Skeleton */}
        <div className="flex flex-wrap items-center gap-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className={`h-8 rounded w-16 ${shimmerClasses}`}></div>
          ))}
        </div>

        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <div className={`h-8 rounded w-20 ${shimmerClasses}`}></div>
          <div className={`h-8 rounded w-28 ${shimmerClasses}`}></div>
        </div>
      </div>

      {/* Templates Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Template Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${shimmerClasses}`}></div>
                <div className="min-w-0 flex-1">
                  <div className={`h-4 rounded w-32 mb-2 ${shimmerClasses}`}></div>
                  <div className={`h-3 rounded w-20 ${shimmerClasses}`}></div>
                </div>
              </div>
              <div className={`w-8 h-8 rounded ${shimmerClasses}`}></div>
            </div>

            {/* Template Description */}
            <div className="mb-4">
              <div className="space-y-2 mb-2">
                <div className={`h-3 rounded w-full ${shimmerClasses}`}></div>
                <div className={`h-3 rounded w-4/5 ${shimmerClasses}`}></div>
                <div className={`h-3 rounded w-3/5 ${shimmerClasses}`}></div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`h-3 rounded w-12 ${shimmerClasses}`}></div>
                <div className={`h-3 rounded w-16 ${shimmerClasses}`}></div>
              </div>
            </div>

            {/* Template Footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 gap-3 sm:gap-0">
              <div className={`h-3 rounded w-20 ${shimmerClasses}`}></div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className={`h-8 rounded w-8 ${shimmerClasses}`}></div>
                <div className={`h-8 rounded w-24 ${shimmerClasses}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Creation Guide Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
            <div className={`w-12 h-12 rounded-lg mx-auto mb-4 ${shimmerClasses}`}></div>
            <div className={`h-4 rounded w-32 mx-auto mb-2 ${shimmerClasses}`}></div>
            <div className="space-y-1 mb-4">
              <div className={`h-3 rounded w-full ${shimmerClasses}`}></div>
              <div className={`h-3 rounded w-4/5 mx-auto ${shimmerClasses}`}></div>
            </div>
            <div className={`h-8 rounded w-32 mx-auto ${shimmerClasses}`}></div>
          </div>
        ))}
      </div>

      {/* Quick Start Guide Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${shimmerClasses}`}></div>
          <div className="flex-1">
            <div className={`h-4 rounded w-40 mb-1 ${shimmerClasses}`}></div>
            <div className="space-y-1 mb-3">
              <div className={`h-3 rounded w-full ${shimmerClasses}`}></div>
              <div className={`h-3 rounded w-3/4 ${shimmerClasses}`}></div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`h-3 rounded w-32 ${shimmerClasses}`}></div>
              <div className={`h-3 rounded w-28 ${shimmerClasses}`}></div>
              <div className={`h-3 rounded w-24 ${shimmerClasses}`}></div>
            </div>
          </div>
          <div className={`h-10 rounded w-32 ${shimmerClasses}`}></div>
        </div>
      </div>

      {/* Enhanced Loading Indicator */}
      <div className="flex flex-col items-center justify-center mt-8 space-y-4">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <div className="text-center">
          <p className="text-gray-600 font-medium">Loading templates...</p>
          <p className="text-sm text-gray-500 mt-1">Preparing your reusable business frameworks</p>
        </div>
      </div>
    </div>
  )
}

// Memoized Template Card Component
const TemplateCard = memo(({ template, onUseTemplate }: { template: Template; onUseTemplate: (template: Template) => void }) => {
  const getCategoryIcon = (template: Template) => {
    if (template.serviceType === 'brandinglab' || template.brandinglab || template.brandinglabId) return Palette
    if (template.serviceType === 'growthcopilot' || template.growthcopilot || template.growthcopilotId) return TrendingUp
    if (template.serviceType === 'copywriting' || template.copywriting || template.copywritingId) return PenTool
    return FileText
  }

  const getCategoryColor = (template: Template) => {
    if (template.serviceType === 'brandinglab' || template.brandinglab || template.brandinglabId) return 'bg-purple-500'
    if (template.serviceType === 'growthcopilot' || template.growthcopilot || template.growthcopilotId) return 'bg-blue-500'
    if (template.serviceType === 'copywriting' || template.copywriting || template.copywritingId) return 'bg-orange-500'
    return 'bg-gray-500'
  }

  const getCategoryName = (template: Template) => {
    if (template.serviceType === 'brandinglab' || template.brandinglab || template.brandinglabId) return 'Branding Lab'
    if (template.serviceType === 'growthcopilot' || template.growthcopilot || template.growthcopilotId) return 'Growth Co-pilot'
    if (template.serviceType === 'copywriting' || template.copywriting || template.copywritingId) return 'Copywriting'
    return 'Custom Template'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const Icon = getCategoryIcon(template)
  const categoryColor = getCategoryColor(template)
  const categoryName = getCategoryName(template)

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onUseTemplate(template)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 ${categoryColor} rounded-lg flex items-center justify-center`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{template.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Tag className="w-3 h-3" />
              <span>{categoryName}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-4">
        {template.user_given_prompt && (
          <p className="text-sm text-gray-600 mb-2">
            {template.user_given_prompt.length > 120
              ? template.user_given_prompt.substring(0, 120) + '...'
              : template.user_given_prompt}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {template.text_input_queries && (
            <span>{template.text_input_queries.length} inputs</span>
          )}
          {template.documentIds && template.documentIds.length > 0 && (
            <span>{template.documentIds.length} documents</span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 gap-3 sm:gap-0">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatDate(template.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button size="sm" variant="ghost" className="flex-shrink-0">
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={(e) => {
              e.stopPropagation()
              onUseTemplate(template)
            }}
          >
            <span className="hidden sm:inline">Use Template</span>
            <span className="sm:hidden">Use</span>
          </Button>
        </div>
      </div>
    </Card>
  )
})

TemplateCard.displayName = 'TemplateCard'

export default function TemplatesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [cardsLoading, setCardsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'my-templates' | 'brandinglab' | 'growthcopilot' | 'copywriting'>('my-templates')
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const loadTemplates = useCallback(async (forceFullLoad = false) => {
    console.log('Loading templates for category:', selectedCategory, 'User:', user?.email)

    try {
      // Use different loading states based on initial load vs filter changes
      if (isInitialLoad || forceFullLoad) {
        setLoading(true)
      } else {
        setCardsLoading(true)
      }
      setError(null)

      let response
      let allTemplates: Template[] = []

      // Load user's templates using the correct endpoint
      console.log('Loading user templates...')

      if (selectedCategory === 'all' || selectedCategory === 'my-templates') {
        // Get user's own templates
        if (user) {
          try {
            response = await ideanApi.templates.getMyTemplates({
              limit: 50
            })
            console.log('My Templates API response:', response)
          } catch (err) {
            console.error('Failed to load user templates:', err)
            setTemplates([])
            return
          }
        } else {
          console.log('No user logged in, showing empty templates')
          setTemplates([])
          return
        }
      } else if (selectedCategory === 'copywriting') {
        // Filter user's templates for copywriting only
        if (user) {
          try {
            response = await ideanApi.templates.getMyTemplates({
              limit: 50
            })
            console.log('Templates for copywriting filter:', response)
          } catch (err) {
            console.error('Failed to load copywriting templates:', err)
            setTemplates([])
            return
          }
        } else {
          setTemplates([])
          return
        }
      } else {
        // For other categories, show empty for now
        console.log('Other category selected:', selectedCategory)
        setTemplates([])
        return
      }

      if (response) {
        console.log('Raw API response:', response)

        // Handle the actual API response structure: { success, message, data: { templates: [...] } }
        let templates: Template[] = []

        if (response.success && response.data && response.data.templates) {
          templates = response.data.templates
        } else if ((response as any).templates) {
          templates = (response as any).templates
        } else if (Array.isArray(response)) {
          templates = response
        } else {
          console.warn('Unexpected response format:', response)
          templates = []
        }

        console.log('Parsed templates:', templates)

        // Filter templates by category if needed
        if (selectedCategory === 'copywriting') {
          templates = templates.filter(template =>
            template.serviceType === 'copywriting' ||
            template.copywriting ||
            template.copywritingId
          )
          console.log('Filtered copywriting templates:', templates)
        } else if (selectedCategory === 'brandinglab') {
          templates = templates.filter(template =>
            template.serviceType === 'brandinglab' ||
            template.brandinglab ||
            template.brandinglabId
          )
        } else if (selectedCategory === 'growthcopilot') {
          templates = templates.filter(template =>
            template.serviceType === 'growthcopilot' ||
            template.growthcopilot ||
            template.growthcopilotId
          )
        }

        setTemplates(Array.isArray(templates) ? templates : [])
      } else {
        setTemplates([])
      }
    } catch (err: unknown) {
      console.error('Failed to load templates:', err)
      
      if (err && typeof err === 'object' && 'status' in err) {
        if ((err as any).status === 429) {
          console.warn('Rate limited - using fallback mode for templates')
          setTemplates([])
        } else if ((err as any).status === 404) {
          console.warn('Templates not found - using fallback mode')
          setTemplates([])
        }
      } else if (err && typeof err === 'object' && 'message' in err && (err as any).message?.includes('fetch')) {
        console.warn('Backend unavailable - using fallback mode for templates')
        // Provide mock data when backend is unavailable
        setTemplates([])
      } else {
        setError('Failed to load templates. Please try again.')
      }
    } finally {
      setLoading(false)
      setCardsLoading(false)
      setIsInitialLoad(false)
    }
  }, [selectedCategory, user, isInitialLoad])

  useEffect(() => {
    console.log('Effect triggered - loading templates')
    loadTemplates()
  }, [loadTemplates])

  // Optimized search function with debouncing
  const handleSearch = useCallback(() => {
    // This could be enhanced with actual search API call
    console.log('Searching for:', searchTerm)
  }, [searchTerm])

  const handleRefresh = useCallback(() => {
    setTemplates([])
    loadTemplates(true)
  }, [loadTemplates])

  const handleCategoryChange = useCallback((category: typeof selectedCategory) => {
    setSelectedCategory(category)
  }, [])

  // Handle template usage - navigate to appropriate editor
  const handleUseTemplate = useCallback((template: Template) => {
    console.log('Using template:', template)

    // Determine the service type and navigate to appropriate editor
    let serviceType = template.serviceType
    let serviceId = template.serviceId

    // Fallback logic for older templates
    if (!serviceType) {
      if (template.copywritingId) {
        serviceType = 'copywriting'
        serviceId = template.copywritingId
      } else if (template.brandinglabId) {
        serviceType = 'brandinglab'
        serviceId = template.brandinglabId
      } else if (template.growthcopilotId) {
        serviceType = 'growthcopilot'
        serviceId = template.growthcopilotId
      }
    }

    // Navigate to the appropriate service with template data
    if (serviceType && serviceId) {
      const templateParams = new URLSearchParams({
        templateId: template.id,
        templateName: template.name
      })

      switch (serviceType) {
        case 'copywriting':
          router.push(`/dashboard/copywriting/${serviceId}?${templateParams.toString()}`)
          break
        case 'brandinglab':
          router.push(`/dashboard/branding-lab/${serviceId}?${templateParams.toString()}`)
          break
        case 'growthcopilot':
          router.push(`/dashboard/growth-copilot/${serviceId}?${templateParams.toString()}`)
          break
        default:
          console.error('Unknown service type:', serviceType)
      }
    } else {
      console.error('Template missing service information:', template)
      // Fallback: try to determine from available data
      alert('This template is missing service information. Please contact support.')
    }
  }, [router])

  // Memoized filtered templates
  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return templates

    return templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.user_given_prompt && template.user_given_prompt.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [templates, searchTerm])

  const getCategoryIcon = (template: Template) => {
    if (template.serviceType === 'brandinglab' || template.brandinglab || template.brandinglabId) return Palette
    if (template.serviceType === 'growthcopilot' || template.growthcopilot || template.growthcopilotId) return TrendingUp
    if (template.serviceType === 'copywriting' || template.copywriting || template.copywritingId) return PenTool
    return FileText
  }

  const getCategoryColor = (template: Template) => {
    if (template.serviceType === 'brandinglab' || template.brandinglab || template.brandinglabId) return 'bg-purple-500'
    if (template.serviceType === 'growthcopilot' || template.growthcopilot || template.growthcopilotId) return 'bg-blue-500'
    if (template.serviceType === 'copywriting' || template.copywriting || template.copywritingId) return 'bg-orange-500'
    return 'bg-gray-500'
  }

  const getCategoryName = (template: Template) => {
    if (template.serviceType === 'brandinglab' || template.brandinglab || template.brandinglabId) return 'Branding Lab'
    if (template.serviceType === 'growthcopilot' || template.growthcopilot || template.growthcopilotId) return 'Growth Co-pilot'
    if (template.serviceType === 'copywriting' || template.copywriting || template.copywritingId) return 'Copywriting'
    return 'Custom Template'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return <TemplatesSkeletonLoader />
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Templates</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadTemplates} variant="outline">
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
          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600 text-sm sm:text-base">Reusable frameworks and workflows for your business</p>
          </div>
        </div>

        {user ? (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md inline-block">
            ✅ Connected as {user.name} - Full template management available
          </div>
        ) : (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md inline-block">
            ⚡ Demo mode - Please sign in for template creation
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <Button onClick={handleSearch} variant="outline" className="sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange('all')}
          >
            All
          </Button>
          {user && (
            <Button
              variant={selectedCategory === 'my-templates' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('my-templates')}
            >
              <User className="w-3 h-3 mr-1" />
              My Templates
            </Button>
          )}
          <Button
            variant={selectedCategory === 'brandinglab' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange('brandinglab')}
          >
            <Palette className="w-3 h-3 mr-1" />
            Branding
          </Button>
          <Button
            variant={selectedCategory === 'growthcopilot' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange('growthcopilot')}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Growth
          </Button>
          <Button
            variant={selectedCategory === 'copywriting' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange('copywriting')}
          >
            <PenTool className="w-3 h-3 mr-1" />
            Copy
          </Button>
        </div>

        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button className="bg-gray-600 hover:bg-gray-700" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">New Template</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {cardsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-4 sm:p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUseTemplate={handleUseTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first template to get started'}
          </p>
          <Button className="bg-gray-600 hover:bg-gray-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      )}

      {/* Template Creation Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Brand & Content Templates - Available Now (Prominent) */}
        <Card className="p-6 text-center border-2 border-idean-blue shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => router.push('/dashboard/copywriting')}>
          <div className="w-12 h-12 bg-idean-blue rounded-lg flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">Brand & Content Templates</h3>
            <span className="text-xs bg-idean-blue text-white px-2 py-0.5 rounded-full font-medium">Available</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Copywriting frameworks and content generation templates
          </p>
          <Button className="bg-idean-blue hover:bg-blue-600 text-white" size="sm">
            Create Content Template
          </Button>
        </Card>

        {/* Branding Templates - Coming Soon */}
        <Card className="p-6 text-center opacity-60 border-2 border-dashed border-gray-300 cursor-not-allowed">
          <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Palette className="w-6 h-6 text-gray-500" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-600">Branding Templates</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Reusable brand strategy frameworks and messaging templates
          </p>
          <Button variant="outline" size="sm" disabled>
            Create Branding Template
          </Button>
        </Card>

        {/* Growth Templates - Coming Soon */}
        <Card className="p-6 text-center opacity-60 border-2 border-dashed border-gray-300 cursor-not-allowed">
          <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-gray-500" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-600">Growth Templates</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">Coming Soon</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Strategic growth frameworks and execution templates
          </p>
          <Button variant="outline" size="sm" disabled>
            Create Growth Template
          </Button>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Template Management</h3>
            <p className="text-sm text-gray-600 mb-3">
              Create reusable templates from your successful frameworks and campaigns. Save time and maintain consistency across your business operations.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>• Save successful frameworks</span>
              <span>• Reuse proven workflows</span>
              <span>• Share across your team</span>
            </div>
          </div>
          <Button className="bg-gray-600 hover:bg-gray-700">
            Learn Template Creation
          </Button>
        </div>
      </Card>
    </div>
  )
}