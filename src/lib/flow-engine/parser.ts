/**
 * Flow Parser
 *
 * Validates and parses conversation flow definitions
 */

import { flowDefinitionSchema, type FlowDefinition, type FlowStep } from './types'

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Parse and validate a flow definition from JSON
 */
export function parseFlowDefinition(json: unknown): ParseResult<FlowDefinition> {
  try {
    const result = flowDefinitionSchema.safeParse(json)

    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`)
      return {
        success: false,
        error: `Flow validation failed: ${errors.join(', ')}`,
      }
    }

    const flow = result.data

    // Validate that start step exists
    const startStep = flow.passos.find((s) => s.id === flow.inicio)
    if (!startStep) {
      return {
        success: false,
        error: `Start step '${flow.inicio}' not found in flow`,
      }
    }

    // Validate that all referenced steps exist
    const stepIds = new Set(flow.passos.map((s) => s.id))
    const errors: string[] = []

    for (const step of flow.passos) {
      if (step.tipo === 'mensagem' && step.proxima) {
        if (!stepIds.has(step.proxima)) {
          errors.push(`Step '${step.id}': next step '${step.proxima}' not found`)
        }
      } else if (step.tipo === 'escolha') {
        for (const opcao of step.opcoes) {
          if (!stepIds.has(opcao.proxima)) {
            errors.push(
              `Step '${step.id}': option '${opcao.texto}' references non-existent step '${opcao.proxima}'`
            )
          }
        }
      } else if (step.tipo === 'executar' && step.proxima) {
        if (!stepIds.has(step.proxima)) {
          errors.push(`Step '${step.id}': next step '${step.proxima}' not found`)
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Flow reference errors: ${errors.join(', ')}`,
      }
    }

    // Check for duplicate step IDs
    const duplicates = flow.passos
      .map((s) => s.id)
      .filter((id, index, arr) => arr.indexOf(id) !== index)

    if (duplicates.length > 0) {
      return {
        success: false,
        error: `Duplicate step IDs found: ${duplicates.join(', ')}`,
      }
    }

    return {
      success: true,
      data: flow,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse flow: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Get a step by ID from a flow
 */
export function getStepById(
  flow: FlowDefinition,
  stepId: string
): ParseResult<FlowStep> {
  const step = flow.passos.find((s) => s.id === stepId)

  if (!step) {
    return {
      success: false,
      error: `Step '${stepId}' not found in flow`,
    }
  }

  return {
    success: true,
    data: step,
  }
}

/**
 * Validate that a flow has a valid structure (no infinite loops, unreachable steps, etc.)
 */
export function validateFlowStructure(
  flow: FlowDefinition
): ParseResult<{ warnings: string[] }> {
  const warnings: string[] = []
  const visited = new Set<string>()
  const reachable = new Set<string>()

  // DFS to find all reachable steps
  function traverse(stepId: string) {
    if (visited.has(stepId)) {
      return
    }

    visited.add(stepId)
    reachable.add(stepId)

    const stepResult = getStepById(flow, stepId)
    if (!stepResult.success) {
      return
    }

    const step = stepResult.data

    if (step.tipo === 'mensagem' && step.proxima) {
      traverse(step.proxima)
    } else if (step.tipo === 'escolha') {
      for (const opcao of step.opcoes) {
        traverse(opcao.proxima)
      }
    } else if (step.tipo === 'executar' && step.proxima) {
      traverse(step.proxima)
    }
  }

  // Start traversal from start step
  traverse(flow.inicio)

  // Find unreachable steps
  const unreachable = flow.passos.filter((s) => !reachable.has(s.id))
  if (unreachable.length > 0) {
    warnings.push(
      `Unreachable steps detected: ${unreachable.map((s) => s.id).join(', ')}`
    )
  }

  // Find steps with no next (dead ends) that aren't execute actions
  const deadEnds = flow.passos.filter(
    (s) =>
      s.tipo === 'mensagem' &&
      !s.proxima &&
      reachable.has(s.id)
  )

  if (deadEnds.length > 0) {
    warnings.push(
      `Steps with no next action (conversation will end): ${deadEnds.map((s) => s.id).join(', ')}`
    )
  }

  return {
    success: true,
    data: { warnings },
  }
}
