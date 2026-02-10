/**
 * Analytics Overview API Tests
 * GET /api/analytics/overview
 *
 * Tests overview metrics endpoint with authentication and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/analytics/overview/route'
import * as supabaseServer from '@/lib/supabase/server'
import * as analyticsService from '@/lib/services/analytics-service'
import { mockOverviewMetrics } from '@tests/fixtures/analytics'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/services/analytics-service')

describe('GET /api/analytics/overview', () => {
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

  it('deve retornar métricas de overview', async () => {
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

    // Arrange: Service returns metrics
    vi.mocked(analyticsService.getOverviewMetrics).mockResolvedValue({
      success: true,
      data: mockOverviewMetrics,
    })

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.data).toEqual(mockOverviewMetrics)
    expect(data.data.totalLeads).toBe(45)
    expect(data.data.leadsThisMonth).toBe(12)
    expect(data.data.activeConversations).toBe(8)
    expect(data.data.completedConversations).toBe(15)
    expect(data.data.averageScore).toBe(72.5)
    expect(data.data.conversionRate).toBe(33.3)
    expect(analyticsService.getOverviewMetrics).toHaveBeenCalledWith('consultant-test-1')
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

  it('deve retornar 500 se service falhar', async () => {
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

    // Arrange: Service fails
    vi.mocked(analyticsService.getOverviewMetrics).mockResolvedValue({
      success: false,
      error: 'Database connection failed',
    })

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Database connection failed')
  })

  it('deve retornar 500 se ocorrer erro inesperado', async () => {
    // Arrange: Force unexpected error
    mockSupabase.auth.getSession.mockRejectedValue(
      new Error('Unexpected database error')
    )

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Unexpected database error')
  })
})
