/**
 * Lead Service Tests
 *
 * Tests CRUD operations and business logic for leads.
 * Uses mocked Supabase client.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockLeads } from '@tests/fixtures/leads'

// Create a flexible mock chain builder
const createChainablePromise = (resolvedValue: any) => {
  const chain: any = {}
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'or', 'order', 'range', 'single']

  methods.forEach(method => {
    chain[method] = vi.fn(() => chain)
  })

  // The final promise resolves to our value
  chain.then = (fn: any) => Promise.resolve(resolvedValue).then(fn)
  chain.catch = (fn: any) => Promise.resolve(resolvedValue).catch(fn)

  return chain
}

// Track mock return values
let mockReturnValue: any = { data: null, error: null }

// Create a reusable mock client
const createMockSupabaseClient = () => ({
  from: vi.fn(() => createChainablePromise(mockReturnValue)),
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => createMockSupabaseClient()),
}))

// Import after mocking
import {
  createLead,
  updateLead,
  deleteLead,
  getLeadById,
  listLeads,
  getLeadStats,
} from '@/lib/services/lead-service'

describe('Lead Service - CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReturnValue = { data: mockLeads[0], error: null }
  })

  describe('createLead', () => {
    it('deve criar lead com dados válidos', async () => {
      const consultantId = 'consultant-test-1'
      const newLead = {
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'novo' as const,
      }

      mockReturnValue = {
        data: { id: 'new-lead-id', ...newLead, consultant_id: consultantId },
        error: null,
      }

      const result = await createLead(consultantId, newLead)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveProperty('id')
        expect(result.data.whatsapp_number).toBe(newLead.whatsapp_number)
      }
    })

    it('deve retornar erro quando Supabase falha', async () => {
      const consultantId = 'consultant-test-1'
      const newLead = {
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
      }

      mockReturnValue = {
        data: null,
        error: { message: 'Database error', code: 'ERROR' },
      }

      const result = await createLead(consultantId, newLead)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('deve retornar erro específico para número duplicado', async () => {
      const consultantId = 'consultant-test-1'
      const newLead = {
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
      }

      mockReturnValue = {
        data: null,
        error: { message: 'Duplicate key', code: '23505' },
      }

      const result = await createLead(consultantId, newLead)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('já está cadastrado')
      }
    })
  })

  describe('getLeadById', () => {
    it('deve buscar lead existente', async () => {
      const leadId = 'lead-test-1'

      mockReturnValue = {
        data: { id: leadId, ...mockLeads[0] },
        error: null,
      }

      const result = await getLeadById(leadId)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveProperty('id')
      }
    })

    it('deve retornar erro para lead inexistente', async () => {
      const leadId = 'non-existent-lead'

      mockReturnValue = {
        data: null,
        error: { message: 'Not found', code: 'PGRST116' },
      }

      const result = await getLeadById(leadId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('não encontrado')
      }
    })
  })

  describe('updateLead', () => {
    it('deve atualizar status do lead', async () => {
      const leadId = 'lead-test-1'
      const updates = {
        status: 'qualificado' as const,
      }

      mockReturnValue = {
        data: { id: leadId, ...mockLeads[0], status: 'qualificado' },
        error: null,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('qualificado')
      }
    })

    it('deve atualizar múltiplos campos', async () => {
      const leadId = 'lead-test-1'
      const updates = {
        name: 'Nome Atualizado',
        score: 85,
      }

      mockReturnValue = {
        data: { id: leadId, ...mockLeads[0], ...updates },
        error: null,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Nome Atualizado')
        expect(result.data.score).toBe(85)
      }
    })

    it('deve retornar erro para lead inexistente', async () => {
      const leadId = 'non-existent-lead'
      const updates = { name: 'Novo Nome' }

      mockReturnValue = {
        data: null,
        error: { message: 'Not found', code: 'PGRST116' },
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('não encontrado')
      }
    })
  })

  describe('deleteLead', () => {
    it('deve deletar lead existente', async () => {
      const leadId = 'lead-test-1'

      mockReturnValue = {
        error: null,
      }

      const result = await deleteLead(leadId)

      expect(result.success).toBe(true)
    })

    it('deve retornar erro quando deleção falha', async () => {
      const leadId = 'lead-test-1'

      mockReturnValue = {
        error: { message: 'Delete failed' },
      }

      const result = await deleteLead(leadId)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })

  describe('listLeads', () => {
    it('deve listar leads com paginação', async () => {
      const consultantId = 'consultant-test-1'
      const params = {
        page: 1,
        limit: 10,
        orderBy: 'created_at' as const,
        order: 'desc' as const,
      }

      mockReturnValue = {
        data: mockLeads,
        error: null,
        count: 2,
      }

      const result = await listLeads(consultantId, params)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.data).toHaveLength(2)
        expect(result.data.pagination).toHaveProperty('page', 1)
        expect(result.data.pagination).toHaveProperty('total')
      }
    })

    it('deve filtrar por status', async () => {
      const consultantId = 'consultant-test-1'
      const params = {
        page: 1,
        limit: 10,
        status: 'novo' as const,
        orderBy: 'created_at' as const,
        order: 'desc' as const,
      }

      mockReturnValue = {
        data: [mockLeads[0]],
        error: null,
        count: 1,
      }

      const result = await listLeads(consultantId, params)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.data).toHaveLength(1)
      }
    })

    it('deve retornar erro quando query falha', async () => {
      const consultantId = 'consultant-test-1'
      const params = {
        page: 1,
        limit: 10,
        orderBy: 'created_at' as const,
        order: 'desc' as const,
      }

      mockReturnValue = {
        data: null,
        error: { message: 'Query failed' },
        count: null,
      }

      const result = await listLeads(consultantId, params)

      expect(result.success).toBe(false)
    })
  })

  describe('getLeadStats', () => {
    it('deve retornar estatísticas do consultor', async () => {
      const consultantId = 'consultant-test-1'

      mockReturnValue = {
        data: [
          { status: 'novo', score: 70, created_at: new Date().toISOString() },
          { status: 'qualificado', score: 85, created_at: new Date().toISOString() },
        ],
        error: null,
      }

      const result = await getLeadStats(consultantId)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveProperty('total', 2)
        expect(result.data).toHaveProperty('byStatus')
        expect(result.data).toHaveProperty('thisMonth')
        expect(result.data).toHaveProperty('averageScore')
      }
    })

    it('deve retornar erro quando query falha', async () => {
      const consultantId = 'consultant-test-1'

      mockReturnValue = {
        data: null,
        error: { message: 'Stats query failed' },
      }

      const result = await getLeadStats(consultantId)

      expect(result.success).toBe(false)
    })
  })
})

describe('Lead Service - Business Rules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockReturnValue = { data: mockLeads[0], error: null }
  })

  describe('Status Values', () => {
    it('deve aceitar status válido "novo"', async () => {
      const consultantId = 'consultant-test-1'
      const newLead = {
        whatsapp_number: '+5511999998888',
        status: 'novo' as const,
      }

      mockReturnValue = {
        data: { id: 'new-lead-id', ...newLead },
        error: null,
      }

      const result = await createLead(consultantId, newLead)

      expect(result.success).toBe(true)
    })

    it('deve aceitar status válido "qualificado"', async () => {
      const leadId = 'lead-test-1'
      const updates = { status: 'qualificado' as const }

      mockReturnValue = {
        data: { id: leadId, status: 'qualificado' },
        error: null,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
    })

    it('deve aceitar status válido "fechado"', async () => {
      const leadId = 'lead-test-1'
      const updates = { status: 'fechado' as const }

      mockReturnValue = {
        data: { id: leadId, status: 'fechado' },
        error: null,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
    })
  })

  describe('Score Range', () => {
    it('deve aceitar score entre 0 e 100', async () => {
      const leadId = 'lead-test-1'
      const updates = { score: 75 }

      mockReturnValue = {
        data: { id: leadId, score: 75 },
        error: null,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.score).toBe(75)
      }
    })

    it('deve aceitar score 0', async () => {
      const leadId = 'lead-test-1'
      const updates = { score: 0 }

      mockReturnValue = {
        data: { id: leadId, score: 0 },
        error: null,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
    })

    it('deve aceitar score 100', async () => {
      const leadId = 'lead-test-1'
      const updates = { score: 100 }

      mockReturnValue = {
        data: { id: leadId, score: 100 },
        error: null,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
    })
  })

  describe('Metadata', () => {
    it('deve aceitar metadata com dados de qualificação', async () => {
      const consultantId = 'consultant-test-1'
      const newLead = {
        whatsapp_number: '+5511999998888',
        metadata: {
          perfil: 'individual',
          idade: '31-45',
          coparticipacao: 'nao',
        },
      }

      mockReturnValue = {
        data: { id: 'new-lead-id', ...newLead },
        error: null,
      }

      const result = await createLead(consultantId, newLead)

      expect(result.success).toBe(true)
    })

    it('deve atualizar metadata existente', async () => {
      const leadId = 'lead-test-1'
      const updates = {
        metadata: {
          perfil: 'familia',
          idade: '46-60',
        },
      }

      mockReturnValue = {
        data: { id: leadId, metadata: updates.metadata },
        error: null,
      }

      const result = await updateLead(leadId, updates)

      expect(result.success).toBe(true)
    })
  })
})
