import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  executeMessageStep,
  executeChoiceStep,
  processChoiceResponse,
  executeActionStep,
} from '@/lib/flow-engine/executors';
import type {
  ChoiceStep,
  ExecuteStep,
  MessageStep,
  ConversationState,
} from '@/lib/flow-engine/types';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            data: { id: 'item', consultant_id: 'c1', name: 'Consultor', vertical: 'saude' },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

vi.mock('@/lib/services/ai-service', () => ({
  generateContextualResponse: vi.fn().mockResolvedValue({ success: true, data: 'Resposta AI' }),
  getFallbackResponse: vi.fn().mockReturnValue('Fallback'),
}));

describe('Step Executors', () => {
  const baseState: ConversationState = {
    currentStepId: 'inicio',
    variables: { nome: 'João' },
    responses: {},
    history: [],
  };

  it('executeMessageStep substitui variáveis', () => {
    const step: MessageStep = {
      id: 'msg',
      tipo: 'mensagem',
      mensagem: 'Olá, {{nome}}',
      proxima: 'next',
    };
    const result = executeMessageStep(step, baseState);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.type).toBe('message');
      if (result.type === 'message') {
        expect(result.message).toBe('Olá, João');
        expect(result.nextStepId).toBe('next');
      }
    }
  });

  it('executeChoiceStep retorna pergunta e opções', () => {
    const step: ChoiceStep = {
      id: 'pergunta',
      tipo: 'escolha',
      pergunta: 'Qual perfil?',
      opcoes: [
        { texto: 'Individual', valor: 'individual', proxima: 'fim' },
        { texto: 'Familia', valor: 'familia', proxima: 'fim' },
      ],
    };
    const result = executeChoiceStep(step, baseState);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.type).toBe('choice');
      if (result.type === 'choice') {
        expect(result.options).toHaveLength(2);
        expect(result.options[0]!.value).toBe('individual');
      }
    }
  });

  it('processChoiceResponse valida e avança', () => {
    const step: ChoiceStep = {
      id: 'pergunta',
      tipo: 'escolha',
      pergunta: 'Qual perfil?',
      opcoes: [
        { texto: 'Individual', valor: 'individual', proxima: 'fim' },
        { texto: 'Familia', valor: 'familia', proxima: 'fim' },
      ],
    };
    const result = processChoiceResponse(step, baseState, 'individual');
    expect(result.success).toBe(true);
    expect(result.nextStepId).toBe('fim');
    expect(result.nextState?.variables.pergunta).toBe('individual');
  });

  it('processChoiceResponse retorna erro para opção inválida', () => {
    const step: ChoiceStep = {
      id: 'pergunta',
      tipo: 'escolha',
      pergunta: 'Qual perfil?',
      opcoes: [{ texto: 'A', valor: 'a', proxima: 'fim' }],
    };
    const result = processChoiceResponse(step, baseState, 'invalido');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid choice');
  });

  it('executeActionStep executa ação de IA e retorna action_complete', async () => {
    const step: ExecuteStep = {
      id: 'acao',
      tipo: 'executar',
      acao: 'gerar_resposta_ia',
      proxima: 'mensagem',
    };
    const result = await executeActionStep(step, baseState, {
      conversationId: 'conv1',
      leadId: 'lead1',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.type).toBe('action_complete');
      if (result.type === 'action_complete') {
        expect(result.nextStepId).toBe('mensagem');
      }
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });
});
