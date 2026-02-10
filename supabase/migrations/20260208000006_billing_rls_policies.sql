-- Migration: RLS policies for billing tables
-- Feature: 002-saas-billing-admin
-- Date: 2026-02-08

-- Enable RLS on all new tables
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_view_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_form_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FILES: Users see/manage only their own files
-- =====================================================
CREATE POLICY "files_select_own" ON files
  FOR SELECT USING (consultant_id = auth.uid());

CREATE POLICY "files_insert_own" ON files
  FOR INSERT WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "files_delete_own" ON files
  FOR DELETE USING (consultant_id = auth.uid());

-- =====================================================
-- DAILY_STATS: Only via service_role (admin API checks is_admin)
-- =====================================================
CREATE POLICY "daily_stats_service_role_select" ON daily_stats
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "daily_stats_service_role_insert" ON daily_stats
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "daily_stats_service_role_update" ON daily_stats
  FOR UPDATE USING (auth.role() = 'service_role');

-- =====================================================
-- PAGE_VIEW_SOURCES: Only via service_role
-- =====================================================
CREATE POLICY "page_view_sources_service_role_select" ON page_view_sources
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "page_view_sources_service_role_insert" ON page_view_sources
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- LOGS: Only via service_role
-- =====================================================
CREATE POLICY "logs_service_role_insert" ON logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "logs_service_role_select" ON logs
  FOR SELECT USING (auth.role() = 'service_role');

-- =====================================================
-- CONTACT_FORM_MESSAGES: Own messages + admin sees all
-- =====================================================
CREATE POLICY "contact_messages_select_own_or_admin" ON contact_form_messages
  FOR SELECT USING (
    consultant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM consultants
      WHERE consultants.id = auth.uid()
      AND consultants.is_admin = true
    )
  );

CREATE POLICY "contact_messages_insert_own" ON contact_form_messages
  FOR INSERT WITH CHECK (consultant_id = auth.uid());

-- =====================================================
-- CONSULTANTS: Admin can SELECT all (for admin users table)
-- =====================================================
CREATE POLICY "consultants_admin_select_all" ON consultants
  FOR SELECT USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM consultants AS c
      WHERE c.id = auth.uid()
      AND c.is_admin = true
    )
  );
