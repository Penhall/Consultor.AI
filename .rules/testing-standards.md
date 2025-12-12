# Testing Standards - Consultor.AI

**Version:** 1.0
**Last Updated:** 2025-12-12

---

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Fast Feedback**: Tests should run quickly and provide immediate feedback
3. **Reliable**: Tests should be deterministic and not flaky
4. **Maintainable**: Tests should be easy to understand and modify
5. **Realistic**: Tests should simulate real-world scenarios

### Testing Pyramid

```
           /\
          /  \
         / E2E \ ←── 10% (Critical user flows)
        /--------\
       /          \
      / Integration\ ←── 30% (API routes, services)
     /--------------\
    /                \
   /      Unit       \ ←── 60% (Functions, utilities)
  /------------------\
```

### Coverage Requirements

- **Minimum Coverage**: 80% overall
- **Unit Tests**: > 90%
- **Integration Tests**: > 70%
- **E2E Tests**: Cover all P0 user flows

---

## Unit Testing

### Framework: Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Organization

```
tests/
├── unit/
│   ├── lib/
│   │   ├── flow-engine/
│   │   │   ├── executor.test.ts
│   │   │   └── state-manager.test.ts
│   │   ├── validators/
│   │   │   └── schemas.test.ts
│   │   └── utils/
│   │       └── formatters.test.ts
│   └── hooks/
│       ├── use-leads.test.ts
│       └── use-conversations.test.ts
├── integration/
│   ├── api/
│   │   ├── leads.test.ts
│   │   └── conversations.test.ts
│   └── services/
│       └── lead-service.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── lead-qualification.spec.ts
│   └── dashboard.spec.ts
├── fixtures/
│   ├── leads.ts
│   ├── flows.ts
│   └── consultants.ts
├── mocks/
│   ├── supabase.ts
│   ├── groq.ts
│   └── whatsapp.ts
└── setup.ts
```

### Unit Test Patterns

#### Testing Pure Functions

```typescript
// lib/utils/formatters.ts
export function formatWhatsAppNumber(number: string): string {
  return number.replace(/\D/g, '').replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 ($2) $3-$4');
}

// tests/unit/lib/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatWhatsAppNumber } from '@/lib/utils/formatters';

describe('formatWhatsAppNumber', () => {
  it('formats valid Brazilian number correctly', () => {
    expect(formatWhatsAppNumber('5511999887766')).toBe('+55 (11) 99988-7766');
  });

  it('removes non-digit characters', () => {
    expect(formatWhatsAppNumber('+55 (11) 99988-7766')).toBe('+55 (11) 99988-7766');
  });

  it('returns original if format does not match', () => {
    expect(formatWhatsAppNumber('123')).toBe('123');
  });
});
```

#### Testing Classes

```typescript
// lib/flow-engine/state-manager.ts
export class StateManager {
  constructor(private supabaseClient: SupabaseClient) {}

  async getState(conversationId: string): Promise<ConversationState> {
    const { data, error } = await this.supabaseClient
      .from('conversations')
      .select('state')
      .eq('id', conversationId)
      .single();

    if (error) throw new Error('Failed to get state');
    return data.state;
  }
}

// tests/unit/lib/flow-engine/state-manager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateManager } from '@/lib/flow-engine/state-manager';
import { createMockSupabaseClient } from '@/tests/mocks/supabase';

describe('StateManager', () => {
  let stateManager: StateManager;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    stateManager = new StateManager(mockSupabase as any);
  });

  describe('getState', () => {
    it('retrieves conversation state successfully', async () => {
      const mockState = { currentStepId: 'idade', responses: {} };
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { state: mockState }, error: null }),
      });

      const result = await stateManager.getState('conv-123');

      expect(result).toEqual(mockState);
      expect(mockSupabase.from).toHaveBeenCalledWith('conversations');
    });

    it('throws error when database query fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      });

      await expect(stateManager.getState('conv-123')).rejects.toThrow('Failed to get state');
    });
  });
});
```

#### Testing Async Functions

