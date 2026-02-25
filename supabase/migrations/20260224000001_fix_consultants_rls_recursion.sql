-- Migration: Fix infinite recursion in consultants RLS policy
-- Date: 2026-02-24
-- Problem: consultants_admin_select_all policy had an EXISTS subquery that
--          queried the consultants table itself, causing infinite recursion
--          (PostgreSQL error 42P17). Also used wrong column: id instead of user_id.

-- Step 1: Create SECURITY DEFINER function to check admin status.
-- SECURITY DEFINER runs as the function owner (bypasses RLS), preventing recursion.
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM consultants
    WHERE user_id = auth.uid()
    AND is_admin = true
  );
$$;

-- Step 2: Drop the broken policy
DROP POLICY IF EXISTS "consultants_admin_select_all" ON consultants;

-- Step 3: Recreate with correct column (user_id) and no recursive subquery
CREATE POLICY "consultants_admin_select_all" ON consultants
  FOR SELECT USING (
    user_id = auth.uid()
    OR auth_is_admin()
  );

-- Step 4: Fix contact_form_messages policy that had the same recursion issue
DROP POLICY IF EXISTS "contact_messages_select_own_or_admin" ON contact_form_messages;

CREATE POLICY "contact_messages_select_own_or_admin" ON contact_form_messages
  FOR SELECT USING (
    consultant_id = auth.uid()
    OR auth_is_admin()
  );
