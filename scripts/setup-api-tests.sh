#!/bin/bash

################################################################################
# Setup API Tests - Comprehensive Unit Tests for all API routes
#
# Cria testes abrangentes para todas as 14 rotas de API
#
# Tempo de execução: ~10 segundos
#
# Uso:
#   chmod +x scripts/setup-api-tests.sh
#   ./scripts/setup-api-tests.sh
#
# Criado: 2026-01-13
################################################################################

set -e

echo "🚀 Setup API Tests - Comprehensive Coverage"
echo "==========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

STEP=1
TOTAL_STEPS=15

print_step() {
  echo -e "${BLUE}[$STEP/$TOTAL_STEPS]${NC} $1"
  ((STEP++))
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

################################################################################
# STEP 1: Create test directories
################################################################################
print_step "Criando estrutura de diretórios..."

mkdir -p tests/unit/app/api/health
mkdir -p tests/unit/app/api/leads
mkdir -p tests/unit/app/api/analytics
mkdir -p tests/unit/app/api/conversations
mkdir -p tests/unit/app/api/consultants
mkdir -p tests/unit/app/api/webhook

print_success "Diretórios criados"
echo ""

################################################################################
# STEP 2: Health Check Tests
################################################################################
print_step "Criando testes /api/health..."

cat > tests/unit/app/api/health/route.test.ts << 'EOF'
/**
 * Health Check API Tests
 *
 * Tests the health check endpoint which returns system status
 */

import { describe, it, expect } from 'vitest'
import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('deve retornar status ok', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'ok')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('uptime')
  })

  it('deve retornar timestamp válido (ISO 8601)', async () => {
    const response = await GET()
    const data = await response.json()

    const timestamp = new Date(data.timestamp)
    expect(timestamp).toBeInstanceOf(Date)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })

  it('deve retornar uptime como número positivo', async () => {
    const response = await GET()
    const data = await response.json()

    expect(typeof data.uptime).toBe('number')
    expect(data.uptime).toBeGreaterThanOrEqual(0)
  })

  it('deve incluir headers corretos', async () => {
    const response = await GET()

    expect(response.headers.get('content-type')).toContain('application/json')
  })
})
EOF

print_success "Health tests criados"
echo ""

################################################################################
# STEP 3-16: Create remaining test files (simplified scaffolds)
################################################################################

print_step "Criando scaffold para testes de leads..."
mkdir -p tests/unit/app/api/leads/\[id\]

