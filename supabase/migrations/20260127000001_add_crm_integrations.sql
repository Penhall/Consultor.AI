-- CRM Integrations Migration
-- Creates tables for CRM integrations (RD Station, Pipedrive, HubSpot, Agendor)
-- Version: 1.0.0
-- Date: 2026-01-27

-- Create CRM provider enum
CREATE TYPE crm_provider AS ENUM (
    'rd-station',    -- RD Station Marketing/CRM
    'pipedrive',     -- Pipedrive CRM
    'hubspot',       -- HubSpot CRM
    'agendor'        -- Agendor CRM (Brazilian)
);

-- Create CRM integration status enum
CREATE TYPE crm_integration_status AS ENUM (
    'active',        -- Integration is working
    'inactive',      -- Manually disabled
    'error',         -- Last sync failed
    'pending_auth'   -- Awaiting OAuth completion
);

-- Create CRM sync status enum
CREATE TYPE crm_sync_status AS ENUM (
    'pending',       -- Sync queued
    'in_progress',   -- Sync running
    'success',       -- Sync completed successfully
    'failed',        -- Sync failed
    'partial'        -- Partial sync (some leads failed)
);

-- =====================================================
-- CRM_INTEGRATIONS TABLE
-- Stores CRM connection settings for each consultant
-- =====================================================
CREATE TABLE crm_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Ownership
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,

    -- Provider Information
    provider crm_provider NOT NULL,
    name TEXT NOT NULL, -- Display name (e.g., "Meu RD Station")

    -- Status
    status crm_integration_status DEFAULT 'pending_auth',

    -- Credentials (encrypted)
    api_key TEXT, -- Encrypted API key/token
    api_secret TEXT, -- Encrypted API secret (if needed)
    refresh_token TEXT, -- Encrypted refresh token (for OAuth)

    -- OAuth Data
    oauth_access_token TEXT, -- Encrypted OAuth access token
    oauth_expires_at TIMESTAMPTZ, -- OAuth token expiration
    oauth_scope TEXT, -- Granted OAuth scopes

    -- Provider-specific settings
    account_id TEXT, -- Provider account/workspace ID
    account_name TEXT, -- Provider account name

    -- Field Mappings (maps our fields to CRM fields)
    field_mappings JSONB DEFAULT '{}',

    -- Auto-sync Settings
    auto_sync_enabled BOOLEAN DEFAULT true,
    sync_on_qualification BOOLEAN DEFAULT true, -- Sync when lead is qualified
    sync_on_status_change BOOLEAN DEFAULT false, -- Sync on any status change
    sync_on_score_threshold INTEGER, -- Sync when score >= threshold

    -- Last Sync Info
    last_sync_at TIMESTAMPTZ,
    last_sync_status crm_sync_status,
    last_sync_error TEXT,
    total_syncs INTEGER DEFAULT 0,
    successful_syncs INTEGER DEFAULT 0,
    failed_syncs INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT integration_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT valid_field_mappings CHECK (jsonb_typeof(field_mappings) = 'object'),
    CONSTRAINT valid_sync_threshold CHECK (sync_on_score_threshold IS NULL OR (sync_on_score_threshold >= 0 AND sync_on_score_threshold <= 100)),
    CONSTRAINT unique_provider_per_consultant UNIQUE (consultant_id, provider)
);

-- Indexes
CREATE INDEX idx_crm_integrations_consultant ON crm_integrations(consultant_id);
CREATE INDEX idx_crm_integrations_provider ON crm_integrations(provider);
CREATE INDEX idx_crm_integrations_status ON crm_integrations(status);
CREATE INDEX idx_crm_integrations_active ON crm_integrations(consultant_id, status) WHERE status = 'active';
CREATE INDEX idx_crm_integrations_auto_sync ON crm_integrations(auto_sync_enabled) WHERE auto_sync_enabled = true;

-- Trigger for updated_at
CREATE TRIGGER update_crm_integrations_updated_at BEFORE UPDATE ON crm_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CRM_SYNC_LOGS TABLE
-- Stores sync operation history for debugging and analytics
-- =====================================================
CREATE TABLE crm_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    integration_id UUID NOT NULL REFERENCES crm_integrations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

    -- Sync Details
    status crm_sync_status NOT NULL DEFAULT 'pending',
    operation TEXT NOT NULL, -- 'create', 'update', 'delete'

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Request/Response Data (sanitized - no credentials)
    request_data JSONB, -- Data sent to CRM (without sensitive info)
    response_data JSONB, -- Response from CRM

    -- Error Information
    error_code TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- CRM Reference
    crm_record_id TEXT, -- ID of the created/updated record in CRM
    crm_record_url TEXT, -- Direct link to the record in CRM

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_crm_sync_logs_integration ON crm_sync_logs(integration_id);
CREATE INDEX idx_crm_sync_logs_lead ON crm_sync_logs(lead_id);
CREATE INDEX idx_crm_sync_logs_status ON crm_sync_logs(status);
CREATE INDEX idx_crm_sync_logs_created_at ON crm_sync_logs(created_at DESC);
CREATE INDEX idx_crm_sync_logs_integration_status ON crm_sync_logs(integration_id, status, created_at DESC);

-- =====================================================
-- CRM_FIELD_MAPPINGS_DEFAULTS
-- Default field mappings for each CRM provider
-- =====================================================
CREATE TABLE crm_field_mappings_defaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Provider
    provider crm_provider NOT NULL,

    -- Mappings (our_field -> crm_field)
    mappings JSONB NOT NULL,

    -- Is Active
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_mappings CHECK (jsonb_typeof(mappings) = 'object'),
    CONSTRAINT unique_provider_mapping UNIQUE (provider)
);

