import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK for server-side operations
let adminApp: App | null = null
let adminAuth: Auth | null = null
let adminFirestore: Firestore | null = null

// Only initialize on server-side
if (typeof window === 'undefined') {
  try {
    // Check if admin app already exists
    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      })
    } else {
      adminApp = getApps()[0]
    }

    adminAuth = getAuth(adminApp)
    adminFirestore = getFirestore(adminApp)
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
  }
}

export { adminAuth, adminFirestore, adminApp }
export default adminApp