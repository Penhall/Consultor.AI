# Plano de Testes e Infraestrutura - Desenvolvimento Local Docker

**Status**: ATIVO
**Criado**: 2026-01-12
**Prioridade**: CRÍTICA (Alinhado com Constituição - Code Quality First)

---

## 🎯 Objetivo

Implementar infraestrutura de testes e CI/CD local para desenvolvimento Docker, garantindo qualidade do código **sem bloquear o desenvolvimento de features**.

---

## 📊 Situação Atual

### ✅ O que já temos:
- **Docker Setup Completo**: `docker-compose.dev.yml`, `Dockerfile.dev` com hot-reload
- **Ferramentas Instaladas**: Vitest, Playwright, Testing Library, ESLint, Prettier
- **Scripts NPM**: `test`, `test:coverage`, `test:e2e`, `lint`, `type-check`
- **MVP Funcional**: 52/120 tasks completas (43%), core P1 features funcionando
- **Build Limpo**: 0 erros TypeScript, 19 páginas, 13 API routes

### ❌ Gaps Críticos:
- **0% cobertura de testes** (meta: 80%)
- **CI/CD local não configurado** (GitHub Actions, Husky hooks)
- **Estrutura de testes incompleta** (faltam diretórios unit/, integration/, e2e/, fixtures/)

---

## 🚀 Estratégia: "Test-Driven Pragmático"

### Princípios:
1. **Não bloquear desenvolvimento**: Testes em paralelo com features
2. **Priorizar testes críticos**: Focar nos 20% que cobrem 80% do risco
3. **Integração Docker**: Testes rodam no mesmo ambiente de desenvolvimento
4. **Feedback rápido**: Hooks locais previnem código quebrado antes de commit

---

## 📋 Plano de Execução (40 horas divididas em 4 sprints)

---

## Sprint 1: Infraestrutura de Testes (8 horas)

### Meta: Criar fundação para testes rodarem localmente e no Docker

#### Tarefas:

**1.1 - Criar Estrutura de Diretórios (15 min)**
```bash
mkdir -p tests/unit/lib/flow-engine
mkdir -p tests/unit/lib/services
mkdir -p tests/unit/lib/whatsapp
mkdir -p tests/unit/components/dashboard
mkdir -p tests/integration/api
mkdir -p tests/integration/services
mkdir -p tests/e2e
mkdir -p tests/fixtures
mkdir -p tests/mocks
```

**1.2 - Configurar Vitest com Mocks (2 horas)**

Criar `tests/setup.ts`:
```typescript
import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters!'
process.env.GOOGLE_AI_API_KEY = 'test-google-ai-key'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Cleanup after tests
afterEach(() => {
  vi.clearAllMocks()
})
```

Atualizar `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/types/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**1.3 - Criar Fixtures de Teste (1 hora)**

`tests/fixtures/leads.ts`:
```typescript
export const mockLeads = [
  {
    id: 'lead-1',
    consultant_id: 'consultant-1',
    whatsapp_number: '+5511999998888',
    name: 'João Silva',
    status: 'qualificado',
    score: 85,
    metadata: {
      perfil: 'individual',
      idade: '31-45',
      coparticipacao: 'nao',
    },
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T11:00:00Z',
  },
  // ... mais fixtures
]

export const mockConversations = [
  {
    id: 'conv-1',
    lead_id: 'lead-1',
    flow_id: 'flow-health-1',
    state: {
      currentStepId: 'perfil',
      variables: {},
      responses: {},
      history: [],
    },
    status: 'active',
    created_at: '2026-01-10T10:00:00Z',
  },
]
```

**1.4 - Adicionar Testes ao Docker (2 horas)**

Criar `Dockerfile.test`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Run tests
CMD ["npm", "run", "test:coverage"]
```

Adicionar ao `docker-compose.dev.yml`:
```yaml
  test-runner:
    build:
      context: .
      dockerfile: Dockerfile.test
    container_name: consultorai-test-runner
    volumes:
      - ./src:/app/src
      - ./tests:/app/tests
      - ./coverage:/app/coverage
    environment:
      - NODE_ENV=test
    command: npm run test:watch
    networks:
      - consultorai-dev
    profiles:
      - testing
```

**1.5 - Script de Teste Rápido (30 min)**

Criar `scripts/test-quick.sh`:
```bash
#!/bin/bash
# Testa apenas arquivos modificados

echo "🧪 Running quick tests on modified files..."

# Get modified files
MODIFIED_FILES=$(git diff --name-only --diff-filter=ACMR HEAD | grep -E '\.(ts|tsx)$' | grep -v '.test.')

if [ -z "$MODIFIED_FILES" ]; then
  echo "✅ No modified files to test"
  exit 0
fi

# Run tests for modified files
npm run test -- --related $MODIFIED_FILES

echo "✅ Quick tests complete!"
```

