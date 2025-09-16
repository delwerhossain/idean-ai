// Updated to match backend Prisma schema
export interface User {
  id: string                  // Firebase UID
  email: string
  name: string
  role: 'user' | 'admin' | 'owner'  // Default role is 'user'
  firebaseUid: string         // Firebase UID for backend reference
  photoURL?: string
  provider: 'google' | 'email' | 'facebook'  // OAuth provider
  businessId?: string         // Reference to business
  createdAt: Date
  updatedAt: Date
}

export interface Business {
  id: string
  business_name: string
  website_url: string
  industry_tag: string
  business_documents: string[]        // Array of document URLs/paths
  business_context?: string           // Optional business context
  language: string                    // Primary language
  mentor_approval: string             // Approval status
  adds_history: string[]              // Ad campaign history
  module_select: 'standard' | 'pro'  // Subscription module
  readiness_checklist: string        // Onboarding checklist status
  createdAt: Date
  updatedAt: Date
  users: User[]                       // Users in this business
}

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string
    role: 'user' | 'admin' | 'owner'
    businessId?: string
    firebaseUid: string
    provider: string
    photoURL?: string
  }
}

// NextAuth v5 type declarations aligned with backend schema
// declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      businessId: string
      firebaseUid: string
      provider: string
      photoURL?: string
      emailVerified: boolean
    }
    firebaseToken: string
    accessToken: string
  }

  interface User {
    role?: string
    businessId?: string
    firebaseUid?: string
    firebaseToken?: string
    provider?: string
    photoURL?: string
    emailVerified?: boolean
  }

  interface JWT {
    uid?: string
    role?: string
    businessId?: string
    firebaseUid?: string
    firebaseToken?: string
    provider?: string
    photoURL?: string
    emailVerified?: boolean
    tokenExpiry?: number
  }
}

// Additional auth-related types
export interface UserRegistration {
  email: string
  name: string
  password?: string
  role: 'user' | 'admin' | 'owner'
  businessName?: string          // For creating new business
  businessId?: string            // For joining existing business
  provider: 'google' | 'email' | 'facebook'
}

export interface BusinessSetup {
  business_name: string
  website_url: string
  industry_tag: string
  business_context?: string
  language: string
  module_select: 'standard' | 'pro'
}