/**
 * Stripe webhook event handler.
 * Processes invoice.paid, subscription.updated, and subscription.deleted events.
 *
 * Edge cases handled:
 * - Unknown user webhooks: log error and return processed=true (200) to prevent Stripe retries
 * - Re-subscription: update status to active without duplicating credits
 *
 * @see specs/002-saas-billing-admin/contracts/billing-api.md
 */

import type Stripe from 'stripe';
import type { WebhookEventResult } from '../payment-processor';
import { createServiceClient } from '@/lib/supabase/server';
import { PLAN_CREDITS } from '@/lib/payment/plans';
import type { SubscriptionPlan } from '@/types/billing';
import type { Database } from '@/types/database';
import { sendCancellationEmail } from '@/lib/services/email-service';

type Consultant = Database['public']['Tables']['consultants']['Row'];
type ConsultantUpdate = Database['public']['Tables']['consultants']['Update'];

/**
 * Route a Stripe webhook event to the appropriate handler.
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<WebhookEventResult> {
  switch (event.type) {
    case 'invoice.paid':
      return handleInvoicePaid(event);
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event);
    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event);
    default:
      return { type: event.type, processed: false };
  }
}

/**
 * Find consultant by Stripe customer ID.
 */
async function findConsultantByCustomerId(customerId: string): Promise<Consultant | null> {
  const supabase = createServiceClient();
  const query = supabase.from('consultants').select().eq('stripe_customer_id', customerId).single();

  const { data, error } = await query;

  if (error || !data) {
    console.error(`[webhook] Consultant not found for customer ${customerId}:`, error?.message);
    return null;
  }

  return data as Consultant;
}

/**
 * Update consultant fields.
 */
async function updateConsultant(consultantId: string, updates: ConsultantUpdate): Promise<void> {
  const supabase = createServiceClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = supabase.from('consultants') as any;
  const { error } = await table.update(updates).eq('id', consultantId);

  if (error) {
    console.error(`[webhook] Failed to update consultant ${consultantId}:`, error.message);
  }
}

/**
 * Handle invoice.paid — either a subscription payment or a credit pack purchase.
 */
async function handleInvoicePaid(event: Stripe.Event): Promise<WebhookEventResult> {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

  if (!customerId) {
    console.error('[webhook] invoice.paid missing customer ID');
    return { type: event.type, processed: true };
  }

  const consultant = await findConsultantByCustomerId(customerId);

  if (!consultant) {
    // Unknown user — return 200 to stop Stripe retries (already logged)
    return { type: event.type, processed: true };
  }

  // Check if this is a credit pack purchase via metadata
  const planId = invoice.metadata?.planId;
  const planEffect = invoice.metadata?.planEffect;

  if (planEffect === 'credits' || planId === 'credits50') {
    // Credit pack purchase — add to purchased_credits (permanent)
    const creditsToAdd = 50;
    await updateConsultant(consultant.id, {
      purchased_credits: (consultant.purchased_credits || 0) + creditsToAdd,
      credits: (consultant.credits || 0) + creditsToAdd,
      date_paid: new Date().toISOString(),
    });

    return { type: event.type, userId: consultant.id, processed: true };
  }

  // Subscription payment — update status and plan
  const subscriptionPlan = (invoice.metadata?.planId || 'pro') as SubscriptionPlan;
  const monthlyCredits = PLAN_CREDITS[subscriptionPlan] || 200;

  const updates: ConsultantUpdate = {
    subscription_status: 'active',
    subscription_plan: subscriptionPlan,
    date_paid: new Date().toISOString(),
    monthly_credits_allocation: monthlyCredits,
  };

  // Only reset credits on plan change, not on renewal
  if (consultant.subscription_plan !== subscriptionPlan) {
    updates.credits = monthlyCredits + (consultant.purchased_credits || 0);
  }

  await updateConsultant(consultant.id, updates);

  return { type: event.type, userId: consultant.id, processed: true };
}

/**
 * Handle subscription.updated — plan change or status change.
 */
async function handleSubscriptionUpdated(event: Stripe.Event): Promise<WebhookEventResult> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  if (!customerId) {
    console.error('[webhook] subscription.updated missing customer ID');
    return { type: event.type, processed: true };
  }

  const consultant = await findConsultantByCustomerId(customerId);

  if (!consultant) {
    return { type: event.type, processed: true };
  }

  // Map Stripe status to our status
  let status: string;
  if (subscription.cancel_at_period_end) {
    status = 'cancel_at_period_end';
  } else {
    status = subscription.status === 'active' ? 'active' : subscription.status;
  }

  await updateConsultant(consultant.id, { subscription_status: status });

  return { type: event.type, userId: consultant.id, processed: true };
}

/**
 * Handle subscription.deleted — cancellation confirmed.
 */
async function handleSubscriptionDeleted(event: Stripe.Event): Promise<WebhookEventResult> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

  if (!customerId) {
    console.error('[webhook] subscription.deleted missing customer ID');
    return { type: event.type, processed: true };
  }

  const consultant = await findConsultantByCustomerId(customerId);

  if (!consultant) {
    return { type: event.type, processed: true };
  }

  // Downgrade to freemium, keep purchased credits
  await updateConsultant(consultant.id, {
    subscription_status: 'deleted',
    subscription_plan: 'freemium',
    monthly_credits_allocation: 20,
    credits: 20 + (consultant.purchased_credits || 0),
  });

  // Send retention email (non-blocking)
  sendCancellationEmail(consultant.email, consultant.name || 'Consultor').catch(() => {});

  return { type: event.type, userId: consultant.id, processed: true };
}
