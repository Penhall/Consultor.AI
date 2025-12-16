-- WhatsApp Integrations Migration
-- Adds Meta Cloud API support with multi-tenant architecture
-- Version: 1.0
-- Date: 2025-01-15

-- ==============================================
-- TABLES
-- ==============================================

-- WhatsApp Integrations table (Meta Cloud API)
CREATE TABLE whatsapp_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,

    -- Provider (Meta is primary, others for future support)
    provider VARCHAR(50) NOT NULL DEFAULT 'meta' CHECK (provider IN ('meta', 'weni', '360dialog', 'twilio')),

    -- Meta Cloud API credentials (ENCRYPTED)
    access_token TEXT,  -- Encrypted - Long-lived access token
    waba_id VARCHAR(100),  -- WhatsApp Business Account ID
    phone_number_id VARCHAR(100),  -- Phone Number ID (used to send messages)
    business_account_id VARCHAR(100),  -- Facebook Business Account ID

    -- WhatsApp Business Information
    phone_number VARCHAR(20) NOT NULL,
    business_name VARCHAR(255),
    display_name VARCHAR(255),
    quality_rating VARCHAR(20),  -- GREEN, YELLOW, RED, UNKNOWN

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'rate_limited')),
    verified_at TIMESTAMPTZ,

    -- Rate limits (Meta automatically assigns tiers)
    messaging_limit_tier VARCHAR(20),  -- TIER_50, TIER_250, TIER_1K, TIER_10K, TIER_100K, TIER_UNLIMITED
    last_rate_limit_check TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(consultant_id, provider),
    UNIQUE(phone_number),
    UNIQUE(waba_id),
    UNIQUE(phone_number_id)
);

-- Subscription tiers table
CREATE TABLE subscription_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    price_monthly DECIMAL(10,2) NOT NULL,
    max_leads INTEGER NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultants subscriptions table
CREATE TABLE consultant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'suspended')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    stripe_subscription_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(consultant_id)
);

-- ==============================================
-- INDEXES
-- ==============================================

-- WhatsApp Integrations indexes
CREATE INDEX idx_whatsapp_integrations_consultant_active
    ON whatsapp_integrations(consultant_id, provider)
    WHERE status = 'active';

CREATE INDEX idx_whatsapp_integrations_waba
    ON whatsapp_integrations(waba_id)
    WHERE provider = 'meta';

CREATE INDEX idx_whatsapp_integrations_phone
    ON whatsapp_integrations(phone_number);

-- Subscription indexes
CREATE INDEX idx_consultant_subscriptions_consultant
    ON consultant_subscriptions(consultant_id);

CREATE INDEX idx_consultant_subscriptions_status
    ON consultant_subscriptions(status)
    WHERE status = 'active';

-- ==============================================
-- FUNCTIONS
-- ==============================================

