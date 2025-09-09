import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { apiClient, APIError } from './client'
import {
  User,
  ContentGenerationRequest,
  ContentGenerationResponse,
  ContentItem,
  KnowledgeBase,
  KnowledgeBaseUploadResponse,
  UsageAnalytics,
  Framework,
  TeamMember,
  TeamInvitation,
  InviteTeamMemberRequest,
  Campaign,
  Template,
  SearchFilters,
  PaginationParams,
  PaginatedResponse,
  Business,
  Subscription,
  BillingHistory,
  UserUpdateRequest
} from '@/types/api'
import { toast } from 'sonner' // Assuming you're using sonner for notifications

// Query Keys
export const queryKeys = {
  user: ['user'] as const,
  organization: ['organization'] as const,
  content: {
    all: ['content'] as const,
    list: (filters?: SearchFilters) => ['content', 'list', filters] as const,
    detail: (id: string) => ['content', 'detail', id] as const,
  },
  knowledgeBase: {
    all: ['knowledge-base'] as const,
    list: () => ['knowledge-base', 'list'] as const,
    detail: (id: string) => ['knowledge-base', 'detail', id] as const,
  },
  analytics: {
    usage: (period: string) => ['analytics', 'usage', period] as const,
  },
  frameworks: ['frameworks'] as const,
  team: {
    members: ['team', 'members'] as const,
    invitations: ['team', 'invitations'] as const,
  },
  campaigns: ['campaigns'] as const,
  templates: ['templates'] as const,
  subscription: ['subscription'] as const,
  billing: ['billing'] as const,
} as const

// Authentication & User Management
export function useUser() {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => apiClient.get<User>('/api/auth/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof APIError && error.status === 401) {
        return false // Don't retry unauthorized errors
      }
      return failureCount < 3
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UserUpdateRequest) =>
      apiClient.put<User>('/api/auth/me', data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.user, updatedUser)
      toast.success('Profile updated successfully')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

export function useBusiness() {
  return useQuery({
    queryKey: queryKeys.organization,
    queryFn: () => apiClient.get<Business>('/api/business/me'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Content Generation
export function useGenerateContent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: ContentGenerationRequest) =>
      apiClient.post<ContentGenerationResponse>('/api/content/generate', request),
    onSuccess: (response) => {
      // Invalidate user query to refresh credits
      queryClient.invalidateQueries({ queryKey: queryKeys.user })
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all })
      
      toast.success(`Content generated! ${response.credits_remaining} credits remaining`)
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to generate content')
    },
  })
}

export function useContentList(
  filters?: SearchFilters,
  pagination?: PaginationParams
) {
  const params = { ...filters, ...pagination }
  
  return useQuery({
    queryKey: queryKeys.content.list(filters),
    queryFn: () => apiClient.getPaginated<ContentItem>('/api/content', params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useContentDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.content.detail(id),
    queryFn: () => apiClient.get<ContentItem>(`/api/content/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateContent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentItem> }) =>
      apiClient.put<ContentItem>(`/api/content/${id}`, data),
    onSuccess: (updatedContent) => {
      queryClient.setQueryData(
        queryKeys.content.detail(updatedContent.id),
        updatedContent
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all })
      toast.success('Content updated successfully')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to update content')
    },
  })
}

export function useDeleteContent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/content/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.content.all })
      toast.success('Content deleted successfully')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to delete content')
    },
  })
}

// Knowledge Base
export function useKnowledgeBaseList() {
  return useQuery({
    queryKey: queryKeys.knowledgeBase.list(),
    queryFn: () => apiClient.get<KnowledgeBase[]>('/api/knowledge-base'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUploadKnowledgeBase() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      file, 
      onProgress 
    }: { 
      file: File; 
      onProgress?: (progress: number) => void 
    }) =>
      apiClient.uploadFile<KnowledgeBaseUploadResponse>(
        '/api/knowledge-base/upload',
        file,
        undefined,
        onProgress
      ),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeBase.all })
      toast.success(`File uploaded successfully: ${response.file_name}`)
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to upload file')
    },
  })
}

export function useDeleteKnowledgeBase() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/knowledge-base/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledgeBase.all })
      toast.success('File deleted successfully')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to delete file')
    },
  })
}

// Analytics & Usage
export function useUsageAnalytics(period: 'day' | 'week' | 'month' = 'month') {
  return useQuery({
    queryKey: queryKeys.analytics.usage(period),
    queryFn: () => apiClient.get<UsageAnalytics>(`/api/analytics/usage?period=${period}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

// Frameworks
export function useFrameworks() {
  return useQuery({
    queryKey: queryKeys.frameworks,
    queryFn: () => apiClient.get<Framework[]>('/api/frameworks'),
    staleTime: 30 * 60 * 1000, // 30 minutes - frameworks don't change often
  })
}

export function useFrameworkDetail(id: string) {
  return useQuery({
    queryKey: ['framework', id],
    queryFn: () => apiClient.get<Framework>(`/api/frameworks/${id}`),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Team Management
export function useTeamMembers() {
  return useQuery({
    queryKey: queryKeys.team.members,
    queryFn: () => apiClient.get<TeamMember[]>('/api/team/members'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: InviteTeamMemberRequest) =>
      apiClient.post<TeamInvitation>('/api/team/invite', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.invitations })
      toast.success('Team member invited successfully')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to invite team member')
    },
  })
}

export function useTeamInvitations() {
  return useQuery({
    queryKey: queryKeys.team.invitations,
    queryFn: () => apiClient.get<TeamInvitation[]>('/api/team/invitations'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      role 
    }: { 
      userId: string; 
      role: 'admin' | 'member' 
    }) =>
      apiClient.put(`/api/team/members/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.members })
      toast.success('Team member role updated')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to update role')
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`/api/team/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.members })
      toast.success('Team member removed')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to remove team member')
    },
  })
}

// Campaigns
export function useCampaigns() {
  return useQuery({
    queryKey: queryKeys.campaigns,
    queryFn: () => apiClient.get<Campaign[]>('/api/campaigns'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) =>
      apiClient.post<Campaign>('/api/campaigns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns })
      toast.success('Campaign created successfully')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to create campaign')
    },
  })
}

// Templates
export function useTemplates() {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: () => apiClient.get<Template[]>('/api/templates'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Omit<Template, 'id' | 'created_at' | 'usage_count'>) =>
      apiClient.post<Template>('/api/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      toast.success('Template created successfully')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to create template')
    },
  })
}

