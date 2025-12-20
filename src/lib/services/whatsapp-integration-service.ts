/**
 * WhatsApp Integration Service
 *
 * Manages WhatsApp Business integrations for consultants (multi-tenant)
 * Supports multiple providers: Meta, Weni, 360dialog, Twilio
 */

import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/encryption'
import type { Database } from '@/types/database'

type WhatsAppIntegration = Database['public']['Tables']['whatsapp_integrations']['Row']
type WhatsAppIntegrationInsert = Database['public']['Tables']['whatsapp_integrations']['Insert']
type WhatsAppIntegrationUpdate = Database['public']['Tables']['whatsapp_integrations']['Update']

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type WhatsAppProvider = 'meta' | 'weni' | '360dialog' | 'twilio'

export interface CreateMetaIntegrationInput {
  consultant_id: string
  access_token: string
  refresh_token?: string
  phone_number: string
  phone_number_id: string
  waba_id: string
  display_name?: string
  webhook_secret: string
  expires_at?: string
}

export interface CreateProviderIntegrationInput {
  consultant_id: string
  provider: Exclude<WhatsAppProvider, 'meta'>
  api_key: string
  api_secret?: string
  phone_number: string
  webhook_secret: string
}

/**
 * Create Meta WhatsApp integration (via Embedded Signup)
 */
