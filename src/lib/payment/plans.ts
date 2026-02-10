/**
 * Plan definitions and configuration for Consultor.AI subscription tiers.
 * Maps plan IDs to Stripe Price IDs and feature sets.
 *
 * @see specs/002-saas-billing-admin/data-model.md for plan-to-credits mapping
 */

import type { PaymentPlanId, PlanConfig, SubscriptionPlan } from '@/types/billing';

/** Plan configurations indexed by PaymentPlanId */
export const PLAN_CONFIGS: Record<PaymentPlanId, PlanConfig> = {
  pro: {
    id: 'pro',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    name: 'Pro',
    priceBRL: 47,
    effect: 'subscription',
    credits: 200,
    leadLimit: 200,
    features: [
      '200 leads/mês',
      '200 créditos IA/mês',
      'Follow-up automático',
      'Exportação CSV',
      'Suporte prioritário',
    ],
    isRecommended: true,
  },
  agencia: {
    id: 'agencia',
    stripePriceId: process.env.STRIPE_AGENCIA_PRICE_ID ?? '',
    name: 'Agência',
    priceBRL: 147,
    effect: 'subscription',
    credits: 1000,
    leadLimit: 1000,
    features: [
      '1.000 leads/mês',
      '1.000 créditos IA/mês',
      'Fluxos customizados',
      'Dashboard avançado',
      'Integração CRM',
      'Suporte dedicado',
    ],
    isRecommended: false,
  },
  credits50: {
    id: 'credits50',
    stripePriceId: process.env.STRIPE_CREDITS50_PRICE_ID ?? '',
    name: '50 Créditos',
    priceBRL: 19.9,
    effect: 'credits',
    credits: 50,
    leadLimit: 0,
    features: ['50 créditos de IA', 'Não expiram', 'Uso imediato'],
    isRecommended: false,
  },
};

/** Freemium plan defaults (no Stripe Price ID needed) */
export const FREEMIUM_PLAN = {
  name: 'Freemium',
  priceBRL: 0,
  credits: 20,
  leadLimit: 20,
  features: ['20 leads/mês', '20 créditos IA/mês', 'Fluxo padrão de saúde', 'Mensagens de texto'],
} as const;

/** Map subscription plan to monthly credit allocation */
export const PLAN_CREDITS: Record<SubscriptionPlan, number> = {
  freemium: 20,
  pro: 200,
  agencia: 1000,
};

/** Map subscription plan to monthly lead limit */
export const PLAN_LEAD_LIMITS: Record<SubscriptionPlan, number> = {
  freemium: 20,
  pro: 200,
  agencia: 1000,
};

/**
 * Get a plan config by its ID.
 * @throws Error if plan ID is invalid
 */
export function getPlanConfig(planId: PaymentPlanId): PlanConfig {
  const config = PLAN_CONFIGS[planId];
  if (!config) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }
  return config;
}

/**
 * Check if a plan ID is valid.
 */
export function isValidPlanId(planId: string): planId is PaymentPlanId {
  return planId in PLAN_CONFIGS;
}
