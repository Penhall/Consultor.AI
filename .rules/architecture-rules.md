# Architecture Rules - Consultor.AI

**Version:** 2.0
**Last Updated:** 2026-02-11

---

## Architectural Principles

### 1. Separation of Concerns

- **Components** handle UI rendering only
- **Hooks** handle data fetching and state management
- **Services/Libs** handle business logic
- **API Routes** handle server-side operations

### 2. Unidirectional Data Flow

```
User Action → Component → Hook → API → Database → Hook → Component → UI Update
```

### 3. Server-First Architecture

- Default to Server Components
- Use Client Components only when necessary
- Keep business logic on the server

---

## Component Architecture

### Server vs Client Components

**Server Components (default):**

```typescript
// app/leads/page.tsx - NO 'use client'
import { LeadList } from '@/components/leads/lead-list';

export default async function LeadsPage() {
  const leads = await getLeads(); // Fetch on server
  return <LeadList initialData={leads} />;
}
```

**Client Components (when needed):**

```typescript
// components/leads/lead-list.tsx - WITH 'use client'
'use client';

import { useState } from 'react';

export function LeadList({ initialData }: Props) {
  const [leads, setLeads] = useState(initialData);
  // Interactive logic here
}
```

**When to use Client Components:**

- Event handlers (onClick, onChange)
- Hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, geolocation)
- Third-party libraries requiring window/document

---

## Data Flow Architecture

### Layer Responsibilities

```
┌─────────────────────────────────────────────────┐
│ Presentation Layer (Components)                 │
│ - Render UI                                     │
│ - Handle user interactions                      │
│ - Call hooks for data                           │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Data Layer (Hooks)                              │
│ - Fetch data                                    │
│ - Cache data (React Query)                     │
│ - Manage local state                            │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ API Layer (Route Handlers)                      │
│ - Authentication                                 │
│ - Authorization                                  │
│ - Input validation                               │
│ - Call services                                  │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Business Logic Layer (Services/Libs)            │
│ - Flow execution                                 │
│ - AI orchestration                               │
│ - Business rules                                 │
│ - Billing & credits                              │
│ - Payment processing                             │
│ - Email notifications                            │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Data Access Layer (Supabase Client)             │
│ - Database queries                               │
│ - Real-time subscriptions                        │
│ - Storage operations                             │
└─────────────────────────────────────────────────┘
```

---

## API Route Structure

### Standard Pattern

```typescript
// app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getLeadById, updateLead } from '@/lib/services/lead-service';

// 1. Validation Schema
const updateLeadSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(['novo', 'em_contato', 'agendado', 'fechado']).optional(),
});

// 2. GET Handler
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 2a. Authentication
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2b. Business Logic (via service)
    const lead = await getLeadById(params.id);

    // 2c. Authorization (check ownership)
    if (lead.consultant_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // 2d. Response
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    // 2e. Error Handling
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// 3. PATCH Handler
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 3a. Authentication
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 3b. Input Validation
    const body = await request.json();
    const validatedData = updateLeadSchema.parse(body);

    // 3c. Business Logic (via service)
    const updatedLead = await updateLead(params.id, validatedData, user.id);

    // 3d. Response
    return NextResponse.json({ success: true, data: updatedLead });
  } catch (error) {
    // 3e. Error Handling
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

---

## Service Layer Pattern

### ServiceResult Convention

All services return a discriminated union for consistent error handling:

```typescript
type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };
```

Services in `src/lib/services/` handle business logic. Payment services in `src/lib/payment/`.

### Dedicated Service Files

```typescript
// lib/services/lead-service.ts
import { createClient } from '@/lib/supabase/server';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import type { Lead, LeadUpdateInput } from '@/types';

/**
 * Busca um lead por ID.
 * Valida que o lead pertence ao consultant_id fornecido.
 */
export async function getLeadById(leadId: string, consultantId?: string): Promise<Lead> {
  const supabase = createClient();

  const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).single();

  if (error || !data) {
    throw new NotFoundError('Lead');
  }

  if (consultantId && data.consultant_id !== consultantId) {
    throw new UnauthorizedError('Lead does not belong to consultant');
  }

  return data;
}