-- Trigger for updated_at
CREATE TRIGGER update_crm_field_mappings_defaults_updated_at BEFORE UPDATE ON crm_field_mappings_defaults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_field_mappings_defaults ENABLE ROW LEVEL SECURITY;

-- CRM Integrations: Consultants can only access their own
CREATE POLICY "consultants_select_own_integrations" ON crm_integrations
    FOR SELECT TO authenticated
    USING (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

CREATE POLICY "consultants_insert_own_integrations" ON crm_integrations
    FOR INSERT TO authenticated
    WITH CHECK (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

CREATE POLICY "consultants_update_own_integrations" ON crm_integrations
    FOR UPDATE TO authenticated
    USING (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ))
    WITH CHECK (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

CREATE POLICY "consultants_delete_own_integrations" ON crm_integrations
    FOR DELETE TO authenticated
    USING (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

-- CRM Sync Logs: Consultants can only see logs for their integrations
CREATE POLICY "consultants_select_own_sync_logs" ON crm_sync_logs
    FOR SELECT TO authenticated
    USING (integration_id IN (
        SELECT ci.id FROM crm_integrations ci
        JOIN consultants c ON ci.consultant_id = c.id
        WHERE c.user_id = auth.uid()
    ));

-- Sync logs are created by system, not directly by users
CREATE POLICY "system_insert_sync_logs" ON crm_sync_logs
    FOR INSERT TO authenticated
    WITH CHECK (integration_id IN (
        SELECT ci.id FROM crm_integrations ci
        JOIN consultants c ON ci.consultant_id = c.id
        WHERE c.user_id = auth.uid()
    ));

-- Field mapping defaults are readable by all authenticated users
CREATE POLICY "authenticated_select_field_mappings" ON crm_field_mappings_defaults
    FOR SELECT TO authenticated
    USING (true);

-- =====================================================
-- DEFAULT FIELD MAPPINGS (Seed Data)
-- =====================================================

-- RD Station default mappings
INSERT INTO crm_field_mappings_defaults (provider, mappings) VALUES
('rd-station', '{
    "name": "name",
    "email": "email",
    "whatsapp_number": "mobile_phone",
    "status": "lifecycle_stage",
    "score": "lead_scoring_score",
    "source": "traffic_source",
    "metadata.perfil": "cf_perfil",
    "metadata.faixa_etaria": "cf_faixa_etaria",
    "metadata.coparticipacao": "cf_coparticipacao"
}'::jsonb);

-- Pipedrive default mappings
INSERT INTO crm_field_mappings_defaults (provider, mappings) VALUES
('pipedrive', '{
    "name": "name",
    "email": "email",
    "whatsapp_number": "phone",
    "status": "status",
    "score": "probability",
    "metadata.perfil": "perfil",
    "metadata.faixa_etaria": "faixa_etaria",
    "metadata.coparticipacao": "coparticipacao"
}'::jsonb);

-- HubSpot default mappings
INSERT INTO crm_field_mappings_defaults (provider, mappings) VALUES
('hubspot', '{
    "name": "firstname",
    "email": "email",
    "whatsapp_number": "phone",
    "status": "lifecyclestage",
    "score": "hs_lead_score",
    "metadata.perfil": "perfil_saude",
    "metadata.faixa_etaria": "faixa_etaria",
    "metadata.coparticipacao": "coparticipacao"
}'::jsonb);

-- Agendor default mappings
INSERT INTO crm_field_mappings_defaults (provider, mappings) VALUES
('agendor', '{
    "name": "name",
    "email": "email",
    "whatsapp_number": "phone",
    "status": "dealStage",
    "score": "score",
    "metadata.perfil": "customFields.perfil",
    "metadata.faixa_etaria": "customFields.faixaEtaria",
    "metadata.coparticipacao": "customFields.coparticipacao"
}'::jsonb);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update integration sync stats
CREATE OR REPLACE FUNCTION update_integration_sync_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'success' OR NEW.status = 'partial' THEN
        UPDATE crm_integrations
        SET
            total_syncs = total_syncs + 1,
            successful_syncs = successful_syncs + 1,
            last_sync_at = NEW.completed_at,
            last_sync_status = NEW.status,
            last_sync_error = NULL
        WHERE id = NEW.integration_id;
    ELSIF NEW.status = 'failed' THEN
        UPDATE crm_integrations
        SET
            total_syncs = total_syncs + 1,
            failed_syncs = failed_syncs + 1,
            last_sync_at = NEW.completed_at,
            last_sync_status = NEW.status,
            last_sync_error = NEW.error_message
        WHERE id = NEW.integration_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update stats when sync completes
CREATE TRIGGER update_integration_sync_stats_trigger
    AFTER UPDATE OF status ON crm_sync_logs
    FOR EACH ROW
    WHEN (NEW.status IN ('success', 'partial', 'failed') AND OLD.status != NEW.status)
    EXECUTE FUNCTION update_integration_sync_stats();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE crm_integrations IS 'CRM integration configurations for consultants';
COMMENT ON TABLE crm_sync_logs IS 'History of CRM synchronization operations';
COMMENT ON TABLE crm_field_mappings_defaults IS 'Default field mappings for each CRM provider';

COMMENT ON COLUMN crm_integrations.api_key IS 'Encrypted API key - use encryption module to decrypt';
COMMENT ON COLUMN crm_integrations.field_mappings IS 'JSON mapping from our lead fields to CRM fields';
COMMENT ON COLUMN crm_integrations.sync_on_score_threshold IS 'Auto-sync leads when score reaches this threshold';

COMMENT ON COLUMN crm_sync_logs.request_data IS 'Sanitized request data (no credentials)';
COMMENT ON COLUMN crm_sync_logs.crm_record_id IS 'ID of the record in the external CRM system';
