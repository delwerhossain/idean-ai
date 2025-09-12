# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js App Router pages and routes.
- `src/components`: UI components (feature folders; shared in `ui/`).
- `src/lib`: Core libraries (API client in `lib/api/client.ts`, endpoint services in `lib/api/idean-api.ts`, auth in `lib/firebase` and `lib/auth`).
- `src/contexts`: React contexts (e.g., `AuthContext`, `BusinessContext`).
- `public`: Static assets.
- `docs`: Product and integration docs.
- `scripts`: Local helper scripts (auth tests, commit tools).

## Build, Test, and Development Commands
- `pnpm dev`: Run the app locally with Next.js dev server.
- `pnpm build`: Production build (Turbopack).
- `pnpm start`: Start the production server.
- `pnpm lint`: Run ESLint over the codebase.
- `pnpm x`: Install deps then start dev.
- Auth/debug scripts: see `scripts/` (e.g., `node scripts/test-auth.js`).

## Coding Style & Naming Conventions
- Language: TypeScript, React 19, Next.js 15 App Router.
- Indentation: 2 spaces; prefer named exports where practical.
- Components: PascalCase files in `src/components/...` (e.g., `BusinessContextStep.tsx`).
- Routes: folder-based, kebab-case under `src/app/...`.
- API services: co-locate in `src/lib/api` (client, services, hooks). Keep endpoints in `idean-api.ts` or `services/*`.
- Linting: ESLint 9 + `eslint-config-next`. Fix issues before commit.

## Testing Guidelines
- E2E: Playwright available; add tests under `tests/` if needed.
- Scripts: Use provided helpers in `scripts/` for auth/session flows.
- Naming: `*.spec.ts` / `*.e2e.ts` for tests; co-locate or place in `tests/`.
- Run locally: `npx playwright test` (set up browsers first: `npx playwright install`).

## Commit & Pull Request Guidelines
- Commits: Small, atomic, descriptive. Reference issues (e.g., `fix(onboarding): persist business_context via API`).
- Use the helper: `pnpm commit` (PowerShell script chunks changes) or commit manually.
- PRs: Include a clear summary, linked issue(s), screenshots for UI changes, and steps to verify. Note migrations or env changes.

## Security & Configuration Tips
- Env: Set `NEXT_PUBLIC_API_URL`, Firebase settings in `src/lib/firebase/config.ts`.
- Secrets: Never commit tokens or service keys. Avoid logging JWTs.
- Auth: Backend JWT is managed in `lib/api/client.ts`; prefer `apiClient` and `ideanApi` for all network calls.


# AGENTS.md - Idean AI Development Guide

## Project Overview
**Idean AI** is an intelligent business strategy AI platform that serves as a daily AI-powered strategy and execution co-pilot. The platform combines proven business frameworks from iMarketing, GrowthX, and iMBA programs with AI capabilities to help entrepreneurs and marketers create effective strategies and campaigns.

**UI Inspiration**: VentureKit-style interface  
**Content Source**: Idean AI proprietary frameworks and methodologies  
**Target**: Entrepreneurs, marketers, and small business owners

## Tech Stack
- **Framework**: Next.js 15.5.2 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **AI Integration**: OpenAI GPT models
- **Utilities**: Lucide React icons, React Markdown
- **PDF Generation**: jsPDF with html2canvas
- **Package Manager**: pnpm

## Development Commands

### Start Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Run Linter
```bash
pnpm lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## Core Features Implementation

### 1. Blueprint Builder (Strategy DNA)
- Interactive framework wizard with conversational Q&A
- Framework selection (Customer Value Journey, Blue Ocean Strategy, etc.)
- Real-time blueprint generation with visual mapping
- Export capabilities (PDF, Google Doc, Notion templates)

### 2. Campaign & Content Engine (Execution DNA)
- Marketing funnel generation
- Campaign sequence creation
- Copy generation with multiple variations
- Content calendar planning
- Multi-channel content (social, email, ads)

### 3. Conversational Co-Pilot
- Natural language interface for content requests
- Context-aware responses based on user's business profile
- Framework-guided content generation

### 4. Analytics Integration
- Performance tracking for generated content
- CSV/XLSX upload for historical data
- Basic reporting and insights

## Architecture Patterns

### Component Structure
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   └── features/          # Feature-specific components
├── lib/
│   ├── ai/                # AI integration utilities
│   ├── utils/             # General utilities
│   └── types/             # TypeScript type definitions
├── app/                   # Next.js App Router pages
└── public/                # Static assets
```

