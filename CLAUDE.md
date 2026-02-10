# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Consultor.AI** (also known as HealthBot/VendaFácil AI) is an AI-powered WhatsApp assistant designed to help autonomous salespeople automate lead capture, qualification, and nurturing. The platform targets two initial verticals:

1. **Health plan consultants** - Automated triaging of leads based on profile, age, and coparticipation preferences
2. **Real estate agents** - Property qualification and recommendation (planned expansion)

The system combines conversational AI with personalized content generation to create a 24/7 virtual sales assistant that maintains the consultant's voice and personality.

---

## Current Status

**Fase Atual:** MVP Fase 1 - ✅ **COMPLETO** | Fase 1.5 (Testes) - ✅ **COMPLETO** | Fase 2 (Polish) - ✅ **COMPLETO** | Fase 3 (CRM) - ✅ **COMPLETO**
**Última Atualização:** 2026-01-30
**Versão:** 0.3.0
**Branch Atual:** `001-project-specs`
**Status:** Production Ready - Pronto para Deploy

### MVP Completo ✅

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

**Infrastructure**:

- ✅ **Build Pipeline**: Next.js builds successfully (0 erros TypeScript)
- ✅ **Supabase Integration**: Client SSR + Server + Middleware configurados
- ✅ **Database Schema**: RLS policies ativas, migrations aplicadas
- ✅ **Encryption**: Tokens criptografados com AES-256-GCM
- ✅ **Webhook Validation**: HMAC SHA-256 para segurança
- ✅ **API Routes**: 25 endpoints REST completos
- ✅ **Pages**: 22 páginas renderizadas
- ✅ **Monitoring**: Logger, Performance Tracking, Sentry Integration
- ✅ **Performance**: Skeleton loading, React Query caching, optimized hooks
- ✅ **CRM Integrations**: RD Station, Pipedrive (HubSpot/Agendor planned)
- ✅ **Bundle Analyzer**: Otimização de bundle configurada

**Build Status**: ✅ 22 páginas, 25 API routes, ~67s build time

### Fase 1.5 - Testes ✅ (100% Completo)

**Status dos Testes** (2026-01-20):

- ✅ **Cobertura**: 22 suites de teste | 240 testes no total
- ✅ **Testes Passando**: 240/240 (100%)
- ✅ **14/14 rotas** com cobertura de teste (100% das rotas)
- ✅ **CI/CD**: GitHub Actions configurado e funcionando
- ✅ **Husky**: Pre-commit hooks configurados
- ⚠️ **TypeScript**: ~15 erros em arquivos de teste (produção OK)

**Progresso por Sprint**:

- ✅ **Sprint 1**: Infraestrutura de testes (COMPLETO)
- ✅ **Sprint 2**: Testes unitários críticos (COMPLETO)
- ✅ **Sprint 3**: Testes de integração (COMPLETO)
- ✅ **Sprint 4**: CI/CD + E2E (COMPLETO)

**Arquivos de Teste Criados**:

- `tests/unit/app/api/**` - Testes de API routes (14 arquivos)
- `tests/unit/lib/flow-engine/**` - Testes do Flow Engine (4 arquivos)
- `tests/unit/lib/services/**` - Testes de serviços (3 arquivos)
- `tests/fixtures/` - Fixtures reutilizáveis
- `tests/mocks/` - Mocks globais (Supabase, Next.js)
- `tests/setup.ts` - Configuração global

### Próximas Fases 📋

**Fase 1.5 - Testes** ✅ (100% Completo):

- [x] Estrutura de testes configurada
- [x] Fixtures e mocks criados
- [x] Testes de API routes (14/14 rotas)
- [x] Testes unitários críticos (Flow Engine, AI, Lead, Analytics)
- [x] GitHub Actions CI/CD configurado
- [x] Pre-commit hooks (Husky)
- [x] Teste E2E (lead qualification flow)
- [ ] Corrigir erros TypeScript em arquivos de teste

**Fase 2 - Polimento** ✅ (100% Completo):

