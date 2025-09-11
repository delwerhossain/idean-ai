'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { authAPI, User, businessAPI, CreateBusinessData } from '@/lib/api';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isNewUser: boolean;
  setIsNewUser: (value: boolean) => void;
  createBusiness: (data: CreateBusinessData) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setFirebaseUser(firebaseUser);
        
        if (firebaseUser) {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Try to login with backend
          try {
            const response = await authAPI.login(idToken);
            setUser(response.user);
            setIsNewUser(false);
            
            // Store token in localStorage
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
          } catch (error: unknown) {
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
          setUser(null);
          setIsNewUser(false);
          
          // Clear stored data
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    // Check for stored user data on initial load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // The onAuthStateChanged listener will handle the backend login
      console.log('Google sign-in successful:', result.user);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
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
      const business = await businessAPI.createBusiness(data);
      
      // Update user with business info and change role to owner
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
    signInWithGoogle,
    logout,
    isNewUser,
    setIsNewUser,
    createBusiness,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}