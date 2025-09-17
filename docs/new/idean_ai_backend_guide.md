# iDEAN AI Backend API Guide

## Overview
This guide provides a comprehensive understanding of the iDEAN AI backend API structure for seamless frontend integration. The API is built around the concept of AI-powered copywriting and business strategy assistance for Bengali SMBs.

## Base URL
- **Development**: `http://localhost:8001`
- **Production**: `https://ideanai.bismoservices.com`

## Authentication
All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## API Endpoints Structure

### 1. Authentication (`/api/v1/auth`)

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

Response:
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "string"
}
```

#### Verify Token
```http
GET /api/v1/auth/verify
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

---

### 2. Users (`/api/v1/users`)

#### Get Current User Profile
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

#### Update Current User Profile
```http
PUT /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "profile_data": {}
}
```

#### Admin Only Endpoints
- `GET /api/v1/users` - Get all users
- `DELETE /api/v1/users/{id}` - Delete user
- `PATCH /api/v1/users/{id}/role` - Update user role

---

### 3. Business Management (`/api/v1/businesses`)

#### Create Business with Documents
```http
POST /api/v1/businesses
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- name: "string"
- website: "string" (optional)
- industry: "string"
- description: "string"
- documents: File[] (up to 4 PDFs, max 30 pages each)
```

#### Get All Businesses
```http
GET /api/v1/businesses
Authorization: Bearer <token>
```

#### Get Business by ID
```http
GET /api/v1/businesses/{id}
Authorization: Bearer <token>
```

#### Update Business
```http
PUT /api/v1/businesses/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "website": "string",
  "industry": "string",
  "description": "string"
}
```

#### Business Team Management
```http
# Get business users
GET /api/v1/businesses/{id}/users
Authorization: Bearer <token>

# Add user to business
POST /api/v1/businesses/{id}/users
Authorization: Bearer <token>
Content-Type: application/json
{
  "user_id": "string",
  "role": "member|admin|owner"
}

# Remove user from business
DELETE /api/v1/businesses/{id}/users/{userId}
Authorization: Bearer <token>
```

---

### 4. Business Documents (`/api/v1/businesses/{id}/documents`)

#### Upload Documents to Existing Business
```http
POST /api/v1/businesses/{id}/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- documents: File[] (PDFs only)
```

#### Get Business Documents
```http
GET /api/v1/businesses/{id}/documents
Authorization: Bearer <token>
```

#### Search Documents (Vector Search)
```http
GET /api/v1/businesses/documents/search?query=string&limit=10
Authorization: Bearer <token>

Response:
{
  "results": [
    {
      "document_id": "string",
      "content": "string",
      "similarity_score": 0.95,
      "metadata": {}
    }
  ]
}
```

---

### 5. Copy Writing (`/api/v1/copywriting`)

#### Create Copy Writing Configuration
```http
POST /api/v1/copywriting
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "type": "facebook_ad|social_media_post",
  "platform": "facebook|instagram|linkedin|tiktok",
  "language": "english|bangla",
  "prompt": "string",
  "creative_idea": "string",
  "business_id": "string"
}
```

#### Get All Copy Writing Configurations
```http
GET /api/v1/copywriting
Authorization: Bearer <token>
```

#### Get Copy Writing by ID
```http
GET /api/v1/copywriting/{id}
Authorization: Bearer <token>
```

#### Update Copy Writing Configuration
```http
PUT /api/v1/copywriting/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string",
  "prompt": "string",
  "creative_idea": "string"
}
```

---

### 6. AI Content Generation (`/api/v1/copywriting/{id}`)

#### Generate Content
```http
POST /api/v1/copywriting/{id}/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "additional_context": "string",
  "style_preferences": {},
  "target_audience": "string"
}

Response:
{
  "id": "string",
  "generated_content": {
    "hook": "string",
    "primary_text": "string",
    "headline": "string",
    "description": "string",
    "cta": "string",
    "image_idea": "string",
    "text_on_image": "string"
  },
  "metadata": {
    "generation_time": "datetime",
    "tokens_used": 150,
    "model_version": "string"
  }
}
```

#### Regenerate Full Document
```http
POST /api/v1/copywriting/{id}/regeneratefull
Authorization: Bearer <token>
Content-Type: application/json

{
  "feedback": "string",
  "style_changes": {}
}
```

