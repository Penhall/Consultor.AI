/**
 * Analytics Charts API Tests
 * GET /api/analytics/charts
 *
 * Tests chart data endpoint with query params and parallel service calls
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/analytics/charts/route'
import { NextRequest } from 'next/server'
import * as supabaseServer from '@/lib/supabase/server'
import * as analyticsService from '@/lib/services/analytics-service'
import {
  mockLeadsByStatus,
  mockTimeSeriesData,
  mockProfileDistribution,
} from '@tests/fixtures/analytics'

// Mock modules
vi.mock('@/lib/supabase/server')
vi.mock('@/lib/services/analytics-service')

describe('GET /api/analytics/charts', () => {
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

  it('deve retornar dados de charts com days padrão (30)', async () => {
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
    vi.mocked(analyticsService.getLeadsByStatus).mockResolvedValue({
      success: true,
      data: mockLeadsByStatus,
    })
    vi.mocked(analyticsService.getTimeSeriesData).mockResolvedValue({
      success: true,
      data: mockTimeSeriesData,
    })
    vi.mocked(analyticsService.getProfileDistribution).mockResolvedValue({
      success: true,
      data: mockProfileDistribution,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/analytics/charts')
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.data.leadsByStatus).toEqual(mockLeadsByStatus)
    expect(data.data.timeSeries).toEqual(mockTimeSeriesData)
    expect(data.data.profileDistribution).toEqual(mockProfileDistribution)
    expect(analyticsService.getLeadsByStatus).toHaveBeenCalledWith('consultant-test-1')
    expect(analyticsService.getTimeSeriesData).toHaveBeenCalledWith('consultant-test-1', 30)
    expect(analyticsService.getProfileDistribution).toHaveBeenCalledWith('consultant-test-1')
  })

  it('deve usar days customizado quando fornecido', async () => {
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
    vi.mocked(analyticsService.getLeadsByStatus).mockResolvedValue({
      success: true,
      data: mockLeadsByStatus,
    })
    vi.mocked(analyticsService.getTimeSeriesData).mockResolvedValue({
      success: true,
      data: mockTimeSeriesData,
    })
    vi.mocked(analyticsService.getProfileDistribution).mockResolvedValue({
      success: true,
      data: mockProfileDistribution,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/analytics/charts?days=7')
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.data).toHaveProperty('leadsByStatus')
    expect(data.data).toHaveProperty('timeSeries')
    expect(data.data).toHaveProperty('profileDistribution')
    expect(analyticsService.getTimeSeriesData).toHaveBeenCalledWith('consultant-test-1', 7)
  })

  it('deve retornar 401 se não autenticado', async () => {
    // Arrange: No session
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/analytics/charts')
    const response = await GET(request)
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
    const request = new NextRequest('http://localhost:3000/api/analytics/charts')
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.error).toBe('Consultant not found')
  })

  it('deve retornar 500 se getLeadsByStatus falhar', async () => {
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

    // Arrange: getLeadsByStatus fails
    vi.mocked(analyticsService.getLeadsByStatus).mockResolvedValue({
      success: false,
      error: 'Failed to fetch leads by status',
    })
    vi.mocked(analyticsService.getTimeSeriesData).mockResolvedValue({
      success: true,
      data: mockTimeSeriesData,
    })
    vi.mocked(analyticsService.getProfileDistribution).mockResolvedValue({
      success: true,
      data: mockProfileDistribution,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/analytics/charts')
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch leads by status')
  })

  it('deve retornar 500 se getTimeSeriesData falhar', async () => {
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

    // Arrange: getTimeSeriesData fails
    vi.mocked(analyticsService.getLeadsByStatus).mockResolvedValue({
      success: true,
      data: mockLeadsByStatus,
    })
    vi.mocked(analyticsService.getTimeSeriesData).mockResolvedValue({
      success: false,
      error: 'Failed to fetch time series',
    })
    vi.mocked(analyticsService.getProfileDistribution).mockResolvedValue({
      success: true,
      data: mockProfileDistribution,
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/analytics/charts')
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch time series')
  })

  it('deve retornar 500 se getProfileDistribution falhar', async () => {
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

    // Arrange: getProfileDistribution fails
    vi.mocked(analyticsService.getLeadsByStatus).mockResolvedValue({
      success: true,
      data: mockLeadsByStatus,
    })
    vi.mocked(analyticsService.getTimeSeriesData).mockResolvedValue({
      success: true,
      data: mockTimeSeriesData,
    })
    vi.mocked(analyticsService.getProfileDistribution).mockResolvedValue({
      success: false,
      error: 'Failed to fetch profile distribution',
    })

    // Act
    const request = new NextRequest('http://localhost:3000/api/analytics/charts')
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch profile distribution')
  })

  it('deve retornar 500 se ocorrer erro inesperado', async () => {
    // Arrange: Force unexpected error
    mockSupabase.auth.getSession.mockRejectedValue(
      new Error('Database connection lost')
    )

    // Act
    const request = new NextRequest('http://localhost:3000/api/analytics/charts')
    const response = await GET(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('Database connection lost')
  })
})
