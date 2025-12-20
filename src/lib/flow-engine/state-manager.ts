/**
 * State Manager
 *
 * Manages conversation state and variable substitution
 */

import type { ConversationState } from './types'

/**
 * Initialize a new conversation state
 */
export function initializeState(startStepId: string): ConversationState {
  return {
    currentStepId: startStepId,
    variables: {},
    responses: {},
    history: [],
  }
}

/**
 * Replace variables in a text with values from state
 *
 * Supports: {{variableName}}, {{lead.name}}, etc.
 */
export function replaceVariables(
  text: string,
  state: ConversationState
): string {
  let result = text

  // Replace {{variable}} patterns
  const variablePattern = /\{\{([^}]+)\}\}/g
  result = result.replace(variablePattern, (match, variablePath) => {
    const value = getVariableValue(variablePath.trim(), state)
    return value !== undefined && value !== null ? String(value) : match
  })

  return result
}

/**
 * Get a variable value from state using dot notation
 *
 * Examples: "name", "lead.name", "responses.perfil"
 */
function getVariableValue(
  path: string,
  state: ConversationState
): unknown {
  const parts = path.split('.')
  let value: unknown = state.variables

  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }

  return value
}

/**
 * Set a variable in state
 */
export function setVariable(
  state: ConversationState,
  name: string,
  value: unknown
): ConversationState {
  return {
    ...state,
    variables: {
      ...state.variables,
      [name]: value,
    },
  }
}

/**
 * Set multiple variables in state
 */
export function setVariables(
  state: ConversationState,
  variables: Record<string, unknown>
): ConversationState {
  return {
    ...state,
    variables: {
      ...state.variables,
      ...variables,
    },
  }
}

/**
 * Record a user response
 */
export function recordResponse(
  state: ConversationState,
  stepId: string,
  response: unknown
): ConversationState {
  return {
    ...state,
    responses: {
      ...state.responses,
      [stepId]: response,
    },
    history: [
      ...state.history,
      {
        stepId,
        timestamp: new Date().toISOString(),
        response,
      },
    ],
  }
}

/**
 * Move to next step
 */
export function moveToStep(
  state: ConversationState,
  nextStepId: string
): ConversationState {
  return {
    ...state,
    currentStepId: nextStepId,
    history: [
      ...state.history,
      {
        stepId: nextStepId,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

/**
 * Get conversation context for AI or external actions
 */
export function getConversationContext(state: ConversationState): {
  variables: Record<string, unknown>
  responses: Record<string, unknown>
  stepCount: number
  lastStep: string | null
} {
  const lastHistory = state.history[state.history.length - 1]

  return {
    variables: state.variables,
    responses: state.responses,
    stepCount: state.history.length,
    lastStep: lastHistory?.stepId || null,
  }
}

/**
 * Check if a conversation has completed (no more steps)
 */
export function isConversationComplete(
  _state: ConversationState,
  currentStepHasNext: boolean
): boolean {
  return !currentStepHasNext
}
