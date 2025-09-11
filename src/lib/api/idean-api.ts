import { apiClient } from './client'
import { PaginationParams, PaginatedResponse } from '@/types/api'

// Types for iDEAN AI specific entities
export interface GrowthCopilot {
  id: string
  name: string
  description?: string
  input_fields?: string[]
  dropdown?: string[]
  system_prompt: string
  user_starting_prompt?: string
  createdAt: string
  updatedAt: string
}

export interface BrandingLab {
  id: string
  name: string
  description?: string
  input_fields?: string[]
  dropdown?: string[]
  system_prompt: string
  user_starting_prompt?: string
  createdAt: string
  updatedAt: string
}

export interface Copywriting {
  id: string
  name: string
  description?: string
  input_fields?: string[]
  dropdown?: string[]
  system_prompt: string
  user_starting_prompt?: string
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  name: string
  user_given_prompt?: string
  system_prompt?: string
  user_starting_prompt?: string
  text_input_queries?: string[]
  text_input_given?: string[]
  drop_down?: string[]
  brandinglabId?: string
  growthcopilotId?: string
  copywritingId?: string
  documentIds?: string[]
  createdAt: string
  updatedAt: string
  brandinglab?: BrandingLab
  growthcopilot?: GrowthCopilot
  copywriting?: Copywriting
}

export interface Document {
  id: string
  name: string
  content?: string
  file_path?: string
  businessId?: string
  createdAt: string
  updatedAt: string
}

export interface Business {
  id: string
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
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: string
  transactionId?: string
  userId: string
  businessId?: string
  plan: string
  billingPeriod: 'monthly' | 'yearly'
  createdAt: string
  updatedAt: string
}

