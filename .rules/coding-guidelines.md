# Coding Guidelines - Consultor.AI

**Version:** 1.0
**Last Updated:** 2025-12-12

---

## TypeScript Code Style

### Naming Conventions

```typescript
// Variables and functions: camelCase
const leadCount = 10;
function calculateEngagement() {}

// Classes and interfaces: PascalCase
class LeadManager {}
interface Lead {}

// Constants: UPPER_SNAKE_CASE
const MAX_LEADS_PER_PAGE = 20;
const API_TIMEOUT_MS = 5000;

// Private fields: _camelCase (if not using #private)
class Service {
  private _apiKey: string;
}

// Type aliases: PascalCase
type LeadStatus = 'novo' | 'em_contato' | 'agendado' | 'fechado';
```

### Function Signatures

```typescript
// ✅ GOOD: Clear, typed, documented
/**
 * Processa um novo lead e inicia o fluxo de conversação.
 *
 * @param whatsappNumber - Número WhatsApp no formato +55XXXXXXXXXXX
 * @param consultantId - ID do consultor responsável
 * @param flowId - ID do fluxo de conversação a ser utilizado
 * @returns Promise com o lead criado
 * @throws {ValidationError} Se o número for inválido
 * @throws {NotFoundError} Se o consultor não existir
 */
export async function processNewLead(
  whatsappNumber: string,
  consultantId: string,
  flowId: string
): Promise<Lead> {
  // Implementation
}

// ❌ BAD: No types, no documentation
export async function processNewLead(whatsappNumber, consultantId, flowId) {
  // Implementation
}
```

### Async/Await

```typescript
// ✅ GOOD: Proper error handling
async function fetchLead(id: string): Promise<Lead> {
  try {
    const response = await fetch(`/api/leads/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch lead:', error);
    throw new AppError('Failed to load lead data', 500);
  }
}

// ❌ BAD: No error handling
async function fetchLead(id: string): Promise<Lead> {
  const response = await fetch(`/api/leads/${id}`);
  return response.json();
}

// ❌ BAD: Mixing .then() and async/await
async function fetchLead(id: string): Promise<Lead> {
  return fetch(`/api/leads/${id}`).then(r => r.json());
}
```

### Array Operations

```typescript
// ✅ GOOD: Functional approach
const activeLeads = leads.filter(lead => lead.status !== 'perdido');
const leadNames = leads.map(lead => lead.name);
const totalScore = leads.reduce((sum, lead) => sum + (lead.score || 0), 0);

// ❌ BAD: Mutating arrays unnecessarily
const activeLeads = [];
for (let i = 0; i < leads.length; i++) {
  if (leads[i].status !== 'perdido') {
    activeLeads.push(leads[i]);
  }
}
```

### Object Handling

```typescript
// ✅ GOOD: Immutable updates
const updatedLead = {
  ...lead,
  status: 'em_contato',
  updatedAt: new Date(),
};

// ❌ BAD: Mutation
lead.status = 'em_contato';
lead.updatedAt = new Date();

// ✅ GOOD: Destructuring with defaults
const { name = 'Unknown', status = 'novo' } = lead;

// ✅ GOOD: Optional chaining
const email = lead?.metadata?.email ?? 'no-email@example.com';
```

---

## React Patterns

### Component Props

```typescript
// ✅ GOOD: Explicit interface, defaults, destructuring
interface LeadCardProps {
  lead: Lead;
  onUpdate?: (lead: Lead) => void;
  showActions?: boolean;
  className?: string;
}

export function LeadCard({
  lead,
  onUpdate,
  showActions = true,
  className = '',
}: LeadCardProps) {
  // Component implementation
}

