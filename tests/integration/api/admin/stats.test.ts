/**
 * Integration Tests: GET /api/admin/stats
 *
 * Tests admin authentication, query parameters, and response shape.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockGetSession = vi.fn();
const mockSelectConsultants = vi.fn();
const mockSelectStats = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    auth: { getSession: mockGetSession },
    from: vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: mockSelectConsultants,
            }),
          }),
        };
      }
      return {};
    }),
  })),
  createServiceClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'daily_stats') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: mockSelectStats,
            }),
          }),
        };
      }
      return {};
    }),
  })),
}));

import { GET } from '@/app/api/admin/stats/route';

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const response = await GET(createRequest('/api/admin/stats'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('should return 403 when user is not admin', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
    });
    mockSelectConsultants.mockResolvedValue({
      data: { id: 'c-1', is_admin: false },
    });

    const response = await GET(createRequest('/api/admin/stats'));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('should return stats for admin users', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1' } } },
    });
    mockSelectConsultants.mockResolvedValue({
      data: { id: 'c-admin', is_admin: true },
    });
    mockSelectStats.mockResolvedValue({
      data: [
        {
          date: '2026-02-08',
          total_revenue: 4700,
          paid_user_count: 1,
          user_count: 10,
          total_views: 100,
          user_delta: 2,
          paid_user_delta: 1,
        },
      ],
      error: null,
    });

    const response = await GET(createRequest('/api/admin/stats'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('totalRevenue');
    expect(body.data).toHaveProperty('paidUsers');
    expect(body.data).toHaveProperty('totalUsers');
    expect(body.data).toHaveProperty('dailyStats');
  });

  it('should handle database errors gracefully', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1' } } },
    });
    mockSelectConsultants.mockResolvedValue({
      data: { id: 'c-admin', is_admin: true },
    });
    mockSelectStats.mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    });

    const response = await GET(createRequest('/api/admin/stats'));
    const body = await response.json();

    // Stats route handles errors by returning default values
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('should accept days query parameter', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1' } } },
    });
    mockSelectConsultants.mockResolvedValue({
      data: { id: 'c-admin', is_admin: true },
    });
    mockSelectStats.mockResolvedValue({
      data: [],
      error: null,
    });

    const response = await GET(createRequest('/api/admin/stats?days=14'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
