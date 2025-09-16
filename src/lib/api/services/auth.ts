// Authentication service for backend integration
import { apiClient, APIError } from '@/lib/api/client'
import type { 
  User, 
  UserCreateRequest, 
  UserUpdateRequest,
  APIResponse 
} from '@/types/api'

export class AuthService {
  /**
   * Sync user data with backend after Firebase authentication
   * This is called after successful Firebase login/registration
   */
  static async syncUser(userData: UserCreateRequest): Promise<User> {
    try {
      const response = await apiClient.post<User>('/auth/sync-user', userData)
      return response
    } catch (error) {
      console.error('Failed to sync user with backend:', error)
      throw error
    }
  }

  /**
   * Get current user data from backend
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me')
      return response
    } catch (error) {
      console.error('Failed to get current user:', error)
      throw error
    }
  }

  /**
   * Update user data in backend
   */
  static async updateUser(updates: UserUpdateRequest): Promise<User> {
    try {
      const response = await apiClient.patch<User>('/auth/me', updates)
      return response
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(): Promise<void> {
    try {
      await apiClient.delete('/auth/me')
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  }

  /**
   * Check if email is available for registration
   */
  static async checkEmailAvailable(email: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ available: boolean }>('/auth/check-email', { email })
      return response.available || false
    } catch (error) {
      console.error('Failed to check email availability:', error)
      return false
    }
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(): Promise<void> {
    try {
      await apiClient.post('/auth/send-verification')
    } catch (error) {
      console.error('Failed to send email verification:', error)
      throw error
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', { token })
    } catch (error) {
      console.error('Failed to verify email:', error)
      throw error
    }
  }

  /**
   * Reset password request
   */
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/forgot-password', { email })
    } catch (error) {
      console.error('Failed to request password reset:', error)
      throw error
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { token, password: newPassword })
    } catch (error) {
      console.error('Failed to reset password:', error)
      throw error
    }
  }

  /**
   * Change password (for authenticated users)
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      })
    } catch (error) {
      console.error('Failed to change password:', error)
      throw error
    }
  }

  /**
   * Get user's authentication sessions
   */
  static async getSessions(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/auth/sessions')
      return response
    } catch (error) {
      console.error('Failed to get sessions:', error)
      throw error
    }
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`)
    } catch (error) {
      console.error('Failed to revoke session:', error)
      throw error
    }
  }

  /**
   * Revoke all sessions except current
   */
  static async revokeAllOtherSessions(): Promise<void> {
    try {
      await apiClient.post('/auth/revoke-all-sessions')
    } catch (error) {
      console.error('Failed to revoke all sessions:', error)
      throw error
    }
  }
}

export default AuthService
