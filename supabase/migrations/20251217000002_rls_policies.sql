-- Row Level Security (RLS) Policies
-- Ensures consultants can only access their own data
-- Version: 1.0.0
-- Date: 2025-12-17

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONSULTANTS POLICIES
-- Users can only see and modify their own consultant profile
-- =====================================================

-- SELECT: Users can view their own consultant profile
CREATE POLICY "consultants_select_own"
    ON consultants FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Users can create their own consultant profile
CREATE POLICY "consultants_insert_own"
    ON consultants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own consultant profile
CREATE POLICY "consultants_update_own"
    ON consultants FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own consultant profile
CREATE POLICY "consultants_delete_own"
    ON consultants FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- LEADS POLICIES
-- Consultants can only access their own leads
-- =====================================================

-- SELECT: Consultants can view their own leads
CREATE POLICY "leads_select_own"
    ON leads FOR SELECT
    USING (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
    );

-- INSERT: Consultants can create leads for themselves
CREATE POLICY "leads_insert_own"
    ON leads FOR INSERT
    WITH CHECK (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
    );

-- UPDATE: Consultants can update their own leads
CREATE POLICY "leads_update_own"
    ON leads FOR UPDATE
    USING (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
    );

-- DELETE: Consultants can delete their own leads
CREATE POLICY "leads_delete_own"
    ON leads FOR DELETE
    USING (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- FLOWS POLICIES
-- Consultants can access their own flows + public default flows
-- =====================================================

-- SELECT: Consultants can view their own flows or public defaults
CREATE POLICY "flows_select_own_or_default"
    ON flows FOR SELECT
    USING (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
        OR consultant_id IS NULL  -- Public default flows
    );

-- INSERT: Consultants can create their own flows
CREATE POLICY "flows_insert_own"
    ON flows FOR INSERT
    WITH CHECK (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
    );

-- UPDATE: Consultants can update their own flows
CREATE POLICY "flows_update_own"
    ON flows FOR UPDATE
    USING (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
    );

-- DELETE: Consultants can delete their own flows (but not defaults)
CREATE POLICY "flows_delete_own"
    ON flows FOR DELETE
    USING (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
        AND consultant_id IS NOT NULL  -- Cannot delete public defaults
    );

-- =====================================================
-- CONVERSATIONS POLICIES
-- Consultants can access conversations for their leads
-- =====================================================

-- SELECT: Consultants can view conversations for their leads
CREATE POLICY "conversations_select_own_leads"
    ON conversations FOR SELECT
    USING (
        lead_id IN (
            SELECT id FROM leads
            WHERE consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    );

-- INSERT: Consultants can create conversations for their leads
CREATE POLICY "conversations_insert_own_leads"
    ON conversations FOR INSERT
    WITH CHECK (
        lead_id IN (
            SELECT id FROM leads
            WHERE consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    );

-- UPDATE: Consultants can update conversations for their leads
CREATE POLICY "conversations_update_own_leads"
    ON conversations FOR UPDATE
    USING (
        lead_id IN (
            SELECT id FROM leads
            WHERE consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        lead_id IN (
            SELECT id FROM leads
            WHERE consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    );

-- DELETE: Consultants can delete conversations for their leads
CREATE POLICY "conversations_delete_own_leads"
    ON conversations FOR DELETE
    USING (
        lead_id IN (
            SELECT id FROM leads
            WHERE consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- MESSAGES POLICIES
-- Consultants can access messages in their conversations
-- =====================================================

-- SELECT: Consultants can view messages in their conversations
CREATE POLICY "messages_select_own_conversations"
    ON messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT c.id FROM conversations c
            INNER JOIN leads l ON c.lead_id = l.id
            WHERE l.consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    );

-- INSERT: Consultants can create messages in their conversations
CREATE POLICY "messages_insert_own_conversations"
    ON messages FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT c.id FROM conversations c
            INNER JOIN leads l ON c.lead_id = l.id
            WHERE l.consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    );

-- UPDATE: Consultants can update messages in their conversations
CREATE POLICY "messages_update_own_conversations"
    ON messages FOR UPDATE
    USING (
        conversation_id IN (
            SELECT c.id FROM conversations c
            INNER JOIN leads l ON c.lead_id = l.id
            WHERE l.consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        conversation_id IN (
            SELECT c.id FROM conversations c
            INNER JOIN leads l ON c.lead_id = l.id
            WHERE l.consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    );

-- DELETE: Consultants can delete messages in their conversations
CREATE POLICY "messages_delete_own_conversations"
    ON messages FOR DELETE
    USING (
        conversation_id IN (
            SELECT c.id FROM conversations c
            INNER JOIN leads l ON c.lead_id = l.id
            WHERE l.consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- AI_RESPONSES POLICIES
-- Consultants can view AI responses for their conversations
-- =====================================================

-- SELECT: Consultants can view AI responses for their conversations
CREATE POLICY "ai_responses_select_own_conversations"
    ON ai_responses FOR SELECT
    USING (
        conversation_id IN (
            SELECT c.id FROM conversations c
            INNER JOIN leads l ON c.lead_id = l.id
            WHERE l.consultant_id IN (
                SELECT id FROM consultants WHERE user_id = auth.uid()
            )
        )
    );

-- INSERT: System can create AI responses (handled by backend)
-- No user-facing INSERT policy needed

-- =====================================================
-- WEBHOOK_EVENTS POLICIES
-- Webhook events are system-managed, no user access
-- =====================================================

-- No policies - webhooks are managed by system/service role only

-- =====================================================
-- AUDIT_LOGS POLICIES
-- Consultants can view their own audit logs
-- =====================================================

-- SELECT: Consultants can view their own audit logs
CREATE POLICY "audit_logs_select_own"
    ON audit_logs FOR SELECT
    USING (
        consultant_id IN (
            SELECT id FROM consultants WHERE user_id = auth.uid()
        )
        OR user_id = auth.uid()
    );

-- INSERT: System creates audit logs (handled by triggers/backend)
-- No user-facing INSERT policy needed

-- =====================================================
-- HELPER FUNCTIONS FOR POLICIES
-- =====================================================

-- Function to check if user is consultant owner
CREATE OR REPLACE FUNCTION is_consultant_owner(check_consultant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM consultants
        WHERE id = check_consultant_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current consultant ID for authenticated user
CREATE OR REPLACE FUNCTION current_consultant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM consultants
        WHERE user_id = auth.uid()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS
-- Allow authenticated users to access tables
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON consultants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON flows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;
GRANT SELECT ON ai_responses TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- Service role has full access (for webhooks, background jobs)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "consultants_select_own" ON consultants IS
    'Consultants can only view their own profile';

COMMENT ON POLICY "leads_select_own" ON leads IS
    'Consultants can only view their own leads';

COMMENT ON POLICY "flows_select_own_or_default" ON flows IS
    'Consultants can view their own flows or public default flows';

COMMENT ON POLICY "conversations_select_own_leads" ON conversations IS
    'Consultants can view conversations for their leads only';

COMMENT ON POLICY "messages_select_own_conversations" ON messages IS
    'Consultants can view messages in their conversations only';
