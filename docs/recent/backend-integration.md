# iDEAN AI Backend Integration Guide
**FastAPI Python Backend Integration with Next.js Frontend**

## Overview

This document outlines the integration between the iDEAN AI Next.js frontend and the FastAPI Python backend. It covers authentication flow, API endpoints, data models, and implementation guidelines for backend developers.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   FastAPI API   │    │   PostgreSQL    │
│                 │    │                 │    │   + Firebase    │
│ • Authentication│◄──►│ • Business Logic│◄──►│   • User Data   │
│ • UI Components │    │ • AI Processing │    │   • Content     │
│ • Client Logic  │    │ • Content Mgmt  │    │   • Analytics   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Authentication Integration

### Frontend Authentication Flow
The frontend uses **NextAuth.js + Firebase** for authentication:

1. **User Registration/Login** → Firebase Auth
2. **JWT Token Generation** → NextAuth.js
3. **API Requests** → Include JWT in Authorization header
4. **Backend Validation** → Verify Firebase JWT tokens

### Backend Authentication Setup

#### Required Dependencies
```bash
pip install fastapi uvicorn firebase-admin python-jose[cryptography] python-multipart
```

#### Firebase Admin SDK Setup
```python
# app/auth/firebase_auth.py
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Initialize Firebase Admin SDK
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

security = HTTPBearer()

async def verify_firebase_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Firebase JWT token from frontend"""
    try:
        # Remove 'Bearer ' prefix if present
        token = credentials.credentials.replace('Bearer ', '')
        
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        email = decoded_token.get('email')
        
        return {
            'uid': user_id,
            'email': email,
            'verified': decoded_token.get('email_verified', False),
            'role': decoded_token.get('role', 'member'),  # Custom claims
            'organization_id': decoded_token.get('organization_id')
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")

# Role-based access decorator
def require_role(required_roles: list):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Get current user from dependencies
            current_user = kwargs.get('current_user')
            if not current_user or current_user['role'] not in required_roles:
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

## Data Models & Database Schema

### User Data Model
```python
# app/models/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class User(BaseModel):
    id: str  # Firebase UID
    email: EmailStr
    name: str
    role: Literal['owner', 'admin', 'member']
    organization_id: Optional[str] = None
    subscription_tier: Literal['free', 'standard', 'pro'] = 'free'
    ai_credits: int = 500
    created_at: datetime
    last_login_at: Optional[datetime] = None
    email_verified: bool = False
    avatar_url: Optional[str] = None

class Organization(BaseModel):
    id: str
    name: str
    plan: Literal['free', 'standard', 'pro'] = 'free'
    locale: Literal['en', 'bn'] = 'en'
    owner_id: str
    total_users: int = 1
    monthly_usage: int = 0
    created_at: datetime
    settings: dict = {}

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    role: Literal['owner', 'admin', 'member'] = 'member'
    organization_name: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    settings: Optional[dict] = None
```

### Content & AI Models
```python
# app/models/content.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ContentGeneration(BaseModel):
    id: str
    user_id: str
    organization_id: Optional[str]
    content_type: Literal['blueprint', 'campaign', 'ad_copy', 'organic_post']
    framework: Optional[str]  # e.g., 'Customer Value Journey', 'Blue Ocean'
    input_data: Dict[Any, Any]
    generated_content: Dict[Any, Any]
    status: Literal['draft', 'approved', 'published'] = 'draft'
    ai_credits_used: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class KnowledgeBase(BaseModel):
    id: str
    organization_id: str
    file_name: str
    file_type: Literal['pdf', 'text']
    content: str
    tokens: int
    uploaded_by: str
    created_at: datetime
    metadata: Optional[Dict[str, Any]] = {}

