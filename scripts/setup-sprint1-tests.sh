#!/bin/bash

# =============================================================================
# Setup Sprint 1: Infraestrutura de Testes
# =============================================================================
# Autor: Consultor.AI Team
# Data: 2026-01-12
# Descrição: Script automatizado para configurar infraestrutura de testes
# =============================================================================

set -e  # Exit on error

echo "🚀 Iniciando Setup do Sprint 1: Infraestrutura de Testes"
echo "=========================================================="

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =============================================================================
# Tarefa 1.1: Criar Estrutura de Diretórios
# =============================================================================
echo ""
echo -e "${BLUE}📁 [1/6] Criando estrutura de diretórios...${NC}"

mkdir -p tests/unit/lib/flow-engine
mkdir -p tests/unit/lib/services
mkdir -p tests/unit/lib/whatsapp
mkdir -p tests/unit/lib/ai
mkdir -p tests/unit/components/dashboard
mkdir -p tests/unit/components/auth
mkdir -p tests/integration/api
mkdir -p tests/integration/services
mkdir -p tests/e2e
mkdir -p tests/fixtures
mkdir -p tests/mocks

echo -e "${GREEN}✓ Estrutura de diretórios criada${NC}"

# =============================================================================
# Tarefa 1.2: Criar Fixtures de Teste
# =============================================================================
echo ""
echo -e "${BLUE}📦 [2/6] Criando fixtures de teste...${NC}"

cat > tests/fixtures/leads.ts << 'EOF'
/**
 * Test Fixtures: Leads
 * Mock data para testes de leads e conversações
 */

export const mockLeads = [
  {
    id: 'lead-test-1',
    consultant_id: 'consultant-test-1',
    whatsapp_number: '+5511999998888',
    name: 'João Silva',
    status: 'qualificado' as const,
    score: 85,
    metadata: {
      perfil: 'individual',
      idade: '31-45',
      coparticipacao: 'nao',
    },
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T11:00:00Z',
  },
  {
    id: 'lead-test-2',
    consultant_id: 'consultant-test-1',
    whatsapp_number: '+5511988887777',
    name: 'Maria Santos',
    status: 'em_contato' as const,
    score: 60,
    metadata: {
      perfil: 'familia',
      idade: '46-60',
      coparticipacao: 'sim',
    },
    created_at: '2026-01-11T14:30:00Z',
    updated_at: '2026-01-11T15:00:00Z',
  },
]

export const mockConversations = [
  {
    id: 'conv-test-1',
    lead_id: 'lead-test-1',
    flow_id: 'flow-health-1',
    state: {
      currentStepId: 'gerar_resposta',
      variables: {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      },
      responses: {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      },
      history: [
        { stepId: 'inicio', timestamp: '2026-01-10T10:00:00Z' },
        { stepId: 'perfil', timestamp: '2026-01-10T10:01:00Z', response: 'individual' },
        { stepId: 'idade', timestamp: '2026-01-10T10:02:00Z', response: '31-45' },
        { stepId: 'coparticipacao', timestamp: '2026-01-10T10:03:00Z', response: 'nao' },
      ],
    },
    status: 'completed' as const,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:05:00Z',
  },
]

