/**
 * Meta Embedded Signup API Route
 *
 * Processes the callback from Meta's Embedded Signup flow
 * Exchanges authorization code for access token
 * Saves WhatsApp integration to database
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMetaIntegration } from '@/lib/services/whatsapp-integration-service'

interface MetaSignupRequest {
  code: string
  consultant_id: string
}

interface MetaTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

interface MetaDebugTokenResponse {
  data: {
    app_id: string
    type: string
    application: string
    expires_at: number
    is_valid: boolean
    scopes: string[]
    granular_scopes: Array<{
      scope: string
      target_ids: string[]
    }>
    user_id: string
  }
}

interface MetaPhoneNumber {
  verified_name: string
  display_phone_number: string
  id: string
  quality_rating: string
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    // 1. Validate request
    const body: MetaSignupRequest = await req.json()

    if (!body.code || !body.consultant_id) {
      return NextResponse.json<ApiResponse<never>>(
        { error: 'Missing required fields: code, consultant_id' },
        { status: 400 }
      )
    }

    const { code, consultant_id } = body

    // 2. Verify consultant exists and belongs to authenticated user
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const consultantResult = await (supabase as any)
      .from('consultants')
      .select('id, name')
      .eq('id', consultant_id)
      .eq('user_id', session.user.id)
      .single()

    if (consultantResult.error || !consultantResult.data) {
      return NextResponse.json<ApiResponse<never>>(
        { error: 'Consultant not found or unauthorized' },
        { status: 404 }
      )
    }

    const consultant = consultantResult.data

    // 3. Exchange authorization code for access token
    console.log('[MetaSignup] Exchanging code for access token...')

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${process.env.META_APP_ID}&` +
        `client_secret=${process.env.META_APP_SECRET}&` +
        `code=${code}`
    )

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      console.error('[MetaSignup] Token exchange failed:', error)
      return NextResponse.json<ApiResponse<never>>(
        { error: error.error?.message || 'Failed to exchange code for token' },
        { status: 400 }
      )
    }

    const tokenData: MetaTokenResponse = await tokenResponse.json()
    const { access_token } = tokenData

    console.log('[MetaSignup] Access token obtained successfully')

    // 4. Get WhatsApp Business Account ID from token
    console.log('[MetaSignup] Fetching WhatsApp Business Account info...')

    const debugTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?` +
        `input_token=${access_token}&` +
        `access_token=${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`
    )

    if (!debugTokenResponse.ok) {
      const error = await debugTokenResponse.json()
      console.error('[MetaSignup] Debug token failed:', error)
      return NextResponse.json<ApiResponse<never>>(
        { error: 'Failed to fetch WhatsApp Business Account info' },
        { status: 400 }
      )
    }

    const debugData: MetaDebugTokenResponse = await debugTokenResponse.json()

    // Find WhatsApp Business Account ID from granular scopes
    const wabaScope = debugData.data.granular_scopes?.find((scope) =>
      scope.scope.includes('whatsapp_business')
    )

    if (!wabaScope || !wabaScope.target_ids || wabaScope.target_ids.length === 0) {
      console.error('[MetaSignup] No WABA found in token scopes')
      return NextResponse.json<ApiResponse<never>>(
        { error: 'No WhatsApp Business Account found. Please ensure you selected a WhatsApp Business Account during signup.' },
        { status: 400 }
      )
    }

    const waba_id = wabaScope.target_ids[0]

    console.log('[MetaSignup] WABA ID:', waba_id)

    // 5. Get Phone Number ID
    console.log('[MetaSignup] Fetching phone numbers...')

    const phoneResponse = await fetch(
      `https://graph.facebook.com/v18.0/${waba_id}/phone_numbers`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )

    if (!phoneResponse.ok) {
      const error = await phoneResponse.json()
      console.error('[MetaSignup] Phone numbers fetch failed:', error)
      return NextResponse.json<ApiResponse<never>>(
        { error: 'Failed to fetch phone numbers' },
        { status: 400 }
      )
    }

    const phoneData: { data: MetaPhoneNumber[] } = await phoneResponse.json()

    if (!phoneData.data || phoneData.data.length === 0) {
      console.error('[MetaSignup] No phone numbers found')
      return NextResponse.json<ApiResponse<never>>(
        { error: 'No phone numbers found. Please add a phone number to your WhatsApp Business Account.' },
        { status: 400 }
      )
    }

    const phone = phoneData.data[0]
    const phone_number_id = phone.id
    const phone_number = phone.display_phone_number
    const display_name = phone.verified_name

    console.log('[MetaSignup] Phone Number:', phone_number, 'ID:', phone_number_id)

    // 6. Subscribe to webhooks
    console.log('[MetaSignup] Subscribing to webhook events...')

    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://consultor.ai'}/api/webhook/meta/${consultant_id}`
    const webhookVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'consultor_ai_verify_token'

    const subscribeResponse = await fetch(
      `https://graph.facebook.com/v18.0/${waba_id}/subscribed_apps`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!subscribeResponse.ok) {
      const error = await subscribeResponse.json()
      console.error('[MetaSignup] Webhook subscription failed:', error)
      // Don't fail the entire flow for this - webhook can be configured manually
    } else {
      console.log('[MetaSignup] Webhook subscribed successfully')
    }

    // 7. Save integration to database
    console.log('[MetaSignup] Saving integration to database...')

    const result = await createMetaIntegration({
      consultant_id,
      access_token,
      phone_number,
      phone_number_id,
      waba_id,
      display_name,
      webhook_secret: webhookVerifyToken,
      expires_at: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : undefined,
    })

    if (!result.success) {
      console.error('[MetaSignup] Failed to save integration:', result.error)
      return NextResponse.json<ApiResponse<never>>(
        { error: result.error },
        { status: 500 }
      )
    }

    console.log('[MetaSignup] Integration saved successfully!')

    // 8. Return success
    return NextResponse.json<ApiResponse<{ phone_number: string; display_name: string }>>(
      {
        data: {
          phone_number,
          display_name,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[MetaSignup] Exception:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