- [x] Lead detail page completo (`/dashboard/leads/[id]`) - Timeline de conversas, edição inline
- [x] Exportação de Leads (CSV/Excel) - `/api/leads/export` com filtros
- [x] Follow-up Automático - Migration, service, API, UI completos
- [x] Monitoring Infrastructure - Sentry, Performance, Logging (`src/lib/monitoring/`)
- [x] Docker Networking Fix - Supabase interno via Kong
- [x] Templates de Mensagens - CRUD completo, picker UI, página de gerenciamento
- [x] Filtros Avançados - Busca, status multi-select, date range, score range, source
- [x] Otimização de Performance - Skeletons, React Query caching, useLeads hook

**Fase 3 - CRM & Polish** ✅ (100% Completo):

- [x] Integração CRM (RD Station, Pipedrive) - `/dashboard/integracoes`
- [x] CRM Service Layer - Sync automático e manual
- [x] Histórico de Sincronizações - Logs detalhados
- [x] Bundle Analyzer - `npm run analyze`
- [x] Error Boundary - Dashboard específico
- [x] Enhanced 404 Page - Quick links
- [x] Release Verification Script - `scripts/verify-release.ts`
- [x] Documentation - DEPLOYMENT.md, MONITORING.md, CHANGELOG.md

**Fase 4 - Expansão** (Futuro):

- [ ] Segundo Vertical (Imóveis)
- [ ] HubSpot & Agendor Providers
- [ ] Voice Cloning (ElevenLabs)
- [ ] Image Generation (Canva API)
- [ ] Multi-tenant

### Especificações do Projeto 📋

**Localização**: `specs/001-project-specs/`

| Arquivo                      | Descrição                                       | Status      |
| ---------------------------- | ----------------------------------------------- | ----------- |
| `spec.md`                    | Especificação completa (7 user stories, 55 FRs) | ✅ Completo |
| `plan.md`                    | Plano de implementação técnico                  | ✅ Completo |
| `tasks.md`                   | 100 tasks organizadas por user story            | ✅ Completo |
| `checklists/requirements.md` | Checklist de qualidade                          | ✅ Aprovado |

---

## Tech Stack

### Core Technologies

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript 5.3
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Edge Functions + Realtime)
- **State Management**: React Query + Zustand (minimal)
- **Forms**: React Hook Form + Zod validation
- **AI**: Google AI (Gemini) / Groq (Llama 3.1 70B)
- **WhatsApp**: Meta Business API (360dialog via Weni Cloud)
- **Image Generation**: Canva API
- **Caching**: Redis (Upstash)
- **Testing**: Vitest + Testing Library + Playwright
- **Deployment**: Docker + Vercel (frontend) + Supabase (backend)
- **Monitoring**: Sentry / Better Stack (planned)

---

## Project Structure

### Current Directory Layout

