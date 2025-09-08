import NextAuth, { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth as firebaseAuth } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { firestore } from '@/lib/firebase/config'

// Helper function to get user data from Firestore
async function getUserDataFromFirestore(uid: string) {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', uid))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

export const authConfig: NextAuthConfig = {
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const userCredential = await signInWithEmailAndPassword(
            firebaseAuth, 
            credentials.email as string, 
            credentials.password as string
          )
          
          const firebaseUser = userCredential.user
          
          // Get additional user data from Firestore
          const userData = await getUserDataFromFirestore(firebaseUser.uid)
          
          // Get Firebase ID token for backend communication
          const idToken = await firebaseUser.getIdToken()
          
          return {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData?.name || firebaseUser.displayName || firebaseUser.email,
            role: userData?.role || 'member',
            organizationId: userData?.organization_id || null,
            subscriptionTier: userData?.subscription_tier || 'free',
            firebaseToken: idToken, // JWT token for backend
            emailVerified: firebaseUser.emailVerified
          }
        } catch (error) {
          console.error('Authentication error:', error)
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
      // Initial sign in
      if (user) {
        token.uid = user.id
        token.role = user.role
        token.organizationId = user.organizationId
        token.subscriptionTier = user.subscriptionTier
        token.firebaseToken = user.firebaseToken
        token.emailVerified = user.emailVerified
        token.tokenExpiry = Date.now() + (55 * 60 * 1000) // Firebase tokens expire in 1 hour, refresh at 55min
      }

      // Token refresh - check if Firebase token needs refreshing
      if (token.tokenExpiry && typeof token.tokenExpiry === 'number' && Date.now() > token.tokenExpiry) {
        try {
          // Get current Firebase user and refresh token
          if (firebaseAuth.currentUser) {
            const freshToken = await firebaseAuth.currentUser.getIdToken(true) // Force refresh
            token.firebaseToken = freshToken
            token.tokenExpiry = Date.now() + (55 * 60 * 1000)
            
            // Also refresh user data from Firestore
            const userData = await getUserDataFromFirestore(token.uid as string)
            if (userData) {
              token.role = userData.role
              token.organizationId = userData.organization_id
              token.subscriptionTier = userData.subscription_tier
            }
          }
        } catch (error) {
          console.error('Error refreshing Firebase token:', error)
          // Token refresh failed, user may need to re-authenticate
          return null
        }
      }

      // Manual session update (when user data changes)
      if (trigger === 'update' && token.uid) {
        try {
          const userData = await getUserDataFromFirestore(token.uid as string)
          if (userData) {
            token.role = userData.role
            token.organizationId = userData.organization_id
            token.subscriptionTier = userData.subscription_tier
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
        session.user.organizationId = token.organizationId as string
        session.user.subscriptionTier = token.subscriptionTier as string
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
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)