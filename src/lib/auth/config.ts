import NextAuth, { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

// Helper function to authenticate user with backend API
async function authenticateWithBackend(email: string, password?: string, firebaseToken?: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
    
    // For credentials login (email + password), try backend login directly
    if (email && password) {
      try {
        // First try login (for existing users)
        const loginResponse = await fetch(`${backendUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email })
        });
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          return {
            success: true,
            user: loginData.user,
            token: loginData.token,
            message: loginData.message
          };
        }
        
        // If user not found (400), try registration
        if (loginResponse.status === 400) {
          const registerResponse = await fetch(`${backendUrl}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              name: email.split('@')[0], // Default name from email
              password, // Include password for Firebase user creation
              provider: 'email'
            })
          });
          
          if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            return {
              success: true,
              user: registerData.user,
              token: registerData.token,
              message: registerData.message,
              isNewUser: true
            };
          }
        }
        
        return { success: false, error: 'Invalid credentials' };
      } catch (error) {
        console.error('Backend credentials authentication error:', error);
        return { success: false, error: 'Authentication service unavailable' };
      }
    }
    
    // For OAuth users (Google, etc.) - use Firebase token
    if (firebaseToken) {
      try {
        const loginResponse = await fetch(`${backendUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            firebaseToken
          })
        });
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          return {
            success: true,
            user: loginData.user,
            token: loginData.token,
            message: loginData.message
          };
        }
        
        return { success: false, error: 'OAuth authentication failed' };
      } catch (error) {
        console.error('OAuth backend authentication error:', error);
        return { success: false, error: 'OAuth service unavailable' };
      }
    }
    
    return { success: false, error: 'No authentication method provided' };
  } catch (error) {
    console.error('Backend authentication error:', error);
    return { success: false, error: 'Authentication failed' };
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
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'user',
          provider: 'google',
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

        try {
          const result = await authenticateWithBackend(
            credentials.email as string,
            credentials.password as string
          );

          if (result.success && result.user && result.token) {
            return {
              id: result.user.id.toString(),
              email: result.user.email,
              name: result.user.name,
              role: result.user.role || 'user',
              businessId: result.user.business?.id,
              provider: result.user.provider || 'email',
              photoURL: result.user.photoURL,
              emailVerified: true,
              backendToken: result.token, // Store backend JWT directly
              isNewUser: result.isNewUser || false
            }
          }

          return null;
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      }
    })
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days to match backend JWT expiry
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in - store user data and backend token
      if (user && account) {
        try {
          if (user.provider === 'google' && account.id_token) {
            // Handle Google OAuth - authenticate with backend using Firebase token
            const result = await authenticateWithBackend(
              user.email!,
              undefined,
              account.id_token
            );

            if (result.success && result.user && result.token) {
              token.uid = result.user.id.toString()
              token.role = result.user.role || 'user'
              token.businessId = result.user.business?.id
              token.provider = result.user.provider
              token.photoURL = result.user.photoURL || user.image
              token.backendToken = result.token
              token.emailVerified = true
            } else {
              // Fallback for Google OAuth
              token.uid = user.id
              token.role = user.role || 'user'
              token.businessId = user.businessId
              token.provider = user.provider
              token.photoURL = user.image
              token.emailVerified = user.emailVerified || true
            }
          } else {
            // Handle credentials login - token already from backend
            token.uid = user.id
            token.role = user.role || 'user'
            token.businessId = user.businessId
            token.provider = user.provider || 'email'
            token.photoURL = user.photoURL
            token.backendToken = user.backendToken
            token.emailVerified = user.emailVerified || true
            token.isNewUser = user.isNewUser || false
          }
        } catch (error) {
          console.error('JWT callback error:', error);
          // Set basic user data as fallback
          token.uid = user.id
          token.role = user.role || 'user'
          token.businessId = user.businessId
          token.provider = user.provider || 'email'
          token.photoURL = user.image
          token.emailVerified = user.emailVerified || true
        }
      }

      // Token refresh - check if backend token needs refreshing
      const now = Date.now();
      if (token.backendToken && trigger !== 'update') {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
          const response = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token.backendToken })
          });
          
          if (response.ok) {
            const refreshData = await response.json();
            if (refreshData.token) {
              token.backendToken = refreshData.token;
              token.role = refreshData.user?.role || token.role;
              token.businessId = refreshData.user?.businessId || token.businessId;
            }
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          // Keep existing token on refresh failure
        }
      }

      return token
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          session.user.id = token.uid as string || token.sub as string
          session.user.role = token.role as string || 'user'
          session.user.businessId = token.businessId as string
          session.user.provider = token.provider as string || 'email'
          session.user.photoURL = token.photoURL as string
          // @ts-ignore - NextAuth v5 type issue with boolean
          session.user.emailVerified = token.emailVerified ? true : false
          session.user.isNewUser = token.isNewUser as boolean || false
          
          // Add backend JWT token to session for API calls
          session.backendToken = token.backendToken as string
          session.accessToken = token.backendToken as string // Backward compatibility
        }
        return session
      } catch (error) {
        console.error('Session callback error:', error);
        // Return session with minimal data if anything fails
        return {
          ...session,
          user: {
            ...session.user,
            id: session.user?.id || 'unknown',
            role: 'user',
            emailVerified: true
          }
        }
      }
    },
    async redirect({ url, baseUrl }) {
      // Redirect to onboarding for new users, dashboard for existing users
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/dashboard'
    },
    async signIn({ user, account, profile }) {
      // Allow sign in for all authenticated users
      return true
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
    verifyRequest: '/verify-email',
  },
  debug: false,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)