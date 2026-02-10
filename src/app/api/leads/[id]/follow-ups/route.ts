/**
 * Lead Follow-ups API Routes
 *
 * GET  /api/leads/[id]/follow-ups - List follow-ups for a lead
 * POST /api/leads/[id]/follow-ups - Create a new follow-up
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  listFollowUpsByLead,
  createFollowUp,
  type FollowUp,
  type CreateFollowUpInput,
} from '@/lib/services/follow-up-service'
import type { ApiResponse } from '@/types/api'
import type { Database } from '@/types/database'

type RouteContext = {
  params: {
    id: string
  }
}

/**
 * GET /api/leads/[id]/follow-ups
 *
 * List all follow-ups for a lead
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<FollowUp[]>>> {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    const { id: leadId } = context.params

    // Verify the lead exists and belongs to the consultant
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { success: false, error: 'Lead nao encontrado' },
        { status: 404 }
      )
    }

    const result = await listFollowUpsByLead(leadId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/leads/[id]/follow-ups:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/leads/[id]/follow-ups
 *
 * Create a new follow-up for a lead
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<FollowUp>>> {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    // Get consultant profile
    type ConsultantRow = Database['public']['Tables']['consultants']['Row']
    const { data: consultantData, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    const consultant = consultantData as Pick<ConsultantRow, 'id'> | null

    if (consultantError || !consultant) {
      return NextResponse.json(
        { success: false, error: 'Consultor nao encontrado' },
        { status: 404 }
      )
    }

    const { id: leadId } = context.params
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.scheduled_at) {
      return NextResponse.json(
        { success: false, error: 'Titulo e data de agendamento sao obrigatorios' },
        { status: 400 }
      )
    }

    const input: CreateFollowUpInput = {
      lead_id: leadId,
      title: body.title,
      message: body.message,
      notes: body.notes,
      scheduled_at: body.scheduled_at,
      reminder_at: body.reminder_at,
      is_automatic: body.is_automatic || false,
      auto_send: body.auto_send || false,
    }

    const result = await createFollowUp(consultant.id, input)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/leads/[id]/follow-ups:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
