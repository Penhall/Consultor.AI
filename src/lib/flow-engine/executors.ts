/**
 * Step Executors
 *
 * Executes different types of flow steps
 */

import type {
  FlowStep,
  MessageStep,
  ChoiceStep,
  ExecuteStep,
  StepResult,
  ConversationState,
} from './types'
import { replaceVariables, recordResponse, moveToStep, setVariables } from './state-manager'
import { generateContextualResponse, getFallbackResponse } from '@/lib/services/ai-service'
import { createClient } from '@/lib/supabase/server'

/**
 * Execute a message step
 *
 * Returns the message with variables replaced
 */
export function executeMessageStep(
  step: MessageStep,
  state: ConversationState
): StepResult {
  try {
    const message = replaceVariables(step.mensagem, state)

    return {
      success: true,
      type: 'message',
      message,
      nextStepId: step.proxima,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute message step: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Execute a choice step
 *
 * Returns the question and available options
 */
export function executeChoiceStep(
  step: ChoiceStep,
  state: ConversationState
): StepResult {
  try {
    const question = replaceVariables(step.pergunta, state)

    const options = step.opcoes.map((opcao) => ({
      text: replaceVariables(opcao.texto, state),
      value: opcao.valor,
    }))

    return {
      success: true,
      type: 'choice',
      question,
      options,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute choice step: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Execute an action step
 *
 * Triggers external actions like AI generation
 */
export async function executeActionStep(
  step: ExecuteStep,
  state: ConversationState,
  context: {
    conversationId: string
    leadId: string
  }
): Promise<StepResult> {
  try {
    let actionResult: unknown

    switch (step.acao) {
      case 'gerar_resposta_ia':
        actionResult = await executeAIGeneration(state, context, step.parametros)
        break

      case 'atualizar_lead':
        actionResult = await executeLeadUpdate(state, context, step.parametros)
        break

      case 'calcular_score':
        actionResult = executeScoreCalculation(state, step.parametros)
        break

      default:
        return {
          success: false,
          error: `Unknown action: ${step.acao}`,
        }
    }

    return {
      success: true,
      type: 'action_complete',
      actionResult,
      nextStepId: step.proxima,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute action step: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Generate AI response based on conversation context
 */
async function executeAIGeneration(
  state: ConversationState,
  context: { conversationId: string; leadId: string },
  parametros?: Record<string, unknown>
): Promise<{ message: string }> {
  try {
    const supabase = await createClient()

    // Load lead data
    const { data: lead, error: leadError } = await (supabase as any)
      .from('leads')
      .select('*')
      .eq('id', context.leadId)
      .single()

    if (leadError || !lead) {
      console.error('Failed to load lead for AI generation:', leadError)
      // Return fallback response
      return {
        message: getFallbackResponse('saude'),
      }
    }

    // Load consultant data
    const { data: consultant } = await (supabase as any)
      .from('consultants')
      .select('name, business_name, vertical')
      .eq('id', lead.consultant_id)
      .single()

    // Generate AI response
    const result = await generateContextualResponse({
      state,
      lead,
      consultantData: consultant || undefined,
      context: parametros,
    })

    if (!result.success) {
      console.error('AI generation failed:', result.error)
      // Return fallback response
      return {
        message: getFallbackResponse(consultant?.vertical || 'saude'),
      }
    }

    return {
      message: result.data,
    }
  } catch (error) {
    console.error('Error in executeAIGeneration:', error)
    return {
      message: getFallbackResponse('saude'),
    }
  }
}

/**
 * Update lead data based on conversation
 */
async function executeLeadUpdate(
  _state: ConversationState,
  _context: { leadId: string },
  _parametros?: Record<string, unknown>
): Promise<{ updated: boolean }> {
  // This will update the lead in the database
  // For now, return a placeholder
  return {
    updated: true,
  }
}

/**
 * Calculate lead score based on responses
 */
function executeScoreCalculation(
  state: ConversationState,
  parametros?: Record<string, unknown>
): { score: number } {
  // Simple scoring logic - can be customized
  const responses = state.responses
  let score = 0

  // Example: each completed response adds points
  score += Object.keys(responses).length * 10

  // Apply scoring rules from parameters
  if (parametros?.rules) {
    const rules = parametros.rules as Record<string, number>
    for (const [key, points] of Object.entries(rules)) {
      if (responses[key]) {
        score += points
      }
    }
  }

  // Cap score at 100
  score = Math.min(100, score)

  return { score }
}

/**
 * Process a user's choice selection
 *
 * Validates the choice and returns the next step
 */
export function processChoiceResponse(
  step: ChoiceStep,
  state: ConversationState,
  userChoice: string
): {
  success: boolean
  nextState?: ConversationState
  nextStepId?: string
  error?: string
} {
  // Find the selected option
  const selectedOption = step.opcoes.find((opt) => opt.valor === userChoice)

  if (!selectedOption) {
    return {
      success: false,
      error: `Invalid choice: ${userChoice}. Available options: ${step.opcoes.map((o) => o.valor).join(', ')}`,
    }
  }

  // Record the response and move to next step
  let nextState = recordResponse(state, step.id, {
    question: step.pergunta,
    choice: userChoice,
    choiceText: selectedOption.texto,
  })

  // Set the response as a variable for later use
  nextState = setVariables(nextState, {
    [step.id]: userChoice,
    [`${step.id}_text`]: selectedOption.texto,
  })

  nextState = moveToStep(nextState, selectedOption.proxima)

  return {
    success: true,
    nextState,
    nextStepId: selectedOption.proxima,
  }
}

/**
 * Process a text message response (for future use)
 *
 * Records the text and moves to next step
 */
export function processTextResponse(
  step: FlowStep,
  state: ConversationState,
  userText: string
): {
  success: boolean
  nextState?: ConversationState
  nextStepId?: string
  error?: string
} {
  if (step.tipo === 'escolha') {
    return {
      success: false,
      error: 'Use processChoiceResponse for choice steps',
    }
  }

  // Record the response
  let nextState = recordResponse(state, step.id, userText)

  // Set as variable
  nextState = setVariables(nextState, {
    [step.id]: userText,
  })

  // Get next step
  const nextStepId = step.tipo === 'mensagem' ? step.proxima : step.proxima

  if (!nextStepId) {
    return {
      success: false,
      error: 'No next step defined',
    }
  }

  nextState = moveToStep(nextState, nextStepId)

  return {
    success: true,
    nextState,
    nextStepId,
  }
}
