/**
 * CRM Hooks
 *
 * Custom hooks for fetching and managing CRM integrations
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CRMProvider,
  CRMIntegrationStatus,
  CreateCRMIntegrationInput,
  UpdateCRMIntegrationInput,
  SyncLeadsInput,
} from '@/lib/validations/crm';

/**
 * CRM Integration type (API response)
 */
export interface CRMIntegrationResponse {
  id: string;
  consultant_id: string;
  provider: CRMProvider;
  name: string;
  status: CRMIntegrationStatus;
  api_key_masked: string;
  account_id: string | null;
  account_name: string | null;
  field_mappings: Record<string, string>;
  auto_sync_enabled: boolean;
  sync_on_qualification: boolean;
  sync_on_status_change: boolean;
  sync_on_score_threshold: number | null;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * CRM Sync Log type
 */
export interface CRMSyncLog {
  id: string;
  integration_id: string;
  lead_id: string | null;
  status: string;
  operation: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  crm_record_id: string | null;
  crm_record_url: string | null;
  created_at: string;
}

/**
 * Batch sync result
 */
export interface BatchSyncResult {
  totalLeads: number;
  successCount: number;
  failedCount: number;
  results: Array<{
    leadId: string;
    success: boolean;
    crmRecordId?: string;
    crmRecordUrl?: string;
    error?: string;
  }>;
}

/**
 * Filters for listing integrations
 */
export interface CRMIntegrationFilters {
  provider?: CRMProvider;
  status?: CRMIntegrationStatus;
}

/**
 * Filters for listing sync logs
 */
export interface SyncLogFilters {
  integration_id?: string;
  lead_id?: string;
  status?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch CRM integrations
 */
export function useCRMIntegrations(filters: CRMIntegrationFilters = {}) {
  const params = new URLSearchParams();
  if (filters.provider) params.set('provider', filters.provider);
  if (filters.status) params.set('status', filters.status);

  return useQuery<CRMIntegrationResponse[]>({
    queryKey: ['crm-integrations', params.toString()],
    queryFn: async () => {
      const url = params.toString()
        ? `/api/integrations/crm?${params.toString()}`
        : '/api/integrations/crm';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch CRM integrations');
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
 * Hook to fetch a single CRM integration
 */
export function useCRMIntegration(integrationId: string | null) {
  return useQuery<CRMIntegrationResponse>({
    queryKey: ['crm-integrations', integrationId],
    queryFn: async () => {
      if (!integrationId) throw new Error('Integration ID required');
      const response = await fetch(`/api/integrations/crm/${integrationId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch CRM integration');
      }
      const json = await response.json();
      return json.data;
    },
    enabled: !!integrationId,
    staleTime: 30000,
    gcTime: 300000,
  });
}

/**
 * Hook to fetch sync logs
 */
export function useCRMSyncLogs(filters: SyncLogFilters = {}) {
  const params = new URLSearchParams();
  if (filters.integration_id) params.set('integration_id', filters.integration_id);
  if (filters.lead_id) params.set('lead_id', filters.lead_id);
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);

  return useQuery<{
    data: CRMSyncLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: ['crm-sync-logs', params.toString()],
    queryFn: async () => {
      const url = params.toString()
        ? `/api/integrations/crm/logs?${params.toString()}`
        : '/api/integrations/crm/logs';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch sync logs');
      }
      const json = await response.json();
      return json.data;
    },
    staleTime: 10000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a CRM integration
 */
export function useCreateCRMIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCRMIntegrationInput) => {
      const response = await fetch('/api/integrations/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to create integration');
      }
      const json = await response.json();
      return json.data as CRMIntegrationResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'], exact: false });
    },
  });
}

/**
 * Hook to update a CRM integration
 */
export function useUpdateCRMIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      integrationId,
      updates,
    }: {
      integrationId: string;
      updates: UpdateCRMIntegrationInput;
    }) => {
      const response = await fetch(`/api/integrations/crm/${integrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to update integration');
      }
      const json = await response.json();
      return json.data as CRMIntegrationResponse;
    },
    onSuccess: updatedIntegration => {
      queryClient.setQueryData(['crm-integrations', updatedIntegration.id], updatedIntegration);
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'], exact: false });
    },
  });
}

/**
 * Hook to delete a CRM integration
 */
export function useDeleteCRMIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await fetch(`/api/integrations/crm/${integrationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Failed to delete integration');
      }
      return integrationId;
    },
    onSuccess: deletedId => {
      queryClient.removeQueries({ queryKey: ['crm-integrations', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'], exact: false });
    },
  });
}

/**
 * Hook to test CRM connection
 */
export function useTestCRMConnection() {
  return useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await fetch(`/api/integrations/crm/${integrationId}/test`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Connection test failed');
      }
      const json = await response.json();
      return json.data as { connected: boolean; accountName?: string };
    },
  });
}

/**
 * Hook to sync leads to CRM
 */
export function useSyncLeadsToCRM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      integrationId,
      data,
    }: {
      integrationId: string;
      data: SyncLeadsInput;
    }) => {
      const response = await fetch(`/api/integrations/crm/${integrationId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || 'Sync failed');
      }
      const json = await response.json();
      return json.data as BatchSyncResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-sync-logs'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['crm-integrations'], exact: false });
    },
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: CRMProvider): string {
  const names: Record<CRMProvider, string> = {
    'rd-station': 'RD Station',
    pipedrive: 'Pipedrive',
    hubspot: 'HubSpot',
    agendor: 'Agendor',
  };
  return names[provider] || provider;
}

/**
 * Get status display info
 */
export function getStatusDisplayInfo(status: CRMIntegrationStatus): {
  label: string;
  color: string;
  bgColor: string;
} {
  const info: Record<CRMIntegrationStatus, { label: string; color: string; bgColor: string }> = {
    active: { label: 'Ativo', color: 'text-green-700', bgColor: 'bg-green-100' },
    inactive: { label: 'Inativo', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    error: { label: 'Erro', color: 'text-red-700', bgColor: 'bg-red-100' },
    pending_auth: {
      label: 'Aguardando Autorizacao',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
  };
  return info[status] || { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
}

/**
 * Get provider logo URL (placeholder)
 */
export function getProviderLogoUrl(provider: CRMProvider): string {
  // In production, replace with actual logo URLs
  const logos: Record<CRMProvider, string> = {
    'rd-station': '/images/crm/rd-station.png',
    pipedrive: '/images/crm/pipedrive.png',
    hubspot: '/images/crm/hubspot.png',
    agendor: '/images/crm/agendor.png',
  };
  return logos[provider] || '/images/crm/default.png';
}
