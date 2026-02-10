/**
 * PaymentProcessor interface — Strategy Pattern for payment providers.
 * Allows swapping between Stripe, LemonSqueezy, or Polar implementations.
 *
 * @see specs/002-saas-billing-admin/research.md R1 for decision rationale
 */

import type { PlanConfig } from '@/types/billing';

/** Arguments for creating a checkout session */
export interface CreateCheckoutSessionArgs {
  /** User ID in our database */
  userId: string;
  /** User email for Stripe customer creation */
  userEmail: string;
  /** Resolved plan configuration */
  planConfig: PlanConfig;
  /** Existing Stripe customer ID (if any) */
  existingCustomerId?: string | null;
  /** URL to redirect after successful payment */
  successUrl: string;
  /** URL to redirect if user cancels checkout */
  cancelUrl: string;
}

/** Result of creating a checkout session */
export interface CheckoutSessionResult {
  sessionId: string;
  sessionUrl: string;
  /** Stripe customer ID (may be newly created) */
  stripeCustomerId: string;
}

/** Arguments for fetching customer portal URL */
export interface FetchCustomerPortalUrlArgs {
  /** Stripe customer ID (null if user has no Stripe customer) */
  customerId: string | null;
  /** URL to redirect after portal session ends */
  returnUrl: string;
}

/** Webhook event payload after processing */
export interface WebhookEventResult {
  type: string;
  userId?: string;
  processed: boolean;
}

/**
 * Payment processor interface using Strategy Pattern.
 * Each payment provider (Stripe, LemonSqueezy, etc.) implements this interface.
 */
export interface PaymentProcessor {
  /** Provider identifier */
  readonly id: 'stripe' | 'lemonsqueezy' | 'polar';

  /** Create a checkout session for subscription or one-time purchase */
  createCheckoutSession(args: CreateCheckoutSessionArgs): Promise<CheckoutSessionResult>;

  /** Get a URL for the customer to manage their subscription */
  fetchCustomerPortalUrl(args: FetchCustomerPortalUrlArgs): Promise<string | null>;

  /** Verify and process a webhook event from the provider */
  handleWebhookEvent(rawBody: string | Buffer, signature: string): Promise<WebhookEventResult>;
}
