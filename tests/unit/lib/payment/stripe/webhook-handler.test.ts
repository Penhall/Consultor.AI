/**
 * Stripe Webhook Handler Tests
 *
 * Tests invoice.paid (subscription + credits), subscription.updated,
 * and subscription.deleted event processing.
 * Includes edge cases: unknown user, re-subscription.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type Stripe from 'stripe';

// Mock Supabase service client

function createQueryChain(resolvedValue: any) {
  const chain: any = {
    select: vi.fn(() => chain),
    update: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(resolvedValue)),
  };
  return chain;
}

let mockQueryResult: any = { data: null, error: null };

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => createQueryChain(mockQueryResult)),
  })),
}));

vi.mock('@/lib/payment/plans', () => ({
  PLAN_CREDITS: { freemium: 20, pro: 200, agencia: 1000 },
}));

import { handleStripeWebhook } from '@/lib/payment/stripe/webhook-handler';

function createStripeEvent(type: string, data: Record<string, unknown>): Stripe.Event {
  return {
    id: `evt_test_${Date.now()}`,
    type,
    data: { object: data },
    object: 'event',
    api_version: '2026-01-28',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as unknown as Stripe.Event;
}

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResult = { data: null, error: null };
  });

  describe('invoice.paid', () => {
    it('deve atualizar subscription para active com plano correto', async () => {
      mockQueryResult = {
        data: {
          id: 'consultant-1',
          subscription_plan: null,
          credits: 20,
          purchased_credits: 0,
        },
        error: null,
      };

      const event = createStripeEvent('invoice.paid', {
        customer: 'cus_123',
        subscription: 'sub_123',
        metadata: { planId: 'pro', planEffect: 'subscription' },
      });

      const result = await handleStripeWebhook(event);

      expect(result.type).toBe('invoice.paid');
      expect(result.processed).toBe(true);
      expect(result.userId).toBe('consultant-1');
    });

    it('deve adicionar créditos para compra de pacote credits50', async () => {
      mockQueryResult = {
        data: {
          id: 'consultant-1',
          subscription_plan: 'pro',
          credits: 150,
          purchased_credits: 0,
        },
        error: null,
      };

      const event = createStripeEvent('invoice.paid', {
        customer: 'cus_123',
        metadata: { planId: 'credits50', planEffect: 'credits' },
      });

      const result = await handleStripeWebhook(event);

      expect(result.type).toBe('invoice.paid');
      expect(result.processed).toBe(true);
      expect(result.userId).toBe('consultant-1');
    });

    it('deve logar e retornar processed=true para cliente desconhecido', async () => {
      mockQueryResult = {
        data: null,
        error: { message: 'No rows found' },
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const event = createStripeEvent('invoice.paid', {
        customer: 'cus_unknown',
        metadata: {},
      });

      const result = await handleStripeWebhook(event);

      expect(result.type).toBe('invoice.paid');
      expect(result.processed).toBe(true);
      expect(result.userId).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('deve processar re-subscription sem duplicar créditos', async () => {
      // User already on pro plan, same plan re-subscribing
      mockQueryResult = {
        data: {
          id: 'consultant-1',
          subscription_plan: 'pro',
          credits: 180,
          purchased_credits: 30,
        },
        error: null,
      };

      const event = createStripeEvent('invoice.paid', {
        customer: 'cus_123',
        subscription: 'sub_new',
        metadata: { planId: 'pro', planEffect: 'subscription' },
      });

      const result = await handleStripeWebhook(event);

      expect(result.type).toBe('invoice.paid');
      expect(result.processed).toBe(true);
      expect(result.userId).toBe('consultant-1');
    });
  });

  describe('customer.subscription.updated', () => {
    it('deve atualizar status para cancel_at_period_end', async () => {
      mockQueryResult = {
        data: { id: 'consultant-1' },
        error: null,
      };

      const event = createStripeEvent('customer.subscription.updated', {
        customer: 'cus_123',
        status: 'active',
        cancel_at_period_end: true,
      });

      const result = await handleStripeWebhook(event);

      expect(result.type).toBe('customer.subscription.updated');
      expect(result.processed).toBe(true);
      expect(result.userId).toBe('consultant-1');
    });

    it('deve atualizar status para active quando não está cancelando', async () => {
      mockQueryResult = {
        data: { id: 'consultant-1' },
        error: null,
      };

      const event = createStripeEvent('customer.subscription.updated', {
        customer: 'cus_123',
        status: 'active',
        cancel_at_period_end: false,
      });

      const result = await handleStripeWebhook(event);

      expect(result.type).toBe('customer.subscription.updated');
      expect(result.processed).toBe(true);
    });

    it('deve logar e retornar processed=true para cliente desconhecido', async () => {
      mockQueryResult = {
        data: null,
        error: { message: 'No rows found' },
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const event = createStripeEvent('customer.subscription.updated', {
        customer: 'cus_unknown',
        status: 'active',
        cancel_at_period_end: false,
      });

      const result = await handleStripeWebhook(event);

      expect(result.processed).toBe(true);
      expect(result.userId).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('customer.subscription.deleted', () => {
    it('deve fazer downgrade para freemium mantendo créditos comprados', async () => {
      mockQueryResult = {
        data: {
          id: 'consultant-1',
          purchased_credits: 30,
        },
        error: null,
      };

      const event = createStripeEvent('customer.subscription.deleted', {
        customer: 'cus_123',
      });

      const result = await handleStripeWebhook(event);

      expect(result.type).toBe('customer.subscription.deleted');
      expect(result.processed).toBe(true);
      expect(result.userId).toBe('consultant-1');
    });

    it('deve logar e retornar processed=true para cliente desconhecido', async () => {
      mockQueryResult = {
        data: null,
        error: { message: 'No rows found' },
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const event = createStripeEvent('customer.subscription.deleted', {
        customer: 'cus_unknown',
      });

      const result = await handleStripeWebhook(event);

      expect(result.processed).toBe(true);
      expect(result.userId).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('unhandled events', () => {
    it('deve retornar processed=false para eventos desconhecidos', async () => {
      const event = createStripeEvent('charge.refunded', {
        id: 'ch_123',
      });

      const result = await handleStripeWebhook(event);

      expect(result.type).toBe('charge.refunded');
      expect(result.processed).toBe(false);
    });
  });
});
