/**
 * Meta Integration Status API Route
 *
 * GET /api/consultants/[id]/integrations/meta
 * Returns the Meta WhatsApp integration status for a consultant
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getIntegration } from '@/lib/services/whatsapp-integration-service'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  _req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: consultantId } = await context.params

    // Verify authentication
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify consultant belongs to user
    const { data: consultant, error: consultantError } = await (supabase as any)
      .from('consultants')
      .select('id, user_id')
      .eq('id', consultantId)
      .single()

    if (consultantError || !consultant) {
      return NextResponse.json(
        { error: 'Consultant not found' },
        { status: 404 }
      )
    }

    if (consultant.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Get integration using service
    const result = await getIntegration(consultantId, 'meta')

    if (!result.success) {
      // Integration not found is OK - consultant hasn't connected yet
      if (result.error.includes('not found')) {
        return NextResponse.json(
          { integration: null },
          { status: 200 }
        )
      }

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Return integration data (without sensitive fields)
    const integration = result.data
    const safeIntegration = {
      phone_number: integration.phone_number,
      display_name: integration.display_name,
      status: integration.status,
      verified_at: integration.verified_at,
      provider: integration.provider,
    }

    return NextResponse.json(
      { integration: safeIntegration },
      { status: 200 }
    )
  } catch (error) {
    console.error('[MetaIntegrationStatus] Exception:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
