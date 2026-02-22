# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Consultor.AI** (also known as HealthBot/VendaFácil AI) is an AI-powered WhatsApp assistant designed to help autonomous salespeople automate lead capture, qualification, and nurturing. The platform targets two initial verticals:

1. **Health plan consultants** - Automated triaging of leads based on profile, age, and coparticipation preferences
2. **Real estate agents** - Property qualification and recommendation (planned expansion)

The system combines conversational AI with personalized content generation to create a 24/7 virtual sales assistant that maintains the consultant's voice and personality.

---

## Current Status

**Fase Atual:** MVP (Fases 1-3) ✅ | SaaS Billing & Admin ✅ | **Tudo mergeado em `main`**
**Última Atualização:** 2026-02-11
**Versão:** 0.4.0
**Branch Atual:** `main`
**Status:** Production Ready - SaaS Platform Completa

### Core Platform (Branch `001-project-specs`) ✅

**Core Features**:

- ✅ **CRUD Completo de Leads**: Criação, leitura, atualização, exclusão com validação Zod
- ✅ **Flow Engine Conversacional**: Parser, State Manager, Executors para fluxos JSON
- ✅ **Integração WhatsApp Business**: Meta Cloud API com mensagens interativas (botões/listas)
- ✅ **Geração de Respostas com IA**: Google Gemini 1.5 Flash com compliance ANS
- ✅ **Dashboard Analytics**: 6 métricas em tempo real + gráficos (pie/bar) + tabelas
- ✅ **Fluxo Padrão de Saúde**: 7 passos de qualificação (perfil → idade → coparticipação)
- ✅ **Sistema de Scores**: Cálculo automático baseado em respostas
- ✅ **Auto-criação de Leads**: Leads criados automaticamente via WhatsApp
- ✅ **Sistema de Follow-ups**: Agendamento automático e manual de follow-ups
- ✅ **Exportação CSV**: Export de leads com filtros e BOM UTF-8
- ✅ **CRM Integrations**: RD Station, Pipedrive (HubSpot/Agendor planned)

### SaaS Billing & Admin (Branch `002-saas-billing-admin`) ✅

- ✅ **Stripe Billing**: Checkout, customer portal, webhook handling
- ✅ **Credit System**: Atomic credit operations, monthly reset via pg_cron
- ✅ **Subscription Plans**: Freemium (20) / Pro (200) / Agência (1000) credits
- ✅ **Admin Dashboard**: SaaS metrics, user management, daily stats
- ✅ **File Upload**: Supabase Storage with presigned URLs, 10MB limit
- ✅ **Email System**: Resend provider + console fallback for dev
- ✅ **Landing Page**: Hero, features, testimonials, FAQ, footer sections
- ✅ **LGPD Cookie Consent**: Banner with localStorage persistence
- ✅ **OAuth**: Google & GitHub social login

### Infrastructure

- ✅ **Build Pipeline**: Next.js builds successfully (0 erros TypeScript)
- ✅ **Supabase Integration**: Client SSR + Server + Middleware configurados
- ✅ **Database Schema**: RLS policies ativas, migrations aplicadas
- ✅ **Encryption**: Tokens criptografados com AES-256-GCM
- ✅ **Webhook Validation**: HMAC SHA-256 (Meta) + Stripe signatures
- ✅ **Monitoring**: Logger, Performance Tracking, Sentry Integration
- ✅ **Performance**: Skeleton loading, React Query caching, optimized hooks
- ✅ **Bundle Analyzer**: Otimização de bundle configurada
- ✅ **CI/CD**: GitHub Actions + Husky pre-commit/pre-push hooks

### Test Status

- ✅ **34 test files** | **319 tests** (all passing)
- ✅ **30 test suites** | **298 unit tests** passing
- ✅ **0 TypeScript errors** in production code
- ✅ Covers: services, components, API routes, billing, admin, E2E flows

### Próxima Fase 📋

**Fase 5 - Expansão** (Futuro):

- [ ] Segundo Vertical (Imóveis)
- [ ] HubSpot & Agendor Providers
- [ ] Voice Cloning (ElevenLabs)
- [ ] Image Generation (Canva API)
- [ ] Mobile App

### Especificações do Projeto 📋

**Spec 001** - `specs/001-project-specs/` (Core Platform):

