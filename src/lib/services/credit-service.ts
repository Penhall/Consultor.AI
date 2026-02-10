/**
 * Credit Service
 *
 * Handles credit balance operations: atomic decrement via RPC,
 * balance checks, purchased credit additions.
 */

import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type Consultant = Database['public']['Tables']['consultants']['Row'];
type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Atomically decrement credits using RPC.
 * @throws if insufficient credits
 */
export async function decrementCredits(
  userId: string,
  amount: number = 1
): Promise<ServiceResult<{ remaining: number }>> {
  try {
    const supabase = await createClient();

    // Get consultant ID from user_id
    const consultantQuery = supabase.from('consultants').select().eq('user_id', userId).single();
    const { data: rawData } = await consultantQuery;
    const consultant = rawData as Consultant | null;

    if (!consultant) {
      return { success: false, error: 'User not found' };
    }

    // Use RPC for atomic decrement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: remaining, error } = await (supabase.rpc as any)('decrement_credits', {
      user_id: consultant.id,
      amount,
    });

    if (error) {
      if (error.message.includes('Insufficient credits')) {
        return {
          success: false,
          error: 'Créditos insuficientes. Faça upgrade do seu plano ou compre créditos adicionais.',
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: { remaining: remaining as number } };
  } catch (error) {
    console.error('Failed to decrement credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to decrement credits',
    };
  }
}

/**
 * Check if user has enough credits.
 */
export async function checkBalance(
  userId: string,
  required: number = 1
): Promise<ServiceResult<{ hasCredits: boolean; balance: number }>> {
  try {
    const supabase = await createClient();

    const consultantQuery = supabase.from('consultants').select().eq('user_id', userId).single();
    const { data: rawData, error } = await consultantQuery;

    if (error || !rawData) {
      return { success: false, error: 'User not found' };
    }

    const consultant = rawData as Consultant;

    return {
      success: true,
      data: {
        hasCredits: consultant.credits >= required,
        balance: consultant.credits,
      },
    };
  } catch (error) {
    console.error('Failed to check balance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check balance',
    };
  }
}

/**
 * Add purchased credits to a user (permanent, never expire).
 */
export async function addPurchasedCredits(
  consultantId: string,
  amount: number
): Promise<ServiceResult<{ credits: number; purchasedCredits: number }>> {
  try {
    const supabase = createServiceClient();

    const consultantQuery = supabase.from('consultants').select().eq('id', consultantId).single();
    const { data: rawData, error: findError } = await consultantQuery;

    if (findError || !rawData) {
      return { success: false, error: 'Consultant not found' };
    }

    const consultant = rawData as Consultant;
    const newPurchased = (consultant.purchased_credits || 0) + amount;
    const newCredits = (consultant.credits || 0) + amount;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('consultants') as any;
    const { error: updateError } = await table
      .update({
        purchased_credits: newPurchased,
        credits: newCredits,
      })
      .eq('id', consultantId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return {
      success: true,
      data: { credits: newCredits, purchasedCredits: newPurchased },
    };
  } catch (error) {
    console.error('Failed to add purchased credits:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add credits',
    };
  }
}
