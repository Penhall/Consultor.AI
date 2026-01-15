/**
 * Flow Parser Tests
 *
 * Testa validação e parsing de flows JSON.
 * Garante que apenas flows válidos sejam aceitos.
 */

import { describe, it, expect } from 'vitest'
import { validateFlowDefinition } from '@/lib/flow-engine/parser'
import {
  mockFlowHealthBasic,
  mockFlowCircular,
  mockFlowMissingReference
} from '@tests/fixtures/flows'

describe('Flow Parser', () => {
  describe('Flow Válido', () => {
    it('deve aceitar flow válido completo', () => {
      const result = validateFlowDefinition(mockFlowHealthBasic)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('deve validar estrutura básica do flow', () => {
      const minimalFlow = {
        id: 'flow-minimal',
        nome: 'Flow Mínimo',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'inicio',
            tipo: 'mensagem',
            mensagem: 'Olá',
            proxima: null,
          },
        ],
      }

      const result = validateFlowDefinition(minimalFlow)

      expect(result.valid).toBe(true)
    })

    it('deve aceitar flow com múltiplos tipos de step', () => {
      const flow = {
        id: 'flow-mixed',
        nome: 'Flow Misto',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          { id: 'msg', tipo: 'mensagem', mensagem: 'Oi', proxima: 'escolha' },
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [
              { texto: 'A', valor: 'a', proxima: 'acao' }
            ]
          },
          { id: 'acao', tipo: 'executar', acao: 'gerar_resposta_ia', proxima: null },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })
  })

  describe('Validação de Estrutura', () => {
    it('deve rejeitar flow sem ID', () => {
      const invalidFlow = {
        nome: 'Sem ID',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [],
      }

      const result = validateFlowDefinition(invalidFlow as any)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('id')
      )
    })

    it('deve rejeitar flow sem nome', () => {
      const invalidFlow = {
        id: 'flow-1',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [],
      }

      const result = validateFlowDefinition(invalidFlow as any)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('nome')
      )
    })

    it('deve rejeitar flow sem etapas', () => {
      const invalidFlow = {
        id: 'flow-1',
        nome: 'Sem Etapas',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [],
      }

      const result = validateFlowDefinition(invalidFlow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('etapas')
      )
    })
  })

  describe('Validação de Referências', () => {
    it('deve detectar referência circular', () => {
      const result = validateFlowDefinition(mockFlowCircular)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('circular')
      )
    })

    it('deve detectar referência inexistente', () => {
      const result = validateFlowDefinition(mockFlowMissingReference)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('nonexistent-step')
      )
    })

    it('deve aceitar múltiplas opções apontando para mesmo step', () => {
      const flow = {
        id: 'flow-convergent',
        nome: 'Flow Convergente',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [
              { texto: 'A', valor: 'a', proxima: 'fim' },
              { texto: 'B', valor: 'b', proxima: 'fim' },
            ]
          },
          { id: 'fim', tipo: 'mensagem', mensagem: 'Fim', proxima: null },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })
  })

  describe('Validação de Tipos de Step', () => {
    it('deve validar step tipo mensagem', () => {
      const flow = {
        id: 'flow-msg',
        nome: 'Flow Mensagem',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'msg',
            tipo: 'mensagem',
            mensagem: 'Olá {{nome}}',
            proxima: null
          },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })

    it('deve rejeitar step mensagem sem texto', () => {
      const flow = {
        id: 'flow-invalid-msg',
        nome: 'Invalid',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          { id: 'msg', tipo: 'mensagem', proxima: null } as any,
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('mensagem')
      )
    })

    it('deve validar step tipo escolha', () => {
      const flow = {
        id: 'flow-choice',
        nome: 'Flow Escolha',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [
              { texto: 'Sim', valor: 'sim', proxima: null },
              { texto: 'Não', valor: 'nao', proxima: null },
            ]
          },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })

    it('deve rejeitar step escolha sem opções', () => {
      const flow = {
        id: 'flow-invalid-choice',
        nome: 'Invalid',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: []
          } as any,
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('opcoes')
      )
    })

    it('deve validar step tipo executar', () => {
      const flow = {
        id: 'flow-execute',
        nome: 'Flow Executar',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          {
            id: 'acao',
            tipo: 'executar',
            acao: 'gerar_resposta_ia',
            proxima: null
          },
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(true)
    })

    it('deve rejeitar step executar sem ação', () => {
      const flow = {
        id: 'flow-invalid-execute',
        nome: 'Invalid',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          { id: 'acao', tipo: 'executar', proxima: null } as any,
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('acao')
      )
    })
  })

  describe('Validação de IDs Únicos', () => {
    it('deve rejeitar steps com IDs duplicados', () => {
      const flow = {
        id: 'flow-duplicate-ids',
        nome: 'IDs Duplicados',
        versao: '1.0.0',
        vertical: 'saude',
        etapas: [
          { id: 'step1', tipo: 'mensagem', mensagem: 'A', proxima: 'step2' },
          { id: 'step1', tipo: 'mensagem', mensagem: 'B', proxima: null }, // Duplicado!
        ],
      }

      const result = validateFlowDefinition(flow)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.stringContaining('duplicado')
      )
    })
  })
})
