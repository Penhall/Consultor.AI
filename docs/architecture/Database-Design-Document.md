# Database Design Document
## Consultor.AI - AI-Powered Sales Assistant Platform

**Version:** 1.0
**Date:** 2025-12-12
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose
This document describes the complete database design for Consultor.AI, including schema definitions, indexing strategies, data integrity rules, and migration plans.

### 1.2 Database Technology
- **DBMS:** PostgreSQL 14+
- **Hosting:** Supabase Cloud (AWS infrastructure)
- **Region:** Primary in São Paulo (gru1)
- **Backup:** Automated daily with 30-day retention

---

## 2. Database Schema

### 2.1 Schema Overview

The database is organized into logical groups:
- **Core**: Consultants, Leads
- **Conversation**: Flows, Conversations, Messages
- **AI**: AI Responses, Generated Images
- **System**: Webhook Events, Audit Logs

---

## 3. Table Definitions

### 3.1 consultants

Stores information about sales consultants using the platform.

```sql
CREATE TABLE consultants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    crm_number VARCHAR(50), -- Professional registration (CRM/CRECI)
    whatsapp_number VARCHAR(20) NOT NULL,
    vertical VARCHAR(50) NOT NULL CHECK (vertical IN ('health_plans', 'real_estate', 'automotive', 'insurance')),
    slug VARCHAR(100) NOT NULL UNIQUE, -- URL-safe identifier (e.g., 'joana-saude')
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'agency')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_consultants_email ON consultants(email);
CREATE INDEX idx_consultants_slug ON consultants(slug);
CREATE INDEX idx_consultants_whatsapp ON consultants(whatsapp_number);
CREATE INDEX idx_consultants_vertical ON consultants(vertical);

-- Trigger for updated_at
CREATE TRIGGER update_consultants_updated_at
    BEFORE UPDATE ON consultants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row-Level Security (RLS)
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can view own data"
    ON consultants FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Consultants can update own data"
    ON consultants FOR UPDATE
    USING (auth.uid() = id);
```

**Notes:**
- `slug` is generated from `name` with collision handling (append numeric suffix)
- `whatsapp_number` format: +55XXYYYYYYYYYY (Brazilian format)
- `bio` limited to 200 characters at application level
- `subscription_tier` determines feature access

---

### 3.2 leads

Stores potential customers interacting with consultant bots.

```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
    whatsapp_number VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    profile_name VARCHAR(100), -- WhatsApp profile name
    status VARCHAR(20) DEFAULT 'novo' CHECK (status IN ('novo', 'em_contato', 'agendado', 'fechado', 'perdido')),
    respostas JSONB DEFAULT '{}', -- Collected responses from flow
    metadata JSONB DEFAULT '{}', -- Additional metadata (source, UTM params, etc.)
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Composite unique constraint: one lead per consultant per WhatsApp number
    UNIQUE(consultant_id, whatsapp_number)
);

-- Indexes
CREATE INDEX idx_leads_consultant_id ON leads(consultant_id);
CREATE INDEX idx_leads_whatsapp ON leads(whatsapp_number);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_last_interaction ON leads(last_interaction_at DESC);
CREATE INDEX idx_leads_respostas_gin ON leads USING GIN (respostas); -- For JSONB queries

-- Trigger for updated_at
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can view own leads"
    ON leads FOR SELECT
    USING (consultant_id = auth.uid());

CREATE POLICY "Consultants can update own leads"
    ON leads FOR UPDATE
    USING (consultant_id = auth.uid());

CREATE POLICY "System can insert leads"
    ON leads FOR INSERT
    WITH CHECK (true); -- Webhooks insert with service role
```

**Notes:**
- `respostas` stores flow answers: `{"perfil": "familia", "idade": "31_45", "copart": "nao"}`
- `metadata` stores tracking info: `{"source": "instagram", "utm_campaign": "black_friday"}`
- `last_interaction_at` updated on every message exchange
- Composite unique constraint prevents duplicate leads per consultant

---

### 3.3 flows

Defines conversation flows (JSON-based templates).