// Billing & Subscription
export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: () => apiClient.get<Subscription>('/api/billing/subscription'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useBillingHistory() {
  return useQuery({
    queryKey: queryKeys.billing,
    queryFn: () => apiClient.get<BillingHistory[]>('/api/billing/history'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpgradePlan() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ plan }: { plan: 'standard' | 'pro' }) =>
      apiClient.post('/api/billing/upgrade', { plan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription })
      queryClient.invalidateQueries({ queryKey: queryKeys.user })
      toast.success('Plan upgraded successfully!')
    },
    onError: (error: APIError) => {
      toast.error(error.message || 'Failed to upgrade plan')
    },
  })
}

// Real-time hooks using WebSocket
export function useWebSocketConnection<T>(
  endpoint: string,
  onMessage: (data: T) => void,
  enabled = true
) {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: ['websocket', endpoint],
    queryFn: () => {
      if (!enabled) return null
      
      const ws = apiClient.connectWebSocket(
        endpoint,
        (data: T) => {
          onMessage(data)
          
          // Optionally invalidate relevant queries on updates
          if (endpoint.includes('content')) {
            queryClient.invalidateQueries({ queryKey: queryKeys.content.all })
          }
          if (endpoint.includes('credits')) {
            queryClient.invalidateQueries({ queryKey: queryKeys.user })
          }
        },
        (error) => {
          console.error('WebSocket error:', error)
          toast.error('Connection lost. Trying to reconnect...')
        },
        () => {
          console.log('WebSocket connection closed')
        }
      )
      
      return ws
    },
    enabled,
    staleTime: Infinity, // WebSocket connections don't become stale
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

// Custom hook for infinite queries (useful for content feeds)
export function useInfiniteContent(filters?: SearchFilters) {
  return useQuery({
    queryKey: ['content', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getPaginated<ContentItem>('/api/content', {
        ...filters,
        page: pageParam as number,
        limit: 20,
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Utility hook for handling API errors globally
export function useGlobalErrorHandler() {
  return (error: APIError) => {
    // Log to monitoring service
    console.error('API Error:', {
      message: error.message,
      status: error.status,
      errorCode: error.errorCode,
      details: error.details,
    })
    
    // Handle specific error types
    switch (error.errorCode) {
      case 'INSUFFICIENT_CREDITS':
        // Could trigger upgrade modal
        break
      case 'UNAUTHORIZED':
        // Could trigger re-authentication
        window.location.href = '/login'
        break
      case 'RATE_LIMIT_EXCEEDED':
        // Could show rate limit warning
        break
      default:
        // Show generic error toast
        toast.error(error.message || 'An unexpected error occurred')
    }
  }
}