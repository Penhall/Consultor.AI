-- Message Templates Migration
-- Creates the message_templates table for reusable message templates
-- Version: 1.0.0
-- Date: 2026-01-25

-- Create template category enum
CREATE TYPE template_category AS ENUM (
    'greeting',      -- Saudacoes iniciais
    'follow_up',     -- Follow-ups
    'qualification', -- Qualificacao
    'closing',       -- Fechamento
    'reengagement',  -- Re-engajamento
    'custom'         -- Personalizado
);

-- =====================================================
-- MESSAGE_TEMPLATES TABLE
-- Reusable message templates for consultants
-- =====================================================
CREATE TABLE message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,

    -- Template Details
    name TEXT NOT NULL,
    category template_category DEFAULT 'custom',
    content TEXT NOT NULL,

    -- Variables (e.g., {{nome_lead}}, {{nome_consultor}})
    variables TEXT[] DEFAULT '{}',

    -- Usage tracking
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- System default templates

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT template_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
    CONSTRAINT template_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 1000)
);

-- Indexes
CREATE INDEX idx_templates_consultant ON message_templates(consultant_id);
CREATE INDEX idx_templates_category ON message_templates(category);
CREATE INDEX idx_templates_active ON message_templates(consultant_id, is_active) WHERE is_active = true;
CREATE INDEX idx_templates_use_count ON message_templates(consultant_id, use_count DESC);

-- Trigger for updated_at
CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Consultants can only see their own templates
CREATE POLICY "consultants_select_own_templates" ON message_templates
    FOR SELECT TO authenticated
    USING (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

-- Consultants can insert their own templates
CREATE POLICY "consultants_insert_own_templates" ON message_templates
    FOR INSERT TO authenticated
    WITH CHECK (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

-- Consultants can update their own templates
CREATE POLICY "consultants_update_own_templates" ON message_templates
    FOR UPDATE TO authenticated
    USING (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ))
    WITH CHECK (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

-- Consultants can delete their own templates
CREATE POLICY "consultants_delete_own_templates" ON message_templates
    FOR DELETE TO authenticated
    USING (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

-- =====================================================
-- DEFAULT TEMPLATES (Seed Data)
-- =====================================================

-- Note: These will be inserted via seed script with consultant_id = NULL for system defaults
-- Or copied to each consultant on first access

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE message_templates IS 'Reusable message templates for consultants';
COMMENT ON COLUMN message_templates.variables IS 'List of variable placeholders used in the template';
COMMENT ON COLUMN message_templates.use_count IS 'Number of times this template has been used';
COMMENT ON COLUMN message_templates.is_default IS 'True if this is a system-provided default template';
