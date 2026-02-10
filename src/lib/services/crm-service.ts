/**
 * CRM Service
 *
 * Service layer for CRM integration management
 * Handles CRUD operations for integrations and sync operations
 */

import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt, maskSensitiveData } from '@/lib/encryption';
import type {
  CreateCRMIntegrationInput,
  UpdateCRMIntegrationInput,
  SyncLeadsInput,
  ListCRMIntegrationsParams,
  ListSyncLogsParams,
  CRMProvider,
  CRMIntegrationStatus,
  CRMSyncStatus,
  FieldMapping,
} from '@/lib/validations/crm';

// Type assertion helper for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any;

/**
 * CRM Integration row type
 */
export interface CRMIntegration {
  id: string;
  consultant_id: string;
  provider: CRMProvider;
  name: string;
  status: CRMIntegrationStatus;
  api_key: string | null;
  api_secret: string | null;
  refresh_token: string | null;
  oauth_access_token: string | null;
  oauth_expires_at: string | null;
  oauth_scope: string | null;
  account_id: string | null;
  account_name: string | null;
  field_mappings: FieldMapping;
  auto_sync_enabled: boolean;
  sync_on_qualification: boolean;
  sync_on_status_change: boolean;
  sync_on_score_threshold: number | null;
  last_sync_at: string | null;
  last_sync_status: CRMSyncStatus | null;
  last_sync_error: string | null;
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * CRM Sync Log row type
 */
export interface CRMSyncLog {
  id: string;
  integration_id: string;
  lead_id: string | null;
  status: CRMSyncStatus;
  operation: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  request_data: Record<string, unknown> | null;
  response_data: Record<string, unknown> | null;
  error_code: string | null;
  error_message: string | null;
  retry_count: number;
  crm_record_id: string | null;
  crm_record_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Result type for service operations
 */
type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Paginated result type
 */
type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * Sync result for a single lead
 */
export interface LeadSyncResult {
  leadId: string;
  success: boolean;
  crmRecordId?: string;
  crmRecordUrl?: string;
  error?: string;
}

/**
 * Batch sync result
 */
export interface BatchSyncResult {
  totalLeads: number;
  successCount: number;
  failedCount: number;
  results: LeadSyncResult[];
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create a new CRM integration
 */
export async function createCRMIntegration(
  consultantId: string,
  input: CreateCRMIntegrationInput
): Promise<ServiceResult<CRMIntegration>> {
  try {
    const supabase = await createClient();

    // Encrypt sensitive credentials
    const encryptedApiKey = input.api_key ? encrypt(input.api_key) : null;
    const encryptedApiSecret = input.api_secret ? encrypt(input.api_secret) : null;

    const integrationData = {
      consultant_id: consultantId,
      provider: input.provider,
      name: input.name,
      status: 'active' as CRMIntegrationStatus,
      api_key: encryptedApiKey,
      api_secret: encryptedApiSecret,
      account_id: input.account_id || null,
      account_name: input.account_name || null,
      field_mappings: input.field_mappings || {},
      auto_sync_enabled: input.auto_sync_enabled ?? true,
      sync_on_qualification: input.sync_on_qualification ?? true,
      sync_on_status_change: input.sync_on_status_change ?? false,
      sync_on_score_threshold: input.sync_on_score_threshold ?? null,
    };

    const { data, error } = await supabase
      .from('crm_integrations')
      .insert(integrationData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating CRM integration:', error);

      if (error.code === '23505') {
        return {
          success: false,
          error: 'Ja existe uma integracao com este provedor',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as CRMIntegration,
    };
  } catch (error) {
    console.error('Unexpected error creating CRM integration:', error);
    return {
      success: false,
      error: 'Erro ao criar integracao CRM',
    };
  }
}

/**
 * Get a CRM integration by ID
 */
export async function getCRMIntegrationById(
  integrationId: string
): Promise<ServiceResult<CRMIntegration>> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase as SupabaseAny)
      .from('crm_integrations')
      .select()
      .eq('id', integrationId)
      .single();

    if (error) {
      console.error('Error fetching CRM integration:', error);

      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Integracao CRM nao encontrada',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as CRMIntegration,
    };
  } catch (error) {
    console.error('Unexpected error fetching CRM integration:', error);
    return {
      success: false,
      error: 'Erro ao buscar integracao CRM',
    };
  }
}

/**
 * List CRM integrations for a consultant
 */
export async function listCRMIntegrations(
  consultantId: string,
  params: ListCRMIntegrationsParams = {}
): Promise<ServiceResult<CRMIntegration[]>> {
  try {
    const supabase = await createClient();

    let query = (supabase as SupabaseAny)
      .from('crm_integrations')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('created_at', { ascending: false });

    if (params.provider) {
      query = query.eq('provider', params.provider);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing CRM integrations:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: (data || []) as CRMIntegration[],
    };
  } catch (error) {
    console.error('Unexpected error listing CRM integrations:', error);
    return {
      success: false,
      error: 'Erro ao listar integracoes CRM',
    };
  }
}

/**
 * Update a CRM integration
 */
export async function updateCRMIntegration(
  integrationId: string,
  input: UpdateCRMIntegrationInput
): Promise<ServiceResult<CRMIntegration>> {
  try {
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.account_id !== undefined) updateData.account_id = input.account_id;
    if (input.account_name !== undefined) updateData.account_name = input.account_name;
    if (input.field_mappings !== undefined) updateData.field_mappings = input.field_mappings;
    if (input.auto_sync_enabled !== undefined)
      updateData.auto_sync_enabled = input.auto_sync_enabled;
    if (input.sync_on_qualification !== undefined)
      updateData.sync_on_qualification = input.sync_on_qualification;
    if (input.sync_on_status_change !== undefined)
      updateData.sync_on_status_change = input.sync_on_status_change;
    if (input.sync_on_score_threshold !== undefined)
      updateData.sync_on_score_threshold = input.sync_on_score_threshold;

    // Encrypt new API key if provided
    if (input.api_key !== undefined) {
      updateData.api_key = input.api_key ? encrypt(input.api_key) : null;
    }
    if (input.api_secret !== undefined) {
      updateData.api_secret = input.api_secret ? encrypt(input.api_secret) : null;
    }

    const { data, error } = await (supabase as SupabaseAny)
      .from('crm_integrations')
      .update(updateData)
      .eq('id', integrationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating CRM integration:', error);

      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Integracao CRM nao encontrada',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as CRMIntegration,
    };
  } catch (error) {
    console.error('Unexpected error updating CRM integration:', error);
    return {
      success: false,
      error: 'Erro ao atualizar integracao CRM',
    };
  }
}

/**
 * Delete a CRM integration
 */
export async function deleteCRMIntegration(integrationId: string): Promise<ServiceResult<void>> {
  try {
    const supabase = await createClient();

    const { error } = await (supabase as SupabaseAny)
      .from('crm_integrations')
      .delete()
      .eq('id', integrationId);

    if (error) {
      console.error('Error deleting CRM integration:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Unexpected error deleting CRM integration:', error);
    return {
      success: false,
      error: 'Erro ao deletar integracao CRM',
    };
  }
}

// ============================================
// Sync Operations
// ============================================

/**
 * Get decrypted API credentials for an integration
 */
export async function getDecryptedCredentials(
  integrationId: string
): Promise<ServiceResult<{ apiKey: string | null; apiSecret: string | null }>> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase as SupabaseAny)
      .from('crm_integrations')
      .select('api_key, api_secret')
      .eq('id', integrationId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const row = data as { api_key: string | null; api_secret: string | null };
    return {
      success: true,
      data: {
        apiKey: row.api_key ? decrypt(row.api_key) : null,
        apiSecret: row.api_secret ? decrypt(row.api_secret) : null,
      },
    };
  } catch (error) {
    console.error('Error decrypting credentials:', error);
    return {
      success: false,
      error: 'Erro ao descriptografar credenciais',
    };
  }
}