```
Consultor.AI/
├── .rules/                          # Development guidelines (READ THESE!)
│   ├── development-standards.md     # Code standards, language rules, ROOT ORGANIZATION
│   ├── coding-guidelines.md         # TypeScript, React patterns
│   ├── architecture-rules.md        # System architecture patterns
│   └── testing-standards.md         # Testing philosophy and patterns
│
├── configs/                         # Additional configuration files
│   ├── docker/                      # Docker configurations (legacy, use root files)
│   │   ├── docker-compose.dev.yml   # ⚠️ Deprecated - use root docker-compose.dev.yml
│   │   └── Dockerfile.dev           # ⚠️ Deprecated - use root Dockerfile.dev
│   ├── eslint/                      # ESLint configuration
│   │   └── .eslintrc.json
│   ├── prettier/                    # Prettier configuration
│   │   ├── .prettierrc
│   │   └── .prettierignore
│   ├── testing/                     # Test configurations
│   │   ├── playwright.config.ts
│   │   └── vitest.config.ts
│   └── build/                       # Build tool configs
│       ├── postcss.config.js
│       └── tailwind.config.ts
│
├── docs/                            # Technical documentation
│   ├── guides/                      # Setup guides, tutorials, fixes
│   │   ├── README.md                # ⭐ Guide index
│   │   ├── getting-started.md       # ⭐ Dev environment setup
│   │   ├── DEPLOYMENT.md            # ⭐ Deploy guide (Docker, Vercel, Stripe)
│   │   ├── TROUBLESHOOTING.md       # ⭐ Common issues & solutions
│   │   ├── MONITORING.md            # ⭐ Monitoring & observability
│   │   ├── LOCAL-DOCKER-TESTING.md  # ⭐ Docker local development
│   │   ├── WHATSAPP-EMBEDDED-SIGNUP.md  # ⭐ WhatsApp Business setup
│   │   ├── WHATSAPP-SIMULATOR.md    # WhatsApp test simulator
│   │   └── ROADMAP.md               # Project roadmap & KPIs
│   ├── technical/                   # Technical specifications
│   │   ├── SRS-Software-Requirements-Specification.md
│   │   └── Implementation-Plan.md
│   ├── architecture/                # Architecture docs
│   │   ├── SAD-System-Architecture-Document.md
│   │   └── Database-Design-Document.md
│   ├── api/                         # API documentation
│   │   └── API-Specification.md
│   └── motivação/                   # Conceptual planning & prototypes
│
├── scripts/                         # Utility scripts
│   ├── dev-setup.sh                 # Development environment setup
│   ├── validate-flow.ts             # ⭐ Flow JSON validator
│   └── verify-release.ts            # ⭐ Release verification script
│
├── src/
│   ├── app/                         # Next.js 14 App Router
│   │   ├── api/                     # API routes (13 endpoints)
│   │   │   ├── analytics/           # ⭐ Analytics endpoints
│   │   │   │   ├── overview/        # GET - Overview metrics
│   │   │   │   ├── charts/          # GET - Chart data
│   │   │   │   └── activity/        # GET - Recent activity
│   │   │   ├── consultants/
│   │   │   │   └── meta-callback/   # Meta OAuth callback
│   │   │   ├── conversations/       # ⭐ Conversation management
│   │   │   │   ├── start/           # POST - Start conversation
│   │   │   │   └── [id]/message/    # POST - Send message
│   │   │   ├── health/              # GET - Health check
│   │   │   ├── integrations/        # ⭐ CRM Integrations
│   │   │   │   └── crm/             # CRM API routes
│   │   │   │       ├── route.ts     # GET/POST - List/Create integrations
│   │   │   │       ├── logs/        # GET - Sync logs
│   │   │   │       └── [id]/        # Integration by ID
│   │   │   │           ├── route.ts # GET/PATCH/DELETE
│   │   │   │           ├── sync/    # POST - Sync leads
│   │   │   │           └── test/    # POST - Test connection
│   │   │   ├── leads/               # ⭐ Lead management
│   │   │   │   ├── route.ts         # GET/POST - List/Create leads
│   │   │   │   ├── [id]/route.ts    # GET/PATCH/DELETE - Lead by ID
│   │   │   │   └── stats/           # GET - Lead statistics
│   │   │   └── webhook/
│   │   │       └── meta/[consultantId]/  # ⭐ WhatsApp webhook handler
│   │   ├── auth/                    # ⭐ Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── dashboard/               # ⭐ Dashboard pages
│   │   │   ├── analytics/           # Analytics page
│   │   │   ├── integracoes/         # ⭐ CRM Integrations page
│   │   │   ├── leads/               # Leads management
│   │   │   ├── flows/               # ⭐ Flow editor
│   │   │   ├── templates/           # Message templates
│   │   │   ├── perfil/
│   │   │   │   └── whatsapp/        # WhatsApp integration UI
│   │   │   ├── layout.tsx           # Dashboard layout
│   │   │   ├── error.tsx            # ⭐ Dashboard error boundary
│   │   │   └── page.tsx             # Dashboard home
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Landing page
│   │   ├── error.tsx                # Error boundary
│   │   ├── loading.tsx              # Loading state
│   │   └── not-found.tsx            # 404 page
│   │
│   ├── components/                  # React components
│   │   ├── auth/                    # ⭐ Auth components
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── dashboard/               # ⭐ Dashboard components
│   │   │   ├── metric-card.tsx      # Metric display card
│   │   │   ├── bar-chart.tsx        # Bar chart (SVG)
│   │   │   ├── pie-chart.tsx        # Pie chart (SVG)
│   │   │   └── recent-leads-table.tsx  # Recent leads table
│   │   ├── integrations/            # ⭐ CRM Integration components
│   │   │   ├── crm-integration-card.tsx
│   │   │   ├── crm-connect-dialog.tsx
│   │   │   └── crm-sync-history.tsx
│   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── alert.tsx
│   │   │   ├── button.tsx
│   │   │   └── card.tsx
│   │   ├── whatsapp/
│   │   │   └── MetaConnectButton.tsx
│   │   └── providers.tsx            # React Query provider
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAnalytics.ts          # ⭐ Analytics data hooks
│   │   ├── useAuth.ts               # ⭐ Authentication hook
│   │   ├── useCRM.ts                # ⭐ CRM integration hooks
│   │   ├── useLeads.ts              # ⭐ Lead management hooks
│   │   └── useMetaSignup.ts
│   │
│   ├── lib/                         # Core libraries & utilities
│   │   ├── ai/
│   │   │   └── gemini.ts            # Google AI integration
│   │   ├── api/
│   │   │   └── google-ai.ts         # AI API wrapper
│   │   ├── encryption/
│   │   │   ├── index.ts             # Encryption utilities
│   │   │   └── encryption.test.ts
│   │   ├── flow-engine/             # ⭐ Flow Engine (NEW)
│   │   │   ├── types.ts             # Flow type definitions
│   │   │   ├── parser.ts            # Flow JSON parser/validator
│   │   │   ├── state-manager.ts     # Conversation state management
│   │   │   ├── executors.ts         # Step executors (message/choice/action)
│   │   │   ├── engine.ts            # Main flow engine
│   │   │   └── index.ts             # Barrel exports
│   │   ├── services/                # ⭐ Service Layer
│   │   │   ├── analytics-service.ts # Analytics metrics & charts
│   │   │   ├── ai-service.ts        # AI response generation
│   │   │   ├── crm-service.ts       # ⭐ CRM integration service
│   │   │   ├── crm-providers/       # ⭐ CRM provider implementations
│   │   │   │   ├── rd-station.ts    # RD Station provider
│   │   │   │   ├── pipedrive.ts     # Pipedrive provider
│   │   │   │   └── index.ts         # Provider exports
│   │   │   ├── lead-auto-create.ts  # Auto-create leads from WhatsApp
│   │   │   └── lead-service.ts      # Lead CRUD operations
│   │   ├── supabase/
│   │   │   ├── client.ts            # Client-side Supabase (SSR)
│   │   │   ├── server.ts            # Server-side Supabase
│   │   │   ├── middleware.ts        # Auth middleware
│   │   │   ├── config.ts            # Configuration
│   │   │   └── index.ts             # Barrel exports
│   │   ├── validations/             # ⭐ Zod Schemas
│   │   │   ├── lead.ts              # Lead validation schemas
│   │   │   └── crm.ts               # ⭐ CRM validation schemas
│   │   ├── whatsapp/
│   │   │   ├── meta-client.ts       # ⭐ Enhanced Meta API client
│   │   │   └── webhook-validation.ts # ⭐ Enhanced HMAC + interactive messages
│   │   └── utils.ts                 # Generic utilities
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── database.ts              # Generated from Supabase
│   │   └── api.ts                   # API types
│   │
│   ├── middleware.ts                # ⭐ Next.js middleware (auth)
│   │
│   └── styles/
│       └── globals.css              # Global styles
│
├── supabase/                        # Supabase configuration
│   ├── functions/                   # Edge Functions (TBD)
│   ├── migrations/                  # ⭐ Database migrations
│   │   ├── 20251217000001_initial_schema.sql
│   │   ├── 20251217000002_rls_policies.sql
│   │   └── 20260127000001_add_crm_integrations.sql  # ⭐ CRM tables
│   ├── seed/                        # ⭐ Seed data
│   │   ├── default-health-flow.json # Default health qualification flow
│   │   └── seed.sql                 # Seed SQL scripts
│   └── config.toml                  # Supabase local config
│
├── tests/                           # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/                          # Static assets
│   └── .gitkeep
│
├── docker-compose.yml               # Docker production orchestration
├── docker-compose.dev.yml           # Docker development (hot-reload)
├── docker-compose.full.yml          # Docker full stack
├── Dockerfile                       # Production container (multi-stage)
├── Dockerfile.dev                   # Development container
├── Dockerfile.test                  # Test container
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS config
├── tsconfig.json                    # TypeScript config
├── vitest.config.ts                 # Vitest test config
├── playwright.config.ts             # Playwright E2E config
└── package.json                     # Dependencies
```