### AI Integration Pattern
- Single-agent architecture (MVP) → Multi-agent (future scale)
- Human-in-the-loop validation at critical points
- Progressive enhancement approach

## Framework Integration

### Available Modules
- **iMarketing**: Customer Value Journey, Nuclear Content™, NeuroCopywriting™
- **GrowthX**: Growth Heist™, Niche Fortune™, Funnel Architecture
- **iMBA**: Blue Ocean Strategy, Category Design, Luxury Strategy

### Content Generation Flow
1. User selects framework/content type
2. Conversational data collection
3. AI processing with framework constraints
4. Generated content with editing capabilities
5. Export/save functionality

## User Journey Implementation

### Level 1: Onboarding
- Chatbot-guided setup
- Business information collection
- Knowledge base upload (up to 4 PDFs, ≤30 pages each)
- AI-generated business summary (500 words)

### Level 2: Content Creation
- Framework/content type selection
- Guided creation process (Idea → Hook → Body → CTA → Caption)
- Draft management and versioning
- Template creation for reuse

### Level 3: Performance Integration
- Manual analytics upload (CSV/XLSX)
- Performance linking to generated content
- Basic reporting dashboard

## Pricing Tiers

### Free Tier
- 7-day trial or 500 tokens
- One framework access
- Basic campaign generation

### Standard Plan (৳2,000/month)
- Full onboarding system
- 4 PDF uploads
- Facebook ads + organic content
- 2,000 monthly AI credits
- Basic frameworks

### Pro Plan (৳5,000/month)
- Team workspace
- Ads history import (30+ items)
- Advanced frameworks
- Agency support features
- 5,000 monthly AI credits

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow Next.js 15 App Router patterns
- Implement responsive design (mobile-first)
- Use Tailwind CSS for styling
- Leverage Radix UI for accessible components

### AI Integration
- Implement proper error handling for AI responses
- Add loading states for AI operations
- Include fallback mechanisms for API failures
- Validate AI outputs before presenting to users

### Performance Requirements
- P95 ≤ 10 seconds for complete content generation
- Async processing for file uploads
- Optimistic UI updates where possible
- Proper caching strategies

## Security Considerations
- Input validation for file uploads (MIME type whitelist)
- Prompt injection filtering
- Output validation (banned claims list, content safety)
- Data encryption at rest
- 30-day data retention policy
- Complete audit trail logging

## Testing Strategy
- Unit tests for utility functions
- Integration tests for AI workflows
- E2E tests for critical user journeys
- Performance testing for AI generation speed

## Deployment
- **Platform**: Vercel (recommended)
- **Environment Variables**:
  - `OPENAI_API_KEY`: OpenAI API key
  - `DATABASE_URL`: Database connection string
  - `NEXTAUTH_SECRET`: Authentication secret
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`

## Key Success Metrics
- Onboarding completion rate ≥75%
- Overview approval rate ≥60%
- Time-to-first-draft ≤10 minutes
- Content acceptance rate ≥50%
- Monthly churn rate <5%

## Common Tasks

### Adding New Framework
1. Create framework definition in `lib/frameworks/`
2. Add UI components for framework-specific questions
3. Implement AI prompt engineering for the framework
4. Add framework to user selection interface
5. Update documentation and help text

### Implementing New Content Type
1. Define content structure in types
2. Create generation logic with AI integration
3. Add UI for content creation and editing
4. Implement export functionality
5. Add to main content selection menu

### Performance Optimization
- Implement caching for frequently generated content
- Optimize AI prompt efficiency
- Add request queuing for high load
- Monitor and optimize database queries
- Implement CDN for static assets

## Troubleshooting

### Common Issues
- **AI Generation Timeout**: Check API rate limits, implement retry logic
- **PDF Upload Fails**: Verify file size limits and MIME type validation
- **Slow Performance**: Check database query optimization and caching
- **Build Failures**: Ensure all TypeScript types are properly defined

### Debug Commands
```bash
# Check TypeScript errors
npx tsc --noEmit

# Run linter with auto-fix
pnpm lint --fix

# Check bundle analysis
npx @next/bundle-analyzer

# Database connection test
node scripts/test-db-connection.js
```

## Future Roadmap
- Multi-platform content generation (LinkedIn, YouTube)
- Advanced analytics dashboard
- White-label solutions
- Template marketplace
- Mobile app development

---

*This AGENTS.md file serves as the primary development guide for the Idean AI project. Update regularly as features are implemented and architecture evolves.*