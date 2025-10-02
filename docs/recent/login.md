# iDEAN AI Login System Implementation Guide

## Overview
This document outlines the implementation of a comprehensive authentication system for iDEAN AI using Next.js 15.5.2, NextAuth.js, and Firebase. The system supports multiple user roles, subscription tiers, and team collaboration features as specified in the project requirements.

## Architecture Stack
- **Framework**: Next.js 15.5.2 with App Router
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Backend**: Firebase Authentication + Firestore
- **Session Management**: NextAuth.js JWT + Database sessions
- **UI Components**: Radix UI primitives + Tailwind CSS v4

## User Roles & Permissions

### Role Hierarchy
Based on the project requirements, the system supports three main roles:

| Role | Scope | Permissions |
|------|-------|-------------|
| **Owner** | Global | Full access: billing, plan management, org settings, user management, export usage data |
| **Admin** | Team/Settings | Manage team members, settings, templates, integrations, data retention |
| **Member** | Content | Generate/manage own content, upload KB/ads CSV, view own analytics |

### Subscription Tiers
- **Free Trial**: 7 days or 500 tokens, single framework access
- **Standard Plan**: �2,000/month, full onboarding, 4 PDF uploads, 2,000 AI credits
- **Pro Plan**: �5,000/month, team workspace, advanced frameworks, 5,000 AI credits

## Implementation Steps

### Phase 1: Setup Authentication Infrastructure

#### 1.1 Install Dependencies
```bash
pnpm add next-auth@beta firebase firebase-admin
pnpm add @types/jsonwebtoken
```

#### 1.2 Firebase Configuration
Create Firebase project with:
- Authentication (Email/Password, Google, Facebook)
- Firestore database
- Storage (for PDF uploads)

#### 1.3 Environment Variables
```env
# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

### Phase 2: NextAuth Configuration

#### 2.1 Auth Configuration (`src/lib/auth/config.ts`)
```typescript
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { FirestoreAdapter } from '@auth/firestore-adapter'
import { cert } from 'firebase-admin/app'

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Firebase Auth integration
        return await authenticateWithFirebase(credentials)
      }
    })
  ],
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    })
  }),
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.organizationId = user.organizationId
        token.subscriptionTier = user.subscriptionTier
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.organizationId = token.organizationId
      session.user.subscriptionTier = token.subscriptionTier
      return session
    }
  }
}
```

#### 2.2 Auth Route Handler (`src/app/api/auth/[...nextauth]/route.ts`)
```typescript
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
```

### Phase 3: Database Schema Design

#### 3.1 Firestore Collections Structure
```typescript
// Collections Schema
interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'contributor' | 'viewer'
  organizationId: string
  subscriptionTier: 'free' | 'standard' | 'pro'
  aiCredits: number
  createdAt: Date
  lastLoginAt: Date
}

interface Organization {
  id: string
  name: string
  plan: 'free' | 'standard' | 'pro'
  locale: 'en' | 'bn'
  ownerId: string
  totalUsers: number
  monthlyUsage: number
  createdAt: Date
}

interface KnowledgeBase {
  id: string
  organizationId: string
  type: 'pdf' | 'text'
  fileName: string
  tokens: number
  sourceUrl?: string
  uploadedBy: string
  createdAt: Date
}
```

### Phase 4: Authentication UI Components

#### 4.1 Login Component (`src/components/auth/LoginForm.tsx`)
```typescript
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/dashboard'
    })
    
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>iDEAN AI Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn('google')}
          >
            Sign in with Google
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

#### 4.2 Registration Component (`src/components/auth/RegisterForm.tsx`)
```typescript
'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, firestore } from '@/lib/firebase/config'
import { doc, setDoc } from 'firebase/firestore'

export function RegisterForm() {
  // Implementation for user registration
  // Includes organization setup for owners
  // Invitation handling for team members
}
```

### Phase 5: Authentication Pages

