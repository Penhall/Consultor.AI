#!/bin/bash

################################################################################
# Setup Sprint 2 Tests - Testes Críticos
#
# Este script cria automaticamente os arquivos de teste do Sprint 2
# baseados nos templates documentados.
#
# Tempo de execução: ~5 segundos
#
# Uso:
#   chmod +x scripts/setup-sprint2-tests.sh
#   ./scripts/setup-sprint2-tests.sh
#
# Criado: 2026-01-12
################################################################################

set -e  # Exit on error

echo "🚀 Setup Sprint 2 - Testes Críticos"
echo "===================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de progresso
STEP=1
TOTAL_STEPS=8

print_step() {
  echo -e "${BLUE}[$STEP/$TOTAL_STEPS]${NC} $1"
  ((STEP++))
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

################################################################################
# STEP 1: Criar estrutura de diretórios
################################################################################
print_step "Criando estrutura de diretórios..."

mkdir -p tests/unit/lib/flow-engine
mkdir -p tests/unit/lib/services

print_success "Diretórios criados"
echo ""

################################################################################
# STEP 2: Criar Flow Parser Tests
################################################################################
print_step "Criando Flow Parser Tests..."

cat > tests/unit/lib/flow-engine/parser.test.ts << 'EOF'
/**
 * Flow Parser Tests
 *
 * Testa validação e parsing de flows JSON.
 * Garante que apenas flows válidos sejam aceitos.
 */

import { describe, it, expect } from 'vitest'
import { validateFlowDefinition } from '@/lib/flow-engine/parser'
import {
  mockFlowHealthBasic,
  mockFlowCircular,
  mockFlowMissingReference
} from '@tests/fixtures/flows'

describe('Flow Parser', () => {
  describe('Flow Válido', () => {
    it('deve aceitar flow válido completo', () => {
      const result = validateFlowDefinition(mockFlowHealthBasic)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('deve validar estrutura básica do flow', () => {
      const minimalFlow = {
        id: 'flow-minimal',
        nome: 'Flow Mínimo',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'inicio',
            tipo: 'mensagem',
            mensagem: 'Olá',
            proxima: null,
          },
        ],
      }

      const result = validateFlowDefinition(minimalFlow)

      expect(result.valid).toBe(true)
    })

    it('deve aceitar flow com múltiplos tipos de step', () => {
      const flow = {
        id: 'flow-mixed',
        nome: 'Flow Misto',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          { id: 'msg', tipo: 'mensagem', mensagem: 'Oi', proxima: 'escolha' },
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [
              { texto: 'A', valor: 'a', proxima: 'acao' }
            ]
          },
          { id: 'acao', tipo: 'executar', acao: 'gerar_resposta_ia', proxima: null },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })
  })

  describe('Validação de Estrutura', () => {
    it('deve rejeitar flow sem ID', () => {
      const invalidFlow = {
        nome: 'Sem ID',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [],
      }

      const result = validateFlowDefinition(invalidFlow as any)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('id')
      )
    })

    it('deve rejeitar flow sem nome', () => {
      const invalidFlow = {
        id: 'flow-1',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [],
      }

      const result = validateFlowDefinition(invalidFlow as any)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('nome')
      )
    })

    it('deve rejeitar flow sem etapas', () => {
      const invalidFlow = {
        id: 'flow-1',
        nome: 'Sem Etapas',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [],
      }

      const result = validateFlowDefinition(invalidFlow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('etapas')
      )
    })
  })

  describe('Validação de Referências', () => {
    it('deve detectar referência circular', () => {
      const result = validateFlowDefinition(mockFlowCircular)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('circular')
      )
    })

    it('deve detectar referência inexistente', () => {
      const result = validateFlowDefinition(mockFlowMissingReference)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('nonexistent-step')
      )
    })

    it('deve aceitar múltiplas opções apontando para mesmo step', () => {
      const flow = {
        id: 'flow-convergent',
        nome: 'Flow Convergente',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [
              { texto: 'A', valor: 'a', proxima: 'fim' },
              { texto: 'B', valor: 'b', proxima: 'fim' },
            ]
          },
          { id: 'fim', tipo: 'mensagem', mensagem: 'Fim', proxima: null },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })
  })

  describe('Validação de Tipos de Step', () => {
    it('deve validar step tipo mensagem', () => {
      const flow = {
        id: 'flow-msg',
        nome: 'Flow Mensagem',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'msg',
            tipo: 'mensagem',
            mensagem: 'Olá {{nome}}',
            proxima: null
          },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })

    it('deve rejeitar step mensagem sem texto', () => {
      const flow = {
        id: 'flow-invalid-msg',
        nome: 'Invalid',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          { id: 'msg', tipo: 'mensagem', proxima: null } as any,
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('mensagem')
      )
    })

    it('deve validar step tipo escolha', () => {
      const flow = {
        id: 'flow-choice',
        nome: 'Flow Escolha',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [
              { texto: 'Sim', valor: 'sim', proxima: null },
              { texto: 'Não', valor: 'nao', proxima: null },
            ]
          },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })

    it('deve rejeitar step escolha sem opções', () => {
      const flow = {
        id: 'flow-invalid-choice',
        nome: 'Invalid',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: []
          } as any,
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('opcoes')
      )
    })

    it('deve validar step tipo executar', () => {
      const flow = {
        id: 'flow-execute',
        nome: 'Flow Executar',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'acao',
            tipo: 'executar',
            acao: 'gerar_resposta_ia',
            proxima: null
          },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })

    it('deve rejeitar step executar sem ação', () => {
      const flow = {
        id: 'flow-invalid-execute',
        nome: 'Invalid',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          { id: 'acao', tipo: 'executar', proxima: null } as any,
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('acao')
      )
    })
  })

  describe('Validação de IDs Únicos', () => {
    it('deve rejeitar steps com IDs duplicados', () => {
      const flow = {
        id: 'flow-duplicate-ids',
        nome: 'IDs Duplicados',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          { id: 'step1', tipo: 'mensagem', mensagem: 'A', proxima: 'step2' },
          { id: 'step1', tipo: 'mensagem', mensagem: 'B', proxima: null }, // Duplicado!
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('duplicado')
      )
    })
  })
})
EOF

