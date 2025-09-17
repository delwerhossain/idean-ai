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
import AuthService, { AuthResponse } from '@/lib/api/services/auth';
import BusinessService from '@/lib/api/services/business';
import type { User } from '@/types/api';
import type { BusinessCreateRequest } from '@/lib/api/services/business';

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
  createBusiness: (data: BusinessCreateRequest) => Promise<void>;
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
  const isAuthReady = !authLoading && !isHydrating && isHydrated;

  useEffect(() => {
    // Mark as hydrated when we're on the client
    setIsHydrated(true);

    console.log('AuthContext: Setting up auth state listener');
    console.log('Auth object:', auth);

    // Early localStorage check to restore user session immediately
    const checkStoredAuth = () => {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('authToken');

        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('⚡ Early restore: Found stored auth, restoring user session:', parsedUser.email);
            setUser(parsedUser);
            setIsNewUser(false);
            setIsHydrating(false); // Mark hydration complete early
            return true; // User restored successfully
          } catch (error) {
            console.error('Failed to parse stored user during early restore:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
          }
        }

        console.log('⚡ Early restore: No valid stored auth found');
        setIsHydrating(false); // Mark hydration complete even if no user
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
          // Try to login with backend using Firebase token
          try {
            const idToken = await firebaseUser.getIdToken();
            const authResponse: AuthResponse = await AuthService.login(
              firebaseUser.email!,
              idToken
            );

            setUser(authResponse.user);
            setIsNewUser(false);

            // Store user data
            localStorage.setItem('user', JSON.stringify(authResponse.user));

            console.log('User authenticated with backend:', {
              userId: authResponse.user.id,
              email: authResponse.user.email,
              role: authResponse.user.role,
              businessId: authResponse.user.businessId,
              hasBusiness: !!authResponse.user.business,
              token: authResponse.token ? 'stored' : 'missing'
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
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
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
      
      // Logout from backend and clear auth data
      try {
        await AuthService.logout();
      } catch (error) {
        console.error('Backend logout error:', error);
        // Continue with logout even if backend fails
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

  const createBusiness = async (data: BusinessCreateRequest) => {
    try {
      setLoading(true);
      
      // Create business via API
      let business;
      try {
        // Convert to backend format and add required fields
        const businessData: BusinessCreateRequest = {
          business_name: data.business_name,
          website_url: data.website_url || '',
          industry_tag: data.industry_tag,
          business_context: data.business_context || '',
          language: data.language,
          mentor_approval: data.mentor_approval || 'pending',
          module_select: data.module_select,
          readiness_checklist: data.readiness_checklist || '{}',
          business_documents: [],
          adds_history: []
        };

        business = await BusinessService.createBusiness(businessData);
      } catch (backendError) {
        console.warn('Backend unavailable - using local business creation:', backendError);
        // Fallback: create business locally when backend is unavailable
        business = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          business_name: data.business_name,
          website_url: data.website_url,
          industry_tag: data.industry_tag,
          business_documents: [],
          business_context: data.business_context || '',
          language: data.language,
          mentor_approval: 'pending',
          adds_history: [],
          module_select: data.module_select,
          readiness_checklist: '{}',
          users: user ? [user] : [],
        };
        
        // Store business locally
        localStorage.setItem('currentBusiness', JSON.stringify(business));
        localStorage.setItem('businessName', data.business_name);
        localStorage.setItem('industry', data.industry_tag);
      }
      
      // Get fresh user data with updated JWT (backend updates JWT with businessId and role)
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken && user) {
          // Backend should have updated the JWT to include businessId and role
          // Re-authenticate to get the updated token
          if (firebaseUser) {
            try {
              // Get fresh user data from backend
              const updatedUser = await AuthService.getCurrentUser();

              // Update user state
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));

              console.log('Business created and user updated:', {
                userId: updatedUser.id,
                role: updatedUser.role,
                businessId: updatedUser.businessId
              });
            } catch (fetchError) {
              console.warn('Could not fetch updated user after business creation:', fetchError);
              // Use the business data we have
            }
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
            business: business,
            createdAt: user?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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