// iDEAN AI API endpoints
export const ideanApi = {
  // Growth Co-pilot API (Strategy & Execution)
  growthCopilot: {
    getAll: (params?: PaginationParams) =>
      apiClient.safeGet<PaginatedResponse<GrowthCopilot>>('/growthcopilots', params, true),

    getById: (id: string) =>
      apiClient.safeGet<GrowthCopilot>(`/growthcopilots/${id}`, undefined, false),

    create: (data: {
      name: string
      description?: string
      input_fields?: string[]
      dropdown?: string[]
      system_prompt: string
      user_starting_prompt?: string
    }) => apiClient.post<GrowthCopilot>('/growthcopilots', data),

    update: (id: string, data: Partial<GrowthCopilot>) =>
      apiClient.put<GrowthCopilot>(`/growthcopilots/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/growthcopilots/${id}`),

    // Execute a growth strategy framework
    execute: (id: string, inputs: Record<string, any>) =>
      apiClient.post<{ result: string }>(`/growthcopilots/${id}/execute`, inputs),
  },

  // Branding Lab API (Brand Strategy)
  brandingLab: {
    getAll: (params?: PaginationParams) =>
      apiClient.safeGet<PaginatedResponse<BrandingLab>>('/brandinglabs', params, true),

    getById: (id: string) =>
      apiClient.safeGet<BrandingLab>(`/brandinglabs/${id}`, undefined, false),

    create: (data: {
      name: string
      description?: string
      input_fields?: string[]
      dropdown?: string[]
      system_prompt: string
      user_starting_prompt?: string
    }) => apiClient.post<BrandingLab>('/brandinglabs', data),

    update: (id: string, data: Partial<BrandingLab>) =>
      apiClient.put<BrandingLab>(`/brandinglabs/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/brandinglabs/${id}`),

    // Execute a branding framework
    execute: (id: string, inputs: Record<string, any>) =>
      apiClient.post<{ result: string }>(`/brandinglabs/${id}/execute`, inputs),
  },

  // Copywriting API (Content Generation)
  copywriting: {
    getAll: (params?: PaginationParams) =>
      apiClient.safeGet<PaginatedResponse<Copywriting>>('/copywritings', params, true),

    getById: (id: string) =>
      apiClient.safeGet<Copywriting>(`/copywritings/${id}`, undefined, false),

    create: (data: {
      name: string
      description?: string
      input_fields?: string[]
      dropdown?: string[]
      system_prompt: string
      user_starting_prompt?: string
    }) => apiClient.post<Copywriting>('/copywritings', data),

    update: (id: string, data: Partial<Copywriting>) =>
      apiClient.put<Copywriting>(`/copywritings/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/copywritings/${id}`),

    // Generate copy using AI
    generate: (id: string, inputs: Record<string, any>) =>
      apiClient.post<{ content: string }>(`/copywritings/${id}/generate`, inputs),
  },

  // Templates API (Reusable Frameworks)
  templates: {
    getAll: (params?: PaginationParams) =>
      apiClient.safeGet<PaginatedResponse<Template>>('/templates', params, true),

    getById: (id: string) =>
      apiClient.safeGet<Template>(`/templates/${id}`, undefined, false),

    create: (data: {
      name: string
      user_given_prompt?: string
      system_prompt?: string
      user_starting_prompt?: string
      text_input_queries?: string[]
      text_input_given?: string[]
      drop_down?: string[]
      brandinglabId?: string
      growthcopilotId?: string
      copywritingId?: string
      documentIds?: string[]
    }) => apiClient.post<Template>('/templates', data),

    update: (id: string, data: Partial<Template>) =>
      apiClient.put<Template>(`/templates/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/templates/${id}`),

    // Use template to generate content
    use: (id: string, inputs: Record<string, any>) =>
      apiClient.post<{ result: string }>(`/templates/${id}/use`, inputs),

    // Get templates by category
    getByCategory: (category: 'brandinglab' | 'growthcopilot' | 'copywriting', params?: PaginationParams) =>
      apiClient.getPaginated<Template>(`/templates/category/${category}`, params),
  },

  // Documents API (Knowledge Base)
  documents: {
    getAll: (params?: PaginationParams) =>
      apiClient.getPaginated<Document>('/documents', params),

    getById: (id: string) =>
      apiClient.get<Document>(`/documents/${id}`),

    create: (data: {
      name: string
      content?: string
      file_path?: string
      businessId?: string
    }) => apiClient.post<Document>('/documents', data),

    update: (id: string, data: Partial<Document>) =>
      apiClient.put<Document>(`/documents/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/documents/${id}`),

    // Upload document file
    upload: (file: File, businessId?: string, onProgress?: (progress: number) => void) =>
      apiClient.uploadFile<Document>('/documents/upload', file, { businessId }, onProgress),

    // Get documents for a specific business
    getByBusiness: (businessId: string, params?: PaginationParams) =>
      apiClient.getPaginated<Document>(`/documents/business/${businessId}`, params),
  },

  // Business Management API
  business: {
    getAll: (params?: PaginationParams) =>
      apiClient.safeGet<PaginatedResponse<Business>>('/businesses', params, true),

    getById: (id: string) =>
      apiClient.safeGet<Business>(`/businesses/${id}`, undefined, false),

    create: (data: {
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
    }) => apiClient.post<Business>('/businesses', data),

    update: (id: string, data: Partial<Business>) =>
      apiClient.put<Business>(`/businesses/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/businesses/${id}`),

    // Get business users
    getUsers: (id: string) =>
      apiClient.get<{ businessId: string; businessName: string; users: any[] }>(`/businesses/${id}/users`),

    // Add user to business
    addUser: (id: string, userId: string) =>
      apiClient.post(`/businesses/${id}/users`, { userId }),

    // Remove user from business
    removeUser: (id: string, userId: string) =>
      apiClient.delete(`/businesses/${id}/users/${userId}`),

    // Get my business (current user's business)
    getMine: () =>
      apiClient.get<Business>('/businesses/me'),
  },

  // Payments API
  payments: {
    getAll: (params?: PaginationParams) =>
      apiClient.getPaginated<Payment>('/payments', params),

    getById: (id: string) =>
      apiClient.get<Payment>(`/payments/${id}`),

    create: (data: {
      amount: number
      currency: string
      paymentMethod: string
      businessId?: string
      plan: string
      billingPeriod: 'monthly' | 'yearly'
    }) => apiClient.post<Payment>('/payments', data),

    // Get my payments (current user's payments)
    getMine: (params?: PaginationParams) =>
      apiClient.getPaginated<Payment>('/payments/me', params),
  },

  // AI Generation API (Combined AI services)
  ai: {
    // Generate content using AI with context
    generate: (data: {
      type: 'strategy' | 'branding' | 'copy' | 'template'
      framework?: string
      inputs: Record<string, any>
      context?: {
        businessId?: string
        documentIds?: string[]
        previousResults?: string[]
      }
    }) => apiClient.post<{ content: string; suggestions?: string[] }>('/ai/generate', data),

    // Chat with AI using business context
    chat: (data: {
      message: string
      conversationId?: string
      context?: {
        businessId?: string
        documentIds?: string[]
        framework?: string
      }
    }) => apiClient.post<{ response: string; conversationId: string }>('/ai/chat', data),

    // Analyze existing content
    analyze: (data: {
      content: string
      type: 'strategy' | 'branding' | 'copy'
      businessContext?: string
    }) => apiClient.post<{ analysis: string; suggestions: string[] }>('/ai/analyze', data),
  },

  // Dashboard Analytics
  analytics: {
    // Get user dashboard data
    getDashboard: () =>
      apiClient.get<{
        totalTemplates: number
        totalDocuments: number
        totalGenerations: number
        recentActivity: any[]
        usage: {
          aiCredits: { used: number; total: number }
          storage: { used: number; total: number }
        }
      }>('/analytics/dashboard'),

    // Get usage statistics
    getUsage: (period?: 'day' | 'week' | 'month' | 'year') =>
      apiClient.get<{
        aiGenerations: number[]
        templatesCreated: number[]
        documentsUploaded: number[]
        labels: string[]
      }>('/analytics/usage', { period }),

    // Get business insights
    getInsights: (businessId: string) =>
      apiClient.get<{
        industryBenchmarks: any
        performanceMetrics: any
        recommendations: string[]
      }>(`/analytics/insights/${businessId}`),
  },
}

