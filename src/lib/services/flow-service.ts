/**
 * Flow Service
 *
 * CRUD operations for conversation flows with versioning support
 */

import { createClient } from '@/lib/supabase/server';
import { validateFlow, type ValidationResult } from '@/lib/flow-engine/validator';
import type { FlowDefinition } from '@/lib/flow-engine/types';

type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

export interface Flow {
  id: string;
  consultant_id: string;
  name: string;
  description: string | null;
  vertical: 'saude' | 'imoveis' | 'geral';
  definition: FlowDefinition;
  version: string;
  is_active: boolean;
  is_default: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFlowInput {
  name: string;
  description?: string;
  vertical: 'saude' | 'imoveis' | 'geral';
  definition: FlowDefinition;
  is_active?: boolean;
}

export interface UpdateFlowInput {
  name?: string;
  description?: string;
  definition?: FlowDefinition;
  is_active?: boolean;
}

/**
 * Create a new flow
 */
export async function createFlow(
  consultantId: string,
  input: CreateFlowInput
): Promise<ServiceResult<Flow>> {
  try {
    // Validate the flow definition
    const validation = validateFlow(input.definition);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid flow definition: ${validation.errors.map(e => e.message).join(', ')}`,
      };
    }

    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from('flows')
      .insert({
        consultant_id: consultantId,
        name: input.name,
        description: input.description || null,
        vertical: input.vertical,
        definition: input.definition,
        version: '1.0.0',
        is_active: input.is_active ?? true,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating flow:', error);
      return { success: false, error: 'Erro ao criar fluxo' };
    }

    return { success: true, data: data as Flow };
  } catch (error) {
    console.error('Exception in createFlow:', error);
    return { success: false, error: 'Erro interno ao criar fluxo' };
  }
}

/**
 * Get a flow by ID
 */
export async function getFlowById(flowId: string): Promise<ServiceResult<Flow>> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from('flows')
      .select('*')
      .eq('id', flowId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Fluxo nao encontrado' };
      }
      console.error('Error fetching flow:', error);
      return { success: false, error: 'Erro ao buscar fluxo' };
    }

    return { success: true, data: data as Flow };
  } catch (error) {
    console.error('Exception in getFlowById:', error);
    return { success: false, error: 'Erro interno ao buscar fluxo' };
  }
}

/**
 * List flows for a consultant
 */
export async function listFlows(
  consultantId: string,
  options?: {
    vertical?: 'saude' | 'imoveis' | 'geral';
    activeOnly?: boolean;
  }
): Promise<ServiceResult<Flow[]>> {
  try {
    const supabase = await createClient();

    let query = (supabase as any)
      .from('flows')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('updated_at', { ascending: false });

    if (options?.vertical) {
      query = query.eq('vertical', options.vertical);
    }

    if (options?.activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing flows:', error);
      return { success: false, error: 'Erro ao listar fluxos' };
    }

    return { success: true, data: (data || []) as Flow[] };
  } catch (error) {
    console.error('Exception in listFlows:', error);
    return { success: false, error: 'Erro interno ao listar fluxos' };
  }
}

/**
 * Update a flow (creates a new version if definition changes)
 */
export async function updateFlow(
  flowId: string,
  input: UpdateFlowInput
): Promise<ServiceResult<Flow>> {
  try {
    const supabase = await createClient();

    // Get current flow
    const { data: currentFlow, error: fetchError } = await (supabase as any)
      .from('flows')
      .select('*')
      .eq('id', flowId)
      .single();

    if (fetchError || !currentFlow) {
      return { success: false, error: 'Fluxo nao encontrado' };
    }

    const typedFlow = currentFlow as Flow;

    // If definition is being updated, validate it
    if (input.definition) {
      const validation = validateFlow(input.definition);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid flow definition: ${validation.errors.map(e => e.message).join(', ')}`,
        };
      }
    }

    // Calculate new version if definition changed
    let newVersion = typedFlow.version;
    if (input.definition) {
      const parts = typedFlow.version.split('.').map(Number);
      const major = parts[0] ?? 1;
      const minor = parts[1] ?? 0;
      const patch = parts[2] ?? 0;
      newVersion = `${major}.${minor}.${patch + 1}`;
    }

    // Update the flow
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.definition !== undefined) {
      updateData.definition = input.definition;
      updateData.version = newVersion;
    }
    if (input.is_active !== undefined) updateData.is_active = input.is_active;

    const { data, error } = await (supabase as any)
      .from('flows')
      .update(updateData)
      .eq('id', flowId)
      .select()
      .single();

    if (error) {
      console.error('Error updating flow:', error);
      return { success: false, error: 'Erro ao atualizar fluxo' };
    }

    return { success: true, data: data as Flow };
  } catch (error) {
    console.error('Exception in updateFlow:', error);
    return { success: false, error: 'Erro interno ao atualizar fluxo' };
  }
}