```sql
CREATE TABLE flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    vertical VARCHAR(50) NOT NULL CHECK (vertical IN ('health_plans', 'real_estate', 'automotive', 'insurance')),
    description TEXT,
    definition JSONB NOT NULL, -- Flow structure (steps, questions, actions)
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT false, -- System templates vs custom flows
    created_by UUID REFERENCES consultants(id) ON DELETE SET NULL, -- NULL for system templates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure definition follows schema (validated at application level)
    CONSTRAINT valid_flow_definition CHECK (jsonb_typeof(definition) = 'object')
);

-- Indexes
CREATE INDEX idx_flows_vertical ON flows(vertical);
CREATE INDEX idx_flows_is_active ON flows(is_active);
CREATE INDEX idx_flows_created_by ON flows(created_by);
CREATE INDEX idx_flows_definition_gin ON flows USING GIN (definition);

-- RLS Policies
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can view templates and own flows"
    ON flows FOR SELECT
    USING (is_template = true OR created_by = auth.uid());

CREATE POLICY "Consultants can create own flows"
    ON flows FOR INSERT
    WITH CHECK (created_by = auth.uid());
```

**Sample Definition:**
```json
{
  "etapas": [
    {
      "id": "perfil",
      "tipo": "escolha",
      "pergunta": "Você busca plano para:",
      "opcoes": [
        {"rotulo": "Só eu", "valor": "individual"},
        {"rotulo": "Família", "valor": "familia"}
      ],
      "proxima": "idade"
    }
  ]
}
```

---

### 3.4 conversations

Tracks active conversations between leads and bots.

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE RESTRICT,
    current_step VARCHAR(50), -- Current step ID in flow
    state JSONB DEFAULT '{}', -- Conversation state (collected responses, context)
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_flow_id ON conversations(flow_id);
CREATE INDEX idx_conversations_is_completed ON conversations(is_completed);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- Trigger
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can view conversations for own leads"
    ON conversations FOR SELECT
    USING (
        lead_id IN (
            SELECT id FROM leads WHERE consultant_id = auth.uid()
        )
    );
```

**Notes:**
- One active conversation per lead (business rule enforced at app level)
- `state` stores runtime data: `{"last_response": "2", "retry_count": 0}`
- `is_completed` set to `true` when flow reaches terminal step

---

### 3.5 messages

Stores individual messages exchanged in conversations.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'button', 'list')),
    media_url TEXT, -- For image/document messages
    whatsapp_message_id VARCHAR(100), -- WhatsApp's message ID for idempotency
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_whatsapp_id ON messages(whatsapp_message_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_direction ON messages(direction);

-- Unique constraint for idempotency
CREATE UNIQUE INDEX idx_messages_whatsapp_id_unique ON messages(whatsapp_message_id)
    WHERE whatsapp_message_id IS NOT NULL;

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can view messages for own conversations"
    ON messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT c.id FROM conversations c
            JOIN leads l ON c.lead_id = l.id
            WHERE l.consultant_id = auth.uid()
        )
    );
```

**Notes:**
- `whatsapp_message_id` used for deduplication (WhatsApp may retry webhook)
- `status` updated via WhatsApp status webhooks
- `media_url` stores S3/Supabase Storage URL for images

---

### 3.6 ai_responses

Logs all AI-generated responses for analytics and debugging.

```sql
CREATE TABLE ai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL, -- Full prompt sent to AI
    response TEXT NOT NULL, -- AI-generated response
    model VARCHAR(50) NOT NULL, -- e.g., 'llama-3.1-70b-versatile'
    tokens_used INTEGER,
    latency_ms INTEGER, -- Response time in milliseconds
    was_cached BOOLEAN DEFAULT false,
    compliance_check_passed BOOLEAN DEFAULT true,
    compliance_flags JSONB DEFAULT '[]', -- Any compliance warnings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_responses_lead_id ON ai_responses(lead_id);
CREATE INDEX idx_ai_responses_conversation_id ON ai_responses(conversation_id);
CREATE INDEX idx_ai_responses_created_at ON ai_responses(created_at DESC);
CREATE INDEX idx_ai_responses_model ON ai_responses(model);
CREATE INDEX idx_ai_responses_compliance ON ai_responses(compliance_check_passed);

-- RLS
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can view AI responses for own leads"
    ON ai_responses FOR SELECT
    USING (
        lead_id IN (
            SELECT id FROM leads WHERE consultant_id = auth.uid()
        )
    );
```

**Notes:**
- Used for cost tracking (`tokens_used`)
- Performance monitoring (`latency_ms`)
- Compliance auditing (`compliance_flags`)