### 🧹 Root Directory Organization

**CRITICAL**: The root directory is kept intentionally clean. See `.rules/development-standards.md` Section 0 for complete rules.

**Configuration Files in Root**:

- `.eslintrc.json` - ESLint configuration
- `.prettierrc`, `.prettierignore` - Prettier configuration
- `playwright.config.ts` - Playwright E2E tests
- `vitest.config.ts` - Vitest unit tests
- `tailwind.config.ts` - Tailwind CSS
- `postcss.config.js` - PostCSS
- `docker-compose.yml`, `docker-compose.dev.yml` - Docker orchestration
- `Dockerfile`, `Dockerfile.dev`, `Dockerfile.test` - Docker containers

**Note**: Docker files in `configs/docker/` are deprecated. Use root files as source of truth.

**Where Things Go**:

- Configuration files → Root directory (required by tools)
- Setup guides/tutorials → `docs/guides/`
- Utility scripts → `scripts/`
- Internal notes → `docs/internal/`

**Never Create in Root**:

- ❌ `SETUP.md`, `NOTES.md` → Use `docs/guides/`
- ❌ `deploy.sh`, `start.sh` → Use `scripts/`
- ❌ Temporary files → Use `.gitignore`

---

## Development Guidelines

### 📖 **IMPORTANT: Read `.rules/` First!**

