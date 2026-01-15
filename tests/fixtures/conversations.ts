/**
 * Conversation Test Fixtures
 *
 * Mock data for conversation and flow engine testing
 */

import type { ConversationState, StepResult } from '@/lib/flow-engine/types'

/**
 * Mock conversation state
 */
export const mockConversationState: ConversationState = {
  currentStepId: 'step-1',
  variables: {
    nome: 'João Silva',
    perfil: 'individual',
  },
  stepHistory: ['inicio', 'step-1'],
  completedAt: null,
}

/**
 * Mock step result - message type
 */
export const mockMessageStepResult: StepResult = {
  success: true,
  type: 'message',
  message: 'Olá! Bem-vindo ao nosso atendimento.',
  nextStepId: 'step-2',
}

/**
 * Mock step result - choice type
 */
export const mockChoiceStepResult: StepResult = {
  success: true,
  type: 'choice',
  question: 'Qual tipo de plano você procura?',
  options: [
    { text: 'Individual', value: 'individual' },
    { text: 'Familiar', value: 'familiar' },
  ],
}

/**
 * Mock step result - completed
 */
export const mockCompletedStepResult: StepResult = {
  success: true,
  type: 'message',
  message: 'Obrigado! Entraremos em contato em breve.',
  nextStepId: null, // No next step = completed
}

/**
 * Mock conversation (database record)
 */
export const mockConversation = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  lead_id: '123e4567-e89b-12d3-a456-426614174001',
  flow_id: '123e4567-e89b-12d3-a456-426614174002',
  status: 'active',
  current_step_id: 'step-1',
  state: mockConversationState,
  created_at: '2026-01-14T10:00:00Z',
  updated_at: '2026-01-14T10:05:00Z',
  completed_at: null,
}

/**
 * Mock conversation with lead data
 */
export const mockConversationWithLead = {
  ...mockConversation,
  lead: {
    id: '123e4567-e89b-12d3-a456-426614174001',
    consultant_id: '123e4567-e89b-12d3-a456-426614174010',
    name: 'João Silva',
    whatsapp_number: '+5511999999999',
  },
}

/**
 * Mock conversation with flow
 */
export const mockConversationWithFlow = {
  ...mockConversation,
  flow: {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Fluxo de Saúde',
    consultant_id: '123e4567-e89b-12d3-a456-426614174010',
    definition: {
      nome: 'Fluxo Básico',
      inicio: 'step-1',
      passos: [
        {
          id: 'step-1',
          tipo: 'mensagem',
          mensagem: 'Olá!',
          proxima: 'step-2',
        },
        {
          id: 'step-2',
          tipo: 'escolha',
          mensagem: 'Escolha uma opção',
          opcoes: [
            { id: 'opt-1', texto: 'Opção 1', proxima: 'step-3' },
          ],
        },
      ],
    },
  },
}

/**
 * Mock lead
 */
export const mockLead = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  consultant_id: '123e4567-e89b-12d3-a456-426614174010',
  name: 'João Silva',
  whatsapp_number: '+5511999999999',
  status: 'novo',
  score: 0,
  created_at: '2026-01-14T09:00:00Z',
}

/**
 * Mock flow (public)
 */
export const mockPublicFlow = {
  id: '123e4567-e89b-12d3-a456-426614174003',
  name: 'Fluxo Padrão de Saúde',
  consultant_id: null, // Public flow
  definition: {
    nome: 'Fluxo Padrão',
    inicio: 'inicio',
    passos: [],
  },
}

/**
 * Mock flow (private - owned by consultant)
 */
export const mockPrivateFlow = {
  id: '123e4567-e89b-12d3-a456-426614174002',
  name: 'Meu Fluxo Personalizado',
  consultant_id: '123e4567-e89b-12d3-a456-426614174010',
  definition: {
    nome: 'Fluxo Personalizado',
    inicio: 'inicio',
    passos: [],
  },
}

/**
 * Mock startConversation result
 */
export const mockStartConversationResult = {
  conversationId: '123e4567-e89b-12d3-a456-426614174020',
  state: mockConversationState,
  firstStep: mockMessageStepResult,
}

/**
 * Mock processMessage result
 */
export const mockProcessMessageResult = {
  state: {
    ...mockConversationState,
    currentStepId: 'step-2',
    variables: {
      ...mockConversationState.variables,
      resposta: 'Individual',
    },
  },
  response: mockChoiceStepResult,
  conversationComplete: false,
}

/**
 * Mock processMessage result - completed
 */
export const mockProcessMessageCompletedResult = {
  state: {
    ...mockConversationState,
    currentStepId: 'fim',
  },
  response: mockCompletedStepResult,
  conversationComplete: true,
}

/**
 * Mock consultant
 */
export const mockConsultant = {
  id: '123e4567-e89b-12d3-a456-426614174010',
  user_id: 'test-user-id',
  name: 'Consultor Teste',
  email: 'consultor@test.com',
}
