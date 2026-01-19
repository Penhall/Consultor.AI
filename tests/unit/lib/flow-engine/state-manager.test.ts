import { describe, it, expect } from 'vitest'
import {
  initializeState,
  replaceVariables,
  setVariable,
  setVariables,
  recordResponse,
  moveToStep,
  getConversationContext,
  isConversationComplete,
} from '@/lib/flow-engine/state-manager'

describe('State Manager', () => {
  it('inicializa estado com step inicial e estruturas vazias', () => {
    const state = initializeState('inicio')
    expect(state.currentStepId).toBe('inicio')
    expect(state.variables).toEqual({})
    expect(state.responses).toEqual({})
    expect(state.history).toEqual([])
  })

  it('substitui variáveis em texto', () => {
    const state = {
      currentStepId: 'inicio',
      variables: { nome: 'João', dados: { idade: 30 } },
      responses: {},
      history: [],
    }
    const text = 'Olá, {{nome}}! Idade: {{dados.idade}}'
    expect(replaceVariables(text, state)).toBe('Olá, João! Idade: 30')
  })

  it('setVariable e setVariables atualizam state', () => {
    const state = initializeState('inicio')
    const next = setVariable(state, 'perfil', 'individual')
    const merged = setVariables(next, { idade: '31-45', coparticipacao: 'nao' })
    expect(merged.variables.perfil).toBe('individual')
    expect(merged.variables.idade).toBe('31-45')
    expect(merged.variables.coparticipacao).toBe('nao')
  })

  it('recordResponse adiciona resposta e histórico', () => {
    const state = initializeState('inicio')
    const next = recordResponse(state, 'pergunta_perfil', 'individual')
    expect(next.responses.pergunta_perfil).toBe('individual')
    expect(next.history[0].stepId).toBe('pergunta_perfil')
    expect(next.history[0].response).toBe('individual')
  })

  it('moveToStep registra transição', () => {
    const state = initializeState('inicio')
    const next = moveToStep(state, 'proximo')
    expect(next.currentStepId).toBe('proximo')
    expect(next.history[0].stepId).toBe('proximo')
  })

  it('getConversationContext resume variáveis e respostas', () => {
    const state = {
      currentStepId: 'x',
      variables: { perfil: 'individual' },
      responses: { pergunta_idade: '31-45' },
      history: [{ stepId: 'pergunta_idade', timestamp: new Date().toISOString() }],
    }
    const ctx = getConversationContext(state)
    expect(ctx.variables.perfil).toBe('individual')
    expect(ctx.responses.pergunta_idade).toBe('31-45')
    expect(ctx.stepCount).toBe(1)
    expect(ctx.lastStep).toBe('pergunta_idade')
  })

  it('isConversationComplete retorna true quando não há próximo step', () => {
    expect(isConversationComplete({} as any, false)).toBe(true)
    expect(isConversationComplete({} as any, true)).toBe(false)
  })
})