```typescript
// lib/services/lead-service.ts
export async function qualifyLead(leadId: string): Promise<LeadQualification> {
  const lead = await getLeadById(leadId);
  const score = calculateQualificationScore(lead);

  await updateLeadScore(leadId, score);

  return {
    leadId,
    score,
    qualified: score >= 70,
  };
}

// tests/unit/lib/services/lead-service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { qualifyLead } from '@/lib/services/lead-service';
import * as leadService from '@/lib/services/lead-service';

vi.mock('@/lib/services/lead-service', async () => {
  const actual = await vi.importActual('@/lib/services/lead-service');
  return {
    ...actual,
    getLeadById: vi.fn(),
    updateLeadScore: vi.fn(),
  };
});

describe('qualifyLead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('qualifies lead with high score', async () => {
    const mockLead = { id: 'lead-123', name: 'John', age: 35, profile: 'familia' };

    vi.mocked(leadService.getLeadById).mockResolvedValue(mockLead);
    vi.mocked(leadService.updateLeadScore).mockResolvedValue(undefined);

    const result = await qualifyLead('lead-123');

    expect(result.qualified).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(leadService.updateLeadScore).toHaveBeenCalledWith('lead-123', result.score);
  });

  it('handles lead not found', async () => {
    vi.mocked(leadService.getLeadById).mockRejectedValue(new Error('Lead not found'));

    await expect(qualifyLead('lead-999')).rejects.toThrow('Lead not found');
  });
});
```

---

## Testing React Components

### Testing Library Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
```

### Component Test Patterns

#### Testing Server Components

```typescript
// app/leads/page.tsx (Server Component)
import { getLeads } from '@/lib/services/lead-service';
import { LeadList } from '@/components/leads/lead-list';

export default async function LeadsPage() {
  const leads = await getLeads();
  return <LeadList initialData={leads} />;
}

// tests/unit/app/leads/page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LeadsPage from '@/app/leads/page';
import * as leadService from '@/lib/services/lead-service';

vi.mock('@/lib/services/lead-service');

describe('LeadsPage', () => {
  it('renders leads list with data', async () => {
    const mockLeads = [
      { id: '1', name: 'John Doe', status: 'novo' },
      { id: '2', name: 'Jane Smith', status: 'em_contato' },
    ];

    vi.mocked(leadService.getLeads).mockResolvedValue(mockLeads);

    const Component = await LeadsPage();
    render(Component);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles empty leads list', async () => {
    vi.mocked(leadService.getLeads).mockResolvedValue([]);

    const Component = await LeadsPage();
    render(Component);

    expect(screen.getByText('Nenhum lead encontrado')).toBeInTheDocument();
  });
});
```

#### Testing Client Components

```typescript
// components/leads/lead-card.tsx
'use client';

import { useState } from 'react';
import { Lead } from '@/types';

interface LeadCardProps {
  lead: Lead;
  onUpdate: (lead: Lead) => void;
}

export function LeadCard({ lead, onUpdate }: LeadCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate({ ...lead, name: 'Updated Name' });
    setIsEditing(false);
  };

  return (
    <div>
      <h3>{lead.name}</h3>
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? 'Cancel' : 'Edit'}
      </button>
      {isEditing && <button onClick={handleSave}>Save</button>}
    </div>
  );
}

// tests/unit/components/leads/lead-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadCard } from '@/components/leads/lead-card';

