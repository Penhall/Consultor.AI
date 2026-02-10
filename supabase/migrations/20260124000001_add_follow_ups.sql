-- Follow-ups Migration
-- Creates the follow_ups table for automated and manual follow-up tracking
-- Version: 1.0.0
-- Date: 2026-01-24

-- Create follow-up status enum
CREATE TYPE follow_up_status AS ENUM ('pending', 'sent', 'completed', 'cancelled');

-- =====================================================
-- FOLLOW_UPS TABLE
-- Scheduled and manual follow-ups for leads
-- =====================================================
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relationships
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,

    -- Follow-up Details
    title TEXT NOT NULL,
    message TEXT, -- Optional message template to send
    notes TEXT, -- Internal notes

    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL,
    reminder_at TIMESTAMPTZ, -- When to remind the consultant

    -- Status Tracking
    status follow_up_status DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Automation
    is_automatic BOOLEAN DEFAULT false,
    auto_send BOOLEAN DEFAULT false, -- If true, message is sent automatically at scheduled_at

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_scheduled_at CHECK (scheduled_at > created_at OR is_automatic = true)
);

-- Indexes
CREATE INDEX idx_follow_ups_lead ON follow_ups(lead_id);
CREATE INDEX idx_follow_ups_consultant ON follow_ups(consultant_id);
CREATE INDEX idx_follow_ups_status ON follow_ups(status);
CREATE INDEX idx_follow_ups_scheduled_at ON follow_ups(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_follow_ups_pending ON follow_ups(consultant_id, status, scheduled_at) WHERE status = 'pending';

-- Trigger for updated_at
CREATE TRIGGER update_follow_ups_updated_at BEFORE UPDATE ON follow_ups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Consultants can only see their own follow-ups
CREATE POLICY "consultants_select_own_follow_ups" ON follow_ups
    FOR SELECT TO authenticated
    USING (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

-- Consultants can insert follow-ups for their own leads
CREATE POLICY "consultants_insert_own_follow_ups" ON follow_ups
    FOR INSERT TO authenticated
    WITH CHECK (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

-- Consultants can update their own follow-ups
CREATE POLICY "consultants_update_own_follow_ups" ON follow_ups
    FOR UPDATE TO authenticated
    USING (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ))
    WITH CHECK (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

-- Consultants can delete their own follow-ups
CREATE POLICY "consultants_delete_own_follow_ups" ON follow_ups
    FOR DELETE TO authenticated
    USING (consultant_id IN (
        SELECT id FROM consultants WHERE user_id = auth.uid()
    ));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE follow_ups IS 'Scheduled follow-ups for leads - both manual and automatic';
COMMENT ON COLUMN follow_ups.is_automatic IS 'True if created automatically by the system';
COMMENT ON COLUMN follow_ups.auto_send IS 'True if message should be sent automatically at scheduled_at';