class AIUsage(BaseModel):
    id: str
    user_id: str
    organization_id: Optional[str]
    action: Literal['content_generation', 'pdf_upload', 'ai_query', 'blueprint_creation']
    credits_consumed: int
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = {}
```

## API Endpoints Specification

### Authentication Endpoints

#### POST /api/auth/sync-user
**Purpose**: Sync user data between Firebase and backend database
```python
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/sync-user")
async def sync_user(
    user_data: UserCreate,
    current_user: dict = Depends(verify_firebase_token)
):
    """
    Sync user data after Firebase registration
    Called from frontend after successful registration
    """
    try:
        # Check if user exists in database
        existing_user = await get_user_by_id(current_user['uid'])
        
        if not existing_user:
            # Create new user record
            new_user = User(
                id=current_user['uid'],
                email=current_user['email'],
                name=user_data.name,
                role=user_data.role,
                created_at=datetime.utcnow(),
                email_verified=current_user['verified']
            )
            
            # Create organization if user is owner
            if user_data.role == 'owner' and user_data.organization_name:
                org = Organization(
                    id=current_user['uid'],  # Use user ID as org ID
                    name=user_data.organization_name,
                    owner_id=current_user['uid'],
                    created_at=datetime.utcnow()
                )
                await create_organization(org)
                new_user.organization_id = org.id
            
            await create_user(new_user)
            
        # Update last login
        await update_user_last_login(current_user['uid'])
        
        return {"status": "success", "user": existing_user or new_user}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_current_user(current_user: dict = Depends(verify_firebase_token)):
    """Get current user profile"""
    user = await get_user_by_id(current_user['uid'])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### Content Generation Endpoints

#### POST /api/content/generate
```python
@router.post("/generate")
async def generate_content(
    request: ContentGenerationRequest,
    current_user: dict = Depends(verify_firebase_token)
):
    """
    Generate AI content based on framework and input data
    """
    # Check AI credits
    user = await get_user_by_id(current_user['uid'])
    if user.ai_credits < request.estimated_credits:
        raise HTTPException(status_code=402, detail="Insufficient AI credits")
    
    try:
        # Process with AI (OpenAI integration)
        generated_content = await process_with_ai(
            framework=request.framework,
            content_type=request.content_type,
            input_data=request.input_data,
            user_context=user
        )
        
        # Save to database
        content = ContentGeneration(
            id=generate_uuid(),
            user_id=current_user['uid'],
            organization_id=user.organization_id,
            content_type=request.content_type,
            framework=request.framework,
            input_data=request.input_data,
            generated_content=generated_content,
            ai_credits_used=request.estimated_credits,
            created_at=datetime.utcnow()
        )
        
        await save_content_generation(content)
        
        # Deduct credits
        await deduct_ai_credits(current_user['uid'], request.estimated_credits)
        
        return {
            "status": "success",
            "content_id": content.id,
            "generated_content": generated_content,
            "credits_remaining": user.ai_credits - request.estimated_credits
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ContentGenerationRequest(BaseModel):
    content_type: Literal['blueprint', 'campaign', 'ad_copy', 'organic_post']
    framework: Optional[str] = None
    input_data: Dict[str, Any]
    estimated_credits: int
```

### Knowledge Base Endpoints

#### POST /api/knowledge-base/upload
```python
@router.post("/upload")
async def upload_knowledge_base(
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_firebase_token)
):
    """
    Upload PDF or text file to knowledge base
    """
    # Validate file type and size
    if file.content_type not in ['application/pdf', 'text/plain']:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    if file.size > 30 * 1024 * 1024:  # 30MB limit
        raise HTTPException(status_code=400, detail="File too large")
    
    try:
        # Extract text content
        if file.content_type == 'application/pdf':
            content = await extract_pdf_text(file)
        else:
            content = (await file.read()).decode('utf-8')
        
        # Calculate tokens
        tokens = calculate_tokens(content)
        
        # Save to database
        kb = KnowledgeBase(
            id=generate_uuid(),
            organization_id=current_user.get('organization_id'),
            file_name=file.filename,
            file_type='pdf' if file.content_type == 'application/pdf' else 'text',
            content=content,
            tokens=tokens,
            uploaded_by=current_user['uid'],
            created_at=datetime.utcnow()
        )
        
        await save_knowledge_base(kb)
        
        return {
            "status": "success",
            "file_id": kb.id,
            "tokens": tokens,
            "message": "File uploaded successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Analytics & Usage Endpoints

#### GET /api/analytics/usage
```python
@router.get("/usage")
async def get_usage_analytics(
    period: Literal['day', 'week', 'month'] = 'month',
    current_user: dict = Depends(verify_firebase_token)
):
    """Get usage analytics for current user/organization"""
    
    # Determine query scope based on role
    if current_user['role'] in ['owner', 'admin']:
        scope = 'organization'
        scope_id = current_user.get('organization_id')
    else:
        scope = 'user'
        scope_id = current_user['uid']
    
    usage_data = await get_usage_analytics(
        scope=scope,
        scope_id=scope_id,
        period=period
    )
    
    return usage_data