describe('LeadCard', () => {
  const mockLead = {
    id: '1',
    name: 'John Doe',
    status: 'novo' as const,
    whatsapp_number: '+5511999887766',
  };

  it('renders lead information', () => {
    const onUpdate = vi.fn();
    render(<LeadCard lead={mockLead} onUpdate={onUpdate} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('toggles edit mode', () => {
    const onUpdate = vi.fn();
    render(<LeadCard lead={mockLead} onUpdate={onUpdate} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onUpdate when saving', () => {
    const onUpdate = vi.fn();
    render(<LeadCard lead={mockLead} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save'));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated Name' })
    );
  });
});
```

#### Testing Custom Hooks

```typescript
// hooks/use-leads.ts
import { useState, useEffect } from 'react';
import { Lead } from '@/types';
import { getLeads } from '@/lib/api/leads';

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

// tests/unit/hooks/use-leads.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLeads } from '@/hooks/use-leads';
import * as leadsApi from '@/lib/api/leads';

vi.mock('@/lib/api/leads');

describe('useLeads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches leads successfully', async () => {
    const mockLeads = [
      { id: '1', name: 'John', status: 'novo' },
      { id: '2', name: 'Jane', status: 'em_contato' },
    ];

    vi.mocked(leadsApi.getLeads).mockResolvedValue(mockLeads);

    const { result } = renderHook(() => useLeads('consultant-123'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.leads).toEqual(mockLeads);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const mockError = new Error('Failed to fetch');
    vi.mocked(leadsApi.getLeads).mockRejectedValue(mockError);

    const { result } = renderHook(() => useLeads('consultant-123'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.leads).toEqual([]);
  });

  it('cancels fetch on unmount', async () => {
    vi.mocked(leadsApi.getLeads).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    const { result, unmount } = renderHook(() => useLeads('consultant-123'));

    expect(result.current.isLoading).toBe(true);
    unmount();

    // Wait to ensure cancelled flag prevents state updates
    await new Promise(resolve => setTimeout(resolve, 150));

    // No assertions needed - test passes if no state updates after unmount
  });
});
```

---

## Integration Testing

### Testing API Routes

```typescript
// app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getLeadById } from '@/lib/services/lead-service';

export async function GET(
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

    const lead = await getLeadById(params.id);

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// tests/integration/api/leads.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/leads/[id]/route';
import { NextRequest } from 'next/server';
import * as leadService from '@/lib/services/lead-service';
import { createMockSupabaseClient } from '@/tests/mocks/supabase';

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => createMockSupabaseClient(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/lib/services/lead-service');

describe('GET /api/leads/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns lead data for authenticated user', async () => {
    const mockLead = {
      id: 'lead-123',
      name: 'John Doe',
      consultant_id: 'user-456',
    };

    vi.mocked(leadService.getLeadById).mockResolvedValue(mockLead);

    const request = new NextRequest('http://localhost:3000/api/leads/lead-123');
    const response = await GET(request, { params: { id: 'lead-123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockLead);
  });

  it('returns 401 for unauthenticated user', async () => {
    const mockSupabase = createMockSupabaseClient();
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const request = new NextRequest('http://localhost:3000/api/leads/lead-123');
    const response = await GET(request, { params: { id: 'lead-123' } });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 500 on service error', async () => {
    vi.mocked(leadService.getLeadById).mockRejectedValue(new Error('DB error'));

    const request = new NextRequest('http://localhost:3000/api/leads/lead-123');
    const response = await GET(request, { params: { id: 'lead-123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
```

### Testing Services with Database

```typescript
// lib/services/lead-service.ts
import { createClient } from '@/lib/supabase/server';
import { Lead } from '@/types';

export async function createLead(
  consultantId: string,
  whatsappNumber: string,
  name?: string
): Promise<Lead> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('leads')
    .insert({
      consultant_id: consultantId,
      whatsapp_number: whatsappNumber,
      name: name || 'Unknown',
      status: 'novo',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// tests/integration/services/lead-service.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createLead } from '@/lib/services/lead-service';
import { createClient } from '@supabase/supabase-js';

// Use test database
const supabase = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_ANON_KEY!
);

describe('Lead Service Integration', () => {
  let testConsultantId: string;

  beforeEach(async () => {
    // Create test consultant
    const { data } = await supabase
      .from('consultants')
      .insert({
        email: 'test@example.com',
        name: 'Test Consultant',
        whatsapp_number: '+5511999887766',
        vertical: 'saude',
        slug: 'test-consultant',
      })
      .select()
      .single();

    testConsultantId = data!.id;
  });

  afterEach(async () => {
    // Cleanup
    await supabase.from('leads').delete().eq('consultant_id', testConsultantId);
    await supabase.from('consultants').delete().eq('id', testConsultantId);
  });

  it('creates lead successfully', async () => {
    const lead = await createLead(testConsultantId, '+5511988776655', 'John Doe');

    expect(lead.id).toBeDefined();
    expect(lead.consultant_id).toBe(testConsultantId);
    expect(lead.whatsapp_number).toBe('+5511988776655');
    expect(lead.name).toBe('John Doe');
    expect(lead.status).toBe('novo');
  });

  it('creates lead with default name', async () => {
    const lead = await createLead(testConsultantId, '+5511988776655');

    expect(lead.name).toBe('Unknown');
  });

  it('throws error on duplicate whatsapp number', async () => {
    await createLead(testConsultantId, '+5511988776655');

    await expect(
      createLead(testConsultantId, '+5511988776655')
    ).rejects.toThrow();
  });
});
```

---

## E2E Testing

### Framework: Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Patterns

#### Testing Authentication Flow

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toContainText(
      'Credenciais inválidas'
    );
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('button[aria-label="Menu"]');
    await page.click('text=Sair');

    await expect(page).toHaveURL('/login');
  });
});
```

#### Testing Lead Qualification Flow

```typescript
// tests/e2e/lead-qualification.spec.ts
import { test, expect } from '@playwright/test';
import { createTestLead } from '../fixtures/leads';

test.describe('Lead Qualification', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete full qualification flow', async ({ page }) => {
    // Create a test lead via API
    const lead = await createTestLead();

    // Navigate to conversations
    await page.goto(`/conversations/${lead.conversation_id}`);

    // Simulate lead responses
    await page.fill('textarea[name="message"]', 'familia');
    await page.click('button:has-text("Enviar")');

    await expect(page.locator('.message-bot').last()).toContainText(
      'Qual sua faixa etária'
    );

    await page.fill('textarea[name="message"]', '35');
    await page.click('button:has-text("Enviar")');

    await expect(page.locator('.message-bot').last()).toContainText(
      'coparticipação'
    );

    await page.fill('textarea[name="message"]', 'sim');
    await page.click('button:has-text("Enviar")');

    // Verify AI response is generated
    await expect(page.locator('.message-bot').last()).toContainText(
      'plano ideal'
    );

    // Verify lead status updated
    await page.goto('/leads');
    const leadRow = page.locator(`tr:has-text("${lead.whatsapp_number}")`);
    await expect(leadRow).toContainText('qualificado');
  });

  test('should handle invalid input gracefully', async ({ page }) => {
    const lead = await createTestLead();
    await page.goto(`/conversations/${lead.conversation_id}`);

    // Try to send empty message
    await page.click('button:has-text("Enviar")');

    await expect(page.locator('[role="alert"]')).toContainText(
      'Digite uma mensagem'
    );
  });
});
```

#### Testing Dashboard Analytics

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display key metrics', async ({ page }) => {
    await expect(page.locator('h2:has-text("Total de Leads")')).toBeVisible();
    await expect(page.locator('h2:has-text("Taxa de Conversão")')).toBeVisible();
    await expect(page.locator('h2:has-text("Tempo Médio de Resposta")')).toBeVisible();
  });

  test('should filter leads by date range', async ({ page }) => {
    await page.click('button:has-text("Últimos 7 dias")');
    await page.click('text=Últimos 30 dias');

    await expect(page.locator('button:has-text("Últimos 30 dias")')).toBeVisible();

    // Verify data updates
    await page.waitForResponse(response =>
      response.url().includes('/api/analytics') && response.status() === 200
    );
  });

  test('should export leads to CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');

    await page.click('button:has-text("Exportar")');
    await page.click('text=CSV');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/leads-\d{4}-\d{2}-\d{2}\.csv/);
  });
});
```

---

## Mock Strategies

### Mocking Supabase

```typescript
// tests/mocks/supabase.ts
import { vi } from 'vitest';

export function createMockSupabaseClient() {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
      download: vi.fn(),
      remove: vi.fn(),
    },
  };
}
```

### Mocking Groq API

```typescript
// tests/mocks/groq.ts
import { vi } from 'vitest';

export function createMockGroqClient() {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'Mocked AI response',
              },
            },
          ],
        }),
      },
    },
  };
}