#### 5.1 Login Page (`src/app/login/page.tsx`)
```typescript
import { LoginForm } from '@/components/auth/LoginForm'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authConfig } from '@/lib/auth/config'

export default async function LoginPage() {
  const session = await getServerSession(authConfig)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoginForm />
    </div>
  )
}
```

#### 5.2 Register Page (`src/app/register/page.tsx`)
```typescript
import { RegisterForm } from '@/components/auth/RegisterForm'
// Similar structure to login page
```

### Phase 6: Role-Based Access Control

#### 6.1 Authentication Middleware (`src/middleware.ts`)
```typescript
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard') && !token) {
      return Response.redirect(new URL('/login', req.url))
    }

    // Role-based route protection
    if (pathname.startsWith('/admin') && token?.role !== 'owner' && token?.role !== 'admin') {
      return Response.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/protected/:path*']
}
```

#### 6.2 Role Check Hook (`src/lib/hooks/useRole.ts`)
```typescript
import { useSession } from 'next-auth/react'

export function useRole() {
  const { data: session } = useSession()
  
  const hasRole = (requiredRole: string[]) => {
    return requiredRole.includes(session?.user?.role || '')
  }
  
  const canAccess = (feature: string) => {
    const permissions = {
      billing: ['owner'],
      userManagement: ['owner', 'admin'],
      contentGeneration: ['owner', 'admin', 'contributor'],
      viewReports: ['owner', 'admin', 'contributor', 'viewer']
    }
    
    return hasRole(permissions[feature] || [])
  }
  
  return { hasRole, canAccess, role: session?.user?.role }
}
```

### Phase 7: Team Management Features

#### 7.1 User Invitation System
```typescript
// API route for sending invitations
// Email templates for invites
// Invitation acceptance flow
```

#### 7.2 Organization Management
```typescript
// Organization settings
// User role assignment
// Subscription management
```

### Phase 8: Subscription Integration

#### 8.1 Credit System
```typescript
interface CreditUsage {
  userId: string
  action: 'content_generation' | 'pdf_upload' | 'ai_query'
  credits: number
  timestamp: Date
  metadata?: any
}
```

#### 8.2 Usage Tracking
- AI credit consumption tracking
- Feature access based on subscription tier
- Usage analytics for billing

### Phase 9: Security Implementation

#### 9.1 Input Validation
```typescript
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})
```

#### 9.2 CSRF Protection
- Built-in NextAuth CSRF protection
- Secure cookie settings
- Rate limiting for auth endpoints

#### 9.3 Data Encryption
- Firestore encryption at rest
- Secure JWT signing
- Password hashing with bcrypt

### Phase 10: Onboarding Integration

#### 10.1 Post-Login Flow
```typescript
// Redirect new users to onboarding
// Skip onboarding for returning users
// Role-based dashboard initialization
```

## Testing Strategy

### Authentication Tests
- Unit tests for auth utilities
- Integration tests for login/logout flow
- E2E tests for complete user journeys
- Role-based access testing

## Deployment Considerations

### Firebase Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /organizations/{orgId} {
      allow read, write: if request.auth != null && 
        resource.data.members[request.auth.uid] != null;
    }
  }
}
```

### Performance Optimization
- Session caching strategies
- Database query optimization
- CDN configuration for auth assets

## Monitoring & Analytics
- Authentication success/failure rates
- User session analytics
- Role distribution metrics
- Feature usage by subscription tier

## Migration Plan
1. Set up Firebase project and authentication
2. Install and configure NextAuth.js
3. Create authentication UI components
4. Implement role-based access control
5. Add team management features
6. Integrate with existing onboarding system
7. Test thoroughly across all user roles
8. Deploy with proper security configurations

## Maintenance
- Regular security updates
- User feedback integration
- Performance monitoring
- Feature usage analytics

This implementation provides a complete, scalable authentication system that supports the complex role hierarchy and subscription model required by iDEAN AI while maintaining security best practices and optimal user experience.