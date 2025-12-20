/**
 * Analytics Dashboard Page
 *
 * Displays comprehensive analytics and metrics
 */

'use client'

import { useOverviewMetrics, useChartData, useActivityData } from '@/hooks/useAnalytics'
import { MetricCard } from '@/components/dashboard/metric-card'
import { BarChart } from '@/components/dashboard/bar-chart'
import { PieChart } from '@/components/dashboard/pie-chart'
import { RecentLeadsTable } from '@/components/dashboard/recent-leads-table'

export default function AnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useOverviewMetrics()
  const { data: charts, isLoading: chartsLoading } = useChartData(30)
  const { data: activity, isLoading: activityLoading } = useActivityData()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Visualize o desempenho dos seus leads e conversas
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total de Leads"
          value={overview?.totalLeads || 0}
          description={`${overview?.leadsThisMonth || 0} este mês`}
          loading={overviewLoading}
          icon={
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Conversas Ativas"
          value={overview?.activeConversations || 0}
          description={`${overview?.completedConversations || 0} completadas`}
          loading={overviewLoading}
          icon={
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Taxa de Conversão"
          value={`${overview?.conversionRate || 0}%`}
          description="Conversas completadas"
          loading={overviewLoading}
          icon={
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />

        <MetricCard
          title="Score Médio"
          value={overview?.averageScore || 0}
          description="De 100 pontos"
          loading={overviewLoading}
          icon={
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Leads este Mês"
          value={overview?.leadsThisMonth || 0}
          description="Novos leads em 30 dias"
          loading={overviewLoading}
          icon={
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />

        <MetricCard
          title="Conversas Concluídas"
          value={overview?.completedConversations || 0}
          description="Fluxos finalizados"
          loading={overviewLoading}
          icon={
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <PieChart
          title="Leads por Status"
          data={
            charts
              ? [
                  {
                    label: 'Novo',
                    value: charts.leadsByStatus.novo,
                    color: '#3b82f6',
                  },
                  {
                    label: 'Em Contato',
                    value: charts.leadsByStatus.em_contato,
                    color: '#eab308',
                  },
                  {
                    label: 'Qualificado',
                    value: charts.leadsByStatus.qualificado,
                    color: '#22c55e',
                  },
                  {
                    label: 'Fechado',
                    value: charts.leadsByStatus.fechado,
                    color: '#a855f7',
                  },
                  {
                    label: 'Perdido',
                    value: charts.leadsByStatus.perdido,
                    color: '#6b7280',
                  },
                ]
              : []
          }
          loading={chartsLoading}
        />

        <BarChart
          title="Distribuição por Perfil"
          data={
            charts
              ? [
                  {
                    label: 'Individual',
                    value: charts.profileDistribution.individual,
                    color: '#3b82f6',
                  },
                  {
                    label: 'Casal',
                    value: charts.profileDistribution.casal,
                    color: '#8b5cf6',
                  },
                  {
                    label: 'Família',
                    value: charts.profileDistribution.familia,
                    color: '#ec4899',
                  },
                  {
                    label: 'Empresarial',
                    value: charts.profileDistribution.empresarial,
                    color: '#f59e0b',
                  },
                ]
              : []
          }
          loading={chartsLoading}
        />
      </div>

      {/* Activity Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentLeadsTable
          leads={activity?.recent || []}
          loading={activityLoading}
        />

        <RecentLeadsTable
          leads={activity?.topLeads || []}
          loading={activityLoading}
        />
      </div>
    </div>
  )
}
