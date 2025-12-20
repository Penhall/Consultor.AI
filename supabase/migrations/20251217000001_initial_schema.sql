-- Initial Schema Migration
-- Creates core tables for Consultor.AI MVP
-- Version: 1.0.0
-- Date: 2025-12-17

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE lead_status AS ENUM ('novo', 'em_contato', 'qualificado', 'agendado', 'fechado', 'perdido');
CREATE TYPE conversation_status AS ENUM ('active', 'completed', 'abandoned', 'paused');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE vertical_type AS ENUM ('saude', 'imoveis');

-- =====================================================
-- CONSULTANTS TABLE
-- Sales professionals using the platform
-- =====================================================
CREATE TABLE consultants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Authentication (linked to Supabase Auth)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Profile Information
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    whatsapp_number TEXT,
    vertical vertical_type DEFAULT 'saude',
    slug TEXT UNIQUE NOT NULL,

    -- WhatsApp Business Integration
    meta_access_token TEXT, -- Encrypted
    meta_refresh_token TEXT, -- Encrypted
    whatsapp_business_account_id TEXT,
    whatsapp_phone_number_id TEXT,

    -- Subscription & Limits
    subscription_tier TEXT DEFAULT 'freemium', -- freemium, pro, agencia
    subscription_status TEXT DEFAULT 'active', -- active, canceled, expired
    monthly_lead_limit INTEGER DEFAULT 20,
    leads_count_current_month INTEGER DEFAULT 0,
    subscription_expires_at TIMESTAMPTZ,

    -- Settings
    settings JSONB DEFAULT '{}',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$'),
    CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('freemium', 'pro', 'agencia'))
);

-- Indexes
CREATE INDEX idx_consultants_user_id ON consultants(user_id);
CREATE INDEX idx_consultants_email ON consultants(email);
CREATE INDEX idx_consultants_slug ON consultants(slug);
CREATE INDEX idx_consultants_subscription ON consultants(subscription_tier, subscription_status);

-- =====================================================
-- LEADS TABLE
-- Potential customers
-- =====================================================
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Ownership
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,

    -- Contact Information
    whatsapp_number TEXT NOT NULL,
    name TEXT,
    email TEXT,

    -- Status & Qualification
    status lead_status DEFAULT 'novo',
    score INTEGER CHECK (score >= 0 AND score <= 100),
    qualified_at TIMESTAMPTZ,

    -- Lead Data (collected during conversation)
    metadata JSONB DEFAULT '{}',

    -- Source Tracking
    source TEXT, -- 'whatsapp', 'manual', 'import'
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_contacted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_whatsapp_number CHECK (whatsapp_number ~* '^\+55[0-9]{11}$'),
    CONSTRAINT unique_lead_per_consultant UNIQUE (consultant_id, whatsapp_number)
);

-- Indexes
CREATE INDEX idx_leads_consultant ON leads(consultant_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_whatsapp ON leads(whatsapp_number);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_score ON leads(score DESC) WHERE score IS NOT NULL;

-- =====================================================
-- FLOWS TABLE
-- Conversation flow definitions (JSON-based)
-- =====================================================
CREATE TABLE flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Ownership
    consultant_id UUID REFERENCES consultants(id) ON DELETE CASCADE,

    -- Flow Information
    name TEXT NOT NULL,
    description TEXT,
    vertical vertical_type NOT NULL,

    -- Flow Definition (JSON structure)
    definition JSONB NOT NULL,

    -- Version Control
    version TEXT DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,

    -- Usage Stats
    usage_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_definition CHECK (jsonb_typeof(definition) = 'object')
);

-- Indexes
CREATE INDEX idx_flows_consultant ON flows(consultant_id);
CREATE UNIQUE INDEX idx_unique_default_flow ON flows(consultant_id, vertical) WHERE is_default = true;
CREATE INDEX idx_flows_vertical ON flows(vertical);
CREATE INDEX idx_flows_active ON flows(is_active) WHERE is_active = true;

