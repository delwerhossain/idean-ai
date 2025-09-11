// Client-side Firebase configuration for use in components
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase app
let app: FirebaseApp
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
} catch (error) {
  console.error('Firebase initialization error:', error)
  // Fallback initialization
  app = initializeApp(firebaseConfig, 'default-' + Date.now())
}

// Initialize Firebase services
export const auth: Auth = getAuth(app)
export const firestore: Firestore = getFirestore(app)
export const storage: FirebaseStorage = getStorage(app)

// Analytics - only on client side with proper error handling
export let analytics: any = null
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(async (analyticsModule) => {
    try {
      const isSupported = await analyticsModule.isSupported()
      if (isSupported) {
        analytics = analyticsModule.getAnalytics(app)
      }
    } catch (error) {
      console.warn('Analytics initialization failed:', error)
    }
  })
}

export default app