print_success "Flow Parser Tests criado (parser.test.ts)"
echo ""

################################################################################
# STEP 3: Criar AI Service Tests
################################################################################
print_step "Criando AI Service Compliance Tests..."

cat > tests/unit/lib/services/ai-service.test.ts << 'EOF'
/**
 * AI Service Tests - Compliance ANS
 *
 * ⚠️ CRÍTICO: Estes testes garantem que o sistema
 * não viola regulamentações da ANS:
 * - Não pode fornecer preços exatos
 * - Não pode pedir dados sensíveis (CPF, histórico médico)
 * - Não pode fazer promessas ilegais (zero carência, cobertura imediata)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateCompliantResponse } from '@/lib/services/ai-service'

describe('AI Service - Compliance ANS', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Proibição de Preços Exatos', () => {
    it('NÃO deve retornar preços em formato R$ XXX,XX', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'João Silva',
        consultantBio: 'Consultor de saúde há 10 anos',
      })

      // Regex para detectar preços
      const pricePatterns = [
        /R\$\s*\d+[.,]?\d*/gi,       // R$ 1000 ou R$ 1.000,00
        /\d+\s*reais/gi,              // 1000 reais
        /valor\s+de\s+\d+/gi,         // valor de 1000
        /custa\s+\d+/gi,              // custa 1000
        /mensalidade\s+de\s+\d+/gi,   // mensalidade de 1000
      ]

      pricePatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })

    it('PODE usar termos gerais de custo (sem valores)', async () => {
      const leadData = {
        perfil: 'familia',
        idade: '46-60',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Maria Santos',
      })

      // Termos gerais permitidos
      const allowedTerms = [
        'mensalidade',
        'valor',
        'investimento',
        'custo',
        'preço',
      ]

      // Deve mencionar custo de forma geral, mas sem valores exatos
      const mentionsCost = allowedTerms.some(term =>
        response.toLowerCase().includes(term)
      )

      // Pelo menos um termo de custo deve ser mencionado
      expect(mentionsCost).toBe(true)
    })

    it('NÃO deve fornecer faixas de preço', async () => {
      const leadData = {
        perfil: 'empresa',
        idade: 'ate_30',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Pedro Costa',
      })

      // Não deve ter faixas como "entre R$ X e R$ Y"
      const rangePricingPatterns = [
        /entre\s+R\$.*e\s+R\$/gi,
        /de\s+R\$.*até\s+R\$/gi,
        /a\s+partir\s+de\s+R\$/gi,
      ]

      rangePricingPatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })
  })

  describe('Proibição de Coleta de Dados Sensíveis', () => {
    it('NÃO deve pedir CPF', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Ana Paula',
      })

      const cpfPatterns = [
        /cpf/gi,
        /cadastro de pessoa física/gi,
        /documento/gi,
        /rg/gi,
      ]

      cpfPatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })

    it('NÃO deve pedir histórico médico', async () => {
      const leadData = {
        perfil: 'casal',
        idade: 'acima_60',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Carlos Mendes',
      })

      const medicalPatterns = [
        /histórico médico/gi,
        /doenças preexistentes/gi,
        /problemas de saúde/gi,
        /medicamentos que usa/gi,
        /cirurgias anteriores/gi,
      ]

      medicalPatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })

    it('NÃO deve pedir dados financeiros sensíveis', async () => {
      const leadData = {
        perfil: 'familia',
        idade: '31-45',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Fernanda Lima',
      })

      const financialPatterns = [
        /conta bancária/gi,
        /cartão de crédito/gi,
        /número do cartão/gi,
        /senha/gi,
      ]

      financialPatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })
  })

  describe('Proibição de Promessas Ilegais', () => {
    it('NÃO deve prometer cobertura imediata', async () => {
      const leadData = {
        perfil: 'individual',
        idade: 'ate_30',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Roberto Alves',
      })

      const immediatePatterns = [
        /cobertura imediata/gi,
        /usa hoje/gi,
        /sem carência/gi,
        /zero carência/gi,
        /carência zero/gi,
      ]

      immediatePatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })

    it('NÃO deve garantir aceitação sem análise', async () => {
      const leadData = {
        perfil: 'empresa',
        idade: '46-60',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Juliana Ferreira',
      })

      const guaranteePatterns = [
        /garantido/gi,
        /aprovado com certeza/gi,
        /100% de aceitação/gi,
        /aceito sem análise/gi,
      ]

      guaranteePatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })
  })

  describe('Qualidade da Resposta', () => {
    it('deve conter recomendações de planos', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Lucas Martins',
      })

      expect(response).toMatch(/plano/gi)
      expect(response.length).toBeGreaterThan(100)
    })

    it('deve ter tom empático e acolhedor', async () => {
      const leadData = {
        perfil: 'familia',
        idade: '46-60',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Beatriz Costa',
      })

      const empatheticTerms = [
        /entendo/gi,
        /compreendo/gi,
        /perfeito/gi,
        /ótimo/gi,
        /vou te ajudar/gi,
        /posso te auxiliar/gi,
      ]

      const hasEmpathy = empatheticTerms.some(pattern =>
        pattern.test(response)
      )

      expect(hasEmpathy).toBe(true)
    })

    it('deve estar em português brasileiro', async () => {
      const leadData = {
        perfil: 'casal',
        idade: 'ate_30',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Thiago Oliveira',
      })

      // Deve ter características do português (acentuação, ç, etc.)
      const portugueseChars = /[áàâãéêíóôõúüç]/gi
      expect(response).toMatch(portugueseChars)

      // Não deve ter texto em inglês
      expect(response).not.toMatch(/hello|hi|thank you|please/gi)
    })

    it('deve ter comprimento adequado (mínimo 150 caracteres)', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Patricia Souza',
      })

      expect(response.length).toBeGreaterThanOrEqual(150)
    })

    it('deve incluir call-to-action', async () => {
      const leadData = {
        perfil: 'empresa',
        idade: '46-60',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Ricardo Santos',
      })

      const ctaPatterns = [
        /posso.*enviar/gi,
        /gostaria.*receber/gi,
        /te envio/gi,
        /mando.*proposta/gi,
        /vamos.*conversar/gi,
      ]

      const hasCTA = ctaPatterns.some(pattern => pattern.test(response))
      expect(hasCTA).toBe(true)
    })
  })

  describe('Fallback quando AI Falha', () => {
    it('deve retornar template quando Gemini falha', async () => {
      // Mock Gemini para falhar
      vi.mock('@/lib/ai/gemini', () => ({
        generateResponse: vi.fn().mockRejectedValue(new Error('API Error'))
      }))

      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Marcos Silva',
      })

      // Deve ter resposta (não undefined ou vazio)
      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(50)

      // Deve mencionar plano
      expect(response.toLowerCase()).toContain('plano')
    })

    it('deve usar template específico por perfil', async () => {
      vi.mock('@/lib/ai/gemini', () => ({
        generateResponse: vi.fn().mockRejectedValue(new Error('API Error'))
      }))

      const leadDataIndividual = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const leadDataFamilia = {
        perfil: 'familia',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const responseIndividual = await generateCompliantResponse(leadDataIndividual, {
        consultantName: 'Ana',
      })

      const responseFamilia = await generateCompliantResponse(leadDataFamilia, {
        consultantName: 'Ana',
      })

      // Respostas devem ser diferentes para perfis diferentes
      expect(responseIndividual).not.toBe(responseFamilia)
    })
  })

  describe('Performance', () => {
    it('deve gerar resposta em menos de 3 segundos', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const startTime = Date.now()

      await generateCompliantResponse(leadData, {
        consultantName: 'Paulo Gomes',
      })

      const duration = Date.now() - startTime

      // Máximo 3 segundos (3000ms)
      expect(duration).toBeLessThan(3000)
    })
  })
})
EOF

