import { apiClient } from './client'
import type { 
  APIResponse, 
  PaginatedResponse, 
  PaginationParams 
} from '@/types/api'

// TypeScript interfaces matching the backend Prisma schema
export interface Business {
  id: string
  business_name: string
  website_url: string
  industry_tag: string
  business_documents: string[]
  business_context?: string
  language: string
  mentor_approval: string
  adds_history: string[]
  module_select: string
  readiness_checklist: string
  createdAt: string
  updatedAt: string
  users?: User[]
  payments?: Payment[]
}

export interface User {
  id: string
  email: string
  name: string
  firebaseUid?: string
  photoURL?: string
  provider?: string
  role?: string
  businessId?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  amount: string
  businessId?: string
  createdAt: string
  updatedAt: string
}

// Create business data interface
export interface CreateBusinessData {
  business_name: string
  website_url: string
  industry_tag: string
  business_documents?: string[]
  business_context?: string
  language: string
  mentor_approval: string
  adds_history?: string[]
  module_select: string
  readiness_checklist: string
}

// Update business data interface
export interface UpdateBusinessData extends Partial<CreateBusinessData> {
  id?: never // Prevent ID from being updated
}

// Business list parameters
export interface BusinessListParams extends PaginationParams {
  search?: string
  industry_tag?: string
  module_select?: string
  mentor_approval?: string
  language?: string
}

