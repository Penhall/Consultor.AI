/**
 * Flow Engine
 *
 * Main orchestrator for conversation flow execution
 */

import type {
  FlowDefinition,
  FlowContext,
  ConversationState,
  StepResult,
} from './types'
import { createClient } from '@/lib/supabase/server'
import { parseFlowDefinition, getStepById } from './parser'
import { initializeState } from './state-manager'
import {
  executeMessageStep,
  executeChoiceStep,
  executeActionStep,
  processChoiceResponse,
} from './executors'
import { FlowEngine } from './engine'

type FlowEngineResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Start a new conversation flow
 */
export async function startConversation(
  leadId: string,
  flowId: string
): Promise<
  FlowEngineResult<{
    conversationId: string
    state: ConversationState
    firstStep: StepResult
  }>
> {
  try {
    const supabase = await createClient()

    // Load flow definition
    const { data: flow, error: flowError } = await (supabase as any)
      .from('flows')
      .select('definition')
      .eq('id', flowId)
      .single()

    if (flowError || !flow) {
      return {
        success: false,
        error: 'Flow not found',
      }
    }

    // Parse and validate flow
    const parseResult = parseFlowDefinition(flow.definition)
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error,
      }
    }

    const flowDef = parseResult.data

    // Initialize conversation state
    const state = initializeState(flowDef.inicio)

    // Create conversation record
    const { data: conversation, error: convError } = await (supabase as any)
      .from('conversations')
      .insert({
        lead_id: leadId,
        flow_id: flowId,
        status: 'active',
        current_step_id: flowDef.inicio,
        state,
      })
      .select()
      .single()

    if (convError || !conversation) {
      return {
        success: false,
        error: 'Failed to create conversation',
      }
    }

    // Execute first step
    const firstStepResult = await executeStep(
      flowDef,
      state,
      {
        conversationId: conversation.id,
        leadId,
        flowId,
        state,
      }
    )

    if (!firstStepResult.success) {
      return {
        success: false,
        error: firstStepResult.error,
      }
    }

    return {
      success: true,
      data: {
        conversationId: conversation.id,
        state,
        firstStep: firstStepResult,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to start conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Process a user message in an active conversation
 */
export async function processMessage(
  conversationId: string,
  userMessage: string
): Promise<FlowEngineResult<{
  state: ConversationState
  response: StepResult
  conversationComplete: boolean
}>> {
  try {
    const supabase = await createClient()

    // Load conversation
    const { data: conversation, error: convError } = await (supabase as any)
      .from('conversations')
      .select('*, flow:flows(*)')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return {
        success: false,
        error: 'Conversation not found',
      }
    }

    // Parse flow
    const parseResult = parseFlowDefinition(conversation.flow.definition)
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error,
      }
    }

    const flowDef = parseResult.data
    let state = conversation.state as ConversationState

    // Get current step
    const stepResult = getStepById(flowDef, state.currentStepId)
    if (!stepResult.success) {
      return {
        success: false,
        error: stepResult.error,
      }
    }

    const currentStep = stepResult.data

    // Process user input based on step type
    if (currentStep.tipo === 'escolha') {
      const processResult = processChoiceResponse(
        currentStep,
        state,
        userMessage
      )

      if (!processResult.success) {
        return {
          success: false,
          error: processResult.error || 'Failed to process choice',
        }
      }

      state = processResult.nextState!

      // Save updated state
      await (supabase as any)
        .from('conversations')
        .update({
          state,
          current_step_id: state.currentStepId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)

      // Execute next step
      const nextStepResult = await executeStep(
        flowDef,
        state,
        {
          conversationId,
          leadId: conversation.lead_id,
          flowId: conversation.flow_id,
          state,
        }
      )

      if (!nextStepResult.success) {
        return {
          success: false,
          error: nextStepResult.error,
        }
      }

      const conversationComplete =
        nextStepResult.type === 'message' && !nextStepResult.nextStepId

      return {
        success: true,
        data: {
          state,
          response: nextStepResult,
          conversationComplete,
        },
      }
    }

    // For other step types, just acknowledge the message
    return {
      success: true,
      data: {
        state,
        response: {
          success: true,
          type: 'message',
          message: 'Mensagem recebida',
          nextStepId: null,
        },
        conversationComplete: false,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Execute a specific step in the flow
 */
async function executeStep(
  flow: FlowDefinition,
  state: ConversationState,
  context: FlowContext
): Promise<StepResult> {
  const stepResult = getStepById(flow, state.currentStepId)
  if (!stepResult.success) {
    return {
      success: false,
      error: stepResult.error,
    }
  }

  const step = stepResult.data

  switch (step.tipo) {
    case 'mensagem':
      return executeMessageStep(step, state)

    case 'escolha':
      return executeChoiceStep(step, state)

    case 'executar':
      return executeActionStep(step, state, {
        conversationId: context.conversationId,
        leadId: context.leadId,
      })

    default:
      return {
        success: false,
        error: `Unknown step type: ${(step as any).tipo}`,
      }
  }
}

/**
 * Get conversation status
 */
export async function getConversationStatus(
  conversationId: string
): Promise<
  FlowEngineResult<{
    status: string
    currentStep: string
    messageCount: number
    completionPercentage: number
  }>
> {
  try {
    const supabase = await createClient()

    const { data: conversation, error } = await (supabase as any)
      .from('conversations')
      .select('status, current_step_id, message_count, completion_percentage')
      .eq('id', conversationId)
      .single()

    if (error || !conversation) {
      return {
        success: false,
        error: 'Conversation not found',
      }
    }

    return {
      success: true,
      data: {
        status: conversation.status,
        currentStep: conversation.current_step_id,
        messageCount: conversation.message_count || 0,
        completionPercentage: conversation.completion_percentage || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to get conversation status: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

// Export all utilities
export * from './types'
export * from './parser'
export * from './state-manager'
export * from './executors'
export { FlowEngine }
