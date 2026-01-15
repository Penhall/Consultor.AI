/**
 * Tests for /api/consultants/meta-callback
 * Legacy Meta OAuth callback handler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/consultants/meta-callback/route'
import * as supabaseServer from '@/lib/supabase/server'
import * as encryption from '@/lib/encryption'
import {
  mockConsultant,
  mockMetaTokenResponse,
  mockMetaDebugTokenResponse,
  mockMetaPhoneNumbersResponse,
  mockMetaTokenErrorResponse,
  mockMetaDebugTokenNoWABA,
  mockMetaPhoneNumbersEmptyResponse,
  mockWhatsAppIntegration,
} from '@/../tests/fixtures/consultants'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/encryption')

describe('POST /api/consultants/meta-callback', () => {
  let mockSupabase: any
  let mockAuth: any
  let mockFrom: any
  let mockSelect: any
  let mockInsert: any
  let mockSingle: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Supabase query chain
    mockSingle = vi.fn()
    mockSelect = vi.fn(() => ({ single: mockSingle }))
    mockInsert = vi.fn(() => ({ select: mockSelect }))
    mockFrom = vi.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
    }))

    mockAuth = {
      getUser: vi.fn(),
    }

    mockSupabase = {
      auth: mockAuth,
      from: mockFrom,
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
    vi.mocked(encryption.encrypt).mockReturnValue('encrypted_value')

    // Mock environment variables
    process.env.NEXT_PUBLIC_META_APP_ID = 'test-app-id'
    process.env.META_APP_SECRET = 'test-app-secret'
    process.env.META_APP_ACCESS_TOKEN = 'test-app-access-token'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Validation', () => {
    it('deve retornar 400 se code estiver faltando', async () => {
      const request = new NextRequest('http://localhost:3000/api/consultants/meta-callback', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing code')
    })
  })

  describe('Authentication', () => {
    it('deve retornar 401 se não autenticado', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: null } })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'test-code' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('Meta OAuth Flow', () => {
    beforeEach(() => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: { id: mockConsultant.user_id } },
      })
    })

    it('deve retornar 500 se troca de token falhar', async () => {
      // Mock token exchange failure - Meta returns 200 OK with error object
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetaTokenErrorResponse,
      })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'invalid-code' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Server error')
    })

    it('deve retornar 500 se debug token falhar', async () => {
      // Mock successful token exchange
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaTokenResponse,
        })
        // Mock failed debug token - returns malformed data
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: null }), // Missing granular_scopes
        })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'test-code' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Server error')
    })

    it('deve retornar 500 se busca de números falhar', async () => {
      // Mock successful token exchange
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaTokenResponse,
        })
        // Mock successful debug token
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMetaDebugTokenResponse,
        })
        // Mock failed phone numbers fetch - returns malformed data
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: null }), // No phones array
        })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'test-code' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Server error')
    })

    it('deve criar integração com sucesso', async () => {
      // Mock successful Meta API calls
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

      // Mock successful database insertion
      mockSingle.mockResolvedValue({ data: mockWhatsAppIntegration, error: null })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'test-code' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.integration).toEqual({
        phoneNumber: mockMetaPhoneNumbersResponse.data[0].display_phone_number,
        businessName: mockMetaPhoneNumbersResponse.data[0].verified_name,
      })

      // Verify database insertion
      expect(mockFrom).toHaveBeenCalledWith('whatsapp_integrations')
      expect(mockInsert).toHaveBeenCalled()
      expect(encryption.encrypt).toHaveBeenCalledWith(mockMetaTokenResponse.access_token)
    })

    it('deve retornar 500 se inserção no banco falhar', async () => {
      // Mock successful Meta API calls
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

      // Mock database insertion failure - throw exception
      mockInsert.mockImplementation(() => {
        throw new Error('Database connection error')
      })

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'test-code' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Server error')
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: { id: mockConsultant.user_id } },
      })
    })

    it('deve lidar com exceção não capturada', async () => {
      // Mock exception during fetch
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const request = new NextRequest('http://localhost:3000/api/consultants/meta-callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'test-code' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Server error')
    })
  })
})
