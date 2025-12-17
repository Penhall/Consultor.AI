/**
 * Meta OAuth Callback API
 * Handles the OAuth callback from Meta Embedded Signup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/encryption'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${process.env.NEXT_PUBLIC_META_APP_ID}&` +
      `client_secret=${process.env.META_APP_SECRET}&code=${code}`
    )

    const { access_token } = await tokenRes.json()

    // Get WABA info
    const debugRes = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?` +
      `input_token=${access_token}&access_token=${process.env.META_APP_ACCESS_TOKEN}`
    )

    const debugData = await debugRes.json()
    const wabaId = debugData.data?.granular_scopes?.[0]?.target_ids?.[0]

    // Get phone numbers
    const phoneRes = await fetch(
      `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers`,
      { headers: { 'Authorization': `Bearer ${access_token}` } }
    )

    const { data: phones } = await phoneRes.json()
    const phone = phones[0]

    // Save to database
    // TODO: Generate proper database types with: npm run db:types
    await (supabase as any)
      .from('whatsapp_integrations')
      .insert({
        consultant_id: user.id,
        provider: 'meta',
        access_token: encrypt(access_token),
        waba_id: wabaId,
        phone_number_id: phone.id,
        phone_number: phone.display_phone_number,
        business_name: phone.verified_name,
        quality_rating: phone.quality_rating,
        status: 'active',
        verified_at: new Date().toISOString(),
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      integration: {
        phoneNumber: phone.display_phone_number,
        businessName: phone.verified_name,
      },
    })
  } catch (error) {
    console.error('Meta callback error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
