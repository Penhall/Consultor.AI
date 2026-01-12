# Implementation Plan: Consultor.AI - AI-Powered WhatsApp Sales Assistant Platform

**Branch**: `001-project-specs` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-specs/spec.md`

**Note**: This plan covers the complete Consultor.AI platform implementation based on the comprehensive feature specification.

## Summary

Consultor.AI is a production-ready AI-powered WhatsApp sales assistant platform targeting autonomous health plan consultants in Brazil. The platform automates lead qualification through conversational AI flows, generates ANS-compliant personalized recommendations, and provides consultants with a dashboard for lead management and analytics. The MVP (Phase 1) is **100% complete** with 19 pages, 13 API routes, and zero TypeScript errors. This plan focuses on technical implementation details, architecture decisions, and Phase 2+ enhancements.

**Core Value Proposition**: Reduce consultant time spent on initial lead screening by 40% through automated 7-step qualification flows (perfil → idade → coparticipação → AI recommendation) while maintaining compliance with Brazilian health insurance regulations (ANS, LGPD).

**Technical Approach**: Next.js 14 Server Components with TypeScript strict mode, Supabase for PostgreSQL + Auth + RLS, Google Gemini 1.5 Flash for AI generation with ANS compliance filtering, Meta WhatsApp Business API for messaging with HMAC SHA-256 webhook validation, and Upstash Redis for rate limiting.

## Technical Context

**Language/Version**: TypeScript 5.3 with strict mode enabled (tsconfig.json: `strict: true`, `noImplicitAny: true`)
**Primary Dependencies**:
- Next.js 14.2.35 (App Router, React Server Components)
- React 18.x
- Supabase (PostgreSQL 14+, Supabase Auth, Supabase Realtime)
- Google AI SDK (Gemini 1.5 Flash) / Groq SDK (Llama 3.1 70B)
- Tailwind CSS 3.x + shadcn/ui component library
- React Hook Form + Zod (validation schemas)
- React Query (TanStack Query v5) for data fetching/caching
- Upstash Redis for rate limiting
- Meta WhatsApp Business API SDK

**Storage**:
- PostgreSQL 14+ (via Supabase) with Row-Level Security (RLS) policies
- JSONB columns for flexible data (flow definitions, conversation state, lead metadata)
- Encrypted storage for Meta access tokens (AES-256-GCM)
- File uploads via Supabase Storage (profile images, future media attachments)

**Testing**:
- Vitest 1.x for unit and integration tests (test runner)
- React Testing Library for component tests
- Playwright for E2E tests (critical user flows)
- @testing-library/jest-dom for DOM assertions
- MSW (Mock Service Worker) for API mocking

**Target Platform**:
- Web application (Next.js deployed to Vercel)
- Mobile-responsive design (mobile-first approach)
- Browser targets: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- WhatsApp client integration (leads interact via WhatsApp mobile app)

**Project Type**: Web application (Next.js monolith with frontend + backend colocated in `/app` directory)

**Performance Goals**:
- API routes: P95 latency < 500ms (excluding AI generation)
- AI generation: P95 latency < 3 seconds (critical for WhatsApp UX)
- Database queries: P95 latency < 100ms
- Page load: First Contentful Paint (FCP) < 1.5s, Time to Interactive (TTI) < 3.5s
- WhatsApp message delivery: < 5 seconds from user input to bot response
- Build time: < 5 minutes for production builds
- Bundle size: Main bundle < 200KB gzipped, route bundles < 100KB gzipped

**Constraints**:
- LGPD compliance: No collection of CPF, medical records, financial data via WhatsApp
- ANS compliance: AI responses must not include exact pricing, illegal claims, zero waiting period promises
- WhatsApp Business Policy: Respect 24-hour messaging window, opt-in required, no spam
- Supabase free tier limits: 500MB database, 2GB bandwidth, 50k monthly active users
- Meta WhatsApp API rate limits: 1000 messages/day per number (free tier)
- Cost optimization: MVP must operate within free tier limits (Vercel, Supabase, Groq/Gemini)
- Session timeout: 7 days inactivity (Supabase Auth default)
- Conversation timeout: 24 hours inactive before restart offered

**Scale/Scope**:
- MVP Target: 20 active consultants, 500+ leads processed
- Phase 2 Target: 100 consultants, 5,000+ leads
- Database: 5 core entities (Consultant, Lead, Conversation, Message, Flow) + Analytics computed
- API Routes: 13 endpoints (health check, auth, leads CRUD, conversations, analytics, webhook)
- Pages: 19 pages (landing, auth, dashboard, leads, analytics, profile, integrations)
- Components: 20+ React components (shadcn/ui based)
- Flows: 1 default health plan flow (7 steps), extensible to custom flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Code Quality First (Principle I)
- ✅ **TypeScript Strict Mode**: Enabled in `tsconfig.json` with zero `any` types allowed
- ✅ **English for Code**: All code (variables, functions, classes) in English; Portuguese only for UI text
- ✅ **Zero Warnings Policy**: Build must pass with 0 TypeScript errors, 0 ESLint warnings
- ✅ **Immutable Patterns**: React state updates use spread operators, array operations use map/filter/reduce
- ✅ **Error Handling**: All async operations have try-catch blocks, custom error classes (ValidationError, NotFoundError, UnauthorizedError)

### Test-Driven Development (Principle II)
- ✅ **Minimum Coverage**: 80% overall, 90% unit tests (tracked via Vitest coverage)
- ✅ **Testing Pyramid**: 60% unit (services, utils), 30% integration (API routes), 10% E2E (critical flows)
- ✅ **Test Frameworks**: Vitest + React Testing Library + Playwright configured
- ✅ **Test Structure**: Organized in `tests/unit/`, `tests/integration/`, `tests/e2e/`
- ✅ **Mock External Services**: Supabase, Groq/Gemini, WhatsApp API mocked in tests
- ✅ **CI/CD Integration**: GitHub Actions runs tests on every PR, blocks deployment on failure

### User Experience Consistency (Principle III)
- ✅ **Portuguese UI**: All user-facing text in Brazilian Portuguese (buttons, labels, errors)
- ✅ **Accessibility**: Semantic HTML (nav, main, section), ARIA labels, keyboard navigation
- ✅ **Design System**: shadcn/ui components + Tailwind CSS for consistent styling
- ✅ **Loading States**: Skeleton screens, loading indicators, immediate user feedback
- ✅ **Error Messages**: User-friendly Portuguese errors, technical details logged to console
- ✅ **Mobile-First**: Responsive layouts, touch targets 44×44px minimum

### Performance and Scalability (Principle IV)
- ✅ **API Response Times**: P95 < 500ms API routes, < 3s AI generation, < 100ms DB queries
- ✅ **Build Optimization**: Code splitting, tree-shaking, dynamic imports for heavy components
- ✅ **Image Optimization**: Next.js Image component, WebP format, lazy loading
- ✅ **Database Performance**: Composite indexes on (consultant_id, status), (consultant_id, created_at)
- ✅ **Caching Strategy**: React Query 1-minute stale time, Upstash Redis for rate limiting
- ✅ **Bundle Size**: Main < 200KB gzipped, routes < 100KB gzipped

### Security and Compliance (Principle V)
- ✅ **Authentication**: Supabase Auth with JWT tokens in httpOnly cookies
- ✅ **Authorization**: Row-Level Security (RLS) policies on all tables
- ✅ **Input Validation**: Zod schemas for all API inputs, sanitized user data
- ✅ **LGPD Compliance**: No CPF/medical data collection, audit logs, 90-day lead retention
- ✅ **ANS Compliance**: AI prompt engineering + post-generation regex validation for prohibited content
- ✅ **WhatsApp Policy**: 24-hour window enforcement, HMAC SHA-256 webhook signature validation
- ✅ **Secrets Management**: Environment variables, AES-256-GCM encrypted Meta tokens

### Architecture and Modularity (Principle VI)
- ✅ **Server Components Default**: React Server Components for all pages, Client Components only for interactivity
- ✅ **Layer Separation**: Components → Hooks → API Routes → Services → Supabase
- ✅ **Service Layer Pattern**: Business logic in `lib/services/` (lead-service, ai-service, analytics-service)
- ✅ **Flow Engine Modularity**: Separate parser, state manager, executors for each step type
- ✅ **API Route Structure**: (1) Auth, (2) Validation, (3) Service call, (4) Authorization check, (5) Response
- ✅ **Database Access**: Supabase client for simple queries, RPC for complex transactions
- ✅ **Integration Wrappers**: Meta client (`lib/whatsapp/meta-client.ts`), AI client (`lib/ai/gemini.ts`)

### Documentation and Maintainability (Principle VII)
- ✅ **JSDoc Comments**: All public functions have JSDoc with params, returns, throws, examples
- ✅ **Portuguese Business Logic**: User stories, acceptance criteria in Portuguese; tech specs in English
- ✅ **README Files**: Each major directory (`lib/`, `components/`, `app/`) has README.md
- ✅ **Inline Comments**: Complex logic explained with "why" comments, not "what" comments
- ✅ **Type Documentation**: Complex types (FlowDefinition, ConversationState) have inline comments
- ✅ **Commit Messages**: Conventional Commits format (feat/fix/docs/refactor with scope)
- ✅ **CHANGELOG**: Maintained with all notable changes per version (Keep a Changelog format)

### Development Workflow (Principle VIII)
- ✅ **Branch Naming**: `feature/`, `fix/`, `hotfix/`, `docs/` prefixes
- ✅ **Pull Request Requirements**: Tests pass, no lint errors, code review approval, docs updated
- ✅ **Code Review Checklist**: Functionality, quality, performance, security, testing, documentation
- ✅ **Git Workflow**: Feature branches from `main`, squash commits on merge, delete after merge
- ✅ **Local Testing**: Git hooks run `npm run lint && npm run type-check && npm test` pre-commit
- ✅ **CI/CD Pipeline**: GitHub Actions runs full test suite + build on every PR

### Constitution Violations
**None identified.** All 8 core principles are satisfied by the existing architecture and implementation standards. No complexity justifications needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-specs/
├── plan.md                  # This file (/speckit.plan command output)
├── spec.md                  # Feature specification (already created)
├── research.md              # Phase 0 output (to be generated)
├── data-model.md            # Phase 1 output (to be generated)
├── quickstart.md            # Phase 1 output (to be generated)
├── contracts/               # Phase 1 output (to be generated)
│   ├── openapi.yaml         # OpenAPI 3.0 spec for all API routes
│   ├── leads-api.md         # Lead management endpoints documentation
│   ├── conversations-api.md # Conversation endpoints documentation
│   ├── analytics-api.md     # Analytics endpoints documentation
│   └── webhook-api.md       # WhatsApp webhook specification
├── checklists/              # Quality checklists (already created)
│   └── requirements.md      # Specification quality checklist (passed)
└── tasks.md                 # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
Consultor.AI/
├── .rules/                          # Development guidelines (READ THESE!)
│   ├── development-standards.md
│   ├── coding-guidelines.md
│   ├── architecture-rules.md
│   └── testing-standards.md
│
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── api/                     # API Routes (13 endpoints)
│   │   │   ├── analytics/           # Analytics endpoints
│   │   │   │   ├── overview/route.ts
│   │   │   │   ├── charts/route.ts
│   │   │   │   └── activity/route.ts
│   │   │   ├── consultants/
│   │   │   │   └── meta-callback/route.ts
│   │   │   ├── conversations/       # Conversation management
│   │   │   │   ├── start/route.ts
│   │   │   │   └── [id]/message/route.ts
│   │   │   ├── health/route.ts      # Health check
│   │   │   ├── leads/               # Lead CRUD
│   │   │   │   ├── route.ts         # GET/POST
│   │   │   │   ├── [id]/route.ts    # GET/PATCH/DELETE
│   │   │   │   └── stats/route.ts
│   │   │   └── webhook/
│   │   │       └── meta/[consultantId]/route.ts
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/               # Dashboard pages
│   │   │   ├── analytics/page.tsx
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── perfil/
│   │   │   │   ├── page.tsx
│   │   │   │   └── whatsapp/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Landing page
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/                  # React components
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── dashboard/
│   │   │   ├── metric-card.tsx
│   │   │   ├── bar-chart.tsx
│   │   │   ├── pie-chart.tsx
│   │   │   └── recent-leads-table.tsx
│   │   ├── leads/
│   │   │   ├── lead-list.tsx
│   │   │   ├── lead-card.tsx
│   │   │   └── lead-detail.tsx
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── alert.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── [30+ components]
│   │   ├── whatsapp/
│   │   │   └── MetaConnectButton.tsx
│   │   └── providers.tsx
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAnalytics.ts
│   │   ├── useAuth.ts
│   │   ├── useLeads.ts
│   │   └── useMetaSignup.ts
│   │
│   ├── lib/                         # Core libraries & utilities
│   │   ├── ai/
│   │   │   └── gemini.ts            # Google AI integration
│   │   ├── api/
│   │   │   └── google-ai.ts         # AI API wrapper
│   │   ├── encryption/
│   │   │   ├── index.ts
│   │   │   └── encryption.test.ts
│   │   ├── flow-engine/             # Flow Engine (core architecture)
│   │   │   ├── types.ts             # FlowDefinition, ConversationState, Step types
│   │   │   ├── parser.ts            # Flow JSON parser/validator
│   │   │   ├── state-manager.ts     # Conversation state management
│   │   │   ├── executors.ts         # Step executors (message/choice/action)
│   │   │   ├── engine.ts            # Main flow engine orchestrator
│   │   │   └── index.ts
│   │   ├── services/                # Service Layer (business logic)
│   │   │   ├── analytics-service.ts # Analytics metrics & charts
│   │   │   ├── ai-service.ts        # AI response generation with ANS compliance
│   │   │   ├── lead-auto-create.ts  # Auto-create leads from WhatsApp
│   │   │   └── lead-service.ts      # Lead CRUD operations
│   │   ├── supabase/
│   │   │   ├── client.ts            # Client-side Supabase (SSR)
│   │   │   ├── server.ts            # Server-side Supabase
│   │   │   ├── middleware.ts        # Auth middleware
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   ├── validations/             # Zod Schemas
│   │   │   └── lead.ts
│   │   ├── whatsapp/
│   │   │   ├── meta-client.ts       # Meta API client wrapper
│   │   │   └── webhook-validation.ts # HMAC + signature validation
│   │   └── utils.ts
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── database.ts              # Generated from Supabase schema
│   │   └── api.ts
│   │
│   ├── middleware.ts                # Next.js middleware (auth)
│   └── styles/
│       └── globals.css
│
├── supabase/                        # Supabase configuration
│   ├── functions/                   # Edge Functions (future)
│   ├── migrations/                  # Database migrations
│   │   ├── 20251217000001_initial_schema.sql
│   │   └── 20251217000002_rls_policies.sql
│   ├── seed/                        # Seed data
│   │   ├── default-health-flow.json # Default health qualification flow
│   │   └── seed.sql
│   └── config.toml
│
├── tests/                           # Test files
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── flow-engine/
│   │   │   │   ├── executor.test.ts
│   │   │   │   ├── parser.test.ts
│   │   │   │   └── state-manager.test.ts
│   │   │   ├── services/
│   │   │   │   ├── lead-service.test.ts
│   │   │   │   └── ai-service.test.ts
│   │   │   └── utils/
│   │   │       └── formatters.test.ts
│   │   └── hooks/
│   │       ├── useLeads.test.ts
│   │       └── useAuth.test.ts
│   ├── integration/
│   │   ├── api/
│   │   │   ├── leads.test.ts
│   │   │   └── conversations.test.ts
│   │   └── services/
│   │       └── lead-service.test.ts
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── lead-qualification.spec.ts
│   │   └── dashboard.spec.ts
│   ├── fixtures/
│   │   ├── leads.ts
│   │   ├── flows.ts
│   │   └── consultants.ts
│   ├── mocks/
│   │   ├── supabase.ts
│   │   ├── groq.ts
│   │   └── whatsapp.ts
│   └── setup.ts
│
├── public/                          # Static assets
├── docs/                            # Technical documentation
│   ├── guides/
│   │   ├── WHATSAPP-EMBEDDED-SIGNUP.md
│   │   ├── DOCKER-SETUP.md
│   │   └── SUPABASE-MIGRATION.md
│   ├── technical/
│   │   ├── SRS-Software-Requirements-Specification.md
│   │   └── Implementation-Plan.md
│   ├── architecture/
│   │   ├── SAD-System-Architecture-Document.md
│   │   └── Database-Design-Document.md
│   └── api/
│       └── API-Specification.md
│
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── CLAUDE.md                        # Project overview for Claude Code
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

**Structure Decision**: **Option 2 - Web Application (Next.js Monolith)**.

Rationale: Next.js 14 App Router colocates frontend and backend in the `/app` directory, eliminating the need for separate `frontend/` and `backend/` directories. This monolithic approach simplifies:
- **Development**: Single codebase, unified TypeScript types, shared utilities
- **Deployment**: Single Vercel deployment for both UI and API routes
- **Data Flow**: Server Components can directly query Supabase without API round-trips
- **Type Safety**: Full stack TypeScript with shared types between frontend and backend

The `/src/app` directory contains:
- **Pages** (Server Components by default) - `page.tsx` files
- **API Routes** - `route.ts` files in `/api` subdirectories
- **Layouts** - `layout.tsx` for shared UI structure
- **Error Boundaries** - `error.tsx` for graceful error handling

This structure aligns with Next.js 14 best practices and the constitution's principle of server-first architecture.

## Complexity Tracking

**No violations identified.** All constitution principles are satisfied:
- Single web application project (no unnecessary multi-project complexity)
- Direct Supabase client access in Server Components (no repository pattern overhead)
- Service layer for business logic only (not for every database query)
- Standard Next.js App Router patterns (no custom framework abstractions)
- Minimal dependencies (only essential libraries for AI, auth, styling, testing)

**Justification for Chosen Complexity**:
1. **Flow Engine (4 modules)**: Required abstraction to support JSON-driven conversation flows with extensible step types. Direct approach would couple conversation logic to UI components, making flows non-customizable.
2. **Service Layer**: Isolates business logic (lead scoring, AI compliance filtering) from API routes to enable unit testing and reuse across multiple endpoints.
3. **Multiple AI Providers (Gemini + Groq)**: Mitigation strategy for AI service outages; fallback provider ensures 99.5% uptime target.

---

## Phase 0: Research & Unknowns Resolution

**Status**: ✅ **NOT REQUIRED** - All technical context is fully specified.

**Analysis**: The specification provides complete technical details with zero "NEEDS CLARIFICATION" markers. All technology choices, architecture patterns, and integration strategies are explicitly defined:

### Resolved Technical Decisions

1. **AI Provider Selection**: Google Gemini 1.5 Flash (primary) with Groq Llama 3.1 70B (fallback)
   - **Decision**: Dual-provider strategy for 99.5% uptime
   - **Rationale**: Gemini offers better Brazilian Portuguese support; Groq provides cost-effective fallback
   - **Alternatives considered**: OpenAI GPT-4 (rejected due to higher cost), Claude (rejected due to rate limits)

2. **WhatsApp Integration Method**: Meta Embedded Signup (3-click connection)
   - **Decision**: Meta's official Embedded Signup flow
   - **Rationale**: Simplifies consultant onboarding, no manual token management required
   - **Alternatives considered**: Manual WhatsApp Business API token input (rejected - poor UX), 360dialog proxy (rejected - adds dependency)

3. **Database Schema Design**: PostgreSQL with JSONB for flexible data
   - **Decision**: Relational tables for core entities, JSONB for variable data (flow definitions, conversation state, lead metadata)
   - **Rationale**: JSONB enables schema evolution without migrations while maintaining ACID guarantees
   - **Alternatives considered**: MongoDB (rejected - no RLS support), separate document store (rejected - adds complexity)

4. **Authentication Strategy**: Supabase Auth with Row-Level Security
   - **Decision**: Supabase Auth + JWT tokens + RLS policies on all tables
   - **Rationale**: RLS enforces authorization at database level, preventing data leakage bugs
   - **Alternatives considered**: Custom JWT implementation (rejected - reinventing wheel), Clerk (rejected - cost), Auth0 (rejected - overkill)

5. **Real-Time Updates**: React Query polling (1-minute stale time)
   - **Decision**: React Query with 1-minute stale time for dashboard data
   - **Rationale**: Acceptable latency for analytics, avoids WebSocket complexity
   - **Alternatives considered**: Supabase Realtime (rejected - unnecessary for analytics), WebSockets (rejected - adds infrastructure)

6. **Rate Limiting Implementation**: Upstash Redis
   - **Decision**: Redis-based token bucket algorithm (10 req/10s per IP)
   - **Rationale**: Distributed rate limiting across Vercel edge functions
   - **Alternatives considered**: In-memory rate limiting (rejected - doesn't work across edge nodes), Vercel Edge Config (rejected - limited throughput)

7. **Error Monitoring**: Sentry or Better Stack
   - **Decision**: Defer to deployment phase (Phase 2+)
   - **Rationale**: MVP can use console logging; production monitoring added post-launch
   - **Alternatives considered**: N/A - deferred decision

8. **CI/CD Pipeline**: GitHub Actions
   - **Decision**: GitHub Actions for test/lint/build on every PR
   - **Rationale**: Native GitHub integration, free for public repos
   - **Alternatives considered**: GitLab CI (rejected - not using GitLab), CircleCI (rejected - adds cost)

### Best Practices Research (Completed)

All technology choices follow established best practices:

- **Next.js 14**: App Router with Server Components (official recommendation)
- **Supabase**: RLS policies for multi-tenant authorization (official best practice)
- **TypeScript**: Strict mode with no `any` types (industry standard)
- **Testing**: Testing Pyramid (60/30/10 split) from Martin Fowler
- **Zod**: Schema validation at API boundaries (official Zod documentation pattern)
- **React Query**: Stale-while-revalidate caching strategy (TanStack Query best practice)
- **Tailwind CSS**: Utility-first styling (official Tailwind recommendation)
- **Conventional Commits**: Structured commit messages for changelog automation

**Output**: No `research.md` file needed. All decisions documented inline above.

---

## Phase 1: Design & Contracts

### Architecture Decisions

#### 1. Flow Engine Architecture

**Problem**: Support JSON-driven conversation flows with three step types (mensagem, escolha, executar) that are customizable by consultants and extensible for future flow types.

**Solution**: Modular flow engine with separation of concerns:

```typescript
// lib/flow-engine/types.ts
export interface FlowDefinition {
  id: string;
  name: string;
  version: string;
  steps: Step[];
}

