import { apiClient } from './client'
import { PaginationParams, PaginatedResponse, User } from '@/types/api'

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

// Response type for regeneratespecific endpoint
export interface RegenerateSpecificResponse {
  success: boolean
  message: string
  data: {
    modifiedContent: string
    copyWriting: {
      id: string
      name: string
      description: string
    }
    modificationDetails: {
      originalDocumentId: string
      userInstruction: string
      documentTextLength: number
      modifiedTextLength: number
    }
    generationMetadata: {
      usage: {
        completion_tokens: number
        completion_tokens_details: {
          accepted_prediction_tokens: number
          audio_tokens: number
          reasoning_tokens: number
          rejected_prediction_tokens: number
        }
        prompt_tokens: number
        prompt_tokens_details: {
          audio_tokens: number
          cached_tokens: number
        }
        total_tokens: number
      }
      model: string
      finishReason: string
    }
    savedDocument?: {
      id: string
      name: string
      action: string
    }
  }
}

// Response type for chat-based feedback regeneration
export interface ChatRegenerationResponse {
  success: boolean
  message: string
  data: {
    regeneratedContent: string
    userFeedback: string
    documentHistory: Array<{
      id: string
      name: string
      output_content: string
      createdAt: string
    }>
    generationMetadata: {
      usage: any
      model: string
      finishReason: string
      timestamp: string
    }
  }
}

export interface CopywritingGenerateResponse {
  success: boolean
  message: string
  data: {
    generatedContent: string
    copyWriting: {
      id: string
      name: string
      description?: string
    }
    businessContext: {
      businessId: string
      businessName: string
      industry: string
    }
    inputsUsed: {
      userInputs: Record<string, any>
      userSelections?: Record<string, any>
      userPrompt?: string
    }
    generationMetadata: {
      usage: {
        completion_tokens: number
        prompt_tokens: number
        total_tokens: number
        completion_tokens_details?: any
        prompt_tokens_details?: any
      }
      model: string
      finishReason: string
    }
    savedDocument?: {
      id: string
      name: string
    }
  }
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
  // New fields from the API response
  serviceType?: 'copywriting' | 'brandinglab' | 'growthcopilot'
  serviceId?: string
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
      apiClient.safeGet<PaginatedResponse<GrowthCopilot>>('/api/v1/growthcopilots', params, true),

    getById: (id: string) =>
      apiClient.safeGet<GrowthCopilot>(`/api/v1/growthcopilots/${id}`, undefined, false),

    create: (data: {
      name: string
      description?: string
      input_fields?: string[]
      dropdown?: string[]
      system_prompt: string
      user_starting_prompt?: string
    }) => apiClient.post<GrowthCopilot>('/api/v1/growthcopilots', data),

    update: (id: string, data: Partial<GrowthCopilot>) =>
      apiClient.put<GrowthCopilot>(`/api/v1/growthcopilots/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/api/v1/growthcopilots/${id}`),

    // Execute a growth strategy framework
    execute: (id: string, inputs: Record<string, any>) =>
      apiClient.post<{ result: string }>(`/api/v1/growthcopilots/${id}/execute`, inputs),

