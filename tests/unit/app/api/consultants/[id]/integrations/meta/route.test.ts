/**
 * Tests for /api/consultants/[id]/integrations/meta
 * Meta integration status endpoint
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/consultants/[id]/integrations/meta/route'
import * as supabaseServer from '@/lib/supabase/server'
import * as whatsappIntegrationService from '@/lib/services/whatsapp-integration-service'
import {
  mockConsultant,
  mockOtherConsultant,
  mockGetIntegrationSuccess,
  mockGetIntegrationNotFound,
  mockGetIntegrationError,
  mockSafeIntegration,
} from '@/../tests/fixtures/consultants'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/services/whatsapp-integration-service')

describe('GET /api/consultants/[id]/integrations/meta', () => {
  let mockSupabase: any
  let mockAuth: any
  let mockFrom: any
  let mockSelect: any
  let mockEq: any
  let mockSingle: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Supabase query chain
    mockSingle = vi.fn()
    mockEq = vi.fn(() => ({ single: mockSingle }))
    mockSelect = vi.fn(() => ({ eq: mockEq }))
    mockFrom = vi.fn(() => ({ select: mockSelect }))

    mockAuth = {
      getSession: vi.fn(),
    }

    mockSupabase = {
      auth: mockAuth,
      from: mockFrom,
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Authentication & Authorization', () => {
    it('deve retornar 401 se não autenticado', async () => {
      mockAuth.getSession.mockResolvedValue({ data: { session: null } })

      const request = new NextRequest(
        `http://localhost:3000/api/consultants/${mockConsultant.id}/integrations/meta`,
        { method: 'GET' }
      )

      const response = await GET(request, {
        params: Promise.resolve({ id: mockConsultant.id }),
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('deve retornar 404 se consultor não encontrado', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockConsultant.user_id } } },
      })
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

      const request = new NextRequest(
        `http://localhost:3000/api/consultants/${mockConsultant.id}/integrations/meta`,
        { method: 'GET' }
      )

      const response = await GET(request, {
        params: Promise.resolve({ id: mockConsultant.id }),
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Consultant not found')
    })

    it('deve retornar 403 se consultor pertence a outro usuário', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockConsultant.user_id } } },
      })
      mockSingle.mockResolvedValue({ data: mockOtherConsultant, error: null })

      const request = new NextRequest(
        `http://localhost:3000/api/consultants/${mockOtherConsultant.id}/integrations/meta`,
        { method: 'GET' }
      )

      const response = await GET(request, {
        params: Promise.resolve({ id: mockOtherConsultant.id }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Integration Retrieval', () => {
    beforeEach(() => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockConsultant.user_id } } },
      })
      mockSingle.mockResolvedValue({ data: mockConsultant, error: null })
    })

    it('deve retornar null se integração não encontrada', async () => {
      vi.mocked(whatsappIntegrationService.getIntegration).mockResolvedValue(
        mockGetIntegrationNotFound
      )

      const request = new NextRequest(
        `http://localhost:3000/api/consultants/${mockConsultant.id}/integrations/meta`,
        { method: 'GET' }
      )

      const response = await GET(request, {
        params: Promise.resolve({ id: mockConsultant.id }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.integration).toBeNull()
    })

    it('deve retornar integração sem campos sensíveis', async () => {
      vi.mocked(whatsappIntegrationService.getIntegration).mockResolvedValue(
        mockGetIntegrationSuccess
      )

      const request = new NextRequest(
        `http://localhost:3000/api/consultants/${mockConsultant.id}/integrations/meta`,
        { method: 'GET' }
      )

      const response = await GET(request, {
        params: Promise.resolve({ id: mockConsultant.id }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.integration).toEqual(mockSafeIntegration)

      // Ensure sensitive fields are NOT included
      expect(data.integration.access_token).toBeUndefined()
      expect(data.integration.webhook_secret).toBeUndefined()
      expect(data.integration.waba_id).toBeUndefined()
      expect(data.integration.phone_number_id).toBeUndefined()
    })

    it('deve chamar getIntegration com parâmetros corretos', async () => {
      vi.mocked(whatsappIntegrationService.getIntegration).mockResolvedValue(
        mockGetIntegrationSuccess
      )

      const request = new NextRequest(
        `http://localhost:3000/api/consultants/${mockConsultant.id}/integrations/meta`,
        { method: 'GET' }
      )

      await GET(request, {
        params: Promise.resolve({ id: mockConsultant.id }),
      })

      expect(whatsappIntegrationService.getIntegration).toHaveBeenCalledWith(
        mockConsultant.id,
        'meta'
      )
    })

    it('deve retornar 500 se erro de serviço (não not found)', async () => {
      vi.mocked(whatsappIntegrationService.getIntegration).mockResolvedValue(
        mockGetIntegrationError
      )

      const request = new NextRequest(
        `http://localhost:3000/api/consultants/${mockConsultant.id}/integrations/meta`,
        { method: 'GET' }
      )

      const response = await GET(request, {
        params: Promise.resolve({ id: mockConsultant.id }),
      })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database connection error')
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockConsultant.user_id } } },
      })
      mockSingle.mockResolvedValue({ data: mockConsultant, error: null })
    })

    it('deve lidar com exceção não capturada', async () => {
      vi.mocked(whatsappIntegrationService.getIntegration).mockRejectedValue(
        new Error('Unexpected error')
      )

      const request = new NextRequest(
        `http://localhost:3000/api/consultants/${mockConsultant.id}/integrations/meta`,
        { method: 'GET' }
      )

      const response = await GET(request, {
        params: Promise.resolve({ id: mockConsultant.id }),
      })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Unexpected error')
    })
  })
})
