-- Migration: Create contact_form_messages table
-- Feature: 002-saas-billing-admin
-- Date: 2026-02-08

CREATE TABLE IF NOT EXISTS contact_form_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_form_messages_consultant_id
  ON contact_form_messages (consultant_id);

COMMENT ON TABLE contact_form_messages IS 'Messages from users via the contact form';
