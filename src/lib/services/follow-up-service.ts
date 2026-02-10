/**
 * Follow-up Service
 *
 * Handles CRUD operations and business logic for lead follow-ups
 */

import { createClient } from '@/lib/supabase/server'

// Types (until database.ts is regenerated)
export type FollowUpStatus = 'pending' | 'sent' | 'completed' | 'cancelled'

export interface FollowUp {
  id: string
  lead_id: string
  consultant_id: string
  title: string
  message: string | null
  notes: string | null
  scheduled_at: string
  reminder_at: string | null
  status: FollowUpStatus
  completed_at: string | null
  sent_at: string | null
  cancelled_at: string | null
  is_automatic: boolean
  auto_send: boolean
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface CreateFollowUpInput {
  lead_id: string
  title: string
  message?: string
  notes?: string
  scheduled_at: string
  reminder_at?: string
  is_automatic?: boolean
  auto_send?: boolean
}

export interface UpdateFollowUpInput {
  title?: string
  message?: string
  notes?: string
  scheduled_at?: string
  reminder_at?: string
  status?: FollowUpStatus
  auto_send?: boolean
}

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Create a new follow-up for a lead
 */
export async function createFollowUp(
  consultantId: string,
  input: CreateFollowUpInput
): Promise<ServiceResult<FollowUp>> {
  try {
    const supabase = await createClient()

    // Verify the lead belongs to the consultant
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', input.lead_id)
      .eq('consultant_id', consultantId)
      .single()

    if (leadError || !lead) {
      return { success: false, error: 'Lead nao encontrado' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('follow_ups')
      .insert({
        ...input,
        consultant_id: consultantId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating follow-up:', error)
      return { success: false, error: 'Erro ao criar follow-up' }
    }

    return { success: true, data: data as FollowUp }
  } catch (error) {
    console.error('Error in createFollowUp:', error)
    return { success: false, error: 'Erro interno ao criar follow-up' }
  }
}

/**
 * Get a follow-up by ID
 */
export async function getFollowUpById(
  followUpId: string
): Promise<ServiceResult<FollowUp>> {
  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('follow_ups')
      .select('*')
      .eq('id', followUpId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Follow-up nao encontrado' }
      }
      console.error('Error fetching follow-up:', error)
      return { success: false, error: 'Erro ao buscar follow-up' }
    }

    return { success: true, data: data as FollowUp }
  } catch (error) {
    console.error('Error in getFollowUpById:', error)
    return { success: false, error: 'Erro interno ao buscar follow-up' }
  }
}

/**
 * List follow-ups for a lead
 */
export async function listFollowUpsByLead(
  leadId: string
): Promise<ServiceResult<FollowUp[]>> {
  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('follow_ups')
      .select('*')
      .eq('lead_id', leadId)
      .order('scheduled_at', { ascending: true })

    if (error) {
      console.error('Error listing follow-ups:', error)
      return { success: false, error: 'Erro ao listar follow-ups' }
    }

    return { success: true, data: (data || []) as FollowUp[] }
  } catch (error) {
    console.error('Error in listFollowUpsByLead:', error)
    return { success: false, error: 'Erro interno ao listar follow-ups' }
  }
}

/**
 * List pending follow-ups for a consultant
 */
export async function listPendingFollowUps(
  consultantId: string
): Promise<ServiceResult<FollowUp[]>> {
  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('follow_ups')
      .select('*')
      .eq('consultant_id', consultantId)
      .eq('status', 'pending')
      .order('scheduled_at', { ascending: true })

    if (error) {
      console.error('Error listing pending follow-ups:', error)
      return { success: false, error: 'Erro ao listar follow-ups pendentes' }
    }

    return { success: true, data: (data || []) as FollowUp[] }
  } catch (error) {
    console.error('Error in listPendingFollowUps:', error)
    return { success: false, error: 'Erro interno ao listar follow-ups' }
  }
}

/**
 * Update a follow-up
 */
export async function updateFollowUp(
  followUpId: string,
  input: UpdateFollowUpInput
): Promise<ServiceResult<FollowUp>> {
  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('follow_ups')
      .update(input)
      .eq('id', followUpId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Follow-up nao encontrado' }
      }
      console.error('Error updating follow-up:', error)
      return { success: false, error: 'Erro ao atualizar follow-up' }
    }

    return { success: true, data: data as FollowUp }
  } catch (error) {
    console.error('Error in updateFollowUp:', error)
    return { success: false, error: 'Erro interno ao atualizar follow-up' }
  }
}

/**
 * Complete a follow-up
 */
export async function completeFollowUp(
  followUpId: string,
  notes?: string
): Promise<ServiceResult<FollowUp>> {
  try {
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
      status: 'completed',
      completed_at: new Date().toISOString(),
    }

    if (notes) {
      updateData.notes = notes
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('follow_ups')
      .update(updateData)
      .eq('id', followUpId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Follow-up nao encontrado' }
      }
      console.error('Error completing follow-up:', error)
      return { success: false, error: 'Erro ao completar follow-up' }
    }

    return { success: true, data: data as FollowUp }
  } catch (error) {
    console.error('Error in completeFollowUp:', error)
    return { success: false, error: 'Erro interno ao completar follow-up' }
  }
}

/**
 * Cancel a follow-up
 */
export async function cancelFollowUp(
  followUpId: string
): Promise<ServiceResult<FollowUp>> {
  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('follow_ups')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', followUpId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Follow-up nao encontrado' }
      }
      console.error('Error cancelling follow-up:', error)
      return { success: false, error: 'Erro ao cancelar follow-up' }
    }

    return { success: true, data: data as FollowUp }
  } catch (error) {
    console.error('Error in cancelFollowUp:', error)
    return { success: false, error: 'Erro interno ao cancelar follow-up' }
  }
}

/**
 * Delete a follow-up
 */
export async function deleteFollowUp(
  followUpId: string
): Promise<ServiceResult<{ message: string }>> {
  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('follow_ups')
      .delete()
      .eq('id', followUpId)

    if (error) {
      console.error('Error deleting follow-up:', error)
      return { success: false, error: 'Erro ao deletar follow-up' }
    }

    return { success: true, data: { message: 'Follow-up deletado com sucesso' } }
  } catch (error) {
    console.error('Error in deleteFollowUp:', error)
    return { success: false, error: 'Erro interno ao deletar follow-up' }
  }
}

/**
 * Create an automatic follow-up after conversation
 * Called after lead qualification to schedule a follow-up
 */
export async function createAutoFollowUp(
  consultantId: string,
  leadId: string,
  hoursDelay: number = 24
): Promise<ServiceResult<FollowUp>> {
  const scheduledAt = new Date()
  scheduledAt.setHours(scheduledAt.getHours() + hoursDelay)

  return createFollowUp(consultantId, {
    lead_id: leadId,
    title: 'Follow-up automatico',
    message: 'Ola! Gostaria de saber se voce teve tempo de avaliar as opcoes que conversamos?',
    scheduled_at: scheduledAt.toISOString(),
    is_automatic: true,
    auto_send: false, // Default to manual confirmation
  })
}