/**
 * Delete a flow
 */
export async function deleteFlow(flowId: string): Promise<ServiceResult<{ deleted: true }>> {
  try {
    const supabase = await createClient();

    // Check if flow is in use by any active conversations
    const { count, error: countError } = await (supabase as any)
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('flow_id', flowId)
      .eq('status', 'active');

    if (countError) {
      console.error('Error checking conversations:', countError);
      return { success: false, error: 'Erro ao verificar conversas ativas' };
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `Fluxo em uso por ${count} conversa(s) ativa(s). Desative-as primeiro.`,
      };
    }

    const { error } = await (supabase as any).from('flows').delete().eq('id', flowId);

    if (error) {
      console.error('Error deleting flow:', error);
      return { success: false, error: 'Erro ao deletar fluxo' };
    }

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error('Exception in deleteFlow:', error);
    return { success: false, error: 'Erro interno ao deletar fluxo' };
  }
}

/**
 * Set a flow as active (deactivates others for the same vertical)
 */
export async function activateFlow(
  consultantId: string,
  flowId: string
): Promise<ServiceResult<Flow>> {
  try {
    const supabase = await createClient();

    // Get the flow to activate
    const { data: flow, error: fetchError } = await (supabase as any)
      .from('flows')
      .select('*')
      .eq('id', flowId)
      .eq('consultant_id', consultantId)
      .single();

    if (fetchError || !flow) {
      return { success: false, error: 'Fluxo nao encontrado' };
    }

    // Deactivate other flows of the same vertical
    await (supabase as any)
      .from('flows')
      .update({ is_active: false })
      .eq('consultant_id', consultantId)
      .eq('vertical', flow.vertical)
      .neq('id', flowId);

    // Activate the selected flow
    const { data, error } = await (supabase as any)
      .from('flows')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', flowId)
      .select()
      .single();

    if (error) {
      console.error('Error activating flow:', error);
      return { success: false, error: 'Erro ao ativar fluxo' };
    }

    return { success: true, data: data as Flow };
  } catch (error) {
    console.error('Exception in activateFlow:', error);
    return { success: false, error: 'Erro interno ao ativar fluxo' };
  }
}

/**
 * Duplicate a flow
 */
export async function duplicateFlow(flowId: string, newName: string): Promise<ServiceResult<Flow>> {
  try {
    const supabase = await createClient();

    // Get the original flow
    const { data: original, error: fetchError } = await (supabase as any)
      .from('flows')
      .select('*')
      .eq('id', flowId)
      .single();

    if (fetchError || !original) {
      return { success: false, error: 'Fluxo original nao encontrado' };
    }

    // Create a copy
    const { data, error } = await (supabase as any)
      .from('flows')
      .insert({
        consultant_id: original.consultant_id,
        name: newName,
        description: original.description
          ? `Copia de: ${original.description}`
          : `Copia de ${original.name}`,
        vertical: original.vertical,
        definition: original.definition,
        version: '1.0.0',
        is_active: false,
        is_default: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating flow:', error);
      return { success: false, error: 'Erro ao duplicar fluxo' };
    }

    return { success: true, data: data as Flow };
  } catch (error) {
    console.error('Exception in duplicateFlow:', error);
    return { success: false, error: 'Erro interno ao duplicar fluxo' };
  }
}

/**
 * Validate a flow definition without saving
 */
export function validateFlowDefinition(definition: unknown): ValidationResult {
  return validateFlow(definition);
}

/**
 * Get the active flow for a consultant and vertical
 */
export async function getActiveFlow(
  consultantId: string,
  vertical: 'saude' | 'imoveis' | 'geral'
): Promise<ServiceResult<Flow>> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from('flows')
      .select('*')
      .eq('consultant_id', consultantId)
      .eq('vertical', vertical)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Nenhum fluxo ativo encontrado' };
      }
      console.error('Error fetching active flow:', error);
      return { success: false, error: 'Erro ao buscar fluxo ativo' };
    }

    return { success: true, data: data as Flow };
  } catch (error) {
    console.error('Exception in getActiveFlow:', error);
    return { success: false, error: 'Erro interno ao buscar fluxo ativo' };
  }
}

/**
 * Increment usage count for a flow
 */
export async function incrementFlowUsage(flowId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Get current count
    const { data: flow } = await (supabase as any)
      .from('flows')
      .select('usage_count')
      .eq('id', flowId)
      .single();

    if (flow) {
      await (supabase as any)
        .from('flows')
        .update({ usage_count: (flow.usage_count || 0) + 1 })
        .eq('id', flowId);
    }
  } catch (error) {
    console.error('Error incrementing flow usage:', error);
  }
}
