'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Building,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Globe,
  Tag,
  Users,
  AlertTriangle,
  X,
  Save
} from 'lucide-react'
import { ideanApi, Business, ideanUtils } from '@/lib/api/idean-api'

interface BusinessFormData {
  business_name: string
  website_url: string
  industry_tag: string
  business_documents?: string[]
  business_context?: string
  language: string
  mentor_approval: string
  adds_history?: string[]
  module_select: 'standard' | 'pro'
  readiness_checklist: string
}

export default function BusinessPage() {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BusinessFormData>({
    business_name: '',
    website_url: '',
    industry_tag: '',
    business_context: '',
    language: 'en',
    mentor_approval: 'pending',
    module_select: 'standard',
    readiness_checklist: 'incomplete'
  })

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ideanApi.business.getAll({
        limit: 50
      })

      if (response) {
        setBusinesses(response.items || [])
      }
    } catch (err) {
      console.error('Failed to load businesses:', err)
      setError('Failed to load businesses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadBusinesses()
  }

  const resetForm = () => {
    setFormData({
      business_name: '',
      website_url: '',
      industry_tag: '',
      business_context: '',
      language: 'en',
      mentor_approval: 'pending',
      module_select: 'standard',
      readiness_checklist: 'incomplete'
    })
    setEditingBusiness(null)
    setShowCreateForm(false)
  }

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    const validation = ideanUtils.validateBusinessData(formData)
    if (!validation.isValid) {
      setError(validation.errors.join(', '))
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      if (editingBusiness) {
        // Update existing business
        await ideanApi.business.update(editingBusiness.id, formData)
      } else {
        // Create new business
        await ideanApi.business.create(formData)
      }

      // Reload businesses and reset form
      await loadBusinesses()
      resetForm()
    } catch (err: unknown) {
      console.error('Failed to save business:', err)
      setError(err instanceof Error ? err.message : 'Failed to save business. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (business: Business) => {
    setFormData({
      business_name: business.business_name,
      website_url: business.website_url,
      industry_tag: business.industry_tag,
      business_documents: business.business_documents,
      business_context: business.business_context || '',
      language: business.language,
      mentor_approval: business.mentor_approval,
      adds_history: business.adds_history,
      module_select: business.module_select,
      readiness_checklist: business.readiness_checklist
    })
    setEditingBusiness(business)
    setShowCreateForm(true)
  }

  const handleDelete = async (businessId: string) => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return
    }

    try {
      setError(null)
      await ideanApi.business.delete(businessId)
      await loadBusinesses()
    } catch (err: unknown) {
      console.error('Failed to delete business:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete business. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getModuleBadgeColor = (module: string) => {
    return module === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading businesses...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
            <p className="text-gray-600">Manage business profiles and configurations</p>
          </div>
        </div>

        {user ? (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-md inline-block">
            ✅ Backend connected - Full business management available
          </div>
        ) : (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md inline-block">
            ⚡ Demo mode - Connect backend for business operations
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search businesses..."
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
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Business
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingBusiness ? 'Edit Business' : 'Create New Business'}
            </h3>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div>
                <Label htmlFor="business_name" className="text-sm font-medium text-gray-700">
                  Business Name *
                </Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Enter business name"
                  required
                  className="mt-1"
                />
              </div>

              {/* Website URL */}
              <div>
                <Label htmlFor="website_url" className="text-sm font-medium text-gray-700">
                  Website URL *
                </Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://example.com"
                  required
                  className="mt-1"
                />
              </div>

              {/* Industry */}
              <div>
                <Label htmlFor="industry_tag" className="text-sm font-medium text-gray-700">
                  Industry *
                </Label>
                <select
                  id="industry_tag"
                  value={formData.industry_tag}
                  onChange={(e) => handleInputChange('industry_tag', e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Industry</option>
                  {ideanUtils.getIndustryOptions().map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                  Language *
                </Label>
                <select
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {ideanUtils.getLanguageOptions().map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Module Select */}
              <div>
                <Label htmlFor="module_select" className="text-sm font-medium text-gray-700">
                  Module Tier *
                </Label>
                <select
                  id="module_select"
                  value={formData.module_select}
                  onChange={(e) => handleInputChange('module_select', e.target.value as 'standard' | 'pro')}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {ideanUtils.getModuleOptions().map(module => (
                    <option key={module.value} value={module.value}>
                      {module.name} - {module.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mentor Approval */}
              <div>
                <Label htmlFor="mentor_approval" className="text-sm font-medium text-gray-700">
                  Mentor Approval Status *
                </Label>
                <select
                  id="mentor_approval"
                  value={formData.mentor_approval}
                  onChange={(e) => handleInputChange('mentor_approval', e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Business Context */}
            <div>
              <Label htmlFor="business_context" className="text-sm font-medium text-gray-700">
                Business Context
              </Label>
              <Textarea
                id="business_context"
                value={formData.business_context}
                onChange={(e) => handleInputChange('business_context', e.target.value)}
                placeholder="Describe your business, target audience, and key objectives..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Readiness Checklist */}
            <div>
              <Label htmlFor="readiness_checklist" className="text-sm font-medium text-gray-700">
                Readiness Status *
              </Label>
              <select
                id="readiness_checklist"
                value={formData.readiness_checklist}
                onChange={(e) => handleInputChange('readiness_checklist', e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="incomplete">Incomplete</option>
                <option value="in_progress">In Progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {editingBusiness ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingBusiness ? 'Update Business' : 'Create Business'}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Business List */}
      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Card key={business.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{business.business_name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Globe className="w-3 h-3" />
                      <span>{business.website_url}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(business)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(business.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{business.industry_tag}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{business.language === 'en' ? 'English' : business.language === 'bn' ? 'Bengali' : 'Hindi'}</span>
                </div>

                {business.business_context && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {business.business_context}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModuleBadgeColor(business.module_select)}`}>
                    {business.module_select.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    business.mentor_approval === 'approved' 
                      ? 'bg-green-100 text-green-700'
                      : business.mentor_approval === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {business.mentor_approval}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(business.updatedAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Businesses Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Create your first business profile to get started'}
          </p>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Business
          </Button>
        </div>
      )}
    </div>
  )
}