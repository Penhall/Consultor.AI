/**
 * Flows Hooks
 *
 * Custom hooks for fetching and managing flow data with optimized caching
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FlowDefinition } from '@/lib/flow-engine/types';

interface Flow {
  id: string;
  consultant_id: string;
  name: string;
  description: string | null;
  vertical: 'saude' | 'imoveis' | 'geral';
  definition: FlowDefinition;
  version: string;
  is_active: boolean;
  is_default: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface FlowFilters {
  vertical?: 'saude' | 'imoveis' | 'geral';
  activeOnly?: boolean;
}

function filtersToSearchParams(filters: FlowFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.vertical) params.set('vertical', filters.vertical);
  if (filters.activeOnly) params.set('activeOnly', 'true');
  return params;
}

/**
 * Hook to fetch all flows with filters
 */
export function useFlows(filters: FlowFilters = {}) {
  const params = filtersToSearchParams(filters);
  const queryKey = ['flows', params.toString()];

  return useQuery<Flow[]>({
    queryKey,
    queryFn: async () => {
      const url = params.toString() ? `/api/flows?${params.toString()}` : '/api/flows';
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch flows');
      }
      const json = await response.json();
      return json.data || [];
    },
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single flow by ID
 */
export function useFlow(flowId: string | null) {
  return useQuery<Flow>({
    queryKey: ['flows', flowId],
    queryFn: async () => {
      if (!flowId) throw new Error('Flow ID required');
      const response = await fetch(`/api/flows/${flowId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch flow');
      }
      const json = await response.json();
      return json.data;
    },
    enabled: !!flowId,
    staleTime: 30000,
    gcTime: 300000,
  });
}

/**
 * Hook to create a new flow
 */
export function useCreateFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flowData: {
      name: string;
      description?: string;
      vertical: 'saude' | 'imoveis' | 'geral';
      definition: FlowDefinition;
      is_active?: boolean;
    }) => {
      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(flowData),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to create flow');
      }
      const json = await response.json();
      return json.data as Flow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'], exact: false });
    },
  });
}

/**
 * Hook to update a flow
 */
export function useUpdateFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      flowId,
      updates,
    }: {
      flowId: string;
      updates: {
        name?: string;
        description?: string;
        definition?: FlowDefinition;
        is_active?: boolean;
      };
    }) => {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to update flow');
      }
      const json = await response.json();
      return json.data as Flow;
    },
    onSuccess: updatedFlow => {
      queryClient.setQueryData(['flows', updatedFlow.id], updatedFlow);
      queryClient.invalidateQueries({ queryKey: ['flows'], exact: false });
    },
  });
}

/**
 * Hook to delete a flow
 */
export function useDeleteFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flowId: string) => {
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to delete flow');
      }
      return flowId;
    },
    onSuccess: deletedId => {
      queryClient.removeQueries({ queryKey: ['flows', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['flows'], exact: false });
    },
  });
}

/**
 * Hook to activate a flow
 */
export function useActivateFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (flowId: string) => {
      const response = await fetch(`/api/flows/${flowId}/activate`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to activate flow');
      }
      const json = await response.json();
      return json.data as Flow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'], exact: false });
    },
  });
}

/**
 * Hook to duplicate a flow
 */
export function useDuplicateFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ flowId, newName }: { flowId: string; newName: string }) => {
      const response = await fetch(`/api/flows/${flowId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newName }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to duplicate flow');
      }
      const json = await response.json();
      return json.data as Flow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flows'], exact: false });
    },
  });
}
