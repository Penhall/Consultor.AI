/**
 * AI Service Tests
 *
 * Tests the AI service functionality including:
 * - Fallback responses
 * - Configuration checks
 * - Helper functions
 *
 * Note: generateContextualResponse is tested in integration tests
 * because it requires actual Gemini API mocking at module level.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Save original env
const originalEnv = { ...process.env }

// Mock the module before importing
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Olá! Entendo que você busca um plano de saúde. Para te ajudar melhor, vou preparar algumas opções adequadas ao seu perfil. Posso te enviar as opções?',
    },
  })

  return {
    GoogleGenerativeAI: class MockGoogleGenerativeAI {
      constructor() {}
      getGenerativeModel() {
        return {
          generateContent: mockGenerateContent,
        }
      }
    },
  }
})

// Now import after mocking
import {
  generateContextualResponse,
  getFallbackResponse,
  isAIConfigured,
  getAIModelInfo,
} from '@/lib/services/ai-service'
import type { ConversationState } from '@/lib/flow-engine/types'
import type { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      GOOGLE_AI_API_KEY: 'test-api-key',
      GOOGLE_AI_MODEL: 'gemini-1.5-flash',
      GOOGLE_AI_TEMPERATURE: '0.7',
      GOOGLE_AI_MAX_TOKENS: '500',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('generateContextualResponse', () => {
    const mockLead: Lead = {
      id: 'lead-123',
      consultant_id: 'consultant-456',
      whatsapp_number: '+5511999999999',
      name: 'João Silva',
      status: 'novo',
      score: 50,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const mockState: ConversationState = {
      currentStepId: 'gerar_resposta',
      variables: {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      },
      responses: {},
      history: [],
      startedAt: new Date().toISOString(),
    }

    it('deve gerar resposta com sucesso', async () => {
      const result = await generateContextualResponse({
        state: mockState,
        lead: mockLead,
        consultantData: {
          name: 'Dr. Carlos',
          vertical: 'saude',
        },
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeDefined()
        expect(result.data.length).toBeGreaterThan(0)
      }
    })

    it('deve usar vertical saúde por padrão', async () => {
      const result = await generateContextualResponse({
        state: mockState,
        lead: mockLead,
      })

      expect(result.success).toBe(true)
    })

    it('deve incluir nome do lead no contexto quando disponível', async () => {
      const result = await generateContextualResponse({
        state: mockState,
        lead: mockLead,
        consultantData: { name: 'Ana' },
      })

      expect(result.success).toBe(true)
    })

    it('deve processar state com variables preenchidas', async () => {
      const stateWithVariables: ConversationState = {
        ...mockState,
        variables: {
          perfil: 'familia',
          idade: '46-60',
          coparticipacao: 'sim',
        },
      }

      const result = await generateContextualResponse({
        state: stateWithVariables,
        lead: mockLead,
      })

      expect(result.success).toBe(true)
    })

    it('deve processar state com responses preenchidas', async () => {
      const stateWithResponses: ConversationState = {
        ...mockState,
        variables: {},
        responses: {
          perfil: 'empresa',
          idade: 'ate_30',
        },
      }

      const result = await generateContextualResponse({
        state: stateWithResponses,
        lead: mockLead,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('getFallbackResponse', () => {
    it('deve retornar fallback para saúde', () => {
      const response = getFallbackResponse('saude')

      expect(response).toContain('plano de saúde')
      expect(response).toContain('individual')
      expect(response.length).toBeGreaterThan(50)
    })

    it('deve retornar fallback para imóveis', () => {
      const response = getFallbackResponse('imoveis')

      expect(response).toContain('imóvel')
      expect(response.length).toBeGreaterThan(50)
    })

    it('deve retornar fallback para automóveis', () => {
      const response = getFallbackResponse('automoveis')

      expect(response).toContain('veículo')
      expect(response.length).toBeGreaterThan(50)
    })

    it('deve retornar fallback para financeiro', () => {
      const response = getFallbackResponse('financeiro')

      expect(response).toContain('financeiros')
      expect(response.length).toBeGreaterThan(50)
    })

    it('deve retornar saúde como padrão para vertical desconhecido', () => {
      const response = getFallbackResponse('unknown')

      expect(response).toContain('plano de saúde')
    })

    it('deve retornar saúde quando vertical não especificado', () => {
      const response = getFallbackResponse()

      expect(response).toContain('plano de saúde')
    })

    // Compliance tests for fallback responses
    it('fallback NÃO deve conter preços exatos', () => {
      const verticals = ['saude', 'imoveis', 'automoveis', 'financeiro']

      verticals.forEach(vertical => {
        const response = getFallbackResponse(vertical)

        const pricePatterns = [
          /R\$\s*\d+[.,]?\d*/gi,
          /\d+\s*reais/gi,
        ]

        pricePatterns.forEach(pattern => {
          expect(response).not.toMatch(pattern)
        })
      })
    })

    it('fallback NÃO deve pedir dados sensíveis', () => {
      const verticals = ['saude', 'imoveis', 'automoveis', 'financeiro']

      verticals.forEach(vertical => {
        const response = getFallbackResponse(vertical)

        const sensitivePatterns = [
          /cpf/gi,
          /rg/gi,
          /senha/gi,
          /cartão de crédito/gi,
        ]

        sensitivePatterns.forEach(pattern => {
          expect(response).not.toMatch(pattern)
        })
      })
    })
  })

  describe('isAIConfigured', () => {
    it('deve retornar true quando API key está configurada', () => {
      process.env.GOOGLE_AI_API_KEY = 'test-key'

      const result = isAIConfigured()

      expect(result).toBe(true)
    })

    it('deve retornar false quando API key não está configurada', () => {
      delete process.env.GOOGLE_AI_API_KEY

      const result = isAIConfigured()

      expect(result).toBe(false)
    })

    it('deve retornar false quando API key é string vazia', () => {
      process.env.GOOGLE_AI_API_KEY = ''

      const result = isAIConfigured()

      expect(result).toBe(false)
    })
  })

  describe('getAIModelInfo', () => {
    it('deve retornar informações do modelo', () => {
      process.env.GOOGLE_AI_API_KEY = 'test-key'
      process.env.GOOGLE_AI_MODEL = 'gemini-1.5-flash'

      const info = getAIModelInfo()

      expect(info).toHaveProperty('model')
      expect(info).toHaveProperty('temperature')
      expect(info).toHaveProperty('maxTokens')
      expect(info).toHaveProperty('configured')
      expect(info.configured).toBe(true)
    })

    it('deve refletir configuração ausente', () => {
      delete process.env.GOOGLE_AI_API_KEY

      const info = getAIModelInfo()

      expect(info.configured).toBe(false)
    })
  })

  describe('Validação de Parâmetros', () => {
    const mockLead: Lead = {
      id: 'lead-123',
      consultant_id: 'consultant-456',
      whatsapp_number: '+5511999999999',
      name: null,
      status: 'novo',
      score: null,
      metadata: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const emptyState: ConversationState = {
      currentStepId: 'inicio',
      variables: {},
      responses: {},
      history: [],
      startedAt: new Date().toISOString(),
    }

    it('deve funcionar com lead sem nome', async () => {
      const result = await generateContextualResponse({
        state: emptyState,
        lead: mockLead,
      })

      expect(result.success).toBe(true)
    })

    it('deve funcionar com state vazio', async () => {
      const result = await generateContextualResponse({
        state: emptyState,
        lead: mockLead,
      })

      expect(result.success).toBe(true)
    })

    it('deve funcionar sem consultantData', async () => {
      const result = await generateContextualResponse({
        state: emptyState,
        lead: mockLead,
      })

      expect(result.success).toBe(true)
    })

    it('deve funcionar com consultantData parcial', async () => {
      const result = await generateContextualResponse({
        state: emptyState,
        lead: mockLead,
        consultantData: {
          name: 'Maria',
        },
      })

      expect(result.success).toBe(true)
    })
  })
})
