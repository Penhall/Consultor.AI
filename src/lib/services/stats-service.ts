/**
 * Stats Service
 *
 * Calculates daily SaaS metrics and persists to daily_stats table.
 * Used by pg_cron job (hourly) and can be triggered manually.
 */

import { createServiceClient } from '@/lib/supabase/server';
interface DailyStatsInput {
  date: string;
  userCount: number;
  paidUserCount: number;
  userDelta: number;
  paidUserDelta: number;
  totalRevenue: number;
  totalProfit: number;
  totalViews: number;
}

export async function calculateDailyStats(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createServiceClient();
    const today = new Date().toISOString().slice(0, 10);

    // Count total users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countQuery = (supabase.from('consultants') as any).select('*', {
      count: 'exact',
      head: true,
    });
    const { count: userCount } = await countQuery;

    // Count paid users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paidQuery = (supabase.from('consultants') as any)
      .select('*', { count: 'exact', head: true })
      .in('subscription_status', ['active', 'past_due']);
    const { count: paidUserCount } = await paidQuery;

    // Get yesterday's stats for delta calculation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const yesterdayQuery = (supabase.from('daily_stats') as any)
      .select()
      .eq('date', yesterdayStr)
      .single();
    const { data: yesterdayStats } = await yesterdayQuery;

    const userDelta = (userCount ?? 0) - (yesterdayStats?.user_count ?? 0);
    const paidUserDelta = (paidUserCount ?? 0) - (yesterdayStats?.paid_user_count ?? 0);

    // Calculate revenue from paid users (estimate from plan prices)
    const totalRevenue = await estimateRevenue(supabase);

    const statsInput: DailyStatsInput = {
      date: today,
      userCount: userCount ?? 0,
      paidUserCount: paidUserCount ?? 0,
      userDelta,
      paidUserDelta,
      totalRevenue,
      totalProfit: Math.round(totalRevenue * 0.7),
      totalViews: 0,
    };

    // Try to fetch page views from Plausible if configured
    const pageViews = await fetchPageViews();
    if (pageViews !== null) {
      statsInput.totalViews = pageViews;
    }

    // Upsert daily stats (update if already exists for today)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statsTable = supabase.from('daily_stats') as any;
    const { error: upsertError } = await statsTable.upsert(
      {
        date: statsInput.date,
        user_count: statsInput.userCount,
        paid_user_count: statsInput.paidUserCount,
        user_delta: statsInput.userDelta,
        paid_user_delta: statsInput.paidUserDelta,
        total_revenue: statsInput.totalRevenue,
        total_profit: statsInput.totalProfit,
        total_views: statsInput.totalViews,
      },
      { onConflict: 'date' }
    );

    if (upsertError) {
      console.error('Failed to upsert daily stats:', upsertError);
      return { success: false, error: upsertError.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('calculateDailyStats failed:', message);
    return { success: false, error: message };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function estimateRevenue(supabase: any): Promise<number> {
  try {
    const proQuery = supabase
      .from('consultants')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_plan', 'pro')
      .eq('subscription_status', 'active');
    const { count: proCount } = await proQuery;

    const agenciaQuery = supabase
      .from('consultants')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_plan', 'agencia')
      .eq('subscription_status', 'active');
    const { count: agenciaCount } = await agenciaQuery;

    // Prices in cents (BRL)
    const proPrice = 4700; // R$47
    const agenciaPrice = 14700; // R$147

    return (proCount ?? 0) * proPrice + (agenciaCount ?? 0) * agenciaPrice;
  } catch {
    return 0;
  }
}

async function fetchPageViews(): Promise<number | null> {
  const apiKey = process.env.PLAUSIBLE_API_KEY;
  const siteId = process.env.PLAUSIBLE_SITE_ID;

  if (!apiKey || !siteId) {
    return null;
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch(
      `https://plausible.io/api/v1/stats/aggregate?site_id=${siteId}&period=day&date=${today}&metrics=pageviews`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.results?.pageviews?.value ?? null;
  } catch {
    return null;
  }
}
