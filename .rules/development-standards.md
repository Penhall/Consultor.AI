# Development Standards - Consultor.AI

## AI-Powered WhatsApp Sales Assistant Platform

**Version:** 2.0
**Last Updated:** 2026-02-11
**Stack:** Next.js 14 + TypeScript + Supabase + PostgreSQL + Stripe + Resend
**Target:** Health Plan Consultants & Real Estate Agents (SaaS Multi-tenant)

---

## 📑 Table of Contents

- [0. Root Directory Organization](#0-root-directory-organization)
- [1. Language and Documentation](#1-language-and-documentation)
- [2. Code Organization](#2-code-organization)
- [3. TypeScript Standards](#3-typescript-standards)
- [4. React and Next.js Patterns](#4-react-and-nextjs-patterns)
- [5. Supabase and Database](#5-supabase-and-database)
- [6. API Development](#6-api-development)
- [7. Error Handling](#7-error-handling)
- [8. Testing](#8-testing)
- [9. Performance](#9-performance)
- [10. Security](#10-security)
- [11. Git Workflow](#11-git-workflow)
- [12. Code Review Checklist](#12-code-review-checklist)
- [13. SaaS & Billing Standards](#13-saas--billing-standards)
- [14. File Upload & Storage](#14-file-upload--storage)
- [15. Email & Notifications](#15-email--notifications)

---

## 0. Root Directory Organization

### Keep Root Clean 🧹

**CRITICAL RULE**: The root directory must remain clean and organized. Only essential files belong at the project root.

### Allowed Files in Root Directory

**Required Files** (MUST be in root):

```
.env                    # Environment variables (gitignored)
.env.example            # Environment template
.gitignore              # Git ignore rules
.dockerignore           # Docker ignore rules
README.md               # Project overview (Portuguese)
CLAUDE.md               # AI assistant guide (English)
package.json            # npm configuration
package-lock.json       # npm lock file
docker-compose.yml      # Production Docker setup
docker-compose.dev.yml  # Development Docker setup
docker-compose.full.yml # Full stack Docker setup
Dockerfile              # Production container (multi-stage)
Dockerfile.dev          # Development container (hot-reload)
Dockerfile.test         # Test container
next.config.js          # Next.js configuration
next-env.d.ts           # Next.js TypeScript declarations
tsconfig.json           # TypeScript configuration
```

**Configuration Files** (in root, required by tools):

```
.eslintrc.json          # ESLint configuration
.prettierrc             # Prettier configuration
.prettierignore         # Prettier ignore rules
playwright.config.ts    # Playwright E2E tests
vitest.config.ts        # Vitest unit tests
postcss.config.js       # PostCSS configuration
tailwind.config.ts      # Tailwind CSS configuration
```

> **Note**: Docker files previously in `configs/docker/` are deprecated. Root Docker files are the source of truth.

### Forbidden in Root Directory

**NEVER create these in root** (use proper directories instead):

❌ **Documentation files**:

- `SETUP.md`, `DEPLOYMENT.md`, `TROUBLESHOOTING.md` → Move to `docs/guides/`
- `CHANGELOG.md` → Move to `docs/`
- `TODO.md`, `NOTES.md` → Move to `docs/internal/`

❌ **Script files**:

- `setup.sh`, `deploy.sh`, `start-dev.sh` → Move to `scripts/`
- `*.py`, `*.rb` scripts → Move to `scripts/`

❌ **Configuration files**:

- `jest.config.js` → Move to `configs/testing/`
- `babel.config.js` → Move to `configs/build/`
- `.editorconfig` → Move to `configs/editor/`

❌ **Temporary/generated files**:

- `.DS_Store`, `Thumbs.db` → Add to `.gitignore`
- `debug.log`, `error.log` → Add to `.gitignore`
- Build artifacts → Should be in `.gitignore`

### Proper Directory Structure

```
Consultor.AI/
├── configs/                  # All configuration files
│   ├── docker/              # Docker configurations
│   │   ├── docker-compose.dev.yml
│   │   └── Dockerfile.dev
│   ├── eslint/              # ESLint configuration
│   │   └── .eslintrc.json
│   ├── prettier/            # Prettier configuration
│   │   ├── .prettierrc
│   │   └── .prettierignore
│   ├── testing/             # Test configurations
│   │   ├── playwright.config.ts
│   │   └── vitest.config.ts
│   └── build/               # Build tool configs
│       ├── postcss.config.js
│       └── tailwind.config.ts
│
├── docs/                     # Documentation
│   ├── guides/              # Setup guides, tutorials
│   │   ├── DOCKER-SETUP.md
│   │   ├── SUPABASE-MIGRATION.md
│   │   └── NEXT-STEPS.md
│   ├── technical/           # Technical specifications
│   ├── architecture/        # Architecture docs
│   ├── api/                 # API documentation
│   └── internal/            # Internal notes, TODOs
│
├── scripts/                  # Utility scripts
│   ├── dev-setup.sh
│   ├── deploy.sh
│   └── db-seed.js
│
├── src/                      # Source code
├── tests/                    # Test files
├── public/                   # Static assets
└── supabase/                 # Supabase configuration
```

### Enforcement Rules

1. **Before Creating a File in Root**:
   - Ask: "Does this NEED to be in root for the tool to work?"
   - If NO → Move to appropriate subdirectory
   - If YES → Verify it's on the "Allowed Files" list

2. **During Code Review**:
   - Reject PRs that add unapproved files to root
   - Request files be moved to proper directories
   - Update `.gitignore` for generated/temp files

3. **Cleanup Protocol**:
   - Weekly review of root directory
   - Move misplaced files to proper locations
   - Update documentation if structure changes

4. **Configuration File Pattern**:
   - Actual config: `configs/category/config-file`
   - Root symlink: `ln -sf configs/category/config-file config-file`
   - Update scripts to reference new paths

### Examples

**✅ CORRECT**:

```bash
# Create new test configuration
touch configs/testing/jest.config.js
ln -sf configs/testing/jest.config.js jest.config.js

# Add setup guide
touch docs/guides/AWS-DEPLOYMENT.md

# Create deployment script
touch scripts/deploy-production.sh
chmod +x scripts/deploy-production.sh
```

**❌ WRONG**:

```bash
# DON'T do this!
touch SETUP-INSTRUCTIONS.md      # → Should be docs/guides/
touch deploy.sh                  # → Should be scripts/
touch jest.config.js             # → Should be configs/testing/
touch NOTES.md                   # → Should be docs/internal/
```

### Migration Checklist

When cleaning up an existing project:

- [ ] Create `configs/`, `docs/guides/`, `scripts/` directories
- [ ] Move all config files to `configs/` subdirectories
- [ ] Create symlinks in root for required configs
- [ ] Move documentation to `docs/guides/`
- [ ] Move scripts to `scripts/` and make executable
- [ ] Update `package.json` scripts with new paths
- [ ] Update CI/CD configs with new paths
- [ ] Test that all tools still work (linters, tests, build)
- [ ] Update `.gitignore` if needed
- [ ] Document new structure in README.md

---

## 1. Language and Documentation

### Code Language

**English mandatory** for:

- File names, folders, variables, functions, classes
- Comments, JSDoc, technical documentation
- Git commits, branches, pull requests
- API endpoints, database schema

```typescript
// ✅ CORRECT
export async function analyzeConversation(leadId: string, flowId: string): Promise<AnalysisResult> {
  // Process conversation flow
  return result;
}

// ❌ WRONG
export async function analisarConversa(idLead: string, idFluxo: string): Promise<ResultadoAnalise> {
  // Processar fluxo de conversa
  return resultado;
}
```

### Documentation Language

**Brazilian Portuguese** for:

- README.md, CHANGELOG.md
- Business documentation (PRD, requirements)
- User-facing content and UI messages
- Issue descriptions, project management

```typescript
/**
 * Calcula a taxa de engajamento de um lead com base nas respostas fornecidas.
 *
 * @param responses - Respostas coletadas do lead durante o fluxo
 * @param flowDefinition - Definição do fluxo de conversa
 * @returns Taxa de engajamento entre 0.0 e 1.0
 *
 * @example
 * const engagement = calculateEngagement(leadResponses, healthPlanFlow);
 * // engagement = 0.85 (85% do fluxo completado)
 */
export function calculateEngagement(
  responses: LeadResponses,
  flowDefinition: FlowDefinition
): number {
  // Implementation
}
```

### UI Messages

**Brazilian Portuguese** for all user-facing text:

- Button labels, form fields, error messages
- Notifications, tooltips, help text
- Dashboard headings, navigation labels

```typescript
// ✅ CORRECT
const messages = {
  buttonAnalyze: 'Analisar Lead',
  errorLoadingData: 'Erro ao carregar dados. Tente novamente.',
  successMessage: 'Lead qualificado com sucesso!',
};

// ❌ WRONG
const messages = {
  buttonAnalyze: 'Analyze Lead',
  errorLoadingData: 'Error loading data. Try again.',
  successMessage: 'Lead qualified successfully!',
};
```

---

## 2. Code Organization

### Project Structure

```
Consultor.AI/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── auth/                     # Auth pages (login, signup)
│   │   ├── admin/                    # Admin panel pages
│   │   │   ├── dashboard/            # Admin dashboard (stats, charts)
│   │   │   └── users/                # User management
│   │   ├── dashboard/                # Consultant dashboard
│   │   │   ├── analytics/            # Analytics page
│   │   │   ├── integracoes/          # CRM integrations
│   │   │   ├── leads/                # Lead management
│   │   │   ├── flows/                # Flow editor
│   │   │   ├── templates/            # Message templates
│   │   │   └── perfil/               # Profile & WhatsApp settings
│   │   ├── api/                      # API routes
│   │   │   ├── admin/                # Admin API (stats, users)
│   │   │   ├── analytics/            # Analytics endpoints
│   │   │   ├── billing/              # Billing (checkout, portal, webhooks)
│   │   │   ├── contact/              # Contact form
│   │   │   ├── conversations/        # Conversation management
│   │   │   ├── files/                # File upload/download
│   │   │   ├── integrations/         # CRM integrations
│   │   │   ├── leads/                # Lead CRUD + stats + export
│   │   │   └── webhook/meta/         # WhatsApp webhooks
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/                    # React components
│   │   ├── ui/                        # shadcn/ui base components
│   │   ├── admin/                     # Admin panel (guard, sidebar, charts, tables)
│   │   ├── billing/                   # Pricing, checkout, credits display
│   │   ├── cookie-consent/            # LGPD cookie banner
│   │   ├── dashboard/                 # Dashboard widgets (metrics, charts)
│   │   ├── integrations/              # CRM integration components
│   │   ├── landing/                   # Landing page (hero, features, testimonials, FAQ, footer)
│   │   ├── leads/                     # Lead management components
│   │   ├── whatsapp/                  # WhatsApp integration components
│   │   └── providers.tsx              # React Query provider
│   │
│   ├── lib/                           # Core libraries & utilities
│   │   ├── ai/                        # AI integration (Gemini)
│   │   ├── api/                       # External API wrappers
│   │   ├── email/                     # Email provider (Resend) & templates
│   │   ├── encryption/                # AES-256-GCM encryption
│   │   ├── flow-engine/               # Conversation flow engine
│   │   │   ├── types.ts
│   │   │   ├── parser.ts
│   │   │   ├── state-manager.ts
│   │   │   ├── executors.ts
│   │   │   └── engine.ts
│   │   ├── monitoring/                # Logger, performance, Sentry
│   │   ├── payment/                   # Payment processing (Stripe)
│   │   │   ├── processor.ts           # PaymentProcessor interface + Stripe impl
│   │   │   └── plans.ts              # Plan definitions & credit allocations
│   │   ├── services/                  # Business logic services
│   │   │   ├── analytics-service.ts
│   │   │   ├── ai-service.ts
│   │   │   ├── billing-service.ts     # Subscription & credit management
│   │   │   ├── crm-service.ts
│   │   │   ├── crm-providers/         # CRM provider implementations
│   │   │   ├── lead-service.ts
│   │   │   ├── lead-auto-create.ts
│   │   │   └── stats-service.ts       # Daily stats calculation
│   │   ├── supabase/                  # Client, server, middleware
│   │   ├── validations/               # Zod schemas
│   │   ├── whatsapp/                  # Meta API client & webhook validation
│   │   └── utils.ts
│   │
│   ├── types/                         # TypeScript definitions
│   ├── hooks/                         # Custom React hooks
│   ├── middleware.ts                  # Next.js auth middleware
│   └── styles/
│       └── globals.css
│
├── supabase/
│   ├── migrations/                    # Database migrations (ordered)
│   └── seed/                          # Seed data (flows, SQL)
│
├── tests/
│   ├── unit/                          # Unit tests (.test.ts)
│   ├── integration/                   # Integration tests (.test.ts)
│   ├── e2e/                           # E2E tests (.spec.ts)
│   ├── fixtures/                      # Reusable test data
│   └── mocks/                         # Mock clients (Supabase, APIs)
│
├── docs/                              # Documentation
├── specs/                             # Feature specifications
├── scripts/                           # Utility scripts
├── .rules/                            # Development rules
└── public/                            # Static assets
```

### File Naming Conventions

| Type                  | Convention       | Example                             |
| --------------------- | ---------------- | ----------------------------------- |
| Components            | kebab-case       | `lead-list.tsx`, `metrics-card.tsx` |
| Utilities             | kebab-case       | `date-utils.ts`, `format-number.ts` |
| Types                 | kebab-case       | `database.ts`, `api-types.ts`       |
| API Routes            | kebab-case       | `route.ts` in `api/leads/[id]/`     |
| Constants             | UPPER_SNAKE_CASE | `MAX_LEADS_PER_PAGE`                |
| Environment Variables | UPPER_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL`          |

---

## 3. TypeScript Standards

### Strict Mode Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Definitions

**✅ DO:** Use explicit types for function parameters and return values

```typescript
function calculateConversionRate(totalLeads: number, convertedLeads: number): number {
  return convertedLeads / totalLeads;
}
```

**❌ DON'T:** Rely on type inference for public APIs

```typescript
function calculateConversionRate(totalLeads, convertedLeads) {
  return convertedLeads / totalLeads;
}
```

### Interface vs Type

**✅ Use `interface` for:** Object shapes that may be extended

```typescript
interface Lead {
  id: string;
  name: string;
  whatsappNumber: string;
  status: LeadStatus;
}

// Can be extended
interface QualifiedLead extends Lead {
  score: number;
  qualifiedAt: Date;
}
```

**✅ Use `type` for:** Unions, intersections, primitives

```typescript
type LeadStatus = 'novo' | 'em_contato' | 'agendado' | 'fechado' | 'perdido';
type APIResponse<T> = { success: true; data: T } | { success: false; error: string };
```

### Null Safety

**✅ DO:** Use optional chaining and nullish coalescing

```typescript
const leadName = lead?.name ?? 'Unknown';
const phoneNumber = lead.metadata?.whatsapp ?? lead.whatsapp_number;
```

**❌ DON'T:** Use ! (non-null assertion) without justification

```typescript
const leadName = lead!.name; // Dangerous if lead can be null
```

### Generic Types

**✅ DO:** Use generics for reusable functions

```typescript
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json() as T;
}

const leads = await fetchData<Lead[]>('/api/leads');
```

---

## 4. React and Next.js Patterns

### Component Structure

```typescript
// lead-list.tsx
'use client'; // Only if client-side features needed

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LeadStatusBadge } from './lead-status-badge';
import type { Lead } from '@/types';

interface LeadListProps {
  consultantId: string;
  initialLeads?: Lead[];
}

export function LeadList({ consultantId, initialLeads = [] }: LeadListProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isLoading, setIsLoading] = useState(false);

  // Component logic...

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <Card key={lead.id}>
          {/* Component JSX */}
        </Card>
      ))}
    </div>
  );
}
```

### Server vs Client Components

**✅ Default to Server Components:**

- Faster initial load
- Better SEO
- Reduced client bundle size

```typescript
// app/leads/page.tsx (Server Component)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { LeadList } from '@/components/leads/lead-list';

export default async function LeadsPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  return <LeadList initialLeads={leads || []} />;
}
```

**✅ Use 'use client' only when needed:**

- User interactions (onClick, onChange)
- Browser APIs (localStorage, navigator)
- React hooks (useState, useEffect, useContext)
- Third-party libraries that require client-side

### Data Fetching

**✅ DO:** Use React Server Components for initial data

```typescript
// Server Component
async function getLeads(consultantId: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('leads').select('*');
  return data;
}
```

**✅ DO:** Use React Query for client-side mutations

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, status }: UpdateStatusParams) => {
      const response = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
```

### Form Handling

**✅ DO:** Use React Hook Form + Zod for validation

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  whatsappNumber: z.string().regex(/^\+55\d{11}$/, 'Número inválido'),
  email: z.string().email('Email inválido').optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function LeadForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 5. Supabase and Database

### Client Initialization

```typescript
// lib/supabase/client.ts (Client-side)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export const createClient = () => {
  return createClientComponentClient<Database>();
};

// lib/supabase/server.ts (Server-side)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};
```

### Query Patterns

**✅ DO:** Use type-safe queries with generated types

```typescript
const { data, error } = await supabase
  .from('leads')
  .select('id, name, status, consultant:consultants(name, email)')
  .eq('status', 'novo')
  .order('created_at', { ascending: false })
  .limit(20);

// data is fully typed!
```

**✅ DO:** Handle errors explicitly

```typescript
const { data, error } = await supabase.from('leads').select('*');

if (error) {
  console.error('Database error:', error);
  throw new Error('Failed to fetch leads');
}

return data;
```

**❌ DON'T:** Ignore errors

```typescript
const { data } = await supabase.from('leads').select('*');
return data; // What if there was an error?
```

### Row-Level Security (RLS)

**✅ ALWAYS enable RLS on all tables:**

```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can view own leads"
  ON leads FOR SELECT
  USING (consultant_id = auth.uid());

CREATE POLICY "Consultants can update own leads"
  ON leads FOR UPDATE
  USING (consultant_id = auth.uid());
```

### Real-time Subscriptions

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useLeadUpdates(consultantId: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `consultant_id=eq.${consultantId}`,
        },
        payload => {
          // Handle real-time update
          setLeads(prev => updateLeadsArray(prev, payload));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultantId, supabase]);

  return leads;
}
```

---

## 6. API Development

### API Route Structure

```typescript
// app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const updateLeadSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['novo', 'em_contato', 'agendado', 'fechado']).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase.from('leads').select('*').eq('id', params.id).single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    // Validate input
    const validatedData = updateLeadSchema.parse(body);

    // Update database
    const { data, error } = await supabase
      .from('leads')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

### Error Response Format

**✅ Standard error response:**

```typescript
type ErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
  meta: {
    timestamp: string;
    request_id?: string;
  };
};
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});

// Usage in API route
export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await rateLimit.limit(ip);

  if (!success) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Process request...
}
```

---

## 7. Error Handling

### Custom Error Classes

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}
```

### Error Boundaries

```typescript
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Algo deu errado</h2>
      <p className="mt-2 text-muted-foreground">
        Ocorreu um erro inesperado. Por favor, tente novamente.
      </p>
      <Button onClick={reset} className="mt-4">
        Tentar novamente
      </Button>
    </div>
  );
}
```

---

## 8. Testing

### Unit Tests (Vitest)

```typescript
// __tests__/lib/flow-engine/parser.test.ts
import { describe, it, expect } from 'vitest';
import { FlowParser } from '@/lib/flow-engine/parser';
import { mockHealthPlanFlow } from '@/test-utils/fixtures';

describe('FlowParser', () => {
  it('should parse valid flow definition', () => {
    const parser = new FlowParser(mockHealthPlanFlow);

    expect(parser.isValid()).toBe(true);
    expect(parser.getSteps()).toHaveLength(6);
  });

  it('should reject flow without initial step', () => {
    const invalidFlow = { etapas: [] };
    const parser = new FlowParser(invalidFlow);

    expect(parser.isValid()).toBe(false);
    expect(parser.getErrors()).toContain('No initial step defined');
  });

  it('should validate step transitions', () => {
    const parser = new FlowParser(mockHealthPlanFlow);

    expect(parser.canTransition('inicio', 'perfil')).toBe(true);
    expect(parser.canTransition('inicio', 'resultado')).toBe(false);
  });
});
```

### Integration Tests

```typescript
// __tests__/api/leads.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/leads/route';

describe('POST /api/leads', () => {
  beforeEach(() => {
    // Setup test database
  });

  it('should create a new lead', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        whatsapp_number: '+5511999999999',
        consultant_id: 'test-consultant-id',
      },
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('id');
  });

  it('should return 400 for invalid phone number', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        whatsapp_number: 'invalid',
        consultant_id: 'test-consultant-id',
      },
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/lead-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Lead Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display leads list', async ({ page }) => {
    await page.goto('/leads');

    await expect(page.locator('h1')).toContainText('Leads');
    await expect(page.locator('[data-testid="lead-card"]')).toHaveCount(5);
  });

  test('should update lead status', async ({ page }) => {
    await page.goto('/leads');

    const firstLead = page.locator('[data-testid="lead-card"]').first();
    await firstLead.click();

    await page.selectOption('[name="status"]', 'em_contato');
    await page.click('button:has-text("Salvar")');

    await expect(page.locator('.toast')).toContainText('Lead atualizado');
  });
});
```

### Test Coverage Goals

- **Unit tests:** > 80% coverage
- **Integration tests:** All API endpoints
- **E2E tests:** Critical user journeys

---

## 9. Performance

### Next.js Optimization

**✅ DO:** Use Image optimization

```typescript
import Image from 'next/image';

