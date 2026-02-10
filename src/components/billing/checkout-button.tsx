/**
 * Checkout Button Component
 *
 * Checks auth state: unauthenticated users are redirected to login.
 * Authenticated users trigger Stripe Checkout.
 */

'use client';

import { useCheckout } from '@/hooks/useBilling';
import { useAuth } from '@/hooks/useAuth';
import type { PaymentPlanId } from '@/types/billing';

interface CheckoutButtonProps {
  planId: PaymentPlanId;
  label?: string;
  variant?: 'default' | 'outline';
}

export function CheckoutButton({
  planId,
  label = 'Assinar agora',
  variant = 'default',
}: CheckoutButtonProps) {
  const checkout = useCheckout();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      window.location.href = `/auth/login?returnUrl=/pricing`;
      return;
    }

    checkout.mutate(planId);
  };

  const baseClasses =
    'w-full rounded-lg px-6 py-3 text-sm font-semibold transition-colors disabled:opacity-50';
  const variantClasses =
    variant === 'default'
      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
      : 'border border-border bg-background text-foreground hover:bg-accent';

  return (
    <button
      onClick={handleClick}
      disabled={checkout.isPending}
      className={`${baseClasses} ${variantClasses}`}
    >
      {checkout.isPending ? 'Processando...' : label}
    </button>
  );
}