| Arquivo                      | Descrição                                       | Status      |
| ---------------------------- | ----------------------------------------------- | ----------- |
| `spec.md`                    | Especificação completa (7 user stories, 55 FRs) | ✅ Completo |
| `plan.md`                    | Plano de implementação técnico                  | ✅ Completo |
| `tasks.md`                   | 100 tasks organizadas por user story            | ✅ Completo |
| `checklists/requirements.md` | Checklist de qualidade                          | ✅ Aprovado |

**Spec 002** - `specs/002-saas-billing-admin/` (SaaS Billing & Admin):

| Arquivo         | Descrição                                         | Status      |
| --------------- | ------------------------------------------------- | ----------- |
| `spec.md`       | Especificação (10 user stories, 42 FRs)           | ✅ Completo |
| `plan.md`       | Plano técnico (Stripe, Resend, pg_cron)           | ✅ Completo |
| `data-model.md` | Schema (5 novas tabelas, 9 campos em consultants) | ✅ Completo |

---

## Tech Stack

### Core Technologies

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript 5.3
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Realtime + Storage)
- **State Management**: React Query + Zustand (minimal)
- **Forms**: React Hook Form + Zod validation
- **AI**: Google AI (Gemini 1.5 Flash)
- **Payments**: Stripe (checkout, subscriptions, webhooks)
- **Email**: Resend (transactional) + React Email (templates)
- **WhatsApp**: Meta Business API (360dialog via Weni Cloud)
- **Caching**: Redis (Upstash)
- **Scheduled Jobs**: pg_cron (daily stats, monthly credit reset)
- **Testing**: Vitest + Testing Library + Playwright
- **Deployment**: Docker + Vercel (frontend) + Supabase (backend)
- **Monitoring**: Sentry + structured logging

---

## Project Structure

### Current Directory Layout

```
Consultor.AI/
├── .rules/                          # Development guidelines v2.0 (READ THESE!)
│   ├── development-standards.md     # Code standards, SaaS billing, file upload, email
│   ├── coding-guidelines.md         # TypeScript, React, ServiceResult, Strategy patterns
│   ├── architecture-rules.md        # Architecture, admin panel, pg_cron, LGPD
│   └── testing-standards.md         # Testing, SaaS test patterns, mock strategies
│
├── specs/                           # Feature specifications
│   ├── 001-project-specs/           # Core platform spec (7 stories, 55 FRs)
│   └── 002-saas-billing-admin/      # SaaS billing spec (10 stories, 42 FRs)
│
├── docs/                            # Technical documentation
│   ├── guides/                      # Setup guides, tutorials, fixes
│   ├── technical/                   # SRS, Implementation Plan
│   ├── architecture/                # SAD, Database Design
│   └── api/                         # API Specification
│
├── scripts/                         # Utility scripts
│
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── api/                     # API routes
│   │   │   ├── admin/               # ⭐ Admin API (stats, users)
│   │   │   ├── analytics/           # Analytics endpoints
│   │   │   ├── billing/             # ⭐ Stripe (checkout, portal, webhook)
│   │   │   ├── contact/             # ⭐ Contact form
│   │   │   ├── consultants/         # Meta OAuth callback
│   │   │   ├── conversations/       # Conversation management
│   │   │   ├── files/               # ⭐ File upload/download
│   │   │   ├── health/              # Health check
│   │   │   ├── integrations/crm/    # CRM integration routes
│   │   │   ├── leads/               # Lead CRUD + stats + export
│   │   │   └── webhook/meta/        # WhatsApp webhook handler
│   │   ├── admin/                   # ⭐ Admin panel pages
│   │   ├── auth/                    # Authentication pages
│   │   ├── dashboard/               # Consultant dashboard pages
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Landing page
│   │
│   ├── components/                  # React components
│   │   ├── admin/                   # ⭐ Admin (guard, sidebar, charts, tables)
│   │   ├── auth/                    # Login/signup forms
│   │   ├── billing/                 # ⭐ Pricing, checkout, credits display
│   │   ├── cookie-consent/          # ⭐ LGPD cookie banner
│   │   ├── dashboard/               # Dashboard widgets
│   │   ├── integrations/            # CRM integration components
│   │   ├── landing/                 # ⭐ Hero, features, testimonials, FAQ, footer
│   │   ├── ui/                      # shadcn/ui base components
│   │   ├── whatsapp/                # WhatsApp components
│   │   └── providers.tsx            # React Query provider
│   │
│   ├── lib/                         # Core libraries & utilities
│   │   ├── ai/                      # Google AI (Gemini) integration
│   │   ├── email/                   # ⭐ Email provider (Resend) & templates
│   │   ├── encryption/              # AES-256-GCM encryption
│   │   ├── flow-engine/             # Conversation flow engine
│   │   ├── monitoring/              # Logger, performance, Sentry
│   │   ├── payment/                 # ⭐ Stripe processor & plan definitions
│   │   ├── services/                # Business logic services
│   │   │   ├── analytics-service.ts
│   │   │   ├── ai-service.ts
│   │   │   ├── billing-service.ts   # ⭐ Subscription & credit management
│   │   │   ├── crm-service.ts
│   │   │   ├── lead-service.ts
│   │   │   ├── stats-service.ts     # ⭐ Daily stats calculation
│   │   │   └── crm-providers/       # RD Station, Pipedrive
│   │   ├── supabase/                # Client, server, middleware
│   │   ├── validations/             # Zod schemas
│   │   └── whatsapp/                # Meta API client & webhook validation
│   │
│   ├── types/                       # TypeScript definitions
│   ├── hooks/                       # Custom React hooks
│   ├── middleware.ts                # Next.js auth middleware
│   └── styles/globals.css
│
├── supabase/
│   ├── migrations/                  # Database migrations (10+ files)
│   └── seed/                        # Seed data (flows, SQL)
│
├── tests/                           # 34 test files, 319 tests
│   ├── unit/                        # Unit tests (.test.ts)
│   ├── integration/                 # Integration tests (.test.ts)
│   ├── e2e/                         # E2E tests (.spec.ts)
│   ├── fixtures/                    # Reusable test data
│   └── mocks/                       # Mock clients (Supabase, Stripe, Resend)
│
└── [Root config files]              # Docker, Next.js, TS, Vitest, Playwright, etc.
```