<Image
  src="/consultant-profile.jpg"
  alt="Consultant profile"
  width={200}
  height={200}
  priority // For above-the-fold images
/>
```

**✅ DO:** Use dynamic imports for heavy components

```typescript
import dynamic from 'next/dynamic';

const AnalyticsChart = dynamic(() => import('@/components/analytics-chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Only render client-side
});
```

**✅ DO:** Implement pagination

```typescript
const LEADS_PER_PAGE = 20;

async function getLeads(page: number = 1) {
  const from = (page - 1) * LEADS_PER_PAGE;
  const to = from + LEADS_PER_PAGE - 1;

  const { data, count } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .range(from, to);

  return { data, totalPages: Math.ceil((count || 0) / LEADS_PER_PAGE) };
}
```

### Database Optimization

**✅ DO:** Use indexes for frequent queries

```sql
CREATE INDEX idx_leads_consultant_status ON leads(consultant_id, status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
```

**✅ DO:** Use `select()` to limit returned columns

```typescript
// ❌ BAD: Fetches all columns
const { data } = await supabase.from('leads').select('*');

// ✅ GOOD: Only fetches needed columns
const { data } = await supabase.from('leads').select('id, name, status, created_at');
```

---

## 10. Security

### Environment Variables

**✅ DO:** Never commit secrets

```env
# .env.local (gitignored)
SUPABASE_SERVICE_ROLE_KEY=your-service-key
GROQ_API_KEY=your-api-key
GOOGLE_AI_API_KEY=your-gemini-key
CANVA_API_KEY=your-api-key
WHATSAPP_WEBHOOK_SECRET=your-webhook-secret

# Stripe (Payment)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (Resend)
RESEND_API_KEY=re_...

# OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

**✅ DO:** Use `NEXT_PUBLIC_` prefix for client-side vars

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Input Validation

\*\*✅ ALWAYS validate user input with Zod

```typescript
import { z } from 'zod';

const leadUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  whatsappNumber: z.string().regex(/^\+55\d{11}$/),
  email: z.string().email().optional(),
});

// In API route
const validatedData = leadUpdateSchema.parse(await request.json());
```

### SQL Injection Prevention

**✅ ALWAYS use parameterized queries** (Supabase does this automatically)

```typescript
// ✅ SAFE: Supabase parameterizes automatically
const { data } = await supabase.from('leads').select('*').eq('whatsapp_number', userInput);

// ❌ NEVER do raw SQL with user input
const result = await supabase.rpc('raw_query', {
  query: `SELECT * FROM leads WHERE whatsapp_number = '${userInput}'`,
});
```

### XSS Prevention

**✅ React escapes by default**, but be careful with `dangerouslySetInnerHTML`

```typescript
// ✅ SAFE: React escapes automatically
<div>{userInput}</div>

// ❌ DANGEROUS: Only use with sanitized content
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

---

## 11. Git Workflow

### Branch Naming

| Type          | Format                | Example                       |
| ------------- | --------------------- | ----------------------------- |
| Feature       | `feature/description` | `feature/add-lead-export`     |
| Bug fix       | `fix/description`     | `fix/dashboard-loading-error` |
| Hotfix        | `hotfix/description`  | `hotfix/critical-auth-bug`    |
| Documentation | `docs/description`    | `docs/update-api-spec`        |

### Commit Messages

Follow Conventional Commits:

```bash
# Format: <type>(<scope>): <subject>

feat(leads): add CSV export functionality
fix(auth): resolve session timeout issue
docs(api): update authentication endpoints
refactor(flow-engine): simplify state management
test(analytics): add unit tests for metrics calculation
chore(deps): update Next.js to 14.1.0
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code restructuring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

---

## 12. Code Review Checklist

### Functionality

- [ ] Code solves the intended problem
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Input validation present

### Code Quality

- [ ] Follows TypeScript best practices
- [ ] No `any` types (unless justified)
- [ ] Proper error handling
- [ ] No console.logs in production code
- [ ] No commented-out code

### Performance

- [ ] No unnecessary re-renders
- [ ] Database queries optimized
- [ ] Proper use of caching
- [ ] Images optimized

### Security

- [ ] Input validation with Zod
- [ ] No hardcoded secrets
- [ ] RLS policies enforced
- [ ] No SQL injection risks

### Testing

- [ ] Unit tests added/updated
- [ ] Tests passing
- [ ] Coverage maintained > 80%

### Documentation

- [ ] JSDoc comments for public APIs
- [ ] README updated if needed
- [ ] CHANGELOG.md updated

---

## 13. SaaS & Billing Standards

### Subscription Plans

The platform uses a credit-based SaaS model with three tiers:

| Plan         | Price | Credits/month | Key Features                       |
| ------------ | ----- | ------------- | ---------------------------------- |
| **Freemium** | R$0   | 20            | Basic flow, text-only              |
| **Pro**      | R$47  | 200           | Images, auto follow-up, CSV export |
| **Agência**  | R$147 | 1000          | Custom flows, CRM, full dashboard  |

### Credit Operations

**✅ ALWAYS use atomic operations for credits:**

```sql
-- Use RPC for atomic credit deduction
SELECT decrement_credits(user_id, amount);
-- Never do: UPDATE consultants SET credits = credits - 1
```

```typescript
// ✅ CORRECT: Atomic credit deduction via RPC
const { error } = await (supabase.rpc as any)('decrement_credits', {
  user_id: consultantId,
  amount: 1,
});

// ❌ WRONG: Race condition possible
const { data } = await supabase.from('consultants').select('credits');
await supabase.from('consultants').update({ credits: data.credits - 1 });
```

### Subscription Status Lifecycle

```
active → cancel_at_period_end → deleted
active → past_due → deleted
```

- **active**: Full access, credits available
- **cancel_at_period_end**: Access until period ends, no renewal
- **past_due**: Payment failed, grace period
- **deleted**: Subscription ended, revert to Freemium

### Payment Webhook Security

```typescript
// ✅ ALWAYS verify Stripe webhook signatures
const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
```

### Lead Limit Enforcement

Credits are checked in `createLead` service. When credits reach 0:

- Block new lead creation
- Show upgrade prompt in UI
- Allow viewing existing leads (read-only)

---

## 14. File Upload & Storage

### Allowed File Types

| Type      | Extensions                       | Max Size |
| --------- | -------------------------------- | -------- |
| Documents | `.pdf`                           | 10 MB    |
| Images    | `.png`, `.jpg`, `.jpeg`, `.webp` | 10 MB    |

**✅ ALWAYS reject:** `.exe`, `.bat`, `.sh`, `.cmd`, and any executable

### Upload Pattern

```typescript
// 1. Validate file type and size on client AND server
// 2. Generate presigned upload URL via API
// 3. Upload directly to Supabase Storage
// 4. Save metadata to files table with consultant_id
// 5. Serve via time-limited download URLs (1 hour expiry)
```

### Storage RLS

Files are isolated per consultant via `consultant_id` column with RLS policies.

### Storage Key Convention

```typescript
// Format: {consultant_id}/{timestamp}-{filename}
const storageKey = `${consultantId}/${Date.now()}-${sanitizedFilename}`;
```

> **Pitfall**: The DB column is `storage_key` (not `key`).

---

## 15. Email & Notifications

### Email Provider Pattern

Uses Strategy pattern with dev fallback:

- **Production**: Resend API
- **Development**: `console.log` fallback (no API key needed)

### Email Templates

| Template               | Trigger                 |
| ---------------------- | ----------------------- |
| Welcome                | New signup              |
| Password Reset         | Password reset request  |
| Subscription Confirmed | Successful payment      |
| Subscription Canceled  | Cancellation            |
| Credit Low Warning     | Credits < 10% remaining |

### Email Standards

```typescript
// ✅ CORRECT: Always handle missing API key gracefully
if (!process.env.RESEND_API_KEY) {
  console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
  return { success: true, data: { id: 'dev-fallback' } };
}
```

- All emails must include unsubscribe link (LGPD)
- Use React Email for template rendering
- Log all sent emails for audit trail

---

## Additional Resources

### Recommended Packages

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.2",
    "stripe": "^14.0.0",
    "resend": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Stripe Documentation](https://docs.stripe.com/)
- [Resend Documentation](https://resend.com/docs)

---

**Last Updated:** 2026-02-11
**Version:** 2.0
**Maintainer:** Consultor.AI Development Team
**Next Review:** 2026-05-11