@router.post("/usage/track")
async def track_usage(
    usage: AIUsage,
    current_user: dict = Depends(verify_firebase_token)
):
    """Track AI usage for billing and analytics"""
    usage.user_id = current_user['uid']
    usage.organization_id = current_user.get('organization_id')
    usage.timestamp = datetime.utcnow()
    
    await save_ai_usage(usage)
    return {"status": "success"}
```

## Frontend API Client Implementation

### API Client Utility
```typescript
// src/lib/api/client.ts
import { getSession } from 'next-auth/react'

class APIClient {
  private baseUrl: string
  
  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }
  
  private async getAuthHeaders() {
    const session = await getSession()
    if (!session?.user) {
      throw new Error('Not authenticated')
    }
    
    // Get Firebase token from session
    const token = session.user.firebaseToken || session.accessToken
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'API request failed')
    }
    
    return response.json()
  }
  
  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
  
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
  
  // File upload method
  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<any> {
    const session = await getSession()
    if (!session?.user) {
      throw new Error('Not authenticated')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }
    
    const token = session.user.firebaseToken || session.accessToken
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Upload failed')
    }
    
    return response.json()
  }
}

export const apiClient = new APIClient()
```

### Type Definitions
```typescript
// src/types/api.ts
export interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
  organization_id?: string
  subscription_tier: 'free' | 'standard' | 'pro'
  ai_credits: number
  created_at: string
  last_login_at?: string
  email_verified: boolean
  avatar_url?: string
}

export interface ContentGenerationRequest {
  content_type: 'blueprint' | 'campaign' | 'ad_copy' | 'organic_post'
  framework?: string
  input_data: Record<string, any>
  estimated_credits: number
}

export interface ContentGenerationResponse {
  status: 'success'
  content_id: string
  generated_content: Record<string, any>
  credits_remaining: number
}

export interface KnowledgeBaseUploadResponse {
  status: 'success'
  file_id: string
  tokens: number
  message: string
}

export interface UsageAnalytics {
  total_credits_used: number
  content_generated: number
  files_uploaded: number
  daily_usage: Array<{
    date: string
    credits_used: number
    actions: number
  }>
}
```

### API Service Hooks
```typescript
// src/lib/api/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.get<User>('/api/auth/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useGenerateContent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: ContentGenerationRequest) =>
      apiClient.post<ContentGenerationResponse>('/api/content/generate', request),
    onSuccess: () => {
      // Invalidate user query to refresh credits
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useUploadKnowledgeBase() {
  return useMutation({
    mutationFn: (file: File) =>
      apiClient.uploadFile('/api/knowledge-base/upload', file),
  })
}

export function useUsageAnalytics(period: 'day' | 'week' | 'month' = 'month') {
  return useQuery({
    queryKey: ['usage-analytics', period],
    queryFn: () => apiClient.get<UsageAnalytics>(`/api/analytics/usage?period=${period}`),
  })
}
```

## Environment Variables

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# Firebase (existing)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
# ... other Firebase config
```

### Backend (.env)
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/idean_ai
REDIS_URL=redis://localhost:6379

# Firebase Admin
FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json
FIREBASE_PROJECT_ID=your-project-id

# OpenAI
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4-turbo-preview

# Security
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]
```

## Development Setup

### Backend Setup
```bash
# Clone backend repository
git clone <backend-repo-url>
cd idean-ai-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database
alembic upgrade head

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend API Integration
```typescript
// Example usage in React component
import { useGenerateContent, useUser } from '@/lib/api/hooks'

export function ContentGenerator() {
  const { data: user } = useUser()
  const generateContent = useGenerateContent()
  
  const handleGenerate = async () => {
    try {
      const result = await generateContent.mutateAsync({
        content_type: 'ad_copy',
        framework: 'Nuclear Content',
        input_data: { product: 'AI Tool', audience: 'Marketers' },
        estimated_credits: 50
      })
      
      console.log('Generated content:', result.generated_content)
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }
  
  return (
    <div>
      <p>Credits remaining: {user?.ai_credits}</p>
      <button 
        onClick={handleGenerate}
        disabled={generateContent.isPending}
      >
        {generateContent.isPending ? 'Generating...' : 'Generate Content'}
      </button>
    </div>
  )
}
```