**1.6 - Configurar Coverage Visual (30 min)**

Adicionar ao `package.json`:
```json
{
  "scripts": {
    "test:coverage:open": "npm run test:coverage && open coverage/index.html",
    "test:coverage:watch": "vitest --coverage --watch"
  }
}
```

**Deliverables Sprint 1:**
- ✅ Estrutura de diretórios completa
- ✅ Vitest configurado com mocks
- ✅ Fixtures de teste criadas
- ✅ Testes integrados ao Docker
- ✅ Scripts de teste rápido

---

## Sprint 2: Testes Críticos (Core Business Logic) (16 horas)

### Meta: 40% de cobertura nos módulos mais críticos

#### Prioridade 1: Flow Engine (6 horas)

**2.1 - Flow Parser Tests** (2 horas)
`tests/unit/lib/flow-engine/parser.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { parseFlow, validateFlowDefinition } from '@/lib/flow-engine/parser'

describe('Flow Parser', () => {
  it('should parse valid flow JSON', () => {
    const validFlow = {
      id: 'flow-1',
      nome: 'Saúde Básico',
      etapas: [
        { id: 'inicio', tipo: 'mensagem', mensagem: 'Olá!', proxima: 'perfil' },
        { id: 'perfil', tipo: 'escolha', pergunta: 'Seu perfil?', opcoes: [
          { texto: 'Individual', valor: 'individual', proxima: 'fim' }
        ]},
        { id: 'fim', tipo: 'executar', acao: 'gerar_resposta_ia', proxima: null }
      ]
    }

    const result = parseFlow(validFlow)

    expect(result.success).toBe(true)
    expect(result.flow).toBeDefined()
    expect(result.flow?.etapas).toHaveLength(3)
  })

  it('should detect circular references', () => {
    const circularFlow = {
      id: 'flow-circular',
      nome: 'Circular',
      etapas: [
        { id: 'step1', tipo: 'mensagem', mensagem: 'A', proxima: 'step2' },
        { id: 'step2', tipo: 'mensagem', mensagem: 'B', proxima: 'step1' }
      ]
    }

    const result = validateFlowDefinition(circularFlow)

    expect(result.success).toBe(false)
    expect(result.error).toContain('circular')
  })

  it('should detect missing step references', () => {
    const invalidFlow = {
      id: 'flow-invalid',
      nome: 'Invalid',
      etapas: [
        { id: 'step1', tipo: 'mensagem', mensagem: 'A', proxima: 'nonexistent' }
      ]
    }

    const result = validateFlowDefinition(invalidFlow)

    expect(result.success).toBe(false)
    expect(result.error).toContain('nonexistent')
  })
})
```

**2.2 - State Manager Tests** (2 horas)
`tests/unit/lib/flow-engine/state-manager.test.ts`

**2.3 - Step Executors Tests** (2 horas)
`tests/unit/lib/flow-engine/executors.test.ts`

#### Prioridade 2: AI Service (Compliance Critical) (4 horas)

**2.4 - AI Service Tests** (4 horas)
`tests/unit/lib/services/ai-service.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { generateCompliantResponse } from '@/lib/services/ai-service'

describe('AI Service - Compliance', () => {
  it('should generate response without pricing information', async () => {
    const leadData = {
      perfil: 'individual',
      idade: '31-45',
      coparticipacao: 'nao'
    }

    const response = await generateCompliantResponse(leadData)

    // Must NOT contain pricing
    expect(response).not.toMatch(/R\$\s*\d+/)
    expect(response).not.toMatch(/\d+\s*reais/)
    expect(response).not.toMatch(/valor de/)

    // Must contain recommendations
    expect(response).toMatch(/plano/i)
    expect(response.length).toBeGreaterThan(100)
  })

  it('should reject requests for sensitive data', async () => {
    const leadData = {
      perfil: 'individual',
      query: 'Qual seu CPF?'
    }

    const response = await generateCompliantResponse(leadData)

    // Should NOT ask for CPF
    expect(response).not.toMatch(/cpf/i)
    expect(response).not.toMatch(/documento/i)
  })

  it('should fallback to template on AI failure', async () => {
    // Mock AI failure
    vi.mock('@/lib/ai/gemini', () => ({
      generateResponse: vi.fn().mockRejectedValue(new Error('AI failed'))
    }))

    const leadData = { perfil: 'individual' }
    const response = await generateCompliantResponse(leadData)

    // Should return fallback template
    expect(response).toBeDefined()
    expect(response.length).toBeGreaterThan(50)
  })
})
```

