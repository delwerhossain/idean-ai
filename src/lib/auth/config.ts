import NextAuth, { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth as firebaseAuth } from '@/lib/firebase/client'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '@/lib/firebase/client'
import { BackendAPI, initializeTestUsers } from '@/lib/test-users'

// Helper function to get user data from backend API
async function getUserDataFromBackend(firebaseUid: string, firebaseToken: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${firebaseToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Error fetching user data from backend:', error)
    return null
  }
}

// Helper function to sync user with backend after Firebase auth
async function syncUserWithBackend(firebaseUser: any, firebaseToken: string) {
  try {
    // Initialize test users on first run
    initializeTestUsers();
    
    // Use BackendAPI for user sync (will be FastAPI tomorrow)
    const backendResponse = await BackendAPI.syncUser(firebaseUser, firebaseToken);
    
    const response = { 
      ok: true, 
      json: async () => backendResponse
    }
    
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Error syncing user with backend:', error)
    return null
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      // Handle Google OAuth callback
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'user',
          provider: 'google',
          firebaseUid: '', // Will be set after Firebase auth
          emailVerified: profile.email_verified,
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Initialize test users
        initializeTestUsers();
        
        console.log('🔍 Auth attempt:', { email: credentials.email, password: credentials.password?.substring(0, 3) + '***' });
        
        // First, try to authenticate with test users (for development)
        const testUser = await BackendAPI.login(credentials.email, credentials.password);
        
        console.log('🧪 Test user result:', testUser ? 'Found' : 'Not found');
        
        if (testUser) {
          console.log('✅ Test user authentication successful:', testUser.email);
          // Test user authentication successful
          return {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
            role: testUser.role,
            businessId: testUser.businessId,
            firebaseUid: testUser.id, // Use test user ID as firebase UID
            firebaseToken: `test_token_${testUser.id}`,
            emailVerified: true,
            provider: 'email',
            photoURL: testUser.photoURL || undefined
          }
        }
        
        console.log('🔥 Falling back to Firebase authentication');

        // If not a test user, try Firebase authentication
        try {
          const userCredential = await signInWithEmailAndPassword(
            firebaseAuth, 
            credentials.email as string, 
            credentials.password as string
          )
          
          const firebaseUser = userCredential.user
          
          // Get Firebase ID token for backend communication
          const idToken = await firebaseUser.getIdToken()
          
          // Sync user with backend and get user data
          const backendUserData = await syncUserWithBackend(firebaseUser, idToken)
          
          return {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: backendUserData?.name || firebaseUser.displayName || firebaseUser.email,
            role: backendUserData?.role || 'user',
            businessId: backendUserData?.businessId || undefined,
            firebaseUid: firebaseUser.uid,
            firebaseToken: idToken,
            emailVerified: firebaseUser.emailVerified,
            provider: 'email',
            photoURL: firebaseUser.photoURL || undefined
          }
        } catch (error) {
          console.error('Firebase authentication failed:', error)
          return null
        }
      }
    })
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in - store user data in token
      if (user) {
        token.uid = user.id
        token.role = user.role
        token.businessId = user.businessId
        token.firebaseUid = user.firebaseUid || user.id
        token.firebaseToken = user.firebaseToken
        token.emailVerified = user.emailVerified
        token.provider = user.provider || account?.provider
        token.photoURL = user.photoURL || user.image
        token.tokenExpiry = Date.now() + (55 * 60 * 1000) // Firebase tokens expire in 1 hour, refresh at 55min
      }

      // Google OAuth - handle Firebase authentication
      if (account?.provider === 'google' && user) {
        try {
          // Here you would typically authenticate with Firebase using the Google token
          // and then sync with your backend
          // For now, we'll set basic data
          token.provider = 'google'
          token.firebaseUid = user.id // This would be set after Firebase auth
        } catch (error) {
          console.error('Error handling Google OAuth:', error)
        }
      }

      // Token refresh - check if Firebase token needs refreshing
      if (token.tokenExpiry && typeof token.tokenExpiry === 'number' && Date.now() > token.tokenExpiry) {
        try {
          // Refresh user data from backend
          if (token.firebaseToken) {
            const userData = await getUserDataFromBackend(token.firebaseUid as string, token.firebaseToken as string)
            if (userData) {
              token.role = userData.role
              token.businessId = userData.businessId
              token.tokenExpiry = Date.now() + (55 * 60 * 1000)
            }
          }
        } catch (error) {
          console.error('Error refreshing token:', error)
          // Could return null to force re-authentication if needed
        }
      }

      // Manual session update (when user data changes)
      if (trigger === 'update' && token.firebaseUid && token.firebaseToken) {
        try {
          const userData = await getUserDataFromBackend(token.firebaseUid as string, token.firebaseToken as string)
          if (userData) {
            token.role = userData.role
            token.businessId = userData.businessId
          }
        } catch (error) {
          console.error('Error updating session:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.uid as string
        session.user.role = token.role as string
        session.user.businessId = token.businessId as string
        session.user.firebaseUid = token.firebaseUid as string
        session.user.provider = token.provider as string
        session.user.photoURL = token.photoURL as string
        // @ts-ignore - NextAuth v5 type issue with boolean
        session.user.emailVerified = token.emailVerified ? true : false
        
        // Add Firebase token to session for API calls
        session.firebaseToken = token.firebaseToken as string
        session.accessToken = token.firebaseToken as string // Backward compatibility
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/dashboard'
    },
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
    verifyRequest: '/verify-email',
  },
  debug: process.env.NODE_ENV === 'development',
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)