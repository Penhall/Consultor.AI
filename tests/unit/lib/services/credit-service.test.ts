/**
 * Credit Service Tests
 *
 * Tests credit decrement, balance check, and purchased credits addition.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock return values
let mockQueryResult: any = { data: null, error: null };
let mockRpcResult: any = { data: null, error: null };

// Chainable Supabase mock
function createChain(resolvedValue: any) {
  const chain: any = {};
  const methods = ['select', 'update', 'eq', 'single'];
  methods.forEach(method => {
    chain[method] = vi.fn(() => chain);
  });
  chain.then = (fn: any) => Promise.resolve(resolvedValue).then(fn);
  chain.catch = (fn: any) => Promise.resolve(resolvedValue).catch(fn);
  return chain;
}

const mockFrom = vi.fn(() => createChain(mockQueryResult));
const mockRpc = vi.fn(() => Promise.resolve(mockRpcResult));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
  createServiceClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

import { decrementCredits, checkBalance, addPurchasedCredits } from '@/lib/services/credit-service';

describe('Credit Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResult = { data: null, error: null };
    mockRpcResult = { data: null, error: null };
  });

  describe('decrementCredits', () => {
    it('deve decrementar créditos atomicamente via RPC', async () => {
      mockQueryResult = {
        data: { id: 'consultant-1', credits: 20 },
        error: null,
      };
      mockRpcResult = { data: 19, error: null };

      const result = await decrementCredits('user-1', 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.remaining).toBe(19);
      }
      expect(mockRpc).toHaveBeenCalledWith('decrement_credits', {
        user_id: 'consultant-1',
        amount: 1,
      });
    });

    it('deve retornar erro quando créditos insuficientes', async () => {
      mockQueryResult = {
        data: { id: 'consultant-1', credits: 0 },
        error: null,
      };
      mockRpcResult = {
        data: null,
        error: { message: 'Insufficient credits' },
      };

      const result = await decrementCredits('user-1', 1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Créditos insuficientes');
      }
    });

    it('deve retornar erro quando usuário não encontrado', async () => {
      mockQueryResult = {
        data: null,
        error: { message: 'No rows' },
      };

      const result = await decrementCredits('nonexistent', 1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('User not found');
      }
    });
  });

  describe('checkBalance', () => {
    it('deve retornar true quando tem créditos suficientes', async () => {
      mockQueryResult = {
        data: { credits: 20 },
        error: null,
      };

      const result = await checkBalance('user-1', 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hasCredits).toBe(true);
        expect(result.data.balance).toBe(20);
      }
    });

    it('deve retornar false quando créditos insuficientes', async () => {
      mockQueryResult = {
        data: { credits: 0 },
        error: null,
      };

      const result = await checkBalance('user-1', 1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hasCredits).toBe(false);
        expect(result.data.balance).toBe(0);
      }
    });
  });

  describe('addPurchasedCredits', () => {
    it('deve adicionar créditos permanentes', async () => {
      // First call returns current consultant data, update chain
      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // select query
          return createChain({
            data: { credits: 150, purchased_credits: 0 },
            error: null,
          });
        }
        // update chain (returns from 'as any')
        const updateChain: any = {
          update: vi.fn(() => updateChain),
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        };
        return updateChain;
      });

      const result = await addPurchasedCredits('consultant-1', 50);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.purchasedCredits).toBe(50);
        expect(result.data.credits).toBe(200);
      }
    });
  });
});
