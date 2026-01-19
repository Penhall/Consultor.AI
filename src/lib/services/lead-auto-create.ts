/**
 * Lead Auto-Create Service
 *
 * Automatically creates or retrieves leads from WhatsApp messages
 */

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Get or create a lead from a WhatsApp number
 */
export async function getOrCreateLead(
  consultantId: string,
  whatsappNumber: string,
  name?: string
): Promise<ServiceResult<{ lead: Lead; isNew: boolean }>> {
  try {
    const supabase = await createClient()

    // Format WhatsApp number to standard format
    const formattedNumber = formatWhatsAppNumber(whatsappNumber)

    // Try to find existing lead
    const { data: existingLead } = await (supabase as any)
      .from('leads')
      .select('*')
      .eq('consultant_id', consultantId)
      .eq('whatsapp_number', formattedNumber)
      .single()

    if (existingLead) {
      return {
        success: true,
        data: {
          lead: existingLead,
          isNew: false,
        },
      }
    }

    // Create new lead
    const { data: newLead, error } = await (supabase as any)
      .from('leads')
      .insert({
        consultant_id: consultantId,
        whatsapp_number: formattedNumber,
        name: name || null,
        status: 'novo',
        source: 'whatsapp',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return {
        success: false,
        error: 'Failed to create lead',
      }
    }

    return {
      success: true,
      data: {
        lead: newLead,
        isNew: true,
      },
    }
  } catch (error) {
    console.error('Error in getOrCreateLead:', error)
    return {
      success: false,
      error: `Failed to get or create lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Get or create active conversation for a lead
 */
export async function getOrCreateConversation(
  leadId: string,
  _flowId: string
): Promise<ServiceResult<{ conversationId: string; isNew: boolean }>> {
  try {
    const supabase = await createClient()

    // Try to find active conversation
    const { data: activeConversation } = await (supabase as any)
      .from('conversations')
      .select('id')
      .eq('lead_id', leadId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (activeConversation) {
      return {
        success: true,
        data: {
          conversationId: activeConversation.id,
          isNew: false,
        },
      }
    }

    // No active conversation, create new one
    // This will be handled by the flow engine's startConversation
    return {
      success: true,
      data: {
        conversationId: '', // Will be created by startConversation
        isNew: true,
      },
    }
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error)
    return {
      success: false,
      error: `Failed to get or create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Format WhatsApp number to E.164 format (+5511999999999)
 */
function formatWhatsAppNumber(number: string): string {
  // Remove all non-digit characters
  let cleaned = number.replace(/\D/g, '')

  // If doesn't start with country code, assume Brazil (55)
  if (!cleaned.startsWith('55')) {
    cleaned = `55${cleaned}`
  }

  // Add + prefix
  return `+${cleaned}`
}

/**
 * Extract contact name from WhatsApp webhook payload
 */
export function extractContactName(webhookMessage: any): string | undefined {
  return webhookMessage.contacts?.[0]?.profile?.name
}

/**
 * Update lead with additional information from WhatsApp
 */
export async function updateLeadFromWhatsApp(
  leadId: string,
  data: {
    name?: string
    profilePicture?: string
  }
): Promise<ServiceResult<Lead>> {
  try {
    const supabase = await createClient()

    const updateData: any = {}

    if (data.name) {
      updateData.name = data.name
    }

    if (data.profilePicture) {
      updateData.metadata = {
        whatsapp_profile_picture: data.profilePicture,
      }
    }

    if (Object.keys(updateData).length === 0) {
      // Nothing to update
      const { data: lead } = await (supabase as any)
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      return {
        success: true,
        data: lead,
      }
    }

    const { data: updatedLead, error } = await (supabase as any)
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead:', error)
      return {
        success: false,
        error: 'Failed to update lead',
      }
    }

    return {
      success: true,
      data: updatedLead,
    }
  } catch (error) {
    console.error('Error in updateLeadFromWhatsApp:', error)
    return {
      success: false,
      error: `Failed to update lead: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