Before writing any code, familiarize yourself with the guidelines in `.rules/`:

1. **`.rules/development-standards.md`**
   - **Language Rules**: English for code, Portuguese for docs/UI
   - **Code Organization**: Project structure, naming conventions
   - **TypeScript Standards**: Strict mode, type safety
   - **React/Next.js Patterns**: Server vs Client components
   - **Supabase Patterns**: Queries, RLS, real-time
   - **API Development**: Route structure, error handling
   - **Testing Requirements**: 80% coverage minimum
   - **Performance**: Optimization strategies
   - **Security**: Input validation, XSS/SQL injection prevention
   - **Git Workflow**: Branches, commits, PR templates

2. **`.rules/coding-guidelines.md`**
   - **Naming Conventions**: camelCase, PascalCase, UPPER_SNAKE_CASE
   - **Function Signatures**: Clear types, JSDoc comments
   - **Async/Await**: Proper error handling
   - **Array/Object Operations**: Functional, immutable patterns
   - **React Patterns**: Props, hooks, conditional rendering
   - **Supabase Queries**: Organized in service functions
   - **Error Handling**: Custom error classes
   - **Validation**: Zod schemas
   - **Performance**: Memoization, code splitting
   - **Accessibility**: Semantic HTML, ARIA attributes
   - **Documentation**: JSDoc standards

3. **`.rules/architecture-rules.md`**
   - **Architectural Principles**: Separation of concerns
   - **Component Architecture**: Server vs Client components
   - **Data Flow**: Layer responsibilities
   - **API Route Structure**: Standard patterns
   - **Service Layer Pattern**: Business logic organization
   - **Flow Engine Architecture**: Conversation execution
   - **Database Access**: Direct queries vs services
   - **Integration Architecture**: External service wrappers
   - **State Management**: React Query, Zustand
   - **Security Architecture**: Defense in depth
   - **Monitoring**: Logging and metrics

4. **`.rules/testing-standards.md`**
   - **Testing Philosophy**: Behavior over implementation
   - **Testing Pyramid**: 60% unit, 30% integration, 10% E2E
   - **Unit Testing**: Vitest patterns
   - **Component Testing**: React Testing Library
   - **Integration Testing**: API routes, services
   - **E2E Testing**: Playwright critical flows
   - **Mock Strategies**: Supabase, AI, WhatsApp
   - **Test Fixtures**: Reusable test data
   - **Coverage Requirements**: 80% overall, 90% unit tests
   - **CI/CD Integration**: GitHub Actions

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
- **Webhook Handler**: Receives incoming messages
- **Message Validation**: HMAC SHA256 signature verification
- **Status Updates**: Delivery receipts and read confirmations

