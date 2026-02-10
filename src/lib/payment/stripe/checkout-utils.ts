/**
 * Checkout session helper utilities.
 * Convenience wrappers for creating subscription vs credit checkout sessions.
 */

import { createCheckout } from '@/lib/services/billing-service';
import type { PaymentPlanId } from '@/types/billing';

const DEFAULT_SUCCESS_URL = '/checkout?status=success&session_id={CHECKOUT_SESSION_ID}';
const DEFAULT_CANCEL_URL = '/checkout?status=cancel';

/**
 * Build full URL from a relative path.
 */
function buildUrl(basePath: string, origin: string): string {
  return `${origin}${basePath}`;
}

/**
 * Create a subscription checkout session (Pro or Agência).
 */
export async function createSubscriptionCheckout(
  userId: string,
  userEmail: string,
  planId: 'pro' | 'agencia',
  origin: string
) {
  return createCheckout(
    userId,
    userEmail,
    planId,
    buildUrl(DEFAULT_SUCCESS_URL, origin),
    buildUrl(DEFAULT_CANCEL_URL, origin)
  );
}

/**
 * Create a one-time credit pack checkout session.
 */
export async function createCreditsCheckout(userId: string, userEmail: string, origin: string) {
  return createCheckout(
    userId,
    userEmail,
    'credits50' as PaymentPlanId,
    buildUrl(DEFAULT_SUCCESS_URL, origin),
    buildUrl(DEFAULT_CANCEL_URL, origin)
  );
}