### 🧹 Root Directory Organization

**CRITICAL**: Keep the root directory clean. See `.rules/development-standards.md` Section 0 for complete rules.

- Configuration files (ESLint, Prettier, Vitest, Playwright, Tailwind) → Root (required by tools)
- Docker files (compose, Dockerfile) → Root (source of truth)
- Setup guides → `docs/guides/`
- Scripts → `scripts/`
- ❌ Never create `SETUP.md`, `NOTES.md`, `deploy.sh` in root

---

## Development Guidelines

### 📖 **IMPORTANT: Read `.rules/` First!**

Before writing any code, familiarize yourself with the guidelines in `.rules/`:

1. **`.rules/development-standards.md`** (v2.0)
   - **Language Rules**: English for code, Portuguese for docs/UI
   - **Code Organization**: Project structure, naming conventions
   - **TypeScript Standards**: Strict mode, type safety
   - **React/Next.js Patterns**: Server vs Client components
   - **Supabase Patterns**: Queries, RLS, real-time
   - **API Development**: Route structure, error handling
   - **Security**: Input validation, XSS/SQL injection prevention
   - **Git Workflow**: Branches, commits, PR templates
   - **SaaS & Billing Standards**: Credit operations, subscription lifecycle, lead limits
   - **File Upload & Storage**: Allowed types, presigned URLs, storage keys
   - **Email & Notifications**: Provider pattern, templates, dev fallback

2. **`.rules/coding-guidelines.md`** (v2.0)
   - **Naming Conventions**: camelCase, PascalCase, UPPER_SNAKE_CASE
   - **Function Signatures**: Clear types, JSDoc comments
   - **React Patterns**: Props, hooks, conditional rendering
   - **Supabase Queries**: Organized in service functions
   - **ServiceResult Pattern**: Discriminated union for all services
   - **Strategy Pattern**: PaymentProcessor, EmailProvider interfaces
   - **Supabase Type Workarounds**: `.select()` cast, `.from() as any`, `.rpc as any`
   - **Error Handling**: Custom error classes, logging
   - **Common Pitfalls**: `storage_key`, admin `status` field, FileList null checks, atomic credits

