// API Response Types for iDEAN AI Backend Integration

export interface APIResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  message?: string
  error_code?: string
  timestamp?: string
}

// User & Business Types (aligned with backend Prisma schema)
export interface User {
  id: string                      // Primary key
  createdAt: string
  updatedAt: string
  email: string
  name: string
  firebaseUid?: string            // Firebase UID (optional, unique)
  photoURL?: string
  provider?: string               // google, email, etc
  businessId?: string             // Reference to Business
  role?: string                   // Default: "user"
}

export interface Business {
  id: string                      // Primary key
  createdAt: string
  updatedAt: string
  business_name: string
  website_url: string
  industry_tag: string
  business_documents: string[]    // Array of document references
  business_context?: string       // Optional context
  language: string
  mentor_approval: string
  adds_history: string[]          // Ad campaign history
  module_select: string           // standard/pro
  readiness_checklist: string    // Onboarding progress
  users: User[]                   // Related users
}

export interface UserCreateRequest {
  email: string
  name: string
  role?: string                   // Default: "user"
  firebaseUid: string
  photoURL?: string
  provider?: string               // google, email, etc
  businessId?: string             // For joining existing business
}

export interface UserUpdateRequest {
  name?: string
  photoURL?: string
  businessId?: string
  role?: string
}

// Content Generation Types
export interface ContentGenerationRequest {
  content_type: 'blueprint' | 'campaign' | 'ad_copy' | 'organic_post'
  framework?: string
  input_data: Record<string, any>
  estimated_credits: number
  language?: 'en' | 'bn'
  target_platform?: 'facebook' | 'instagram' | 'linkedin' | 'tiktok'
}

export interface ContentGenerationResponse {
  content_id: string
  generated_content: {
    title?: string
    body?: string
    cta?: string
    hooks?: string[]
    variations?: Array<{
      title: string
      body: string
      cta: string
    }>
    metadata?: Record<string, any>
  }
  credits_used: number
  credits_remaining: number
  framework_used?: string
  generation_time: number
}

export interface ContentItem {
  id: string
  user_id: string
  organization_id?: string
  content_type: 'blueprint' | 'campaign' | 'ad_copy' | 'organic_post'
  framework?: string
  input_data: Record<string, any>
  generated_content: Record<string, any>
  status: 'draft' | 'approved' | 'published' | 'archived'
  ai_credits_used: number
  created_at: string
  updated_at?: string
  tags?: string[]
  performance_data?: PerformanceData
}

export interface PerformanceData {
  impressions?: number
  clicks?: number
  conversions?: number
  ctr?: number
  conversion_rate?: number
  cost_per_click?: number
  roi?: number
  engagement_rate?: number
  reach?: number
  shares?: number
  comments?: number
  likes?: number
}

// Knowledge Base Types
export interface KnowledgeBase {
  id: string
  organization_id: string
  file_name: string
  file_type: 'pdf' | 'text'
  file_size: number
  tokens: number
  uploaded_by: string
  created_at: string
  status: 'processing' | 'ready' | 'error'
  metadata?: Record<string, any>
}

export interface KnowledgeBaseUploadResponse {
  file_id: string
  file_name: string
  tokens: number
  processing_status: 'processing' | 'ready' | 'error'
  message: string
}

// Framework Types
export interface Framework {
  id: string
  name: string
  description: string
  category: 'marketing' | 'growth' | 'strategy' | 'content'
  inputs: Array<{
    field: string
    label: string
    type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number'
    required: boolean
    placeholder?: string
    options?: string[]
    validation?: {
      min?: number
      max?: number
      pattern?: string
    }
  }>
  outputs: string[]
  credit_cost: number
  examples?: Array<{
    title: string
    input: Record<string, any>
    output: Record<string, any>
  }>
}

// Analytics & Usage Types
export interface UsageAnalytics {
  period: 'day' | 'week' | 'month'
  total_credits_used: number
  total_content_generated: number
  total_files_uploaded: number
  credits_remaining: number
  daily_breakdown: Array<{
    date: string
    credits_used: number
    content_generated: number
    framework_usage: Record<string, number>
  }>
  popular_frameworks: Array<{
    framework: string
    usage_count: number
    credits_consumed: number
  }>
  content_type_breakdown: Record<string, number>
  performance_summary?: {
    avg_ctr: number
    avg_engagement: number
    best_performing_content: string
    total_impressions: number
  }
}

