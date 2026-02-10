-- Migration: Create daily_stats and page_view_sources tables
-- Feature: 002-saas-billing-admin
-- Date: 2026-02-08

-- Aggregated platform metrics calculated hourly by pg_cron job
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  total_views INTEGER NOT NULL DEFAULT 0,
  prev_day_views_change_percent VARCHAR(10) NOT NULL DEFAULT '0',
  user_count INTEGER NOT NULL DEFAULT 0,
  paid_user_count INTEGER NOT NULL DEFAULT 0,
  user_delta INTEGER NOT NULL DEFAULT 0,
  paid_user_delta INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_profit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Traffic sources linked to daily stats
CREATE TABLE IF NOT EXISTS page_view_sources (
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  daily_stats_id INTEGER REFERENCES daily_stats(id) ON DELETE CASCADE,
  visitors INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (name, date)
);

CREATE INDEX IF NOT EXISTS idx_page_view_sources_daily_stats_id
  ON page_view_sources (daily_stats_id);

COMMENT ON TABLE daily_stats IS 'Aggregated platform metrics calculated hourly by pg_cron';
COMMENT ON TABLE page_view_sources IS 'Traffic source breakdown linked to daily stats';
