// API Endpoints Reference for iDEAN AI Backend Integration

export const API_ENDPOINTS = {
  // Authentication & User Management
  AUTH: {
    SYNC_USER: '/api/auth/sync-user',
    ME: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/me',
    DELETE_ACCOUNT: '/api/auth/me',
    CHANGE_PASSWORD: '/api/auth/change-password',
    UPLOAD_AVATAR: '/api/auth/avatar',
  },

  // Organization Management
  ORGANIZATION: {
    GET: '/api/organization/me',
    UPDATE: '/api/organization/me',
    TRANSFER_OWNERSHIP: '/api/organization/transfer',
    DELETE: '/api/organization/me',
    SETTINGS: '/api/organization/settings',
  },

  // Content Generation
  CONTENT: {
    LIST: '/api/content',
    GENERATE: '/api/content/generate',
    GET: (id: string) => `/api/content/${id}`,
    UPDATE: (id: string) => `/api/content/${id}`,
    DELETE: (id: string) => `/api/content/${id}`,
    DUPLICATE: (id: string) => `/api/content/${id}/duplicate`,
    EXPORT: '/api/content/export',
    BULK_DELETE: '/api/content/bulk-delete',
    SEARCH: '/api/content/search',
  },

  // Knowledge Base
  KNOWLEDGE_BASE: {
    LIST: '/api/knowledge-base',
    UPLOAD: '/api/knowledge-base/upload',
    GET: (id: string) => `/api/knowledge-base/${id}`,
    DELETE: (id: string) => `/api/knowledge-base/${id}`,
    DOWNLOAD: (id: string) => `/api/knowledge-base/${id}/download`,
    PROCESS: (id: string) => `/api/knowledge-base/${id}/process`,
  },

  // Frameworks
  FRAMEWORKS: {
    LIST: '/api/frameworks',
    GET: (id: string) => `/api/frameworks/${id}`,
    CATEGORIES: '/api/frameworks/categories',
  },

  // Analytics & Usage
  ANALYTICS: {
    USAGE: '/api/analytics/usage',
    PERFORMANCE: '/api/analytics/performance',
    EXPORT: '/api/analytics/export',
    DASHBOARD: '/api/analytics/dashboard',
  },

  // Team Management
  TEAM: {
    MEMBERS: '/api/team/members',
    INVITE: '/api/team/invite',
    INVITATIONS: '/api/team/invitations',
    CANCEL_INVITATION: (id: string) => `/api/team/invitations/${id}/cancel`,
    RESEND_INVITATION: (id: string) => `/api/team/invitations/${id}/resend`,
    UPDATE_ROLE: (userId: string) => `/api/team/members/${userId}/role`,
    REMOVE_MEMBER: (userId: string) => `/api/team/members/${userId}`,
    ACCEPT_INVITATION: '/api/team/accept-invitation',
  },

  // Campaigns
  CAMPAIGNS: {
    LIST: '/api/campaigns',
    CREATE: '/api/campaigns',
    GET: (id: string) => `/api/campaigns/${id}`,
    UPDATE: (id: string) => `/api/campaigns/${id}`,
    DELETE: (id: string) => `/api/campaigns/${id}`,
    DUPLICATE: (id: string) => `/api/campaigns/${id}/duplicate`,
    PERFORMANCE: (id: string) => `/api/campaigns/${id}/performance`,
  },

  // Templates
  TEMPLATES: {
    LIST: '/api/templates',
    CREATE: '/api/templates',
    GET: (id: string) => `/api/templates/${id}`,
    UPDATE: (id: string) => `/api/templates/${id}`,
    DELETE: (id: string) => `/api/templates/${id}`,
    USE: (id: string) => `/api/templates/${id}/use`,
    PUBLIC: '/api/templates/public',
  },

  // Billing & Subscription
  BILLING: {
    SUBSCRIPTION: '/api/billing/subscription',
    UPGRADE: '/api/billing/upgrade',
    DOWNGRADE: '/api/billing/downgrade',
    CANCEL: '/api/billing/cancel',
    HISTORY: '/api/billing/history',
    INVOICE: (id: string) => `/api/billing/invoices/${id}`,
    UPDATE_PAYMENT_METHOD: '/api/billing/payment-method',
  },

  // WebSocket Endpoints
  WEBSOCKET: {
    CONTENT_UPDATES: '/ws/content-updates',
    CREDIT_UPDATES: '/ws/credit-updates',
    TEAM_UPDATES: '/ws/team-updates',
    SYSTEM_NOTIFICATIONS: '/ws/notifications',
  },

  // Utility Endpoints
  UTILS: {
    HEALTH: '/health',
    VERSION: '/version',
    UPLOAD_LIMITS: '/api/utils/upload-limits',
    SUPPORTED_FORMATS: '/api/utils/supported-formats',
  },
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  PDF: 'application/pdf',
  TEXT: 'text/plain',
} as const

