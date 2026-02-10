/**
 * Subscription Status Component
 *
 * Shows current plan and manage subscription button for subscribers.
 */

'use client';

import { usePortal } from '@/hooks/useBilling';
import type { SubscriptionPlan, SubscriptionStatus } from '@/types/billing';

interface SubscriptionStatusProps {
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus | null;
}

const PLAN_LABELS: Record<string, string> = {
  freemium: 'Gratuito',
  pro: 'Pro',
  agencia: 'Agência',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  cancel_at_period_end: 'Cancelamento agendado',
  past_due: 'Pagamento pendente',
  deleted: 'Cancelada',
};

export function SubscriptionStatus({ plan, status }: SubscriptionStatusProps) {
  const portal = usePortal();

  const planLabel = plan ? PLAN_LABELS[plan] || plan : 'Gratuito';
  const statusLabel = status ? STATUS_LABELS[status] || status : '';
  const isSubscriber = plan && plan !== 'freemium' && status === 'active';

  return (
    <div className="flex items-center gap-4">
      <div>
        <span className="text-sm font-medium">{planLabel}</span>
        {statusLabel && <span className="ml-2 text-xs text-muted-foreground">({statusLabel})</span>}
      </div>

      {isSubscriber && (
        <button
          onClick={() => portal.mutate()}
          disabled={portal.isPending}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          {portal.isPending ? 'Abrindo...' : 'Gerenciar Assinatura'}
        </button>
      )}
    </div>
  );
}
