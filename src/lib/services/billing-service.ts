/**
 * Billing Service
 *
 * Business logic layer for subscription management, checkout, and portal access.
 * Orchestrates between Stripe processor and Supabase database.
 */

import { createClient } from '@/lib/supabase/server';
import { stripeProcessor } from '@/lib/payment/stripe/stripe-processor';
import { getPlanConfig } from '@/lib/payment/plans';
import type { PaymentPlanId, CreditBalance, ConsultantBilling } from '@/types/billing';
import type { Database } from '@/types/database';

type Consultant = Database['public']['Tables']['consultants']['Row'];
type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Create a Stripe Checkout session for a plan.
 */
export async function createCheckout(
  userId: string,
  userEmail: string,
  planId: PaymentPlanId,
  successUrl: string,
  cancelUrl: string
): Promise<ServiceResult<{ sessionUrl: string; sessionId: string }>> {
  try {
    const planConfig = getPlanConfig(planId);

    if (!planConfig.stripePriceId) {
      return {
        success: false,
        error: `Stripe Price ID not configured for plan: ${planId}`,
      };
    }

    // Get existing Stripe customer ID
    const supabase = await createClient();
    const consultantQuery = supabase.from('consultants').select().eq('user_id', userId).single();
    const { data } = await consultantQuery;
    const consultant = data as Consultant | null;

    const result = await stripeProcessor.createCheckoutSession({
      userId,
      userEmail,
      planConfig,
      existingCustomerId: consultant?.stripe_customer_id,
      successUrl,
      cancelUrl,
    });

    // Save Stripe customer ID if newly created
    if (result.stripeCustomerId && result.stripeCustomerId !== consultant?.stripe_customer_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = supabase.from('consultants') as any;
      await table.update({ stripe_customer_id: result.stripeCustomerId }).eq('user_id', userId);
    }

    return {
      success: true,
      data: {
        sessionUrl: result.sessionUrl,
        sessionId: result.sessionId,
      },
    };
  } catch (error) {
    console.error('Failed to create checkout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    };
  }
}

/**
 * Get Stripe Customer Portal URL for managing subscription.
 */
export async function getPortalUrl(
  userId: string,
  returnUrl: string
): Promise<ServiceResult<{ portalUrl: string | null }>> {
  try {
    const supabase = await createClient();
    const portalQuery = supabase.from('consultants').select().eq('user_id', userId).single();
    const { data: portalData } = await portalQuery;
    const consultant = portalData as Consultant | null;

    const portalUrl = await stripeProcessor.fetchCustomerPortalUrl({
      customerId: consultant?.stripe_customer_id ?? null,
      returnUrl,
    });

    return { success: true, data: { portalUrl } };
  } catch (error) {
    console.error('Failed to get portal URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get portal URL',
    };
  }
}

/**
 * Get billing info for a user.
 */
export async function getUserBillingInfo(
  userId: string
): Promise<ServiceResult<ConsultantBilling>> {
  try {
    const supabase = await createClient();
    const billingQuery = supabase.from('consultants').select().eq('user_id', userId).single();
    const { data: rawData, error } = await billingQuery;

    if (error || !rawData) {
      return { success: false, error: 'User not found' };
    }

    const data = rawData as Consultant;

    return {
      success: true,
      data: {
        id: data.id,
        email: data.email,
        stripeCustomerId: data.stripe_customer_id,
        subscriptionStatus: data.subscription_status as ConsultantBilling['subscriptionStatus'],
        subscriptionPlan: data.subscription_plan as ConsultantBilling['subscriptionPlan'],
        datePaid: data.date_paid,
        credits: data.credits,
        purchasedCredits: data.purchased_credits,
        monthlyCreditsAllocation: data.monthly_credits_allocation,
        creditsResetAt: data.credits_reset_at,
        isAdmin: data.is_admin,
      },
    };
  } catch (error) {
    console.error('Failed to get billing info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get billing info',
    };
  }
}

/**
 * Get credit balance for a user.
 */
export async function getCreditBalance(userId: string): Promise<ServiceResult<CreditBalance>> {
  try {
    const supabase = await createClient();
    const creditsQuery = supabase.from('consultants').select().eq('user_id', userId).single();
    const { data: rawData, error } = await creditsQuery;

    if (error || !rawData) {
      return { success: false, error: 'User not found' };
    }

    const data = rawData as Consultant;

    return {
      success: true,
      data: {
        credits: data.credits,
        purchasedCredits: data.purchased_credits,
        monthlyAllocation: data.monthly_credits_allocation,
        subscriptionPlan: data.subscription_plan as CreditBalance['subscriptionPlan'],
        subscriptionStatus: data.subscription_status as CreditBalance['subscriptionStatus'],
        creditsResetAt: data.credits_reset_at,
      },
    };
  } catch (error) {
    console.error('Failed to get credit balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get credit balance',
    };
  }
}
