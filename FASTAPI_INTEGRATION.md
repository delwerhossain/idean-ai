# FastAPI Backend Integration Guide

## Current Setup (localStorage Testing)

Your project is currently set up with **3 test users** stored in localStorage for development:

### 🧪 Test Users
1. **john@entrepreneur.com** / `password123` - Regular user with Tech Startup
2. **sarah@marketing.com** / `password123` - Regular user with Marketing Agency  
3. **admin@idean.ai** / `admin123` - Admin user with platform access

### 🎯 Features Currently Working
- ✅ Authentication with Firebase + NextAuth
- ✅ Test user management via localStorage
- ✅ Onboarding flow with data persistence
- ✅ Role-based access (user, admin, owner)
- ✅ Developer test panel (bottom-right corner in dev mode)

## Tomorrow's FastAPI Integration

### 1. Update Environment Variables
```env
# Update this line in .env
NEXT_PUBLIC_API_URL=http://localhost:8000  # Your FastAPI server URL
```

### 2. FastAPI Endpoints to Implement

#### Authentication Endpoints
```python
# /auth/login
POST /api/auth/login
{
  "email": "user@example.com", 
  "password": "password123"
}
Response: {"access_token": "...", "user": {...}}

# /auth/register  
POST /api/auth/register
{
  "email": "...",
  "password": "...", 
  "name": "..."
}

# /auth/sync-user (called after Firebase auth)
POST /api/auth/sync-user
Headers: {"Authorization": "Bearer <firebase_token>"}
{
  "email": "...",
  "name": "...",
  "role": "user",
  "firebaseUid": "...",
  "photoURL": "...",
  "provider": "email"
}
Response: {
  "user": {
    "id": "...",
    "email": "...", 
    "name": "...",
    "role": "user",
    "businessId": "..." // Important for onboarding flow!
  }
}
```

#### User Management
```python
# Get user profile
GET /api/users/{user_id}
Response: {"user": {...}}

# Update user profile  
PUT /api/users/{user_id}
{
  "businessName": "...",
  "industry": "...",
  "onboardingCompleted": true
}
```

### 3. Code Changes Needed Tomorrow

#### A. Update BackendAPI in `src/lib/test-users.ts`
```typescript
// Replace mock functions with real FastAPI calls
export const BackendAPI = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await response.json();
  },
  
  // ... update other methods
}
```

#### B. Enable Middleware BusinessId Check
In `src/middleware.ts`, change line 45:
```typescript
// Change this:
false && // Disabled: !token.user?.businessId && 

// To this:
!token.user?.businessId && 
```

### 4. Database Schema Suggestions

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  firebase_uid VARCHAR(255) UNIQUE,
  photo_url TEXT,
  business_id UUID REFERENCES businesses(id),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Businesses Table
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  website TEXT,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Migration Steps Tomorrow

1. **Start FastAPI server** on `http://localhost:8000`
2. **Update `.env`** with `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. **Replace mock functions** in `src/lib/test-users.ts` with real API calls
4. **Re-enable middleware checks** in `src/middleware.ts`
5. **Test authentication flow** with existing users
6. **Migrate test user data** from localStorage to database

### 6. Testing After Integration

#### Manual Test Flow:
1. Clear localStorage: `localStorage.clear()`
2. Go to `/login` 
3. Use test credentials: `john@entrepreneur.com` / `password123`
4. Should authenticate via Firebase → sync with FastAPI → redirect to dashboard
5. Verify user data comes from FastAPI database

#### Test User Panel:
- Development panel (bottom-right) should still work
- "Clear Data" will clear localStorage + logout
- Quick login buttons will test FastAPI authentication

### 7. Current File Structure
```
src/
├── lib/
│   ├── test-users.ts          # Mock API → Replace with FastAPI calls
│   ├── auth/config.ts         # Uses BackendAPI.syncUser()
│   └── firebase/
├── components/
│   ├── dev/TestUserPanel.tsx  # Developer testing interface
│   └── auth/LoginForm.tsx     # Supports pre-filled credentials
└── middleware.ts              # Has businessId check (disabled)
```

## 🚀 Ready for FastAPI!

Your frontend is fully prepared for FastAPI integration. Just update the API URL and replace the mock functions with real FastAPI calls. The authentication flow, user management, and onboarding system are all structured to work seamlessly with your Python backend.

**Current Status:** ✅ Frontend-only with localStorage  
**Tomorrow:** 🔄 Full-stack with FastAPI + Database