// API Response Codes (custom error codes from backend)
export const API_RESPONSE_CODES = {
  SUCCESS: 'SUCCESS',
  
  // Authentication Errors
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  
  // Content Generation Errors
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  INVALID_FRAMEWORK: 'INVALID_FRAMEWORK',
  GENERATION_FAILED: 'GENERATION_FAILED',
  CONTENT_TOO_LONG: 'CONTENT_TOO_LONG',
  INVALID_INPUT_DATA: 'INVALID_INPUT_DATA',
  
  // File Upload Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_PROCESSING_FAILED: 'FILE_PROCESSING_FAILED',
  STORAGE_LIMIT_EXCEEDED: 'STORAGE_LIMIT_EXCEEDED',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DAILY_QUOTA_EXCEEDED: 'DAILY_QUOTA_EXCEEDED',
  MONTHLY_QUOTA_EXCEEDED: 'MONTHLY_QUOTA_EXCEEDED',
  
  // Business Logic Errors
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  UPGRADE_REQUIRED: 'UPGRADE_REQUIRED',
  TEAM_LIMIT_REACHED: 'TEAM_LIMIT_REACHED',
  ORGANIZATION_NOT_FOUND: 'ORGANIZATION_NOT_FOUND',
  
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  
  // System Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
} as const

// Default pagination settings
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// File upload constraints
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 30 * 1024 * 1024, // 30MB
  ALLOWED_TYPES: {
    DOCUMENTS: ['application/pdf', 'text/plain'],
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALL: ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  MAX_FILES_PER_ORGANIZATION: {
    FREE: 4,
    STANDARD: 20,
    PRO: 100,
  },
} as const

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  ORGANIZATION_DATA: 10 * 60 * 1000, // 10 minutes
  CONTENT_LIST: 2 * 60 * 1000, // 2 minutes
  FRAMEWORKS: 30 * 60 * 1000, // 30 minutes
  ANALYTICS: 5 * 60 * 1000, // 5 minutes
  TEMPLATES: 10 * 60 * 1000, // 10 minutes
  BILLING_DATA: 15 * 60 * 1000, // 15 minutes
} as const

// WebSocket event types
export const WS_EVENT_TYPES = {
  // Content events
  CONTENT_GENERATED: 'content_generated',
  CONTENT_UPDATED: 'content_updated',
  CONTENT_DELETED: 'content_deleted',
  
  // Credit events
  CREDITS_UPDATED: 'credits_updated',
  CREDITS_LOW_WARNING: 'credits_low_warning',
  CREDITS_EXHAUSTED: 'credits_exhausted',
  
  // Team events
  TEAM_MEMBER_JOINED: 'team_member_joined',
  TEAM_MEMBER_LEFT: 'team_member_left',
  TEAM_ROLE_UPDATED: 'team_role_updated',
  
  // System events
  MAINTENANCE_SCHEDULED: 'maintenance_scheduled',
  FEATURE_UPDATED: 'feature_updated',
  PLAN_UPGRADED: 'plan_upgraded',
  
  // Real-time collaboration
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  CONTENT_LOCKED: 'content_locked',
  CONTENT_UNLOCKED: 'content_unlocked',
} as const

// Export utility functions for endpoint building
export const endpointUtils = {
  // Build URL with query parameters
  buildUrl: (endpoint: string, params?: Record<string, any>): string => {
    if (!params) return endpoint
    
    const url = new URL(endpoint, 'http://example.com') // dummy base for URL constructor
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v.toString()))
        } else {
          url.searchParams.set(key, value.toString())
        }
      }
    })
    
    return url.pathname + url.search
  },

  // Get paginated endpoint with parameters
  paginated: (endpoint: string, page = 1, limit = PAGINATION_DEFAULTS.LIMIT): string => {
    return endpointUtils.buildUrl(endpoint, { page, limit })
  },

  // Get filtered endpoint
  filtered: (endpoint: string, filters: Record<string, any>): string => {
    return endpointUtils.buildUrl(endpoint, filters)
  },

  // Combine filters and pagination
  filteredPaginated: (
    endpoint: string, 
    filters: Record<string, any> = {}, 
    page = 1, 
    limit = PAGINATION_DEFAULTS.LIMIT
  ): string => {
    return endpointUtils.buildUrl(endpoint, { ...filters, page, limit })
  },
}

// Request headers helpers
export const headerUtils = {
  // Standard JSON headers
  json: () => ({
    'Content-Type': CONTENT_TYPES.JSON,
    'Accept': CONTENT_TYPES.JSON,
  }),

  // File upload headers (don't set Content-Type for FormData)
  upload: () => ({
    'Accept': CONTENT_TYPES.JSON,
  }),

  // Custom headers
  withLanguage: (lang: 'en' | 'bn' = 'en') => ({
    ...headerUtils.json(),
    'Accept-Language': lang,
  }),

  // Request ID for tracing
  withRequestId: (requestId?: string) => ({
    ...headerUtils.json(),
    'X-Request-ID': requestId || crypto.randomUUID(),
  }),
}

export default API_ENDPOINTS