---

## Implementation Roadmap

### Phase 1: MVP Foundation (Days 1-30) ✅

**Status**: **COMPLETO** - 2025-12-20

- [x] Project setup (Next.js, TypeScript, Tailwind)
- [x] Docker environment
- [x] Supabase integration
- [x] Landing page
- [x] Health check endpoint
- [x] **User authentication** (Supabase Auth)
- [x] **Database schema** implementation (migrations + RLS)
- [x] **Dashboard** interface (analytics, leads, settings)
- [x] **Lead management CRUD** (create, read, update, delete, stats)
- [x] **Conversation flow engine** (parser, state manager, executors)
- [x] **WhatsApp webhook** integration (HMAC validation, interactive messages)
- [x] **AI response generation** (Gemini 1.5 Flash, compliance ANS)
- [x] **Analytics dashboard** (6 metrics, 2 charts, 2 tables)
- [x] **Default health flow** (7-step qualification flow)
- [x] **Auto-create leads** from WhatsApp
- [x] **Score calculation** system

**Deliverables**:

- ✅ 19 páginas renderizadas
- ✅ 13 API endpoints
- ✅ 20+ componentes React
- ✅ 0 erros TypeScript
- ✅ Build time: ~45s

**Goal**: ✅ Sistema 100% funcional e pronto para testes com consultores beta

### Phase 2: Polimento (Days 31-60)

**Status**: Planejado

- [ ] **Exportação de Leads** (CSV/Excel com filtros)
- [ ] **Follow-up Automático** (message templates após 24h)
- [ ] **Templates de Mensagens** (biblioteca reutilizável)
- [ ] **Filtros Avançados** (busca, data range, score)
- [ ] **Testes E2E** completos (Playwright)
- [ ] **Monitoramento** (Sentry, logs estruturados)

**Goal**: 20 consultores ativos, 500+ leads processados, 90% satisfação

### Phase 3: Scale (Days 61-90)

- [ ] Second vertical (real estate)
- [ ] Calendar integration
- [ ] CRM integration (RD Station, Pipedrive)
- [ ] Performance optimizations
- [ ] Real-time dashboard updates
- [ ] Advanced security features

**Goal**: 100 active consultants, 5,000+ leads, 99.5% uptime

### Phase 4: Iterate (Days 90+)

- [ ] Voice cloning (ElevenLabs)
- [ ] Template marketplace
- [ ] White-label options
- [ ] Mobile app
- [ ] Additional integrations

---

## Database Schema

### Core Tables

```sql
-- Consultants (sales professionals using the platform)
consultants (
  id uuid primary key,
  email text unique,
  name text,
  whatsapp_number text,
  vertical text,  -- 'saude' | 'imoveis'
  slug text unique,
  meta_access_token text (encrypted),
  whatsapp_business_account_id text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Leads (potential customers)
leads (
  id uuid primary key,
  consultant_id uuid references consultants,
  whatsapp_number text,
  name text,
  status text,  -- 'novo' | 'em_contato' | 'qualificado' | 'fechado' | 'perdido'
  score integer,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz
)

-- Conversations (active chat sessions)
conversations (
  id uuid primary key,
  lead_id uuid references leads,
  flow_id uuid references flows,
  state jsonb,  -- Current state of conversation
  status text,  -- 'active' | 'completed' | 'abandoned'
  created_at timestamptz,
  updated_at timestamptz
)

-- Messages (individual messages)
messages (
  id uuid primary key,
  conversation_id uuid references conversations,
  direction text,  -- 'inbound' | 'outbound'
  content text,
  whatsapp_message_id text,
  status text,  -- 'sent' | 'delivered' | 'read' | 'failed'
  created_at timestamptz
)

-- Flows (conversation flow definitions)
flows (
  id uuid primary key,
  consultant_id uuid references consultants,
  name text,
  vertical text,
  definition jsonb,  -- JSON flow structure
  is_active boolean,
  created_at timestamptz
)

-- CRM Integrations (external CRM connections)
crm_integrations (
  id uuid primary key,
  consultant_id uuid references consultants,
  provider text,  -- 'rd-station' | 'pipedrive' | 'hubspot' | 'agendor'
  name text,
  status text,  -- 'active' | 'inactive' | 'error' | 'pending_auth'
  api_key text (encrypted),
  field_mappings jsonb,
  auto_sync_enabled boolean,
  sync_on_qualification boolean,
  sync_stats jsonb,
  created_at timestamptz,
  updated_at timestamptz
)

-- CRM Sync Logs (synchronization history)
crm_sync_logs (
  id uuid primary key,
  integration_id uuid references crm_integrations,
  lead_id uuid references leads,
  status text,  -- 'pending' | 'in_progress' | 'success' | 'failed' | 'partial'
  operation text,  -- 'create' | 'update'
  crm_record_id text,
  crm_record_url text,
  error_message text,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz
)
```

