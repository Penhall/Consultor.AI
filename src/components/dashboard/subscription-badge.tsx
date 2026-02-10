/**
 * Subscription Badge Component
 *
 * Shows current plan name as a small badge in the dashboard sidebar/header.
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const PLAN_LABELS: Record<string, string> = {
  freemium: 'Free',
  pro: 'Pro',
  agencia: 'Agência',
};

const PLAN_COLORS: Record<string, string> = {
  freemium: 'bg-gray-100 text-gray-600',
  pro: 'bg-blue-100 text-blue-700',
  agencia: 'bg-purple-100 text-purple-700',
};

export function SubscriptionBadge() {
  const { consultant } = useAuth();

  if (!consultant) return null;

  const plan = (consultant as any).subscription_plan || 'freemium';
  const label = PLAN_LABELS[plan] || 'Free';
  const colorClass = PLAN_COLORS[plan] || PLAN_COLORS.freemium;

  return (
    <Link href="/pricing" title="Gerenciar assinatura">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
      >
        {label}
      </span>
    </Link>
  );
}