// Business API service
export const businessAPI = {
  /**
   * Create a new business
   */
  createBusiness: async (data: CreateBusinessData): Promise<Business> => {
    const response = await apiClient.post<APIResponse<Business>>('/businesses', data)
    return response.business || response
  },

  /**
   * Get all businesses with pagination and filtering
   */
  getAllBusinesses: async (params: BusinessListParams = {}): Promise<PaginatedResponse<Business>> => {
    return apiClient.getPaginated<Business>('/businesses', params)
  },

  /**
   * Get a specific business by ID
   */
  getBusiness: async (id: string): Promise<Business> => {
    const response = await apiClient.get<APIResponse<Business>>(`/businesses/${id}`)
    return response.business || response
  },

  /**
   * Update a business by ID
   */
  updateBusiness: async (id: string, data: UpdateBusinessData): Promise<Business> => {
    const response = await apiClient.put<APIResponse<Business>>(`/businesses/${id}`, data)
    return response.business || response
  },

  /**
   * Delete a business by ID
   */
  deleteBusiness: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/businesses/${id}`)
  },

  /**
   * Upload business documents (PDFs)
   */
  uploadDocuments: async (
    businessId: string,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<{ business_documents: string[] }> => {
    const uploadPromises = files.map((file, index) => {
      return apiClient.uploadFile<{ url: string; filename: string }>(
        `/businesses/${businessId}/documents`,
        file,
        { documentIndex: index.toString() },
        (progress) => {
          // Calculate overall progress across all files
          const overallProgress = ((index * 100) + progress) / files.length
          onProgress?.(overallProgress)
        }
      )
    })

    const results = await Promise.all(uploadPromises)
    const documentUrls = results.map(result => result.url || result.filename)

    // Update business with new documents
    const updatedBusiness = await businessAPI.updateBusiness(businessId, {
      business_documents: documentUrls
    })

    return { business_documents: updatedBusiness.business_documents }
  },

  /**
   * Remove a document from business
   */
  removeDocument: async (businessId: string, documentUrl: string): Promise<Business> => {
    return apiClient.delete<Business>(`/businesses/${businessId}/documents`, {
      body: JSON.stringify({ documentUrl })
    })
  },

  /**
   * Update readiness checklist
   */
  updateReadinessChecklist: async (
    businessId: string, 
    checklist: Record<string, boolean>
  ): Promise<Business> => {
    return businessAPI.updateBusiness(businessId, {
      readiness_checklist: JSON.stringify(checklist)
    })
  },

  /**
   * Get business analytics/statistics
   */
  getBusinessStats: async (businessId: string): Promise<{
    documentsCount: number
    adsHistoryCount: number
    lastUpdated: string
    moduleType: string
    readinessStatus: string
  }> => {
    return apiClient.get<{
      documentsCount: number
      adsHistoryCount: number
      lastUpdated: string
      moduleType: string
      readinessStatus: string
    }>(`/businesses/${businessId}/stats`)
  },

  /**
   * Export business data
   */
  exportBusinessData: async (
    businessId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<Blob> => {
    const response = await fetch(
      `${apiClient['config'].baseUrl}/businesses/${businessId}/export?format=${format}`,
      {
        method: 'GET',
        headers: await (apiClient as any).getAuthHeaders(),
      }
    )

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    return response.blob()
  }
}

// Utility functions for business data
export const businessUtils = {
  /**
   * Validate business data before creation/update
   */
  validateBusinessData: (data: Partial<CreateBusinessData>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!data.business_name?.trim()) {
      errors.push('Business name is required')
    } else if (data.business_name.length < 2) {
      errors.push('Business name must be at least 2 characters')
    } else if (data.business_name.length > 200) {
      errors.push('Business name must be less than 200 characters')
    }

    if (!data.website_url?.trim()) {
      errors.push('Website URL is required')
    } else {
      try {
        new URL(data.website_url)
      } catch {
        errors.push('Website URL must be a valid URL')
      }
    }

    if (!data.industry_tag?.trim()) {
      errors.push('Industry is required')
    }

    if (!data.language?.trim()) {
      errors.push('Language is required')
    }

    if (!data.mentor_approval?.trim()) {
      errors.push('Mentor approval status is required')
    } else if (!['approved', 'pending', 'rejected', 'skip'].includes(data.mentor_approval)) {
      errors.push('Mentor approval must be one of: approved, pending, rejected, skip')
    }

    if (!data.module_select?.trim()) {
      errors.push('Module selection is required')
    } else if (!['standard', 'pro'].includes(data.module_select)) {
      errors.push('Module must be either "standard" or "pro"')
    }

    if (data.business_documents && data.business_documents.length > 4) {
      errors.push('Maximum 4 business documents are allowed')
    }

    if (data.business_context && data.business_context.length > 2000) {
      errors.push('Business context must be less than 2000 characters')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Parse readiness checklist from string
   */
  parseReadinessChecklist: (checklist: string): Record<string, boolean> => {
    try {
      return JSON.parse(checklist)
    } catch {
      return {}
    }
  },

  /**
   * Format business data for display
   */
  formatBusinessForDisplay: (business: Business) => ({
    ...business,
    readinessChecklist: businessUtils.parseReadinessChecklist(business.readiness_checklist),
    documentsCount: business.business_documents.length,
    adsHistoryCount: business.adds_history.length,
    isReady: business.readiness_checklist !== 'pending',
    moduleLabel: business.module_select === 'pro' ? 'Pro Plan' : 'Standard Plan',
    mentorStatusLabel: {
      'approved': 'Mentor Approved',
      'pending': 'Pending Approval',
      'rejected': 'Not Approved',
      'skip': 'Skipped'
    }[business.mentor_approval] || business.mentor_approval
  }),

  /**
   * Get industry options
   */
  getIndustryOptions: (): string[] => [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Real Estate',
    'Food & Beverage',
    'Entertainment',
    'Consulting',
    'Marketing & Advertising',
    'E-commerce',
    'SaaS',
    'Non-profit',
    'Other'
  ],

  /**
   * Get language options
   */
  getLanguageOptions: (): Array<{ code: string; label: string }> => [
    { code: 'en', label: 'English' },
    { code: 'bn', label: 'Bengali (বাংলা)' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
    { code: 'es', label: 'Spanish (Español)' },
    { code: 'fr', label: 'French (Français)' },
    { code: 'de', label: 'German (Deutsch)' },
    { code: 'pt', label: 'Portuguese (Português)' },
    { code: 'ar', label: 'Arabic (العربية)' }
  ]
}

export default businessAPI