/**
 * Test CRM connection
 */
export async function testCRMConnection(
  integrationId: string
): Promise<ServiceResult<{ connected: boolean; accountName?: string }>> {
  try {
    // Get integration details
    const integrationResult = await getCRMIntegrationById(integrationId);
    if (!integrationResult.success) {
      return { success: false, error: integrationResult.error };
    }

    const integration = integrationResult.data;

    // Get decrypted credentials
    const credentialsResult = await getDecryptedCredentials(integrationId);
    if (!credentialsResult.success) {
      return { success: false, error: credentialsResult.error };
    }

    const { apiKey } = credentialsResult.data;
    if (!apiKey) {
      return { success: false, error: 'Chave de API nao configurada' };
    }

    // Import provider-specific module dynamically
    const provider = await getCRMProvider(integration.provider);
    if (!provider) {
      return { success: false, error: `Provedor ${integration.provider} nao suportado` };
    }

    // Test connection using provider
    const testResult = await provider.testConnection(apiKey);

    // Update integration status based on test result
    const supabase = await createClient();
    await (supabase as SupabaseAny)
      .from('crm_integrations')
      .update({
        status: testResult.connected ? 'active' : 'error',
        account_name: testResult.accountName || integration.account_name,
        last_sync_error: testResult.connected ? null : 'Falha no teste de conexao',
      })
      .eq('id', integrationId);

    return { success: true, data: testResult };
  } catch (error) {
    console.error('Error testing CRM connection:', error);
    return {
      success: false,
      error: 'Erro ao testar conexao',
    };
  }
}

