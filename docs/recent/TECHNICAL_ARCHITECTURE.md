# iDEAN AI Technical Architecture

## System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Layer  │    │   Edge Layer    │    │ Application     │
│                 │    │                 │    │ Layer           │
│ - Web Browser   │◄──►│ - API Gateway   │◄──►│ - Processing    │
│ - Mobile App    │    │ - Rate Limiting │    │   Engine        │
│ - React UI      │    │ - Auth          │    │ - Orchestrator  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │  Integration    │              │
                       │  Layer          │◄─────────────┘
                       │                 │
                       │ - OpenAI API    │
                       │ - File Storage  │
                       │ - External APIs │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Data Layer    │
                       │                 │
                       │ - PostgreSQL    │
                       │ - Redis Cache   │
                       │ - File Storage  │
                       └─────────────────┘
```

## Core Components

### 1. Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: React Context + Local Storage
- **Language**: TypeScript
- **Features**:
  - Server-side rendering
  - Static generation for performance
  - Progressive Web App capabilities

### 2. API Layer (Next.js API Routes)
- **Authentication**: NextAuth.js or custom JWT
- **Rate Limiting**: Per-user API quotas
- **Validation**: Zod schemas
- **Error Handling**: Standardized error responses

### 3. AI Integration
- **Primary**: OpenAI API (GPT-4)
- **Secondary**: Claude 3.5 Sonnet via OpenRouter
- **Features**:
  - Bengali language support
  - Custom prompt engineering
  - Response caching for performance
  - Fallback mechanisms

### 4. Data Storage
- **Primary Database**: PostgreSQL (Supabase/Neon)
- **Caching**: Redis (Upstash)
- **File Storage**: AWS S3 or Supabase Storage
- **Search**: PostgreSQL full-text search

### 5. Background Processing
- **Queue**: Redis-based job queue
- **Workers**: Serverless functions
- **Tasks**:
  - PDF processing
  - AI content generation
  - Email notifications
  - Analytics processing

## Data Models

### User Management
```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  language VARCHAR DEFAULT 'en',
  plan VARCHAR DEFAULT 'free',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Organizations (for Pro plan)
organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  plan VARCHAR NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP
);

-- User roles in organizations
user_organizations (
  user_id UUID REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  role VARCHAR NOT NULL, -- owner, admin, contributor, viewer
  PRIMARY KEY (user_id, org_id)
);
```

### Business Context
```sql
-- Business profiles
business_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  industry VARCHAR,
  website VARCHAR,
  description TEXT,
  created_at TIMESTAMP
);

-- Knowledge base documents
knowledge_docs (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES business_profiles(id),
  filename VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,
  file_type VARCHAR NOT NULL,
  processed_at TIMESTAMP,
  content_summary TEXT
);
```

### Content & Templates
```sql
-- Generated content
generated_content (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  business_id UUID REFERENCES business_profiles(id),
  tool_type VARCHAR NOT NULL, -- 'facebook_ad', 'blog_post', etc.
  title VARCHAR NOT NULL,
  content JSONB NOT NULL, -- structured content
  status VARCHAR DEFAULT 'draft',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Saved templates
templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR NOT NULL,
  tool_type VARCHAR NOT NULL,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

-- Performance data
performance_metrics (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES generated_content(id),
  platform VARCHAR NOT NULL,
  metrics JSONB NOT NULL, -- reach, engagement, conversions, etc.
  date_recorded DATE,
  created_at TIMESTAMP
);
```

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Role-Based Access**: Fine-grained permissions (admin , user )
- **Session Management**: Secure session handling
- **Password Security**: Bcrypt hashing

### Data Protection
- **Encryption**: AES-256 for sensitive data
- **TLS**: All communications encrypted
- **Input Validation**: Comprehensive sanitization
- **Rate Limiting**: DDoS and abuse protection

### Privacy Compliance
- **GDPR**: Right to deletion and data export
- **Data Minimization**: Collect only necessary data
- **Consent Management**: Clear opt-in/opt-out
- **Audit Logging**: Track all data access

## Performance Optimization

### Caching Strategy
- **Redis**: API responses and user sessions
- **CDN**: Static assets and images
- **Database**: Query result caching
- **Browser**: Client-side caching

### Scaling Approach
- **Horizontal Scaling**: Load balancers
- **Database**: Read replicas
- **Background Jobs**: Queue-based processing
- **CDN**: Global content delivery

## Monitoring & Observability

### Application Monitoring
- **Metrics**: Response times, error rates
- **Logging**: Structured JSON logs
- **Tracing**: Request lifecycle tracking
- **Alerts**: Automated incident response

### Business Metrics
- **User Engagement**: Tool usage, content generation
- **Performance**: Content success rates
- **Growth**: User acquisition and retention
- **Revenue**: Subscription metrics

## Development & Deployment

### Development Environment
- **Local**: Docker Compose setup
- **Testing**: Jest, Cypress, Playwright
- **Code Quality**: ESLint, Prettier, TypeScript
- **Version Control**: Git with conventional commits

### CI/CD Pipeline
- **Build**: Automated testing and building
- **Deploy**: Vercel for frontend, Railway/Render for backend
- **Environment**: Staging and production environments
- **Rollbacks**: Automated rollback capabilities

### Infrastructure
- **Hosting**: Vercel (frontend), Supabase (backend)
- **Database**: PostgreSQL with backups
- **Storage**: Supabase Storage or AWS S3
- **CDN**: Vercel Edge Network