print_success "AI Service Compliance Tests criado (ai-service.test.ts)"
echo ""

################################################################################
# STEP 4: Criar Lead Service Tests
################################################################################
print_step "Criando Lead Service Tests..."

# Note: This will be read from SPRINT2-LEAD-SERVICE-TESTS.md
# For now, creating a placeholder that references the template file

cat > tests/unit/lib/services/lead-service.test.ts << 'EOF'
/**
 * Lead Service Tests
 *
 * Testa operações CRUD e lógica de negócio dos leads.
 * Garante integridade de dados e regras de negócio.
 *
 * Template completo em: docs/guides/SPRINT2-LEAD-SERVICE-TESTS.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createLead,
  updateLead,
  deleteLead,
  getLeadById,
  calculateLeadScore,
  validateStatusTransition,
} from '@/lib/services/lead-service'
import { mockLeads } from '@tests/fixtures/leads'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockLeads[0],
        error: null,
      }),
    })),
  }),
}))

describe('Lead Service - CRUD Operations', () => {
  describe('Create Lead', () => {
    it('deve criar lead com dados válidos', async () => {
      const newLead = {
        consultant_id: 'consultant-test-1',
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'novo' as const,
      }

      const result = await createLead(newLead)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('id')
      expect(result.data?.whatsapp_number).toBe(newLead.whatsapp_number)
    })

    it('deve rejeitar lead com whatsapp_number inválido', async () => {
      const invalidLead = {
        consultant_id: 'consultant-test-1',
        whatsapp_number: '123', // Muito curto
        name: 'João Silva',
        status: 'novo' as const,
      }

      const result = await createLead(invalidLead)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/whatsapp_number/i)
    })
  })

  describe('Update Lead', () => {
    it('deve atualizar status do lead', async () => {
      const leadId = 'lead-test-1'
      const updates = {
        status: 'qualificado' as const,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('qualificado')
    })
  })

  describe('Delete Lead', () => {
    it('deve deletar lead existente', async () => {
      const leadId = 'lead-test-1'

      const result = await deleteLead(leadId)

      expect(result.success).toBe(true)
    })
  })

  describe('Get Lead by ID', () => {
    it('deve buscar lead existente', async () => {
      const leadId = 'lead-test-1'

      const result = await getLeadById(leadId)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('id', leadId)
    })
  })
})

describe('Lead Service - Business Logic', () => {
  describe('Score Calculation', () => {
    it('deve calcular score baseado em perfil individual', () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const score = calculateLeadScore(leadData)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('Status Transitions', () => {
    it('deve permitir transição novo → em_contato', () => {
      const isValid = validateStatusTransition('novo', 'em_contato')

      expect(isValid).toBe(true)
    })

    it('deve rejeitar transição fechado → novo', () => {
      const isValid = validateStatusTransition('fechado', 'novo')

      expect(isValid).toBe(false)
    })
  })
})

// Helper function (mock - implementar no serviço real)
function validateWhatsAppNumber(number: string): boolean {
  const whatsappRegex = /^\+\d{10,15}$/
  return whatsappRegex.test(number)
}
EOF

print_success "Lead Service Tests criado (lead-service.test.ts)"
print_warning "  Template completo disponível em: docs/guides/SPRINT2-LEAD-SERVICE-TESTS.md"
echo ""

################################################################################
# STEP 5: Criar Analytics Service Tests
################################################################################
print_step "Criando Analytics Service Tests..."

cat > tests/unit/lib/services/analytics-service.test.ts << 'EOF'
/**
 * Analytics Service Tests
 *
 * Testa cálculo de métricas, agregações e formatação de dados para charts.
 * Garante precisão dos indicadores de performance do consultor.
 *
 * Template completo em: docs/guides/SPRINT2-ANALYTICS-SERVICE-TESTS.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getLeadCountByStatus,
  getAverageScore,
  getConversionRate,
  getAverageResponseTime,
  getPieChartData,
  getBarChartData,
  filterByDateRange,
} from '@/lib/services/analytics-service'
import { mockLeads } from '@tests/fixtures/leads'

describe('Analytics Service - Métricas', () => {
  describe('Lead Count by Status', () => {
    it('deve contar leads por status corretamente', () => {
      const leads = [
        { ...mockLeads[0], status: 'novo' },
        { ...mockLeads[1], status: 'novo' },
        { ...mockLeads[0], id: 'lead-3', status: 'qualificado' },
        { ...mockLeads[0], id: 'lead-4', status: 'fechado' },
      ]

      const result = getLeadCountByStatus(leads)

      expect(result).toEqual({
        novo: 2,
        em_contato: 0,
        qualificado: 1,
        fechado: 1,
        perdido: 0,
      })
    })

    it('deve retornar 0 para todos os status quando não há leads', () => {
      const leads: any[] = []

      const result = getLeadCountByStatus(leads)

      expect(result).toEqual({
        novo: 0,
        em_contato: 0,
        qualificado: 0,
        fechado: 0,
        perdido: 0,
      })
    })
  })

  describe('Average Score', () => {
    it('deve calcular média de score corretamente', () => {
      const leads = [
        { ...mockLeads[0], score: 80 },
        { ...mockLeads[0], id: 'lead-2', score: 90 },
        { ...mockLeads[0], id: 'lead-3', score: 70 },
      ]

      const result = getAverageScore(leads)

      // Média: (80 + 90 + 70) / 3 = 80
      expect(result).toBe(80)
    })

    it('deve retornar 0 quando não há leads', () => {
      const leads: any[] = []

      const result = getAverageScore(leads)

      expect(result).toBe(0)
    })
  })

  describe('Conversion Rate', () => {
    it('deve calcular taxa de conversão corretamente', () => {
      const leads = [
        { ...mockLeads[0], status: 'novo' },
        { ...mockLeads[0], id: 'lead-2', status: 'qualificado' },
        { ...mockLeads[0], id: 'lead-3', status: 'fechado' },
        { ...mockLeads[0], id: 'lead-4', status: 'fechado' },
        { ...mockLeads[0], id: 'lead-5', status: 'perdido' },
      ]

      const result = getConversionRate(leads)

      // Taxa: 2 fechados / 5 total = 40%
      expect(result).toBe(40)
    })

    it('deve retornar 0 quando não há leads', () => {
      const leads: any[] = []

      const result = getConversionRate(leads)

      expect(result).toBe(0)
    })
  })
})

describe('Analytics Service - Charts', () => {
  describe('Pie Chart Data', () => {
    it('deve formatar dados para pie chart corretamente', () => {
      const leads = [
        { ...mockLeads[0], status: 'novo' },
        { ...mockLeads[0], id: 'lead-2', status: 'novo' },
        { ...mockLeads[0], id: 'lead-3', status: 'qualificado' },
        { ...mockLeads[0], id: 'lead-4', status: 'fechado' },
      ]

      const result = getPieChartData(leads)

      expect(result).toEqual([
        { label: 'Novo', value: 2, percentage: 50 },
        { label: 'Em Contato', value: 0, percentage: 0 },
        { label: 'Qualificado', value: 1, percentage: 25 },
        { label: 'Fechado', value: 1, percentage: 25 },
        { label: 'Perdido', value: 0, percentage: 0 },
      ])
    })
  })

  describe('Bar Chart Data', () => {
    it('deve agrupar leads por data corretamente', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-10T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-10T14:00:00Z' },
        { ...mockLeads[0], id: 'lead-3', created_at: '2026-01-11T10:00:00Z' },
      ]

      const result = getBarChartData(leads, 'day')

      expect(result).toEqual([
        { date: '2026-01-10', count: 2 },
        { date: '2026-01-11', count: 1 },
      ])
    })
  })
})

describe('Analytics Service - Edge Cases', () => {
  it('deve retornar métricas vazias para array vazio', () => {
    const leads: any[] = []

    expect(getLeadCountByStatus(leads).novo).toBe(0)
    expect(getAverageScore(leads)).toBe(0)
    expect(getConversionRate(leads)).toBe(0)
    expect(getPieChartData(leads)).toBeDefined()
  })
})
EOF

print_success "Analytics Service Tests criado (analytics-service.test.ts)"
print_warning "  Template completo disponível em: docs/guides/SPRINT2-ANALYTICS-SERVICE-TESTS.md"
echo ""

################################################################################
# STEP 6: Criar placeholders para Flow Engine testes restantes
################################################################################
print_step "Criando placeholders para testes adicionais do Flow Engine..."

# State Manager
cat > tests/unit/lib/flow-engine/state-manager.test.ts << 'EOF'
/**
 * State Manager Tests
 *
 * Testa gerenciamento de estado de conversações.
 *
 * TODO: Implementar testes seguindo o padrão do parser.test.ts
 * Referência: docs/guides/SPRINT2-TESTES-CRITICOS.md
 */

