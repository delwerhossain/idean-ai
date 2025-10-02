'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Building,
  Save,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Tag,
  Users,
  BookOpen,
  RefreshCw,
  TrendingUp,
  Upload,
  Trash2,
  FileText,
  X
} from 'lucide-react'
import { ideanApi, ideanUtils } from '@/lib/api/idean-api'
import { Business } from '@/types/api'
import TutorialModal from '@/components/modals/TutorialModal'

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

// Business Knowledge Skeleton Loading Component
function BusinessSkeletonLoader() {
  const shimmerClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-50 to-gray-200"

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${shimmerClasses}`}></div>
          <div>
            <div className={`h-8 rounded w-64 mb-2 ${shimmerClasses}`}></div>
            <div className={`h-4 rounded w-80 ${shimmerClasses}`}></div>
          </div>
        </div>
      </div>

      {/* Business Info Card Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-5 h-5 rounded ${shimmerClasses}`}></div>
          <div className={`h-6 rounded w-40 ${shimmerClasses}`}></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index}>
              <div className={`h-4 rounded w-32 mb-2 ${shimmerClasses}`}></div>
              <div className={`h-10 rounded w-full ${shimmerClasses}`}></div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className={`h-4 rounded w-32 mb-2 ${shimmerClasses}`}></div>
          <div className={`h-24 rounded w-full ${shimmerClasses}`}></div>
        </div>

        <div className="mt-6">
          <div className={`h-10 rounded w-32 ${shimmerClasses}`}></div>
        </div>
      </div>

      {/* Documents Section Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-5 h-5 rounded ${shimmerClasses}`}></div>
          <div className={`h-6 rounded w-48 ${shimmerClasses}`}></div>
        </div>

        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className={`w-8 h-8 rounded ${shimmerClasses}`}></div>
              <div className="flex-1">
                <div className={`h-4 rounded w-48 mb-1 ${shimmerClasses}`}></div>
                <div className={`h-3 rounded w-24 ${shimmerClasses}`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BusinessKnowledgePage() {
  const { user, refreshUser } = useAuth()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showTutorialModal, setShowTutorialModal] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const [uploadingFileCount, setUploadingFileCount] = useState(0)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
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
    loadBusinessData()
  }, [user])

  const loadBusinessData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('Loading business data for user:', user.email)

      // Get user's current business data
      let response = null

      try {
        // First try getting user data which includes business
        const userResponse = await ideanApi.user.getMe()
        console.log('User data response:', userResponse)

        if (userResponse?.business) {
          response = userResponse.business
          console.log('Found business in user data:', response)
        } else if (userResponse?.businessId) {
          // If user has businessId but no nested business, fetch it directly
          try {
            response = await ideanApi.business.getById(userResponse.businessId)
            console.log('Fetched business by ID:', response)
          } catch (getByIdError) {
            console.log('Failed to fetch business by ID:', getByIdError)
          }
        }
      } catch (userError) {
        console.log('User data fetch failed, trying business.getMine:', userError)

        // Fallback: try direct business fetch
        try {
          response = await ideanApi.business.getMine()
          console.log('Got business from getMine:', response)
        } catch (getMineError) {
          console.log('getMine also failed:', getMineError)
        }
      }

      if (response) {
        setBusiness(response as Business)
        setFormData({
          business_name: response.business_name || '',
          website_url: response.website_url || '',
          industry_tag: response.industry_tag || '',
          business_context: response.business_context || '',
          language: response.language || 'en',
          mentor_approval: response.mentor_approval || 'pending',
          module_select: (response.module_select === 'pro' ? 'pro' : 'standard') as 'standard' | 'pro',
          readiness_checklist: response.readiness_checklist || 'incomplete',
          business_documents: response.business_documents || [],
          adds_history: response.adds_history || []
        })
        console.log('✅ Business data loaded successfully:', response.business_name)

        // Clear any existing errors
        setError(null)
      } else {
        // No business data found - this is normal for new users
        console.log('No business profile found - user may need to set one up')
        setError(null) // Don't show error for missing business profile
      }

    } catch (err: any) {
      console.error('Failed to load business data:', err)
      setError('Unable to load business information. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }, [user])

  const loadDocuments = useCallback(async () => {
    if (!business?.id) return

    try {
      const response = await ideanApi.documents.getByBusiness(business.id)
      setDocuments(response.documents || [])
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
  }, [business?.id])

  useEffect(() => {
    if (business?.id) {
      loadDocuments()
    }
  }, [business?.id, loadDocuments])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || !business?.id) return

    const fileArray = Array.from(files)

    // Validate files
    const maxFiles = 4
    const maxSizePerFile = 30 * 1024 * 1024 // 30MB
    const allowedTypes = ['application/pdf']

    if (fileArray.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files at once`)
      return
    }

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        setError('Only PDF files are allowed')
        return
      }
      if (file.size > maxSizePerFile) {
        setError(`File ${file.name} is too large. Maximum size is 30MB`)
        return
      }
    }

    try {
      setUploadingDocs(true)
      setUploadingFileCount(fileArray.length)
      setError(null)

      await ideanApi.documents.uploadMultiple(fileArray, business.id)

      setSuccess(`${fileArray.length} document(s) uploaded successfully!`)
      await loadDocuments()

      // Clear the file input
      event.target.value = ''
    } catch (err: any) {
      console.error('Failed to upload documents:', err)
      setError(err.message || 'Failed to upload documents')
    } finally {
      setUploadingDocs(false)
      setUploadingFileCount(0)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!business?.id || !window.confirm('Are you sure you want to delete this document?')) return

    try {
      setDeletingDocId(documentId)
      setError(null)

      await ideanApi.documents.deleteFromBusiness(business.id, documentId)

      setSuccess('Document deleted successfully!')
      await loadDocuments()
    } catch (err: any) {
      console.error('Failed to delete document:', err)
      setError(err.message || 'Failed to delete document')
    } finally {
      setDeletingDocId(null)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const resetForm = () => {
    if (business) {
      setFormData({
        business_name: business.business_name || '',
        website_url: business.website_url || '',
        industry_tag: business.industry_tag || '',
        business_context: business.business_context || '',
        language: business.language || 'en',
        mentor_approval: business.mentor_approval || 'pending',
        module_select: business.module_select || 'standard',
        readiness_checklist: business.readiness_checklist || 'incomplete',
        business_documents: business.business_documents || [],
        adds_history: business.adds_history || []
      })
    }
    setError(null)
    setSuccess(null)
  }

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    // Auto-format website URL
    if (field === 'website_url' && value.trim()) {
      // Remove any existing protocol first
      let cleanUrl = value.trim().replace(/^https?:\/\//, '')
      
      // Only add https:// if there's actually a URL value
      if (cleanUrl) {
        value = `https://${cleanUrl}`
      }
    }
    
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
      setSaving(true)
      setError(null)
      setSuccess(null)

      console.log('Submitting business data:', formData)

      let response
      if (business?.id) {
        // Update existing business
        console.log('Updating business with ID:', business.id)
        response = await ideanApi.business.update(business.id, formData)
        setSuccess('Business information updated successfully!')
        console.log('✅ Business updated successfully:', response)

        // Refresh user data in AuthContext to update sidebar and other components
        await refreshUser()
      } else {
        // Create new business
        console.log('Creating new business')
        response = await ideanApi.business.create(formData)
        setSuccess('Business profile created successfully!')
        console.log('✅ Business created successfully:', response)

        // Refresh user data in AuthContext to update sidebar and other components
        await refreshUser()
      }

      // Handle response - it might be wrapped in different formats
      const businessData = (response as any)?.business || response
      if (businessData) {
        setBusiness(businessData as Business)

        // Update form data with any server-side changes
        setFormData({
          business_name: businessData.business_name || '',
          website_url: businessData.website_url || '',
          industry_tag: businessData.industry_tag || '',
          business_context: businessData.business_context || '',
          language: businessData.language || 'en',
          mentor_approval: businessData.mentor_approval || 'pending',
          module_select: businessData.module_select || 'standard',
          readiness_checklist: businessData.readiness_checklist || 'incomplete',
          business_documents: businessData.business_documents || [],
          adds_history: businessData.adds_history || []
        })

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      }

    } catch (err: any) {
      console.error('Failed to save business:', err)
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${business ? 'update' : 'create'} business information. Please try again.`
      setError(errorMessage)
    } finally {
      setSaving(false)
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

  const getPlanBadge = (module: string) => {
    return module === 'pro'
      ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Pro Plan</span>
      : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Free Plan</span>
  }

  if (loading) {
    return <BusinessSkeletonLoader />
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-idean-navy rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Business Knowledge</h1>
              <p className="text-gray-600 text-sm sm:text-base">Update your business information and context</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowTutorialModal(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Watch Tutorial
            </Button>
            {business && (
              <>
                {getPlanBadge(business.module_select)}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  business.mentor_approval === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : business.mentor_approval === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {business.mentor_approval === 'approved' ? 'Approved' : business.mentor_approval === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50">
          <div className="flex items-center justify-between text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadBusinessData}
              className="text-red-700 hover:text-red-800 hover:bg-red-100 p-1"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {success && (
        <Card className="p-4 mb-6 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        </Card>
      )}

      {/* Business Information Form */}
      {business || (!business && !loading) ? (
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-idean-navy" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {business ? 'Business Information' : 'Create Business Profile'}
              </h3>
            </div>
            <Button variant="outline" size="sm" onClick={resetForm}>
              Reset Changes
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">https://</span>
                  </div>
                  <Input
                    id="website_url"
                    type="text"
                    value={formData.website_url.replace(/^https?:\/\//, '')}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="example.com"
                    required
                    className="pl-16"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your website domain (https:// will be added automatically)
                </p>
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-idean-navy focus:border-idean-navy bg-white"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology & Software">Technology & Software</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Fashion & Beauty">Fashion & Beauty</option>
                  <option value="Travel & Tourism">Travel & Tourism</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Non-profit">Non-profit</option>
                  <option value="Other">Other</option>
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-idean-navy focus:border-idean-navy bg-white"
                >
                  {ideanUtils.getLanguageOptions().map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Module Select */}
              {/* <div>
                <Label htmlFor="module_select" className="text-sm font-medium text-gray-700">
                  Plan Tier *
                </Label>
                <select
                  id="module_select"
                  value={formData.module_select}
                  onChange={(e) => handleInputChange('module_select', e.target.value as 'standard' | 'pro')}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-idean-navy focus:border-idean-navy bg-white"
                >
                  {ideanUtils.getModuleOptions().map(module => (
                    <option key={module.value} value={module.value}>
                      {module.name} - {module.description}
                    </option>
                  ))}
                </select>
              </div> */}

              {/* Readiness Status */}
              {/* <div>
                <Label htmlFor="readiness_checklist" className="text-sm font-medium text-gray-700">
                  Setup Status *
                </Label>
                <select
                  id="readiness_checklist"
                  value={formData.readiness_checklist}
                  onChange={(e) => handleInputChange('readiness_checklist', e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-idean-navy focus:border-idean-navy bg-white"
                >
                  <option value="incomplete">Incomplete</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div> */}
            </div>

            {/* Business Context */}
            <div>
              <Label htmlFor="business_context" className="text-sm font-medium text-gray-700">
                Business Context & Knowledge
              </Label>
              <Textarea
                id="business_context"
                value={formData.business_context}
                onChange={(e) => handleInputChange('business_context', e.target.value)}
                placeholder="Describe your business, target audience, key objectives, products/services, unique value proposition, and any other relevant context that will help AI understand your business better..."
                rows={6}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This information helps AI generate more relevant and personalized content for your business.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6 border-t border-gray-100">
              <Button
                type="submit"
                disabled={saving || !business}
                className="bg-idean-navy hover:bg-idean-navy-dark w-full sm:w-auto"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating Business...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {business ? 'Update Business Information' : 'Create Business Profile'}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                Reset to Original
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Business Profile Found</h3>
          <p className="text-gray-600 mb-4">
            You don't have a business profile set up yet. Please complete your business setup first.
          </p>
          <Button className="bg-idean-navy hover:bg-idean-navy-dark">
            Set Up Business Profile
          </Button>
        </Card>
      )}

      {/* Business Documents Management */}
      {business && (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-idean-navy" />
              <h3 className="text-lg font-semibold text-gray-900">Business Documents</h3>
            </div>
            <span className="text-xs text-gray-500">{documents.length} documents</span>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Upload PDFs containing your brand guidelines, product information, and business documents for AI to reference when generating content.
          </p>

          {/* Upload Section */}
          <div className="mb-4">
            <label htmlFor="document-upload" className="block">
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                uploadingDocs
                  ? 'border-idean-blue bg-blue-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-idean-blue hover:bg-blue-50 cursor-pointer'
              }`}>
                {uploadingDocs ? (
                  <>
                    <div className="w-12 h-12 mx-auto mb-3 relative">
                      <LoadingSpinner size="lg" />
                    </div>
                    <p className="text-sm font-semibold text-idean-blue mb-1">
                      Uploading Documents...
                    </p>
                    <p className="text-xs text-gray-600">
                      Please wait while we process your files
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF files only, max 30MB per file, up to 4 files at once
                    </p>
                  </>
                )}
              </div>
              <input
                id="document-upload"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileUpload}
                disabled={uploadingDocs}
                className="hidden"
              />
            </label>
          </div>

          {/* Documents List */}
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id || doc.documentId} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="w-10 h-10 bg-idean-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-idean-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.fileName || `Document ${documents.indexOf(doc) + 1}`}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      {doc.fileSize && <span>{formatFileSize(doc.fileSize)}</span>}
                      {doc.numPages && <span>{doc.numPages} pages</span>}
                      {doc.createdAt && <span>{new Date(doc.createdAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id || doc.documentId)}
                    disabled={deletingDocId === (doc.id || doc.documentId)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingDocId === (doc.id || doc.documentId) ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No documents uploaded yet</p>
              <p className="text-xs mt-1">Upload PDFs to enhance AI-generated content</p>
            </div>
          )}
        </Card>
      )}

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        title="How to Manage Business Knowledge"
        subtitle="Learn to maintain your business profile and documents"
        icon={<BookOpen className="w-8 h-8" />}
        steps={[
          {
            title: 'Update Business Information',
            description: 'Fill in your business name, website, industry, and other key details. This information helps AI understand your business context.'
          },
          {
            title: 'Add Business Context',
            description: 'Provide detailed information about your business, products, services, and unique value proposition. The more context you provide, the better AI-generated content will be.'
          },
          {
            title: 'Upload Knowledge Documents',
            description: 'Upload PDFs containing your brand guidelines, product information, and business documents for AI to reference when generating content.'
          },
          {
            title: 'Save and Update Regularly',
            description: 'Keep your business profile updated as your business evolves. Updated information ensures AI always uses the latest context.'
          }
        ]}
        ctaText="Got it, Let's Update My Profile!"
      />
    </div>
  )
}