/**
 * Flow Validator
 *
 * Comprehensive validation for custom conversation flows
 * Extends the basic parser validation with additional checks
 */

import { flowDefinitionSchema, type FlowDefinition, type FlowStep, type ChoiceStep } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  stepId?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  stepId?: string;
}

/**
 * Validate a flow definition comprehensively
 */
export function validateFlow(flow: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Schema validation
  const schemaResult = flowDefinitionSchema.safeParse(flow);
  if (!schemaResult.success) {
    for (const error of schemaResult.error.errors) {
      errors.push({
        code: 'SCHEMA_ERROR',
        message: error.message,
        path: error.path.join('.'),
      });
    }
    return { valid: false, errors, warnings };
  }

  const validFlow = schemaResult.data;

  // Structural validations
  const structuralErrors = validateStructure(validFlow);
  errors.push(...structuralErrors);

  // Reference validations
  const referenceErrors = validateReferences(validFlow);
  errors.push(...referenceErrors);

  // Cycle detection
  const cycleResult = detectCycles(validFlow);
  if (cycleResult.hasCycle) {
    errors.push({
      code: 'CYCLE_DETECTED',
      message: `Infinite loop detected: ${cycleResult.cyclePath?.join(' -> ')}`,
    });
  }

  // Reachability warnings
  const reachabilityWarnings = checkReachability(validFlow);
  warnings.push(...reachabilityWarnings);

  // Dead end warnings
  const deadEndWarnings = checkDeadEnds(validFlow);
  warnings.push(...deadEndWarnings);

  // Content warnings
  const contentWarnings = checkContent(validFlow);
  warnings.push(...contentWarnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate structural requirements
 */
function validateStructure(flow: FlowDefinition): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for duplicate IDs
  const ids = new Set<string>();
  for (const step of flow.passos) {
    if (ids.has(step.id)) {
      errors.push({
        code: 'DUPLICATE_ID',
        message: `Duplicate step ID: ${step.id}`,
        stepId: step.id,
      });
    }
    ids.add(step.id);
  }

  // Check start step exists
  if (!ids.has(flow.inicio)) {
    errors.push({
      code: 'INVALID_START',
      message: `Start step '${flow.inicio}' does not exist`,
    });
  }

  // Check for empty choices
  for (const step of flow.passos) {
    if (step.tipo === 'escolha') {
      const choiceStep = step as ChoiceStep;
      if (choiceStep.opcoes.length === 0) {
        errors.push({
          code: 'EMPTY_CHOICES',
          message: `Choice step '${step.id}' has no options`,
          stepId: step.id,
        });
      }

      // Check for duplicate option values
      const values = new Set<string>();
      for (const opcao of choiceStep.opcoes) {
        if (values.has(opcao.valor)) {
          errors.push({
            code: 'DUPLICATE_OPTION_VALUE',
            message: `Duplicate option value '${opcao.valor}' in step '${step.id}'`,
            stepId: step.id,
          });
        }
        values.add(opcao.valor);
      }
    }
  }

  return errors;
}

/**
 * Validate all step references
 */
function validateReferences(flow: FlowDefinition): ValidationError[] {
  const errors: ValidationError[] = [];
  const stepIds = new Set(flow.passos.map(s => s.id));

  for (const step of flow.passos) {
    if (step.tipo === 'mensagem' && step.proxima) {
      if (!stepIds.has(step.proxima)) {
        errors.push({
          code: 'INVALID_REFERENCE',
          message: `Step '${step.id}' references non-existent step '${step.proxima}'`,
          stepId: step.id,
        });
      }
    } else if (step.tipo === 'escolha') {
      const choiceStep = step as ChoiceStep;
      for (const opcao of choiceStep.opcoes) {
        if (!stepIds.has(opcao.proxima)) {
          errors.push({
            code: 'INVALID_REFERENCE',
            message: `Step '${step.id}' option '${opcao.texto}' references non-existent step '${opcao.proxima}'`,
            stepId: step.id,
          });
        }
      }
    } else if (step.tipo === 'executar' && step.proxima) {
      if (!stepIds.has(step.proxima)) {
        errors.push({
          code: 'INVALID_REFERENCE',
          message: `Step '${step.id}' references non-existent step '${step.proxima}'`,
          stepId: step.id,
        });
      }
    }
  }

  return errors;
}

/**
 * Detect cycles in the flow (infinite loops)
 */
function detectCycles(flow: FlowDefinition): { hasCycle: boolean; cyclePath?: string[] } {
  const stepMap = new Map<string, FlowStep>();
  for (const step of flow.passos) {
    stepMap.set(step.id, step);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const path: string[] = [];

  function dfs(stepId: string): string[] | null {
    if (inStack.has(stepId)) {
      // Found cycle - return the cycle path
      const cycleStart = path.indexOf(stepId);
      return [...path.slice(cycleStart), stepId];
    }

    if (visited.has(stepId)) {
      return null;
    }

    const step = stepMap.get(stepId);
    if (!step) {
      return null;
    }

    visited.add(stepId);
    inStack.add(stepId);
    path.push(stepId);

    const nextSteps: string[] = [];

    if (step.tipo === 'mensagem' && step.proxima) {
      nextSteps.push(step.proxima);
    } else if (step.tipo === 'escolha') {
      const choiceStep = step as ChoiceStep;
      for (const opcao of choiceStep.opcoes) {
        nextSteps.push(opcao.proxima);
      }
    } else if (step.tipo === 'executar' && step.proxima) {
      nextSteps.push(step.proxima);
    }

    for (const nextId of nextSteps) {
      const cycle = dfs(nextId);
      if (cycle) {
        return cycle;
      }
    }

    path.pop();
    inStack.delete(stepId);
    return null;
  }

  const cyclePath = dfs(flow.inicio);
  return {
    hasCycle: cyclePath !== null,
    cyclePath: cyclePath || undefined,
  };
}

/**
 * Check for unreachable steps
 */
function checkReachability(flow: FlowDefinition): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const reachable = new Set<string>();

  const stepMap = new Map<string, FlowStep>();
  for (const step of flow.passos) {
    stepMap.set(step.id, step);
  }

  function traverse(stepId: string, visited: Set<string>) {
    if (visited.has(stepId)) {
      return;
    }

    const step = stepMap.get(stepId);
    if (!step) {
      return;
    }

    visited.add(stepId);
    reachable.add(stepId);

    if (step.tipo === 'mensagem' && step.proxima) {
      traverse(step.proxima, visited);
    } else if (step.tipo === 'escolha') {
      const choiceStep = step as ChoiceStep;
      for (const opcao of choiceStep.opcoes) {
        traverse(opcao.proxima, visited);
      }
    } else if (step.tipo === 'executar' && step.proxima) {
      traverse(step.proxima, visited);
    }
  }

  traverse(flow.inicio, new Set());

  for (const step of flow.passos) {
    if (!reachable.has(step.id)) {
      warnings.push({
        code: 'UNREACHABLE_STEP',
        message: `Step '${step.id}' is not reachable from the start`,
        stepId: step.id,
      });
    }
  }

  return warnings;
}

/**
 * Check for dead ends (steps with no continuation)
 */
function checkDeadEnds(flow: FlowDefinition): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const step of flow.passos) {
    // Message steps without next are conversation terminators
    if (step.tipo === 'mensagem' && !step.proxima) {
      warnings.push({
        code: 'DEAD_END',
        message: `Step '${step.id}' is a dead end (conversation will end here)`,
        stepId: step.id,
      });
    }

    // Execute steps without next might be intentional (final actions)
    // but we still warn about them
    if (step.tipo === 'executar' && !step.proxima) {
      warnings.push({
        code: 'TERMINAL_ACTION',
        message: `Action step '${step.id}' has no continuation (may be intentional)`,
        stepId: step.id,
      });
    }
  }

  return warnings;
}

