// Business service for backend integration
import { apiClient, APIError } from '@/lib/api/client'
import type { 
  Business, 
  APIResponse 
} from '@/types/api'

export interface BusinessCreateRequest {
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

export interface BusinessUpdateRequest {
  business_name?: string
  website_url?: string
  industry_tag?: string
  business_context?: string
  language?: string
  module_select?: 'standard' | 'pro'
  mentor_approval?: string
  readiness_checklist?: string
}

export class BusinessService {
  /**
   * Create a new business
   */
  static async createBusiness(businessData: BusinessCreateRequest): Promise<Business> {
    try {
      const response = await apiClient.post<Business>('/api/v1/businesses', businessData)
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create business:', error)
      }
      throw error
    }
  }

  /**
   * Get current user's business
   */
  static async getBusiness(): Promise<Business> {
    try {
      const response = await apiClient.get<Business>('/api/v1/businesses/me')
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to get business:', error)
      }
      throw error
    }
  }

  /**
   * Get business by ID
   */
  static async getBusinessById(businessId: string): Promise<Business> {
    try {
      const response = await apiClient.get<Business>(`/api/v1/businesses/${businessId}`)
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to get business by ID:', error)
      }
      throw error
    }
  }

  /**
   * Update business information
   */
  static async updateBusiness(businessId: string, updates: BusinessUpdateRequest): Promise<Business> {
    try {
      const response = await apiClient.put<Business>(`/api/v1/businesses/${businessId}`, updates)
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update business:', error)
      }
      throw error
    }
  }

  /**
   * Delete business (owner only)
   */
  static async deleteBusiness(businessId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/businesses/${businessId}`)
    } catch (error) {
      console.error('Failed to delete business:', error)
      throw error
    }
  }

  /**
   * Upload business documents
   */
  static async uploadDocuments(businessId: string, files: File[]): Promise<{ documentsUploaded: any[]; message: string }> {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('documents', file)
      })

      const response = await apiClient.request<{ documentsUploaded: any[]; message: string }>(
        `/api/v1/businesses/${businessId}/documents`,
        {
          method: 'POST',
          body: formData
        }
      )
      return response
    } catch (error) {
      console.error('Failed to upload business documents:', error)
      throw error
    }
  }

  /**
   * Get business documents
   */
  static async getDocuments(businessId: string): Promise<{ businessId: string; businessName: string; documents: any[] }> {
    try {
      const response = await apiClient.get<{ businessId: string; businessName: string; documents: any[] }>(`/api/v1/businesses/${businessId}/documents`)
      return response
    } catch (error) {
      console.error('Failed to get business documents:', error)
      throw error
    }
  }

  /**
   * Search documents with vector similarity
   */
  static async searchDocuments(query: string, limit: number = 5): Promise<any> {
    try {
      const response = await apiClient.get(`/api/v1/businesses/documents/search?query=${encodeURIComponent(query)}&limit=${limit}`)
      return response
    } catch (error) {
      console.error('Failed to search documents:', error)
      throw error
    }
  }

  /**
   * Get business users
   */
  static async getBusinessUsers(businessId: string): Promise<{ businessId: string; businessName: string; users: any[] }> {
    try {
      const response = await apiClient.get<{ businessId: string; businessName: string; users: any[] }>(`/api/v1/businesses/${businessId}/users`)
      return response
    } catch (error) {
      console.error('Failed to get business users:', error)
      throw error
    }
  }

  /**
   * Add user to business
   */
  static async addUserToBusiness(businessId: string, userId: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/businesses/${businessId}/users`, { userId })
    } catch (error) {
      console.error('Failed to add user to business:', error)
      throw error
    }
  }

  /**
   * Remove user from business
   */
  static async removeUserFromBusiness(businessId: string, userId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/businesses/${businessId}/users/${userId}`)
    } catch (error) {
      console.error('Failed to remove user from business:', error)
      throw error
    }
  }
}

export default BusinessService