/**
 * Sync a single lead to CRM
 */
export async function syncLeadToCRM(
  integrationId: string,
  leadId: string,
  force: boolean = false
): Promise<ServiceResult<LeadSyncResult>> {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Get integration details
    const integrationResult = await getCRMIntegrationById(integrationId);
    if (!integrationResult.success) {
      return { success: false, error: integrationResult.error };
    }

    const integration = integrationResult.data;

    // Check if integration is active
    if (integration.status !== 'active' && !force) {
      return { success: false, error: 'Integracao nao esta ativa' };
    }

    // Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return { success: false, error: 'Lead nao encontrado' };
    }

    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await (supabase as SupabaseAny)
      .from('crm_sync_logs')
      .insert({
        integration_id: integrationId,
        lead_id: leadId,
        status: 'in_progress',
        operation: 'create',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('Error creating sync log:', syncLogError);
    }

    // Get decrypted credentials
    const credentialsResult = await getDecryptedCredentials(integrationId);
    if (!credentialsResult.success) {
      await updateSyncLog(supabase, syncLog?.id, 'failed', 'Erro ao obter credenciais', startTime);
      return { success: false, error: credentialsResult.error };
    }

    const { apiKey } = credentialsResult.data;
    if (!apiKey) {
      await updateSyncLog(
        supabase,
        syncLog?.id,
        'failed',
        'Chave de API nao configurada',
        startTime
      );
      return { success: false, error: 'Chave de API nao configurada' };
    }

    // Get provider implementation
    const provider = await getCRMProvider(integration.provider);
    if (!provider) {
      await updateSyncLog(supabase, syncLog?.id, 'failed', 'Provedor nao suportado', startTime);
      return { success: false, error: `Provedor ${integration.provider} nao suportado` };
    }

    // Map lead data to CRM format
    const mappedData = mapLeadToCRM(lead, integration.field_mappings);

    // Sync to CRM
    const syncResult = await provider.createOrUpdateLead(apiKey, mappedData);

    // Update sync log with result
    await updateSyncLog(
      supabase,
      syncLog?.id,
      syncResult.success ? 'success' : 'failed',
      syncResult.error,
      startTime,
      {
        request_data: { lead_id: leadId, mapped_fields: Object.keys(mappedData) },
        response_data: syncResult.success ? { crm_record_id: syncResult.crmRecordId } : undefined,
        crm_record_id: syncResult.crmRecordId,
        crm_record_url: syncResult.crmRecordUrl,
      }
    );

    if (syncResult.success) {
      return {
        success: true,
        data: {
          leadId,
          success: true,
          crmRecordId: syncResult.crmRecordId,
          crmRecordUrl: syncResult.crmRecordUrl,
        },
      };
    } else {
      return {
        success: false,
        error: syncResult.error || 'Erro ao sincronizar lead',
      };
    }
  } catch (error) {
    console.error('Unexpected error syncing lead to CRM:', error);
    return {
      success: false,
      error: 'Erro inesperado ao sincronizar lead',
    };
  }
}

/**
 * Sync multiple leads to CRM in batch
 */
export async function syncLeadsBatch(
  integrationId: string,
  input: SyncLeadsInput
): Promise<ServiceResult<BatchSyncResult>> {
  try {
    const results: LeadSyncResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const leadId of input.lead_ids) {
      const result = await syncLeadToCRM(integrationId, leadId, input.force);

      if (result.success) {
        results.push(result.data);
        successCount++;
      } else {
        results.push({
          leadId,
          success: false,
          error: result.error,
        });
        failedCount++;
      }
    }

    return {
      success: true,
      data: {
        totalLeads: input.lead_ids.length,
        successCount,
        failedCount,
        results,
      },
    };
  } catch (error) {
    console.error('Unexpected error in batch sync:', error);
    return {
      success: false,
      error: 'Erro ao sincronizar leads em lote',
    };
  }
}