/**
 * Check content for potential issues
 */
function checkContent(flow: FlowDefinition): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const step of flow.passos) {
    if (step.tipo === 'mensagem') {
      // Check for very long messages
      if (step.mensagem.length > 1000) {
        warnings.push({
          code: 'LONG_MESSAGE',
          message: `Step '${step.id}' has a very long message (${step.mensagem.length} chars)`,
          stepId: step.id,
        });
      }

      // Check for placeholder variables that might not be defined
      const variables = step.mensagem.match(/\{\{(\w+)\}\}/g);
      if (variables) {
        warnings.push({
          code: 'HAS_VARIABLES',
          message: `Step '${step.id}' uses variables: ${variables.join(', ')}. Ensure they are defined.`,
          stepId: step.id,
        });
      }
    }

    if (step.tipo === 'escolha') {
      const choiceStep = step as ChoiceStep;
      // Check for too many options
      if (choiceStep.opcoes.length > 10) {
        warnings.push({
          code: 'TOO_MANY_OPTIONS',
          message: `Step '${step.id}' has ${choiceStep.opcoes.length} options (consider simplifying)`,
          stepId: step.id,
        });
      }

      // Check for very short option texts
      for (const opcao of choiceStep.opcoes) {
        if (opcao.texto.length < 2) {
          warnings.push({
            code: 'SHORT_OPTION',
            message: `Step '${step.id}' has a very short option: '${opcao.texto}'`,
            stepId: step.id,
          });
        }
      }
    }
  }

  return warnings;
}

/**
 * Quick validation check (only errors, no warnings)
 */
export function isValidFlow(flow: unknown): boolean {
  const result = validateFlow(flow);
  return result.valid;
}

/**
 * Get validation summary
 */
export function getValidationSummary(result: ValidationResult): string {
  if (result.valid && result.warnings.length === 0) {
    return 'Flow is valid with no warnings.';
  }

  const parts: string[] = [];

  if (!result.valid) {
    parts.push(`${result.errors.length} error(s)`);
  }

  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} warning(s)`);
  }

  return parts.join(', ');
}
