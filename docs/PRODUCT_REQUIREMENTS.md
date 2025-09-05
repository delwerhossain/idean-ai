# iDEAN AI Product Requirements Document (PRD)

## 1. Product Vision

iDEAN AI is a desktop-first web application that serves as an AI-powered business strategy and content creation co-pilot for Bengali entrepreneurs and marketers. It combines proprietary business frameworks with advanced AI to transform raw business ideas into actionable strategies and high-converting campaigns.

## 2. Core Features Required

### 2.1 Strategy & Branding Lab
- Niche Finder
- Core Strategy Builder  
- Blue Ocean Navigator
- Category Designer
- Customer Value Journey Planner
- Customer Value Ladder Builder
- Strategic Brand Planner
- StoryBrand Builder

### 2.2 Execution & Growth Cockpit
- Marketing Funnel Builder
- Godfather Offer Builder
- Nuclear Content Planner
- Content Calendar
- Neuro Copywriting Assistant
- Magnetic Storytelling Assistant
- Campaign Planner
- Festival Campaign Planner
- Growth Hacking Idea Generator
- OverDemand Planner

### 2.3 Content Creation Engine
- Facebook Ad Builder (guided workflow: Idea → Hook → Body → CTA → Caption → Script)
- Organic Post Generator
- Video Script Creator
- Email Copy Generator

### 2.4 Analytics Hub
- Performance data upload (CSV/Excel)
- Campaign performance tracking
- ROI analysis
- Template performance insights

## 3. Technical Requirements

### 3.1 User Onboarding Flow
1. Business Information Collection
2. Knowledge Base Upload (4 PDFs ≤30 pages each)
3. AI Business Overview Generation (500 words)
4. Mentor Approval Process
5. Ads History Upload (optional CSV with 30+ rows)
6. Plan Selection (Standard vs Pro)

### 3.2 Content Generation Process
- Dynamic input forms per tool
- AI processing with Bengali context
- Real-time preview and editing
- Save/export functionality (PDF, DOCX, text)

### 3.3 Team Collaboration (Pro Plan)
- Shared workspace
- Role-based access control (Owner, Admin, Contributor, Viewer)
- Shared knowledge base
- Template library
- Activity logging

## 4. User Interface Requirements

### 4.1 Layout
- VentureKit-inspired design
- Hover-based sidebar navigation
- Bengali/English language toggle
- Mobile-responsive (desktop-first)

### 4.2 Key UI Components
- Dashboard with business info display
- Tool selection interface
- Dynamic form builder
- Content editor with preview
- File upload components
- Progress tracking

## 5. Integration Requirements

### 5.1 AI Models
- OpenAI API integration
- Claude 3.5 Sonnet via OpenRouter
- Custom prompt engineering for Bengali context

### 5.2 File Processing
- PDF parsing and analysis
- CSV/Excel data processing
- Image handling for social content

### 5.3 Export Capabilities
- PDF generation
- DOCX export
- Social media format optimization
- Email template export

## 6. Performance Requirements

- Content generation: <10 seconds
- File upload processing: <30 seconds  
- Dashboard load time: <3 seconds
- 99.9% uptime target
- Support for 10,000+ concurrent users

## 7. Security & Compliance

- GDPR compliance
- Data encryption at rest and in transit
- Role-based access control
- Audit logging
- Secure file storage