export type Step = MessageStep | ChoiceStep | ExecuteStep;

export interface MessageStep {
  id: string;
  tipo: 'mensagem';
  conteudo: string; // Supports {{variables}}
  proxima: string | null;
}

export interface ChoiceStep {
  id: string;
  tipo: 'escolha';
  conteudo: string; // Question text
  opcoes: Array<{ texto: string; valor: string; proxima: string }>;
}

export interface ExecuteStep {
  id: string;
  tipo: 'executar';
  acao: 'gerar_resposta_ia' | 'calcular_score' | 'enviar_webhook';
  parametros?: Record<string, any>;
  proxima: string | null;
}

export interface ConversationState {
  conversationId: string;
  leadId: string;
  flowId: string;
  currentStepId: string;
  responses: Record<string, any>; // Keyed by step ID
  context: Record<string, any>; // Variables for template substitution
  createdAt: string;
  updatedAt: string;
}
```

**Components**:
1. **Parser** (`parser.ts`): Validates flow JSON against schema, checks for cycles, ensures all `proxima` references exist
2. **State Manager** (`state-manager.ts`): Persists/retrieves conversation state to/from Supabase, handles atomic updates
3. **Executors** (`executors.ts`): One executor per step type implementing `StepExecutor` interface
4. **Engine** (`engine.ts`): Orchestrates flow execution, calls appropriate executor based on step type

**Extension Pattern**: New step types (e.g., `condicional` for branching logic) added by:
1. Adding type to `Step` union
2. Implementing `StepExecutor` interface
3. Registering executor in engine's executor map

#### 2. API Route Structure (Standard Pattern)

All API routes follow this structure:

```typescript
// app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getLeadById } from '@/lib/services/lead-service';
import { leadUpdateSchema } from '@/lib/validations/lead';