import { describe, it, expect } from 'vitest'

describe('State Manager', () => {
  it.todo('deve salvar estado de conversação')
  it.todo('deve recuperar estado de conversação')
  it.todo('deve atualizar estado (variáveis)')
  it.todo('deve manter histórico de steps')
})
EOF

# Executors
cat > tests/unit/lib/flow-engine/executors.test.ts << 'EOF'
/**
 * Step Executors Tests
 *
 * Testa executores de steps (message, choice, execute).
 *
 * TODO: Implementar testes seguindo o padrão do parser.test.ts
 * Referência: docs/guides/SPRINT2-TESTES-CRITICOS.md
 */

import { describe, it, expect } from 'vitest'

describe('Step Executors', () => {
  describe('Message Executor', () => {
    it.todo('deve substituir variáveis na mensagem')
  })

  describe('Choice Executor', () => {
    it.todo('deve validar opções')
  })

  describe('Execute Executor', () => {
    it.todo('deve chamar ação correta')
  })

  describe('Error Handling', () => {
    it.todo('deve lidar com erros gracefully')
  })
})
EOF

# Engine
cat > tests/unit/lib/flow-engine/engine.test.ts << 'EOF'
/**
 * Flow Engine Tests
 *
 * Testa orquestração completa do Flow Engine.
 *
 * TODO: Implementar testes seguindo o padrão do parser.test.ts
 * Referência: docs/guides/SPRINT2-TESTES-CRITICOS.md
 */