export async function createMetaIntegration(
  input: CreateMetaIntegrationInput
): Promise<ServiceResult<WhatsAppIntegration>> {
  try {
    const supabase = await createClient()

    // Check if integration already exists
    const { data: existing } = await (supabase as any)
      .from('whatsapp_integrations')
      .select('id')
      .eq('consultant_id', input.consultant_id)
      .eq('provider', 'meta')
      .single()

    if (existing) {
      return {
        success: false,
        error: 'Meta integration already exists for this consultant',
      }
    }

    // Encrypt sensitive data
    const integrationData: WhatsAppIntegrationInsert = {
      consultant_id: input.consultant_id,
      provider: 'meta',
      access_token: encrypt(input.access_token),
      refresh_token: input.refresh_token ? encrypt(input.refresh_token) : null,
      webhook_secret: encrypt(input.webhook_secret),
      phone_number: input.phone_number,
      phone_number_id: input.phone_number_id,
      waba_id: input.waba_id,
      display_name: input.display_name || null,
      status: 'active',
      verified_at: new Date().toISOString(),
      expires_at: input.expires_at || null,
      metadata: {
        connected_via: 'embedded_signup',
        setup_completed_at: new Date().toISOString(),
      },
    }

    const { data, error } = await (supabase as any)
      .from('whatsapp_integrations')
      .insert(integrationData as any)
      .select()
      .single()

    if (error) {
      console.error('[WhatsAppIntegration] Create Meta error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[WhatsAppIntegration] Create Meta exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Create integration for other providers (Weni, 360dialog, Twilio)
 */
export async function createProviderIntegration(
  input: CreateProviderIntegrationInput
): Promise<ServiceResult<WhatsAppIntegration>> {
  try {
    const supabase = await createClient()

    // Check if integration already exists
    const { data: existing } = await (supabase as any)
      .from('whatsapp_integrations')
      .select('id')
      .eq('consultant_id', input.consultant_id)
      .eq('provider', input.provider)
      .single()

    if (existing) {
      return {
        success: false,
        error: `${input.provider} integration already exists for this consultant`,
      }
    }

    // Encrypt sensitive data
    const integrationData: WhatsAppIntegrationInsert = {
      consultant_id: input.consultant_id,
      provider: input.provider,
      api_key: encrypt(input.api_key),
      api_secret: input.api_secret ? encrypt(input.api_secret) : null,
      webhook_secret: encrypt(input.webhook_secret),
      phone_number: input.phone_number,
      status: 'active',
      verified_at: new Date().toISOString(),
      metadata: {
        connected_via: 'manual_setup',
        setup_completed_at: new Date().toISOString(),
      },
    }

    const { data, error } = await (supabase as any)
      .from('whatsapp_integrations')
      .insert(integrationData as any)
      .select()
      .single()

    if (error) {
      console.error('[WhatsAppIntegration] Create provider error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[WhatsAppIntegration] Create provider exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get integration by consultant ID and provider
 */
export async function getIntegration(
  consultantId: string,
  provider: WhatsAppProvider = 'meta'
): Promise<ServiceResult<WhatsAppIntegration>> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('whatsapp_integrations')
      .select('*')
      .eq('consultant_id', consultantId)
      .eq('provider', provider)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return {
        success: false,
        error: error?.message || 'Integration not found',
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[WhatsAppIntegration] Get integration exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get decrypted access token for sending messages
 */
export async function getDecryptedToken(
  consultantId: string,
  provider: WhatsAppProvider = 'meta'
): Promise<ServiceResult<string>> {
  try {
    const result = await getIntegration(consultantId, provider)

    if (!result.success) {
      return result as ServiceResult<string>
    }

    const integration = result.data

    // Decrypt appropriate token based on provider
    let token: string | null = null

    if (provider === 'meta') {
      token = integration.access_token ? decrypt(integration.access_token) : null
    } else {
      token = integration.api_key ? decrypt(integration.api_key) : null
    }

    if (!token) {
      return { success: false, error: 'Token not found or invalid' }
    }

    return { success: true, data: token }
  } catch (error) {
    console.error('[WhatsAppIntegration] Get decrypted token exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update integration status
 */
export async function updateIntegrationStatus(
  consultantId: string,
  provider: WhatsAppProvider,
  status: 'active' | 'inactive' | 'suspended' | 'expired'
): Promise<ServiceResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('whatsapp_integrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('consultant_id', consultantId)
      .eq('provider', provider)

    if (error) {
      console.error('[WhatsAppIntegration] Update status error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: undefined }
  } catch (error) {
    console.error('[WhatsAppIntegration] Update status exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Refresh Meta access token
 */
export async function refreshMetaToken(
  consultantId: string
): Promise<ServiceResult<string>> {
  try {
    const result = await getIntegration(consultantId, 'meta')

    if (!result.success) {
      return result as ServiceResult<string>
    }

    const integration = result.data

    if (!integration.refresh_token) {
      return { success: false, error: 'No refresh token available' }
    }

    const refreshToken = decrypt(integration.refresh_token)

    // Exchange refresh token for new access token
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${process.env.META_APP_ID}&` +
        `client_secret=${process.env.META_APP_SECRET}&` +
        `fb_exchange_token=${refreshToken}`
    )

    const data = await response.json()

    if (!response.ok || !data.access_token) {
      return { success: false, error: data.error?.message || 'Failed to refresh token' }
    }

    // Update integration with new token
    const supabase = await createClient()

    await (supabase as any)
      .from('whatsapp_integrations')
      .update({
        access_token: encrypt(data.access_token),
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('consultant_id', consultantId)
      .eq('provider', 'meta')

    return { success: true, data: data.access_token }
  } catch (error) {
    console.error('[WhatsAppIntegration] Refresh token exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Delete integration
 */
export async function deleteIntegration(
  consultantId: string,
  provider: WhatsAppProvider
): Promise<ServiceResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('whatsapp_integrations')
      .delete()
      .eq('consultant_id', consultantId)
      .eq('provider', provider)

    if (error) {
      console.error('[WhatsAppIntegration] Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: undefined }
  } catch (error) {
    console.error('[WhatsAppIntegration] Delete exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * List all integrations for a consultant
 */
export async function listIntegrations(
  consultantId: string
): Promise<ServiceResult<WhatsAppIntegration[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await (supabase as any)
      .from('whatsapp_integrations')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[WhatsAppIntegration] List error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('[WhatsAppIntegration] List exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update last sync timestamp
 */
export async function updateLastSync(
  consultantId: string,
  provider: WhatsAppProvider
): Promise<ServiceResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('whatsapp_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('consultant_id', consultantId)
      .eq('provider', provider)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
