/**
 * Lead Service Tests
 *
 * Testa operações CRUD e lógica de negócio dos leads.
 * Garante integridade de dados e regras de negócio.
 *
 * Template completo em: docs/guides/SPRINT2-LEAD-SERVICE-TESTS.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createLead,
  updateLead,
  deleteLead,
  getLeadById,
  calculateLeadScore,
  validateStatusTransition,
} from '@/lib/services/lead-service'
import { mockLeads } from '@tests/fixtures/leads'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockLeads[0],
        error: null,
      }),
    })),
  }),
}))

describe('Lead Service - CRUD Operations', () => {
  describe('Create Lead', () => {
    it('deve criar lead com dados válidos', async () => {
      const newLead = {
        consultant_id: 'consultant-test-1',
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'novo' as const,
      }

      const result = await createLead(newLead)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('id')
      expect(result.data?.whatsapp_number).toBe(newLead.whatsapp_number)
    })

    it('deve rejeitar lead com whatsapp_number inválido', async () => {
      const invalidLead = {
        consultant_id: 'consultant-test-1',
        whatsapp_number: '123', // Muito curto
        name: 'João Silva',
        status: 'novo' as const,
      }

      const result = await createLead(invalidLead)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/whatsapp_number/i)
    })
  })

  describe('Update Lead', () => {
    it('deve atualizar status do lead', async () => {
      const leadId = 'lead-test-1'
      const updates = {
        status: 'qualificado' as const,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('qualificado')
    })
  })

  describe('Delete Lead', () => {
    it('deve deletar lead existente', async () => {
      const leadId = 'lead-test-1'

      const result = await deleteLead(leadId)

      expect(result.success).toBe(true)
    })
  })

  describe('Get Lead by ID', () => {
    it('deve buscar lead existente', async () => {
      const leadId = 'lead-test-1'

      const result = await getLeadById(leadId)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('id', leadId)
    })
  })
})

describe('Lead Service - Business Logic', () => {
  describe('Score Calculation', () => {
    it('deve calcular score baseado em perfil individual', () => {
      const leadData = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const score = calculateLeadScore(leadData)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('Status Transitions', () => {
    it('deve permitir transição novo → em_contato', () => {
      const isValid = validateStatusTransition('novo', 'em_contato')

      expect(isValid).toBe(true)
    })

    it('deve rejeitar transição fechado → novo', () => {
      const isValid = validateStatusTransition('fechado', 'novo')

      expect(isValid).toBe(false)
    })
  })
})

// Helper function (mock - implementar no serviço real)
function validateWhatsAppNumber(number: string): boolean {
  const whatsappRegex = /^\+\d{10,15}$/
  return whatsappRegex.test(number)
}
