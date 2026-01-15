/**
 * AI Service Tests - Compliance ANS
 *
 * ⚠️ CRÍTICO: Estes testes garantem que o sistema
 * não viola regulamentações da ANS:
 * - Não pode fornecer preços exatos
 * - Não pode pedir dados sensíveis (CPF, histórico médico)
 * - Não pode fazer promessas ilegais (zero carência, cobertura imediata)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateCompliantResponse } from '@/lib/services/ai-service'

describe('AI Service - Compliance ANS', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Proibição de Preços Exatos', () => {
    it('NÃO deve retornar preços em formato R$ XXX,XX', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'João Silva',
        consultantBio: 'Consultor de saúde há 10 anos',
      })

      // Regex para detectar preços
      const pricePatterns = [
        /R\$\s*\d+[.,]?\d*/gi,       // R$ 1000 ou R$ 1.000,00
        /\d+\s*reais/gi,              // 1000 reais
        /valor\s+de\s+\d+/gi,         // valor de 1000
        /custa\s+\d+/gi,              // custa 1000
        /mensalidade\s+de\s+\d+/gi,   // mensalidade de 1000
      ]

      pricePatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })

    it('PODE usar termos gerais de custo (sem valores)', async () => {
      const leadData = {
        perfil: 'familia',
        idade: '46-60',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Maria Santos',
      })

      // Termos gerais permitidos
      const allowedTerms = [
        'mensalidade',
        'valor',
        'investimento',
        'custo',
        'preço',
      ]

      // Deve mencionar custo de forma geral, mas sem valores exatos
      const mentionsCost = allowedTerms.some(term =>
        response.toLowerCase().includes(term)
      )

      // Pelo menos um termo de custo deve ser mencionado
      expect(mentionsCost).toBe(true)
    })

    it('NÃO deve fornecer faixas de preço', async () => {
      const leadData = {
        perfil: 'empresa',
        idade: 'ate_30',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Pedro Costa',
      })

      // Não deve ter faixas como "entre R$ X e R$ Y"
      const rangePricingPatterns = [
        /entre\s+R\$.*e\s+R\$/gi,
        /de\s+R\$.*até\s+R\$/gi,
        /a\s+partir\s+de\s+R\$/gi,
      ]

      rangePricingPatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })
  })

  describe('Proibição de Coleta de Dados Sensíveis', () => {
    it('NÃO deve pedir CPF', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Ana Paula',
      })

      const cpfPatterns = [
        /cpf/gi,
        /cadastro de pessoa física/gi,
        /documento/gi,
        /rg/gi,
      ]

      cpfPatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })

    it('NÃO deve pedir histórico médico', async () => {
      const leadData = {
        perfil: 'casal',
        idade: 'acima_60',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Carlos Mendes',
      })

      const medicalPatterns = [
        /histórico médico/gi,
        /doenças preexistentes/gi,
        /problemas de saúde/gi,
        /medicamentos que usa/gi,
        /cirurgias anteriores/gi,
      ]

      medicalPatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })

    it('NÃO deve pedir dados financeiros sensíveis', async () => {
      const leadData = {
        perfil: 'familia',
        idade: '31-45',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Fernanda Lima',
      })

      const financialPatterns = [
        /conta bancária/gi,
        /cartão de crédito/gi,
        /número do cartão/gi,
        /senha/gi,
      ]

      financialPatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })
  })

  describe('Proibição de Promessas Ilegais', () => {
    it('NÃO deve prometer cobertura imediata', async () => {
      const leadData = {
        perfil: 'individual',
        idade: 'ate_30',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Roberto Alves',
      })

      const immediatePatterns = [
        /cobertura imediata/gi,
        /usa hoje/gi,
        /sem carência/gi,
        /zero carência/gi,
        /carência zero/gi,
      ]

      immediatePatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })

    it('NÃO deve garantir aceitação sem análise', async () => {
      const leadData = {
        perfil: 'empresa',
        idade: '46-60',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Juliana Ferreira',
      })

      const guaranteePatterns = [
        /garantido/gi,
        /aprovado com certeza/gi,
        /100% de aceitação/gi,
        /aceito sem análise/gi,
      ]

      guaranteePatterns.forEach(pattern => {
        expect(response).not.toMatch(pattern)
      })
    })
  })

  describe('Qualidade da Resposta', () => {
    it('deve conter recomendações de planos', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Lucas Martins',
      })

      expect(response).toMatch(/plano/gi)
      expect(response.length).toBeGreaterThan(100)
    })

    it('deve ter tom empático e acolhedor', async () => {
      const leadData = {
        perfil: 'familia',
        idade: '46-60',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Beatriz Costa',
      })

      const empatheticTerms = [
        /entendo/gi,
        /compreendo/gi,
        /perfeito/gi,
        /ótimo/gi,
        /vou te ajudar/gi,
        /posso te auxiliar/gi,
      ]

      const hasEmpathy = empatheticTerms.some(pattern =>
        pattern.test(response)
      )

      expect(hasEmpathy).toBe(true)
    })

    it('deve estar em português brasileiro', async () => {
      const leadData = {
        perfil: 'casal',
        idade: 'ate_30',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Thiago Oliveira',
      })

      // Deve ter características do português (acentuação, ç, etc.)
      const portugueseChars = /[áàâãéêíóôõúüç]/gi
      expect(response).toMatch(portugueseChars)

      // Não deve ter texto em inglês
      expect(response).not.toMatch(/hello|hi|thank you|please/gi)
    })

    it('deve ter comprimento adequado (mínimo 150 caracteres)', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'sim',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Patricia Souza',
      })

      expect(response.length).toBeGreaterThanOrEqual(150)
    })

    it('deve incluir call-to-action', async () => {
      const leadData = {
        perfil: 'empresa',
        idade: '46-60',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Ricardo Santos',
      })

      const ctaPatterns = [
        /posso.*enviar/gi,
        /gostaria.*receber/gi,
        /te envio/gi,
        /mando.*proposta/gi,
        /vamos.*conversar/gi,
      ]

      const hasCTA = ctaPatterns.some(pattern => pattern.test(response))
      expect(hasCTA).toBe(true)
    })
  })

  describe('Fallback quando AI Falha', () => {
    it('deve retornar template quando Gemini falha', async () => {
      // Mock Gemini para falhar
      vi.mock('@/lib/ai/gemini', () => ({
        generateResponse: vi.fn().mockRejectedValue(new Error('API Error'))
      }))

      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const response = await generateCompliantResponse(leadData, {
        consultantName: 'Marcos Silva',
      })

      // Deve ter resposta (não undefined ou vazio)
      expect(response).toBeDefined()
      expect(response.length).toBeGreaterThan(50)

      // Deve mencionar plano
      expect(response.toLowerCase()).toContain('plano')
    })

    it('deve usar template específico por perfil', async () => {
      vi.mock('@/lib/ai/gemini', () => ({
        generateResponse: vi.fn().mockRejectedValue(new Error('API Error'))
      }))

      const leadDataIndividual = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const leadDataFamilia = {
        perfil: 'familia',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const responseIndividual = await generateCompliantResponse(leadDataIndividual, {
        consultantName: 'Ana',
      })

      const responseFamilia = await generateCompliantResponse(leadDataFamilia, {
        consultantName: 'Ana',
      })

      // Respostas devem ser diferentes para perfis diferentes
      expect(responseIndividual).not.toBe(responseFamilia)
    })
  })

  describe('Performance', () => {
    it('deve gerar resposta em menos de 3 segundos', async () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const startTime = Date.now()

      await generateCompliantResponse(leadData, {
        consultantName: 'Paulo Gomes',
      })

      const duration = Date.now() - startTime

      // Máximo 3 segundos (3000ms)
      expect(duration).toBeLessThan(3000)
    })
  })
})