/**
 * Atualiza um lead.
 * Valida ownership antes de atualizar.
 */
export async function updateLead(
  leadId: string,
  updates: LeadUpdateInput,
  consultantId: string
): Promise<Lead> {
  const supabase = createClient();

  // Verify ownership
  await getLeadById(leadId, consultantId);

  // Update
  const { data, error } = await supabase
    .from('leads')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to update lead');
  }

  return data;
}
```

---

## Flow Engine Architecture

### Flow Execution Pattern

```typescript
// lib/flow-engine/executor.ts

export class FlowExecutor {
  constructor(
    private flowDefinition: FlowDefinition,
    private stateManager: StateManager,
    private aiOrchestrator: AIOrchestrator
  ) {}

  /**
   * Executa um passo do fluxo baseado no input do usuário.
   */
  async executeStep(conversationId: string, userInput: string): Promise<FlowStepResult> {
    // 1. Load current state
    const state = await this.stateManager.getState(conversationId);

    // 2. Get current step definition
    const currentStep = this.flowDefinition.steps.find(s => s.id === state.currentStepId);

    if (!currentStep) {
      throw new Error(`Step ${state.currentStepId} not found`);
    }

    // 3. Process user input
    const processedInput = this.processInput(currentStep, userInput);

    // 4. Update state with response
    state.responses[currentStep.id] = processedInput;

    // 5. Determine next step
    const nextStep = this.determineNextStep(currentStep, processedInput);

    // 6. Generate response (if AI step)
    let response: string;
    if (nextStep.type === 'executar' && nextStep.action === 'gerar_resposta_ia') {
      response = await this.aiOrchestrator.generateResponse(state);
    } else {
      response = this.formatStepMessage(nextStep, state);
    }

    // 7. Save updated state
    state.currentStepId = nextStep.id;
    await this.stateManager.saveState(conversationId, state);

    // 8. Return result
    return {
      nextStep: nextStep.id,
      response,
      isComplete: nextStep.id === 'final',
    };
  }

  private processInput(step: FlowStep, input: string): string {
    if (step.type === 'escolha') {
      // Validate input is a valid option
      const option = step.opcoes?.find(o => o.valor === input);
      if (!option) {
        throw new ValidationError('Invalid option selected');
      }
      return input;
    }
    return input;
  }

  private determineNextStep(currentStep: FlowStep, input: string): FlowStep {
    // Logic to determine next step based on current step and input
    const nextStepId = currentStep.proxima;
    const nextStep = this.flowDefinition.steps.find(s => s.id === nextStepId);

    if (!nextStep) {
      throw new Error(`Next step ${nextStepId} not found`);
    }

    return nextStep;
  }

  private formatStepMessage(step: FlowStep, state: ConversationState): string {
    // Replace template variables in message
    return (
      step.conteudo?.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return state.context[key] || match;
      }) || ''
    );
  }
}
```

---

## Database Access Patterns

### Direct Queries (Simple Operations)

```typescript
// For simple CRUD operations in API routes
const { data } = await supabase.from('leads').select('*').eq('id', leadId);
```

### Service Layer (Complex Operations)

```typescript
// For business logic, use service layer
import { leadService } from '@/lib/services/lead-service';
const lead = await leadService.getQualifiedLeads(consultantId);
```

### RLS (Row-Level Security)

**ALWAYS rely on RLS for authorization:**

```sql
-- Don't check consultant_id in application code
-- Let RLS handle it

CREATE POLICY "consultants_own_leads"
  ON leads FOR ALL
  USING (consultant_id = auth.uid());
```

```typescript
// ✅ GOOD: RLS enforces security
const { data } = await supabase.from('leads').select('*');
// User can only see their own leads

