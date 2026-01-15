/**
 * Tests for /api/consultants/meta-signup
 * Meta Embedded Signup handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/consultants/meta-signup/route'
import * as supabaseServer from '@/lib/supabase/server'
import * as whatsappIntegrationService from '@/lib/services/whatsapp-integration-service'
import {
  mockConsultant,
  mockOtherConsultant,
  mockMetaTokenResponse,
  mockMetaDebugTokenResponse,
  mockMetaPhoneNumbersResponse,
  mockMetaTokenErrorResponse,
  mockMetaDebugTokenNoWABA,
  mockMetaPhoneNumbersEmptyResponse,
  mockCreateMetaIntegrationSuccess,
  mockCreateMetaIntegrationDuplicateError,
  mockCreateMetaIntegrationError,
} from '@/../tests/fixtures/consultants'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/services/whatsapp-integration-service')

describe('POST /api/consultants/meta-signup', () => {
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
    mockEq = vi.fn(() => ({ eq: mockEq, single: mockSingle }))
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

    // Mock environment variables
    process.env.META_APP_ID = 'test-app-id'
    process.env.META_APP_SECRET = 'test-app-secret'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.META_WEBHOOK_VERIFY_TOKEN = 'test-verify-token'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Validation', () => {
    it('deve retornar 400 se code estiver faltando', async () => {
      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({ consultant_id: mockConsultant.id }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields: code, consultant_id')
    })

    it('deve retornar 400 se consultant_id estiver faltando', async () => {
      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({ code: 'test-code' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields: code, consultant_id')
    })
  })

  describe('Authentication & Authorization', () => {
    it('deve retornar 401 se não autenticado', async () => {
      mockAuth.getSession.mockResolvedValue({ data: { session: null } })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('deve retornar 404 se consultor não encontrado', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockConsultant.user_id } } },
      })
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Consultant not found or unauthorized')
    })

    it('deve retornar 404 se consultor pertence a outro usuário', async () => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockConsultant.user_id } } },
      })

      // Mock the query to check for consultant with this ID AND the current user's ID
      // Since user_id doesn't match, it won't find anything
      mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockOtherConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Consultant not found or unauthorized')
    })
  })

  describe('Meta OAuth Flow', () => {
    beforeEach(() => {
      mockAuth.getSession.mockResolvedValue({
        data: { session: { user: { id: mockConsultant.user_id } } },
      })
      mockSingle.mockResolvedValue({ data: mockConsultant, error: null })
    })

    it('deve retornar 400 se troca de token falhar', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => mockMetaTokenErrorResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'invalid-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid authorization code')
    })

    it('deve retornar 400 se debug token falhar', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Invalid token' }),
        })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Failed to fetch WhatsApp Business Account info')
    })

    it('deve retornar 400 se WABA não encontrada nos escopos', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaDebugTokenNoWABA,
        })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('No WhatsApp Business Account found')
    })

    it('deve retornar 400 se busca de números falhar', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaDebugTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Phone fetch failed' }),
        })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Failed to fetch phone numbers')
    })

    it('deve retornar 400 se nenhum número encontrado', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaDebugTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaPhoneNumbersEmptyResponse,
        })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('No phone numbers found')
    })

    it('deve criar integração com sucesso (webhook subscription bem-sucedida)', async () => {
      // Mock successful Meta API calls
      global.fetch = vi.fn()
        // Token exchange
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaTokenResponse,
        })
        // Debug token
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaDebugTokenResponse,
        })
        // Phone numbers
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaPhoneNumbersResponse,
        })
        // Webhook subscription
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })

      vi.mocked(whatsappIntegrationService.createMetaIntegration).mockResolvedValue(
        mockCreateMetaIntegrationSuccess
      )

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toEqual({
        phone_number: mockMetaPhoneNumbersResponse.data[0].display_phone_number,
        display_name: mockMetaPhoneNumbersResponse.data[0].verified_name,
      })

      expect(whatsappIntegrationService.createMetaIntegration).toHaveBeenCalledWith({
        consultant_id: mockConsultant.id,
        access_token: mockMetaTokenResponse.access_token,
        phone_number: mockMetaPhoneNumbersResponse.data[0].display_phone_number,
        phone_number_id: mockMetaPhoneNumbersResponse.data[0].id,
        waba_id: mockMetaDebugTokenResponse.data.granular_scopes[0].target_ids[0],
        display_name: mockMetaPhoneNumbersResponse.data[0].verified_name,
        webhook_secret: 'test-verify-token',
        expires_at: expect.any(String),
      })
    })

    it('deve criar integração mesmo se webhook subscription falhar', async () => {
      // Mock successful Meta API calls, but webhook subscription fails
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaDebugTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaPhoneNumbersResponse,
        })
        // Webhook subscription fails
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Webhook failed' }),
        })

      vi.mocked(whatsappIntegrationService.createMetaIntegration).mockResolvedValue(
        mockCreateMetaIntegrationSuccess
      )

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      // Should still succeed
      expect(response.status).toBe(200)
      expect(data.data).toBeDefined()
    })

    it('deve retornar 500 se salvar integração falhar', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaDebugTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaPhoneNumbersResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })

      vi.mocked(whatsappIntegrationService.createMetaIntegration).mockResolvedValue(
        mockCreateMetaIntegrationError
      )

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
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
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-signup', {
        method: 'POST',
        body: JSON.stringify({
          code: 'test-code',
          consultant_id: mockConsultant.id,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Network error')
    })
  })
})
