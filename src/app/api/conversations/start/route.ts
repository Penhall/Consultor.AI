/**
 * Start Conversation API Route
 *
 * POST /api/conversations/start - Start a new conversation flow
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startConversation } from '@/lib/flow-engine'
import type { ApiResponse } from '@/types/api'
import { z } from 'zod'

const startConversationSchema = z.object({
  leadId: z.string().uuid('Invalid lead ID'),
  flowId: z.string().uuid('Invalid flow ID'),
})

/**
 * POST /api/conversations/start
 *
 * Start a new conversation flow for a lead
 */
export async function POST(request: NextRequest) {
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

    const consultant = (consultantResult as any).data

    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = startConversationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { leadId, flowId } = validation.data

    // Verify lead ownership
    const { data: lead, error: leadError } = await (supabase as any)
      .from('leads')
      .select('id, consultant_id')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Lead não encontrado',
        },
        { status: 404 }
      )
    }

    if (lead.consultant_id !== consultant.id) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Acesso negado',
        },
        { status: 403 }
      )
    }

    // Verify flow ownership
    const { data: flow, error: flowError } = await (supabase as any)
      .from('flows')
      .select('id, consultant_id')
      .eq('id', flowId)
      .single()

    if (flowError || !flow) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Fluxo não encontrado',
        },
        { status: 404 }
      )
    }

    // Flows can be owned by consultant or be public (consultant_id = null)
    if (flow.consultant_id && flow.consultant_id !== consultant.id) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Acesso negado ao fluxo',
        },
        { status: 403 }
      )
    }

    // Start conversation
    const result = await startConversation(leadId, flowId)

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }

    // Save initial bot message if it's a message type
    if (result.data.firstStep.success && result.data.firstStep.type === 'message') {
      await (supabase as any)
        .from('messages')
        .insert({
          conversation_id: result.data.conversationId,
          direction: 'outbound',
          content: result.data.firstStep.message,
          status: 'sent',
        })
    }

    return NextResponse.json<ApiResponse<typeof result.data>>(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/conversations/start:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
