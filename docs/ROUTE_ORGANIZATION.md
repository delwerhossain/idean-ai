# Route Organization - iDEAN AI Project

## Overview
The project has been reorganized using Next.js 15 route groups for better structure and maintainability.

## New Folder Structure

### `src/app/`
```
src/app/
├── (dashboard)/           # Protected dashboard routes
│   ├── layout.tsx        # DashboardLayout wrapper
│   ├── dashboard/        # Main dashboard
│   │   ├── page.tsx
│   │   └── onboarding/
│   ├── blueprints/       # Blueprint Builder (Strategy DNA)
│   ├── campaigns/        # Campaign Engine (Execution DNA)
│   ├── audit/           # Growth Audit tools
│   ├── copilot/         # AI Co-Pilot chat
│   ├── guided-paths/    # Learning paths
│   ├── content-calendar/ # Content planning
│   ├── library/         # Template library
│   ├── generate-document/ # Document generation
│   ├── tools/           # Additional tools
│   └── shared/          # Shared content
│
├── (main)/              # Public routes
│   ├── layout.tsx       # Simple layout wrapper
│   ├── page.tsx        # Home page (/)
│   ├── login/          # Authentication
│   ├── register/       # User registration
│   ├── forgot-password/
│   ├── reset-password/
│   ├── verify-email/
│   └── auth/
│       └── error/
│
├── api/                 # API routes (unchanged)
├── layout.tsx          # Root layout
├── globals.css         # Global styles
└── favicon.ico         # Favicon
```

## Route Groups Explained

### `(dashboard)` Route Group
- **Purpose**: Contains all authenticated pages that require user login
- **Layout**: Automatically wraps with `DashboardLayout` component
- **Features**: 
  - Sidebar navigation
  - Role-based access control
  - Protected route authentication
  - Test user panel (dev mode)

**Pages included:**
- `/dashboard` - Main dashboard
- `/dashboard/onboarding` - Business setup
- `/blueprints` - Interactive framework wizard
- `/campaigns` - Campaign & content engine
- `/audit` - Growth assessment tools
- `/copilot` - Conversational AI assistant
- `/guided-paths` - Step-by-step learning
- `/content-calendar` - Content planning
- `/library` - Template library
- `/generate-document` - Document generation
- `/tools` - Additional business tools
- `/shared/[id]` - Shared content links

### `(main)` Route Group
- **Purpose**: Contains public pages accessible without authentication
- **Layout**: Simple passthrough layout
- **Features**: 
  - Clean public interface
  - Authentication forms
  - Error handling pages

**Pages included:**
- `/` - Home/landing page
- `/login` - User authentication
- `/register` - User registration
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/verify-email` - Email verification
- `/auth/error` - Authentication error handling

## Benefits of This Organization

### 1. **Clear Separation of Concerns**
- Public pages vs. protected pages are clearly separated
- Easy to identify which routes require authentication
- Simplified layout management

### 2. **Better Developer Experience**
- Logical grouping of related functionality
- Easier navigation in file explorer
- Clear project structure for new developers

### 3. **Improved Maintainability**
- Layouts applied automatically to route groups
- Consistent authentication handling
- Easier to modify access control policies

### 4. **Next.js Best Practices**
- Uses Next.js 15 App Router features
- Route groups don't affect URL structure
- Optimized for performance and SEO

## URL Structure (Nested Dashboard Routes)
The route structure now properly nests dashboard features under `/dashboard/`:

**Public Routes:**
- `http://localhost:3003/` → Home page
- `http://localhost:3003/login` → Login page
- `http://localhost:3003/register` → Registration

**Dashboard Routes (Protected):**
- `http://localhost:3003/dashboard` → Main Dashboard
- `http://localhost:3003/dashboard/onboarding` → Business Setup
- `http://localhost:3003/dashboard/blueprints` → Blueprint Builder
- `http://localhost:3003/dashboard/campaigns` → Campaign Engine
- `http://localhost:3003/dashboard/audit` → Growth Audit
- `http://localhost:3003/dashboard/copilot` → AI Co-Pilot
- `http://localhost:3003/dashboard/guided-paths` → Learning Paths
- `http://localhost:3003/dashboard/content-calendar` → Content Planning
- `http://localhost:3003/dashboard/library` → Framework Library
- etc.

## Authentication Flow
1. **Public routes** (`(main)` group): Accessible to everyone
2. **Protected routes** (`(dashboard)` group): 
   - Automatically redirected to `/login` if not authenticated
   - Wrapped with `DashboardLayout` and role-based access control
   - Test users available for development

## Development Notes
- The old flat structure has been completely reorganized
- All imports and references continue to work
- Middleware authentication remains unchanged
- Test users and authentication system intact

## File Migration Summary
✅ **Moved to `(dashboard)` group:**
- dashboard/ → (dashboard)/dashboard/
- blueprints/ → (dashboard)/blueprints/
- campaigns/ → (dashboard)/campaigns/
- audit/ → (dashboard)/audit/
- copilot/ → (dashboard)/copilot/
- guided-paths/ → (dashboard)/guided-paths/
- content-calendar/ → (dashboard)/content-calendar/
- library/ → (dashboard)/library/
- generate-document/ → (dashboard)/generate-document/
- tools/ → (dashboard)/tools/
- shared/ → (dashboard)/shared/

✅ **Moved to `(main)` group:**
- page.tsx → (main)/page.tsx
- login/ → (main)/login/
- register/ → (main)/register/
- forgot-password/ → (main)/forgot-password/
- reset-password/ → (main)/reset-password/
- verify-email/ → (main)/verify-email/
- auth/ → (main)/auth/

✅ **Unchanged:**
- api/ (API routes remain at root level)
- layout.tsx (root layout)
- globals.css
- favicon.ico

This organization provides a cleaner, more maintainable structure while preserving all existing functionality and URLs.