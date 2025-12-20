/**
 * Analytics Overview API
 * GET /api/analytics/overview
 *
 * Returns overview metrics for consultant dashboard
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOverviewMetrics } from '@/lib/services/analytics-service'

interface ApiResponse<T> {
  data?: T
  error?: string
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get consultant ID
    const consultantResult = await (supabase as any)
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (consultantResult.error || !consultantResult.data) {
      return NextResponse.json<ApiResponse<never>>(
        { error: 'Consultant not found' },
        { status: 404 }
      )
    }

    const consultantId = consultantResult.data.id

    // Get metrics
    const result = await getOverviewMetrics(consultantId)

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<typeof result.data>>({
      data: result.data,
    })
  } catch (error) {
    console.error('Error in overview analytics:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
