import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { FlowEngine } from '@/lib/flow-engine'
import { getOrCreateLead } from '@/lib/services/lead-auto-create'
import { generateContextualResponse } from '@/lib/services/ai-service'
import type { Database } from '@/types/database'
import type { ConversationState } from '@/lib/flow-engine/types'

type Lead = Database['public']['Tables']['leads']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']
type Flow = Database['public']['Tables']['flows']['Row']

/**
 * Mock Webhook Endpoint
 *
 * Simula o webhook do WhatsApp para testes locais.
 * Permite desenvolver e testar o flow engine sem depender da API do Meta.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { from, text, timestamp } = body

    if (!from || !text) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: from, text' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: consultant } = await (supabase as any)
      .from('consultants')
      .select('id, name, vertical, business_name')
      .limit(1)
      .single()

    if (!consultant) {
      return NextResponse.json(
        { error: 'Nenhum consultor encontrado. Crie um consultor primeiro.' },
        { status: 404 }
      )
    }

    const consultantId = consultant.id

    const leadResult = await getOrCreateLead(consultantId, from, text)
    if (!leadResult.success) {
      return NextResponse.json({ error: leadResult.error }, { status: 500 })
    }
    const lead: Lead = leadResult.data.lead

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data: conversation } = await (supabase as any)
      .from('conversations')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('status', 'active')
      .single() as { data: Conversation | null }

    if (!conversation) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: flow } = await (supabase as any)
        .from('flows')
        .select('*')
        .eq('vertical', 'saude')
        .eq('is_active', true)
        .limit(1)
        .single() as { data: Flow | null }

      if (!flow) {
        return NextResponse.json(
          { error: 'Nenhum flow ativo encontrado' },
          { status: 404 }
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newConversation, error: insertError } = await (supabase as any)
        .from('conversations')
        .insert({
          lead_id: lead.id,
          flow_id: flow.id,
          state: { currentStepId: null, variables: {}, responses: {} },
          status: 'active',
        })
        .select()
        .single() as { data: Conversation | null; error: Error | null }

      if (insertError || !newConversation) {
        return NextResponse.json(
          { error: 'Falha ao criar nova conversa' },
          { status: 500 }
        )
      }
      conversation = newConversation
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('messages').insert({
      conversation_id: conversation.id,
      direction: 'inbound',
      content: text,
      whatsapp_message_id: `mock_${timestamp}`,
      status: 'delivered',
    })

    if (!conversation.flow_id) {
      return NextResponse.json(
        { error: 'Conversa sem flow associado' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: flow } = await (supabase as any)
      .from('flows')
      .select('*')
      .eq('id', conversation.flow_id)
      .single() as { data: Flow | null }

    if (!flow || !flow.definition) {
      return NextResponse.json(
        { error: 'Flow não encontrado ou inválido' },
        { status: 404 }
      )
    }

    const flowEngine = new FlowEngine(flow.definition)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flowDef = flow.definition as any
    const rawState = conversation.state as Partial<ConversationState> | null
    const currentState: ConversationState = {
      currentStepId: rawState?.currentStepId ?? flowDef?.inicio ?? '',
      variables: rawState?.variables ?? {},
      responses: rawState?.responses ?? {},
      history: rawState?.history ?? [],
    }

    const result = await flowEngine.processMessage(
      text,
      currentState.currentStepId,
      currentState.variables
    )

    const newState: ConversationState = {
      currentStepId: result.nextStepId ?? currentState.currentStepId,
      variables: result.variables as Record<string, unknown>,
      responses: {
        ...currentState.responses,
        ...(result.nextStepId && { [result.nextStepId]: text }),
      },
      history: currentState.history || [],
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('conversations')
      .update({ state: newState })
      .eq('id', conversation.id)

    let responseText = result.response
    let buttons: Array<{ id: string; title: string }> | undefined

    if (result.action === 'gerar_resposta_ia') {
      const aiResponseResult = await generateContextualResponse({
        lead,
        state: newState,
        consultantData: {
          name: consultant.name,
          business_name: consultant.business_name || undefined,
          vertical: consultant.vertical || 'saude',
        },
      })

      if (aiResponseResult.success) {
        responseText = aiResponseResult.data
      } else {
        // Fallback or error logging
        responseText = 'Desculpe, não consegui processar sua solicitação.'
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('conversations')
        .update({ status: 'completed' })
        .eq('id', conversation.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metadata = (lead.metadata || {}) as Record<string, any>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('leads')
        .update({
          status: 'qualificado',
          metadata: {
            ...metadata,
            perfil: result.variables.perfil,
            faixa_etaria: result.variables.faixa_etaria,
            coparticipacao: result.variables.coparticipacao,
            qualificado_em: new Date().toISOString(),
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          score: calculateScore(result.variables as Record<string, any>),
        })
        .eq('id', lead.id)
    }

    if (result.choices && result.choices.length > 0) {
      buttons = result.choices.map((choice) => ({
        id: choice.value,
        title: choice.label,
      }))
    }

    if (responseText) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('messages').insert({
        conversation_id: conversation.id,
        direction: 'outbound',
        content: responseText,
        whatsapp_message_id: `mock_response_${Date.now()}`,
        status: 'sent',
      })
    }

    return NextResponse.json({
      success: true,
      response: {
        text: responseText,
        buttons,
      },
      debug: {
        leadId: lead.id,
        conversationId: conversation.id,
        currentStep: result.nextStepId,
        variables: result.variables,
      },
    })
  } catch (error) {
    // console.error('❌ [MOCK] Erro ao processar mensagem:', error)
    return NextResponse.json(
      {
        error: 'Erro ao processar mensagem',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Calcula score do lead baseado nas respostas
 */
function calculateScore(variables: Record<string, any>): number {
  let score = 50 // Base score

  const profileScores: Record<string, number> = {
    individual: 10,
    casal: 15,
    familiar: 20,
    empresarial: 25,
  }
  score += profileScores[variables.perfil?.toLowerCase()] || 0

  const ageScores: Record<string, number> = {
    'até 30 anos': 5,
    '31 a 45 anos': 10,
    '46 a 60 anos': 15,
    'acima de 60 anos': 20,
  }
  score += ageScores[variables.faixa_etaria?.toLowerCase()] || 0

  if (variables.coparticipacao?.toLowerCase() === 'não') {
    score += 15
  } else {
    score += 5
  }

  return Math.min(score, 100) // Max 100
}