3. **`.rules/architecture-rules.md`** (v2.0)
   - **Service Layer Pattern**: ServiceResult convention
   - **Flow Engine Architecture**: Conversation execution
   - **Strategy Pattern**: External services (Stripe, Resend)
   - **Webhook Handler Pattern**: Signature verification, fast ack
   - **Admin Panel Architecture**: Role-based access (`is_admin`), admin guard
   - **Scheduled Jobs**: pg_cron for daily stats & monthly credit reset
   - **File Storage Architecture**: Presigned URLs, user isolation
   - **LGPD Compliance**: Cookie consent, data protection
   - **Security Architecture**: 6-layer defense in depth (incl. webhook signatures)
   - **Monitoring**: Logging, SaaS metrics

4. **`.rules/testing-standards.md`** (v2.0)
   - **Testing Pyramid**: 60% unit, 30% integration, 10% E2E
   - **Mock Strategies**: Supabase chain builder, Stripe mock, Email mock, NextRequest mock
   - **SaaS Test Patterns**: Credit operations, Stripe webhooks, admin API, email fallback
   - **File Upload Tests**: Type/size validation, `storage_key`
   - **Test Conventions**: `.test.ts` for unit/integration, `.spec.ts` for E2E
   - **Coverage**: 34 files, 319 tests, 80% minimum

### Key Conventions

#### Language Rules

```typescript
// ✅ CORRECT: Code in English
export async function analyzeConversation(leadId: string): Promise<AnalysisResult> {
  // Process conversation
}

// ✅ CORRECT: UI messages in Portuguese
const messages = {
  buttonSave: 'Salvar Lead',
  errorMessage: 'Erro ao carregar dados',
};

// ❌ WRONG: Mixed languages
export async function analisarConversa(leadId: string): Promise<AnalysisResult> {
  // This mixes Portuguese function name with English types
}
```

#### File Naming

- **Components**: `lead-card.tsx`, `metrics-dashboard.tsx`
- **Utilities**: `date-utils.ts`, `format-number.ts`
- **Types**: `database.ts`, `api-types.ts`
- **Constants**: `MAX_LEADS_PER_PAGE`, `API_TIMEOUT_MS`

#### Component Patterns

```typescript
// Server Component (default)
// app/leads/page.tsx
import { getLeads } from '@/lib/services/lead-service';
import { LeadList } from '@/components/leads/lead-list';

export default async function LeadsPage() {
  const leads = await getLeads();
  return <LeadList initialData={leads} />;
}

// Client Component (when needed)
// components/leads/lead-list.tsx
'use client';

import { useState } from 'react';

export function LeadList({ initialData }: Props) {
  const [leads, setLeads] = useState(initialData);
  // Interactive logic here
}
```

---

## Technical Documentation

### Core Documents

1. **Software Requirements Specification (SRS)** - `docs/technical/SRS-Software-Requirements-Specification.md`
   - Functional and non-functional requirements
   - User stories and acceptance criteria
   - Compliance requirements (LGPD, ANS, WhatsApp)
   - Feature priorities (P0-P3)

2. **System Architecture Document (SAD)** - `docs/architecture/SAD-System-Architecture-Document.md`
   - System architecture and component diagrams
   - Technology stack decisions
   - Integration patterns
   - Security and authentication flows
   - Deployment architecture

3. **Database Design Document** - `docs/architecture/Database-Design-Document.md`
   - Complete PostgreSQL schema
   - Entity-relationship diagrams
   - Indexing strategy
   - RLS policies
   - Migration strategy

4. **API Specification** - `docs/api/API-Specification.md`
   - RESTful API endpoints
   - Authentication patterns
   - Error codes and handling
   - Webhook specifications
   - Rate limiting

5. **Implementation Plan** - `docs/technical/Implementation-Plan.md`
   - 90-day roadmap (4 phases)
   - Sprint breakdown (2-week sprints)
   - Testing strategy
   - CI/CD pipeline
   - Monitoring setup

### Quick Reference

**When you need to:**

- **Understand requirements** → Read **SRS** sections 3-4
- **Design a feature** → Check **SAD** section 4 + **`.rules/architecture-rules.md`**
- **Create database tables** → Reference **Database Design** section 3
- **Build API endpoint** → Follow **API Spec** + **`.rules/development-standards.md`** section 6
- **Write code** → Follow **`.rules/coding-guidelines.md`**
- **Write tests** → Follow **`.rules/testing-standards.md`**
- **Plan implementation** → Review **Implementation Plan** sprints
- **Understand compliance** → Check **SRS** section 4.7

---

## Development Workflow

### Getting Started