export interface AIUsageRecord {
  id: string
  user_id: string
  organization_id?: string
  action: 'content_generation' | 'pdf_upload' | 'ai_query' | 'blueprint_creation' | 'framework_analysis'
  credits_consumed: number
  timestamp: string
  metadata?: {
    content_type?: string
    framework?: string
    input_tokens?: number
    output_tokens?: number
    processing_time?: number
  }
}

// Team Management Types
export interface TeamMember {
  id: string
  user_id: string
  organization_id: string
  role: 'owner' | 'admin' | 'member'
  email: string
  name: string
  avatar_url?: string
  status: 'active' | 'inactive' | 'pending'
  joined_at: string
  last_active?: string
  permissions: string[]
}

export interface TeamInvitation {
  id: string
  organization_id: string
  email: string
  role: 'admin' | 'member'
  invited_by: string
  invited_at: string
  expires_at: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  invitation_token: string
}

export interface InviteTeamMemberRequest {
  email: string
  role: 'admin' | 'member'
  message?: string
}

// Billing & Subscription Types
export interface Subscription {
  id: string
  organization_id: string
  plan: 'free' | 'standard' | 'pro'
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string
  trial_end?: string
  cancel_at_period_end: boolean
  monthly_credits: number
  used_credits: number
  features: string[]
}

export interface BillingHistory {
  id: string
  organization_id: string
  amount: number
  currency: 'USD' | 'BDT'
  status: 'paid' | 'pending' | 'failed'
  invoice_url?: string
  created_at: string
  description: string
}

export interface PlanFeatures {
  plan: 'free' | 'standard' | 'pro'
  name: string
  price: number
  currency: 'USD' | 'BDT'
  billing_period: 'monthly' | 'yearly'
  features: {
    monthly_credits: number
    max_team_members: number
    max_knowledge_base_files: number
    frameworks_access: 'basic' | 'all' | 'premium'
    api_access: boolean
    priority_support: boolean
    custom_branding: boolean
    analytics_retention: number // days
  }
}

// Campaign & Template Types
export interface Campaign {
  id: string
  organization_id: string
  name: string
  description?: string
  framework: string
  target_audience: Record<string, any>
  content_items: string[] // Content IDs
  status: 'draft' | 'active' | 'paused' | 'completed'
  created_by: string
  created_at: string
  updated_at?: string
  start_date?: string
  end_date?: string
  budget?: number
  performance_data?: PerformanceData
}

export interface Template {
  id: string
  name: string
  description: string
  framework: string
  content_type: 'blueprint' | 'campaign' | 'ad_copy' | 'organic_post'
  template_data: Record<string, any>
  is_public: boolean
  created_by: string
  created_at: string
  usage_count: number
  tags: string[]
}

// Search & Filter Types
export interface SearchFilters {
  content_type?: ('blueprint' | 'campaign' | 'ad_copy' | 'organic_post')[]
  framework?: string[]
  status?: ('draft' | 'approved' | 'published' | 'archived')[]
  date_range?: {
    start: string
    end: string
  }
  tags?: string[]
  created_by?: string[]
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// Error Types
export interface APIError {
  error_code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export const ERROR_CODES = {
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  INVALID_FRAMEWORK: 'INVALID_FRAMEWORK',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// WebSocket Types (for real-time updates)
export interface WebSocketMessage {
  type: 'content_generated' | 'credits_updated' | 'team_member_joined' | 'usage_alert'
  data: Record<string, any>
  timestamp: string
  user_id?: string
  organization_id?: string
}

// Export/Import Types
export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'json' | 'pdf'
  content_types?: string[]
  date_range?: {
    start: string
    end: string
  }
  include_performance_data?: boolean
}

export interface ExportResponse {
  export_id: string
  download_url: string
  expires_at: string
  file_size: number
  format: string
}