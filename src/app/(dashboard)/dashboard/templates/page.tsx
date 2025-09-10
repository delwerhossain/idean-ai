'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Plus, 
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Palette,
  PenTool,
  TrendingUp,
  AlertTriangle,
  Clock,
  Tag
} from 'lucide-react'
import { ideanApi, Template } from '@/lib/api/idean-api'

export default function TemplatesPage() {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'brandinglab' | 'growthcopilot' | 'copywriting'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [selectedCategory])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      let response
      if (selectedCategory === 'all') {
        response = await ideanApi.templates.getAll({
          limit: 50,
          search: searchTerm
        })
      } else {
        response = await ideanApi.templates.getByCategory(selectedCategory, {
          limit: 50,
          search: searchTerm
        })
      }

      if (response.data) {
        setTemplates(response.data.data || [])
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
      setError('Failed to load templates. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadTemplates()
  }

  const getCategoryIcon = (template: Template) => {
    if (template.brandinglab) return Palette
    if (template.growthcopilot) return TrendingUp
    if (template.copywriting) return PenTool
    return FileText
  }

  const getCategoryColor = (template: Template) => {
    if (template.brandinglab) return 'bg-purple-500'
    if (template.growthcopilot) return 'bg-blue-500'
    if (template.copywriting) return 'bg-orange-500'
    return 'bg-gray-500'
  }

  const getCategoryName = (template: Template) => {
    if (template.brandinglab) return 'Branding Lab'
    if (template.growthcopilot) return 'Growth Co-pilot'
    if (template.copywriting) return 'Copywriting'
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
            <p className="text-gray-600">Reusable frameworks and workflows for your business</p>
          </div>
        </div>

        {session?.backendToken ? (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md inline-block">
            ✅ Backend connected - Full template management available
          </div>
        ) : (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md inline-block">
            ⚡ Demo mode - Connect backend for template creation
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
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
        
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          <Button
            variant={selectedCategory === 'brandinglab' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('brandinglab')}
          >
            <Palette className="w-3 h-3 mr-1" />
            Branding
          </Button>
          <Button
            variant={selectedCategory === 'growthcopilot' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('growthcopilot')}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Growth
          </Button>
          <Button
            variant={selectedCategory === 'copywriting' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('copywriting')}
          >
            <PenTool className="w-3 h-3 mr-1" />
            Copy
          </Button>
        </div>

        <Button onClick={handleSearch} variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button className="bg-gray-600 hover:bg-gray-700">
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {templates.map((template) => {
            const Icon = getCategoryIcon(template)
            const categoryColor = getCategoryColor(template)
            const categoryName = getCategoryName(template)

            return (
              <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${categoryColor} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Tag className="w-3 h-3" />
                        <span>{categoryName}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
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

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(template.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Use Template
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