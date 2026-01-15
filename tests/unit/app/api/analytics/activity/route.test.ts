/**
 * Analytics Activity API Tests
 * GET /api/analytics/activity
 *
 * Tests recent activity and top leads endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/analytics/activity/route'
import * as supabaseServer from '@/lib/supabase/server'
import * as analyticsService from '@/lib/services/analytics-service'
import { mockRecentActivity, mockTopLeads } from '@tests/fixtures/analytics'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/services/analytics-service')

describe('GET /api/analytics/activity', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default Supabase mock
    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
      from: vi.fn(),
    }

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabase)
  })

  it('deve retornar atividade recente e top leads', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    // Arrange: Consultant exists
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    })

    // Arrange: Services return data
    vi.mocked(analyticsService.getRecentActivity).mockResolvedValue({
      success: true,
      data: mockRecentActivity,
    })
    vi.mocked(analyticsService.getTopLeads).mockResolvedValue({
      success: true,
      data: mockTopLeads,
    })

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.data.recent).toEqual(mockRecentActivity)
    expect(data.data.topLeads).toEqual(mockTopLeads)
    expect(data.data.recent).toHaveLength(3)
    expect(data.data.topLeads).toHaveLength(5)
    expect(analyticsService.getRecentActivity).toHaveBeenCalledWith('consultant-test-1')
    expect(analyticsService.getTopLeads).toHaveBeenCalledWith('consultant-test-1', 5)
  })

  it('deve retornar estrutura correta de dados', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    // Arrange: Consultant exists
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    })

    // Arrange: Services return data
    vi.mocked(analyticsService.getRecentActivity).mockResolvedValue({
      success: true,
      data: mockRecentActivity,
    })
    vi.mocked(analyticsService.getTopLeads).mockResolvedValue({
      success: true,
      data: mockTopLeads,
    })

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert: Verify structure
    expect(data.data).toHaveProperty('recent')
    expect(data.data).toHaveProperty('topLeads')

    // Verify recent activity structure
    expect(data.data.recent[0]).toHaveProperty('id')
    expect(data.data.recent[0]).toHaveProperty('name')
    expect(data.data.recent[0]).toHaveProperty('status')
    expect(data.data.recent[0]).toHaveProperty('score')

    // Verify top leads structure
    expect(data.data.topLeads[0]).toHaveProperty('id')
    expect(data.data.topLeads[0]).toHaveProperty('name')
    expect(data.data.topLeads[0]).toHaveProperty('status')
    expect(data.data.topLeads[0]).toHaveProperty('score')
  })

  it('deve retornar 401 se não autenticado', async () => {
    // Arrange: No session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('deve retornar 404 se consultant não encontrado', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    // Arrange: No consultant found
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

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.error).toBe('Consultant not found')
  })

  it('deve retornar 500 se getRecentActivity falhar', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    // Arrange: Consultant exists
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    })

    // Arrange: getRecentActivity fails
    vi.mocked(analyticsService.getRecentActivity).mockResolvedValue({
      success: false,
      error: 'Failed to fetch recent activity',
    })
    vi.mocked(analyticsService.getTopLeads).mockResolvedValue({
      success: true,
      data: mockTopLeads,
    })

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch recent activity')
  })

  it('deve retornar 500 se getTopLeads falhar', async () => {
    // Arrange: User authenticated
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    })

    // Arrange: Consultant exists
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consultant-test-1' },
            error: null,
          }),
        }),
      }),
    })

    // Arrange: getTopLeads fails
    vi.mocked(analyticsService.getRecentActivity).mockResolvedValue({
      success: true,
      data: mockRecentActivity,
    })
    vi.mocked(analyticsService.getTopLeads).mockResolvedValue({
      success: false,
      error: 'Failed to fetch top leads',
    })

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch top leads')
  })

  it('deve retornar 500 se ocorrer erro inesperado', async () => {
    // Arrange: Force unexpected error
    mockSupabase.auth.getSession.mockRejectedValue(
      new Error('Connection timeout')
    )

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Connection timeout')
  })
})
