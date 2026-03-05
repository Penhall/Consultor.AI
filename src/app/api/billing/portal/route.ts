/**
 * Billing Portal API Route
 *
 * GET /api/billing/portal - Get Stripe Customer Portal URL
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPortalUrl } from '@/lib/services/billing-service';
import type { ApiResponse } from '@/types/api';
import type { PortalResponse } from '@/types/billing';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const returnUrl = `${origin}/dashboard`;

    const result = await getPortalUrl(user.id, returnUrl);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<PortalResponse>>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('GET /api/billing/portal error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
