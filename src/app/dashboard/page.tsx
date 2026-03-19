'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface LeadStats {
  total: number;
  byStatus: Record<string, number>;
  thisMonth: number;
  averageScore: number | null;
}

export default function DashboardPage() {
  const { consultant, isLoading } = useAuth();
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeConversations, setActiveConversations] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/leads/stats', { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
          // Active conversations = leads in em_contato or qualificado status
          const active =
            (json.data.byStatus?.em_contato ?? 0) + (json.data.byStatus?.qualificado ?? 0);
          setActiveConversations(active);
        }
      } catch {
        // Stats unavailable — keep defaults (0)
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayName = consultant?.name || 'Consultor';
  const monthlyLimit = (consultant as any)?.monthly_lead_limit ?? 20;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Bem-vindo, {displayName}! 👋</h1>
        <p className="text-muted-foreground">Aqui está um resumo da sua atividade</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Leads */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total de Leads</h3>
            <svg
              className="h-5 w-5 text-blue-500"
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
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground">{stats?.total ?? 0}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {stats?.total ? `${stats.thisMonth} este mês` : 'Nenhum lead cadastrado ainda'}
              </p>
            </>
          )}
        </div>

        {/* Active Conversations */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Em Contato / Qualificados</h3>
            <svg
              className="h-5 w-5 text-green-500"
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
          </div>
          {statsLoading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground">{activeConversations}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeConversations ? 'leads em andamento' : 'Nenhum lead em andamento'}
              </p>
            </>
          )}
        </div>

        {/* Monthly Limit */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Limite Mensal</h3>
            <svg
              className="h-5 w-5 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          {statsLoading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground">
                {stats?.thisMonth ?? 0} / {monthlyLimit}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">Leads processados este mês</p>
            </>
          )}
        </div>
      </div>

      {/* Getting Started Section — only shown when no leads exist */}
      {!statsLoading && (stats?.total ?? 0) === 0 && (
        <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-blue-800/20">
          <h2 className="mb-4 text-xl font-bold text-foreground">🚀 Primeiros Passos</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                  1
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Configure seu perfil</p>
                <p className="text-sm text-muted-foreground">
                  Complete suas informações e conecte seu WhatsApp Business
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                  2
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Crie seu primeiro fluxo</p>
                <p className="text-sm text-muted-foreground">
                  Personalize as conversas automatizadas para seu negócio
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                  3
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Comece a receber leads</p>
                <p className="text-sm text-muted-foreground">
                  Compartilhe seu link do WhatsApp e deixe a IA trabalhar
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick stats breakdown — shown when there are leads */}
      {!statsLoading && (stats?.total ?? 0) > 0 && stats?.byStatus && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Distribuição por Status</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              {
                key: 'novo',
                label: 'Novos',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
              },
              {
                key: 'em_contato',
                label: 'Em Contato',
                color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
              },
              {
                key: 'qualificado',
                label: 'Qualificados',
                color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
              },
              {
                key: 'agendado',
                label: 'Agendados',
                color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
              },
              {
                key: 'fechado',
                label: 'Fechados',
                color:
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
              },
              {
                key: 'perdido',
                label: 'Perdidos',
                color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
              },
            ].map(({ key, label, color }) => (
              <div key={key} className={`rounded-lg px-4 py-3 ${color}`}>
                <p className="text-2xl font-bold">{stats.byStatus[key] ?? 0}</p>
                <p className="mt-0.5 text-xs font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
