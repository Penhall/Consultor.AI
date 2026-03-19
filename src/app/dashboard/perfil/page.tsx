'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSkin } from '@/lib/skin/skin-context';

export default function PerfilPage() {
  const { consultant, isLoading } = useAuth();
  const { skinId, setSkin, skins } = useSkin();

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
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
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
        <div className="rounded-lg border border-border bg-card p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Informações Pessoais</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Nome</label>
              <p className="font-medium">{consultant?.name ?? '—'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="font-medium">{consultant?.email ?? '—'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">WhatsApp</label>
              <p className="font-medium">{consultant?.whatsapp_number ?? 'Não configurado'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Vertical</label>
              <p className="font-medium capitalize">
                {consultant?.vertical === 'saude'
                  ? 'Planos de Saúde'
                  : (consultant?.vertical ?? '—')}
              </p>
            </div>
          </div>
        </div>

        {/* Integração WhatsApp */}
        <div className="rounded-lg border border-border bg-card p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Integração WhatsApp</h2>
            <Link
              href="/dashboard/perfil/whatsapp"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Gerenciar →
            </Link>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${consultant?.whatsapp_number ? 'bg-green-500' : 'bg-gray-400'}`}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {consultant?.whatsapp_number ? 'WhatsApp configurado' : 'WhatsApp não conectado'}
                </p>
                <p className="text-xs text-muted-foreground">
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
        <div className="rounded-lg border border-border bg-card p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Plano e Assinatura</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Plano Atual</label>
              <p className="text-lg font-medium">{planLabel[plan] ?? plan}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
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
              <label className="text-sm text-muted-foreground">Limite de Leads/Mês</label>
              <p className="font-medium">{monthlyLimit} leads</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Leads este mês</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-muted">
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
        <div className="rounded-lg border border-border bg-card p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Funcionalidades em Desenvolvimento</h2>
          <ul className="list-inside list-disc space-y-2 text-foreground">
            <li>Editar informações pessoais</li>
            <li>Alterar senha</li>
            <li>Configurações de notificações</li>
            <li>Preferências de idioma e timezone</li>
            <li>Histórico de faturas</li>
            <li>Gerenciar métodos de pagamento</li>
          </ul>
        </div>

        {/* Aparência */}
        <div className="rounded-lg border border-border bg-card p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Aparência</h2>
          <p className="mb-4 text-sm text-muted-foreground">Escolha o tema visual da interface</p>
          <div className="grid grid-cols-2 gap-3">
            {skins.map(skin => (
              <button
                key={skin.id}
                onClick={() => setSkin(skin.id)}
                className={`relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors hover:bg-muted ${
                  skinId === skin.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                {/* Mini preview */}
                <div
                  className="h-10 w-full rounded"
                  style={{
                    backgroundColor: skin.previewBg,
                    border: `3px solid ${skin.previewPrimary}`,
                  }}
                />
                <div className="flex items-center gap-2">
                  <span>{skin.icon}</span>
                  <span className="text-sm font-medium text-foreground">{skin.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{skin.description}</p>
                {skinId === skin.id && (
                  <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Ativo
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