// ============================================
// Sync Logs
// ============================================

/**
 * List sync logs with pagination
 */
export async function listSyncLogs(
  consultantId: string,
  params: ListSyncLogsParams
): Promise<ServiceResult<PaginatedResult<CRMSyncLog>>> {
  try {
    const supabase = await createClient();
    const { integration_id, lead_id, status, page = 1, limit = 20, dateFrom, dateTo } = params;

    // Build query - join with integrations to filter by consultant
    let query = supabase
      .from('crm_sync_logs')
      .select('*, crm_integrations!inner(consultant_id)', { count: 'exact' })
      .eq('crm_integrations.consultant_id', consultantId)
      .order('created_at', { ascending: false });

    if (integration_id) {
      query = query.eq('integration_id', integration_id);
    }

    if (lead_id) {
      query = query.eq('lead_id', lead_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error listing sync logs:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        data: (data || []) as unknown as CRMSyncLog[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error('Unexpected error listing sync logs:', error);
    return {
      success: false,
      error: 'Erro ao listar logs de sincronizacao',
    };
  }
}

/**
 * Get default field mappings for a provider
 */
export async function getDefaultFieldMappings(
  provider: CRMProvider
): Promise<ServiceResult<FieldMapping>> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase as SupabaseAny)
      .from('crm_field_mappings_defaults')
      .select('mappings')
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: true, data: {} };
      }
      return { success: false, error: error.message };
    }

    const fieldMappings = (data as { mappings: FieldMapping } | null)?.mappings;
    return {
      success: true,
      data: fieldMappings || {},
    };
  } catch (error) {
    console.error('Error fetching default field mappings:', error);
    return {
      success: false,
      error: 'Erro ao buscar mapeamentos padrao',
    };
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Map lead data to CRM format using field mappings
 */
function mapLeadToCRM(
  lead: Record<string, unknown>,
  fieldMappings: FieldMapping
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  for (const [ourField, crmField] of Object.entries(fieldMappings)) {
    const value = getNestedValue(lead, ourField);
    if (value !== undefined && value !== null) {
      setNestedValue(mapped, crmField, value);
    }
  }

  return mapped;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) return;

  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

/**
 * Update sync log with completion data
 */
async function updateSyncLog(
  supabase: any,
  logId: string | undefined,
  status: CRMSyncStatus,
  errorMessage: string | undefined,
  startTime: number,
  additionalData?: Record<string, unknown>
): Promise<void> {
  if (!logId) return;

  try {
    await supabase
      .from('crm_sync_logs')
      .update({
        status,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        error_message: errorMessage || null,
        ...additionalData,
      })
      .eq('id', logId);
  } catch (error) {
    console.error('Error updating sync log:', error);
  }
}

// ============================================
// Provider Registry
// ============================================

/**
 * CRM Provider interface
 */
export interface CRMProviderInterface {
  testConnection(apiKey: string): Promise<{ connected: boolean; accountName?: string }>;
  createOrUpdateLead(
    apiKey: string,
    data: Record<string, unknown>
  ): Promise<{
    success: boolean;
    crmRecordId?: string;
    crmRecordUrl?: string;
    error?: string;
  }>;
}

/**
 * Get CRM provider implementation
 */
async function getCRMProvider(provider: CRMProvider): Promise<CRMProviderInterface | null> {
  try {
    switch (provider) {
      case 'rd-station': {
        const rdStation = await import('./crm-providers/rd-station');
        return rdStation.default;
      }
      case 'pipedrive': {
        const pipedrive = await import('./crm-providers/pipedrive');
        return pipedrive.default;
      }
      case 'hubspot':
        // TODO: Implement HubSpot provider
        return null;
      case 'agendor':
        // TODO: Implement Agendor provider
        return null;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error loading CRM provider ${provider}:`, error);
    return null;
  }
}

/**
 * Get masked API key for display
 */
export function getMaskedApiKey(encryptedKey: string | null): string {
  if (!encryptedKey) return '****';

  try {
    const decrypted = decrypt(encryptedKey);
    return maskSensitiveData(decrypted);
  } catch {
    return '****';
  }
}
