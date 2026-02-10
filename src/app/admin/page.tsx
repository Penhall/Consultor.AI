/**
 * Admin Dashboard Page
 *
 * Displays SaaS metrics cards and revenue chart.
 */

'use client';

import { useAdminStats } from '@/hooks/useAdmin';
import { StatsCard } from '@/components/admin/stats-card';
import { RevenueChart } from '@/components/admin/revenue-chart';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Erro ao carregar métricas: {error.message}
        </div>
      </div>
    );
  }

  const stats = data;

  const chartData = (stats?.dailyStats ?? []).map((day: any) => ({
    date: day.date,
    revenue: day.total_revenue ?? day.totalRevenue ?? 0,
    profit: day.total_profit ?? day.totalProfit ?? 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Receita Total"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          delta={stats?.paidUserDelta}
        />
        <StatsCard title="Assinantes" value={stats?.paidUsers ?? 0} delta={stats?.paidUserDelta} />
        <StatsCard
          title="Total de Usuários"
          value={stats?.totalUsers ?? 0}
          delta={stats?.userDelta}
        />
        <StatsCard title="Visualizações" value={stats?.pageViews ?? 0} />
      </div>

      <RevenueChart data={chartData} />
    </div>
  );
}
