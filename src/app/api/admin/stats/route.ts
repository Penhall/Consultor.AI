/**
 * Admin Stats API Route
 *
 * GET /api/admin/stats - Get SaaS metrics for admin dashboard
 * Requires is_admin flag. Uses service_role to bypass RLS.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { adminStatsQuerySchema } from '@/lib/validations/admin';
import type { ApiResponse } from '@/types/api';
import type { AdminStatsResponse } from '@/types/admin';
import type { Database } from '@/types/database';

type Consultant = Database['public']['Tables']['consultants']['Row'];

export async function GET(request: NextRequest) {
  try {
    // Auth + admin check
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

    const consultantQuery = supabase
      .from('consultants')
      .select()
      .eq('user_id', session.user.id)
      .single();
    const { data: rawData } = await consultantQuery;
    const consultant = rawData as Consultant | null;

    if (!consultant?.is_admin) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const parsed = adminStatsQuerySchema.safeParse({
      days: searchParams.get('days') || '7',
    });

    const days = parsed.success ? parsed.data.days : 7;

    // Fetch stats with service role
    const serviceClient = createServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statsTable = serviceClient.from('daily_stats') as any;
    const { data: stats, error: statsError } = await statsTable
      .select('*')
      .order('date', { ascending: false })
      .limit(days);

    if (statsError) {
      console.error('Failed to fetch daily stats:', statsError);
    }

    // Get today's stats (or most recent)
    const today = stats?.[0] ?? {
      total_revenue: 0,
      paid_user_count: 0,
      user_count: 0,
      total_views: 0,
      user_delta: 0,
      paid_user_delta: 0,
    };

    const response: AdminStatsResponse = {
      totalRevenue: today.total_revenue ?? 0,
      paidUsers: today.paid_user_count ?? 0,
      totalUsers: today.user_count ?? 0,
      pageViews: today.total_views ?? 0,
      userDelta: today.user_delta ?? 0,
      paidUserDelta: today.paid_user_delta ?? 0,
      dailyStats: (stats ?? []).reverse(),
    };

    return NextResponse.json<ApiResponse<AdminStatsResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
