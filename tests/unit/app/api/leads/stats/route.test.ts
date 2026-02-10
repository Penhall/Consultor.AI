/**
 * Lead Stats API Tests - GET /api/leads/stats
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/leads/stats/route'
import { NextRequest } from 'next/server'
import * as supabaseServer from '@/lib/supabase/server'
import * as leadService from '@/lib/services/lead-service'

vi.mock('@/lib/supabase/server')
vi.mock('@/lib/services/lead-service')

describe('GET /api/leads/stats', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      auth: { getSession: vi.fn() },
      from: vi.fn(),
    }
    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
  })

  it('deve retornar estatísticas de leads', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
    })

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
          }),
        }),
      }),
    })

    vi.mocked(leadService.getLeadStats).mockResolvedValue({
      success: true,
      data: {
        total: 10,
        byStatus: { novo: 3, qualificado: 5, fechado: 2 },
        thisMonth: 5,
        averageScore: 75,
      },
    })

    const request = new NextRequest('http://localhost:3000/api/leads/stats')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.total).toBe(10)
    expect(data.data.byStatus).toBeDefined()
  })

  it('deve retornar 401 se não autenticado', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    })

    const request = new NextRequest('http://localhost:3000/api/leads/stats')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Não autenticado')
  })

  it('deve retornar 404 se consultant não encontrado', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
    })

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    })

    const request = new NextRequest('http://localhost:3000/api/leads/stats')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Perfil de consultor não encontrado')
  })
})
