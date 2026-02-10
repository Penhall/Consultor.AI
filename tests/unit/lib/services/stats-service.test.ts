/**
 * Stats Service Tests
 *
 * Tests daily stats calculation, delta computation, and error handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockSingle = vi.fn();
const mockUpsert = vi.fn();

const createQueryChain = () => ({
  select: mockSelect.mockReturnThis(),
  eq: mockEq.mockReturnThis(),
  in: mockIn.mockReturnThis(),
  single: mockSingle,
  upsert: mockUpsert,
});

const mockFrom = vi.fn().mockReturnValue(createQueryChain());

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

// Mock fetch for Plausible API
const originalFetch = global.fetch;

import { calculateDailyStats } from '@/lib/services/stats-service';

describe('stats-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = originalFetch;
    delete process.env.PLAUSIBLE_API_KEY;
    delete process.env.PLAUSIBLE_SITE_ID;

    // Default: counts return values, yesterday returns null, upsert succeeds
    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
    mockIn.mockReturnThis();
    mockSingle.mockResolvedValue({ data: null });
    mockUpsert.mockResolvedValue({ error: null });

    // Track call sequences to handle different from() calls
    mockFrom.mockImplementation((table: string) => {
      const chain = createQueryChain();

      if (table === 'consultants') {
        // First call: total users, Second: paid users, Third+: revenue queries
        chain.select = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0 }),
          }),
          in: vi.fn().mockResolvedValue({ count: 0 }),
        });
        // Head count queries
        mockSelect.mockResolvedValue({ count: 10 });
      }

      if (table === 'daily_stats') {
        chain.select = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        });
        chain.upsert = vi.fn().mockResolvedValue({ error: null });
      }

      return chain;
    });
  });

  it('should return success when calculation completes', async () => {
    const result = await calculateDailyStats();
    expect(result.success).toBe(true);
  });

  it('should handle upsert errors gracefully', async () => {
    mockFrom.mockImplementation((table: string) => {
      const chain = createQueryChain();

      if (table === 'consultants') {
        chain.select = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0 }),
          }),
          in: vi.fn().mockResolvedValue({ count: 0 }),
        });
      }

      if (table === 'daily_stats') {
        chain.select = vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        });
        chain.upsert = vi.fn().mockResolvedValue({
          error: { message: 'Upsert failed' },
        });
      }

      return chain;
    });

    const result = await calculateDailyStats();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Upsert failed');
  });

  it('should handle unexpected errors gracefully', async () => {
    mockFrom.mockImplementation(() => {
      throw new Error('Connection lost');
    });

    const result = await calculateDailyStats();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Connection lost');
  });

  it('should not call Plausible when env vars are missing', async () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    await calculateDailyStats();

    // fetch should not be called for Plausible (may be called for other things)
    const plausibleCalls = mockFetch.mock.calls.filter(
      (call: any[]) => typeof call[0] === 'string' && call[0].includes('plausible.io')
    );
    expect(plausibleCalls).toHaveLength(0);
  });

  it('should call Plausible when env vars are set', async () => {
    process.env.PLAUSIBLE_API_KEY = 'test-key';
    process.env.PLAUSIBLE_SITE_ID = 'test-site';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: { pageviews: { value: 42 } } }),
    }) as any;

    await calculateDailyStats();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('plausible.io'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-key' },
      })
    );
  });

  it('should handle Plausible API failure gracefully', async () => {
    process.env.PLAUSIBLE_API_KEY = 'test-key';
    process.env.PLAUSIBLE_SITE_ID = 'test-site';

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as any;

    const result = await calculateDailyStats();
    // Should still succeed — Plausible failure is non-fatal
    expect(result.success).toBe(true);
  });
});
