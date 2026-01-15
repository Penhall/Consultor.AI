/**
 * Meta WhatsApp Webhook API Tests
 * GET /api/webhook/meta/[consultantId] - Webhook verification
 * POST /api/webhook/meta/[consultantId] - Message processing
 *
 * Tests webhook handling, message processing, and flow integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/webhook/meta/[consultantId]/route'
import { NextRequest } from 'next/server'
import * as supabaseServer from '@/lib/supabase/server'
import * as webhookValidation from '@/lib/whatsapp/webhook-validation'
import * as metaClient from '@/lib/whatsapp/meta-client'
import * as leadAutoCreate from '@/lib/services/lead-auto-create'
import * as flowEngine from '@/lib/flow-engine'
import { extractContactName } from '@/lib/services/lead-auto-create'
import {
  mockMetaTextMessagePayload,
  mockMetaInteractiveButtonPayload,
  mockMetaStatusUpdatePayload,
  mockMetaStatusErrorPayload,
  mockMetaImageMessagePayload,
  mockExtractedTextMessage,
  mockExtractedInteractiveMessage,
  mockMessageStatus,
  mockMessageStatusError,
  mockWhatsAppIntegration,
  mockWhatsAppLead,
  mockDefaultFlow,
  mockActiveConversation,
  mockWebhookConsultant,
  mockWhatsAppClientResponses,
} from '@tests/fixtures/webhooks'
import {
  mockConversationState,
  mockMessageStepResult,
  mockChoiceStepResult,
  mockStartConversationResult,
  mockProcessMessageResult,
} from '@tests/fixtures/conversations'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/whatsapp/webhook-validation')
vi.mock('@/lib/whatsapp/meta-client')
vi.mock('@/lib/services/lead-auto-create')
vi.mock('@/lib/flow-engine')

describe('GET /api/webhook/meta/[consultantId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set environment variable for verification token
    process.env.META_WEBHOOK_VERIFY_TOKEN = 'test-verify-token'
  })

  it('deve verificar webhook com token correto', async () => {
    // Arrange
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=challenge-string'
    )

    // Act
    const response = await GET(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })
    const text = await response.text()

    // Assert
    expect(response.status).toBe(200)
    expect(text).toBe('challenge-string')
  })

  it('deve rejeitar verificação com token incorreto', async () => {
    // Arrange
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=challenge-string'
    )

    // Act
    const response = await GET(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })
    const text = await response.text()

    // Assert
    expect(response.status).toBe(403)
    expect(text).toBe('Forbidden')
  })

  it('deve rejeitar verificação com modo incorreto', async () => {
    // Arrange
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010?hub.mode=unsubscribe&hub.verify_token=test-verify-token&hub.challenge=challenge-string'
    )

    // Act
    const response = await GET(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })
    const text = await response.text()

    // Assert
    expect(response.status).toBe(403)
    expect(text).toBe('Forbidden')
  })

  it('deve rejeitar verificação com parâmetros faltando', async () => {
    // Arrange
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010?hub.mode=subscribe'
    )

    // Act
    const response = await GET(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })
    const text = await response.text()

    // Assert
    expect(response.status).toBe(403)
    expect(text).toBe('Forbidden')
  })
})

describe('POST /api/webhook/meta/[consultantId]', () => {
  let mockSupabase: any
  let mockWhatsAppClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.META_APP_SECRET = 'test-app-secret'

    // Setup Supabase mock
    mockSupabase = {
      from: vi.fn(),
    }
    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)

    // Setup WhatsApp client mock
    mockWhatsAppClient = {
      sendTextMessage: vi.fn().mockResolvedValue(mockWhatsAppClientResponses.sendTextMessage),
      sendButtonMessage: vi.fn().mockResolvedValue(mockWhatsAppClientResponses.sendButtonMessage),
      sendListMessage: vi.fn().mockResolvedValue(mockWhatsAppClientResponses.sendListMessage),
      markAsRead: vi.fn().mockResolvedValue(mockWhatsAppClientResponses.markAsRead),
    }
    vi.mocked(metaClient.createMetaClientFromIntegration).mockResolvedValue(
      mockWhatsAppClient
    )
  })

  it('deve processar atualização de status (read)', async () => {
    // Arrange
    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(true)
    vi.mocked(webhookValidation.extractStatusFromWebhook).mockReturnValue(mockMessageStatus)

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'messages') {
        return { update: updateMock }
      }
      return {}
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/webhook/meta/123', {
      method: 'POST',
      headers: { 'x-hub-signature-256': 'sha256=abcdef' },
      body: JSON.stringify(mockMetaStatusUpdatePayload),
    })
    const response = await POST(request, { params: { consultantId: '123' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(updateMock).toHaveBeenCalledWith({
      status: 'read',
      metadata: { error: undefined },
    })
  })

  it('deve processar atualização de status com erro', async () => {
    // Arrange
    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(true)
    vi.mocked(webhookValidation.extractStatusFromWebhook).mockReturnValue(
      mockMessageStatusError
    )

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'messages') {
        return { update: updateMock }
      }
      return {}
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/webhook/meta/123', {
      method: 'POST',
      headers: { 'x-hub-signature-256': 'sha256=abcdef' },
      body: JSON.stringify(mockMetaStatusErrorPayload),
    })
    await POST(request, { params: { consultantId: '123' } })

    // Assert
    expect(updateMock).toHaveBeenCalledWith({
      status: 'failed',
      metadata: {
        error: {
          code: 131026,
          title: 'Message Undeliverable',
        },
      },
    })
  })

  it('deve rejeitar webhook com assinatura inválida', async () => {
    // Arrange
    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(false)

    // Act
    const request = new NextRequest('http://localhost:3000/api/webhook/meta/123', {
      method: 'POST',
      headers: { 'x-hub-signature-256': 'sha256=wrong' },
      body: JSON.stringify(mockMetaTextMessagePayload),
    })
    const response = await POST(request, { params: { consultantId: '123' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(403)
    expect(data.error).toBe('Invalid signature')
  })

  it('deve ignorar mensagens de tipo não suportado (imagem)', async () => {
    // Arrange
    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(false)
    vi.mocked(webhookValidation.extractMessageFromWebhook).mockReturnValue({
      messageId: 'wamid.img',
      from: '5511988888888',
      timestamp: '1234567895',
      type: 'image',
      imageUrl: 'media-id-123',
      caption: 'Minha foto',
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/webhook/meta/123', {
      method: 'POST',
      headers: { 'x-hub-signature-256': 'sha256=abcdef' },
      body: JSON.stringify(mockMetaImageMessagePayload),
    })
    const response = await POST(request, { params: { consultantId: '123' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('deve retornar 200 se integração não encontrada', async () => {
    // Arrange
    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(false)
    vi.mocked(webhookValidation.extractMessageFromWebhook).mockReturnValue(
      mockExtractedTextMessage
    )

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'whatsapp_integrations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }
      }
      return {}
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/webhook/meta/123', {
      method: 'POST',
      headers: { 'x-hub-signature-256': 'sha256=abcdef' },
      body: JSON.stringify(mockMetaTextMessagePayload),
    })
    const response = await POST(request, { params: { consultantId: '123' } })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('deve processar nova conversa com mensagem de texto', async () => {
    // Arrange
    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(false)
    vi.mocked(webhookValidation.extractMessageFromWebhook).mockReturnValue(
      mockExtractedTextMessage
    )
    vi.mocked(extractContactName).mockReturnValue('João Silva')
    vi.mocked(leadAutoCreate.getOrCreateLead).mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: true },
    })
    vi.mocked(leadAutoCreate.getOrCreateConversation).mockResolvedValue({
      success: true,
      data: { conversationId: '123e4567-e89b-12d3-a456-426614174060', isNew: true },
    })
    vi.mocked(flowEngine.startConversation).mockResolvedValue({
      success: true,
      data: mockStartConversationResult,
    })

    const insertMessageMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const insertWebhookEventMock = vi.fn().mockResolvedValue({ data: null, error: null })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'whatsapp_integrations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockWhatsAppIntegration,
                    error: null,
                  }),
                }),
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
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockDefaultFlow,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: insertMessageMock }
      }
      if (table === 'webhook_events') {
        return { insert: insertWebhookEventMock }
      }
      return {}
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010',
      {
        method: 'POST',
        headers: { 'x-hub-signature-256': 'sha256=abcdef' },
        body: JSON.stringify(mockMetaTextMessagePayload),
      }
    )
    const response = await POST(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(flowEngine.startConversation).toHaveBeenCalled()
    expect(mockWhatsAppClient.sendTextMessage).toHaveBeenCalled()
    expect(mockWhatsAppClient.markAsRead).toHaveBeenCalled()
    expect(insertMessageMock).toHaveBeenCalledTimes(2) // inbound + outbound
    expect(insertWebhookEventMock).toHaveBeenCalled()
  })

  it('deve processar conversa existente com mensagem interativa', async () => {
    // Arrange
    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(false)
    vi.mocked(webhookValidation.extractMessageFromWebhook).mockReturnValue(
      mockExtractedInteractiveMessage
    )
    vi.mocked(extractContactName).mockReturnValue('João Silva')
    vi.mocked(leadAutoCreate.getOrCreateLead).mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })
    vi.mocked(leadAutoCreate.getOrCreateConversation).mockResolvedValue({
      success: true,
      data: { conversationId: '123e4567-e89b-12d3-a456-426614174060', isNew: false },
    })
    vi.mocked(flowEngine.processMessage).mockResolvedValue({
      success: true,
      data: mockProcessMessageResult,
    })

    const insertMessageMock = vi.fn().mockResolvedValue({ data: null, error: null })
    const insertWebhookEventMock = vi.fn().mockResolvedValue({ data: null, error: null })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'whatsapp_integrations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockWhatsAppIntegration,
                    error: null,
                  }),
                }),
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
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockDefaultFlow,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: insertMessageMock }
      }
      if (table === 'webhook_events') {
        return { insert: insertWebhookEventMock }
      }
      return {}
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010',
      {
        method: 'POST',
        headers: { 'x-hub-signature-256': 'sha256=abcdef' },
        body: JSON.stringify(mockMetaInteractiveButtonPayload),
      }
    )
    const response = await POST(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(flowEngine.processMessage).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174060',
      'individual'
    )
    expect(mockWhatsAppClient.sendButtonMessage).toHaveBeenCalled()
  })

  it('deve enviar botões para até 3 opções', async () => {
    // Arrange
    const choiceWith2Options = {
      ...mockChoiceStepResult,
      options: [
        { text: 'Opção 1', value: 'opt-1' },
        { text: 'Opção 2', value: 'opt-2' },
      ],
    }

    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(false)
    vi.mocked(webhookValidation.extractMessageFromWebhook).mockReturnValue(
      mockExtractedTextMessage
    )
    vi.mocked(extractContactName).mockReturnValue('João Silva')
    vi.mocked(leadAutoCreate.getOrCreateLead).mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })
    vi.mocked(leadAutoCreate.getOrCreateConversation).mockResolvedValue({
      success: true,
      data: { conversationId: '123e4567-e89b-12d3-a456-426614174060', isNew: false },
    })
    vi.mocked(flowEngine.processMessage).mockResolvedValue({
      success: true,
      data: {
        state: mockConversationState,
        response: choiceWith2Options,
        conversationComplete: false,
      },
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'whatsapp_integrations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockWhatsAppIntegration,
                    error: null,
                  }),
                }),
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
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockDefaultFlow,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }
      if (table === 'webhook_events') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }
      return {}
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010',
      {
        method: 'POST',
        headers: { 'x-hub-signature-256': 'sha256=abcdef' },
        body: JSON.stringify(mockMetaTextMessagePayload),
      }
    )
    await POST(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })

    // Assert
    expect(mockWhatsAppClient.sendButtonMessage).toHaveBeenCalledWith(
      '5511988888888',
      choiceWith2Options.question,
      expect.arrayContaining([
        { id: 'opt-1', title: 'Opção 1' },
        { id: 'opt-2', title: 'Opção 2' },
      ])
    )
  })

  it('deve enviar lista para mais de 3 opções', async () => {
    // Arrange
    const choiceWith5Options = {
      ...mockChoiceStepResult,
      options: [
        { text: 'Opção 1', value: 'opt-1' },
        { text: 'Opção 2', value: 'opt-2' },
        { text: 'Opção 3', value: 'opt-3' },
        { text: 'Opção 4', value: 'opt-4' },
        { text: 'Opção 5', value: 'opt-5' },
      ],
    }

    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(false)
    vi.mocked(webhookValidation.extractMessageFromWebhook).mockReturnValue(
      mockExtractedTextMessage
    )
    vi.mocked(extractContactName).mockReturnValue('João Silva')
    vi.mocked(leadAutoCreate.getOrCreateLead).mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })
    vi.mocked(leadAutoCreate.getOrCreateConversation).mockResolvedValue({
      success: true,
      data: { conversationId: '123e4567-e89b-12d3-a456-426614174060', isNew: false },
    })
    vi.mocked(flowEngine.processMessage).mockResolvedValue({
      success: true,
      data: {
        state: mockConversationState,
        response: choiceWith5Options,
        conversationComplete: false,
      },
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'whatsapp_integrations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockWhatsAppIntegration,
                    error: null,
                  }),
                }),
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
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockDefaultFlow,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'messages') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }
      if (table === 'webhook_events') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }
      return {}
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010',
      {
        method: 'POST',
        headers: { 'x-hub-signature-256': 'sha256=abcdef' },
        body: JSON.stringify(mockMetaTextMessagePayload),
      }
    )
    await POST(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })

    // Assert
    expect(mockWhatsAppClient.sendListMessage).toHaveBeenCalledWith(
      '5511988888888',
      choiceWith5Options.question,
      'Escolher opção',
      [
        {
          title: 'Opções',
          rows: expect.arrayContaining([
            { id: 'opt-1', title: 'Opção 1' },
            { id: 'opt-2', title: 'Opção 2' },
            { id: 'opt-3', title: 'Opção 3' },
            { id: 'opt-4', title: 'Opção 4' },
            { id: 'opt-5', title: 'Opção 5' },
          ]),
        },
      ]
    )
  })

  it('deve marcar conversa como completa quando flow terminar', async () => {
    // Arrange
    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(false)
    vi.mocked(webhookValidation.extractMessageFromWebhook).mockReturnValue(
      mockExtractedTextMessage
    )
    vi.mocked(extractContactName).mockReturnValue('João Silva')
    vi.mocked(leadAutoCreate.getOrCreateLead).mockResolvedValue({
      success: true,
      data: { lead: mockWhatsAppLead, isNew: false },
    })
    vi.mocked(leadAutoCreate.getOrCreateConversation).mockResolvedValue({
      success: true,
      data: { conversationId: '123e4567-e89b-12d3-a456-426614174060', isNew: false },
    })
    vi.mocked(flowEngine.processMessage).mockResolvedValue({
      success: true,
      data: {
        state: mockConversationState,
        response: mockMessageStepResult,
        conversationComplete: true,
      },
    })

    const updateConversationMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'whatsapp_integrations') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockWhatsAppIntegration,
                    error: null,
                  }),
                }),
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
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockDefaultFlow,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'conversations') {
        return { update: updateConversationMock }
      }
      if (table === 'messages') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }
      if (table === 'webhook_events') {
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }
      return {}
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010',
      {
        method: 'POST',
        headers: { 'x-hub-signature-256': 'sha256=abcdef' },
        body: JSON.stringify(mockMetaTextMessagePayload),
      }
    )
    await POST(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })

    // Assert
    expect(updateConversationMock).toHaveBeenCalledWith({ status: 'completed' })
  })

  it('deve retornar 200 e logar evento em caso de erro', async () => {
    // Arrange
    vi.mocked(webhookValidation.validateMetaSignature).mockReturnValue(true)
    vi.mocked(webhookValidation.isStatusUpdate).mockReturnValue(false)
    vi.mocked(webhookValidation.extractMessageFromWebhook).mockImplementation(() => {
      throw new Error('Extraction error')
    })

    const insertWebhookEventMock = vi.fn().mockResolvedValue({ data: null, error: null })

    mockSupabase.from = vi.fn((table: string) => {
      if (table === 'webhook_events') {
        return { insert: insertWebhookEventMock }
      }
      return {}
    })

    // Act
    const request = new NextRequest(
      'http://localhost:3000/api/webhook/meta/123e4567-e89b-12d3-a456-426614174010',
      {
        method: 'POST',
        headers: { 'x-hub-signature-256': 'sha256=abcdef' },
        body: JSON.stringify(mockMetaTextMessagePayload),
      }
    )
    const response = await POST(request, {
      params: { consultantId: '123e4567-e89b-12d3-a456-426614174010' },
    })
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200) // Always 200 to prevent Meta retries
    expect(data.success).toBe(false)
    expect(insertWebhookEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        consultant_id: '123e4567-e89b-12d3-a456-426614174010',
        provider: 'meta',
        processed: false,
        error: 'Extraction error',
      })
    )
  })
})