import { describe, it, expect } from 'vitest'

describe('Flow Engine', () => {
  it.todo('deve executar flow completo')
  it.todo('deve selecionar executor correto por tipo de step')
  it.todo('deve lidar com erros durante execução')
})
EOF

print_success "Placeholders criados para State Manager, Executors e Engine"
print_warning "  Estes arquivos precisam ser completados manualmente"
echo ""

################################################################################
# STEP 7: Executar testes para validar
################################################################################
print_step "Validando testes criados..."

if command -v npm &> /dev/null; then
  echo "Executando: npm run test -- --run"
  npm run test -- --run || print_warning "Alguns testes falharam (esperado se as funções ainda não foram implementadas)"
else
  print_warning "npm não encontrado. Pule este step ou instale Node.js"
fi

echo ""

################################################################################
# STEP 8: Sumário
################################################################################
print_step "Sumário do Setup"

echo ""
echo "📁 Arquivos criados:"
echo "  ✅ tests/unit/lib/flow-engine/parser.test.ts"
echo "  ✅ tests/unit/lib/services/ai-service.test.ts"
echo "  ✅ tests/unit/lib/services/lead-service.test.ts"
echo "  ✅ tests/unit/lib/services/analytics-service.test.ts"
echo "  ⏳ tests/unit/lib/flow-engine/state-manager.test.ts (placeholder)"
echo "  ⏳ tests/unit/lib/flow-engine/executors.test.ts (placeholder)"
echo "  ⏳ tests/unit/lib/flow-engine/engine.test.ts (placeholder)"
echo ""

