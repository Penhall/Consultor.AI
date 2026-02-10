/**
 * Billing Service Tests
 *
 * Tests checkout session creation, portal URL, and billing info retrieval.
 * Uses mocked Supabase and Stripe clients.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase
const mockSupabaseFrom = vi.fn();
const mockSupabaseAuth = {
  getSession: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: mockSupabaseFrom,
    auth: mockSupabaseAuth,
  })),
}));

// Mock Stripe processor
const mockCreateCheckoutSession = vi.fn();
const mockFetchCustomerPortalUrl = vi.fn();

vi.mock('@/lib/payment/stripe/stripe-processor', () => ({
  stripeProcessor: {
    id: 'stripe',
    createCheckoutSession: (...args: any[]) => mockCreateCheckoutSession(...args),
    fetchCustomerPortalUrl: (...args: any[]) => mockFetchCustomerPortalUrl(...args),
    handleWebhookEvent: vi.fn(),
  },
}));

// Mock plans
vi.mock('@/lib/payment/plans', () => ({
  getPlanConfig: vi.fn((planId: string) => ({
    id: planId,
    stripePriceId: `price_${planId}_test`,
    name: planId === 'pro' ? 'Pro' : 'Agência',
    priceBRL: planId === 'pro' ? 47 : 147,
    effect: 'subscription',
    credits: planId === 'pro' ? 200 : 1000,
    leadLimit: planId === 'pro' ? 200 : 1000,
    features: [],
    isRecommended: planId === 'pro',
  })),
  PLAN_CREDITS: { freemium: 20, pro: 200, agencia: 1000 },
}));

// Import after mocking
import {
  createCheckout,
  getPortalUrl,
  getUserBillingInfo,
  getCreditBalance,
} from '@/lib/services/billing-service';

// Helper to create chainable Supabase mock
function createChain(resolvedValue: any) {
  const chain: any = {};
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'single'];
  methods.forEach(method => {
    chain[method] = vi.fn(() => chain);
  });
  chain.then = (fn: any) => Promise.resolve(resolvedValue).then(fn);
  chain.catch = (fn: any) => Promise.resolve(resolvedValue).catch(fn);
  return chain;
}

describe('Billing Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckout', () => {
    it('deve criar sessão de checkout para plano Pro', async () => {
      const chain = createChain({
        data: { stripe_customer_id: 'cus_existing' },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(chain);

      mockCreateCheckoutSession.mockResolvedValue({
        sessionId: 'cs_test_123',
        sessionUrl: 'https://checkout.stripe.com/session/cs_test_123',
        stripeCustomerId: 'cus_existing',
      });

      const result = await createCheckout(
        'user-1',
        'user@example.com',
        'pro',
        'https://app.com/success',
        'https://app.com/cancel'
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessionUrl).toContain('checkout.stripe.com');
        expect(result.data.sessionId).toBe('cs_test_123');
      }
    });

    it('deve retornar erro quando Stripe Price ID não está configurado', async () => {
      const { getPlanConfig } = await import('@/lib/payment/plans');
      (getPlanConfig as any).mockReturnValueOnce({
        id: 'pro',
        stripePriceId: '',
        name: 'Pro',
        effect: 'subscription',
      });

      const chain = createChain({
        data: { stripe_customer_id: null },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await createCheckout(
        'user-1',
        'user@example.com',
        'pro',
        'https://app.com/success',
        'https://app.com/cancel'
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Stripe Price ID not configured');
      }
    });

    it('deve salvar novo Stripe customer ID quando criado', async () => {
      const selectChain = createChain({
        data: { stripe_customer_id: null },
        error: null,
      });
      const updateChain = createChain({ data: null, error: null });

      let callCount = 0;
      mockSupabaseFrom.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? selectChain : updateChain;
      });

      mockCreateCheckoutSession.mockResolvedValue({
        sessionId: 'cs_test_new',
        sessionUrl: 'https://checkout.stripe.com/session/cs_test_new',
        stripeCustomerId: 'cus_new_123',
      });

      const result = await createCheckout(
        'user-1',
        'user@example.com',
        'pro',
        'https://app.com/success',
        'https://app.com/cancel'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('getPortalUrl', () => {
    it('deve retornar URL do portal para cliente existente', async () => {
      const chain = createChain({
        data: { stripe_customer_id: 'cus_existing' },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(chain);

      mockFetchCustomerPortalUrl.mockResolvedValue('https://billing.stripe.com/session/portal_123');

      const result = await getPortalUrl('user-1', 'https://app.com/dashboard');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.portalUrl).toContain('billing.stripe.com');
      }
    });

    it('deve retornar null quando usuário não tem Stripe customer', async () => {
      const chain = createChain({
        data: { stripe_customer_id: null },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(chain);

      mockFetchCustomerPortalUrl.mockResolvedValue(null);

      const result = await getPortalUrl('user-1', 'https://app.com/dashboard');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.portalUrl).toBeNull();
      }
    });
  });

  describe('getUserBillingInfo', () => {
    it('deve retornar informações de billing do consultor', async () => {
      const chain = createChain({
        data: {
          id: 'consultant-1',
          email: 'test@example.com',
          stripe_customer_id: 'cus_123',
          subscription_status: 'active',
          subscription_plan: 'pro',
          date_paid: '2026-01-15T00:00:00Z',
          credits: 180,
          purchased_credits: 50,
          monthly_credits_allocation: 200,
          credits_reset_at: null,
          is_admin: false,
        },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getUserBillingInfo('user-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.subscriptionPlan).toBe('pro');
        expect(result.data.subscriptionStatus).toBe('active');
        expect(result.data.credits).toBe(180);
        expect(result.data.purchasedCredits).toBe(50);
      }
    });

    it('deve retornar erro quando usuário não encontrado', async () => {
      const chain = createChain({
        data: null,
        error: { message: 'No rows found' },
      });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getUserBillingInfo('nonexistent');

      expect(result.success).toBe(false);
    });
  });

  describe('getCreditBalance', () => {
    it('deve retornar saldo de créditos com informações do plano', async () => {
      const chain = createChain({
        data: {
          credits: 150,
          purchased_credits: 30,
          monthly_credits_allocation: 200,
          subscription_plan: 'pro',
          subscription_status: 'active',
          credits_reset_at: '2026-03-01T00:05:00Z',
        },
        error: null,
      });
      mockSupabaseFrom.mockReturnValue(chain);

      const result = await getCreditBalance('user-1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.credits).toBe(150);
        expect(result.data.purchasedCredits).toBe(30);
        expect(result.data.monthlyAllocation).toBe(200);
        expect(result.data.subscriptionPlan).toBe('pro');
      }
    });
  });
});
