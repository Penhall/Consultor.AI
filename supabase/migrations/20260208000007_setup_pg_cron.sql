-- Migration: RPC functions and pg_cron setup for billing
-- Feature: 002-saas-billing-admin
-- Date: 2026-02-08

-- =====================================================
-- FUNCTION: decrement_credits
-- Atomically decrements credits with floor check.
-- Returns remaining credits or throws error if insufficient.
-- =====================================================
CREATE OR REPLACE FUNCTION decrement_credits(user_id UUID, amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  remaining INTEGER;
BEGIN
  UPDATE consultants
  SET credits = credits - amount
  WHERE id = user_id AND credits >= amount
  RETURNING credits INTO remaining;

  IF remaining IS NULL THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  RETURN remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: reset_monthly_credits
-- Called by pg_cron on the 1st of each month.
-- Resets subscription credits without affecting purchased credits.
-- =====================================================
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
BEGIN
  UPDATE consultants
  SET credits = monthly_credits_allocation + purchased_credits,
      credits_reset_at = NOW()
  WHERE subscription_status IN ('active', 'cancel_at_period_end')
    OR subscription_plan = 'freemium'
    OR subscription_plan IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: calculate_daily_stats
-- Error-safe wrapper for daily stats calculation.
-- Calculates user counts, deltas, and persists to daily_stats.
-- Revenue and page views are updated by the application layer.
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_daily_stats()
RETURNS void AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  total_users INTEGER;
  paying_users INTEGER;
  yesterday_users INTEGER;
  yesterday_paid INTEGER;
BEGIN
  -- Count current users
  SELECT COUNT(*) INTO total_users FROM consultants;
  SELECT COUNT(*) INTO paying_users FROM consultants
    WHERE subscription_status = 'active';

  -- Get yesterday's counts for delta calculation
  SELECT COALESCE(user_count, 0), COALESCE(paid_user_count, 0)
  INTO yesterday_users, yesterday_paid
  FROM daily_stats
  WHERE date = today_date - INTERVAL '1 day';

  -- Upsert today's stats
  INSERT INTO daily_stats (date, user_count, paid_user_count, user_delta, paid_user_delta)
  VALUES (
    today_date,
    total_users,
    paying_users,
    total_users - COALESCE(yesterday_users, 0),
    paying_users - COALESCE(yesterday_paid, 0)
  )
  ON CONFLICT (date) DO UPDATE SET
    user_count = EXCLUDED.user_count,
    paid_user_count = EXCLUDED.paid_user_count,
    user_delta = EXCLUDED.user_delta,
    paid_user_delta = EXCLUDED.paid_user_delta;

EXCEPTION WHEN OTHERS THEN
  -- Log error without crashing
  INSERT INTO logs (message, level)
  VALUES ('Daily stats calculation failed: ' || SQLERRM, 'job-error');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PG_CRON: Schedule hourly stats and monthly credit reset
-- NOTE: pg_cron requires Supabase paid plan.
-- These will fail silently on free tier (extension not available).
-- =====================================================
DO $$
BEGIN
  -- Enable pg_cron extension (available on Supabase paid plans)
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Hourly stats calculation
  PERFORM cron.schedule(
    'calculate-daily-stats',
    '0 * * * *',
    'SELECT calculate_daily_stats()'
  );

  -- Monthly credit reset (1st of each month at 00:05 UTC)
  PERFORM cron.schedule(
    'reset-monthly-credits',
    '5 0 1 * *',
    'SELECT reset_monthly_credits()'
  );
EXCEPTION WHEN OTHERS THEN
  -- pg_cron not available (free tier) — log and continue
  RAISE NOTICE 'pg_cron extension not available: %. Stats and credit reset must be triggered manually.', SQLERRM;
END;
$$;
