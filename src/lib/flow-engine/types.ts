/**
 * Flow Engine Types
 *
 * Type definitions for conversation flow system
 */

import { z } from 'zod'

/**
 * Step types
 */
export type StepType = 'mensagem' | 'escolha' | 'executar'

/**
 * Base step interface
 */
export interface BaseStep {
  id: string
  tipo: StepType
  proxima?: string | null
}

/**
 * Message step - Bot sends a message
 */
export interface MessageStep extends BaseStep {
  tipo: 'mensagem'
  mensagem: string
  proxima: string | null
}

/**
 * Choice step - User selects from options
 */
export interface ChoiceStep extends BaseStep {
  tipo: 'escolha'
  pergunta: string
  opcoes: {
    texto: string
    valor: string
    proxima: string
  }[]
}

/**
 * Execute step - Trigger an action
 */
export interface ExecuteStep extends BaseStep {
  tipo: 'executar'
  acao: string
  parametros?: Record<string, unknown>
  proxima: string | null
}

/**
 * Union type for all steps
 */
export type FlowStep = MessageStep | ChoiceStep | ExecuteStep

/**
 * Flow definition
 */
export interface FlowDefinition {
  versao: string
  inicio: string
  passos: FlowStep[]
}

/**
 * Conversation state
 */
export interface ConversationState {
  currentStepId: string
  variables: Record<string, unknown>
  responses: Record<string, unknown>
  history: {
    stepId: string
    timestamp: string
    response?: unknown
  }[]
}

/**
 * Flow execution context
 */
export interface FlowContext {
  conversationId: string
  leadId: string
  flowId: string
  state: ConversationState
}

/**
 * Step execution result
 */
export type StepResult =
  | {
      success: true
      type: 'message'
      message: string
      nextStepId: string | null
    }
  | {
      success: true
      type: 'choice'
      question: string
      options: { text: string; value: string }[]
    }
  | {
      success: true
      type: 'action_complete'
      actionResult: unknown
      nextStepId: string | null
    }
  | {
      success: false
      error: string
    }

/**
 * Zod schemas for validation
 */

// Base step schema
const baseStepSchema = z.object({
  id: z.string().min(1, 'Step ID is required'),
  tipo: z.enum(['mensagem', 'escolha', 'executar']),
})

// Message step schema
export const messageStepSchema = baseStepSchema.extend({
  tipo: z.literal('mensagem'),
  mensagem: z.string().min(1, 'Message content is required'),
  proxima: z.string().nullable(),
})

// Choice step schema
export const choiceStepSchema = baseStepSchema.extend({
  tipo: z.literal('escolha'),
  pergunta: z.string().min(1, 'Question is required'),
  opcoes: z
    .array(
      z.object({
        texto: z.string().min(1, 'Option text is required'),
        valor: z.string().min(1, 'Option value is required'),
        proxima: z.string().min(1, 'Next step is required'),
      })
    )
    .min(1, 'At least one option is required'),
})

// Execute step schema
export const executeStepSchema = baseStepSchema.extend({
  tipo: z.literal('executar'),
  acao: z.string().min(1, 'Action is required'),
  parametros: z.record(z.unknown()).optional(),
  proxima: z.string().nullable(),
})

// Flow step union schema
export const flowStepSchema = z.discriminatedUnion('tipo', [
  messageStepSchema,
  choiceStepSchema,
  executeStepSchema,
])

// Flow definition schema
export const flowDefinitionSchema = z.object({
  versao: z.string().min(1, 'Version is required'),
  inicio: z.string().min(1, 'Start step ID is required'),
  passos: z.array(flowStepSchema).min(1, 'At least one step is required'),
})

// Conversation state schema
export const conversationStateSchema = z.object({
  currentStepId: z.string(),
  variables: z.record(z.unknown()),
  responses: z.record(z.unknown()),
  history: z.array(
    z.object({
      stepId: z.string(),
      timestamp: z.string(),
      response: z.unknown().optional(),
    })
  ),
})