```bash
# Clone and install
git clone <repository-url>
cd Consultor.AI
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev

# Run with Docker
docker-compose up -d

# Run tests
npm test                  # Unit tests
npm run test:e2e         # E2E tests
npm run test:coverage    # With coverage

# Build for production
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

### Development Commands

| Command                    | Description                               |
| -------------------------- | ----------------------------------------- |
| `npm run dev`              | Start development server (localhost:3000) |
| `npm run build`            | Build for production                      |
| `npm run start`            | Start production server                   |
| `npm run lint`             | Run ESLint                                |
| `npm run lint:fix`         | Auto-fix ESLint issues                    |
| `npm run format`           | Format with Prettier                      |
| `npm run type-check`       | TypeScript type checking                  |
| `npm test`                 | Run all tests                             |
| `npm run test:unit`        | Unit tests only                           |
| `npm run test:integration` | Integration tests only                    |
| `npm run test:e2e`         | E2E tests with Playwright                 |
| `npm run test:coverage`    | Tests with coverage report                |
| `npm run test:watch`       | Watch mode for tests                      |
| `npm run test:ui`          | Vitest UI                                 |
| `npm run docker:up`        | Start dev Docker containers               |
| `npm run docker:down`      | Stop dev Docker containers                |
| `npm run docker:logs`      | View container logs                       |
| `npm run docker:prod`      | Start production Docker                   |
| `npm run docker:build`     | Build Docker images                       |

### Git Workflow

#### Branch Naming

- `feature/add-lead-export`
- `fix/dashboard-loading-error`
- `hotfix/critical-auth-bug`
- `docs/update-api-spec`

#### Commit Messages

Follow Conventional Commits:

```bash
feat(leads): add CSV export functionality
fix(auth): resolve session timeout issue
docs(api): update authentication endpoints
refactor(flow-engine): simplify state management
test(analytics): add unit tests for metrics
chore(deps): update Next.js to 14.2.35
```

---

## Core Features

### 1. Conversation Flow System

JSON-driven conversation engine with three step types:

- **`mensagem`**: Bot sends a message (supports `{{variables}}`)
- **`escolha`**: Multiple choice with predefined options
- **`executar`**: Triggers actions (e.g., `gerar_resposta_ia`)

Each step has a `proxima` field defining next step ID.

### 2. Lead Qualification Flow (Health Plans)

Collects three critical data points:

1. **Profile**: Individual / Couple / Family / Corporate
2. **Age Range**: Up to 30 / 31-45 / 46-60 / Above 60
3. **Coparticipation**: Yes (lower cost) / No (full coverage)

AI generates personalized recommendations based on responses.

### 3. AI Response Generation

Prompt template enforces:

- **Tone**: Welcoming, clear, empathetic, jargon-free
- **Structure**:
  1. Empathetic validation
  2. 1-2 realistic plan recommendations
  3. Contextual call-to-action
- **Compliance**: No exact pricing, no sensitive data requests, no illegal promises

### 4. WhatsApp Integration

- **Meta Business API**: Official WhatsApp Business integration
- **Webhook Handler**: Receives incoming messages (text, interactive, media)
- **Message Validation**: HMAC SHA256 signature verification
- **Idempotency**: `whatsapp_message_id` deduplication for webhook retries

### 5. SaaS Billing (Stripe)

- **Checkout Flow**: Stripe Checkout Sessions for subscription signup
- **Customer Portal**: Self-service billing management
- **Webhook Handling**: `checkout.session.completed`, `customer.subscription.updated/deleted`
- **Credit System**: Atomic deduction, monthly reset, one-time credit packs

### 6. Admin Dashboard

- **Daily Stats**: Revenue, active users, leads, page views (pg_cron)
- **User Management**: List, search, filter consultants with subscription info
- **Role Guard**: `is_admin` flag on consultants table

### 7. Email System

- **Provider**: Resend (production) / console.log (development)
- **Templates**: Welcome, password reset, subscription confirmed/canceled, credit warning

---

## Implementation Roadmap

### Phase 1: MVP Foundation ✅ (Complete)

- [x] Next.js + TypeScript + Supabase + Docker setup
- [x] Authentication, database schema, RLS policies
- [x] Lead CRUD, conversation flow engine, WhatsApp webhook
- [x] AI response generation (Gemini), analytics dashboard
- [x] Default health plan qualification flow, score system

### Phase 2: Polish ✅ (Complete)

- [x] Lead export (CSV), follow-up automation, message templates
- [x] Advanced filters, performance optimization (skeletons, React Query)
- [x] Monitoring infrastructure (Sentry, logging)

### Phase 3: CRM & Integrations ✅ (Complete)

- [x] CRM integrations (RD Station, Pipedrive)
- [x] Sync history, bundle analyzer, error boundaries

### Phase 4: SaaS Platform ✅ (Complete)

- [x] Stripe billing (checkout, subscriptions, webhooks)
- [x] Credit system (atomic ops, monthly reset via pg_cron)
- [x] Admin dashboard (stats, user management)
- [x] File upload (Supabase Storage, presigned URLs)
- [x] Email system (Resend + dev console fallback)
- [x] Landing page, LGPD cookie consent, OAuth

### Phase 5: Expansion (Future)

- [ ] Second vertical (real estate)
- [ ] HubSpot & Agendor CRM providers
- [ ] Voice cloning (ElevenLabs)
- [ ] Mobile app
- [ ] White-label options

---

## Database Schema

### Core Tables (Spec 001)

```sql
consultants      -- Sales professionals (+ billing fields from spec 002)
leads            -- Potential customers (status, score, metadata)
conversations    -- Active chat sessions (state JSONB)
messages         -- Individual messages (direction, whatsapp_message_id)
flows            -- Conversation flow definitions (JSON structure)
crm_integrations -- External CRM connections (RD Station, Pipedrive)
crm_sync_logs    -- Synchronization history
```

### SaaS Tables (Spec 002)

```sql
-- Billing fields added to consultants:
-- stripe_customer_id, subscription_status, subscription_plan,
-- credits, purchased_credits, monthly_credits_allocation,
-- credits_reset_at, date_paid, is_admin

