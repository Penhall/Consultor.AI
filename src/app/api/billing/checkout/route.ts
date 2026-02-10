/**
 * Billing Checkout API Route
 *
 * POST /api/billing/checkout - Create a Stripe Checkout session
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckout } from '@/lib/services/billing-service';
import { checkoutSchema } from '@/lib/validations/billing';
import type { ApiResponse } from '@/types/api';
import type { CheckoutSessionResponse } from '@/types/billing';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Dados inválidos',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { planId } = parsed.data;
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const successUrl = `${origin}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/checkout?status=cancel`;

    const result = await createCheckout(
      session.user.id,
      session.user.email!,
      planId,
      successUrl,
      cancelUrl
    );

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<CheckoutSessionResponse>>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('POST /api/billing/checkout error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
