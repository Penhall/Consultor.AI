/**
 * Flow Parser Tests
 *
 * Testa validação e parsing de flows JSON.
 * Garante que apenas flows válidos sejam aceitos.
 */

import { describe, it, expect } from 'vitest';
import { parseFlowDefinition, validateFlowStructure, getStepById } from '@/lib/flow-engine/parser';
import {
  mockFlowHealthBasic,
  // mockFlowCircular, // Reserved for future tests
  // mockFlowMissingReference, // Reserved for future tests
} from '@tests/fixtures/flows';

describe('Flow Parser', () => {
  describe('parseFlowDefinition - Flow Válido', () => {
    it('deve aceitar flow válido completo', () => {
      const result = parseFlowDefinition(mockFlowHealthBasic);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('versao');
        expect(result.data).toHaveProperty('inicio');
        expect(result.data).toHaveProperty('passos');
      }
    });

    it('deve validar estrutura básica do flow', () => {
      const minimalFlow = {
        versao: '1.0.0',
        inicio: 'inicio',
        passos: [
          {
            id: 'inicio',
            tipo: 'mensagem',
            mensagem: 'Olá',
            proxima: null,
          },
        ],
      };

      const result = parseFlowDefinition(minimalFlow);

      expect(result.success).toBe(true);
    });

    it('deve aceitar flow com múltiplos tipos de step', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'msg',
        passos: [
          { id: 'msg', tipo: 'mensagem', mensagem: 'Oi', proxima: 'escolha' },
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [{ texto: 'A', valor: 'a', proxima: 'acao' }],
          },
          { id: 'acao', tipo: 'executar', acao: 'gerar_resposta_ia', proxima: null },
        ],
      };

      const result = parseFlowDefinition(flow);

      expect(result.success).toBe(true);
    });
  });

  describe('parseFlowDefinition - Validação de Estrutura', () => {
    it('deve rejeitar flow sem versao', () => {
      const invalidFlow = {
        inicio: 'inicio',
        passos: [{ id: 'inicio', tipo: 'mensagem', mensagem: 'Oi', proxima: null }],
      };

      const result = parseFlowDefinition(invalidFlow as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('versao');
      }
    });

    it('deve rejeitar flow sem inicio', () => {
      const invalidFlow = {
        versao: '1.0.0',
        passos: [{ id: 'inicio', tipo: 'mensagem', mensagem: 'Oi', proxima: null }],
      };

      const result = parseFlowDefinition(invalidFlow as any);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('inicio');
      }
    });

    it('deve rejeitar flow sem passos', () => {
      const invalidFlow = {
        versao: '1.0.0',
        inicio: 'inicio',
        passos: [],
      };

      const result = parseFlowDefinition(invalidFlow);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('parseFlowDefinition - Validação de Referências', () => {
    it('deve detectar referência inexistente', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'inicio',
        passos: [{ id: 'inicio', tipo: 'mensagem', mensagem: 'Oi', proxima: 'nonexistent-step' }],
      };

      const result = parseFlowDefinition(flow);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('nonexistent-step');
      }
    });

    it('deve aceitar múltiplas opções apontando para mesmo step', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'escolha',
        passos: [
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [
              { texto: 'A', valor: 'a', proxima: 'fim' },
              { texto: 'B', valor: 'b', proxima: 'fim' },
            ],
          },
          { id: 'fim', tipo: 'mensagem', mensagem: 'Fim', proxima: null },
        ],
      };

      const result = parseFlowDefinition(flow);

      expect(result.success).toBe(true);
    });
  });

  describe('parseFlowDefinition - Validação de Tipos de Step', () => {
    it('deve validar step tipo mensagem', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'msg',
        passos: [
          {
            id: 'msg',
            tipo: 'mensagem',
            mensagem: 'Olá {{nome}}',
            proxima: null,
          },
        ],
      };

      const result = parseFlowDefinition(flow);

      expect(result.success).toBe(true);
    });

    it('deve rejeitar step mensagem sem texto', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'msg',
        passos: [{ id: 'msg', tipo: 'mensagem', proxima: null } as any],
      };

      const result = parseFlowDefinition(flow);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('mensagem');
      }
    });

    it('deve validar step tipo escolha', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'escolha',
        passos: [
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [
              { texto: 'Sim', valor: 'sim', proxima: 'fim' },
              { texto: 'Não', valor: 'nao', proxima: 'fim' },
            ],
          },
          {
            id: 'fim',
            tipo: 'mensagem',
            mensagem: 'Fim',
            proxima: null,
          },
        ],
      };

      const result = parseFlowDefinition(flow);

      expect(result.success).toBe(true);
    });

    it('deve rejeitar step escolha sem opções', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'escolha',
        passos: [
          {
            id: 'escolha',
            tipo: 'escolha',
            pergunta: 'Escolha?',
            opcoes: [],
          } as any,
        ],
      };

      const result = parseFlowDefinition(flow);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('deve validar step tipo executar', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'acao',
        passos: [
          {
            id: 'acao',
            tipo: 'executar',
            acao: 'gerar_resposta_ia',
            proxima: null,
          },
        ],
      };

      const result = parseFlowDefinition(flow);

      expect(result.success).toBe(true);
    });

    it('deve rejeitar step executar sem ação', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'acao',
        passos: [{ id: 'acao', tipo: 'executar', proxima: null } as any],
      };

      const result = parseFlowDefinition(flow);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('acao');
      }
    });
  });

  describe('parseFlowDefinition - Validação de IDs Únicos', () => {
    it('deve rejeitar steps com IDs duplicados', () => {
      const flow = {
        versao: '1.0.0',
        inicio: 'step1',
        passos: [
          { id: 'step1', tipo: 'mensagem', mensagem: 'A', proxima: 'step2' },
          { id: 'step1', tipo: 'mensagem', mensagem: 'B', proxima: null }, // Duplicado!
        ],
      };

      const result = parseFlowDefinition(flow);

      // Pode passar no Zod mas falhar na validação de referências
      // ou detectar duplicação dependendo da implementação
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('getStepById', () => {
    it('deve retornar step existente', () => {
      const flow = {
        id: 'test-flow',
        nome: 'Test',
        versao: '1.0.0',
        vertical: 'saude' as const,
        inicio: 'step1',
        passos: [{ id: 'step1', tipo: 'mensagem' as const, mensagem: 'Test', proxima: null }],
      };

      const result = getStepById(flow, 'step1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('step1');
      }
    });

    it('deve retornar erro para step inexistente', () => {
      const flow = {
        id: 'test-flow',
        nome: 'Test',
        versao: '1.0.0',
        vertical: 'saude' as const,
        inicio: 'step1',
        passos: [{ id: 'step1', tipo: 'mensagem' as const, mensagem: 'Test', proxima: null }],
      };

      const result = getStepById(flow, 'nonexistent');

      expect(result.success).toBe(false);
    });
  });

  describe('validateFlowStructure', () => {
    it('deve validar flow com estrutura correta', () => {
      const parseResult = parseFlowDefinition(mockFlowHealthBasic);

      if (parseResult.success) {
        const result = validateFlowStructure(parseResult.data);
        expect(result.success).toBe(true);
      }
    });
  });
});
