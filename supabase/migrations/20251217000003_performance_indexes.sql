-- Performance indexes for consultant-scoped queries

-- Lead queries by consultant + status
CREATE INDEX IF NOT EXISTS idx_leads_consultant_status
ON leads (consultant_id, status);

-- Lead queries by consultant + created_at (recent leads)
CREATE INDEX IF NOT EXISTS idx_leads_consultant_created
ON leads (consultant_id, created_at DESC);

-- Conversation queries by lead
CREATE INDEX IF NOT EXISTS idx_conversations_lead
ON conversations (lead_id, created_at DESC);

-- Message queries by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON messages (conversation_id, created_at ASC);

-- Flow queries by consultant + active
CREATE INDEX IF NOT EXISTS idx_flows_consultant_active
ON flows (consultant_id, is_active);

-- WhatsApp number uniqueness within consultant scope
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_consultant_whatsapp
ON leads (consultant_id, whatsapp_number);
