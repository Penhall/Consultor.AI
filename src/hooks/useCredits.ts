/**
 * Credits hooks for client-side credit balance management.
 * Provides auto-refreshing balance query via React Query.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { CreditBalance } from '@/types/billing';
import type { ApiResponse } from '@/types/api';

const CREDITS_QUERY_KEY = ['credits-balance'];
const REFRESH_INTERVAL_MS = 60_000; // 1 minute

/**
 * Hook to fetch and auto-refresh credit balance.
 */
export function useCreditsBalance() {
  return useQuery({
    queryKey: CREDITS_QUERY_KEY,
    queryFn: async (): Promise<CreditBalance> => {
      const response = await fetch('/api/billing/credits');
      const data: ApiResponse<CreditBalance> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar créditos');
      }

      return data.data;
    },
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 30_000, // 30 seconds
  });
}
