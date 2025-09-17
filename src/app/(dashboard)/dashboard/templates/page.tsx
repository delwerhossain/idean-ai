'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Copy,
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

export default function TemplatesPage() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'my-templates' | 'brandinglab' | 'growthcopilot' | 'copywriting'>('my-templates')
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadTemplates = useCallback(async () => {
    // Remove the hasLoaded check to allow initial loading

    console.log('Loading templates for category:', selectedCategory, 'User:', user?.email)

    try {
      setLoading(true)
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
      setHasLoaded(true)
    }
  }, [selectedCategory, user])

  useEffect(() => {
    console.log('Effect triggered - loading templates')
    loadTemplates()
  }, [selectedCategory, loadTemplates])

  const handleSearch = () => {
    setHasLoaded(false)
  }

  const handleRefresh = () => {
    setHasLoaded(false)
    setTemplates([])
  }

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
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading templates...</span>
        </div>
      </div>
    )
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
            onClick={() => {
              setSelectedCategory('all')
              setHasLoaded(false)
            }}
          >
            All
          </Button>
          {user && (
            <Button
              variant={selectedCategory === 'my-templates' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCategory('my-templates')
                setHasLoaded(false)
              }}
            >
              <User className="w-3 h-3 mr-1" />
              My Templates
            </Button>
          )}
          <Button
            variant={selectedCategory === 'brandinglab' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('brandinglab')
              setHasLoaded(false)
            }}
          >
            <Palette className="w-3 h-3 mr-1" />
            Branding
          </Button>
          <Button
            variant={selectedCategory === 'growthcopilot' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('growthcopilot')
              setHasLoaded(false)
            }}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Growth
          </Button>
          <Button
            variant={selectedCategory === 'copywriting' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('copywriting')
              setHasLoaded(false)
            }}
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
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {templates.map((template) => {
            const Icon = getCategoryIcon(template)
            const categoryColor = getCategoryColor(template)
            const categoryName = getCategoryName(template)

            return (
              <Card key={template.id} className="p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer group">
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
                    <Button size="sm" variant="ghost" className="flex-shrink-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <span className="hidden sm:inline">Use Template</span>
                      <span className="sm:hidden">Use</span>
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
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
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Palette className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Branding Templates</h3>
          <p className="text-sm text-gray-600 mb-4">
            Reusable brand strategy frameworks and messaging templates
          </p>
          <Button variant="outline" size="sm">
            Create Branding Template
          </Button>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Growth Templates</h3>
          <p className="text-sm text-gray-600 mb-4">
            Strategic growth frameworks and execution templates
          </p>
          <Button variant="outline" size="sm">
            Create Growth Template
          </Button>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Copy Templates</h3>
          <p className="text-sm text-gray-600 mb-4">
            Copywriting frameworks and content generation templates
          </p>
          <Button variant="outline" size="sm">
            Create Copy Template
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