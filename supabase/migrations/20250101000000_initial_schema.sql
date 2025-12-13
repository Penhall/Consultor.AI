-- Initial Schema for Consultor.AI
-- Based on Database Design Document
-- Version: 1.0
-- Date: 2025-01-01

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- TABLES
-- ==============================================

-- Consultants table
CREATE TABLE consultants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    whatsapp_number VARCHAR(20) NOT NULL,
    vertical VARCHAR(50) NOT NULL CHECK (vertical IN ('saude', 'imoveis', 'automoveis', 'financeiro')),
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
    whatsapp_number VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'Lead Sem Nome',
    email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_contato', 'qualificado', 'agendado', 'fechado', 'perdido')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (consultant_id, whatsapp_number)
);

-- Flows table
CREATE TABLE flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    vertical VARCHAR(50) NOT NULL,
    flow_definition JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE RESTRICT,
    state JSONB NOT NULL DEFAULT '{}',
    current_step_id VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (lead_id, flow_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('lead', 'bot')),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Responses table
CREATE TABLE ai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    model VARCHAR(100) NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Images table
CREATE TABLE generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    prompt TEXT,
    provider VARCHAR(50) DEFAULT 'canva',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Events table
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES
-- ==============================================

-- Consultants indexes
CREATE INDEX idx_consultants_email ON consultants(email);
CREATE INDEX idx_consultants_slug ON consultants(slug);
CREATE INDEX idx_consultants_vertical ON consultants(vertical);

-- Leads indexes
CREATE INDEX idx_leads_consultant_id ON leads(consultant_id);
CREATE INDEX idx_leads_whatsapp_number ON leads(whatsapp_number);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_consultant_status ON leads(consultant_id, status);

-- Flows indexes
CREATE INDEX idx_flows_consultant_id ON flows(consultant_id);
CREATE INDEX idx_flows_is_active ON flows(is_active);
CREATE INDEX idx_flows_vertical ON flows(vertical);

-- Conversations indexes
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_flow_id ON conversations(flow_id);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender);

-- AI Responses indexes
CREATE INDEX idx_ai_responses_conversation_id ON ai_responses(conversation_id);
CREATE INDEX idx_ai_responses_created_at ON ai_responses(created_at DESC);

-- Webhook Events indexes
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Audit Logs indexes
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==============================================
-- FUNCTIONS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Consultants triggers
CREATE TRIGGER update_consultants_updated_at
    BEFORE UPDATE ON consultants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Leads triggers
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Flows triggers
CREATE TRIGGER update_flows_updated_at
    BEFORE UPDATE ON flows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Consultants RLS policies
CREATE POLICY "Consultants can view their own data"
    ON consultants FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Consultants can update their own data"
    ON consultants FOR UPDATE
    USING (auth.uid() = id);

-- Leads RLS policies
CREATE POLICY "Consultants can view their own leads"
    ON leads FOR SELECT
    USING (consultant_id = auth.uid());

CREATE POLICY "Consultants can insert their own leads"
    ON leads FOR INSERT
    WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Consultants can update their own leads"
    ON leads FOR UPDATE
    USING (consultant_id = auth.uid());

CREATE POLICY "Consultants can delete their own leads"
    ON leads FOR DELETE
    USING (consultant_id = auth.uid());

-- Flows RLS policies
CREATE POLICY "Consultants can view their own flows"
    ON flows FOR SELECT
    USING (consultant_id = auth.uid());

CREATE POLICY "Consultants can insert their own flows"
    ON flows FOR INSERT
    WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Consultants can update their own flows"
    ON flows FOR UPDATE
    USING (consultant_id = auth.uid());

-- Conversations RLS policies
CREATE POLICY "Consultants can view conversations of their leads"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM leads
            WHERE leads.id = conversations.lead_id
            AND leads.consultant_id = auth.uid()
        )
    );

-- Messages RLS policies
CREATE POLICY "Consultants can view messages of their conversations"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            JOIN leads ON leads.id = conversations.lead_id
            WHERE conversations.id = messages.conversation_id
            AND leads.consultant_id = auth.uid()
        )
    );

-- AI Responses RLS policies (view only)
CREATE POLICY "Consultants can view AI responses of their conversations"
    ON ai_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            JOIN leads ON leads.id = conversations.lead_id
            WHERE conversations.id = ai_responses.conversation_id
            AND leads.consultant_id = auth.uid()
        )
    );

-- ==============================================
-- MATERIALIZED VIEWS
-- ==============================================

-- Lead statistics per consultant
CREATE MATERIALIZED VIEW lead_statistics AS
SELECT
    consultant_id,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE status = 'novo') as leads_novos,
    COUNT(*) FILTER (WHERE status = 'em_contato') as leads_em_contato,
    COUNT(*) FILTER (WHERE status = 'qualificado') as leads_qualificados,
    COUNT(*) FILTER (WHERE status = 'fechado') as leads_fechados,
    COUNT(*) FILTER (WHERE status = 'perdido') as leads_perdidos,
    ROUND(AVG(score)::numeric, 2) as score_medio,
    MAX(created_at) as ultimo_lead_criado
FROM leads
GROUP BY consultant_id;

CREATE UNIQUE INDEX idx_lead_statistics_consultant_id ON lead_statistics(consultant_id);

-- ==============================================
-- INITIAL DATA
-- ==============================================

-- Insert default health plan flow
-- (Will be added in seed.sql)

-- ==============================================
-- COMMENTS
-- ==============================================

COMMENT ON TABLE consultants IS 'Autonomous consultants using the platform';
COMMENT ON TABLE leads IS 'Leads captured via WhatsApp';
COMMENT ON TABLE flows IS 'Conversation flow definitions';
COMMENT ON TABLE conversations IS 'Active conversations following a flow';
COMMENT ON TABLE messages IS 'Individual messages in conversations';
COMMENT ON TABLE ai_responses IS 'AI-generated responses log';
COMMENT ON TABLE generated_images IS 'Images generated for leads';
COMMENT ON TABLE webhook_events IS 'WhatsApp webhook events';
COMMENT ON TABLE audit_logs IS 'Audit trail of data changes';
