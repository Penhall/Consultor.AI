import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from '@/app/api/consultants/me/route';
import * as supabaseServer from '@/lib/supabase/server';

// Mock Supabase
vi.mock('@/lib/supabase/server');

function makeRequest(body: unknown, method = 'PATCH') {
  const req = new NextRequest(new URL('http://localhost/api/consultants/me'), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return PATCH(req);
}

describe('PATCH /api/consultants/me', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabaseClient = {
      auth: { getUser: vi.fn() },
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    (supabaseServer.createClient as any).mockResolvedValue(mockSupabaseClient);
  });

  it('returns 401 when not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } });
    const res = await makeRequest({ theme: 'noturno' });
    expect(res.status).toBe(401);
  });

  it('updates theme for authenticated user', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockSupabaseClient.single.mockResolvedValue({ data: { theme: 'noturno' }, error: null });
    const res = await makeRequest({ theme: 'noturno' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.theme).toBe('noturno');
  });

  it('returns 400 for invalid theme value', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const res = await makeRequest({ theme: 'invalid-theme' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when theme field is missing', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const res = await makeRequest({});
    expect(res.status).toBe(400);
  });
});