#### Regenerate Specific Parts
```http
POST /api/v1/copywriting/{id}/regeneratespecific
Authorization: Bearer <token>
Content-Type: application/json

{
  "sections_to_regenerate": ["hook", "primary_text", "headline"],
  "feedback": "string",
  "document_id": "string"
}
```

#### Get Generation History
```http
GET /api/v1/copywriting/{id}/history
Authorization: Bearer <token>

Response:
{
  "history": [
    {
      "id": "string",
      "generated_at": "datetime",
      "content": {},
      "user_feedback": "thumbs_up|thumbs_down",
      "tokens_used": 150
    }
  ]
}
```

---

### 7. Templates (`/api/v1/templates` & `/api/v1/copywriting/{id}/templates`)

#### Create Template from Copy Writing
```http
POST /api/v1/copywriting/{id}/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_name": "string",
  "description": "string",
  "is_public": false,
  "document_id": "string"
}
```

#### Get My Templates
```http
GET /api/v1/templates/my-templates
Authorization: Bearer <token>

Response:
{
  "templates": [
    {
      "id": "string",
      "name": "string",
      "type": "facebook_ad|social_media_post",
      "description": "string",
      "created_at": "datetime",
      "usage_count": 5
    }
  ]
}
```

---

## Frontend Integration Guidelines

### 1. Authentication Flow
```javascript
// Login flow
const login = async (email, password) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  return data.user;
};

// API calls with auth
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  return fetch(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};
```

### 2. Onboarding Flow
1. User registers/logs in
2. Create business profile with documents upload
3. AI generates 500-word business overview
4. User confirms/edits overview
5. Optional: Upload ads history CSV
6. Ready to use copy writing tools

### 3. Copy Writing Workflow
1. Select copy type (Facebook Ad / Social Media Post)
2. Choose platform and language
3. Fill in prompt and creative idea
4. Generate content using business context
5. Review and provide feedback
6. Regenerate specific sections if needed
7. Save as template for future use

### 4. Business Document Management
- Upload up to 4 PDFs (max 30 pages each)
- Use vector search to find relevant context
- Leverage document insights for better AI generation

---

## Data Models

### User Schema
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'owner';
  created_at: Date;
  updated_at: Date;
}
```

### Business Schema
```typescript
interface Business {
  id: string;
  name: string;
  website?: string;
  industry: string;
  description: string;
  ai_overview?: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}
```

### Copy Writing Schema
```typescript
interface CopyWriting {
  id: string;
  title: string;
  type: 'facebook_ad' | 'social_media_post';
  platform: 'facebook' | 'instagram' | 'linkedin' | 'tiktok';
  language: 'english' | 'bangla';
  prompt: string;
  creative_idea: string;
  business_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
```

### Generated Document Schema
```typescript
interface Document {
  id: string;
  copywriting_id: string;
  generated_content: {
    hook?: string;
    primary_text?: string;
    headline?: string;
    description?: string;
    cta?: string;
    image_idea?: string;
    text_on_image?: string;
  };
  user_feedback?: 'thumbs_up' | 'thumbs_down';
  tokens_used: number;
  generation_time: Date;
}
```

---

## Error Handling

### Common Error Responses
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Rate Limits & Usage
- Authentication attempts: 5 per minute
- Content generation: 10 per minute per user
- File uploads: 5 per minute
- Standard plan: 500 tokens/month
- Pro plan: Unlimited tokens

---

## File Upload Specifications

### PDF Documents
- **Maximum files**: 4 per business
- **File size limit**: 30 pages each
- **Supported formats**: PDF only
- **Processing**: Automatic text extraction and vectorization

### CSV Upload (Ads History)
- **Minimum rows**: 30
- **Required columns**: ad_name, description, caption, hook, cta, reach, comments, shares, budget
- **Optional columns**: creator_rating(1-5), repeat_intent(yes/no/maybe)

---

## Development Notes

### Local Development
1. Backend runs on `http://localhost:8001`
2. API documentation available at `/api-docs/`
3. All endpoints prefixed with `/api/v1/`

### Environment Variables Needed
```env
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_key
UPLOAD_PATH=/path/to/uploads
```

---

This guide should help you integrate the frontend with the existing backend API. The structure follows REST principles with clear separation of concerns for authentication, business management, document handling, and AI-powered content generation.