echo "📊 Status Sprint 2:"
echo "  • Flow Parser: ✅ Pronto para testar"
echo "  • AI Service Compliance: ✅ Pronto para testar"
echo "  • Lead Service: ✅ Pronto para testar (template básico)"
echo "  • Analytics Service: ✅ Pronto para testar (template básico)"
echo "  • State Manager: ⏳ Implementar manualmente"
echo "  • Executors: ⏳ Implementar manualmente"
echo "  • Engine: ⏳ Implementar manualmente"
echo ""

echo "🎯 Próximos passos:"
echo "  1. Execute: npm run test:watch"
echo "  2. Comece implementando as funções testadas"
echo "  3. Veja os testes passarem em tempo real"
echo "  4. Complete os placeholders (state-manager, executors, engine)"
echo "  5. Consulte templates completos em docs/guides/"
echo ""

echo "📚 Documentação:"
echo "  • SPRINT2-TESTES-CRITICOS.md - Guia principal"
echo "  • SPRINT2-LEAD-SERVICE-TESTS.md - Template Lead Service"
echo "  • SPRINT2-ANALYTICS-SERVICE-TESTS.md - Template Analytics Service"
echo ""

echo -e "${GREEN}✓ Setup Sprint 2 concluído com sucesso!${NC}"
echo ""