    // Generate growth strategy content using AI
    generate: (id: string, payload: {
      userInputs: Record<string, any>
      userSelections?: Record<string, any>
      userPrompt?: string
      businessContext?: boolean
      generationOptions?: {
        temperature?: number
        maxTokens?: number
        topP?: number
        saveDocument?: boolean
      }
    }) =>
      apiClient.post<{ content: string }>(`/api/v1/growthcopilots/${id}/generate`, payload),
  },

  // Branding Lab API (Brand Strategy)
  brandingLab: {
    getAll: (params?: PaginationParams) =>
      apiClient.safeGet<PaginatedResponse<BrandingLab>>('/api/v1/brandinglabs', params, true),

    getById: (id: string) =>
      apiClient.safeGet<BrandingLab>(`/api/v1/brandinglabs/${id}`, undefined, false),

    create: (data: {
      name: string
      description?: string
      input_fields?: string[]
      dropdown?: string[]
      system_prompt: string
      user_starting_prompt?: string
    }) => apiClient.post<BrandingLab>('/api/v1/brandinglabs', data),

    update: (id: string, data: Partial<BrandingLab>) =>
      apiClient.put<BrandingLab>(`/api/v1/brandinglabs/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/api/v1/brandinglabs/${id}`),

    // Execute a branding framework
    execute: (id: string, inputs: Record<string, any>) =>
      apiClient.post<{ result: string }>(`/api/v1/brandinglabs/${id}/execute`, inputs),

    // Generate branding content using AI
    generate: (id: string, payload: {
      userInputs: Record<string, any>
      userSelections?: Record<string, any>
      userPrompt?: string
      businessContext?: boolean
      generationOptions?: {
        temperature?: number
        maxTokens?: number
        topP?: number
        saveDocument?: boolean
      }
    }) =>
      apiClient.post<{ content: string }>(`/api/v1/brandinglabs/${id}/generate`, payload),
  },

  // Copywriting API (Content Generation)
  copywriting: {
    getAll: (params?: PaginationParams & { search?: string }) =>
      apiClient.safeGet<{ copyWritings: Copywriting[] }>('/api/v1/copywriting', params, true),

    getById: (id: string) =>
      apiClient.safeGet<Copywriting>(`/api/v1/copywriting/${id}`, undefined, false),

    create: (data: {
      name: string
      description?: string
      input_fields?: string[]
      dropdown?: string[]
      system_prompt: string
      user_starting_prompt?: string
    }) => apiClient.post<Copywriting>('/api/v1/copywriting', data),

    update: (id: string, data: Partial<Copywriting>) =>
      apiClient.put<Copywriting>(`/api/v1/copywriting/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/api/v1/copywriting/${id}`),

    // Generate copy using AI with proper backend structure
    generate: (id: string, payload: {
      userInputs: Record<string, any>
      userSelections?: Record<string, any>
      userPrompt?: string
      businessContext?: boolean
      generationOptions?: {
        temperature?: number
        maxTokens?: number
        topP?: number
        saveDocument?: boolean
      }
    }) =>
      apiClient.post<CopywritingGenerateResponse>(`/api/v1/copywriting/${id}/generate`, payload),

    // Regenerate specific parts of existing content
    regenerateSpecific: (id: string, data: {
      documentText: string
      userInstruction: string
      documentId?: string
      saveDocument?: boolean
      generationOptions?: {
        temperature?: number
        maxTokens?: number
      }
    }) =>
      apiClient.post<RegenerateSpecificResponse>(`/api/v1/copywriting/${id}/regeneratespecific`, data),

    // Chat-based feedback regeneration
    chatRegenerate: (id: string, data: {
      userMessage: string
      documentId?: string
      userInputs?: Record<string, any>
      userSelections?: Record<string, any>
      businessContext?: boolean
      includeHistory?: boolean
      generationOptions?: {
        temperature?: number
        maxTokens?: number
        topP?: number
      }
    }) =>
      apiClient.post<ChatRegenerationResponse>(`/api/v1/copywriting/${id}/chat`, data),

    // Create template from copywriting framework
    createTemplate: (id: string, data: {
      name: string
      user_given_prompt: string
      text_input_queries: string[]
      text_input_given: string[]
      drop_down: string[]
      documentIds?: string[]
    }) =>
      apiClient.post<Template>(`/api/v1/copywriting/${id}/templates`, data),

    // Get copywriting templates for current user - use general templates endpoint with copywriting filter
    getTemplates: (params?: PaginationParams) =>
      apiClient.safeGet<PaginatedResponse<Template>>('/api/v1/templates/category/copywriting', params, true),
  },

  // Templates API (Reusable Frameworks)
  templates: {
    getAll: (params?: PaginationParams) =>
      apiClient.safeGet<PaginatedResponse<Template>>('/api/v1/templates', params, true),

    getById: (id: string) =>
      apiClient.safeGet<Template>(`/api/v1/templates/${id}`, undefined, false),

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
    }) => apiClient.post<Template>('/api/v1/templates', data),

    update: (id: string, data: Partial<Template>) =>
      apiClient.put<Template>(`/api/v1/templates/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/api/v1/templates/${id}`),

    // Use template to generate content
    use: (id: string, inputs: Record<string, any>) =>
      apiClient.post<{ result: string }>(`/api/v1/templates/${id}/use`, inputs),

    // Get templates by category
    getByCategory: (category: 'brandinglab' | 'growthcopilot' | 'copywriting', params?: PaginationParams) =>
      apiClient.getPaginated<Template>(`/api/v1/templates/category/${category}`, params),

    // Get current user's templates
    getMyTemplates: (params?: PaginationParams) =>
      apiClient.safeGet<{
        success: boolean
        message: string
        data: {
          templates: Template[]
          pagination: {
            total: number
            page: number
            limit: number
            pages: number
            hasNext: boolean
            hasPrev: boolean
          }
          summary: {
            totalTemplates: number
            copywritingTemplates: number
            brandinglabTemplates: number
            growthcopilotTemplates: number
          }
        }
      }>('/api/v1/templates/my-templates', params, true),
  },

  // Documents API (Knowledge Base)
  documents: {
    getAll: (params?: PaginationParams) =>
      apiClient.getPaginated<Document>('/api/v1/documents', params),

    getById: (id: string) =>
      apiClient.get<Document>(`/api/v1/documents/${id}`),

    create: (data: {
      name: string
      content?: string
      file_path?: string
      businessId?: string
    }) => apiClient.post<Document>('/api/v1/documents', data),

    update: (id: string, data: Partial<Document>) =>
      apiClient.put<Document>(`/api/v1/documents/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/api/v1/documents/${id}`),

    // Upload document file to business knowledge base
    upload: (file: File, businessId: string, onProgress?: (progress: number) => void) =>
      apiClient.uploadFile<{documentsUploaded: any[]}>(`/api/v1/businesses/${businessId}/documents`, file, {}, onProgress),

    // Get documents for a specific business
    getByBusiness: (businessId: string, params?: PaginationParams) =>
      apiClient.get<{businessId: string; businessName: string; documents: any[]}>(`/api/v1/businesses/${businessId}/documents`),
      
    // Search documents in user's business using vector similarity
    search: (query: string, limit: number = 5) =>
      apiClient.get<{success: boolean; query: string; businessId: string; results: any[]}>('/api/v1/businesses/documents/search', { query, limit }),
  },

  // Business Management API
  business: {
    getAll: (params?: PaginationParams) =>
      apiClient.safeGet<PaginatedResponse<Business>>('/api/v1/businesses', params, true),

    getById: (id: string) =>
      apiClient.safeGet<Business>(`/api/v1/businesses/${id}`, undefined, false),

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
    }) => apiClient.post<Business>('/api/v1/businesses', data),

    // Create business with PDF document upload (multipart/form-data)
    createWithDocument: (data: {
      business_name: string
      website_url: string
      industry_tag: string
      business_context?: string
      language: string
      mentor_approval: string
      module_select: 'standard' | 'pro'
      readiness_checklist: string
    }, document?: File, onProgress?: (progress: number) => void) => {
      if (document) {
        const formData = new FormData()
        formData.append('business_name', data.business_name)
        formData.append('website_url', data.website_url)
        formData.append('industry_tag', data.industry_tag)
        formData.append('language', data.language)
        formData.append('mentor_approval', data.mentor_approval)
        formData.append('module_select', data.module_select)
        formData.append('readiness_checklist', data.readiness_checklist)
        formData.append('business_documents', '[]')
        formData.append('adds_history', '[]')
        if (data.business_context) {
          formData.append('business_context', data.business_context)
        }
        formData.append('documents', document)
        
        return apiClient.request<{business: Business; documentsUploaded: number}>('/api/v1/businesses', {
          method: 'POST',
          body: formData,
          headers: {} // Let browser set content-type for multipart
        })
      } else {
        return apiClient.post<{business: Business}>('/api/v1/businesses', {
          ...data,
          business_documents: [],
          adds_history: []
        })
      }
    },

    update: (id: string, data: Partial<Business>) =>
      apiClient.put<Business>(`/api/v1/businesses/${id}`, data),

    delete: (id: string) =>
      apiClient.delete(`/api/v1/businesses/${id}`),

    // Get business users
    getUsers: (id: string) =>
      apiClient.get<{ businessId: string; businessName: string; users: any[] }>(`/api/v1/businesses/${id}/users`),

    // Add user to business
    addUser: (id: string, userId: string) =>
      apiClient.post(`/api/v1/businesses/${id}/users`, { userId }),

    // Remove user from business
    removeUser: (id: string, userId: string) =>
      apiClient.delete(`/api/v1/businesses/${id}/users/${userId}`),

    // Get my business (current user's business)
    getMine: () =>
      apiClient.get<Business>('/api/v1/businesses/me'),

    // Create additional business for existing user (wrapper for better UX)
    createAdditional: (data: {
      business_name: string
      website_url: string
      industry_tag: string
      business_context?: string
      language: string
      mentor_approval: string
      module_select: 'standard' | 'pro'
      readiness_checklist: string
    }) => {
      console.log('📝 Creating additional business for existing user:', data.business_name)
      return apiClient.post<{business: Business}>('/api/v1/businesses', {
        ...data,
        business_documents: [],
        adds_history: []
      })
    },

    // Create additional business with documents for existing user
    createAdditionalWithDocument: (data: {
      business_name: string
      website_url: string
      industry_tag: string
      business_context?: string
      language: string
      mentor_approval: string
      module_select: 'standard' | 'pro'
      readiness_checklist: string
    }, document?: File, onProgress?: (progress: number) => void) => {
      console.log('📝 Creating additional business with document for existing user:', data.business_name)

      if (document) {
        const formData = new FormData()
        formData.append('business_name', data.business_name)
        formData.append('website_url', data.website_url)
        formData.append('industry_tag', data.industry_tag)
        formData.append('language', data.language)
        formData.append('mentor_approval', data.mentor_approval)
        formData.append('module_select', data.module_select)
        formData.append('readiness_checklist', data.readiness_checklist)
        formData.append('business_documents', '[]')
        formData.append('adds_history', '[]')
        if (data.business_context) {
          formData.append('business_context', data.business_context)
        }
        formData.append('documents', document)

        return apiClient.request<{business: Business; documentsUploaded: number}>('/api/v1/businesses', {
          method: 'POST',
          body: formData,
          headers: {} // Let browser set content-type for multipart
        })
      } else {
        return apiClient.post<{business: Business}>('/api/v1/businesses', {
          ...data,
          business_documents: [],
          adds_history: []
        })
      }
    },
  },

  // User API
  user: {
    // Get current user profile (with business information)
    getMe: () =>
      apiClient.get<User>('/api/v1/users/me'),

    // Update current user profile
    updateMe: (data: { name?: string; photoURL?: string }) =>
      apiClient.put<User>('/api/v1/users/me', data),

    // Get user by ID
    getById: (id: string) =>
      apiClient.get<User>(`/api/v1/users/${id}`),

    // Get all users (admin only)
    getAll: (params?: PaginationParams) =>
      apiClient.getPaginated<User>('/api/v1/users', params),
  },

  // Payments API
  payments: {
    getAll: (params?: PaginationParams) =>
      apiClient.getPaginated<Payment>('/api/v1/payments', params),

    getById: (id: string) =>
      apiClient.get<Payment>(`/api/v1/payments/${id}`),

    create: (data: {
      amount: number
      currency: string
      paymentMethod: string
      businessId?: string
      plan: string
      billingPeriod: 'monthly' | 'yearly'
    }) => apiClient.post<Payment>('/api/v1/payments', data),

    // Get my payments (current user's payments)
    getMine: (params?: PaginationParams) =>
      apiClient.getPaginated<Payment>('/api/v1/payments/me', params),
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
    }) => apiClient.post<{ content: string; suggestions?: string[] }>('/api/v1/ai/generate', data),

    // Chat with AI using business context
    chat: (data: {
      message: string
      conversationId?: string
      context?: {
        businessId?: string
        documentIds?: string[]
        framework?: string
      }
    }) => apiClient.post<{ response: string; conversationId: string }>('/api/v1/ai/chat', data),

    // Analyze existing content
    analyze: (data: {
      content: string
      type: 'strategy' | 'branding' | 'copy'
      businessContext?: string
    }) => apiClient.post<{ analysis: string; suggestions: string[] }>('/api/v1/ai/analyze', data),
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
      }>('/api/v1/analytics/dashboard'),

    // Get usage statistics
    getUsage: (period?: 'day' | 'week' | 'month' | 'year') =>
      apiClient.get<{
        aiGenerations: number[]
        templatesCreated: number[]
        documentsUploaded: number[]
        labels: string[]
      }>('/api/v1/analytics/usage', { period }),

    // Get business insights
    getInsights: (businessId: string) =>
      apiClient.get<{
        industryBenchmarks: any
        performanceMetrics: any
        recommendations: string[]
      }>(`/api/v1/analytics/insights/${businessId}`),
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
  ],

  // Get module options
  getModuleOptions: () => [
    { value: 'standard', name: 'Free', description: 'Basic frameworks and templates' },
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