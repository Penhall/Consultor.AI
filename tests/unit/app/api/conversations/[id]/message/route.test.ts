/**
 * Conversation Message API Tests
 * POST /api/conversations/[id]/message
 *
 * Tests message processing in active conversations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/conversations/[id]/message/route'
import { NextRequest } from 'next/server'
import * as supabaseServer from '@/lib/supabase/server'
import * as flowEngine from '@/lib/flow-engine'
import {
  mockConsultant,
  mockConversationWithLead,
  mockProcessMessageResult,
  mockProcessMessageCompletedResult,
  mockChoiceStepResult,
  mockCompletedStepResult,
} from '@tests/fixtures/conversations'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/flow-engine')

describe('POST /api/conversations/[id]/message', () => {
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

  it('deve processar mensagem do usuário', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    const insertMessageMock = vi.fn().mockResolvedValue({
      data: null,
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
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConversationWithLead,
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

    // Arrange: Flow engine processes message
    vi.mocked(flowEngine.processMessage).mockResolvedValue({
      success: true,
      data: mockProcessMessageResult,
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-test-1/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Individual',
        }),
      }
    )
    const response = await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.response.type).toBe('choice')
    expect(flowEngine.processMessage).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', 'Individual')
  })

  it('deve salvar mensagem do usuário', async () => {
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
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConversationWithLead,
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

    vi.mocked(flowEngine.processMessage).mockResolvedValue({
      success: true,
      data: mockProcessMessageResult,
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-test-1/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Minha resposta',
        }),
      }
    )
    await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })

    // Assert: Verify user message was saved
    expect(insertMessageMock).toHaveBeenNthCalledWith(1, {
      conversation_id: '123e4567-e89b-12d3-a456-426614174000',
      direction: 'inbound',
      content: 'Minha resposta',
      status: 'delivered',
    })
  })

  it('deve salvar resposta do bot se for mensagem', async () => {
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
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConversationWithLead,
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

    // Mock a message-type response (not choice)
    vi.mocked(flowEngine.processMessage).mockResolvedValue({
      success: true,
      data: {
        state: mockProcessMessageResult.state,
        response: {
          success: true,
          type: 'message',
          message: 'Obrigado pela sua resposta!',
          nextStepId: 'step-3',
        },
        conversationComplete: false,
      },
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/123e4567-e89b-12d3-a456-426614174000/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Resposta',
        }),
      }
    )
    await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })

    // Assert: Verify bot response was saved
    expect(insertMessageMock).toHaveBeenNthCalledWith(2, {
      conversation_id: '123e4567-e89b-12d3-a456-426614174000',
      direction: 'outbound',
      content: 'Obrigado pela sua resposta!',
      status: 'sent',
    })
  })

  it('deve marcar conversa como completa quando flow terminar', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    const updateConversationMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
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
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConversationWithLead,
                error: null,
              }),
            }),
          }),
          update: updateConversationMock,
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

    // Arrange: Conversation completes
    vi.mocked(flowEngine.processMessage).mockResolvedValue({
      success: true,
      data: mockProcessMessageCompletedResult,
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-test-1/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Sim',
        }),
      }
    )
    await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })

    // Assert
    expect(updateConversationMock).toHaveBeenCalledWith({
      status: 'completed',
      completed_at: expect.any(String),
    })
  })

  it('deve retornar 401 se não autenticado', async () => {
    // Arrange: No session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-test-1/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
        }),
      }
    )
    const response = await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })
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
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-test-1/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
        }),
      }
    )
    const response = await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Perfil de consultor não encontrado')
  })

  it('deve retornar 404 se conversa não encontrada', async () => {
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
      if (table === 'conversations') {
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
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-nonexistent/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
        }),
      }
    )
    const response = await POST(request, { params: { id: 'conv-nonexistent' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Conversa não encontrada')
  })

  it('deve retornar 403 se conversa não pertence ao consultant', async () => {
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
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  ...mockConversationWithLead,
                  lead: {
                    ...mockConversationWithLead.lead,
                    consultant_id: 'other-consultant-id',
                  },
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
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-test-1/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
        }),
      }
    )
    const response = await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Acesso negado')
  })

  it('deve retornar 400 se mensagem vazia', async () => {
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
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConversationWithLead,
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-test-1/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: '',
        }),
      }
    )
    const response = await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Dados inválidos')
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
      if (table === 'conversations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockConversationWithLead,
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    })

    vi.mocked(flowEngine.processMessage).mockResolvedValue({
      success: false,
      error: 'Failed to process message',
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-test-1/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
        }),
      }
    )
    const response = await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Failed to process message')
  })

  it('deve retornar 500 se ocorrer erro inesperado', async () => {
    // Arrange
    mockSupabase.auth.getSession.mockRejectedValue(
      new Error('Connection timeout')
    )

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/conversations/conv-test-1/message',
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
        }),
      }
    )
    const response = await POST(request, { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Erro interno do servidor')
  })
})
