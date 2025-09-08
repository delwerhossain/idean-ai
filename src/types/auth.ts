export interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
  organizationId?: string
  subscriptionTier: 'free' | 'standard' | 'pro'
  aiCredits: number
  createdAt: Date
  lastLoginAt: Date
}

export interface Organization {
  id: string
  name: string
  plan: 'free' | 'standard' | 'pro'
  locale: 'en' | 'bn'
  ownerId: string
  totalUsers: number
  monthlyUsage: number
  createdAt: Date
}

export interface AuthSession {
  user: {
    id: string
    email: string
    name: string
    role: 'owner' | 'admin' | 'member'
    organizationId?: string
    subscriptionTier: 'free' | 'standard' | 'pro'
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      organizationId: string
      subscriptionTier: string
      emailVerified: boolean
    }
    firebaseToken: string
    accessToken: string
  }

  interface User {
    role?: string
    organizationId?: string
    subscriptionTier?: string
    firebaseToken?: string
    emailVerified?: boolean
  }
}

// JWT types are now included in NextAuth v5 automatically