// ❌ BAD: Manual filtering (RLS still applies, but redundant)
const { data } = await supabase.from('leads').select('*').eq('consultant_id', user.id);
```

---

## Integration Architecture

### Strategy Pattern for External Services

Use the Strategy pattern for services that may have multiple providers:

```typescript
// ✅ GOOD: Define interface, implement per provider
interface PaymentProcessor {
  createCheckoutSession(params: CheckoutParams): Promise<{ url: string }>;
  getCustomerPortal(customerId: string): Promise<{ url: string }>;
  handleWebhook(body: string, signature: string): Promise<WebhookResult>;
}

class StripeProcessor implements PaymentProcessor {
  // Stripe-specific implementation
}
```

```typescript
// ✅ GOOD: Email provider with dev fallback
interface EmailProvider {
  sendEmail(params: EmailParams): Promise<ServiceResult<{ id: string }>>;
  sendTemplate(
    template: string,
    to: string,
    data: Record<string, unknown>
  ): Promise<ServiceResult<{ id: string }>>;
}

class ResendProvider implements EmailProvider {
  /* ... */
}
class ConsoleProvider implements EmailProvider {
  /* dev fallback */
}
```

### External Service Wrappers

```typescript
// lib/ai/gemini.ts - AI Service
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateAIResponse(
  prompt: string,
  context: Record<string, string>
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

```typescript
// lib/payment/processor.ts - Payment Service
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class StripeProcessor implements PaymentProcessor {
  async createCheckoutSession(params: CheckoutParams) {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: `${params.appUrl}/dashboard?checkout=success`,
      cancel_url: `${params.appUrl}/pricing`,
      customer_email: params.email,
      metadata: { consultant_id: params.consultantId },
    });
    return { url: session.url! };
  }
}
```

### Webhook Handler Pattern

Webhooks must respond fast (< 200ms) and verify signatures:

```typescript
// Pattern for all webhook handlers:
// 1. Verify signature (HMAC/Stripe)
// 2. Parse payload
// 3. Acknowledge immediately (200 OK)
// 4. Process asynchronously if needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    // 1. Verify (throws on invalid)
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // 2. Process by event type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
    }

    // 3. Acknowledge
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
```

### WhatsApp Webhook Handler

```typescript
// Validates HMAC SHA-256 signature from Meta
// Handles message types: text, interactive (buttons/lists), media
// Uses whatsapp_message_id for idempotency (dedup retries)
// Responds with 200 immediately, processes async
```

---

## State Management

### Client-Side State

**1. Server State (React Query):**

```typescript
// For data from API
import { useQuery } from '@tanstack/react-query';

export function useLeads(consultantId: string) {
  return useQuery({
    queryKey: ['leads', consultantId],
    queryFn: () => fetchLeads(consultantId),
    staleTime: 60 * 1000, // 1 minute
  });
}
```

**2. UI State (useState/useReducer):**

```typescript
// For temporary UI state
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
```

**3. Global State (Zustand) - Use sparingly:**

```typescript
// Only for truly global state (auth, theme, etc.)
import { create } from 'zustand';

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  setUser: user => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

### Server-Side State

**Database as source of truth:**

- Don't duplicate database state in memory
- Use database queries with proper indexes
- Leverage Supabase real-time for live updates

---

## Admin Panel Architecture

### Role-Based Access Control

Admin access is controlled by the `is_admin` boolean flag on the `consultants` table:

```typescript
// Admin guard pattern - used in admin layouts and API routes
export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase.from('consultants').select('is_admin').eq('id', user.id).single();

  return data?.is_admin === true;
}
```

**Admin API routes** check `is_admin` in the handler (not via RLS, since admin tables use `service_role`).

### Admin Dashboard Metrics

```
┌────────────────────────────────────────────────┐
│ Daily Stats (pg_cron → daily_stats table)      │
│ - total_revenue, total_users, active_subs      │
│ - total_leads, page_views                      │
│ - Day-over-day deltas (percentage change)      │
└────────────────────────────────────────────────┘
```

---

## Scheduled Jobs Architecture

### pg_cron Pattern

Background jobs run via PostgreSQL `pg_cron` extension:

| Job                   | Schedule     | Function                                         |
| --------------------- | ------------ | ------------------------------------------------ |
| Calculate daily stats | Hourly       | Aggregates revenue, users, leads, views          |
| Reset monthly credits | 1st of month | Resets `credits` to `monthly_credits_allocation` |

```sql
-- Example: hourly stats calculation
SELECT cron.schedule(
  'calculate-daily-stats',
  '0 * * * *',  -- Every hour
  $$SELECT calculate_daily_stats()$$
);