// ❌ BAD: No types, no defaults
export function LeadCard(props) {
  const { lead, onUpdate, showActions, className } = props;
  // Component implementation
}
```

### Custom Hooks

```typescript
// ✅ GOOD: Clear, reusable, typed
export function useLeads(consultantId: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLeads() {
      try {
        setIsLoading(true);
        const data = await getLeads(consultantId);

        if (!cancelled) {
          setLeads(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchLeads();

    return () => {
      cancelled = true;
    };
  }, [consultantId]);

  return { leads, isLoading, error };
}
```

### Conditional Rendering

```typescript
// ✅ GOOD: Clear patterns
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{leads.length > 0 ? (
  <LeadList leads={leads} />
) : (
  <EmptyState message="Nenhum lead encontrado" />
)}

// ❌ BAD: Ternary soup
{isLoading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorMessage error={error} />
) : leads.length > 0 ? (
  <LeadList leads={leads} />
) : (
  <EmptyState />
)}
```

---

## Supabase Patterns

### Query Organization

```typescript
// ✅ GOOD: Organized in dedicated functions
export async function getLeadsByStatus(
  consultantId: string,
  status: LeadStatus
): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('id, name, whatsapp_number, status, created_at')
    .eq('consultant_id', consultantId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw new DatabaseError('Failed to fetch leads', error);
  return data || [];
}

// ❌ BAD: Inline queries everywhere
const { data } = await supabase
  .from('leads')
  .select('*')
  .eq('consultant_id', consultantId);
```

### Transaction Patterns

```typescript
// ✅ GOOD: Using RPC for transactions
const { data, error } = await supabase.rpc('create_lead_with_conversation', {
  p_whatsapp_number: whatsappNumber,
  p_consultant_id: consultantId,
  p_flow_id: flowId,
});

// Corresponding SQL function:
// CREATE OR REPLACE FUNCTION create_lead_with_conversation(...)
// RETURNS json AS $$
// BEGIN
//   -- Transaction logic
// END;
// $$ LANGUAGE plpgsql;
```

---

## Error Handling Patterns

### Custom Errors

```typescript
// lib/errors.ts
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

export class WhatsAppAPIError extends AppError {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message, statusCode, 'WHATSAPP_API_ERROR');
    this.name = 'WhatsAppAPIError';
  }
}

// Usage
try {
  await sendWhatsAppMessage(number, message);
} catch (error) {
  throw new WhatsAppAPIError('Failed to send message', error.statusCode);
}
```

### Error Logging

```typescript
// lib/logger.ts
export const logger = {
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    console.error('[ERROR]', {
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context,
      timestamp: new Date().toISOString(),
    });

    // Send to error tracking service (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: context });
    }
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn('[WARN]', { message, context, timestamp: new Date().toISOString() });
  },

  info: (message: string, context?: Record<string, unknown>) => {
    console.log('[INFO]', { message, context, timestamp: new Date().toISOString() });
  },
};

// Usage
try {
  await processLead(leadId);
} catch (error) {
  logger.error('Failed to process lead', error, { leadId });
  throw error;
}
```

---

## Validation Patterns

### Zod Schemas

```typescript
// lib/validators/schemas.ts
import { z } from 'zod';

// Reusable schemas
export const whatsappNumberSchema = z
  .string()
  .regex(/^\+55\d{11}$/, 'Formato inválido: use +55XXXXXXXXXXX');

export const emailSchema = z
  .string()
  .email('Email inválido')
  .optional();

// Entity schemas
export const leadCreateSchema = z.object({
  whatsapp_number: whatsappNumberSchema,
  consultant_id: z.string().uuid(),
  name: z.string().min(2).max(100).optional(),
  email: emailSchema,
  metadata: z.record(z.unknown()).optional(),
});

export const leadUpdateSchema = leadCreateSchema.partial().omit({
  consultant_id: true,
});

// Type inference
export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
```

---

## Performance Best Practices

### Memoization

```typescript
// ✅ GOOD: useMemo for expensive calculations
const filteredLeads = useMemo(() => {
  return leads.filter(lead => {
    const matchesStatus = statusFilter ? lead.status === statusFilter : true;
    const matchesSearch = searchQuery
      ? lead.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });
}, [leads, statusFilter, searchQuery]);

// ✅ GOOD: useCallback for stable function references
const handleLeadUpdate = useCallback((updatedLead: Lead) => {
  setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
}, []);
```

### Code Splitting

```typescript
// ✅ GOOD: Lazy load heavy components
import dynamic from 'next/dynamic';

