import { auth as firebaseAuth } from '@/lib/firebase/client'
import { getStoredBackendToken } from '@/lib/firebase'

/**
 * JWT Token utilities for authentication with backend
 */

export class JWTTokenManager {
  private static instance: JWTTokenManager
  private refreshPromise: Promise<string> | null = null

  private constructor() {}

  static getInstance(): JWTTokenManager {
    if (!JWTTokenManager.instance) {
      JWTTokenManager.instance = new JWTTokenManager()
    }
    return JWTTokenManager.instance
  }

  /**
   * Get a valid Firebase JWT token for API calls
   * Automatically handles token refresh if needed
   */
  async getValidToken(): Promise<string> {
    try {
      // First try to get backend token from localStorage
      const backendToken = getStoredBackendToken()
      if (backendToken) {
        // Check if token is close to expiring (Firebase tokens are valid for 1 hour)
        const tokenPayload = this.parseJWT(backendToken)
        const now = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = tokenPayload.exp - now

        // If token expires in less than 5 minutes, refresh it
        if (timeUntilExpiry < 300) {
          return await this.refreshToken()
        }

        return backendToken
      }
      
      // If no stored token, get fresh token from Firebase
      if (!firebaseAuth.currentUser) {
        throw new Error('No authenticated user')
      }
      
      return await firebaseAuth.currentUser.getIdToken()
    } catch (error) {
      console.error('Error getting valid token:', error)
      throw error
    }
  }

  /**
   * Force refresh the Firebase token
   */
  async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performTokenRefresh()
    
    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      if (!firebaseAuth.currentUser) {
        throw new Error('No authenticated user')
      }

      // Force refresh Firebase token
      const newToken = await firebaseAuth.currentUser.getIdToken(true)
      
      // Update NextAuth session with new token
      // Note: This requires a session update mechanism
      // You might need to implement a custom session update
      
      return newToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      
      // If token refresh fails, user may need to re-authenticate
      await signOut({ redirect: true, callbackUrl: '/login' })
      throw new Error('Authentication session expired. Please sign in again.')
    }
  }

  /**
   * Parse JWT payload without verification (for expiry checking)
   */
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error parsing JWT:', error)
      throw new Error('Invalid token format')
    }
  }

  /**
   * Check if current token is valid
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const session = await getSession()
      if (!session?.firebaseToken) return false

      const tokenPayload = this.parseJWT(session.firebaseToken)
      const now = Math.floor(Date.now() / 1000)
      
      return tokenPayload.exp > now
    } catch (error) {
      return false
    }
  }

  /**
   * Get token expiry time
   */
  async getTokenExpiry(): Promise<Date | null> {
    try {
      const session = await getSession()
      if (!session?.firebaseToken) return null

      const tokenPayload = this.parseJWT(session.firebaseToken)
      return new Date(tokenPayload.exp * 1000)
    } catch (error) {
      return null
    }
  }

  /**
   * Get user claims from JWT token
   */
  async getUserClaims(): Promise<any> {
    try {
      const session = await getSession()
      if (!session?.firebaseToken) return null

      return this.parseJWT(session.firebaseToken)
    } catch (error) {
      console.error('Error getting user claims:', error)
      return null
    }
  }
}

// Export singleton instance
export const jwtTokenManager = JWTTokenManager.getInstance()

/**
 * Hook for components to get JWT token
 */
export async function useJWTToken() {
  try {
    return await jwtTokenManager.getValidToken()
  } catch (error) {
    console.error('Error in useJWTToken:', error)
    throw error
  }
}

/**
 * Utility function to check if user has specific role
 */
export async function hasRole(requiredRole: string | string[]): Promise<boolean> {
  try {
    const claims = await jwtTokenManager.getUserClaims()
    if (!claims?.role) return false

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(claims.role)
    }
    
    return claims.role === requiredRole
  } catch (error) {
    return false
  }
}

/**
 * Get Firebase JWT token with error handling
 */
export async function getFirebaseToken(): Promise<string | null> {
  try {
    if (!firebaseAuth.currentUser) {
      return null
    }
    
    return await firebaseAuth.currentUser.getIdToken()
  } catch (error) {
    console.error('Error getting Firebase token:', error)
    return null
  }
}

/**
 * Verify token on client side (basic check)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const tokenManager = JWTTokenManager.getInstance()
    const payload = tokenManager['parseJWT'](token) // Access private method
    const now = Math.floor(Date.now() / 1000)
    return payload.exp <= now
  } catch (error) {
    return true // Treat invalid tokens as expired
  }
}