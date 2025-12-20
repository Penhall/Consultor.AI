/**
 * Analytics Activity API
 * GET /api/analytics/activity
 *
 * Returns recent activity and top leads
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getRecentActivity,
  getTopLeads,
} from '@/lib/services/analytics-service'

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

    // Get activity data in parallel
    const [recentResult, topResult] = await Promise.all([
      getRecentActivity(consultantId),
      getTopLeads(consultantId, 5),
    ])

    if (!recentResult.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: recentResult.error },
        { status: 500 }
      )
    }

    if (!topResult.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: topResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json<
      ApiResponse<{
        recent: typeof recentResult.data
        topLeads: typeof topResult.data
      }>
    >({
      data: {
        recent: recentResult.data,
        topLeads: topResult.data,
      },
    })
  } catch (error) {
    console.error('Error in activity analytics:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