---

### 3.7 generated_images

Stores metadata for generated comparison images.

```sql
CREATE TABLE generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
    template_id VARCHAR(100) NOT NULL, -- Canva template ID
    template_data JSONB NOT NULL, -- Data used to populate template
    image_url TEXT NOT NULL, -- Final image URL
    file_size_bytes INTEGER,
    generation_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_generated_images_lead_id ON generated_images(lead_id);
CREATE INDEX idx_generated_images_consultant_id ON generated_images(consultant_id);
CREATE INDEX idx_generated_images_created_at ON generated_images(created_at DESC);

-- RLS
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can view own generated images"
    ON generated_images FOR SELECT
    USING (consultant_id = auth.uid());
```

---

### 3.8 webhook_events

Stores raw webhook payloads for debugging and replay.

```sql
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'message', 'status_update', etc.
    payload JSONB NOT NULL,
    signature VARCHAR(255), -- Webhook signature for verification
    processed BOOLEAN DEFAULT false,
    processing_error TEXT,
    retry_count INTEGER DEFAULT 0,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_received_at ON webhook_events(received_at DESC);

-- Automatic cleanup (delete processed events older than 30 days)
-- Implemented via pg_cron extension
```

**Notes:**
- Enables webhook replay in case of processing failures
- Audit trail for compliance
- Automatic cleanup to prevent unbounded growth

---

### 3.9 audit_logs

