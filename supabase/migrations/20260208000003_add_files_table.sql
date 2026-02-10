-- Migration: Create files table for consultant uploads
-- Feature: 002-saas-billing-admin
-- Date: 2026-02-08

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_file_type CHECK (
    type IN ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')
  ),
  CONSTRAINT valid_file_size CHECK (
    size_bytes IS NULL OR size_bytes <= 10485760
  )
);

CREATE INDEX IF NOT EXISTS idx_files_consultant_id
  ON files (consultant_id);

COMMENT ON TABLE files IS 'User-uploaded files stored in Supabase Storage';
COMMENT ON COLUMN files.storage_key IS 'Supabase Storage object path';