#### Prioridade 3: Lead Service (CRUD) (3 horas)

**2.5 - Lead Service Tests** (3 horas)
`tests/unit/lib/services/lead-service.test.ts`

#### Prioridade 4: Analytics Service (3 horas)

**2.6 - Analytics Service Tests** (3 horas)
`tests/unit/lib/services/analytics-service.test.ts`

**Deliverables Sprint 2:**
- ✅ 6 arquivos de teste críticos (parser, state, executors, ai, lead, analytics)
- ✅ ~40-50% cobertura de código
- ✅ Validação de compliance ANS
- ✅ Testes de lógica de negócio core

---

## Sprint 3: Testes de Integração (API Routes) (10 horas)

### Meta: Validar contratos de API e fluxos end-to-end

#### 3.1 - Webhook Integration Tests (3 horas)

`tests/integration/api/webhook.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import { POST, GET } from '@/app/api/webhook/meta/[consultantId]/route'

describe('Webhook API', () => {
  it('should validate HMAC signature', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: JSON.stringify({ test: 'data' }),
      headers: {
        'x-hub-signature-256': 'invalid-signature'
      }
    })

    const response = await POST(req, { params: { consultantId: 'test-id' } })

    expect(response.status).toBe(403)
  })

  it('should verify webhook with valid token', async () => {
    const { req } = createMocks({
      method: 'GET',
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': process.env.META_WEBHOOK_VERIFY_TOKEN,
        'hub.challenge': 'test-challenge'
      }
    })

    const response = await GET(req, { params: { consultantId: 'test-id' } })
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toBe('test-challenge')
  })
})
```

#### 3.2 - Leads API Tests (3 horas)

`tests/integration/api/leads.test.ts`

#### 3.3 - Analytics API Tests (2 horas)

`tests/integration/api/analytics.test.ts`

#### 3.4 - Auth Middleware Tests (2 horas)

`tests/integration/auth-middleware.test.ts`

**Deliverables Sprint 3:**
- ✅ 4 arquivos de teste de integração
- ✅ Validação de todos os API endpoints críticos
- ✅ ~60-70% cobertura total

---

## Sprint 4: CI/CD Local + Testes E2E (6 horas)

### Meta: Automação e testes de fluxos críticos

#### 4.1 - Configurar Husky Pre-commit Hooks (1 hora)

```bash
# Instalar e configurar Husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
npx husky add .husky/pre-push "npm run test:unit"
```

Criar `.husky/pre-commit`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Lint staged files
npm run lint:fix

# Type check
npm run type-check

# Quick tests on modified files
./scripts/test-quick.sh

echo "✅ Pre-commit checks passed!"
```

#### 4.2 - GitHub Actions Workflow (2 horas)

Criar `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Unit tests
        run: npm run test:unit

      - name: Integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

#### 4.3 - Teste E2E Crítico: Lead Qualification Flow (3 horas)

`tests/e2e/lead-qualification.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Lead Qualification Flow', () => {
  test('should complete full qualification flow', async ({ page }) => {
    // 1. Navigate to login
    await page.goto('http://localhost:3000/auth/login')

    // 2. Login as consultant
    await page.fill('input[type="email"]', 'test@consultant.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    // 3. Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // 4. Navigate to leads
    await page.click('a[href="/dashboard/leads"]')

    // 5. Verify leads table loads
    await expect(page.locator('table')).toBeVisible()

    // 6. Check for new lead from WhatsApp
    const leadRow = page.locator('tr:has-text("João Silva")')
    await expect(leadRow).toBeVisible()

    // 7. Verify lead status
    await expect(leadRow.locator('text=qualificado')).toBeVisible()

    // 8. Click lead to view details
    await leadRow.click()

    // 9. Verify conversation history
    await expect(page.locator('text=Perfil: Individual')).toBeVisible()
    await expect(page.locator('text=Idade: 31-45')).toBeVisible()
  })
})
```

**Deliverables Sprint 4:**
- ✅ Husky hooks configurados
- ✅ GitHub Actions CI/CD
- ✅ 1 teste E2E crítico (lead qualification)
- ✅ Automação completa

---

## 🐳 Comandos Docker para Desenvolvimento com Testes

### Desenvolvimento Normal (sem testes rodando)
```bash
# Subir aplicação + Redis
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f app

# Parar
docker-compose -f docker-compose.dev.yml down
```

