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
  business_context?: string
  language: string
  module_select: 'standard' | 'pro'
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
      const response = await apiClient.post<Business>('/api/business', businessData)
      return response
    } catch (error) {
      console.error('Failed to create business:', error)
      throw error
    }
  }

  /**
   * Get current user's business
   */
  static async getBusiness(): Promise<Business> {
    try {
      const response = await apiClient.get<Business>('/api/business')
      return response
    } catch (error) {
      console.error('Failed to get business:', error)
      throw error
    }
  }

  /**
   * Update business information
   */
  static async updateBusiness(updates: BusinessUpdateRequest): Promise<Business> {
    try {
      const response = await apiClient.patch<Business>('/api/business', updates)
      return response
    } catch (error) {
      console.error('Failed to update business:', error)
      throw error
    }
  }

  /**
   * Delete business (owner only)
   */
  static async deleteBusiness(): Promise<void> {
    try {
      await apiClient.delete('/api/business')
    } catch (error) {
      console.error('Failed to delete business:', error)
      throw error
    }
  }

  /**
   * Upload business document
   */
  static async uploadDocument(file: File): Promise<{ documentId: string; url: string }> {
    try {
      const response = await apiClient.uploadFile('/api/business/documents', file) as { documentId: string; url: string }
      return response
    } catch (error) {
      console.error('Failed to upload business document:', error)
      throw error
    }
  }

  /**
   * Get business documents
   */
  static async getDocuments(): Promise<Array<{ id: string; name: string; url: string; uploadedAt: string }>> {
    try {
      const response = await apiClient.get<any[]>('/api/business/documents')
      return response
    } catch (error) {
      console.error('Failed to get business documents:', error)
      throw error
    }
  }

  /**
   * Delete business document
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/business/documents/${documentId}`)
    } catch (error) {
      console.error('Failed to delete business document:', error)
      throw error
    }
  }

  /**
   * Update adds history
   */
  static async updateAddsHistory(adData: string): Promise<Business> {
    try {
      const response = await apiClient.post<Business>('/api/business/adds-history', { adData })
      return response
    } catch (error) {
      console.error('Failed to update adds history:', error)
      throw error
    }
  }

  /**
   * Get business analytics
   */
  static async getAnalytics(): Promise<any> {
    try {
      const response = await apiClient.get('/api/business/analytics') as any
      return response
    } catch (error) {
      console.error('Failed to get business analytics:', error)
      throw error
    }
  }

  /**
   * Complete onboarding step
   */
  static async completeOnboardingStep(step: string): Promise<Business> {
    try {
      const response = await apiClient.post<Business>('/api/business/onboarding', { step })
      return response
    } catch (error) {
      console.error('Failed to complete onboarding step:', error)
      throw error
    }
  }
}

export default BusinessService