// Usage in tests
vi.mock('groq-sdk', () => ({
  default: vi.fn(() => createMockGroqClient()),
}));
```

### Mocking WhatsApp API

```typescript
// tests/mocks/whatsapp.ts
import { vi } from 'vitest';

export function createMockWhatsAppClient() {
  return {
    sendMessage: vi.fn().mockResolvedValue({
      success: true,
      messageId: 'msg-123',
    }),
    sendImage: vi.fn().mockResolvedValue({
      success: true,
      messageId: 'msg-456',
    }),
    getMessageStatus: vi.fn().mockResolvedValue({
      status: 'delivered',
      timestamp: new Date().toISOString(),
    }),
  };
}
```

---

## Test Fixtures

### Creating Reusable Test Data

```typescript
// tests/fixtures/leads.ts
import { Lead } from '@/types';

export function createMockLead(overrides?: Partial<Lead>): Lead {
  return {
    id: 'lead-123',
    consultant_id: 'consultant-456',
    whatsapp_number: '+5511999887766',
    name: 'John Doe',
    status: 'novo',
    score: null,
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockLeads(count: number): Lead[] {
  return Array.from({ length: count }, (_, i) =>
    createMockLead({
      id: `lead-${i}`,
      name: `Lead ${i}`,
      whatsapp_number: `+551199988776${i.toString().padStart(2, '0')}`,
    })
  );
}

// Usage
import { createMockLead } from '@/tests/fixtures/leads';

const qualifiedLead = createMockLead({ status: 'qualificado', score: 85 });
const newLeads = createMockLeads(10);
```

### API Test Fixtures

```typescript
// tests/fixtures/flows.ts
import { FlowDefinition } from '@/types';

export const healthPlanFlow: FlowDefinition = {
  id: 'flow-health-plan',
  name: 'Qualificação Plano de Saúde',
  version: '1.0',
  steps: [
    {
      id: 'inicio',
      tipo: 'mensagem',
      conteudo: 'Olá! Vou te ajudar a encontrar o plano de saúde ideal.',
      proxima: 'perfil',
    },
    {
      id: 'perfil',
      tipo: 'escolha',
      conteudo: 'Qual seu perfil?',
      opcoes: [
        { texto: 'Individual', valor: 'individual' },
        { texto: 'Família', valor: 'familia' },
        { texto: 'Empresa', valor: 'empresa' },
      ],
      proxima: 'idade',
    },
    // ... more steps
  ],
};
```

---

## Coverage and Reporting

### Running Tests with Coverage

```bash
# Run all tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Watch mode for development
npm run test:watch
```

### Coverage Configuration

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui"
  }
}
```

### Coverage Thresholds

```typescript
// vitest.config.ts (coverage section)
coverage: {
  lines: 80,      // 80% line coverage
  functions: 80,  // 80% function coverage
  branches: 75,   // 75% branch coverage
  statements: 80, // 80% statement coverage

  // Fail CI if below thresholds
  thresholdAutoUpdate: false,
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Common Testing Pitfalls

### 1. Testing Implementation Details

```typescript
// ❌ BAD: Testing internal state
expect(component.state.count).toBe(5);

// ✅ GOOD: Testing behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### 2. Not Cleaning Up After Tests

```typescript
// ❌ BAD: No cleanup
test('creates a lead', async () => {
  const lead = await createLead('consultant-123', '+5511999887766');
  expect(lead).toBeDefined();
});

// ✅ GOOD: Proper cleanup
test('creates a lead', async () => {
  const lead = await createLead('consultant-123', '+5511999887766');
  expect(lead).toBeDefined();

  // Cleanup
  await deleteLead(lead.id);
});
```

### 3. Flaky Tests from Timing Issues

```typescript
// ❌ BAD: Using arbitrary timeouts
test('loads data', async () => {
  renderComponent();
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// ✅ GOOD: Using waitFor
test('loads data', async () => {
  renderComponent();
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### 4. Not Mocking External Dependencies

```typescript
// ❌ BAD: Making real API calls
test('sends WhatsApp message', async () => {
  await sendWhatsAppMessage('+5511999887766', 'Hello'); // Real API call!
});

// ✅ GOOD: Mocking external service
test('sends WhatsApp message', async () => {
  const mockWhatsApp = createMockWhatsAppClient();
  await sendWhatsAppMessage('+5511999887766', 'Hello');
  expect(mockWhatsApp.sendMessage).toHaveBeenCalled();
});
```

### 5. Over-Mocking

```typescript
// ❌ BAD: Mocking everything (tests nothing)
vi.mock('@/lib/services/lead-service', () => ({
  createLead: vi.fn().mockResolvedValue({ id: '123' }),
  updateLead: vi.fn().mockResolvedValue({ id: '123' }),
  deleteLead: vi.fn().mockResolvedValue(true),
}));

// ✅ GOOD: Mock only external dependencies
// Let your code run, mock only database/API calls
```

---

## Best Practices Summary

1. **Write Tests First** (TDD) - Write failing test, implement feature, refactor
2. **Keep Tests Simple** - One assertion per test when possible
3. **Use Descriptive Names** - Test names should describe behavior
4. **Arrange-Act-Assert** - Structure tests clearly
5. **Don't Test Framework Code** - Focus on your business logic
6. **Mock External Dependencies** - Database, APIs, third-party services
7. **Use Factories/Fixtures** - Create reusable test data
8. **Run Tests in CI/CD** - Automate testing on every commit
9. **Maintain Tests** - Update tests when code changes
10. **Aim for Fast Tests** - Unit tests should run in milliseconds

---

**Last Updated:** 2025-12-12
**Version:** 1.0
**Next Review:** 2026-03-12
