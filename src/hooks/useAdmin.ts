/**
 * Admin hooks for dashboard stats and user management.
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import type { AdminStatsResponse, AdminUsersResponse } from '@/types/admin';
import type { ApiResponse } from '@/types/api';

/**
 * Hook for admin dashboard stats.
 */
export function useAdminStats(days: number = 7) {
  return useQuery({
    queryKey: ['admin-stats', days],
    queryFn: async (): Promise<AdminStatsResponse> => {
      const response = await fetch(`/api/admin/stats?days=${days}`);
      const data: ApiResponse<AdminStatsResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar estatísticas');
      }

      return data.data;
    },
    staleTime: 60_000,
  });
}

/**
 * Hook for admin user management with filters and pagination.
 */
export function useAdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // Debounced email search
  const [debouncedEmail, setDebouncedEmail] = useState('');

  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedEmail(emailFilter);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [emailFilter]);

  const queryKey = ['admin-users', page, debouncedEmail, statusFilter];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<AdminUsersResponse> => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });

      if (debouncedEmail) params.set('email', debouncedEmail);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      const data: ApiResponse<AdminUsersResponse> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar usuários');
      }

      return data.data;
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao atualizar usuário');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return {
    ...query,
    page,
    setPage,
    emailFilter,
    setEmailFilter,
    statusFilter,
    setStatusFilter,
    toggleAdmin,
  };
}
