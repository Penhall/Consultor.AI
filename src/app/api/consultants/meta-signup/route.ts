/**
 * Meta Embedded Signup API Route
 *
 * Processes the callback from Meta's Embedded Signup flow, exchanges the
 * authorization code for an access token, and saves the WhatsApp integration.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMetaIntegration } from '@/lib/services/whatsapp-integration-service'

// Define interfaces for Meta API responses
interface MetaTokenResponse {
  access_token: string
}

interface MetaDebugTokenResponse {
  data: {
    granular_scopes?: { scope: string; target_ids: string[] }[]
  }
}

interface MetaPhoneNumber {
  verified_name: string
  display_phone_number: string
  id: string
}

// Partial consultant type for verification (only fields we query)
interface ConsultantPartial {
  id: string
  name: string | null
}

type ApiResponse<T> = { data: T } | { error: string }

// Helper function to verify consultant ownership
async function verifyConsultant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  consultantId: string,
  userId: string
): Promise<{ data?: ConsultantPartial; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('consultants')
    .select('id, name')
    .eq('id', consultantId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return { error: 'Consultant not found or not authorized' }
  }
  return { data: data as ConsultantPartial }
}

// Helper function to exchange authorization code for an access token
async function exchangeCodeForToken(
  code: string
): Promise<{ data?: MetaTokenResponse; error?: string }> {
  const url = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&code=${code}`
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    return { error: error.error?.message || 'Failed to exchange code for token' }
  }
  return { data: await response.json() }
}

// Helper function to get WABA ID from the access token
async function getWabaIdFromToken(
  accessToken: string
): Promise<{ data?: string; error?: string }> {
  const url = `https://graph.facebook.com/v18.0/debug_token?input_token=${accessToken}&access_token=${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`
  const response = await fetch(url)
  const debugData: MetaDebugTokenResponse = await response.json()

  const wabaScope = debugData.data.granular_scopes?.find((s) =>
    s.scope.includes('whatsapp_business')
  )

  if (!wabaScope?.target_ids?.[0]) {
    return {
      error:
        'No WhatsApp Business Account found. Please ensure one was selected.',
    }
  }
  return { data: wabaScope.target_ids[0] }
}

// Helper function to get phone number details
async function getPhoneNumberDetails(
  wabaId: string,
  accessToken: string
): Promise<{ data?: MetaPhoneNumber; error?: string }> {
  const url = `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const phoneData: { data: MetaPhoneNumber[] } = await response.json()

  if (!phoneData.data?.[0]) {
    return {
      error:
        'No phone numbers found. Please add a phone number to your WABA.',
    }
  }
  return { data: phoneData.data[0] }
}

// Helper to subscribe app to webhooks
async function subscribeToWebhooks(wabaId: string, accessToken: string) {
  await fetch(`https://graph.facebook.com/v18.0/${wabaId}/subscribed_apps`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, consultant_id } = body

    if (!code || !consultant_id) {
      return NextResponse.json(
        { error: 'Missing required fields: code, consultant_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const consultantCheck = await verifyConsultant(
      supabase,
      consultant_id,
      session.user.id
    )
    if (consultantCheck.error) {
      return NextResponse.json(
        { error: consultantCheck.error },
        { status: 404 }
      )
    }

    const tokenResult = await exchangeCodeForToken(code)
    if (tokenResult.error || !tokenResult.data) {
      return NextResponse.json(
        { error: tokenResult.error },
        { status: 400 }
      )
    }
    const { access_token } = tokenResult.data

    const wabaResult = await getWabaIdFromToken(access_token)
    if (wabaResult.error || !wabaResult.data) {
      return NextResponse.json({ error: wabaResult.error }, { status: 400 })
    }
    const waba_id = wabaResult.data

    const phoneResult = await getPhoneNumberDetails(waba_id, access_token)
    if (phoneResult.error || !phoneResult.data) {
      return NextResponse.json({ error: phoneResult.error }, { status: 400 })
    }
    const {
      id: phone_number_id,
      display_phone_number,
      verified_name,
    } = phoneResult.data

    await subscribeToWebhooks(waba_id, access_token)

    const result = await createMetaIntegration({
      consultant_id,
      access_token,
      phone_number: display_phone_number,
      phone_number_id,
      waba_id,
      display_name: verified_name,
      webhook_secret: process.env.META_WEBHOOK_VERIFY_TOKEN || 'consultor_ai_verify_token',
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<{ phone_number: string; display_name: string }>>(
      {
        data: {
          phone_number: display_phone_number,
          display_name: verified_name,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
