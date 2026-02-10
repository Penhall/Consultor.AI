/**
 * Stripe implementation of the PaymentProcessor interface.
 * Handles checkout sessions, customer portal, and webhook events.
 *
 * @see specs/002-saas-billing-admin/contracts/billing-api.md
 */

import type Stripe from 'stripe';
import { getStripeClient } from './stripe-client';
import type {
  PaymentProcessor,
  CreateCheckoutSessionArgs,
  CheckoutSessionResult,
  FetchCustomerPortalUrlArgs,
  WebhookEventResult,
} from '../payment-processor';
import { handleStripeWebhook } from './webhook-handler';

/**
 * Ensure a Stripe customer exists for the given user.
 * Creates one if not found.
 */
async function ensureStripeCustomer(
  stripe: Stripe,
  userId: string,
  email: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  return customer.id;
}

export const stripeProcessor: PaymentProcessor = {
  id: 'stripe',

  async createCheckoutSession(args: CreateCheckoutSessionArgs): Promise<CheckoutSessionResult> {
    const stripe = getStripeClient();

    const customerId = await ensureStripeCustomer(
      stripe,
      args.userId,
      args.userEmail,
      args.existingCustomerId
    );

    const planConfig = args.planConfig;
    const mode: Stripe.Checkout.SessionCreateParams.Mode =
      planConfig.effect === 'subscription' ? 'subscription' : 'payment';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode,
      line_items: [
        {
          price: planConfig.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      metadata: {
        userId: args.userId,
        planId: planConfig.id,
        planEffect: planConfig.effect,
      },
      locale: 'pt-BR' as Stripe.Checkout.SessionCreateParams.Locale,
    };

    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: {
          userId: args.userId,
          planId: planConfig.id,
        },
      };
    }

    if (mode === 'payment') {
      sessionParams.payment_intent_data = {
        metadata: {
          userId: args.userId,
          planId: planConfig.id,
          planEffect: planConfig.effect,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      sessionId: session.id,
      sessionUrl: session.url!,
      stripeCustomerId: customerId,
    };
  },

  async fetchCustomerPortalUrl(args: FetchCustomerPortalUrlArgs): Promise<string | null> {
    if (!args.customerId) {
      return null;
    }

    const stripe = getStripeClient();

    const session = await stripe.billingPortal.sessions.create({
      customer: args.customerId,
      return_url: args.returnUrl,
    });

    return session.url;
  },

  async handleWebhookEvent(
    rawBody: string | Buffer,
    signature: string
  ): Promise<WebhookEventResult> {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    return handleStripeWebhook(event);
  },
};

export { ensureStripeCustomer };