// Utility functions for working with iDEAN AI data
export const ideanUtils = {
  // Get framework categories
  getFrameworkCategories: () => [
    { id: 'strategy', name: 'Strategy & Growth', icon: 'TrendingUp' },
    { id: 'branding', name: 'Brand & Messaging', icon: 'Palette' },
    { id: 'copywriting', name: 'Content & Copy', icon: 'PenTool' },
  ],

  // Format framework inputs for display
  formatFrameworkInputs: (inputs: string[] = []): { label: string; type: string; required: boolean }[] => {
    return inputs.map(input => {
      const [label, type = 'text', required = 'true'] = input.split('|')
      return {
        label: label.trim(),
        type: type.trim(),
        required: required.trim() === 'true'
      }
    })
  },

  // Validate business data
  validateBusinessData: (data: Partial<Business>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!data.business_name || data.business_name.length < 2) {
      errors.push('Business name must be at least 2 characters')
    }

    if (!data.website_url) {
      errors.push('Website URL is required')
    } else {
      try {
        new URL(data.website_url)
      } catch {
        errors.push('Website URL must be a valid URL')
      }
    }

    if (!data.industry_tag) {
      errors.push('Industry is required')
    }

    if (!data.language) {
      errors.push('Language is required')
    }

    if (!data.mentor_approval) {
      errors.push('Mentor approval status is required')
    }

    if (!data.module_select) {
      errors.push('Module selection is required')
    }

    if (!data.readiness_checklist) {
      errors.push('Readiness checklist is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Get industry options
  getIndustryOptions: () => [
    'Technology',
    'E-commerce',
    'Healthcare',
    'Education',
    'Finance',
    'Real Estate',
    'Food & Beverage',
    'Fashion & Beauty',
    'Travel & Tourism',
    'Consulting',
    'Manufacturing',
    'Agriculture',
    'Entertainment',
    'Non-profit',
    'Other'
  ],

  // Get language options
  getLanguageOptions: () => [
    { code: 'en', name: 'English' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
  ],

  // Get module options
  getModuleOptions: () => [
    { value: 'standard', name: 'Standard', description: 'Basic frameworks and templates' },
    { value: 'pro', name: 'Pro', description: 'Advanced frameworks with AI generation' },
  ],

  // Format template for execution
  formatTemplateForExecution: (template: Template, inputs: Record<string, any>) => {
    let prompt = template.system_prompt || ''
    
    // Replace placeholders in prompt with user inputs
    Object.entries(inputs).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value))
    })

    return {
      prompt,
      inputs,
      templateId: template.id,
      templateName: template.name
    }
  }
}

export default ideanApi