### Desenvolvimento com Testes em Watch Mode
```bash
# Subir aplicação + test runner
docker-compose -f docker-compose.dev.yml --profile testing up -d

# Ver logs de testes
docker-compose -f docker-compose.dev.yml logs -f test-runner

# Rodar testes manualmente dentro do container
docker exec -it consultorai-test-runner npm run test:coverage
```

### Rodar Testes Localmente (sem Docker)
```bash
# Testes rápidos
npm run test

# Testes com cobertura
npm run test:coverage

# Testes em watch mode
npm run test:watch

# Testes E2E
npm run test:e2e
```

---

## 📈 Métricas de Sucesso

| Métrica | Antes | Meta Sprint 2 | Meta Sprint 3 | Meta Sprint 4 |
|---------|-------|---------------|---------------|---------------|
| **Cobertura Total** | 0% | 40% | 65% | 80% |
| **Unit Tests** | 0% | 60% | 85% | 90% |
| **Integration Tests** | 0% | 20% | 50% | 70% |
| **E2E Tests** | 0% | 0% | 0% | 100% (1 flow) |
| **CI/CD** | Nenhum | Nenhum | Nenhum | GitHub Actions |
| **Pre-commit Hooks** | Não | Não | Não | Sim |

---

## 🎯 Checkpoints de Qualidade

Após cada sprint, validar:

### Sprint 1 ✅
- [ ] `npm run test` executa sem erros
- [ ] Coverage report é gerado em `coverage/`
- [ ] Docker test-runner sobe e roda testes
- [ ] Scripts de teste rápido funcionam

### Sprint 2 ✅
- [ ] Cobertura ≥ 40%
- [ ] Parser detecta fluxos inválidos
- [ ] AI Service respeita compliance ANS
- [ ] Lead Service CRUD funciona
- [ ] Analytics calcula métricas corretamente

### Sprint 3 ✅
- [ ] Cobertura ≥ 65%
- [ ] Webhook valida assinaturas HMAC
- [ ] API Leads retorna dados corretos
- [ ] API Analytics retorna métricas
- [ ] Middleware bloqueia rotas protegidas

### Sprint 4 ✅
- [ ] Cobertura ≥ 80%
- [ ] Pre-commit hooks bloqueiam código quebrado
- [ ] GitHub Actions roda em PRs
- [ ] Teste E2E passa localmente
- [ ] Build não falha

---

## 🚦 Workflow Recomendado

### Dia-a-dia de Desenvolvimento:

1. **Manhã**: Pull latest + rodar testes
```bash
git pull origin main
npm run test:coverage
```

2. **Durante desenvolvimento**: Watch mode
```bash
npm run test:watch
# Ou com Docker:
docker-compose -f docker-compose.dev.yml --profile testing up
```

3. **Antes de commit**: Hooks automáticos
```bash
git add .
git commit -m "feat: nova funcionalidade"
# Hooks rodam automaticamente: lint + type-check + testes
```

4. **Antes de PR**: Full validation
```bash
npm run lint
npm run type-check
npm run test:coverage
npm run build
```

---

## 📚 Recursos e Referências

### Documentação:
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Husky](https://typicode.github.io/husky/)

### Guias Internos:
- `.rules/testing-standards.md` - Padrões de teste do projeto
- `.rules/coding-guidelines.md` - Convenções de código
- `docs/guides/DOCKER-SETUP.md` - Setup Docker completo

---

## ⚠️ Observações Importantes

1. **Não bloquear desenvolvimento**: Testes são incrementais, não bloqueiam novas features
2. **Prioridade em testes críticos**: Flow engine, AI compliance, API contracts
3. **Docker é opcional**: Testes rodam localmente sem Docker
4. **Coverage é guia, não meta absoluta**: 80% é meta, mas qualidade > quantidade
5. **Feedback rápido**: Hooks locais pegam 90% dos erros antes do CI/CD

---

## 🎉 Próximos Passos Após Sprint 4

Com infraestrutura de testes completa:

1. **Fase 2 - Enhancements** (Tasks T066-T092):
   - Lead detail page com testes
   - Export CSV com testes de integração
   - Flow customization com validação

2. **Fase 3 - Expansion**:
   - CRM integration com testes de webhook
   - Performance monitoring
   - Documentação completa

3. **Continuous Improvement**:
   - Adicionar testes conforme bugs aparecem (TDD reativo)
   - Aumentar cobertura E2E (mais fluxos críticos)
   - Otimizar velocidade de testes

---

**Status**: PRONTO PARA EXECUÇÃO
**Owner**: Time de Desenvolvimento
**Revisão**: Semanal (toda sexta-feira)
**Última atualização**: 2026-01-12
