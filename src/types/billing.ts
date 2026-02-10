/**
 * Billing & subscription type definitions for Consultor.AI SaaS features.
 * Maps to consultants table billing fields and Stripe integration.
 */

/** Subscription lifecycle states */
export type SubscriptionStatus = 'active' | 'cancel_at_period_end' | 'past_due' | 'deleted';

/** Available subscription plans */
export type SubscriptionPlan = 'freemium' | 'pro' | 'agencia';

/** Stripe Checkout plan identifiers (includes credit packs) */
export type PaymentPlanId = 'pro' | 'agencia' | 'credits50';

/** How a payment plan affects the user account */
export type PaymentPlanEffect = 'subscription' | 'credits';

/** Configuration for a single payment plan */
export interface PlanConfig {
  /** Unique plan identifier for Stripe checkout */
  id: PaymentPlanId;
  /** Stripe Price ID from environment variables */
  stripePriceId: string;
  /** Plan display name (Portuguese) */
  name: string;
  /** Monthly price in BRL (0 for free) */
  priceBRL: number;
  /** How this plan affects the user (subscription or one-time credits) */
  effect: PaymentPlanEffect;
  /** Monthly credit allocation (for subscription plans) */
  credits: number;
  /** Monthly lead limit */
  leadLimit: number;
  /** Feature list for pricing page display (Portuguese) */
  features: string[];
  /** Whether this is the recommended/highlighted plan */
  isRecommended: boolean;
}

/** Billing info returned by GET /api/billing/credits */
export interface CreditBalance {
  credits: number;
  purchasedCredits: number;
  monthlyAllocation: number;
  subscriptionPlan: SubscriptionPlan | null;
  subscriptionStatus: SubscriptionStatus | null;
  creditsResetAt: string | null;
}

/** Checkout session response from POST /api/billing/checkout */
export interface CheckoutSessionResponse {
  sessionUrl: string;
  sessionId: string;
}

/** Portal URL response from GET /api/billing/portal */
export interface PortalResponse {
  portalUrl: string | null;
}

/** Consultant billing fields (subset of consultants table) */
export interface ConsultantBilling {
  id: string;
  email: string;
  stripeCustomerId: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionPlan: SubscriptionPlan | null;
  datePaid: string | null;
  credits: number;
  purchasedCredits: number;
  monthlyCreditsAllocation: number;
  creditsResetAt: string | null;
  isAdmin: boolean;
}
