/**
 * Zod validation schemas for billing API inputs.
 */

import { z } from 'zod';

/** Valid plan IDs for checkout */
export const paymentPlanIdSchema = z.enum(['pro', 'agencia', 'credits50'], {
  errorMap: () => ({ message: 'Invalid plan ID' }),
});

/** POST /api/billing/checkout request body */
export const checkoutSchema = z.object({
  planId: paymentPlanIdSchema,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** GET /api/billing/credits query (no params needed, but schema for consistency) */
export const creditsQuerySchema = z.object({}).optional();
