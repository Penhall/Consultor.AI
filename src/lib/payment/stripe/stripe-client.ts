/**
 * Stripe SDK initialization singleton.
 * Provides a configured Stripe instance for server-side operations.
 *
 * @example
 * import { getStripeClient } from '@/lib/payment/stripe/stripe-client';
 * const stripe = getStripeClient();
 * const session = await stripe.checkout.sessions.create({...});
 */

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Get or create the Stripe client singleton.
 * @throws Error if STRIPE_SECRET_KEY is not configured
 */
export function getStripeClient(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured. Set it in .env.local');
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
    appInfo: {
      name: 'Consultor.AI',
      version: '0.4.0',
    },
  });

  return stripeInstance;
}

/**
 * Reset the Stripe client singleton (for testing).
 */
export function resetStripeClient(): void {
  stripeInstance = null;
}
