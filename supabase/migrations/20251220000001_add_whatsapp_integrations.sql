-- Migration: Add WhatsApp Integrations Table (Multi-Tenant Architecture)
-- Description: Enables each consultant to connect their own WhatsApp Business Account
-- via Meta Embedded Signup or other providers (Weni, 360dialog, Twilio)

-- Create whatsapp_integrations table
CREATE TABLE IF NOT EXISTS whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,

  -- Provider type (Meta, Weni, 360dialog, Twilio)
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('meta', 'weni', '360dialog', 'twilio')),

  -- Credentials (ALL ENCRYPTED)
  access_token TEXT,              -- Meta/360dialog access token (encrypted)
  refresh_token TEXT,             -- Meta refresh token (encrypted)
  api_key TEXT,                   -- Weni/360dialog API key (encrypted)
  api_secret TEXT,                -- Twilio/other API secret (encrypted)
  webhook_secret TEXT,            -- Webhook verification secret (encrypted)

  -- WhatsApp Business Account Info
  phone_number VARCHAR(20) NOT NULL,
  phone_number_id VARCHAR(100),   -- Meta/360dialog phone number ID
  waba_id VARCHAR(100),           -- Meta WhatsApp Business Account ID
  display_name VARCHAR(255),      -- Business display name

  -- Status & Verification
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,         -- Token expiration (for refresh)
  last_sync_at TIMESTAMPTZ,       -- Last successful message sync

  -- Webhook URL (generated automatically)
  webhook_url TEXT GENERATED ALWAYS AS (
    'https://consultor.ai/api/webhook/' || provider || '/' || consultant_id::text
  ) STORED,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,  -- Additional provider-specific data

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT whatsapp_integrations_consultant_provider_unique
    UNIQUE(consultant_id, provider),
  CONSTRAINT whatsapp_integrations_phone_unique
    UNIQUE(phone_number)
);

-- Indexes for performance
CREATE INDEX idx_whatsapp_integrations_consultant
  ON whatsapp_integrations(consultant_id)
  WHERE status = 'active';

CREATE INDEX idx_whatsapp_integrations_phone
  ON whatsapp_integrations(phone_number);

CREATE INDEX idx_whatsapp_integrations_status
  ON whatsapp_integrations(status);

CREATE INDEX idx_whatsapp_integrations_provider
  ON whatsapp_integrations(provider, status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_whatsapp_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER whatsapp_integrations_updated_at
  BEFORE UPDATE ON whatsapp_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_integrations_updated_at();

-- Row Level Security (RLS)
ALTER TABLE whatsapp_integrations ENABLE ROW LEVEL SECURITY;

-- Policy: Consultants can only see their own integrations
CREATE POLICY consultants_own_integrations
  ON whatsapp_integrations
  FOR ALL
  USING (
    consultant_id IN (
      SELECT id FROM consultants WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role has full access (for webhooks)
CREATE POLICY service_role_full_access
  ON whatsapp_integrations
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Comments for documentation
COMMENT ON TABLE whatsapp_integrations IS 'Stores WhatsApp Business integrations for each consultant (multi-tenant)';
COMMENT ON COLUMN whatsapp_integrations.provider IS 'WhatsApp provider: meta (Embedded Signup), weni, 360dialog, twilio';
COMMENT ON COLUMN whatsapp_integrations.access_token IS 'Encrypted access token from provider';
COMMENT ON COLUMN whatsapp_integrations.webhook_url IS 'Auto-generated webhook URL for this integration';
COMMENT ON COLUMN whatsapp_integrations.metadata IS 'Provider-specific metadata (e.g., rate limits, features)';

-- Migrate existing data from consultants table (if any)
-- Note: This assumes consultants.meta_access_token and whatsapp_business_account_id exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'consultants'
    AND column_name = 'meta_access_token'
  ) THEN
    INSERT INTO whatsapp_integrations (
      consultant_id,
      provider,
      access_token,
      phone_number,
      waba_id,
      status,
      verified_at
    )
    SELECT
      id,
      'meta',
      meta_access_token,
      COALESCE(whatsapp_number, 'pending'),  -- Placeholder if missing
      whatsapp_business_account_id,
      'active',
      NOW()
    FROM consultants
    WHERE meta_access_token IS NOT NULL
    ON CONFLICT (consultant_id, provider) DO NOTHING;
  END IF;
END $$;

-- Grant permissions
GRANT ALL ON whatsapp_integrations TO authenticated;
GRANT ALL ON whatsapp_integrations TO service_role;
