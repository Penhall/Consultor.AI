/**
 * Stripe Webhook API Route
 *
 * POST /api/billing/webhook - Handle Stripe webhook events
 *
 * IMPORTANT: Body parser is disabled for this route to allow raw body access
 * for Stripe signature verification.
 */

import { NextResponse } from 'next/server';
import { stripeProcessor } from '@/lib/payment/stripe/stripe-processor';

/** Disable Next.js body parsing for raw body access */
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const rawBody = await request.text();

    const result = await stripeProcessor.handleWebhookEvent(rawBody, signature);

    return NextResponse.json({ received: true, type: result.type });
  } catch (error) {
    console.error('Webhook error:', error);

    if (error instanceof Error && error.message.includes('signature')) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
