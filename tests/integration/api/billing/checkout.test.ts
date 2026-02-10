/**
 * Integration Tests: POST /api/billing/checkout
 *
 * Tests authentication, validation, and checkout session creation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockGetSession = vi.fn();
const mockSelectConsultant = vi.fn();
const mockUpdateConsultant = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    auth: { getSession: mockGetSession },
    from: vi.fn((table: string) => {
      if (table === 'consultants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: mockSelectConsultant,
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: mockUpdateConsultant,
          }),
        };
      }
      return {};
    }),
  })),
}));

// Mock billing service
const mockCreateCheckout = vi.fn();

vi.mock('@/lib/services/billing-service', () => ({
  createCheckout: (...args: any[]) => mockCreateCheckout(...args),
}));

import { POST } from '@/app/api/billing/checkout/route';

function createRequest(body: object): NextRequest {
  return new NextRequest(new URL('http://localhost:3000/api/billing/checkout'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/billing/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const response = await POST(createRequest({ planId: 'pro' }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it('should return 400 for invalid plan ID', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
    });
    mockSelectConsultant.mockResolvedValue({
      data: { id: 'c-1', email: 'user@test.com' },
    });

    const response = await POST(createRequest({ planId: 'invalid-plan' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('should create checkout session for valid plan', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } },
    });
    mockSelectConsultant.mockResolvedValue({
      data: { id: 'c-1', email: 'user@test.com' },
    });
    mockCreateCheckout.mockResolvedValue({
      success: true,
      data: { sessionUrl: 'https://checkout.stripe.com/session_123' },
    });

    const response = await POST(createRequest({ planId: 'pro' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.sessionUrl).toContain('stripe.com');
  });
});
