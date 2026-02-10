/**
 * Billing hooks for client-side subscription management.
 * Provides checkout and portal mutations via React Query.
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import type { PaymentPlanId, CheckoutSessionResponse, PortalResponse } from '@/types/billing';
import type { ApiResponse } from '@/types/api';

/**
 * Hook to create a Stripe Checkout session and redirect.
 */
export function useCheckout() {
  return useMutation({
    mutationFn: async (planId: PaymentPlanId) => {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data: ApiResponse<CheckoutSessionResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento');
      }

      return data.data;
    },
    onSuccess: data => {
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    },
  });
}

/**
 * Hook to get Stripe Customer Portal URL and redirect.
 */
export function usePortal() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/billing/portal');
      const data: ApiResponse<PortalResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao abrir portal de assinatura');
      }

      return data.data;
    },
    onSuccess: data => {
      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    },
  });
}
