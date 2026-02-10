# 🧪 Sprint 2: Lead Service Tests - Template Completo

**Módulo**: Lead Service (CRUD + Business Logic)
**Tempo estimado**: 3 horas
**Prioridade**: ⭐⭐ IMPORTANTE

---

## 📋 Checklist

### CRUD Operations (2h)
- [ ] T077a - Criar lead válido
- [ ] T077b - Rejeitar lead inválido
- [ ] T077c - Atualizar lead
- [ ] T077d - Deletar lead
- [ ] T077e - Buscar lead por ID

### Business Logic (1h)
- [ ] T077f - Calcular score
- [ ] T077g - Transições de status
- [ ] T077h - Validar whatsapp_number

---

## 🧪 Template Completo

**Arquivo**: `tests/unit/lib/services/lead-service.test.ts`

```typescript
/**
 * Lead Service Tests
 *
 * Testa operações CRUD e lógica de negócio dos leads.
 * Garante integridade de dados e regras de negócio.
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
import { mockLeads } from '@/tests/fixtures/leads'

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

    it('deve rejeitar lead sem consultant_id', async () => {
      const invalidLead = {
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'novo' as const,
      }

      const result = await createLead(invalidLead as any)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/consultant_id/i)
    })

    it('deve rejeitar lead com status inválido', async () => {
      const invalidLead = {
        consultant_id: 'consultant-test-1',
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'status_invalido' as any,
      }

      const result = await createLead(invalidLead)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/status/i)
    })

    it('deve criar lead com score padrão 0', async () => {
      const newLead = {
        consultant_id: 'consultant-test-1',
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'novo' as const,
      }

      const result = await createLead(newLead)

      expect(result.success).toBe(true)
      expect(result.data?.score).toBe(0)
    })

    it('deve criar lead com metadata vazio por padrão', async () => {
      const newLead = {
        consultant_id: 'consultant-test-1',
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'novo' as const,
      }

      const result = await createLead(newLead)

      expect(result.success).toBe(true)
      expect(result.data?.metadata).toEqual({})
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

    it('deve atualizar score do lead', async () => {
      const leadId = 'lead-test-1'
      const updates = {
        score: 85,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
      expect(result.data?.score).toBe(85)
    })

    it('deve atualizar metadata do lead', async () => {
      const leadId = 'lead-test-1'
      const updates = {
        metadata: {
          perfil: 'individual',
          idade: '31-45',
          coparticipacao: 'nao',
        },
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
      expect(result.data?.metadata).toEqual(updates.metadata)
    })

    it('deve rejeitar atualização com status inválido', async () => {
      const leadId = 'lead-test-1'
      const updates = {
        status: 'status_invalido' as any,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/status/i)
    })

    it('deve rejeitar atualização de lead inexistente', async () => {
      const leadId = 'lead-inexistente'
      const updates = {
        status: 'qualificado' as const,
      }

      // Mock para retornar erro de not found
      vi.mock('@/lib/supabase/server', () => ({
        createClient: () => ({
          from: vi.fn(() => ({
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          })),
        }),
      }))

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/não encontrado|not found/i)
    })
  })

  describe('Delete Lead', () => {
    it('deve deletar lead existente', async () => {
      const leadId = 'lead-test-1'

      const result = await deleteLead(leadId)

      expect(result.success).toBe(true)
    })

    it('deve rejeitar deletar lead inexistente', async () => {
      const leadId = 'lead-inexistente'

      const result = await deleteLead(leadId)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/não encontrado|not found/i)
    })
  })

  describe('Get Lead by ID', () => {
    it('deve buscar lead existente', async () => {
      const leadId = 'lead-test-1'

      const result = await getLeadById(leadId)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('id', leadId)
    })

    it('deve retornar erro para lead inexistente', async () => {
      const leadId = 'lead-inexistente'

      const result = await getLeadById(leadId)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/não encontrado|not found/i)
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

    it('deve dar score alto para perfil empresa', () => {
      const leadData = {
        perfil: 'empresa',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const score = calculateLeadScore(leadData)

      // Empresa geralmente tem score mais alto
      expect(score).toBeGreaterThanOrEqual(70)
    })

    it('deve considerar idade no cálculo', () => {
      const leadDataJovem = {
        perfil: 'individual',
        idade: 'ate_30',
        coparticipacao: 'sim',
      }

      const leadDataIdoso = {
        perfil: 'individual',
        idade: 'acima_60',
        coparticipacao: 'sim',
      }

      const scoreJovem = calculateLeadScore(leadDataJovem)
      const scoreIdoso = calculateLeadScore(leadDataIdoso)

      // Scores devem ser diferentes
      expect(scoreJovem).not.toBe(scoreIdoso)
    })

    it('deve considerar coparticipação no cálculo', () => {
      const leadDataComCopart = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'sim',
      }

      const leadDataSemCopart = {
        perfil: 'individual',
        idade: '31-45',
        coparticipacao: 'nao',
      }

      const scoreComCopart = calculateLeadScore(leadDataComCopart)
      const scoreSemCopart = calculateLeadScore(leadDataSemCopart)

      // Scores devem ser diferentes
      expect(scoreComCopart).not.toBe(scoreSemCopart)
    })

    it('deve retornar 0 para dados incompletos', () => {
      const leadData = {
        perfil: 'individual',
        // Faltando idade e coparticipacao
      }

      const score = calculateLeadScore(leadData)

      expect(score).toBe(0)
    })
  })

  describe('Status Transitions', () => {
    it('deve permitir transição novo → em_contato', () => {
      const isValid = validateStatusTransition('novo', 'em_contato')

      expect(isValid).toBe(true)
    })

    it('deve permitir transição em_contato → qualificado', () => {
      const isValid = validateStatusTransition('em_contato', 'qualificado')

      expect(isValid).toBe(true)
    })

    it('deve permitir transição qualificado → fechado', () => {
      const isValid = validateStatusTransition('qualificado', 'fechado')

      expect(isValid).toBe(true)
    })

    it('deve permitir transição qualquer → perdido', () => {
      const statuses = ['novo', 'em_contato', 'qualificado']

      statuses.forEach(status => {
        const isValid = validateStatusTransition(status as any, 'perdido')
        expect(isValid).toBe(true)
      })
    })

    it('deve rejeitar transição fechado → novo', () => {
      const isValid = validateStatusTransition('fechado', 'novo')

      expect(isValid).toBe(false)
    })

    it('deve rejeitar transição perdido → qualificado', () => {
      const isValid = validateStatusTransition('perdido', 'qualificado')

      expect(isValid).toBe(false)
    })

    it('deve rejeitar transição novo → fechado (pulando etapas)', () => {
      const isValid = validateStatusTransition('novo', 'fechado')

      expect(isValid).toBe(false)
    })
  })

  describe('WhatsApp Number Validation', () => {
    it('deve validar número brasileiro válido', () => {
      const validNumbers = [
        '+5511999998888',
        '+5521988887777',
        '+5511912345678',
      ]

      validNumbers.forEach(number => {
        const isValid = validateWhatsAppNumber(number)
        expect(isValid).toBe(true)
      })
    })

    it('deve rejeitar número sem código do país', () => {
      const invalidNumbers = [
        '11999998888',
        '21988887777',
      ]

      invalidNumbers.forEach(number => {
        const isValid = validateWhatsAppNumber(number)
        expect(isValid).toBe(false)
      })
    })

    it('deve rejeitar número muito curto', () => {
      const invalidNumbers = [
        '+55119',
        '+5511',
        '123',
      ]

      invalidNumbers.forEach(number => {
        const isValid = validateWhatsAppNumber(number)
        expect(isValid).toBe(false)
      })
    })

    it('deve rejeitar número com caracteres inválidos', () => {
      const invalidNumbers = [
        '+5511-99999-8888',
        '+55 11 99999-8888',
        '+5511.9999.8888',
      ]

      invalidNumbers.forEach(number => {
        const isValid = validateWhatsAppNumber(number)
        expect(isValid).toBe(false)
      })
    })

    it('deve aceitar números internacionais', () => {
      const internationalNumbers = [
        '+1234567890',     // EUA
        '+44123456789',    // UK
        '+351123456789',   // Portugal
      ]

      internationalNumbers.forEach(number => {
        const isValid = validateWhatsAppNumber(number)
        expect(isValid).toBe(true)
      })
    })
  })
})

// Helper function (mock - implementar no serviço real)
function validateWhatsAppNumber(number: string): boolean {
  // Regex básico para validação
  const whatsappRegex = /^\+\d{10,15}$/
  return whatsappRegex.test(number)
}
```

**Como usar**:
1. Copie o código acima
2. Cole em `tests/unit/lib/services/lead-service.test.ts`
3. Execute: `npm run test tests/unit/lib/services/lead-service.test.ts`
4. Marque `[x]` em T077a-T077h quando passar

---

## 📊 Coverage Esperado

Após completar todos os testes:
- **Lead Service**: ~70-80% coverage
- **Tempo total**: ~3 horas

---

## 🔗 Próximo Passo

Após concluir Lead Service tests, prossiga para:
→ **Analytics Service Tests** (`SPRINT2-ANALYTICS-SERVICE-TESTS.md`)

---

**Última atualização**: 2026-01-12
**Status**: ✅ PRONTO PARA USO
