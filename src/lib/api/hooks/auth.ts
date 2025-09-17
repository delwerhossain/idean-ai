// React hooks for authentication API calls
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthService, { AuthResponse } from '@/lib/api/services/auth'
import type { User, UserUpdateRequest } from '@/types/api'

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
 * Hook to login with backend using Firebase token
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, firebaseToken }: { email: string; firebaseToken: string }) =>
      AuthService.login(email, firebaseToken),
    onSuccess: (data: AuthResponse) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.user, data.user)
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login failed:', error)
      }
    },
  })
}

/**
 * Hook to register new user
 */
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: { email: string; name: string; password?: string; provider?: string }) =>
      AuthService.register(userData),
    onSuccess: (data: AuthResponse) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.user, data.user)
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration failed:', error)
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('User update failed:', error)
      }
    },
  })
}

/**
 * Hook to refresh JWT token
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: () => AuthService.refreshToken(),
    onError: (error) => {
      console.error('Token refresh failed:', error)
    },
  })
}

/**
 * Hook to verify JWT token
 */
export function useVerifyToken() {
  return useMutation({
    mutationFn: () => AuthService.verifyToken(),
    onError: (error) => {
      console.error('Token verification failed:', error)
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
      // This will call AuthService.logout() and Firebase signOut
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout failed:', error)
      }
      // Still redirect on error
      router.push('/')
    },
  })
}