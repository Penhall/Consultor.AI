-- Migration: Create logs table for system events
-- Feature: 002-saas-billing-admin
-- Date: 2026-02-08

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  level VARCHAR(20) NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_log_level CHECK (
    level IN ('info', 'warn', 'error', 'job-error')
  )
);

CREATE INDEX IF NOT EXISTS idx_logs_created_at
  ON logs (created_at DESC);

COMMENT ON TABLE logs IS 'System event logs for debugging and monitoring';
