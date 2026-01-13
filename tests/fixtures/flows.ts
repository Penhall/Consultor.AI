/**
 * Test Fixtures: Flows
 * Mock data para fluxos de conversação
 */

export const mockFlowHealthBasic = {
  id: 'flow-health-basic',
  nome: 'Qualificação Saúde Básica',
  versao: '1.0.0',
  vertical: 'saude',
  etapas: [
    {
      id: 'inicio',
      tipo: 'mensagem' as const,
      mensagem: 'Olá! Sou assistente virtual. Vou te ajudar a encontrar o plano ideal.',
      proxima: 'perfil',
    },
    {
      id: 'perfil',
      tipo: 'escolha' as const,
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
      tipo: 'escolha' as const,
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
      tipo: 'escolha' as const,
      pergunta: 'Prefere plano com coparticipação?',
      opcoes: [
        { texto: 'Sim (mensalidade menor, paga consultas)', valor: 'sim', proxima: 'gerar_resposta' },
        { texto: 'Não (mensalidade maior, sem custos extras)', valor: 'nao', proxima: 'gerar_resposta' },
      ],
    },
    {
      id: 'gerar_resposta',
      tipo: 'executar' as const,
      acao: 'gerar_resposta_ia',
      parametros: {},
      proxima: null,
    },
  ],
}

export const mockFlowCircular = {
  id: 'flow-circular-invalid',
  nome: 'Fluxo Circular (Inválido)',
  versao: '1.0.0',
  vertical: 'saude',
  etapas: [
    {
      id: 'step1',
      tipo: 'mensagem' as const,
      mensagem: 'Passo 1',
      proxima: 'step2',
    },
    {
      id: 'step2',
      tipo: 'mensagem' as const,
      mensagem: 'Passo 2',
      proxima: 'step1', // Circular reference!
    },
  ],
}

export const mockFlowMissingReference = {
  id: 'flow-missing-ref-invalid',
  nome: 'Fluxo com Referência Inválida',
  versao: '1.0.0',
  vertical: 'saude',
  etapas: [
    {
      id: 'step1',
      tipo: 'mensagem' as const,
      mensagem: 'Passo 1',
      proxima: 'nonexistent-step', // Missing reference!
    },
  ],
}
