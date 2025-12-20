/**
 * Lead Statistics API Route
 *
 * GET /api/leads/stats - Get lead statistics for the authenticated consultant
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLeadStats } from '@/lib/services/lead-service'
import type { ApiResponse } from '@/types/api'

type LeadStats = {
  total: number
  byStatus: Record<string, number>
  thisMonth: number
  averageScore: number | null
}

/**
 * GET /api/leads/stats
 *
 * Get lead statistics including total, by status, monthly count, and average score
 */
export async function GET(_request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      )
    }

    // Get consultant profile
    const consultantResult = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (consultantResult.error || !consultantResult.data) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Perfil de consultor não encontrado',
        },
        { status: 404 }
      )
    }

    // Get stats
    const result = await getLeadStats((consultantResult as any).data.id as string)

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<LeadStats>>(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/leads/stats:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