export const mockConsultants = [
  {
    id: 'consultant-test-1',
    email: 'test@consultant.com',
    name: 'Consultor Teste',
    whatsapp_number: '+5511977776666',
    vertical: 'saude' as const,
    slug: 'consultor-teste',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]
EOF

cat > tests/fixtures/flows.ts << 'EOF'
/**
 * Test Fixtures: Flows
 * Mock data para fluxos de conversação
 */

export const mockFlowHealthBasic = {
  id: 'flow-health-basic',
  nome: 'Qualificação Saúde Básica',
  versao: '1.0.0',
  vertical: 'saude',
  etapas: [
    {
      id: 'inicio',
      tipo: 'mensagem' as const,
      mensagem: 'Olá! Sou assistente virtual. Vou te ajudar a encontrar o plano ideal.',
      proxima: 'perfil',
    },
    {
      id: 'perfil',
      tipo: 'escolha' as const,
      pergunta: 'Qual seu perfil?',
      opcoes: [
        { texto: 'Individual', valor: 'individual', proxima: 'idade' },
        { texto: 'Casal', valor: 'casal', proxima: 'idade' },
        { texto: 'Família', valor: 'familia', proxima: 'idade' },
        { texto: 'Empresa', valor: 'empresa', proxima: 'idade' },
      ],
    },
    {
      id: 'idade',
      tipo: 'escolha' as const,
      pergunta: 'Qual sua faixa etária?',
      opcoes: [
        { texto: 'Até 30 anos', valor: 'ate_30', proxima: 'coparticipacao' },
        { texto: '31 a 45 anos', valor: '31-45', proxima: 'coparticipacao' },
        { texto: '46 a 60 anos', valor: '46-60', proxima: 'coparticipacao' },
        { texto: 'Acima de 60', valor: 'acima_60', proxima: 'coparticipacao' },
      ],
    },
    {
      id: 'coparticipacao',
      tipo: 'escolha' as const,
      pergunta: 'Prefere plano com coparticipação?',
      opcoes: [
        { texto: 'Sim (mensalidade menor, paga consultas)', valor: 'sim', proxima: 'gerar_resposta' },
        { texto: 'Não (mensalidade maior, sem custos extras)', valor: 'nao', proxima: 'gerar_resposta' },
      ],
    },
    {
      id: 'gerar_resposta',
      tipo: 'executar' as const,
      acao: 'gerar_resposta_ia',
      parametros: {},
      proxima: null,
    },
  ],
}

export const mockFlowCircular = {
  id: 'flow-circular-invalid',
  nome: 'Fluxo Circular (Inválido)',
  versao: '1.0.0',
  vertical: 'saude',
  etapas: [
    {
      id: 'step1',
      tipo: 'mensagem' as const,
      mensagem: 'Passo 1',
      proxima: 'step2',
    },
    {
      id: 'step2',
      tipo: 'mensagem' as const,
      mensagem: 'Passo 2',
      proxima: 'step1', // Circular reference!
    },
  ],
}

export const mockFlowMissingReference = {
  id: 'flow-missing-ref-invalid',
  nome: 'Fluxo com Referência Inválida',
  versao: '1.0.0',
  vertical: 'saude',
  etapas: [
    {
      id: 'step1',
      tipo: 'mensagem' as const,
      mensagem: 'Passo 1',
      proxima: 'nonexistent-step', // Missing reference!
    },
  ],
}
EOF

echo -e "${GREEN}✓ Fixtures criadas${NC}"

# =============================================================================
# Tarefa 1.3: Criar Mocks Globais
# =============================================================================
echo ""
echo -e "${BLUE}🎭 [3/6] Criando mocks globais...${NC}"

cat > tests/mocks/supabase.ts << 'EOF'
/**
 * Mock: Supabase Client
 * Mock do cliente Supabase para testes
 */

import { vi } from 'vitest'

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@consultant.com',
          },
          access_token: 'test-access-token',
        },
      },
      error: null,
    }),
    signIn: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: null,
    }),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
  })),
}

export const createMockSupabaseClient = () => mockSupabaseClient
EOF

cat > tests/mocks/next-router.ts << 'EOF'
/**
 * Mock: Next.js Router
 * Mock do router do Next.js para testes
 */

import { vi } from 'vitest'

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}

export const mockUseRouter = () => mockRouter
export const mockUsePathname = () => '/dashboard'
export const mockUseSearchParams = () => new URLSearchParams()
EOF

echo -e "${GREEN}✓ Mocks criados${NC}"

# =============================================================================
# Tarefa 1.4: Atualizar vitest.config.ts
# =============================================================================
echo ""
echo -e "${BLUE}⚙️  [4/6] Atualizando vitest.config.ts...${NC}"

cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'coverage',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/types/',
        '.next/',
        'dist/',
        'coverage/',
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
EOF

echo -e "${GREEN}✓ vitest.config.ts atualizado${NC}"

# =============================================================================
# Tarefa 1.5: Atualizar tests/setup.ts
# =============================================================================
echo ""
echo -e "${BLUE}🔧 [5/6] Atualizando tests/setup.ts...${NC}"

