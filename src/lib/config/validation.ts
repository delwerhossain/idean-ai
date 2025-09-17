// Configuration validation for production readiness
interface RequiredConfig {
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_FIREBASE_API_KEY: string
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string
  NEXT_PUBLIC_FIREBASE_APP_ID: string
}

interface OptionalConfig {
  NEXT_PUBLIC_API_TIMEOUT?: string
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigurationError'
  }
}

export const validateConfiguration = (): RequiredConfig & OptionalConfig => {
  const errors: string[] = []

  // Required environment variables
  const requiredVars: (keyof RequiredConfig)[] = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ]

  // Debug: Log environment variables in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Environment variables check:', {
      API_URL: !!process.env.NEXT_PUBLIC_API_URL,
      FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    })
  }

  const config: Partial<RequiredConfig & OptionalConfig> = {}

  // Check required variables
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`)
    } else {
      config[varName] = value
    }
  })

  // Validate API URL format
  if (config.NEXT_PUBLIC_API_URL) {
    try {
      new URL(config.NEXT_PUBLIC_API_URL)
    } catch {
      errors.push('NEXT_PUBLIC_API_URL must be a valid URL')
    }

    // Warn about insecure HTTP in production
    if (process.env.NODE_ENV === 'production' && config.NEXT_PUBLIC_API_URL.startsWith('http://')) {
      errors.push('API URL should use HTTPS in production')
    }
  }

  // Validate Firebase domain format
  if (config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && !config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.includes('.')) {
    errors.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN must be a valid domain')
  }

  // Optional variables with defaults
  config.NEXT_PUBLIC_API_TIMEOUT = process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'
  config.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

  // Firebase Measurement ID is optional (only for Google Analytics)
  if (!config.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && process.env.NODE_ENV === 'development') {
    console.log('ℹ️ Firebase Measurement ID not provided - Google Analytics will be disabled')
  }

  // Validate timeout value
  const timeout = parseInt(config.NEXT_PUBLIC_API_TIMEOUT)
  if (isNaN(timeout) || timeout <= 0) {
    errors.push('NEXT_PUBLIC_API_TIMEOUT must be a positive number')
  }

  if (errors.length > 0) {
    throw new ConfigurationError(
      `Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    )
  }

  return config as RequiredConfig & OptionalConfig
}

export const getValidatedConfig = (): RequiredConfig & OptionalConfig => {
  try {
    return validateConfiguration()
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Configuration Error:', error.message)
      console.log('Falling back to process.env directly for API client initialization')
    }

    // Fallback configuration when validation fails (usually during initial load)
    return {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ideanai.bismoservices.com',
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
      NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT || '30000',
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    }
  }
}

// Production readiness checks
export const checkProductionReadiness = (): { ready: boolean; issues: string[] } => {
  const issues: string[] = []

  try {
    const config = validateConfiguration()

    // Check for production-specific requirements
    if (process.env.NODE_ENV === 'production') {
      // API should use HTTPS
      if (!config.NEXT_PUBLIC_API_URL.startsWith('https://')) {
        issues.push('API URL should use HTTPS in production')
      }

      // Firebase domain should be production domain
      if (config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.includes('localhost')) {
        issues.push('Firebase auth domain should not use localhost in production')
      }

      // Timeout should be reasonable for production
      const timeout = parseInt(config.NEXT_PUBLIC_API_TIMEOUT || '30000')
      if (timeout > 60000) {
        issues.push('API timeout should be reasonable in production (recommended: 30s)')
      }
    }

    return {
      ready: issues.length === 0,
      issues
    }
  } catch (error) {
    return {
      ready: false,
      issues: [error.message]
    }
  }
}

// Log configuration status (only in development)
export const logConfigurationStatus = (): void => {
  if (process.env.NODE_ENV !== 'development') return

  try {
    const config = validateConfiguration()
    console.log('✅ Configuration validation passed')
    console.log('📊 Configuration status:', {
      apiUrl: config.NEXT_PUBLIC_API_URL,
      firebaseProject: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      timeout: `${config.NEXT_PUBLIC_API_TIMEOUT}ms`,
      hasAnalytics: !!config.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    })

    const { ready, issues } = checkProductionReadiness()
    if (!ready) {
      console.warn('⚠️ Production readiness issues:', issues)
    }
  } catch (error) {
    console.error('❌ Configuration validation failed:', error.message)
  }
}