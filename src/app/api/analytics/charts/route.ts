/**
 * Analytics Charts API
 * GET /api/analytics/charts
 *
 * Returns chart data for dashboard visualizations
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getLeadsByStatus,
  getTimeSeriesData,
  getProfileDistribution,
} from '@/lib/services/analytics-service'

interface ApiResponse<T> {
  data?: T
  error?: string
}

export async function GET(request: NextRequest) {
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

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')

    // Get all chart data in parallel
    const [statusResult, timeSeriesResult, profileResult] = await Promise.all([
      getLeadsByStatus(consultantId),
      getTimeSeriesData(consultantId, days),
      getProfileDistribution(consultantId),
    ])

    // Check for errors
    if (!statusResult.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: statusResult.error },
        { status: 500 }
      )
    }

    if (!timeSeriesResult.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: timeSeriesResult.error },
        { status: 500 }
      )
    }

    if (!profileResult.success) {
      return NextResponse.json<ApiResponse<never>>(
        { error: profileResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json<
      ApiResponse<{
        leadsByStatus: typeof statusResult.data
        timeSeries: typeof timeSeriesResult.data
        profileDistribution: typeof profileResult.data
      }>
    >({
      data: {
        leadsByStatus: statusResult.data,
        timeSeries: timeSeriesResult.data,
        profileDistribution: profileResult.data,
      },
    })
  } catch (error) {
    console.error('Error in charts analytics:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