cat > tests/unit/app/api/leads/route.test.ts << 'EOF'
/**
 * Leads API Tests - GET /api/leads & POST /api/leads
 *
 * TODO: Implementar testes completos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('GET /api/leads', () => {
  it.todo('deve listar leads com paginação')
  it.todo('deve filtrar por status')
  it.todo('deve filtrar por search')
  it.todo('deve ordenar por campo especificado')
  it.todo('deve retornar 401 se não autenticado')
  it.todo('deve retornar 404 se consultant não encontrado')
})

describe('POST /api/leads', () => {
  it.todo('deve criar lead com dados válidos')
  it.todo('deve rejeitar whatsapp_number inválido')
  it.todo('deve aplicar valores padrão')
  it.todo('deve retornar 403 se limite mensal excedido')
})
EOF

cat > tests/unit/app/api/leads/\[id\]/route.test.ts << 'EOF'
/**
 * Lead by ID API Tests - GET/PATCH/DELETE /api/leads/[id]
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('GET /api/leads/[id]', () => {
  it.todo('deve retornar lead por ID')
  it.todo('deve retornar 404 se lead não encontrado')
})

describe('PATCH /api/leads/[id]', () => {
  it.todo('deve atualizar lead')
  it.todo('deve validar campos atualizados')
})

describe('DELETE /api/leads/[id]', () => {
  it.todo('deve deletar lead')
})
EOF

cat > tests/unit/app/api/leads/stats/route.test.ts << 'EOF'
/**
 * Lead Stats API Tests - GET /api/leads/stats
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('GET /api/leads/stats', () => {
  it.todo('deve retornar estatísticas de leads')
  it.todo('deve incluir total, byStatus, thisMonth, averageScore')
})
EOF

print_success "Scaffolds de leads criados"

print_step "Criando scaffolds analytics..."
mkdir -p tests/unit/app/api/analytics/overview
mkdir -p tests/unit/app/api/analytics/charts
mkdir -p tests/unit/app/api/analytics/activity

for route in overview charts activity; do
  cat > tests/unit/app/api/analytics/$route/route.test.ts << EOF
/**
 * Analytics $route API Tests
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('GET /api/analytics/$route', () => {
  it.todo('deve retornar dados de analytics')
  it.todo('deve retornar 401 se não autenticado')
})
EOF
done

print_success "Scaffolds analytics criados"

print_step "Criando scaffolds conversations..."
mkdir -p tests/unit/app/api/conversations/start
mkdir -p tests/unit/app/api/conversations/\[id\]/message

cat > tests/unit/app/api/conversations/start/route.test.ts << 'EOF'
/**
 * Start Conversation API Tests
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('POST /api/conversations/start', () => {
  it.todo('deve iniciar conversação com flow')
  it.todo('deve validar ownership de lead e flow')
  it.todo('deve retornar primeiro step')
})
EOF

cat > tests/unit/app/api/conversations/\[id\]/message/route.test.ts << 'EOF'
/**
 * Process Message API Tests
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('POST /api/conversations/[id]/message', () => {
  it.todo('deve processar mensagem do usuário')
  it.todo('deve avançar no flow')
  it.todo('deve marcar conversação como completa quando flow terminar')
})
EOF

print_success "Scaffolds conversations criados"

print_step "Criando scaffolds consultants..."
mkdir -p tests/unit/app/api/consultants/meta-callback
mkdir -p tests/unit/app/api/consultants/meta-signup
mkdir -p tests/unit/app/api/consultants/\[id\]/integrations/meta

cat > tests/unit/app/api/consultants/meta-callback/route.test.ts << 'EOF'
/**
 * Meta OAuth Callback API Tests (Legacy)
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('POST /api/consultants/meta-callback', () => {
  it.todo('deve processar OAuth callback')
  it.todo('deve trocar code por access_token')
  it.todo('deve criptografar token antes de salvar')
})
EOF

cat > tests/unit/app/api/consultants/meta-signup/route.test.ts << 'EOF'
/**
 * Meta Embedded Signup API Tests
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('POST /api/consultants/meta-signup', () => {
  it.todo('deve processar embedded signup')
  it.todo('deve subscrever webhook')
  it.todo('deve validar consultant ownership')
})
EOF

cat > tests/unit/app/api/consultants/\[id\]/integrations/meta/route.test.ts << 'EOF'
/**
 * Integration Status API Tests
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('GET /api/consultants/[id]/integrations/meta', () => {
  it.todo('deve retornar status da integração')
  it.todo('deve retornar null se não integrado')
  it.todo('deve excluir campos sensíveis')
})
EOF

print_success "Scaffolds consultants criados"

print_step "Criando scaffolds webhooks..."
mkdir -p tests/unit/app/api/webhook/meta/\[consultantId\]
mkdir -p tests/unit/app/api/webhook/mock

cat > tests/unit/app/api/webhook/meta/\[consultantId\]/route.test.ts << 'EOF'
/**
 * Meta WhatsApp Webhook API Tests
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('GET /api/webhook/meta/[consultantId]', () => {
  it.todo('deve verificar webhook com challenge')
  it.todo('deve retornar 403 se verify_token inválido')
})

describe('POST /api/webhook/meta/[consultantId]', () => {
  it.todo('deve processar mensagem do WhatsApp')
  it.todo('deve validar signature HMAC')
  it.todo('deve auto-criar lead se novo')
  it.todo('deve processar através do flow engine')
  it.todo('deve enviar resposta via WhatsApp')
})
EOF

cat > tests/unit/app/api/webhook/mock/route.test.ts << 'EOF'
/**
 * Mock Webhook API Tests (Development)
 *
 * TODO: Implementar testes completos
 */

import { describe, it } from 'vitest'

describe('POST /api/webhook/mock', () => {
  it.todo('deve simular webhook do WhatsApp')
  it.todo('deve auto-criar lead')
  it.todo('deve processar através do flow')
  it.todo('deve retornar resposta e debug info')
})
EOF

print_success "Scaffolds webhooks criados"

################################################################################
# Summary
################################################################################
print_step "Sumário"

echo ""
echo "📁 Arquivos criados:"
echo "  ✅ tests/unit/app/api/health/route.test.ts (COMPLETO)"
echo "  ⏳ tests/unit/app/api/leads/route.test.ts (scaffold)"
echo "  ⏳ tests/unit/app/api/leads/[id]/route.test.ts (scaffold)"
echo "  ⏳ tests/unit/app/api/leads/stats/route.test.ts (scaffold)"
echo "  ⏳ tests/unit/app/api/analytics/*/route.test.ts (3 scaffolds)"
echo "  ⏳ tests/unit/app/api/conversations/*/route.test.ts (2 scaffolds)"
echo "  ⏳ tests/unit/app/api/consultants/*/route.test.ts (3 scaffolds)"
echo "  ⏳ tests/unit/app/api/webhook/*/route.test.ts (2 scaffolds)"
echo ""

echo "🎯 Status:"
echo "  • 1 arquivo completo (health)"
echo "  • 13 scaffolds criados (para implementar)"
echo ""

echo "🚀 Próximos passos:"
echo "  1. Execute: npm run test tests/unit/app/api/health"
echo "  2. Implemente os .todo() gradualmente"
echo "  3. Use: npm run test:coverage -- tests/unit/app/api"
echo ""

echo -e "${GREEN}✓ Setup concluído!${NC}"
echo ""
EOF

chmod +x E:/PROJETOS/Consultor.AI/scripts/setup-api-tests.sh
