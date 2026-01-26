/**
 * Leads Hooks
 *
 * Custom hooks for fetching and managing leads data with optimized caching
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/types/database';
import { filtersToSearchParams, type LeadFilters } from '@/components/leads/lead-filters';

type Lead = Database['public']['Tables']['leads']['Row'];

interface PaginatedLeads {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook to fetch leads with filters and pagination
 */
export function useLeads(filters: LeadFilters = {}) {
  const params = filtersToSearchParams(filters);
  const queryKey = ['leads', params.toString()];

  return useQuery<PaginatedLeads>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`/api/leads?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      const json = await response.json();

      // Handle paginated response format
      const data = json?.data;
      const items: Lead[] = Array.isArray(data) ? data : (data?.data ?? []);
      const pagination = data?.pagination ?? {
        page: 1,
        limit: 20,
        total: items.length,
        totalPages: 1,
      };

      return { data: items, pagination };
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
    placeholderData: previousData => previousData, // Keep old data while fetching
  });
}

/**
 * Hook to fetch a single lead by ID
 */
export function useLead(leadId: string | null) {
  return useQuery<Lead>({
    queryKey: ['leads', leadId],
    queryFn: async () => {
      if (!leadId) throw new Error('Lead ID required');
      const response = await fetch(`/api/leads/${leadId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch lead');
      }
      const json = await response.json();
      return json.data;
    },
    enabled: !!leadId,
    staleTime: 30000,
    gcTime: 300000,
  });
}

/**
 * Hook to update a lead
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, updates }: { leadId: string; updates: Partial<Lead> }) => {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update lead');
      }
      const json = await response.json();
      return json.data as Lead;
    },
    onSuccess: updatedLead => {
      // Update the individual lead in cache
      queryClient.setQueryData(['leads', updatedLead.id], updatedLead);

      // Invalidate the leads list to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ['leads'], exact: false });
    },
  });
}

/**
 * Hook to delete a lead
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete lead');
      }
      return leadId;
    },
    onSuccess: deletedId => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['leads', deletedId] });

      // Invalidate the leads list
      queryClient.invalidateQueries({ queryKey: ['leads'], exact: false });
    },
  });
}

/**
 * Hook to create a new lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData: {
      whatsapp_number: string;
      name?: string;
      email?: string;
      source?: string;
    }) => {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(leadData),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to create lead');
      }
      const json = await response.json();
      return json.data as Lead;
    },
    onSuccess: () => {
      // Invalidate the leads list to refetch
      queryClient.invalidateQueries({ queryKey: ['leads'], exact: false });
    },
  });
}

/**
 * Hook to prefetch leads (for pagination optimization)
 */
export function usePrefetchLeads() {
  const queryClient = useQueryClient();

  return (filters: LeadFilters, nextPage: number) => {
    const nextFilters = { ...filters };
    const params = filtersToSearchParams(nextFilters);
    params.set('page', String(nextPage));

    queryClient.prefetchQuery({
      queryKey: ['leads', params.toString()],
      queryFn: async () => {
        const response = await fetch(`/api/leads?${params.toString()}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        const json = await response.json();
        const data = json?.data;
        const items: Lead[] = Array.isArray(data) ? data : (data?.data ?? []);
        const pagination = data?.pagination ?? {
          page: nextPage,
          limit: 20,
          total: items.length,
          totalPages: 1,
        };
        return { data: items, pagination };
      },
      staleTime: 30000,
    });
  };
}
