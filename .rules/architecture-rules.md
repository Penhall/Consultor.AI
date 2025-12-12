# Architecture Rules - Consultor.AI

**Version:** 1.0
**Last Updated:** 2025-12-12

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
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 2a. Authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2b. Business Logic (via service)
    const lead = await getLeadById(params.id);

    // 2c. Authorization (check ownership)
    if (lead.consultant_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 2d. Response
    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    // 2e. Error Handling
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 3. PATCH Handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 3a. Authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
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
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Service Layer Pattern

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
export async function getLeadById(
  leadId: string,
  consultantId?: string
): Promise<Lead> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

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
  async executeStep(
    conversationId: string,
    userInput: string
  ): Promise<FlowStepResult> {
    // 1. Load current state
    const state = await this.stateManager.getState(conversationId);

    // 2. Get current step definition
    const currentStep = this.flowDefinition.steps.find(
      s => s.id === state.currentStepId
    );

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

  private determineNextStep(
    currentStep: FlowStep,
    input: string
  ): FlowStep {
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
    return step.conteudo?.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return state.context[key] || match;
    }) || '';
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
const { data } = await supabase
  .from('leads')
  .select('*')
  .eq('consultant_id', user.id);
```

---

## Integration Architecture

### External Service Wrappers

```typescript
// lib/api/groq.ts
import Groq from 'groq-sdk';

export class GroqClient {
  private client: Groq;

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });
  }

  async generateResponse(
    prompt: string,
    options?: GenerateOptions
  ): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-70b-versatile',
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 200,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API error:', error);
      throw new AIServiceError('Failed to generate response');
    }
  }
}

// Singleton instance
export const groqClient = new GroqClient();
```

### WhatsApp Webhook Handler

```typescript
// app/api/webhooks/whatsapp/message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/webhooks/verify';
import { processIncomingMessage } from '@/lib/services/message-service';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature
    const signature = request.headers.get('x-webhook-signature');
    const body = await request.text();

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 2. Parse payload
    const payload = JSON.parse(body);

    // 3. Process message (async, non-blocking)
    processIncomingMessage(payload).catch(error => {
      console.error('Failed to process message:', error);
    });

    // 4. Respond immediately (webhook expects fast response)
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

### Server-Side State

**Database as source of truth:**
- Don't duplicate database state in memory
- Use database queries with proper indexes
- Leverage Supabase real-time for live updates

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────┐
│ Layer 1: Network (HTTPS, Rate Limiting)        │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Layer 2: Authentication (Supabase Auth)        │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Layer 3: Authorization (RLS Policies)          │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Layer 4: Input Validation (Zod)                │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│ Layer 5: Business Logic Validation             │
└─────────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User logs in via Supabase Auth
2. Supabase returns JWT token
3. Token stored in httpOnly cookie
4. All requests include cookie
5. Supabase validates token
6. RLS policies check auth.uid()
```

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
- **Business:** Lead conversion rates, flow completion rates
- **Errors:** Error rates by type, failed API calls
- **Usage:** Active users, messages sent, API usage

---

**Last Updated:** 2025-12-12
**Version:** 1.0
**Next Review:** 2026-03-12