const AnalyticsChart = dynamic(
  () => import('@/components/analytics/analytics-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

const HeavyModal = dynamic(
  () => import('@/components/modals/heavy-modal'),
  {
    loading: () => <div>Loading...</div>,
  }
);
```

---

## Accessibility (a11y)

### Semantic HTML

```tsx
// ✅ GOOD: Semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/leads">Leads</a></li>
  </ul>
</nav>

<main>
  <h1>Leads</h1>
  <section aria-labelledby="active-leads-heading">
    <h2 id="active-leads-heading">Leads Ativos</h2>
    {/* Content */}
  </section>
</main>

// ❌ BAD: Div soup
<div className="nav">
  <div className="nav-item">Dashboard</div>
  <div className="nav-item">Leads</div>
</div>
```

### ARIA Attributes

```tsx
// ✅ GOOD: Proper ARIA labels
<button
  aria-label="Atualizar lista de leads"
  aria-busy={isLoading}
  disabled={isLoading}
>
  {isLoading ? <Spinner /> : <RefreshIcon />}
</button>

<div
  role="alert"
  aria-live="polite"
  aria-atomic="true"
>
  {errorMessage}
</div>
```

---

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * Executa um fluxo de conversação para um lead específico.
 *
 * O fluxo é executado passo a passo, aguardando a resposta do lead
 * antes de avançar para o próximo passo. O estado da conversa é
 * persistido no banco de dados após cada interação.
 *
 * @param leadId - ID do lead no formato UUID
 * @param flowId - ID do fluxo de conversação
 * @param userInput - Resposta fornecida pelo usuário (texto ou ID de opção)
 * @returns Objeto contendo o próximo passo e a resposta gerada
 *
 * @throws {NotFoundError} Se o lead ou fluxo não for encontrado
 * @throws {ValidationError} Se o input do usuário for inválido
 * @throws {FlowExecutionError} Se houver erro na execução do fluxo
 *
 * @example
 * ```typescript
 * const result = await executeFlowStep(
 *   'lead-uuid-123',
 *   'flow-health-plan',
 *   'familia'
 * );
 * console.log(result.nextStep); // 'idade'
 * console.log(result.response); // 'Ótimo! Qual sua faixa etária?'
 * ```
 *
 * @see {@link FlowEngine} para mais detalhes sobre o motor de fluxos
 * @see {@link docs/architecture/Database-Design-Document.md} para schema
 */
export async function executeFlowStep(
  leadId: string,
  flowId: string,
  userInput: string
): Promise<FlowStepResult> {
  // Implementation
}
```

---

## Common Pitfalls to Avoid

### 1. State Management

```typescript
// ❌ BAD: Mutating state directly
const handleAddLead = (newLead: Lead) => {
  leads.push(newLead); // Mutates array!
  setLeads(leads);
};

// ✅ GOOD: Creating new array
const handleAddLead = (newLead: Lead) => {
  setLeads(prev => [...prev, newLead]);
};
```

### 2. useEffect Dependencies

```typescript
// ❌ BAD: Missing dependencies
useEffect(() => {
  fetchLeads(consultantId); // consultantId not in deps
}, []);

// ✅ GOOD: Complete dependencies
useEffect(() => {
  fetchLeads(consultantId);
}, [consultantId]);
```

### 3. Premature Optimization

```typescript
// ❌ BAD: Over-optimizing simple operations
const leadCount = useMemo(() => leads.length, [leads]);

// ✅ GOOD: Simple operations don't need memoization
const leadCount = leads.length;
```

### 4. Promise Handling

```typescript
// ❌ BAD: Unhandled promise
async function updateLead(id: string, data: Partial<Lead>) {
  supabase.from('leads').update(data).eq('id', id); // Missing await!
}

// ✅ GOOD: Properly awaited
async function updateLead(id: string, data: Partial<Lead>) {
  const { error } = await supabase.from('leads').update(data).eq('id', id);
  if (error) throw error;
}
```

---

**Last Updated:** 2025-12-12
**Version:** 1.0
**Next Review:** 2026-03-12
