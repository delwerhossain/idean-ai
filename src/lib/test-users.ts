// Test user management for local development
// This will be replaced with FastAPI backend calls

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'owner';
  businessId?: string;
  businessName?: string;
  industry?: string;
  website?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  modules?: string[]; // iMarketing, GrowthX, iMBA
  tier?: 'free' | 'basic' | 'pro'; // Subscription tier
}

// Mock test users for development
export const TEST_USERS: TestUser[] = [
  {
    id: 'user_001',
    email: 'john@entrepreneur.com',
    password: 'password123',
    name: 'John Doe',
    role: 'user',
    businessId: 'business_001',
    businessName: 'Tech Startup Solutions',
    industry: 'Technology',
    website: 'https://techstartup.com',
    onboardingCompleted: true,
    modules: ['iMarketing'],
    tier: 'basic',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_002', 
    email: 'sarah@marketing.com',
    password: 'password123',
    name: 'Sarah Wilson',
    role: 'user',
    businessId: 'business_002',
    businessName: 'Creative Marketing Agency',
    industry: 'Marketing',
    website: 'https://creativeagency.com',
    onboardingCompleted: true,
    modules: ['iMarketing', 'GrowthX'],
    tier: 'pro',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user_003',
    email: 'admin@idean.ai',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    businessId: 'business_003',
    businessName: 'Idean AI Platform',
    industry: 'AI/Software',
    website: 'https://idean.ai',
    onboardingCompleted: true,
    modules: ['iMarketing', 'GrowthX', 'iMBA'],
    tier: 'pro',
    createdAt: new Date().toISOString()
  }
];

// LocalStorage key for test users
const USERS_KEY = 'test_users';
const CURRENT_USER_KEY = 'current_user';

// Initialize test users in localStorage
export function initializeTestUsers() {
  if (typeof window === 'undefined') return;
  
  const existingUsers = localStorage.getItem(USERS_KEY);
  if (!existingUsers) {
    localStorage.setItem(USERS_KEY, JSON.stringify(TEST_USERS));
    console.log('🧪 Test users initialized:', TEST_USERS.map(u => u.email));
  }
}

// Get all test users
export function getTestUsers(): TestUser[] {
  // On server-side (NextAuth), return hardcoded test users
  if (typeof window === 'undefined') {
    console.log('🖥️ Server-side: returning hardcoded test users');
    return TEST_USERS;
  }
  
  // On client-side, use localStorage
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : TEST_USERS; // Fallback to hardcoded if localStorage is empty
}

// Find user by email
export function findUserByEmail(email: string): TestUser | null {
  const users = getTestUsers();
  console.log('🔍 Looking for user:', email);
  console.log('📋 Available users:', users.map(u => u.email));
  const found = users.find(user => user.email === email) || null;
  console.log('👤 User found:', found ? found.email : 'None');
  return found;
}

// Authenticate user (mock login)
export function authenticateTestUser(email: string, password: string): TestUser | null {
  console.log('🔐 Authenticating:', { email, password: password?.substring(0, 3) + '***' });
  const user = findUserByEmail(email);
  
  if (user) {
    console.log('👤 User found, checking password...');
    if (user.password === password) {
      console.log('✅ Password correct!');
      
      // Only set localStorage on client-side
      if (typeof window !== 'undefined') {
        // Set current user
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        
        // Set onboarding data if user has completed onboarding
        if (user.onboardingCompleted) {
          localStorage.setItem('hasCompletedOnboarding', 'true');
          localStorage.setItem('userName', user.name);
          localStorage.setItem('businessName', user.businessName || '');
          localStorage.setItem('industry', user.industry || '');
          localStorage.setItem('website', user.website || '');
        }
      }
      
      return user;
    } else {
      console.log('❌ Password incorrect');
    }
  } else {
    console.log('❌ User not found');
  }
  
  return null;
}

// Get current logged in user
export function getCurrentTestUser(): TestUser | null {
  if (typeof window === 'undefined') return null;
  
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

// Update user after onboarding
export function updateTestUser(userId: string, updates: Partial<TestUser>) {
  const users = getTestUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex >= 0) {
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update current user if it's the same user
    const currentUser = getCurrentTestUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
    }
  }
}

// Clear test data
export function clearTestData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('hasCompletedOnboarding');
  localStorage.removeItem('userName');
  localStorage.removeItem('businessName');
  localStorage.removeItem('industry');
  localStorage.removeItem('website');
  localStorage.removeItem('businessContext');
  localStorage.removeItem('onboardingData');
}

// FastAPI Backend Integration Helpers
// These functions will be updated tomorrow when you integrate FastAPI

export const BackendAPI = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // User Authentication
  async login(email: string, password: string) {
    // TODO: Replace with actual FastAPI call
    // return await fetch(`${this.baseUrl}/auth/login`, { ... })
    
    // For now, use test user authentication
    const testUser = authenticateTestUser(email, password);
    if (testUser) {
      return testUser;
    }
    
    return null;
  },
  
  // User Registration  
  async register(userData: Partial<TestUser>) {
    // TODO: Replace with actual FastAPI call
    // return await fetch(`${this.baseUrl}/auth/register`, { ... })
    console.log('Mock register:', userData);
    return userData;
  },
  
  // Get User Profile
  async getUserProfile(userId: string) {
    // TODO: Replace with actual FastAPI call
    // return await fetch(`${this.baseUrl}/users/${userId}`, { ... })
    return findUserByEmail('user@example.com');
  },
  
  // Update User Profile
  async updateUserProfile(userId: string, updates: Partial<TestUser>) {
    // TODO: Replace with actual FastAPI call
    // return await fetch(`${this.baseUrl}/users/${userId}`, { method: 'PUT', ... })
    updateTestUser(userId, updates);
    return updates;
  },
  
  // Sync User (called after Firebase auth)
  async syncUser(firebaseUser: any, firebaseToken: string) {
    // TODO: Replace with actual FastAPI call
    // return await fetch(`${this.baseUrl}/auth/sync-user`, { ... })
    
    // For now, return mock data
    const testUser = findUserByEmail(firebaseUser.email);
    if (testUser) {
      return {
        user: {
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
          role: testUser.role,
          businessId: testUser.businessId,
          photoURL: firebaseUser.photoURL
        }
      };
    }
    
    // Return default user if not found
    return {
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: 'user',
        businessId: undefined,
        photoURL: firebaseUser.photoURL
      }
    };
  }
};