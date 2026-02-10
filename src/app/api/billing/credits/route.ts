/**
 * Credits API Route
 *
 * GET /api/billing/credits - Get current credit balance and plan info
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCreditBalance } from '@/lib/services/billing-service';
import type { ApiResponse } from '@/types/api';
import type { CreditBalance } from '@/types/billing';

export async function GET() {
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

    const result = await getCreditBalance(session.user.id);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<CreditBalance>>({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('GET /api/billing/credits error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
