/**
 * Mock Webhook API Tests
 * POST /api/webhook/mock
 *
 * Tests development webhook for local testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  mockWebhookConsultant,
  mockWhatsAppLead,
  mockDefaultFlow,
  mockActiveConversation,
} from '@tests/fixtures/webhooks'

// Use vi.hoisted() to ensure mock functions are available before vi.mock runs
const {
  mockGetOrCreateLead,
  mockGenerateContextualResponse,
  mockCreateClient,
  MockFlowEngine,
} = vi.hoisted(() => ({
  mockGetOrCreateLead: vi.fn(),
  mockGenerateContextualResponse: vi.fn(),
  mockCreateClient: vi.fn(),
  MockFlowEngine: vi.fn(),
}))

// Mock modules with explicit factories
vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

vi.mock('@/lib/services/lead-auto-create', () => ({
  getOrCreateLead: mockGetOrCreateLead,
}))

vi.mock('@/lib/services/ai-service', () => ({
  generateContextualResponse: mockGenerateContextualResponse,
}))

vi.mock('@/lib/flow-engine', () => ({
  FlowEngine: MockFlowEngine,
}))

// Import after mocking
import { POST } from '@/app/api/webhook/mock/route'

describe('POST /api/webhook/mock', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup Supabase mock
    mockSupabase = {
      from: vi.fn(),
    }
    mockCreateClient.mockResolvedValue(mockSupabase)
  })

  it('deve retornar 400 se parâmetros obrigatórios faltando', async () => {
    // Arrange
    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({ from: '5511988888888' }), // Missing 'text'
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.error).toBe('Parâmetros obrigatórios: from, text')
  })

  it('deve retornar 404 se nenhum consultor encontrado', async () => {
    // Arrange
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }
      }
      return {}
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Olá',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.error).toBe('Nenhum consultor encontrado. Crie um consultor primeiro.')
  })

  it('deve retornar 404 se nenhum flow ativo encontrado', async () => {
    // Arrange
    mockGetOrCreateLead.mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockWebhookConsultant,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }
      }
      return {}
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Olá',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.error).toBe('Nenhum flow ativo encontrado')
  })

  it('deve criar lead automaticamente se não existir', async () => {
    // Arrange
    const mockFlowEngine = {
      processMessage: vi.fn().mockResolvedValue({
        nextStepId: 'step-2',
        variables: { nome: 'João Silva' },
        response: 'Qual seu perfil?',
        choices: [],
      }),
    }
    MockFlowEngine.mockImplementation(function (this: any) {
      return mockFlowEngine
    })
    mockGetOrCreateLead.mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: true },
    })

    const insertMessageMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const insertConversationMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockActiveConversation,
          error: null,
        }),
      }),
    })
    const updateConversationMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockWebhookConsultant,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
          insert: insertConversationMock,
          update: updateConversationMock,
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockDefaultFlow,
                    error: null,
                  }),
                }),
              }),
              single: vi.fn().mockResolvedValue({
                data: mockDefaultFlow,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: insertMessageMock }
      }
      return {}
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Olá',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockGetOrCreateLead).toHaveBeenCalledWith(
      mockWebhookConsultant.id,
      '5511988888888',
      'Olá'
    )
  })

  it('deve processar mensagem através do FlowEngine', async () => {
    // Arrange
    const mockFlowEngine = {
      processMessage: vi.fn().mockResolvedValue({
        nextStepId: 'step-2',
        variables: { nome: 'João Silva', perfil: 'individual' },
        response: 'Qual sua idade?',
        choices: [],
      }),
    }
    MockFlowEngine.mockImplementation(function (this: any) {
      return mockFlowEngine
    })
    mockGetOrCreateLead.mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })

    const insertMessageMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateConversationMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockWebhookConsultant,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockActiveConversation,
                  error: null,
                }),
              }),
            }),
          }),
          update: updateConversationMock,
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockDefaultFlow,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: insertMessageMock }
      }
      return {}
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Individual',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockFlowEngine.processMessage).toHaveBeenCalledWith(
      'Individual',
      'step-2',
      { nome: 'João Silva' }
    )
    expect(data.response.text).toBe('Qual sua idade?')
  })

  it('deve gerar resposta com IA quando ação for gerar_resposta_ia', async () => {
    // Arrange
    const mockFlowEngine = {
      processMessage: vi.fn().mockResolvedValue({
        nextStepId: 'fim',
        variables: {
          perfil: 'individual',
          faixa_etaria: '31 a 45 anos',
          coparticipacao: 'não',
        },
        response: '',
        action: 'gerar_resposta_ia',
        choices: [],
      }),
    }
    MockFlowEngine.mockImplementation(function (this: any) {
      return mockFlowEngine
    })
    mockGetOrCreateLead.mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })
    mockGenerateContextualResponse.mockResolvedValue({
      success: true,
      data: 'Recomendo o plano Premium Individual sem coparticipação.',
    })

    const insertMessageMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateConversationMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })
    const updateLeadMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockWebhookConsultant, business_name: 'Consultor Premium', vertical: 'saude' },
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'leads') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockWhatsAppLead,
                  error: null,
                }),
              }),
            }),
          }),
          update: updateLeadMock,
        }
      }
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockActiveConversation,
                  error: null,
                }),
              }),
            }),
          }),
          update: updateConversationMock,
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockDefaultFlow,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: insertMessageMock }
      }
      return {}
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Não',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockGenerateContextualResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        lead: mockWhatsAppLead,
        consultantData: expect.objectContaining({
          name: mockWebhookConsultant.name,
        }),
      })
    )
    expect(data.response.text).toBe('Recomendo o plano Premium Individual sem coparticipação.')
  })

  it('deve retornar botões quando há opções de escolha', async () => {
    // Arrange
    const mockFlowEngine = {
      processMessage: vi.fn().mockResolvedValue({
        nextStepId: 'step-3',
        variables: { nome: 'João Silva' },
        response: 'Qual seu perfil?',
        choices: [
          { value: 'individual', label: 'Individual' },
          { value: 'casal', label: 'Casal' },
          { value: 'familia', label: 'Família' },
        ],
      }),
    }
    MockFlowEngine.mockImplementation(function (this: any) {
      return mockFlowEngine
    })
    mockGetOrCreateLead.mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })

    const insertMessageMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateConversationMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockWebhookConsultant,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockActiveConversation,
                  error: null,
                }),
              }),
            }),
          }),
          update: updateConversationMock,
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockDefaultFlow,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: insertMessageMock }
      }
      return {}
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Olá',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.response.buttons).toEqual([
      { id: 'individual', title: 'Individual' },
      { id: 'casal', title: 'Casal' },
      { id: 'familia', title: 'Família' },
    ])
  })

  it('deve retornar informações de debug', async () => {
    // Arrange
    const mockFlowEngine = {
      processMessage: vi.fn().mockResolvedValue({
        nextStepId: 'step-2',
        variables: { nome: 'João Silva' },
        response: 'Qual seu perfil?',
        choices: [],
      }),
    }
    MockFlowEngine.mockImplementation(function (this: any) {
      return mockFlowEngine
    })
    mockGetOrCreateLead.mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })

    const insertMessageMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateConversationMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockWebhookConsultant,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockActiveConversation,
                  error: null,
                }),
              }),
            }),
          }),
          update: updateConversationMock,
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockDefaultFlow,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: insertMessageMock }
      }
      return {}
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Olá',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.debug).toEqual({
      leadId: mockWhatsAppLead.id,
      conversationId: mockActiveConversation.id,
      currentStep: 'step-2',
      variables: { nome: 'João Silva' },
    })
  })

  it('deve retornar 500 em caso de erro', async () => {
    // Arrange
    mockSupabase.from = vi.fn().mockImplementation(() => {
      throw new Error('Database connection failed')
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Olá',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Erro ao processar mensagem')
    expect(data.details).toBe('Database connection failed')
  })

  it('deve retornar 500 se getOrCreateLead falhar', async () => {
    // Arrange
    mockGetOrCreateLead.mockResolvedValue({
      success: false,
      error: 'Erro ao criar lead',
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockWebhookConsultant,
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Olá',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Erro ao criar lead')
  })

  it('deve usar fallback quando IA falha', async () => {
    // Arrange
    const mockFlowEngine = {
      processMessage: vi.fn().mockResolvedValue({
        nextStepId: 'fim',
        variables: {
          perfil: 'individual',
          faixa_etaria: '31 a 45 anos',
          coparticipacao: 'não',
        },
        response: '',
        action: 'gerar_resposta_ia',
        choices: [],
      }),
    }
    MockFlowEngine.mockImplementation(function (this: any) {
      return mockFlowEngine
    })
    mockGetOrCreateLead.mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })
    mockGenerateContextualResponse.mockResolvedValue({
      success: false,
      error: 'AI service unavailable',
    })

    const insertMessageMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const updateConversationMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })
    const updateLeadMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockWebhookConsultant, business_name: 'Consultor Premium', vertical: 'saude' },
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'leads') {
        return {
          update: updateLeadMock,
        }
      }
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockActiveConversation,
                  error: null,
                }),
              }),
            }),
          }),
          update: updateConversationMock,
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockDefaultFlow,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: insertMessageMock }
      }
      return {}
    })

    const request = new NextRequest('http://localhost:3000/api/webhook/mock', {
      method: 'POST',
      body: JSON.stringify({
        from: '5511988888888',
        text: 'Não',
        timestamp: Date.now(),
      }),
    })

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.response.text).toBe('Desculpe, não consegui processar sua solicitação.')
  })
})
