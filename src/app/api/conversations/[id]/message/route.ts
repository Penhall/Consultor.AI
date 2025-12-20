/**
 * Conversation Message API Route
 *
 * POST /api/conversations/[id]/message - Process a user message in a conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processMessage } from '@/lib/flow-engine'
import type { ApiResponse } from '@/types/api'
import { z } from 'zod'

type RouteContext = {
  params: {
    id: string
  }
}

const messageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
})

/**
 * POST /api/conversations/[id]/message
 *
 * Process a user message in an active conversation
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id: conversationId } = context.params

    // Verify conversation belongs to user's consultant profile
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

    // Verify conversation ownership
    const { data: conversation, error: convError } = await (supabase as any)
      .from('conversations')
      .select('id, lead:leads(consultant_id)')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Conversa não encontrada',
        },
        { status: 404 }
      )
    }

    if (conversation.lead.consultant_id !== consultant.id) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Acesso negado',
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = messageSchema.safeParse(body)
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

    // Process message through flow engine
    const result = await processMessage(conversationId, validation.data.message)

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }

    // Save user message
    await (supabase as any)
      .from('messages')
      .insert({
        conversation_id: conversationId,
        direction: 'inbound',
        content: validation.data.message,
        status: 'delivered',
      })

    // Save bot response if it's a message
    if (result.data.response.success && result.data.response.type === 'message') {
      await (supabase as any)
        .from('messages')
        .insert({
          conversation_id: conversationId,
          direction: 'outbound',
          content: result.data.response.message,
          status: 'sent',
        })
    }

    // Mark conversation as completed if done
    if (result.data.conversationComplete) {
      await (supabase as any)
        .from('conversations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
    }

    return NextResponse.json<ApiResponse<typeof result.data>>(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/conversations/[id]/message:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
