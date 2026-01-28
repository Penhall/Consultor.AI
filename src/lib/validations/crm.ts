/**
 * CRM Integration Validation Schemas
 *
 * Zod schemas for validating CRM integration operations
 */

import { z } from 'zod';

/**
 * CRM provider enum
 */
export const crmProviderSchema = z.enum(['rd-station', 'pipedrive', 'hubspot', 'agendor']);

export type CRMProvider = z.infer<typeof crmProviderSchema>;

/**
 * CRM integration status enum
 */
export const crmIntegrationStatusSchema = z.enum(['active', 'inactive', 'error', 'pending_auth']);

export type CRMIntegrationStatus = z.infer<typeof crmIntegrationStatusSchema>;

/**
 * CRM sync status enum
 */
export const crmSyncStatusSchema = z.enum([
  'pending',
  'in_progress',
  'success',
  'failed',
  'partial',
]);

export type CRMSyncStatus = z.infer<typeof crmSyncStatusSchema>;

/**
 * Field mapping schema
 * Maps our lead fields to CRM-specific field names
 */
export const fieldMappingSchema = z.record(z.string(), z.string());

export type FieldMapping = z.infer<typeof fieldMappingSchema>;

/**
 * Schema for creating a new CRM integration
 */
export const createCRMIntegrationSchema = z.object({
  provider: crmProviderSchema,
  name: z
    .string()
    .min(2, 'Nome deve ter no minimo 2 caracteres')
    .max(100, 'Nome deve ter no maximo 100 caracteres'),
  api_key: z.string().min(1, 'Chave de API e obrigatoria'),
  api_secret: z.string().optional(),
  account_id: z.string().optional(),
  account_name: z.string().optional(),
  field_mappings: fieldMappingSchema.optional().default({}),
  auto_sync_enabled: z.boolean().optional().default(true),
  sync_on_qualification: z.boolean().optional().default(true),
  sync_on_status_change: z.boolean().optional().default(false),
  sync_on_score_threshold: z
    .number()
    .min(0, 'Threshold minimo e 0')
    .max(100, 'Threshold maximo e 100')
    .optional()
    .nullable(),
});

export type CreateCRMIntegrationInput = z.infer<typeof createCRMIntegrationSchema>;

/**
 * Schema for updating a CRM integration
 */
export const updateCRMIntegrationSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no minimo 2 caracteres')
    .max(100, 'Nome deve ter no maximo 100 caracteres')
    .optional(),
  api_key: z.string().min(1, 'Chave de API e obrigatoria').optional(),
  api_secret: z.string().optional().nullable(),
  account_id: z.string().optional().nullable(),
  account_name: z.string().optional().nullable(),
  field_mappings: fieldMappingSchema.optional(),
  auto_sync_enabled: z.boolean().optional(),
  sync_on_qualification: z.boolean().optional(),
  sync_on_status_change: z.boolean().optional(),
  sync_on_score_threshold: z
    .number()
    .min(0, 'Threshold minimo e 0')
    .max(100, 'Threshold maximo e 100')
    .optional()
    .nullable(),
  status: crmIntegrationStatusSchema.optional(),
});

export type UpdateCRMIntegrationInput = z.infer<typeof updateCRMIntegrationSchema>;

/**
 * Schema for syncing leads to CRM
 */
export const syncLeadsSchema = z.object({
  lead_ids: z
    .array(z.string().uuid('ID de lead invalido'))
    .min(1, 'Pelo menos um lead deve ser selecionado')
    .max(100, 'Maximo de 100 leads por sincronizacao'),
  force: z.boolean().optional().default(false),
});

export type SyncLeadsInput = z.infer<typeof syncLeadsSchema>;

/**
 * Schema for listing CRM integrations
 */
export const listCRMIntegrationsSchema = z.object({
  provider: crmProviderSchema.optional(),
  status: crmIntegrationStatusSchema.optional(),
});

export type ListCRMIntegrationsParams = z.infer<typeof listCRMIntegrationsSchema>;

/**
 * Schema for listing sync logs
 */
export const listSyncLogsSchema = z.object({
  integration_id: z.string().uuid('ID de integracao invalido').optional(),
  lead_id: z.string().uuid('ID de lead invalido').optional(),
  status: crmSyncStatusSchema.optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type ListSyncLogsParams = z.infer<typeof listSyncLogsSchema>;

/**
 * Schema for OAuth callback
 */
export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'Codigo de autorizacao e obrigatorio'),
  state: z.string().min(1, 'State e obrigatorio'),
});

export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;

/**
 * Provider-specific API key validation
 */
export const providerApiKeyPatterns: Record<CRMProvider, RegExp | null> = {
  'rd-station': /^[a-f0-9]{32}$/i, // 32 hex characters
  pipedrive: /^[a-f0-9]{40}$/i, // 40 hex characters
  hubspot: /^pat-[a-zA-Z0-9-]+$/, // HubSpot private app token
  agendor: null, // No specific pattern
};

/**
 * Validates API key format for a specific provider
 */
export function validateApiKeyFormat(provider: CRMProvider, apiKey: string): boolean {
  const pattern = providerApiKeyPatterns[provider];
  if (!pattern) return true; // No pattern = any format accepted
  return pattern.test(apiKey);
}
