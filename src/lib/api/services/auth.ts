// Authentication service for backend integration
import { apiClient, APIError } from '@/lib/api/client'
import type {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  APIResponse
} from '@/types/api'
import { ERROR_CODES } from '@/types/api'

// Authentication response from backend
export interface AuthResponse {
  message: string
  user: User
  token: string
}

export class AuthService {
  /**
   * Login user with Firebase token
   * This is called after successful Firebase authentication
   */
  static async login(email: string, firebaseToken: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.publicRequest<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          firebaseToken
        })
      })

      // Store backend JWT token
      localStorage.setItem('authToken', response.token)

      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to login with backend:', error)
      }
      // Sanitize error message for production
      const sanitizedError = error instanceof APIError
        ? error
        : new APIError('Login failed', 500, ERROR_CODES.INTERNAL_SERVER_ERROR)
      throw sanitizedError
    }
  }

  /**
   * Register new user
   */
  static async register(userData: { email: string; name: string; password?: string; provider?: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.publicRequest<AuthResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      })

      // Store backend JWT token
      if (response.token) {
        localStorage.setItem('authToken', response.token)
      }

      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to register with backend:', error)
      }
      // Sanitize error message for production
      const sanitizedError = error instanceof APIError
        ? error
        : new APIError('Registration failed', 500, ERROR_CODES.INTERNAL_SERVER_ERROR)
      throw sanitizedError
    }
  }

  /**
   * Get current user data from backend
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/api/v1/users/me')
      return response
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to get current user:', error)
      }
      throw error instanceof APIError
        ? error
        : new APIError('Unable to fetch user data', 500, ERROR_CODES.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Update user data in backend
   */
  static async updateUser(updates: UserUpdateRequest): Promise<User> {
    try {
      const response = await apiClient.put<User>('/api/v1/users/me', updates)
      return response
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(): Promise<{ token: string }> {
    try {
      const currentToken = localStorage.getItem('authToken')
      const response = await apiClient.post<{ token: string }>('/api/v1/auth/refresh', {
        token: currentToken
      })

      // Store new token
      localStorage.setItem('authToken', response.token)

      return response
    } catch (error) {
      console.error('Failed to refresh token:', error)
      throw error
    }
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get('/api/v1/auth/verify')
      return true
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Backend logout failed:', error)
      }
      // Don't throw - we still want to clear local storage
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  /**
   * Clear all authentication data from local storage
   */
  static clearAuthData(): void {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken')
    return !!token
  }

  /**
   * Get stored auth token
   */
  static getAuthToken(): string | null {
    return localStorage.getItem('authToken')
  }
}

export default AuthService