See `docs/architecture/Database-Design-Document.md` for complete schema with indexes and RLS policies.

---

## Security & Compliance

### Security Measures

- **Authentication**: Supabase Auth with JWT
- **Authorization**: Row-Level Security (RLS) policies
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Parameterized queries (Supabase)
- **XSS Prevention**: React auto-escaping
- **Secrets Management**: Environment variables (never committed)
- **HTTPS**: Required for all connections
- **Rate Limiting**: Redis-based (Upstash)
- **Webhook Validation**: HMAC SHA256 signatures

### Compliance

- **LGPD** (Brazilian GDPR): Audit logs, data retention policies
- **ANS Regulations**: No pricing promises, no illegal claims
- **WhatsApp Business Policy**: 24-hour message window, opt-in required

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

### Pricing Tiers

| Tier         | Price     | Features                                     |
| ------------ | --------- | -------------------------------------------- |
| **Freemium** | R$0/mês   | 20 leads/month, basic flow, text-only        |
| **Pro**      | R$47/mês  | 200 leads/month, images, auto follow-up, CSV |
| **Agência**  | R$147/mês | 1000 leads, custom flows, dashboard, CRM     |

### Upsell Opportunities

- Voice cloning: +R$15/month
- Interactive quizzes: +R$20/month
- Real-time plan pricing: +R$50/month

---

## Key Design Principles

1. **Consultant's Identity First**: Bot is an "assistant", not a replacement
2. **Compliance by Design**: AI prompts prevent illegal promises/data collection
3. **Local Development**: All components testable locally
4. **Free Tier Optimization**: MVP runs on free tiers (Vercel, Supabase, Groq)
5. **Modular Flows**: JSON-based for easy customization
6. **Server-First**: Default to Server Components for performance
7. **Type Safety**: Strict TypeScript for all code
8. **Test-Driven**: 80% coverage minimum

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

### Internal Docs

- **Complete Specs**: `/docs/` directory
- **Development Rules**: `/.rules/` directory
- **API Reference**: `/docs/api/API-Specification.md`
- **Implementation Plan**: `/docs/technical/Implementation-Plan.md`

### Tools & Services

- **AI**: [Google AI Studio](https://ai.google.dev/) | [Groq Console](https://console.groq.com/)
- **WhatsApp**: [Weni Cloud](https://weni.ai/cloud) | [360dialog](https://www.360dialog.com/)
- **Image Generation**: [Canva API](https://www.canva.com/developers)
- **Monitoring**: [Sentry](https://sentry.io/) | [Better Stack](https://betterstack.com/)

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

**Last Updated**: 2026-02-09
**Project Version**: 0.3.0 (Fases 1-3 - **COMPLETO**)
**Next.js Version**: 14.2.35
**Node Version**: 20 LTS
**Status**: ✅ **Production Ready - Pronto para Deploy**

### Próximos Passos

- Guia atualizado: [ROADMAP.md](./docs/guides/ROADMAP.md)
- Fase 4 (Expansão): Vertical Imóveis, HubSpot/Agendor, Voice Cloning

---

**Remember**: Always check `/.rules/` directory before writing code. These guidelines ensure consistency, quality, and maintainability across the entire codebase.