-- Function to generate webhook URL
CREATE OR REPLACE FUNCTION get_webhook_url(consultant_uuid UUID, integration_provider VARCHAR)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN integration_provider = 'meta' THEN
            'https://consultor.ai/api/webhook/meta/' || consultant_uuid::text
        ELSE
            'https://consultor.ai/api/webhook/whatsapp/' || consultant_uuid::text
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if consultant is within lead limits
CREATE OR REPLACE FUNCTION check_lead_limit(consultant_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_leads INTEGER;
    max_leads INTEGER;
BEGIN
    -- Get current lead count for this month
    SELECT COUNT(*)
    INTO current_leads
    FROM leads
    WHERE consultant_id = consultant_uuid
    AND created_at >= DATE_TRUNC('month', NOW());

    -- Get max leads allowed for consultant's tier
    SELECT st.max_leads
    INTO max_leads
    FROM consultant_subscriptions cs
    JOIN subscription_tiers st ON st.id = cs.tier_id
    WHERE cs.consultant_id = consultant_uuid
    AND cs.status = 'active';

    -- If no subscription found, return false
    IF max_leads IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if within limits
    RETURN current_leads < max_leads;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS
-- ==============================================

-- WhatsApp Integrations triggers
CREATE TRIGGER update_whatsapp_integrations_updated_at
    BEFORE UPDATE ON whatsapp_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Consultant Subscriptions triggers
CREATE TRIGGER update_consultant_subscriptions_updated_at
    BEFORE UPDATE ON consultant_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS
ALTER TABLE whatsapp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_subscriptions ENABLE ROW LEVEL SECURITY;

-- WhatsApp Integrations RLS policies
CREATE POLICY "Consultants can view their own integrations"
    ON whatsapp_integrations FOR SELECT
    USING (consultant_id = auth.uid());

CREATE POLICY "Consultants can insert their own integrations"
    ON whatsapp_integrations FOR INSERT
    WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Consultants can update their own integrations"
    ON whatsapp_integrations FOR UPDATE
    USING (consultant_id = auth.uid());

CREATE POLICY "Consultants can delete their own integrations"
    ON whatsapp_integrations FOR DELETE
    USING (consultant_id = auth.uid());

-- Subscription Tiers RLS (public read)
CREATE POLICY "Anyone can view subscription tiers"
    ON subscription_tiers FOR SELECT
    USING (true);

-- Consultant Subscriptions RLS
CREATE POLICY "Consultants can view their own subscription"
    ON consultant_subscriptions FOR SELECT
    USING (consultant_id = auth.uid());

-- ==============================================
-- UPDATE EXISTING TABLES
-- ==============================================

-- Add new columns to consultants table
ALTER TABLE consultants
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS cpf_cnpj VARCHAR(20),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS instagram VARCHAR(100),
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS address_street VARCHAR(255),
ADD COLUMN IF NOT EXISTS address_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS address_state VARCHAR(2),
ADD COLUMN IF NOT EXISTS address_zip_code VARCHAR(10);

-- Update messages table to support new structure
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey,
ADD COLUMN IF NOT EXISTS consultant_id UUID REFERENCES consultants(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS lead_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
ADD COLUMN IF NOT EXISTS platform_message_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed'));

-- Make conversation_id nullable (for direct messages)
ALTER TABLE messages
ALTER COLUMN conversation_id DROP NOT NULL;

-- Add index for new fields
CREATE INDEX IF NOT EXISTS idx_messages_consultant_lead
    ON messages(consultant_id, lead_phone);

CREATE INDEX IF NOT EXISTS idx_messages_direction
    ON messages(direction);

-- ==============================================
-- INITIAL DATA (Subscription Tiers)
-- ==============================================

INSERT INTO subscription_tiers (name, price_monthly, max_leads, features) VALUES
('freemium', 0.00, 20, '{
    "basic_flow": true,
    "text_only": true,
    "analytics_basic": true,
    "support": "community"
}'::jsonb),
('pro', 47.00, 200, '{
    "custom_flows": true,
    "images": true,
    "auto_followup": true,
    "csv_export": true,
    "analytics_advanced": true,
    "support": "email"
}'::jsonb),
('agency', 147.00, 1000, '{
    "custom_flows": true,
    "images": true,
    "auto_followup": true,
    "csv_export": true,
    "crm_integration": true,
    "white_label": true,
    "analytics_advanced": true,
    "priority_support": true,
    "support": "priority"
}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- COMMENTS
-- ==============================================

COMMENT ON TABLE whatsapp_integrations IS 'WhatsApp Business integrations via Meta Cloud API';
COMMENT ON TABLE subscription_tiers IS 'Available subscription tiers for consultants';
COMMENT ON TABLE consultant_subscriptions IS 'Active subscriptions for each consultant';
COMMENT ON COLUMN whatsapp_integrations.access_token IS 'Encrypted Meta access token';
COMMENT ON COLUMN whatsapp_integrations.quality_rating IS 'Meta quality rating: GREEN (good), YELLOW (medium), RED (poor)';
COMMENT ON COLUMN whatsapp_integrations.messaging_limit_tier IS 'Meta messaging tier based on quality and volume';