-- Example: monthly credit reset
SELECT cron.schedule(
  'reset-monthly-credits',
  '0 0 1 * *',  -- 1st of every month at midnight
  $$SELECT reset_monthly_credits()$$
);
```

**Error Handling**: Jobs log errors to the `logs` table with `level: 'error'` and `source: 'pg_cron'`.

---

## File Storage Architecture

### Upload Flow

```
Client → API (validate) → Supabase Storage (upload) → DB (save metadata)
                                                            ↓
Client ← API (signed URL) ← Supabase Storage (createSignedUrl) ←
```

### Key Decisions

- **Direct upload**: Client uploads to Supabase Storage via presigned URL
- **Time-limited downloads**: Signed URLs expire after 1 hour
- **User isolation**: RLS on `files` table via `consultant_id`
- **Validation**: File type + size checked on both client and server
- **Storage key**: `{consultant_id}/{timestamp}-{filename}`

---

## LGPD Compliance Architecture

### Cookie Consent

```
┌─────────────────────────────────────────────────┐
│ Cookie Banner (bottom of page)                  │
│ - Shows on first visit                          │
│ - Persisted in localStorage                     │
│ - Blocks analytics scripts until accepted       │
└─────────────────────────────────────────────────┘
```

### Data Protection Measures

- **Encryption at rest**: Sensitive tokens encrypted with AES-256-GCM
- **Data isolation**: RLS policies ensure tenant separation
- **Audit trail**: All email sends logged
- **Right to deletion**: Admin can delete user data
- **Cookie consent**: Required before loading analytics

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────┐
│ Layer 1: Network (HTTPS, Rate Limiting)        │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Layer 2: Authentication (Supabase Auth + OAuth) │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Layer 3: Authorization (RLS + Admin Guard)      │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Layer 4: Input Validation (Zod)                │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Layer 5: Webhook Signatures (HMAC / Stripe)    │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Layer 6: Business Logic Validation             │
└─────────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User logs in via Supabase Auth (email/password or OAuth)
2. Supabase returns JWT token
3. Token stored in httpOnly cookie
4. All requests include cookie
5. Supabase validates token
6. RLS policies check auth.uid()
7. Admin routes additionally check is_admin flag
```

### Webhook Security

| Provider        | Verification Method                                               |
| --------------- | ----------------------------------------------------------------- |
| Meta (WhatsApp) | HMAC SHA-256 with `x-hub-signature-256` header                    |
| Stripe          | `stripe.webhooks.constructEvent()` with `stripe-signature` header |

---

## Monitoring Architecture

### Logging Strategy

```typescript
// lib/monitoring/logger.ts
export const logger = {
  // Production: send to service (Sentry, LogRocket)
  // Development: console.log

  error: (message: string, error: unknown, context?: Record<string, unknown>) => {
    const logEntry = {
      level: 'error',
      message,
      error: serializeError(error),
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
      sendToSentry(logEntry);
    } else {
      console.error(logEntry);
    }
  },

  // ... other methods
};
```

### Metrics to Track

- **Performance:** API response times, database query times
- **Business:** Lead conversion rates, flow completion rates, revenue (MRR)
- **SaaS:** Active subscriptions, churn rate, credit usage, plan distribution
- **Errors:** Error rates by type, failed API calls, webhook failures
- **Usage:** Active users, messages sent, API usage, file storage

---

**Last Updated:** 2026-02-11
**Version:** 2.0
**Next Review:** 2026-05-11
