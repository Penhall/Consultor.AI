/**
 * Webhook Test Fixtures
 *
 * Mock data for Meta WhatsApp webhook testing
 */

import type { ExtractedMessage, MessageStatus } from '@/lib/whatsapp/webhook-validation';

/**
 * Mock Meta webhook payload - text message
 */
export const mockMetaTextMessagePayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5511999999999',
              phone_number_id: '123456789',
            },
            contacts: [
              {
                profile: {
                  name: 'João Silva',
                },
                wa_id: '5511988888888',
              },
            ],
            messages: [
              {
                from: '5511988888888',
                id: 'wamid.123',
                timestamp: '1234567890',
                type: 'text',
                text: {
                  body: 'Olá, quero informações sobre planos',
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

/**
 * Mock Meta webhook payload - interactive button reply
 */
export const mockMetaInteractiveButtonPayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5511999999999',
              phone_number_id: '123456789',
            },
            contacts: [
              {
                profile: {
                  name: 'João Silva',
                },
                wa_id: '5511988888888',
              },
            ],
            messages: [
              {
                from: '5511988888888',
                id: 'wamid.456',
                timestamp: '1234567891',
                type: 'interactive',
                interactive: {
                  type: 'button_reply',
                  button_reply: {
                    id: 'individual',
                    title: 'Individual',
                  },
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

/**
 * Mock Meta webhook payload - interactive list reply
 */
export const mockMetaInteractiveListPayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5511999999999',
              phone_number_id: '123456789',
            },
            contacts: [
              {
                profile: {
                  name: 'João Silva',
                },
                wa_id: '5511988888888',
              },
            ],
            messages: [
              {
                from: '5511988888888',
                id: 'wamid.789',
                timestamp: '1234567892',
                type: 'interactive',
                interactive: {
                  type: 'list_reply',
                  list_reply: {
                    id: 'casal',
                    title: 'Casal',
                    description: 'Plano para casal',
                  },
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

/**
 * Mock Meta webhook payload - status update
 */
export const mockMetaStatusUpdatePayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5511999999999',
              phone_number_id: '123456789',
            },
            statuses: [
              {
                id: 'wamid.999',
                status: 'read',
                timestamp: '1234567893',
                recipient_id: '5511988888888',
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

/**
 * Mock Meta webhook payload - status update with error
 */
export const mockMetaStatusErrorPayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5511999999999',
              phone_number_id: '123456789',
            },
            statuses: [
              {
                id: 'wamid.error',
                status: 'failed',
                timestamp: '1234567894',
                recipient_id: '5511988888888',
                errors: [
                  {
                    code: 131026,
                    title: 'Message Undeliverable',
                  },
                ],
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

/**
 * Mock Meta webhook payload - unsupported message type (image)
 */
export const mockMetaImageMessagePayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5511999999999',
              phone_number_id: '123456789',
            },
            contacts: [
              {
                profile: {
                  name: 'João Silva',
                },
                wa_id: '5511988888888',
              },
            ],
            messages: [
              {
                from: '5511988888888',
                id: 'wamid.img',
                timestamp: '1234567895',
                type: 'image',
                image: {
                  id: 'media-id-123',
                  caption: 'Minha foto',
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
    },
  ],
};

/**
 * Mock extracted message - text
 */
export const mockExtractedTextMessage: ExtractedMessage = {
  messageId: 'wamid.123',
  from: '5511988888888',
  timestamp: '1234567890',
  type: 'text',
  text: 'Olá, quero informações sobre planos',
};

/**
 * Mock extracted message - interactive button
 */
export const mockExtractedInteractiveMessage: ExtractedMessage = {
  messageId: 'wamid.456',
  from: '5511988888888',
  timestamp: '1234567891',
  type: 'interactive',
  text: 'individual',
  interactive: {
    type: 'button_reply',
    buttonReply: {
      id: 'individual',
      title: 'Individual',
    },
  },
};

/**
 * Mock message status - read
 */
export const mockMessageStatus: MessageStatus = {
  messageId: 'wamid.999',
  status: 'read',
  timestamp: '1234567893',
  recipientId: '5511988888888',
};

/**
 * Mock message status - failed
 */
export const mockMessageStatusError: MessageStatus = {
  messageId: 'wamid.error',
  status: 'failed',
  timestamp: '1234567894',
  recipientId: '5511988888888',
  error: {
    code: 131026,
    title: 'Message Undeliverable',
  },
};

/**
 * Mock WhatsApp integration (Meta)
 */
export const mockWhatsAppIntegration = {
  id: '123e4567-e89b-12d3-a456-426614174030',
  consultant_id: '123e4567-e89b-12d3-a456-426614174010',
  provider: 'meta',
  phone_number_id: '123456789',
  whatsapp_business_account_id: 'waba-123',
  access_token: 'encrypted_token_abc123',
  webhook_url: 'https://api.example.com/webhook/meta/123e4567-e89b-12d3-a456-426614174010',
  status: 'active',
  created_at: '2026-01-14T10:00:00Z',
  updated_at: '2026-01-14T10:00:00Z',
};

/**
 * Mock lead (auto-created from WhatsApp)
 */
export const mockWhatsAppLead = {
  id: '123e4567-e89b-12d3-a456-426614174040',
  consultant_id: '123e4567-e89b-12d3-a456-426614174010',
  name: 'João Silva',
  whatsapp_number: '+5511988888888',
  email: null,
  status: 'novo' as const,
  source: 'whatsapp',
  score: 0,
  qualified_at: null,
  last_contacted_at: null,
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  metadata: {},
  created_at: '2026-01-14T10:00:00Z',
  updated_at: '2026-01-14T10:00:00Z',
};

/**
 * Mock default flow
 */
export const mockDefaultFlow = {
  id: '123e4567-e89b-12d3-a456-426614174050',
  consultant_id: '123e4567-e89b-12d3-a456-426614174010',
  name: 'Fluxo Padrão de Saúde',
  vertical: 'saude',
  is_active: true,
  definition: {
    nome: 'Fluxo Básico',
    inicio: 'step-1',
    passos: [],
  },
  created_at: '2026-01-14T10:00:00Z',
  updated_at: '2026-01-14T10:00:00Z',
};

/**
 * Mock active conversation
 */
export const mockActiveConversation = {
  id: '123e4567-e89b-12d3-a456-426614174060',
  lead_id: '123e4567-e89b-12d3-a456-426614174040',
  flow_id: '123e4567-e89b-12d3-a456-426614174050',
  status: 'active',
  current_step_id: 'step-2',
  state: {
    currentStepId: 'step-2',
    variables: { nome: 'João Silva' },
    stepHistory: ['step-1', 'step-2'],
    completedAt: null,
  },
  created_at: '2026-01-14T10:00:00Z',
  updated_at: '2026-01-14T10:05:00Z',
  completed_at: null,
};

/**
 * Mock consultant
 */
export const mockWebhookConsultant = {
  id: '123e4567-e89b-12d3-a456-426614174010',
  user_id: 'test-user-id',
  name: 'Consultor Webhook',
  email: 'webhook@test.com',
  whatsapp_number: '+5511999999999',
  created_at: '2026-01-14T09:00:00Z',
};

/**
 * Mock webhook event log
 */
export const mockWebhookEvent = {
  id: '123e4567-e89b-12d3-a456-426614174070',
  consultant_id: '123e4567-e89b-12d3-a456-426614174010',
  provider: 'meta',
  event_type: 'message.received',
  payload: mockMetaTextMessagePayload,
  processed: true,
  error: null,
  created_at: '2026-01-14T10:00:00Z',
};

/**
 * Mock Meta WhatsApp client responses
 */
export const mockWhatsAppClientResponses = {
  sendTextMessage: {
    messageId: 'wamid.sent.text.123',
    success: true,
  },
  sendButtonMessage: {
    messageId: 'wamid.sent.button.456',
    success: true,
  },
  sendListMessage: {
    messageId: 'wamid.sent.list.789',
    success: true,
  },
  markAsRead: {
    success: true,
  },
};
