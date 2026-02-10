-- Seed: Default billing plan configuration
-- Feature: 002-saas-billing-admin
-- Date: 2026-02-08
--
-- This seed ensures all existing consultants have default billing fields.
-- Run after migration 20260208000001_add_billing_fields.sql.

-- Set default values for existing consultants that may not have them
UPDATE consultants
SET
  subscription_plan = COALESCE(subscription_plan, 'freemium'),
  credits = COALESCE(credits, 20),
  purchased_credits = COALESCE(purchased_credits, 0),
  monthly_credits_allocation = COALESCE(monthly_credits_allocation, 20),
  is_admin = COALESCE(is_admin, false)
WHERE subscription_plan IS NULL
   OR credits IS NULL;

-- Create initial daily_stats record for today (if not exists)
INSERT INTO daily_stats (date, user_count, paid_user_count)
SELECT
  CURRENT_DATE,
  (SELECT COUNT(*) FROM consultants),
  (SELECT COUNT(*) FROM consultants WHERE subscription_status = 'active')
ON CONFLICT (date) DO NOTHING;
