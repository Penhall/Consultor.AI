/**
 * Test Fixtures: Flows
 * Mock data para fluxos de conversação
 *
 * Schema esperado por FlowDefinition:
 * - versao: string
 * - inicio: string (ID do primeiro passo)
 * - passos: FlowStep[]
 */

import type { FlowDefinition } from '@/lib/flow-engine/types'

export const mockFlowHealthBasic: FlowDefinition = {
  versao: '1.0.0',
  inicio: 'inicio',
  passos: [
    {
      id: 'inicio',
      tipo: 'mensagem',
      mensagem: 'Olá! Sou assistente virtual. Vou te ajudar a encontrar o plano ideal.',
      proxima: 'perfil',
    },
    {
      id: 'perfil',
      tipo: 'escolha',
      pergunta: 'Qual seu perfil?',
      opcoes: [
        { texto: 'Individual', valor: 'individual', proxima: 'idade' },
        { texto: 'Casal', valor: 'casal', proxima: 'idade' },
        { texto: 'Família', valor: 'familia', proxima: 'idade' },
        { texto: 'Empresa', valor: 'empresa', proxima: 'idade' },
      ],
    },
    {
      id: 'idade',
      tipo: 'escolha',
      pergunta: 'Qual sua faixa etária?',
      opcoes: [
        { texto: 'Até 30 anos', valor: 'ate_30', proxima: 'coparticipacao' },
        { texto: '31 a 45 anos', valor: '31-45', proxima: 'coparticipacao' },
        { texto: '46 a 60 anos', valor: '46-60', proxima: 'coparticipacao' },
        { texto: 'Acima de 60', valor: 'acima_60', proxima: 'coparticipacao' },
      ],
    },
    {
      id: 'coparticipacao',
      tipo: 'escolha',
      pergunta: 'Prefere plano com coparticipação?',
      opcoes: [
        { texto: 'Sim (mensalidade menor, paga consultas)', valor: 'sim', proxima: 'gerar_resposta' },
        { texto: 'Não (mensalidade maior, sem custos extras)', valor: 'nao', proxima: 'gerar_resposta' },
      ],
    },
    {
      id: 'gerar_resposta',
      tipo: 'executar',
      acao: 'gerar_resposta_ia',
      parametros: {},
      proxima: null,
    },
  ],
}

export const mockFlowCircular: FlowDefinition = {
  versao: '1.0.0',
  inicio: 'step1',
  passos: [
    {
      id: 'step1',
      tipo: 'mensagem',
      mensagem: 'Passo 1',
      proxima: 'step2',
    },
    {
      id: 'step2',
      tipo: 'mensagem',
      mensagem: 'Passo 2',
      proxima: 'step1', // Circular reference!
    },
  ],
}

export const mockFlowMissingReference: FlowDefinition = {
  versao: '1.0.0',
  inicio: 'step1',
  passos: [
    {
      id: 'step1',
      tipo: 'mensagem',
      mensagem: 'Passo 1',
      proxima: 'nonexistent-step', // Missing reference!
    },
  ],
}

// Aliases para compatibilidade com testes antigos que usavam formato diferente
export const mockDefaultFlow = mockFlowHealthBasic

// Flow mínimo para testes simples
export const mockMinimalFlow: FlowDefinition = {
  versao: '1.0.0',
  inicio: 'inicio',
  passos: [
    {
      id: 'inicio',
      tipo: 'mensagem',
      mensagem: 'Olá!',
      proxima: null,
    },
  ],
}
