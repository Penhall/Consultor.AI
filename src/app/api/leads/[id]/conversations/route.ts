/**
 * Lead Conversations API Routes
 *
 * GET /api/leads/[id]/conversations - Get all conversations for a lead with messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types/api'
import type { Database } from '@/types/database'

type Conversation = Database['public']['Tables']['conversations']['Row']
type Message = Database['public']['Tables']['messages']['Row']

type ConversationWithMessages = Conversation & {
  messages: Message[]
}

type RouteContext = {
  params: {
    id: string
  }
}

/**
 * GET /api/leads/[id]/conversations
 *
 * Get all conversations for a lead, including messages
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<ConversationWithMessages[]>>> {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      )
    }

    const { id: leadId } = context.params

    // First verify the lead belongs to the consultant (via RLS)
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        {
          success: false,
          error: 'Lead não encontrado',
        },
        { status: 404 }
      )
    }

    // Get all conversations for this lead
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao buscar conversas',
        },
        { status: 500 }
      )
    }

    // For each conversation, get its messages
    const conversationsWithMessages: ConversationWithMessages[] = []
    const conversationList = (conversations || []) as Conversation[]

    for (const conv of conversationList) {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true })

      conversationsWithMessages.push({
        ...conv,
        messages: (messages || []) as Message[],
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: conversationsWithMessages,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/leads/[id]/conversations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