-- =====================================================
-- CONVERSATIONS TABLE
-- Active conversation sessions
-- =====================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,

    -- Conversation State
    status conversation_status DEFAULT 'active',
    current_step_id TEXT,
    state JSONB DEFAULT '{}', -- Current state: responses, context, variables

    -- Metrics
    message_count INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_state CHECK (jsonb_typeof(state) = 'object')
);

-- Indexes
CREATE INDEX idx_conversations_lead ON conversations(lead_id);
CREATE INDEX idx_conversations_flow ON conversations(flow_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_active ON conversations(status, updated_at) WHERE status = 'active';

-- =====================================================
-- MESSAGES TABLE
-- Individual messages in conversations
-- =====================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Message Details
    direction message_direction NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text', -- text, image, document, audio

    -- WhatsApp Integration
    whatsapp_message_id TEXT,
    whatsapp_timestamp TIMESTAMPTZ,

    -- Status Tracking
    status message_status DEFAULT 'pending',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- AI Generation (for outbound messages)
    is_ai_generated BOOLEAN DEFAULT false,
    ai_model TEXT,
    ai_prompt_tokens INTEGER,
    ai_completion_tokens INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_whatsapp_id ON messages(whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- =====================================================
-- AI_RESPONSES TABLE
-- AI generation logs for analytics
-- =====================================================
CREATE TABLE ai_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,

    -- AI Details
    model TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'groq', 'google', 'openai'

    -- Prompt & Response
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,

    -- Tokens & Cost
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    estimated_cost DECIMAL(10,6),

    -- Performance
    latency_ms INTEGER,

    -- Quality Metrics
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    user_feedback TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_responses_conversation ON ai_responses(conversation_id);
CREATE INDEX idx_ai_responses_provider ON ai_responses(provider);
CREATE INDEX idx_ai_responses_created_at ON ai_responses(created_at DESC);

-- =====================================================
-- WEBHOOK_EVENTS TABLE
-- Webhook audit trail (LGPD compliance)
-- =====================================================
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Event Details
    event_type TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'meta', 'weni', etc.

    -- Request Data
    request_headers JSONB,
    request_body JSONB,

    -- Response Data
    response_status INTEGER,
    response_body JSONB,

    -- Processing
    processed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    error_message TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_provider ON webhook_events(provider);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- =====================================================
-- AUDIT_LOGS TABLE
-- LGPD compliance audit trail
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Actor
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,

    -- Action Details
    action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'export'
    resource_type TEXT NOT NULL, -- 'lead', 'conversation', 'message', etc.
    resource_id UUID,

    -- Changes (for updates)
    old_values JSONB,
    new_values JSONB,

    -- Context
    ip_address INET,
    user_agent TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_consultant ON audit_logs(consultant_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update consultant leads count
CREATE OR REPLACE FUNCTION update_consultant_leads_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE consultants
        SET leads_count_current_month = leads_count_current_month + 1
        WHERE id = NEW.consultant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update conversation message count
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE conversations
        SET
            message_count = message_count + 1,
            last_message_at = NOW()
        WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_consultants_updated_at BEFORE UPDATE ON consultants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update counts
CREATE TRIGGER update_consultant_leads_count_trigger AFTER INSERT ON leads
    FOR EACH ROW EXECUTE FUNCTION update_consultant_leads_count();

CREATE TRIGGER update_conversation_message_count_trigger AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_message_count();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE consultants IS 'Sales consultants using the Consultor.AI platform';
COMMENT ON TABLE leads IS 'Potential customers (leads) managed by consultants';
COMMENT ON TABLE flows IS 'Conversation flow definitions (JSON-based)';
COMMENT ON TABLE conversations IS 'Active conversation sessions between consultants and leads';
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON TABLE ai_responses IS 'AI generation logs for analytics and cost tracking';
COMMENT ON TABLE webhook_events IS 'Webhook event audit trail for compliance';
COMMENT ON TABLE audit_logs IS 'LGPD compliance audit trail for all data operations';
