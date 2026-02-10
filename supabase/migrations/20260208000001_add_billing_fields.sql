-- Migration: Add Stripe billing fields to consultants
-- Feature: 002-saas-billing-admin
-- Date: 2026-02-08

-- Add Stripe-specific billing columns
ALTER TABLE consultants
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'freemium',
  ADD COLUMN IF NOT EXISTS date_paid TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS purchased_credits INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_credits_allocation INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS credits_reset_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Update subscription_status to support Stripe lifecycle states
-- Existing values: 'active', 'canceled', 'expired'
-- New values: 'active', 'cancel_at_period_end', 'past_due', 'deleted'
-- We keep the column as TEXT (not ENUM) for flexibility

-- Add indexes for billing queries
CREATE INDEX IF NOT EXISTS idx_consultants_stripe_customer_id
  ON consultants (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_consultants_subscription_status
  ON consultants (subscription_status);

CREATE INDEX IF NOT EXISTS idx_consultants_subscription_plan
  ON consultants (subscription_plan);

-- Add constraint for valid subscription plans
ALTER TABLE consultants
  DROP CONSTRAINT IF EXISTS valid_subscription_tier;

ALTER TABLE consultants
  ADD CONSTRAINT valid_subscription_plan
  CHECK (subscription_plan IN ('freemium', 'pro', 'agencia') OR subscription_plan IS NULL);

COMMENT ON COLUMN consultants.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN consultants.subscription_plan IS 'Current plan: freemium, pro, agencia';
COMMENT ON COLUMN consultants.date_paid IS 'Last successful payment timestamp';
COMMENT ON COLUMN consultants.credits IS 'Current credit balance (subscription + purchased)';
COMMENT ON COLUMN consultants.purchased_credits IS 'One-time purchased credits (never reset)';
COMMENT ON COLUMN consultants.monthly_credits_allocation IS 'Monthly credits from subscription plan';
COMMENT ON COLUMN consultants.credits_reset_at IS 'Last monthly credits reset timestamp';
COMMENT ON COLUMN consultants.is_admin IS 'Admin role flag for platform management';
