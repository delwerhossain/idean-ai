import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';

// Use environment variables directly to avoid import-time validation race condition
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

if (process.env.NODE_ENV === 'development') {
  console.log('Firebase initialized successfully');
}

// Configure Google provider
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters for better UX
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

if (process.env.NODE_ENV === 'development') {
  console.log('Google provider configured with scopes:', googleProvider);
}

// Utility functions for Firebase Auth
export const getCurrentFirebaseUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const getCurrentFirebaseToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting Firebase token:', error);
    }
    return null;
  }
};

// Get stored backend token
export const getStoredBackendToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

// Get stored user data
export const getStoredUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error parsing stored user:', error);
    }
    return null;
  }
};