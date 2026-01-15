/**
 * Start Conversation API Tests
 * POST /api/conversations/start
 *
 * Tests conversation initialization with authentication, ownership validation, and flow engine
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/conversations/start/route'
import { NextRequest } from 'next/server'
import * as supabaseServer from '@/lib/supabase/server'
import * as flowEngine from '@/lib/flow-engine'
import {
  mockConsultant,
  mockLead,
  mockPrivateFlow,
  mockPublicFlow,
  mockStartConversationResult,
  mockMessageStepResult,
} from '@tests/fixtures/conversations'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/flow-engine')

describe('POST /api/conversations/start', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default Supabase mock
    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
      from: vi.fn(),
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
  })

  it('deve iniciar conversa com dados válidos', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    // Arrange: Consultant exists
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConsultant,
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
              single: vi.fn().mockResolvedValue({
                data: mockLead,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPrivateFlow,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return {
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }
      }
      return {}
    })

    // Arrange: Flow engine starts conversation
    vi.mocked(flowEngine.startConversation).mockResolvedValue({
      success: true,
      data: mockStartConversationResult,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.conversationId).toBe('123e4567-e89b-12d3-a456-426614174020')
    expect(data.data.firstStep.type).toBe('message')
    expect(flowEngine.startConversation).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002')
  })

  it('deve aceitar fluxo público (consultant_id null)', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    // Arrange: Setup mocks
    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConsultant,
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
              single: vi.fn().mockResolvedValue({
                data: mockLead,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPublicFlow, // Public flow (consultant_id = null)
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return {
          insert: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }
      }
      return {}
    })

    vi.mocked(flowEngine.startConversation).mockResolvedValue({
      success: true,
      data: mockStartConversationResult,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '123e4567-e89b-12d3-a456-426614174003',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
  })

  it('deve salvar mensagem inicial se firstStep for do tipo message', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    const insertMessageMock = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConsultant,
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
              single: vi.fn().mockResolvedValue({
                data: mockLead,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPrivateFlow,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return {
          insert: insertMessageMock,
        }
      }
      return {}
    })

    vi.mocked(flowEngine.startConversation).mockResolvedValue({
      success: true,
      data: mockStartConversationResult,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    await POST(request)

    // Assert
    expect(insertMessageMock).toHaveBeenCalledWith({
      conversation_id: '123e4567-e89b-12d3-a456-426614174020',
      direction: 'outbound',
      content: 'Olá! Bem-vindo ao nosso atendimento.',
      status: 'sent',
    })
  })

  it('deve retornar 401 se não autenticado', async () => {
    // Arrange: No session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Não autenticado')
  })

  it('deve retornar 404 se consultant não encontrado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Perfil de consultor não encontrado')
  })

  it('deve retornar 400 se leadId inválido', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockConsultant,
            error: null,
          }),
        }),
      }),
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: 'invalid-uuid',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Dados inválidos')
    expect(data.details).toBeDefined()
  })

  it('deve retornar 404 se lead não encontrado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConsultant,
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
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }
      }
      return {}
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '00000000-0000-0000-0000-000000000001',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Lead não encontrado')
  })

  it('deve retornar 403 se lead não pertence ao consultant', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConsultant,
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
              single: vi.fn().mockResolvedValue({
                data: {
                  ...mockLead,
                  consultant_id: 'other-consultant-id',
                },
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Acesso negado')
  })

  it('deve retornar 404 se fluxo não encontrado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConsultant,
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
              single: vi.fn().mockResolvedValue({
                data: mockLead,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }
      }
      return {}
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '00000000-0000-0000-0000-000000000002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Fluxo não encontrado')
  })

  it('deve retornar 403 se fluxo privado não pertence ao consultant', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConsultant,
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
              single: vi.fn().mockResolvedValue({
                data: mockLead,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  ...mockPrivateFlow,
                  consultant_id: 'other-consultant-id',
                },
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Acesso negado ao fluxo')
  })

  it('deve retornar 500 se flow engine falhar', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConsultant,
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
              single: vi.fn().mockResolvedValue({
                data: mockLead,
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'flows') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPrivateFlow,
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    })

    vi.mocked(flowEngine.startConversation).mockResolvedValue({
      success: false,
      error: 'Failed to parse flow definition',
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to parse flow definition')
  })

  it('deve retornar 500 se ocorrer erro inesperado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockRejectedValue(
      new Error('Database connection lost')
    )

    // Act
    const request = new NextRequest('http://localhost:3000/api/conversations/start', {
      method: 'POST',
      body: JSON.stringify({
        leadId: '123e4567-e89b-12d3-a456-426614174001',
        flowId: '123e4567-e89b-12d3-a456-426614174002',
      }),
    })
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Erro interno do servidor')
  })
})