// 1. Authentication
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Input Validation
    const body = await request.json();
    const validatedData = leadUpdateSchema.parse(body);

    // 3. Business Logic (via Service)
    const updatedLead = await updateLead(params.id, validatedData, user.id);

    // 4. Authorization Check (implicit via RLS + user.id passed to service)
    // RLS policy ensures user can only update their own leads

    // 5. Response
    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error) {
    // Error Handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('PATCH /api/leads/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3. Webhook Processing Architecture

**Challenge**: WhatsApp webhooks must respond within 5 seconds, but AI generation takes up to 3 seconds.

**Solution**: Async processing pattern:

```typescript
// app/api/webhook/meta/[consultantId]/route.ts
export async function POST(request: NextRequest, { params }: { params: { consultantId: string } }) {
  try {
    // 1. Immediate signature validation (reject invalid requests fast)
    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();

    if (!validateWebhookSignature(signature, body, META_APP_SECRET)) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    // 2. Parse webhook payload
    const payload = JSON.parse(body);

    // 3. Respond immediately with 200 OK (Meta requires < 5s response)
    const response = NextResponse.json({ success: true });

    // 4. Process webhook asynchronously (don't await)
    processWebhookAsync(params.consultantId, payload).catch(error => {
      console.error('Webhook processing failed:', error);
      // Log to monitoring service (Sentry)
    });

    return response;
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

async function processWebhookAsync(consultantId: string, payload: any) {
  // 1. Extract message details
  const { from, text, messageId } = extractMessageData(payload);

  // 2. Check idempotency (prevent duplicate processing)
  const exists = await checkMessageProcessed(messageId);
  if (exists) return;

  // 3. Auto-create lead if new number
  let lead = await findLeadByWhatsApp(consultantId, from);
  if (!lead) {
    lead = await createLead(consultantId, from);
  }

  // 4. Get conversation state
  const conversation = await getOrCreateConversation(lead.id);

  // 5. Execute flow engine
  const flow = await getActiveFlow(consultantId);
  const result = await executeFlowStep(flow, conversation, text);

  // 6. Send response via WhatsApp API
  await sendWhatsAppMessage(from, result.message, consultantId);

  // 7. Update conversation state
  await updateConversationState(conversation.id, result.newState);
}
```

#### 4. AI Response Generation with Compliance

**Challenge**: Generate personalized responses while ensuring ANS compliance (no exact pricing, no illegal claims).

**Solution**: Two-layer validation:

```typescript
// lib/services/ai-service.ts
export async function generateCompliantResponse(
  leadData: LeadQualificationData,
  consultantBio: string
): Promise<string> {
  // 1. Construct compliance-aware prompt
  const prompt = `
Você é um assistente de vendas para ${consultantBio}.

DADOS DO LEAD:
- Perfil: ${leadData.perfil}
- Idade: ${leadData.idade}
- Coparticipação: ${leadData.coparticipacao}

INSTRUÇÕES DE COMPLIANCE (OBRIGATÓRIAS):
1. NÃO mencione valores exatos de planos (ex: "R$ 500/mês")
2. NÃO faça promessas ilegais (ex: "zero carência", "cobertura imediata")
3. NÃO solicite dados sensíveis (ex: CPF, histórico médico)
4. Mantenha tom empático, claro e confiável
5. Limite: 80 palavras

ESTRUTURA DA RESPOSTA:
1. Validação empática das informações recebidas
2. 1-2 recomendações realistas de tipos de plano (SEM PREÇOS)
3. Call-to-action claro

Gere a resposta:
  `.trim();

  // 2. Call AI provider (with fallback)
  let response: string;
  try {
    response = await callGemini(prompt);
  } catch (error) {
    console.warn('Gemini failed, falling back to Groq:', error);
    response = await callGroq(prompt);
  }

  // 3. Post-generation compliance validation (regex patterns)
  const violations = detectComplianceViolations(response);

  if (violations.length > 0) {
    console.error('Compliance violations detected:', violations);
    // Log to monitoring + fall back to template
    return getFallbackResponse(leadData.perfil);
  }

  return response;
}

function detectComplianceViolations(response: string): string[] {
  const violations: string[] = [];

  // Check for exact pricing (R$ followed by numbers)
  if (/R\$\s*\d+/i.test(response)) {
    violations.push('Contains exact pricing');
  }

  // Check for illegal claims
  const illegalPhrases = [
    /zero carência/i,
    /sem carência/i,
    /cobertura imediata/i,
    /aprovação garantida/i,
  ];

  for (const pattern of illegalPhrases) {
    if (pattern.test(response)) {
      violations.push(`Contains illegal claim: ${pattern.source}`);
    }
  }

  // Check for sensitive data requests
  const sensitiveDataRequests = [
    /cpf/i,
    /rg/i,
    /histórico médico/i,
    /doenças pré-existentes/i,
  ];

  for (const pattern of sensitiveDataRequests) {
    if (pattern.test(response)) {
      violations.push(`Requests sensitive data: ${pattern.source}`);
    }
  }

  return violations;
}
```

#### 5. Database Indexing Strategy

**Problem**: With RLS enabled, Supabase performs authorization checks on every query. Optimize for consultant-scoped queries.

**Solution**: Composite indexes on (consultant_id, other_column):

```sql
-- supabase/migrations/20251217000003_performance_indexes.sql

-- Lead queries by consultant + status
CREATE INDEX idx_leads_consultant_status
ON leads (consultant_id, status);

-- Lead queries by consultant + created_at (for recent leads)
CREATE INDEX idx_leads_consultant_created
ON leads (consultant_id, created_at DESC);

-- Conversation queries by lead (for conversation history)
CREATE INDEX idx_conversations_lead
ON conversations (lead_id, created_at DESC);

-- Message queries by conversation (for chat history)
CREATE INDEX idx_messages_conversation
ON messages (conversation_id, created_at ASC);

-- Flow queries by consultant + active status
CREATE INDEX idx_flows_consultant_active
ON flows (consultant_id, is_active);

-- WhatsApp number uniqueness within consultant scope
CREATE UNIQUE INDEX idx_leads_consultant_whatsapp
ON leads (consultant_id, whatsapp_number);
```

---

**(Continuing with data-model.md, contracts/, and quickstart.md generation in next message due to length...)**
