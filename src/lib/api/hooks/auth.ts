// React hooks for authentication API calls
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthService from '@/lib/api/services/auth'
import type { User, UserCreateRequest, UserUpdateRequest } from '@/types/api'

// Query keys for caching
export const authKeys = {
  user: ['auth', 'user'] as const,
  sessions: ['auth', 'sessions'] as const,
}

/**
 * Hook to get current user data from backend
 */
export function useUser() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: authKeys.user,
    queryFn: () => AuthService.getCurrentUser(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.status === 401) return false
      return failureCount < 2
    },
  })
}

/**
 * Hook to sync user with backend after Firebase auth
 */
export function useSyncUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData: UserCreateRequest) => AuthService.syncUser(userData),
    onSuccess: (data: User) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.user, data)
      
      // Session will be updated on next page load
      // Note: NextAuth v5 doesn't have update function, session refreshes automatically
    },
    onError: (error) => {
      console.error('User sync failed:', error)
    },
  })
}

/**
 * Hook to update user data
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (updates: UserUpdateRequest) => AuthService.updateUser(updates),
    onSuccess: (data: User) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.user, data)
      
      // Session will be updated on next page load
      // Note: NextAuth v5 doesn't have update function, session refreshes automatically
    },
    onError: (error) => {
      console.error('User update failed:', error)
    },
  })
}

/**
 * Hook to delete user account
 */
export function useDeleteUser() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { logout } = useAuth()

  return useMutation({
    mutationFn: () => AuthService.deleteUser(),
    onSuccess: async () => {
      // Clear all cached data
      queryClient.clear()

      // Sign out using Firebase auth
      await logout()
      router.push('/')
    },
    onError: (error) => {
      console.error('User deletion failed:', error)
    },
  })
}

/**
 * Hook to check email availability
 */
export function useCheckEmailAvailable() {
  return useMutation({
    mutationFn: (email: string) => AuthService.checkEmailAvailable(email),
  })
}

/**
 * Hook to send email verification
 */
export function useSendEmailVerification() {
  return useMutation({
    mutationFn: () => AuthService.sendEmailVerification(),
  })
}

/**
 * Hook to verify email
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (token: string) => AuthService.verifyEmail(token),
    onSuccess: () => {
      // Refresh user data to get updated email verification status
      queryClient.invalidateQueries({ queryKey: authKeys.user })
      
      // Session will be updated on next page load
    },
  })
}

/**
 * Hook to request password reset
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => AuthService.requestPasswordReset(email),
  })
}

/**
 * Hook to reset password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) => 
      AuthService.resetPassword(token, password),
  })
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      AuthService.changePassword(currentPassword, newPassword),
  })
}

/**
 * Hook to get user sessions
 */
export function useSessions() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: authKeys.sessions,
    queryFn: () => AuthService.getSessions(),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to revoke a session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (sessionId: string) => AuthService.revokeSession(sessionId),
    onSuccess: () => {
      // Refresh sessions list
      queryClient.invalidateQueries({ queryKey: authKeys.sessions })
    },
  })
}

/**
 * Hook to revoke all other sessions
 */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => AuthService.revokeAllOtherSessions(),
    onSuccess: () => {
      // Refresh sessions list
      queryClient.invalidateQueries({ queryKey: authKeys.sessions })
    },
  })
}

/**
 * Hook to handle complete logout (client + backend)
 */
export function useLogout() {
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  const router = useRouter()
  
  return useMutation({
    mutationFn: async () => {
      // Firebase handles token invalidation
      await logout()
      return Promise.resolve()
    },
    onSuccess: async () => {
      // Clear all React Query cache
      queryClient.clear()
      
      // Redirect to home
      router.push('/')
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Still redirect on error
      router.push('/')
    },
  })
}