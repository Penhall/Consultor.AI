/**
 * Integration Tests: GET/PATCH /api/admin/users
 *
 * Tests pagination, filters, admin toggle, and self-demotion prevention.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockGetSession = vi.fn();
const mockSelectConsultants = vi.fn();
const mockServiceSelect = vi.fn();
const mockServiceUpdate = vi.fn();

const createServiceQueryChain = () => {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: mockServiceSelect,
    update: vi.fn().mockReturnValue({
      eq: mockServiceUpdate,
    }),
  };
  return chain;
};

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
    from: vi.fn(() => createServiceQueryChain()),
  })),
}));

import { GET, PATCH } from '@/app/api/admin/users/route';

function createGetRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

function createPatchRequest(body: object): NextRequest {
  return new NextRequest(new URL('/api/admin/users', 'http://localhost:3000'), {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const response = await GET(createGetRequest('/api/admin/users'));
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

    const response = await GET(createGetRequest('/api/admin/users'));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('should return paginated users for admin', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1' } } },
    });
    mockSelectConsultants.mockResolvedValue({
      data: { id: 'c-admin', is_admin: true },
    });
    mockServiceSelect.mockResolvedValue({
      data: [{ id: 'c-1', email: 'user@test.com', name: 'Test', is_admin: false }],
      count: 1,
      error: null,
    });

    const response = await GET(createGetRequest('/api/admin/users'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.users).toHaveLength(1);
    expect(body.data.pagination).toHaveProperty('page');
    expect(body.data.pagination).toHaveProperty('totalPages');
  });

  it('should handle database errors', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-1' } } },
    });
    mockSelectConsultants.mockResolvedValue({
      data: { id: 'c-admin', is_admin: true },
    });
    mockServiceSelect.mockResolvedValue({
      data: null,
      count: null,
      error: { message: 'DB error' },
    });

    const response = await GET(createGetRequest('/api/admin/users'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});

describe('PATCH /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const response = await PATCH(createPatchRequest({ userId: 'c-1', isAdmin: true }));
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

    const response = await PATCH(createPatchRequest({ userId: 'c-2', isAdmin: true }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
  });

  it('should prevent self-demotion', async () => {
    const adminId = '550e8400-e29b-41d4-a716-446655440000';
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-user-1' } } },
    });
    mockSelectConsultants.mockResolvedValue({
      data: { id: adminId, is_admin: true },
    });

    const response = await PATCH(createPatchRequest({ userId: adminId, isAdmin: false }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain('admin');
  });

  it('should toggle admin for other users', async () => {
    const adminId = '550e8400-e29b-41d4-a716-446655440000';
    const targetId = '660e8400-e29b-41d4-a716-446655440001';
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-user-1' } } },
    });
    mockSelectConsultants.mockResolvedValue({
      data: { id: adminId, is_admin: true },
    });
    mockServiceUpdate.mockResolvedValue({ error: null });

    const response = await PATCH(createPatchRequest({ userId: targetId, isAdmin: true }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it('should return 400 for invalid body', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'admin-user-1' } } },
    });
    mockSelectConsultants.mockResolvedValue({
      data: { id: 'c-admin', is_admin: true },
    });

    const response = await PATCH(createPatchRequest({ userId: 'not-a-uuid', isAdmin: 'yes' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });
});
