/**
 * Flow Engine Tests
 */

import { describe, it, expect } from 'vitest'
import { FlowEngine } from '@/lib/flow-engine'
import type { FlowDefinition } from '@/lib/flow-engine/types'

const baseFlow: FlowDefinition = {
  versao: '1.0',
  inicio: 'boas_vindas',
  passos: [
    {
      id: 'boas_vindas',
      tipo: 'mensagem',
      mensagem: 'Olá! Bem-vindo!',
      proxima: 'pergunta',
    },
    {
      id: 'pergunta',
      tipo: 'escolha',
      pergunta: 'Prefere opção A ou B?',
      opcoes: [
        { texto: 'Opção A', valor: 'a', proxima: 'final' },
        { texto: 'Opção B', valor: 'b', proxima: 'final' },
      ],
    },
    {
      id: 'final',
      tipo: 'mensagem',
      mensagem: 'Obrigado! Encerrando.',
      proxima: null,
    },
  ],
}

describe('Flow Engine', () => {
  it('deve iniciar fluxo com mensagem inicial e avançar', () => {
    const engine = new FlowEngine(baseFlow)

    const result = engine.processMessage('olá', null, {})

    expect(result.response).toContain('Bem-vindo')
    expect(result.nextStepId).toBe('pergunta')
  })

  it('deve retornar opções quando escolha não é reconhecida', () => {
    const engine = new FlowEngine(baseFlow)

    const result = engine.processMessage('valor-invalido', 'pergunta', {})

    expect(result.choices).toBeDefined()
    expect(result.choices?.length).toBe(2)
    expect(result.nextStepId).toBe('pergunta')
  })

  it('deve seguir para próximo passo após escolha válida', () => {
    const engine = new FlowEngine(baseFlow)

    const result = engine.processMessage('a', 'pergunta', {})

    expect(result.response).toContain('Obrigado')
    expect(result.nextStepId).toBeNull()
    expect(result.variables['pergunta']).toBe('a')
  })

  it('deve sinalizar ação quando step for executar', () => {
    const flowWithAction: FlowDefinition = {
      versao: '1.0',
      inicio: 'acao',
      passos: [
        {
          id: 'acao',
          tipo: 'executar',
          acao: 'gerar_resposta_ia',
          proxima: 'mensagem',
        },
        {
          id: 'mensagem',
          tipo: 'mensagem',
          mensagem: 'Seguimos.',
          proxima: null,
        },
      ],
    }

    const engine = new FlowEngine(flowWithAction)
    const result = engine.processMessage('oi', null, {})

    expect(result.action).toBe('gerar_resposta_ia')
    expect(result.nextStepId).toBe('mensagem')
  })
})