cat > tests/setup.ts << 'EOF'
/**
 * Test Setup
 * Configuração global para todos os testes
 */

import '@testing-library/jest-dom'
import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// =============================================================================
// Environment Variables
// =============================================================================
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-for-testing'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars!!'
  process.env.GOOGLE_AI_API_KEY = 'test-google-ai-key'
  process.env.META_APP_SECRET = 'test-meta-secret'
  process.env.META_WEBHOOK_VERIFY_TOKEN = 'test-verify-token'
})

// =============================================================================
// Global Mocks
// =============================================================================

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
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

// Mock Next.js Navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// =============================================================================
// Cleanup
// =============================================================================
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
EOF

echo -e "${GREEN}✓ tests/setup.ts atualizado${NC}"

# =============================================================================
# Tarefa 1.6: Criar Script de Teste Rápido
# =============================================================================
echo ""
echo -e "${BLUE}⚡ [6/6] Criando scripts de teste...${NC}"

cat > scripts/test-quick.sh << 'EOF'
#!/bin/bash
# Quick Test Script
# Roda testes apenas dos arquivos modificados

echo "🧪 Running quick tests on modified files..."

# Get modified TypeScript files (excluding test files)
MODIFIED_FILES=$(git diff --name-only --diff-filter=ACMR HEAD | grep -E '\.(ts|tsx)$' | grep -v '.test.' | grep -v '.spec.')

if [ -z "$MODIFIED_FILES" ]; then
  echo "✅ No modified files to test"
  exit 0
fi

echo "📝 Modified files:"
echo "$MODIFIED_FILES"
echo ""

# Run tests related to modified files
npm run test -- --related $MODIFIED_FILES --run

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Quick tests passed!"
else
  echo ""
  echo "❌ Quick tests failed!"
  exit $EXIT_CODE
fi
EOF

chmod +x scripts/test-quick.sh

cat > scripts/test-all.sh << 'EOF'
#!/bin/bash
# Full Test Suite
# Roda todos os testes com coverage

echo "🧪 Running full test suite..."
echo "=============================="

# Type check
echo ""
echo "📝 Type checking..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Type check failed!"
  exit 1
fi

# Lint
echo ""
echo "🔍 Linting..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint failed!"
  exit 1
fi

# Unit + Integration tests with coverage
echo ""
echo "🧪 Running tests with coverage..."
npm run test:coverage
if [ $? -ne 0 ]; then
  echo "❌ Tests failed!"
  exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "📊 Coverage report: coverage/index.html"
EOF

chmod +x scripts/test-all.sh

echo -e "${GREEN}✓ Scripts criados e tornados executáveis${NC}"

# =============================================================================
# Tarefa 1.7: Criar Dockerfile.test
# =============================================================================
echo ""
echo -e "${BLUE}🐳 [BONUS] Criando Dockerfile.test...${NC}"

cat > Dockerfile.test << 'EOF'
# Dockerfile for Testing
# Runs tests in isolated container

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Run tests
CMD ["npm", "run", "test:coverage"]
EOF

echo -e "${GREEN}✓ Dockerfile.test criado${NC}"

# =============================================================================
# Resumo Final
# =============================================================================
echo ""
echo "=========================================================="
echo -e "${GREEN}🎉 Sprint 1 Setup Completo!${NC}"
echo "=========================================================="
echo ""
echo "✅ Estrutura de diretórios criada"
echo "✅ Fixtures e mocks configurados"
echo "✅ vitest.config.ts atualizado"
echo "✅ tests/setup.ts configurado"
echo "✅ Scripts de teste criados"
echo "✅ Dockerfile.test criado"
echo ""
echo "📋 Próximos Passos:"
echo "   1. Rodar testes: npm run test"
echo "   2. Verificar coverage: npm run test:coverage"
echo "   3. Testes rápidos: ./scripts/test-quick.sh"
echo "   4. Suite completa: ./scripts/test-all.sh"
echo ""
echo "📚 Documentação: docs/guides/PLANO-TESTES-DOCKER.md"
echo ""
echo -e "${YELLOW}⚠️  Lembre-se de commitar essas mudanças!${NC}"
echo ""
