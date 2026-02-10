import { parseFlowDefinition, getStepById } from './parser'
import {
  recordResponse,
  setVariables,
  moveToStep,
  replaceVariables,
} from './state-manager'
import type {
  FlowDefinition,
  FlowStep,
  ConversationState,
  ChoiceStep,
} from './types'

export interface FlowEngineResult {
  response: string
  nextStepId: string | null
  variables: Record<string, unknown>
  choices?: Array<{ label: string; value: string }>
  action?: string
}

/**
 * Lightweight in-memory Flow Engine orchestrator.
 * Used for webhook processing without re-fetching the schema.
 */
export class FlowEngine {
  private flow: FlowDefinition

  constructor(definition: unknown) {
    const parsed = parseFlowDefinition(definition)
    if (!parsed.success) {
      throw new Error(parsed.error)
    }
    this.flow = parsed.data
  }

  /**
   * Process a user message and return the next bot response + state.
   */
  processMessage(
    userMessage: string,
    currentStepId: string | null,
    variables: Record<string, unknown> = {}
  ): FlowEngineResult {
    const state: ConversationState = {
      currentStepId: currentStepId ?? this.flow.inicio,
      variables,
      responses: {},
      history: [],
    }

    let stepId = state.currentStepId

    while (stepId) {
      const stepResult = getStepById(this.flow, stepId)
      if (!stepResult.success) {
        throw new Error(stepResult.error)
      }

      const step = stepResult.data

      if (step.tipo === 'mensagem') {
        const message = replaceVariables(step.mensagem, state)
        return {
          response: message,
          nextStepId: step.proxima ?? null,
          variables: state.variables,
        }
      }

      if (step.tipo === 'escolha') {
        const selection = this.resolveChoice(step, userMessage)

        // No valid choice provided; return options to the user.
        if (!selection) {
          return {
            response: step.pergunta,
            nextStepId: step.id,
            variables: state.variables,
            choices: step.opcoes.map((opcao) => ({
              label: replaceVariables(opcao.texto, state),
              value: opcao.valor,
            })),
          }
        }

        // Record choice and move forward.
        let nextState = recordResponse(state, step.id, selection.value)
        nextState = setVariables(nextState, {
          [step.id]: selection.value,
          [`${step.id}_text`]: selection.label,
        })
        nextState = moveToStep(nextState, selection.nextStepId)

        state.currentStepId = nextState.currentStepId
        state.variables = nextState.variables
        state.responses = nextState.responses
        stepId = selection.nextStepId
        userMessage = '' // avoid reusing same input on next loop
        continue
      }

      if (step.tipo === 'executar') {
        return {
          response: '',
          nextStepId: step.proxima ?? null,
          variables: state.variables,
          action: step.acao,
        }
      }

      // Fallback (should not happen due to schema)
      throw new Error(`Unsupported step type: ${(step as FlowStep).tipo}`)
    }

    // No step available -> conversation complete
    return {
      response: '',
      nextStepId: null,
      variables: state.variables,
    }
  }

  private resolveChoice(
    step: ChoiceStep,
    userMessage: string
  ):
    | { value: string; label: string; nextStepId: string }
    | undefined {
    const normalized = userMessage?.trim().toLowerCase()
    if (!normalized) return undefined

    const match = step.opcoes.find((opcao) => {
      const label = opcao.texto.trim().toLowerCase()
      const value = opcao.valor.trim().toLowerCase()
      return normalized === value || normalized === label
    })

    if (!match) return undefined

    return {
      value: match.valor,
      label: match.texto,
      nextStepId: match.proxima,
    }
  }
}