## Error Handling & Monitoring

### Backend Error Responses
```python
# Standardized error response format
class APIError(HTTPException):
    def __init__(self, status_code: int, message: str, error_code: str = None):
        self.status_code = status_code
        self.message = message
        self.error_code = error_code
        super().__init__(status_code=status_code, detail={
            "message": message,
            "error_code": error_code,
            "timestamp": datetime.utcnow().isoformat()
        })

# Common error codes
INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS"
INVALID_FRAMEWORK = "INVALID_FRAMEWORK"
FILE_TOO_LARGE = "FILE_TOO_LARGE"
RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
```

### Frontend Error Handling
```typescript
// Error boundary for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Global error handler
export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    switch (error.errorCode) {
      case 'INSUFFICIENT_CREDITS':
        // Show upgrade prompt
        break
      case 'RATE_LIMIT_EXCEEDED':
        // Show retry timer
        break
      default:
        // Show generic error
        break
    }
  }
}
```

## Testing

### Backend Testing
```python
# Test authentication
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def authenticated_user():
    return {
        "uid": "test-user-123",
        "email": "test@example.com",
        "role": "member",
        "verified": True
    }

def test_generate_content(client: TestClient, authenticated_user):
    response = client.post(
        "/api/content/generate",
        json={
            "content_type": "ad_copy",
            "framework": "Nuclear Content",
            "input_data": {"product": "Test Product"},
            "estimated_credits": 25
        },
        headers={"Authorization": "Bearer fake-token"}
    )
    assert response.status_code == 200
    assert "generated_content" in response.json()
```

### Frontend Testing
```typescript
// Mock API client for testing
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  uploadFile: jest.fn(),
}

// Test React hooks
import { renderHook } from '@testing-library/react'
import { useGenerateContent } from '@/lib/api/hooks'

test('useGenerateContent hook', async () => {
  const { result } = renderHook(() => useGenerateContent())
  
  await act(async () => {
    await result.current.mutateAsync({
      content_type: 'ad_copy',
      framework: 'Nuclear Content',
      input_data: { product: 'Test' },
      estimated_credits: 25
    })
  })
  
  expect(result.current.isSuccess).toBe(true)
})
```

## Deployment

### Docker Configuration

#### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/idean_ai
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=idean_ai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Security Considerations

### API Security Checklist
- [ ] Firebase JWT token validation
- [ ] Role-based access control
- [ ] Rate limiting (Redis-based)
- [ ] Input validation and sanitization
- [ ] File upload restrictions
- [ ] CORS configuration
- [ ] API key rotation
- [ ] Request logging
- [ ] SQL injection protection
- [ ] XSS prevention

### Production Deployment
1. **SSL/TLS**: Enable HTTPS for all API endpoints
2. **Environment Variables**: Use secure secret management
3. **Database**: Enable connection pooling and SSL
4. **Monitoring**: Set up logging and error tracking
5. **Backup**: Automated database backups
6. **Scaling**: Load balancer configuration

This documentation provides a complete integration guide for connecting your iDEAN AI frontend with a FastAPI backend. The backend developer can use this to implement a robust, scalable API that seamlessly integrates with your authentication system and business requirements.