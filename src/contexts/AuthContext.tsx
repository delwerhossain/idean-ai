'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { authAPI, User, businessAPI, CreateBusinessData } from '@/lib/api';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  authLoading: boolean;
  isHydrating: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
  createBusiness: (data: CreateBusinessData) => Promise<void>;
  isHydrated: boolean;
  isAuthReady: boolean; // Combined state for full authentication readiness
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // For sign-in operations
  const [authLoading, setAuthLoading] = useState(true); // For initial auth state checking
  const [isHydrating, setIsHydrating] = useState(true); // For localStorage restoration
  const [isNewUser, setIsNewUser] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Combined state for complete authentication readiness
  // Make auth ready as soon as hydration is complete, even if authLoading is still true
  const isAuthReady = !isHydrating && isHydrated;

  useEffect(() => {
    // Mark as hydrated when we're on the client
    setIsHydrated(true);

    console.log('AuthContext: Setting up auth state listener');
    console.log('Auth object:', auth);

    // Early localStorage check to restore user session immediately
    const checkStoredAuth = () => {
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem('user');
          const storedToken = localStorage.getItem('authToken');

          if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            console.log('⚡ Early restore: Found stored auth, restoring user session:', parsedUser.email);
            setUser(parsedUser);
            setIsNewUser(false);
            setAuthLoading(false); // Mark auth loading complete for stored sessions
            setIsHydrating(false); // Mark hydration complete early
            return true; // User restored successfully
          }

          console.log('⚡ Early restore: No valid stored auth found');
          setIsHydrating(false); // Mark hydration complete even if no user
        } catch (error) {
          console.error('Failed to parse stored user during early restore:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          setIsHydrating(false);
        }
      }
      return false;
    };

    const hasStoredAuth = checkStoredAuth();

    // Check for redirect result first
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('Google sign-in successful via redirect:', result.user);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };
    checkRedirectResult();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      try {
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Try to login with backend
          try {
            const response = await authAPI.login(idToken);
            // Backend now returns enhanced JWT with businessId, role, etc.
            setUser(response.user);
            setIsNewUser(false);
            
            // Store enhanced JWT token and user data
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            console.log('User authenticated with enhanced JWT:', {
              userId: response.user.id,
              email: response.user.email,
              role: response.user.role,
              businessId: response.user.businessId,
              hasBusiness: !!response.user.business
            });
          } catch (error: unknown) {
            console.warn('Backend authentication failed, using local Firebase auth:', error);
            
            // If backend is unavailable (404, network error, etc.), use Firebase data as fallback
            if (error && typeof error === 'object' && 'status' in error) {
              const statusError = error as { status?: number; message?: string };
              if (statusError.status === 404 || statusError.message?.includes('fetch')) {
                console.log('Backend unavailable - using Firebase fallback mode');
                // Create user object from Firebase data
                setUser({
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  role: 'user',
                  provider: 'firebase',
                  photoURL: firebaseUser.photoURL || undefined,
                });
                setIsNewUser(false);
                
                // Store minimal user data for offline mode
                localStorage.setItem('user', JSON.stringify({
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                  role: 'user',
                  provider: 'firebase',
                  photoURL: firebaseUser.photoURL || undefined,
                }));
                return;
              }
            }
            
            // If user doesn't exist in backend, they need to complete signup
            if (error && typeof error === 'object' && 'message' in error) {
              const errorMessage = (error as Error).message;
              if (errorMessage.includes('Invalid credentials') || errorMessage.includes('User not found')) {
                setIsNewUser(true);
                setUser(null);
              }
            }
          }
        } else {
          // User is logged out from Firebase, but check if we already restored from localStorage early
          if (!hasStoredAuth) {
            // No early restoration and no Firebase user, clear everything
            setUser(null);
            setIsNewUser(false);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
            }
          }
          // If hasStoredAuth is true, we already set the user state during early restore
          // so don't clear it here - wait for backend validation if needed
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in...');
      console.log('Auth instance:', auth);
      console.log('Google provider:', googleProvider);
      
      try {
        // Try popup first
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Google sign-in successful via popup:', result.user);
        console.log('User email:', result.user.email);
        console.log('User display name:', result.user.displayName);
      } catch (popupError: any) {
        console.log('Popup failed, trying redirect method:', popupError.code);
        
        // If popup fails, try redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user') {
          console.log('Using redirect method for sign-in...');
          await signInWithRedirect(auth, googleProvider);
          // The redirect result will be handled in useEffect
          return;
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked. Redirecting to Google...');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Only one sign-in request allowed at a time.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google sign-in. Please contact support.');
      } else {
        throw new Error(`Sign-in failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Logout from backend
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Backend logout error:', error);
      }
      
      // Logout from Firebase
      await signOut(auth);
      
      // Clear local state and storage
      setUser(null);
      setFirebaseUser(null);
      setIsNewUser(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (data: CreateBusinessData) => {
    try {
      setLoading(true);
      
      // Create business via API
      let business;
      try {
        business = await businessAPI.createBusiness(data);
      } catch (backendError) {
        console.warn('Backend unavailable - using local business creation:', backendError);
        // Fallback: create business locally when backend is unavailable
        business = {
          id: Date.now().toString(), // Simple ID generation
          business_name: data.businessName,
          website_url: '',
          industry_tag: data.industry,
          business_documents: [],
          business_context: data.description || '',
          language: 'en',
          mentor_approval: 'pending',
          adds_history: [],
          module_select: data.businessType === 'enterprise' ? 'pro' : 'standard',
          readiness_checklist: '{}',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user?.id || 'unknown',
        };
        
        // Store business locally
        localStorage.setItem('currentBusiness', JSON.stringify(business));
        localStorage.setItem('businessName', data.businessName);
        localStorage.setItem('industry', data.industry);
      }
      
      // Get fresh user data with updated JWT (backend updates JWT with businessId and role)
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken && user) {
          // Backend should have updated the JWT to include businessId and role
          // Re-authenticate to get the updated token
          if (firebaseUser) {
            const idToken = await firebaseUser.getIdToken(true); // Force refresh
            const response = await authAPI.login(idToken);
            
            // Update user state with enhanced JWT data
            setUser(response.user);
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            console.log('Business created and user updated:', {
              userId: response.user.id,
              role: response.user.role,
              businessId: response.user.businessId
            });
          }
        }
      } catch (refreshError) {
        console.warn('Failed to refresh JWT after business creation (backend unavailable):', refreshError);
        // Fallback: manually update user state when backend is unavailable
        if (user) {
          const updatedUser = {
            ...user,
            role: 'owner',
            businessId: business.id,
            business: business
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Create business error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    firebaseUser,
    user,
    loading,
    authLoading,
    isHydrating,
    signInWithGoogle,
    logout,
    isNewUser,
    setIsNewUser,
    createBusiness,
    isHydrated,
    isAuthReady,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}