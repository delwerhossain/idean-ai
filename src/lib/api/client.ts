import { getStoredBackendToken, getCurrentFirebaseUser, getStoredUser } from '@/lib/firebase'
import {
  APIResponse,
  APIError as APIErrorType,
  ErrorCode,
  ERROR_CODES,
  PaginatedResponse,
  PaginationParams
} from '@/types/api'

// Custom API Error class
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: ErrorCode,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// API Client Configuration
interface APIClientConfig {
  baseUrl: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

class APIClient {
  private config: APIClientConfig

  constructor(config: Partial<APIClientConfig> = {}) {
    // Use environment variables directly to avoid import-time validation race condition
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ideanai.bismoservices.com',
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    }
  }

  // Get authentication headers with JWT token from Firebase Auth
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      // Use only backend JWT in Authorization header as per Swagger
      const backendToken = getStoredBackendToken()

      if (!backendToken) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Backend token not found in storage, user may need to re-authenticate')
        }
        throw new APIError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED)
      }

      return {
        Authorization: `Bearer ${backendToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting authentication headers:', error)
      }
      throw new APIError('Authentication failed', 401, ERROR_CODES.UNAUTHORIZED)
    }
  }

  // Get basic headers without authentication (for public endpoints)
  private getBasicHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
    }
  }

  // Handle API responses and errors
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: APIErrorType
      
      try {
        errorData = await response.json()
      } catch {
        // If response is not JSON, create generic error
        errorData = {
          error_code: 'UNKNOWN_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        }
      }

      throw new APIError(
        errorData.message || 'API request failed',
        response.status,
        errorData.error_code as ErrorCode,
        errorData.details
      )
    }

    const data = await response.json()
    
    // Handle wrapped responses
    if (data.status === 'error') {
      throw new APIError(
        data.message || 'Request failed',
        response.status,
        data.error_code,
        data.details
      )
    }

    // Backend returns data directly without wrapping, so just return data
    return data
  }

  // Retry mechanism for failed requests
  private async retryRequest<T>(
    requestFn: () => Promise<Response>,
    attempt: number = 1
  ): Promise<T> {
    try {
      const response = await requestFn()
      return await this.handleResponse<T>(response)
    } catch (error) {
      // Retry on network errors or 5xx status codes
      if (
        attempt < this.config.retryAttempts &&
        (error instanceof TypeError || 
         (error instanceof APIError && error.status >= 500))
      ) {
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay * attempt)
        )
        return this.retryRequest<T>(requestFn, attempt + 1)
      }
      
      throw error
    }
  }

  // Base request method (requires authentication)
  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders()
    const url = `${this.config.baseUrl}${endpoint}`

    // For multipart form data, don't set content-type (let browser handle it)
    if (options.body instanceof FormData) {
      delete headers['Content-Type']
    }

    const requestFn = () => fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.config.timeout),
    })

    return this.retryRequest<T>(requestFn)
  }

  // Public request method (no authentication required)
  async publicRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const headers = this.getBasicHeaders()
    const url = `${this.config.baseUrl}${endpoint}`

    const requestFn = () => fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.config.timeout),
    })

    return this.retryRequest<T>(requestFn)
  }

  // Safe request method (tries authenticated, falls back to public)
  async safeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    fallbackToPublic: boolean = false
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, options)
    } catch (error) {
      if (fallbackToPublic && error instanceof APIError && error.status === 401) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Authentication failed, trying public access')
        }
        return this.publicRequest<T>(endpoint, options)
      }
      throw error
    }
  }

  // HTTP method shortcuts (require authentication)
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const urlParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<T>(`${endpoint}${urlParams}`, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Safe HTTP method shortcuts (with fallback to public access)
  async safeGet<T>(endpoint: string, params?: Record<string, any>, fallbackToPublic: boolean = false): Promise<T> {
    const urlParams = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.safeRequest<T>(`${endpoint}${urlParams}`, { method: 'GET' }, fallbackToPublic)
  }

  async safePost<T>(endpoint: string, data?: any, fallbackToPublic: boolean = false): Promise<T> {
    return this.safeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, fallbackToPublic)
  }

  // File upload method with JWT token management
  async uploadFile<T>(
    endpoint: string, 
    file: File, 
    additionalData?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const firebaseUser = getCurrentFirebaseUser()
    const storedUser = getStoredUser()
    
    if (!firebaseUser || !storedUser) {
      throw new APIError('Not authenticated', 401, ERROR_CODES.UNAUTHORIZED)
    }

    const formData = new FormData()
    // Backend expects 'documents' field name for business document uploads
    if (endpoint.includes('/businesses/') && endpoint.includes('/documents')) {
      formData.append('documents', file)
    } else {
      formData.append('file', file)
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    // Get backend JWT token from localStorage
    const backendToken = getStoredBackendToken()
    if (!backendToken) {
      throw new APIError('Backend token not found', 401, ERROR_CODES.UNAUTHORIZED)
    }
    const token = backendToken
    const url = `${this.config.baseUrl}${endpoint}`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Track upload progress
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            onProgress(progress)
          }
        }
      }

      xhr.onload = async () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } else {
            const errorData = JSON.parse(xhr.responseText)
            reject(new APIError(
              errorData.message || 'Upload failed',
              xhr.status,
              errorData.error_code,
              errorData.details
            ))
          }
        } catch (error) {
          reject(new APIError(
            `Upload failed: ${xhr.statusText}`,
            xhr.status
          ))
        }
      }

      xhr.onerror = () => {
        reject(new APIError('Upload failed: Network error', 0))
      }

      xhr.timeout = this.config.timeout
      xhr.ontimeout = () => {
        reject(new APIError('Upload failed: Timeout', 0))
      }

      xhr.open('POST', url)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(formData)
    })
  }

  // Paginated requests
  async getPaginated<T>(
    endpoint: string, 
    params?: PaginationParams & Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(endpoint, params)
  }

  // Safe paginated requests (with fallback to public access)
  async safePaginated<T>(
    endpoint: string, 
    params?: PaginationParams & Record<string, any>,
    fallbackToPublic: boolean = false
  ): Promise<PaginatedResponse<T>> {
    return this.safeGet<PaginatedResponse<T>>(endpoint, params, fallbackToPublic)
  }

  // WebSocket connection for real-time updates
  connectWebSocket(
    endpoint: string,
    onMessage: (data: any) => void,
    onError?: (error: Error) => void,
    onClose?: () => void
  ): WebSocket {
    const wsUrl = this.config.baseUrl.replace('http', 'ws') + endpoint
    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('WebSocket message parsing error:', error)
        }
      }
    }

    ws.onerror = (event) => {
      const error = new Error('WebSocket connection error')
      onError?.(error)
    }

    ws.onclose = () => {
      onClose?.()
    }

    return ws
  }


  // Set configuration
  updateConfig(config: Partial<APIClientConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Create singleton instance
export const apiClient = new APIClient()

// Utility functions for common API patterns
export const apiUtils = {
  // Build query string from object
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })
    return searchParams.toString()
  },

  // Handle file size formatting
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Validate file before upload
  validateFile: (file: File, maxSize: number = 30 * 1024 * 1024, allowedTypes: string[] = []) => {
    const errors: string[] = []

    if (file.size > maxSize) {
      errors.push(`File size exceeds ${apiUtils.formatFileSize(maxSize)}`)
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Debounce function for search inputs
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  // Error message formatting
  formatErrorMessage: (error: APIError): string => {
    switch (error.errorCode) {
      case ERROR_CODES.INSUFFICIENT_CREDITS:
        return 'You don\'t have enough AI credits. Please upgrade your plan or wait for monthly renewal.'
      case ERROR_CODES.RATE_LIMIT_EXCEEDED:
        return 'Too many requests. Please wait a moment before trying again.'
      case ERROR_CODES.FILE_TOO_LARGE:
        return 'File is too large. Please choose a smaller file (max 30MB).'
      case ERROR_CODES.UNAUTHORIZED:
        return 'Please sign in to continue.'
      case ERROR_CODES.FORBIDDEN:
        return 'You don\'t have permission to perform this action.'
      case ERROR_CODES.NOT_FOUND:
        return 'The requested resource was not found.'
      case ERROR_CODES.QUOTA_EXCEEDED:
        return 'Monthly quota exceeded. Please upgrade your plan for more usage.'
      case ERROR_CODES.FEATURE_NOT_AVAILABLE:
        return 'This feature is not available in your current plan. Please upgrade to access it.'
      default:
        return error.message || 'An unexpected error occurred. Please try again.'
    }
  },

  // Retry with exponential backoff
  retryWithBackoff: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries - 1) break
        
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }
}

export default apiClient
