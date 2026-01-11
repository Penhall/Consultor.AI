import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FlowEngine } from '@/lib/flow-engine';
import { autoCreateLead } from '@/lib/services/lead-auto-create';
import { generateAIResponse } from '@/lib/services/ai-service';

/**
 * Mock Webhook Endpoint
 *
 * Simula o webhook do WhatsApp para testes locais.
 * Permite desenvolver e testar o flow engine sem depender da API do Meta.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, text, timestamp } = body;

    if (!from || !text) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: from, text' },
        { status: 400 }
      );
    }

    console.log('📱 [MOCK] Mensagem recebida:', { from, text });

    const supabase = await createClient();

    // Usar consultant_id mock (primeiro consultor do banco)
    const { data: consultant } = await supabase
      .from('consultants')
      .select('id, name')
      .limit(1)
      .single();

    if (!consultant) {
      return NextResponse.json(
        { error: 'Nenhum consultor encontrado. Crie um consultor primeiro.' },
        { status: 404 }
      );
    }

    const consultantId = consultant.id;

    // 1. Buscar ou criar lead
    let { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('whatsapp_number', from)
      .eq('consultant_id', consultantId)
      .single();

    if (!lead) {
      console.log('🆕 [MOCK] Auto-criando lead...');
      lead = await autoCreateLead({
        whatsappNumber: from,
        consultantId,
        initialMessage: text,
      });
    }

    // 2. Buscar ou criar conversation
    let { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('status', 'active')
      .single();

    if (!conversation) {
      // Buscar flow padrão de saúde
      const { data: flow } = await supabase
        .from('flows')
        .select('*')
        .eq('vertical', 'saude')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!flow) {
        return NextResponse.json(
          { error: 'Nenhum flow ativo encontrado' },
          { status: 404 }
        );
      }

      // Criar nova conversation
      const { data: newConversation } = await supabase
        .from('conversations')
        .insert({
          lead_id: lead.id,
          flow_id: flow.id,
          state: { currentStepId: null, variables: {} },
          status: 'active',
        })
        .select()
        .single();

      conversation = newConversation;
    }

    // 3. Salvar mensagem recebida
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      direction: 'inbound',
      content: text,
      whatsapp_message_id: `mock_${timestamp}`,
      status: 'delivered',
    });

    // 4. Processar com Flow Engine
    const { data: flow } = await supabase
      .from('flows')
      .select('*')
      .eq('id', conversation.flow_id)
      .single();

    if (!flow) {
      return NextResponse.json(
        { error: 'Flow não encontrado' },
        { status: 404 }
      );
    }

    const flowEngine = new FlowEngine(flow.definition);
    const currentState = conversation.state as {
      currentStepId: string | null;
      variables: Record<string, any>;
    };

    // Processar mensagem
    const result = await flowEngine.processMessage(
      text,
      currentState.currentStepId,
      currentState.variables
    );

    // 5. Atualizar estado da conversation
    await supabase
      .from('conversations')
      .update({
        state: {
          currentStepId: result.nextStepId,
          variables: result.variables,
        },
      })
      .eq('id', conversation.id);

    // 6. Preparar resposta
    let responseText = result.response;
    let buttons: Array<{ id: string; title: string }> | undefined;

    // Se for uma ação de IA, gerar resposta
    if (result.action === 'gerar_resposta_ia') {
      console.log('🤖 [MOCK] Gerando resposta com IA...');
      const aiResponse = await generateAIResponse({
        leadData: {
          profile: result.variables.perfil,
          ageRange: result.variables.faixa_etaria,
          coparticipation: result.variables.coparticipacao,
        },
        conversationHistory: [
          { role: 'user', content: text },
        ],
      });

      responseText = aiResponse;

      // Marcar conversa como completa
      await supabase
        .from('conversations')
        .update({ status: 'completed' })
        .eq('id', conversation.id);

      // Atualizar lead com dados coletados
      await supabase
        .from('leads')
        .update({
          status: 'qualificado',
          metadata: {
            ...lead.metadata,
            perfil: result.variables.perfil,
            faixa_etaria: result.variables.faixa_etaria,
            coparticipacao: result.variables.coparticipacao,
            qualificado_em: new Date().toISOString(),
          },
          score: calculateScore(result.variables),
        })
        .eq('id', lead.id);
    }

    // Se houver opções de escolha, transformar em botões
    if (result.choices && result.choices.length > 0) {
      buttons = result.choices.map((choice) => ({
        id: choice.value,
        title: choice.label,
      }));
    }

    // 7. Salvar resposta do bot
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      content: responseText,
      whatsapp_message_id: `mock_response_${Date.now()}`,
      status: 'sent',
    });

    console.log('✅ [MOCK] Resposta gerada:', { responseText, buttons });

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
    });
  } catch (error) {
    console.error('❌ [MOCK] Erro ao processar mensagem:', error);
    return NextResponse.json(
      {
        error: 'Erro ao processar mensagem',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Calcula score do lead baseado nas respostas
 */
function calculateScore(variables: Record<string, any>): number {
  let score = 50; // Base score

  // Score por perfil
  const profileScores: Record<string, number> = {
    individual: 10,
    casal: 15,
    familiar: 20,
    empresarial: 25,
  };
  score += profileScores[variables.perfil?.toLowerCase()] || 0;

  // Score por faixa etária (mais velho = maior interesse geralmente)
  const ageScores: Record<string, number> = {
    'até 30 anos': 5,
    '31 a 45 anos': 10,
    '46 a 60 anos': 15,
    'acima de 60 anos': 20,
  };
  score += ageScores[variables.faixa_etaria?.toLowerCase()] || 0;

  // Score por coparticipação (não = maior poder aquisitivo)
  if (variables.coparticipacao?.toLowerCase() === 'não') {
    score += 15;
  } else {
    score += 5;
  }

  return Math.min(score, 100); // Max 100
}