Tracks important actions for compliance and security.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'lead_exported', 'data_deleted', 'login', etc.
    resource_type VARCHAR(50), -- 'lead', 'consultant', etc.
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_consultant_id ON audit_logs(consultant_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- No RLS (system-managed table)
```

**Notes:**
- LGPD compliance: track data exports and deletions
- Security: track authentication events
- Retention: 5 years minimum

---

## 4. Helper Functions

### 4.1 update_updated_at_column()

Automatically updates `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 4.2 generate_slug()

Generates URL-safe slug from name with collision handling.

```sql
CREATE OR REPLACE FUNCTION generate_slug(input_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    base_slug := lower(regexp_replace(input_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');

    final_slug := base_slug;

    -- Check for collisions and append number if needed
    WHILE EXISTS (SELECT 1 FROM consultants WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
```

### 4.3 log_audit_event()

Helper to insert audit log entries.

```sql
CREATE OR REPLACE FUNCTION log_audit_event(
    p_consultant_id UUID,
    p_action VARCHAR(50),
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (consultant_id, action, resource_type, resource_id, details)
    VALUES (p_consultant_id, p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql;
```

---

## 5. Materialized Views for Analytics

### 5.1 consultant_metrics

Pre-computed metrics for dashboard performance.

```sql
CREATE MATERIALIZED VIEW consultant_metrics AS
SELECT
    c.id AS consultant_id,
    c.name,
    c.vertical,
    COUNT(DISTINCT l.id) AS total_leads,
    COUNT(DISTINCT CASE WHEN l.status = 'novo' THEN l.id END) AS leads_novo,
    COUNT(DISTINCT CASE WHEN l.status = 'em_contato' THEN l.id END) AS leads_em_contato,
    COUNT(DISTINCT CASE WHEN l.status = 'agendado' THEN l.id END) AS leads_agendado,
    COUNT(DISTINCT CASE WHEN l.status = 'fechado' THEN l.id END) AS leads_fechado,
    COUNT(DISTINCT conv.id) AS total_conversations,
    COUNT(DISTINCT CASE WHEN conv.is_completed = true THEN conv.id END) AS completed_conversations,
    AVG(EXTRACT(EPOCH FROM (conv.completed_at - conv.started_at))/60) AS avg_conversation_duration_minutes,
    SUM(ai.tokens_used) AS total_tokens_used,
    AVG(ai.latency_ms) AS avg_ai_latency_ms
FROM consultants c
LEFT JOIN leads l ON l.consultant_id = c.id
LEFT JOIN conversations conv ON conv.lead_id = l.id
LEFT JOIN ai_responses ai ON ai.lead_id = l.id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.vertical;

-- Refresh materialized view hourly (via pg_cron)
CREATE INDEX idx_consultant_metrics_consultant_id ON consultant_metrics(consultant_id);
```

### 5.2 daily_lead_stats

Daily aggregated statistics for trend analysis.

```sql
CREATE MATERIALIZED VIEW daily_lead_stats AS
SELECT
    consultant_id,
    DATE(created_at) AS date,
    COUNT(*) AS leads_created,
    COUNT(CASE WHEN status = 'fechado' THEN 1 END) AS leads_closed,
    ROUND(
        COUNT(CASE WHEN status = 'fechado' THEN 1 END)::NUMERIC /
        NULLIF(COUNT(*), 0) * 100,
        2
    ) AS conversion_rate
FROM leads
GROUP BY consultant_id, DATE(created_at);

CREATE INDEX idx_daily_lead_stats_consultant ON daily_lead_stats(consultant_id, date DESC);
```

---

## 6. Indexing Strategy

### 6.1 Query Patterns and Indexes

| Query Pattern | Index | Rationale |
|---------------|-------|-----------|
| Fetch consultant by email (login) | `idx_consultants_email` | Login frequency |
| Fetch consultant by slug (public profile) | `idx_consultants_slug` | Public page access |
| Fetch leads for consultant dashboard | `idx_leads_consultant_id` | Primary dashboard query |
| Filter leads by status | `idx_leads_status` | Common filter operation |
| Search leads by WhatsApp number | `idx_leads_whatsapp` | Lead lookup |
| Query JSONB responses | `idx_leads_respostas_gin` | Complex JSON queries |
| Fetch recent conversations | `idx_conversations_updated_at` | Real-time dashboard |
| Fetch messages for conversation | `idx_messages_conversation_id` | Chat history display |
| Idempotency check (WhatsApp message ID) | `idx_messages_whatsapp_id_unique` | Duplicate prevention |

### 6.2 Composite Indexes

```sql
-- For lead dashboard with filters
CREATE INDEX idx_leads_consultant_status_date
    ON leads(consultant_id, status, created_at DESC);

-- For conversation analytics
CREATE INDEX idx_conversations_lead_flow_completed
    ON conversations(lead_id, flow_id, is_completed);
```

---

## 7. Data Integrity Rules

### 7.1 Foreign Key Constraints
- All foreign keys use `ON DELETE CASCADE` for child data or `ON DELETE SET NULL` for audit trails
- `flows` uses `ON DELETE RESTRICT` to prevent deletion of flows in use

### 7.2 Check Constraints
- Enum-like fields (status, vertical, subscription_tier) use CHECK constraints
- JSONB fields validated for basic structure (object vs array)

### 7.3 Unique Constraints
- `consultants.email`, `consultants.slug`: Global uniqueness
- `leads(consultant_id, whatsapp_number)`: One lead per consultant per number
- `messages.whatsapp_message_id`: Idempotency guarantee

### 7.4 Business Rules (Application-Level)
- Lead status transitions follow specific path: `novo → em_contato → agendado → fechado`
- One active conversation per lead at a time
- Subscription tier limits (free: 20 leads/month, pro: 200, agency: 1000)

---

## 8. Data Migration Strategy

### 8.1 Migration Tool
- **Tool:** Supabase Migrations (SQL-based)
- **Versioning:** Sequential numbering (001_initial_schema.sql, 002_add_flows.sql)
- **Testing:** Migrations tested on staging before production

### 8.2 Initial Migration (001_initial_schema.sql)

```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tables (in dependency order)
-- [Full table definitions as shown above]

-- Insert default flows
INSERT INTO flows (name, vertical, description, definition, is_template)
VALUES (
    'Triagem Básica - Planos de Saúde',
    'health_plans',
    'Fluxo padrão para qualificação de leads de planos de saúde',
    '{ ... }', -- Full JSON definition
    true
);
```

### 8.3 Migration Process

```bash
# Development
supabase db reset  # Reset local DB
supabase migration new add_feature_x
# Edit migration file
supabase db push

# Staging
supabase link --project-ref staging-ref
supabase db push

# Production
supabase link --project-ref prod-ref
supabase db push  # Requires confirmation
```

---

## 9. Backup and Recovery

### 9.1 Backup Schedule
- **Automated:** Daily full backup (Supabase managed)
- **Retention:** 30 days
- **Manual:** Weekly export to S3 (long-term archival)

### 9.2 Point-in-Time Recovery
- **Window:** 7 days
- **Granularity:** 1 second
- **Usage:** Restore to specific timestamp before data corruption

### 9.3 Export Script

```sql
-- Export all data to JSON for archival
COPY (
    SELECT json_build_object(
        'consultants', (SELECT json_agg(t) FROM consultants t),
        'leads', (SELECT json_agg(t) FROM leads t),
        'conversations', (SELECT json_agg(t) FROM conversations t),
        'messages', (SELECT json_agg(t) FROM messages t)
    )
) TO '/tmp/backup_2025_12_12.json';
```

---

## 10. Performance Optimization

### 10.1 Query Optimization
- **Explain Analyze:** All critical queries analyzed for performance
- **Prepared Statements:** Used for frequent queries
- **Connection Pooling:** PgBouncer in transaction mode

### 10.2 Table Partitioning (Future)

For high-volume tables, consider partitioning:

```sql
-- Partition messages by month
CREATE TABLE messages (
    -- columns
) PARTITION BY RANGE (created_at);

CREATE TABLE messages_2025_12 PARTITION OF messages
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
```

### 10.3 Vacuum and Analyze

```sql
-- Scheduled maintenance
VACUUM ANALYZE leads;
VACUUM ANALYZE messages;
REINDEX TABLE messages;
```

---

## 11. Data Retention and Archival

### 11.1 Retention Policies
- **Active Data:** Unlimited retention while consultant active
- **Inactive Consultants:** 90 days after account closure
- **Webhook Events:** 30 days
- **Audit Logs:** 5 years (compliance requirement)

### 11.2 Archival Strategy

```sql
-- Archive old messages to cold storage
WITH archived AS (
    DELETE FROM messages
    WHERE created_at < NOW() - INTERVAL '2 years'
    RETURNING *
)
INSERT INTO messages_archive SELECT * FROM archived;
```

---

## 12. Security Considerations

### 12.1 Row-Level Security (RLS)
- All tables have RLS enabled
- Consultants can only access their own data
- Service role bypasses RLS for system operations

### 12.2 Sensitive Data Handling
- **Passwords:** Hashed with bcrypt (via Supabase Auth)
- **PII:** WhatsApp numbers not logged in plain text
- **Audit Logs:** IP addresses anonymized after 90 days

### 12.3 Encryption
- **At Rest:** AES-256 (Supabase managed)
- **In Transit:** TLS 1.3
- **Backups:** Encrypted with customer-managed keys

---

## 13. Monitoring and Alerts

### 13.1 Database Metrics to Monitor
- Connection count (alert if > 80% of pool)
- Query latency (p95, p99)
- Deadlocks and failed transactions
- Table bloat (vacuum efficiency)
- Replication lag (if using read replicas)

### 13.2 Alert Thresholds
- Query time > 1 second: Warning
- Query time > 5 seconds: Critical
- Disk usage > 80%: Warning
- Disk usage > 90%: Critical

---

## 14. Appendices

### 14.1 Sample Queries

**Fetch consultant dashboard data:**
```sql
SELECT
    c.name,
    c.bio,
    cm.total_leads,
    cm.leads_fechado,
    ROUND((cm.leads_fechado::NUMERIC / NULLIF(cm.total_leads, 0)) * 100, 2) AS conversion_rate
FROM consultants c
JOIN consultant_metrics cm ON cm.consultant_id = c.id
WHERE c.id = $1;
```

**Fetch leads with filters:**
```sql
SELECT
    l.id,
    l.name,
    l.whatsapp_number,
    l.status,
    l.respostas,
    l.created_at,
    COUNT(m.id) AS message_count
FROM leads l
LEFT JOIN conversations conv ON conv.lead_id = l.id
LEFT JOIN messages m ON m.conversation_id = conv.id
WHERE l.consultant_id = $1
    AND ($2::VARCHAR IS NULL OR l.status = $2)
    AND l.created_at >= COALESCE($3::TIMESTAMP, '1970-01-01')
GROUP BY l.id
ORDER BY l.created_at DESC
LIMIT 20 OFFSET $4;
```

### 14.2 Glossary
- **RLS:** Row-Level Security (PostgreSQL feature for multi-tenancy)
- **JSONB:** Binary JSON format in PostgreSQL (indexed, efficient)
- **GIN Index:** Generalized Inverted Index (for full-text search and JSONB)
- **Materialized View:** Pre-computed query results for performance

### 14.3 Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-12 | Initial | First draft of database design |
