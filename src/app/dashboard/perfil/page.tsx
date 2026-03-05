'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function PerfilPage() {
  const { consultant, isLoading } = useAuth();

  const planLabel: Record<string, string> = {
    freemium: 'Freemium',
    pro: 'Pro',
    agencia: 'Agência',
  };

  const monthlyLimit = (consultant as any)?.monthly_lead_limit ?? 20;
  const leadsThisMonth = (consultant as any)?.leads_count_current_month ?? 0;
  const usagePercent = monthlyLimit > 0 ? Math.round((leadsThisMonth / monthlyLimit) * 100) : 0;
  const plan =
    (consultant as any)?.subscription_plan ?? (consultant as any)?.subscription_tier ?? 'freemium';
  const subscriptionStatus = (consultant as any)?.subscription_status ?? 'active';

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4 rounded-lg bg-white p-6 shadow">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Meu Perfil</h1>

      <div className="grid gap-6">
        {/* Informações Pessoais */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Informações Pessoais</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Nome</label>
              <p className="font-medium">{consultant?.name ?? '—'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
              <p className="font-medium">{consultant?.email ?? '—'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</label>
              <p className="font-medium">{consultant?.whatsapp_number ?? 'Não configurado'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Vertical</label>
              <p className="font-medium capitalize">
                {consultant?.vertical === 'saude'
                  ? 'Planos de Saúde'
                  : (consultant?.vertical ?? '—')}
              </p>
            </div>
          </div>
        </div>

        {/* Integração WhatsApp */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Integração WhatsApp</h2>
            <Link
              href="/dashboard/perfil/whatsapp"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Gerenciar →
            </Link>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${consultant?.whatsapp_number ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {consultant?.whatsapp_number ? 'WhatsApp configurado' : 'WhatsApp não conectado'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {consultant?.whatsapp_number
                    ? `Número: ${consultant.whatsapp_number}`
                    : 'Configure sua integração com WhatsApp Business para começar a receber leads'}
                </p>
              </div>
            </div>
            {!consultant?.whatsapp_number && (
              <Link
                href="/dashboard/perfil/whatsapp"
                className="mt-4 inline-block rounded bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                Conectar WhatsApp Business
              </Link>
            )}
          </div>
        </div>

        {/* Plano e Assinatura */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Plano e Assinatura</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Plano Atual</label>
              <p className="text-lg font-medium">{planLabel[plan] ?? plan}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Status</label>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  subscriptionStatus === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}
              >
                {subscriptionStatus === 'active' ? 'Ativo' : subscriptionStatus}
              </span>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Limite de Leads/Mês
              </label>
              <p className="font-medium">{monthlyLimit} leads</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Leads este mês</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-600">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {leadsThisMonth} / {monthlyLimit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Funcionalidades Futuras */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Funcionalidades em Desenvolvimento</h2>
          <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
            <li>Editar informações pessoais</li>
            <li>Alterar senha</li>
            <li>Configurações de notificações</li>
            <li>Preferências de idioma e timezone</li>
            <li>Histórico de faturas</li>
            <li>Gerenciar métodos de pagamento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
