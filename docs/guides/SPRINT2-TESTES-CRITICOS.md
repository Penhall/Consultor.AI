# 🚀 Sprint 2: Testes Críticos - Guia Executável

**Data Início**: 2026-01-12
**Status**: EM ANDAMENTO
**Meta**: 40-50% de cobertura de código
**Tempo Estimado**: 16 horas (2 semanas, 1-2h/dia)

---

## 🎯 Objetivo do Sprint 2

Criar testes para os **módulos mais críticos** do sistema:
1. **Flow Engine** - Core business logic (conversações)
2. **AI Service** - Compliance ANS (CRÍTICO para evitar problemas legais)
3. **Lead Service** - CRUD operations
4. **Analytics Service** - Cálculo de métricas

---

## 📊 Metas de Cobertura

| Módulo | Antes | Meta Sprint 2 | Prioridade |
|--------|-------|---------------|------------|
| **Flow Engine** | 0% | 80% | ⭐⭐⭐ CRÍTICO |
| **AI Service** | 0% | 90% | ⭐⭐⭐ MUITO CRÍTICO |
| **Lead Service** | 0% | 70% | ⭐⭐ IMPORTANTE |
| **Analytics Service** | 0% | 70% | ⭐⭐ IMPORTANTE |
| **GERAL** | 0% | 40-50% | - |

---

## 🗓️ Cronograma Sprint 2

### Semana 1 (8 horas)
- **Dia 1-2** (4h): Flow Engine - Parser + State Manager
- **Dia 3-4** (4h): Flow Engine - Executors + Engine

### Semana 2 (8 horas)
- **Dia 5-6** (4h): AI Service (Compliance ANS)
- **Dia 7** (2h): Lead Service
- **Dia 8** (2h): Analytics Service

---

## 📋 Checklist de Progresso Sprint 2

### 🔥 Prioridade 1: Flow Engine (6h)

#### Parser Tests (2h)
- [ ] T037a - Teste: parser aceita flow válido
- [ ] T037b - Teste: parser rejeita JSON malformado
- [ ] T037c - Teste: parser detecta referência circular
- [ ] T037d - Teste: parser detecta referência ausente
- [ ] T037e - Teste: parser valida tipos de step

#### State Manager Tests (1.5h)
- [ ] T038a - Teste: salvar estado de conversação
- [ ] T038b - Teste: recuperar estado de conversação
- [ ] T038c - Teste: atualizar estado (variáveis)
- [ ] T038d - Teste: histórico de steps

#### Step Executors Tests (1.5h)
- [ ] T039a - Teste: MessageExecutor substitui variáveis
- [ ] T039b - Teste: ChoiceExecutor valida opções
- [ ] T039c - Teste: ExecuteExecutor chama ação
- [ ] T039d - Teste: Tratamento de erros

#### Flow Engine Tests (1h)
- [ ] T040a - Teste: executar flow completo
- [ ] T040b - Teste: selecionar executor correto
- [ ] T040c - Teste: lidar com erros

---

### 🔥 Prioridade 2: AI Service (4h)

#### Compliance ANS Tests (3h) ⭐⭐⭐ MUITO CRÍTICO
- [ ] T062a - Teste: NÃO retorna preços exatos
- [ ] T062b - Teste: NÃO pede CPF/dados sensíveis
- [ ] T062c - Teste: NÃO faz promessas ilegais (zero carência)
- [ ] T062d - Teste: Valida resposta contém recomendações
- [ ] T062e - Teste: Resposta em português
- [ ] T062f - Teste: Resposta tem tom empático

#### Fallback Tests (1h)
- [ ] T062g - Teste: fallback quando Gemini falha
- [ ] T062h - Teste: template por tipo de perfil
- [ ] T062i - Teste: retry logic

---

### 🔥 Prioridade 3: Lead Service (3h)

#### CRUD Tests (2h)
- [ ] T077a - Teste: criar lead válido
- [ ] T077b - Teste: rejeitar lead inválido
- [ ] T077c - Teste: atualizar lead
- [ ] T077d - Teste: deletar lead
- [ ] T077e - Teste: buscar lead por ID

#### Business Logic Tests (1h)
- [ ] T077f - Teste: calcular score
- [ ] T077g - Teste: transições de status
- [ ] T077h - Teste: validar whatsapp_number

---

### 🔥 Prioridade 4: Analytics Service (3h)