daily_stats          -- Platform metrics (revenue, users, views, deltas)
page_view_sources    -- Traffic source breakdown
files                -- User-uploaded documents (storage_key, consultant_id)
logs                 -- System event logs (level, source, message)
contact_form_messages -- Contact form submissions
```

### Database Functions (RPC)

```sql
decrement_credits(user_id, amount)  -- Atomic credit deduction
reset_monthly_credits()             -- Monthly credit reset (pg_cron)
calculate_daily_stats()             -- Hourly stats aggregation (pg_cron)
```

See `docs/architecture/Database-Design-Document.md` and `specs/002-saas-billing-admin/data-model.md` for complete schema.

---

## Security & Compliance

### Security Measures

- **Authentication**: Supabase Auth with JWT + OAuth (Google/GitHub)
- **Authorization**: Row-Level Security (RLS) + Admin guard (`is_admin`)
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Parameterized queries (Supabase)
- **XSS Prevention**: React auto-escaping
- **Secrets Management**: Environment variables (never committed)
- **Encryption**: AES-256-GCM for sensitive tokens
- **HTTPS**: Required for all connections
- **Rate Limiting**: Redis-based (Upstash)
- **Webhook Validation**: HMAC SHA256 (Meta) + Stripe signature verification
- **File Upload Security**: Type validation, 10MB limit, reject executables

### Compliance

- **LGPD** (Brazilian GDPR): Cookie consent banner, audit logs, data retention
- **ANS Regulations**: No pricing promises, no illegal claims
- **WhatsApp Business Policy**: 24-hour message window, opt-in required
- **PCI Compliance**: Stripe handles all payment data (no card info stored)

---

## Testing

### Test Structure

```
tests/
├── unit/                    # 60% - Functions, utilities, hooks
├── integration/             # 30% - API routes, services
└── e2e/                     # 10% - Critical user flows
```

### Coverage Requirements

- **Overall**: > 80%
- **Unit Tests**: > 90%
- **Integration Tests**: > 70%
- **E2E Tests**: All P0 user flows

### Running Tests

```bash
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e           # E2E with Playwright
npm run test:coverage      # With coverage report
npm run test:watch         # Watch mode
npm run test:ui            # Vitest UI
```

See `.rules/testing-standards.md` for detailed testing patterns and best practices.

---

## Business Model

### Pricing Tiers (Implemented via Stripe)

| Tier         | Price     | Credits/month | Features                           |
| ------------ | --------- | ------------- | ---------------------------------- |
| **Freemium** | R$0/mês   | 20            | Basic flow, text-only              |
| **Pro**      | R$47/mês  | 200           | Images, auto follow-up, CSV export |
| **Agência**  | R$147/mês | 1000          | Custom flows, CRM, full dashboard  |

### Credit System

- 1 credit = 1 lead creation (atomic deduction via `decrement_credits` RPC)
- Monthly reset via pg_cron on 1st of month
- One-time credit packs available (non-expiring, stored in `purchased_credits`)
- When credits = 0: block new leads, show upgrade prompt

---

## Key Design Principles

1. **Consultant's Identity First**: Bot is an "assistant", not a replacement
2. **Compliance by Design**: AI prompts prevent illegal promises/data collection
3. **Local Development**: All components testable locally (console fallback for email)
4. **Strategy Pattern**: Swappable providers for payments (Stripe) and email (Resend)
5. **ServiceResult Convention**: All services return `{ success, data/error }` discriminated union
6. **Server-First**: Default to Server Components for performance
7. **Type Safety**: Strict TypeScript for all code
8. **Test-Driven**: 80% coverage minimum (currently 319 tests passing)
9. **Atomic Operations**: Credit deductions via database RPC to prevent race conditions
10. **LGPD by Default**: Cookie consent, data isolation, audit trails

---

## Important Constraints

### Regulatory Compliance

- **No Pricing Promises**: AI must never quote exact plan prices
- **No Sensitive Data**: Never request CPF, medical history via WhatsApp
- **No Illegal Claims**: No "zero waiting period" or "immediate coverage"

### WhatsApp Compliance

- **24-Hour Window**: Non-template messages only within 24h of user message
- **Opt-In Required**: Users must initiate conversation
- **Business Policy**: Follow Meta's Business Policy strictly

### Technical Constraints

- **Build Time**: Must complete in < 5 minutes
- **Cold Start**: API routes < 500ms first response
- **AI Response Time**: < 3s for 95th percentile
- **Database Queries**: < 100ms for p95

---

## Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Meta WhatsApp API](https://developers.facebook.com/docs/whatsapp)
- [Stripe Docs](https://docs.stripe.com/)
- [Resend Docs](https://resend.com/docs)

### Internal Docs

- **Feature Specs**: `/specs/` directory (001 + 002)
- **Development Rules**: `/.rules/` directory (v2.0)
- **Guides**: `/docs/guides/` (deployment, monitoring, troubleshooting)
- **API Reference**: `/docs/api/API-Specification.md`

### Tools & Services

- **AI**: [Google AI Studio](https://ai.google.dev/)
- **Payments**: [Stripe Dashboard](https://dashboard.stripe.com/)
- **Email**: [Resend Dashboard](https://resend.com/)
- **WhatsApp**: [Meta Business](https://business.facebook.com/)
- **Monitoring**: [Sentry](https://sentry.io/)

---

## Getting Help

### Issue Types

- **Bug**: Something not working as expected
- **Feature**: New functionality request
- **Documentation**: Docs improvement
- **Question**: General questions

### Before Opening an Issue

1. Check existing issues
2. Review relevant documentation in `/docs/`
3. Check development guidelines in `/.rules/`
4. Try to reproduce the issue locally

---

## Contributing

### Before Contributing

1. Read **ALL** files in `/.rules/` directory
2. Follow the Git workflow outlined above
3. Ensure tests pass (`npm test`)
4. Run linting (`npm run lint:fix`)
5. Format code (`npm run format`)
6. Update documentation if needed

### Pull Request Checklist

- [ ] Code follows style guidelines (`.rules/`)
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Tests added/updated (80% coverage)
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Commit messages follow conventions

---

## Maintainers

**Last Updated**: 2026-02-20
**Project Version**: 0.4.0 (MVP + SaaS Platform - **COMPLETO**)
**Next.js Version**: 14.2.35
**Node Version**: 20 LTS
**Rules Version**: 2.0 (`.rules/` updated 2026-02-11)
**Status**: ✅ **Production Ready - SaaS Platform Completa**

### Próximos Passos

- Guia atualizado: [ROADMAP.md](./docs/guides/ROADMAP.md)
- Fase 5 (Expansão): Vertical Imóveis, HubSpot/Agendor, Voice Cloning, Mobile App

---

**Remember**: Always check `/.rules/` directory before writing code. These guidelines ensure consistency, quality, and maintainability across the entire codebase.
