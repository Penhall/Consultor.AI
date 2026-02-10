/**
 * Credit Balance Component
 *
 * Displays remaining credits, plan info, and upgrade CTA when low.
 */

'use client';

import { useCreditsBalance } from '@/hooks/useCredits';

const LOW_CREDIT_THRESHOLD = 5;

export function CreditBalance() {
  const { data, isLoading, error } = useCreditsBalance();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const isLow = data.credits <= LOW_CREDIT_THRESHOLD;
  const planLabel =
    data.subscriptionPlan === 'freemium' || !data.subscriptionPlan
      ? 'Gratuito'
      : data.subscriptionPlan === 'pro'
        ? 'Pro'
        : 'Agência';

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1.5">
        <span className={`font-medium ${isLow ? 'text-destructive' : 'text-foreground'}`}>
          {data.credits}
        </span>
        <span className="text-muted-foreground">créditos</span>
      </div>

      <span className="text-muted-foreground">·</span>

      <span className="text-muted-foreground">{planLabel}</span>

      {isLow && data.subscriptionPlan !== 'agencia' && (
        <a href="/pricing" className="text-xs font-medium text-primary hover:underline">
          Fazer upgrade
        </a>
      )}
    </div>
  );
}