#### Métricas Tests (2h)
- [ ] T090a - Teste: contar leads por status
- [ ] T090b - Teste: calcular média de score
- [ ] T090c - Teste: calcular taxa de conversão
- [ ] T090d - Teste: tempo médio de resposta

#### Charts Tests (1h)
- [ ] T090e - Teste: dados para pie chart
- [ ] T090f - Teste: dados para bar chart
- [ ] T090g - Teste: filtro por data

---

## 🚀 Como Usar Este Guia

### Passo 1: Escolher Módulo
Comece pelo mais crítico: **Flow Engine** ou **AI Service**

### Passo 2: Copiar Template
Cada seção tem um template de teste pronto para copiar/colar

### Passo 3: Executar Teste
```bash
# Rodar teste específico
npm run test tests/unit/lib/flow-engine/parser.test.ts

# Watch mode (recomendado)
npm run test:watch
```

### Passo 4: Ver Coverage
```bash
npm run test:coverage
```

### Passo 5: Marcar Checklist
Marque `[x]` quando o teste passar

---

## 📖 Onde Encontrar Templates

Cada módulo tem seu próprio arquivo de template detalhado:

1. **Flow Engine**: Ver seção abaixo (Templates incluídos)
2. **AI Service**: Ver seção abaixo (Templates incluídos)
3. **Lead Service**: Ver seção abaixo (Templates incluídos)
4. **Analytics Service**: Ver seção abaixo (Templates incluídos)

---

## 🧪 Template 1: Flow Parser Tests

**Arquivo**: `tests/unit/lib/flow-engine/parser.test.ts`

**Tempo estimado**: 2 horas

### Código Completo:

```typescript
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
} from '@/tests/fixtures/flows'

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
```

**Como usar**:
1. Copie o código acima
2. Cole em `tests/unit/lib/flow-engine/parser.test.ts`
3. Execute: `npm run test tests/unit/lib/flow-engine/parser.test.ts`
4. Marque `[x]` em T037a-T037e quando passar

---

## 🧪 Template 2: AI Service Compliance Tests

**Arquivo**: `tests/unit/lib/services/ai-service.test.ts`

**Tempo estimado**: 4 horas

**⚠️ CRÍTICO**: Estes testes validam compliance ANS - falhas podem causar problemas legais!

### Código Completo:

```typescript
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
```

**Como usar**:
1. Copie o código acima
2. Cole em `tests/unit/lib/services/ai-service.test.ts`
3. Execute: `npm run test tests/unit/lib/services/ai-service.test.ts`
4. Marque `[x]` em T062a-T062i quando passar

**⚠️ IMPORTANTE**: Estes testes são **CRÍTICOS**. Falhas aqui podem resultar em problemas legais com a ANS!

---

## 📊 Acompanhamento de Progresso

Execute este comando para ver cobertura atual:

```bash
npm run test:coverage
```

### Metas de Coverage por Fase:

| Fase | Módulo | Coverage Alvo | Status |
|------|--------|---------------|--------|
| **Fase 1** (Dia 1-2) | Flow Engine - Parser | 80% | ⏳ |
| **Fase 2** (Dia 3-4) | Flow Engine - Executors | 80% | ⏳ |
| **Fase 3** (Dia 5-6) | AI Service | 90% | ⏳ |
| **Fase 4** (Dia 7) | Lead Service | 70% | ⏳ |
| **Fase 5** (Dia 8) | Analytics Service | 70% | ⏳ |

---

## 🎯 Próximos Arquivos

Os templates para **Lead Service** e **Analytics Service** serão criados nos próximos arquivos separados para facilitar navegação:

- `SPRINT2-LEAD-SERVICE-TESTS.md` (próximo)
- `SPRINT2-ANALYTICS-SERVICE-TESTS.md` (próximo)

---

## 📞 Ajuda e Suporte

**Dúvidas sobre testes?**
- Consulte: `.rules/testing-standards.md`
- Veja exemplos: `tests/unit/exemplo.test.ts`

**Problemas com fixtures?**
- Verifique: `tests/fixtures/leads.ts`
- Verifique: `tests/fixtures/flows.ts`

**Mocks não funcionando?**
- Verifique: `tests/setup.ts`
- Verifique: `tests/mocks/supabase.ts`

---

**Última atualização**: 2026-01-12
**Próximo**: Criar templates para Lead Service e Analytics Service
**Status**: ✅ PRONTO PARA USO
