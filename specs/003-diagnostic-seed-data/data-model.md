# Data Model: Script de Seed para Diagnóstico

**Branch**: `003-diagnostic-seed-data` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)

## Entity Overview

The seed script populates 7 entities in a strict dependency order. All entities already exist in the database schema — no migrations needed.

```
auth.users (6)
  └── consultants (6) [1:1 with auth.users]
        └── leads (75) [15 per consultant]
        │     └── conversations (150) [2 per lead]
        │     │     └── messages (450+) [3+ per conversation]
        │     └── follow_ups (30+) [subset of leads]
        └── message_templates (15+) [3+ per consultant]
```

## Entity Definitions

### 1. Auth User (`auth.users`)

**Records**: 6 (1 admin + 5 consultants)
**Created via**: Supabase Admin SDK (`supabase.auth.admin.createUser`)
**ID Strategy**: UUID v5 deterministic from email seed

| Field | Value Pattern | Example |
|-------|--------------|---------|
| `email` | `consultor{N}@seed.local` (N=0..5) | `consultor0@seed.local` |
| `password` | `seed123456` (all users) | `seed123456` |
| `email_confirm` | `true` (skip verification) | `true` |

### 2. Consultant (`consultants`)

**Records**: 6
**FK**: `user_id` → `auth.users.id`
**ID Strategy**: UUID v5 deterministic from email seed
**Plan Distribution**: 1 admin (freemium) + 2 freemium + 2 pro + 1 agência

| Field | Type | Seed Strategy |
|-------|------|---------------|
| `id` | UUID | v5 deterministic |
| `user_id` | UUID | Same as auth.users.id |
| `email` | TEXT | `consultor{N}@seed.local` |
| `name` | TEXT | Random from Brazilian names array |
| `whatsapp_number` | TEXT | `+55{DDD}9{8 digits}` |
| `vertical` | vertical_type | `'saude'` (all) |
| `slug` | TEXT | Derived from name (lowercase, hyphenated) |
| `subscription_plan` | VARCHAR(50) | Per distribution table below |
| `subscription_status` | TEXT | `'active'` |
| `credits` | INTEGER | Per plan allocation |
| `purchased_credits` | INTEGER | `0` |
| `monthly_credits_allocation` | INTEGER | Per plan allocation |
| `is_admin` | BOOLEAN | `true` for consultor0 only |
| `settings` | JSONB | `{"notifications": {"email": true, "whatsapp": true}, "preferences": {"language": "pt-BR", "timezone": "America/Sao_Paulo"}}` |

**Plan Distribution Table**:

| Consultant | Plan | Credits | Monthly Allocation | is_admin |
|------------|------|---------|--------------------|----------|
| consultor0 | freemium | 20 | 20 | true |
| consultor1 | freemium | 15 | 20 | false |
| consultor2 | pro | 180 | 200 | false |
| consultor3 | pro | 150 | 200 | false |
| consultor4 | agencia | 950 | 1000 | false |

**Constraints to Respect**:
- `valid_email`: email regex
- `valid_slug`: `^[a-z0-9-]+$`
- `valid_subscription_plan`: IN ('freemium', 'pro', 'agencia')
- UNIQUE on `email`, `slug`, `stripe_customer_id`

### 3. Lead (`leads`)

**Records**: 75 (15 per consultant)
**FK**: `consultant_id` → `consultants.id`
**ID Strategy**: Lookup after insert (UNIQUE on consultant_id + whatsapp_number)

| Field | Type | Seed Strategy |
|-------|------|---------------|
| `consultant_id` | UUID | Parent consultant |
| `whatsapp_number` | TEXT | `+55{DDD}9{8 random digits}` — unique per consultant |
| `name` | TEXT | Random from Brazilian names array |
| `email` | TEXT | Derived from name `{nome}.{sobrenome}@email.com` |
| `status` | lead_status | Distributed across all 6 values (see below) |
| `score` | INTEGER | Correlated with status (see below) |
| `metadata` | JSONB | Health qualification data (see below) |
| `source` | TEXT | `'whatsapp'` or `'manual'` |
| `created_at` | TIMESTAMPTZ | Staggered over past 30 days |
| `last_contacted_at` | TIMESTAMPTZ | After `created_at` for non-novo leads |

**Status Distribution per Consultant (15 leads)**:

| Status | Count | Score Range |
|--------|-------|-------------|
| `novo` | 3 | 0–20 |
| `em_contato` | 3 | 20–45 |
| `qualificado` | 3 | 60–85 |
| `agendado` | 2 | 50–75 |
| `fechado` | 2 | 80–100 |
| `perdido` | 2 | 0–30 |

**Metadata JSONB Structure**:

```json
{
  "perfil": "individual|casal|familia|empresarial",
  "faixa_etaria": "ate_30|31_45|46_60|acima_60",
  "coparticipacao": "sim|nao"
}
```

**Constraints to Respect**:
- `valid_whatsapp_number`: `^\+55[0-9]{11}$`
- `score >= 0 AND score <= 100`
- UNIQUE(`consultant_id`, `whatsapp_number`)

### 4. Conversation (`conversations`)

**Records**: 150 (2 per lead)
**FK**: `lead_id` → `leads.id`, `flow_id` → `flows.id`

| Field | Type | Seed Strategy |
|-------|------|---------------|
| `lead_id` | UUID | Parent lead |
| `flow_id` | UUID | Dynamic lookup: `WHERE is_default = true AND vertical = 'saude'` |
| `status` | conversation_status | Conv 1: `completed`; Conv 2: varies |
| `current_step_id` | TEXT | `'finalizar'` if completed, random step otherwise |
| `state` | JSONB | Responses matching lead metadata |
| `message_count` | INTEGER | Set after messages inserted (3–5) |
| `completion_percentage` | INTEGER | 100 if completed, 30–80 otherwise |
| `started_at` | TIMESTAMPTZ | Within 1h of lead `created_at` |
| `completed_at` | TIMESTAMPTZ | Set if `status = 'completed'` |

**State JSONB Structure** (completed conversation):

```json
{
  "responses": {
    "perfil": "familia",
    "idade": "31_45",
    "coparticipacao": "sim"
  },
  "context": {
    "consultant_name": "Nome do Consultor"
  }
}
```

**Constraints to Respect**:
- `valid_state`: `jsonb_typeof(state) = 'object'`
- `completion_percentage >= 0 AND completion_percentage <= 100`

### 5. Message (`messages`)

**Records**: 450+ (3+ per conversation)
**FK**: `conversation_id` → `conversations.id`

| Field | Type | Seed Strategy |
|-------|------|---------------|
| `conversation_id` | UUID | Parent conversation |
| `direction` | message_direction | Alternating `inbound`/`outbound` |
| `content` | TEXT | Portuguese health plan qualification dialogue |
| `content_type` | TEXT | `'text'` |
| `status` | message_status | `'delivered'` for outbound, `'read'` for inbound |
| `is_ai_generated` | BOOLEAN | `true` for outbound AI responses |
| `created_at` | TIMESTAMPTZ | Sequential within conversation timeframe |

**Message Content Templates** (Portuguese):

- **Outbound (bot)**: Flow questions (`"Olá! Bem-vindo..."`, `"Qual o perfil do plano?"`, `"Qual a faixa etária?"`, `"Prefere coparticipação?"`)
- **Inbound (lead)**: Responses (`"Família"`, `"31 a 45 anos"`, `"Sim, com coparticipação"`)

### 6. Follow-up (`follow_ups`)

**Records**: 30+ (subset of leads — ~40%)
**FK**: `lead_id` → `leads.id`, `consultant_id` → `consultants.id`

| Field | Type | Seed Strategy |
|-------|------|---------------|
| `lead_id` | UUID | Random subset of leads |
| `consultant_id` | UUID | Same as lead's consultant |
| `title` | TEXT | `"Retorno - {lead_name}"` |
| `message` | TEXT | Portuguese follow-up message |
| `scheduled_at` | TIMESTAMPTZ | Mix of past and future dates |
| `status` | follow_up_status | Distributed: pending/sent/completed/cancelled |
| `is_automatic` | BOOLEAN | `false` (manual follow-ups) |

**Status Distribution (30 follow-ups)**:

| Status | Count | scheduled_at |
|--------|-------|-------------|
| `pending` | 10 | Future (1–14 days) |
| `sent` | 8 | Past (1–7 days) |
| `completed` | 8 | Past (7–30 days) |
| `cancelled` | 4 | Past (1–14 days) |

**Constraints to Respect**:
- `valid_scheduled_at`: `scheduled_at > created_at OR is_automatic = true`

### 7. Message Template (`message_templates`)

**Records**: 15+ (3+ per consultant)
**FK**: `consultant_id` → `consultants.id`

| Field | Type | Seed Strategy |
|-------|------|---------------|
| `consultant_id` | UUID | Parent consultant |
| `name` | TEXT | Template name (3–100 chars) |
| `category` | template_category | Distributed: greeting/follow_up/qualification |
| `content` | TEXT | Portuguese template content (10–1000 chars) |
| `variables` | TEXT[] | `{'{{nome_lead}}', '{{nome_consultor}}'}` |
| `is_active` | BOOLEAN | `true` |

**Templates per Consultant** (3 minimum):

| Category | Name Example | Content Example |
|----------|-------------|-----------------|
| `greeting` | `"Boas-vindas"` | `"Olá {{nome_lead}}, sou {{nome_consultor}}! Tudo bem? Estou aqui para te ajudar a encontrar o plano de saúde ideal."` |
| `follow_up` | `"Retorno semanal"` | `"Oi {{nome_lead}}, passando para saber se você teve alguma dúvida sobre as opções de plano que conversamos."` |
| `qualification` | `"Qualificação inicial"` | `"{{nome_lead}}, para encontrar o melhor plano, preciso de algumas informações. Podemos começar?"` |

**Constraints to Respect**:
- `template_name_length`: 3–100 chars
- `template_content_length`: 10–1000 chars

## State Transitions

### Lead Status Flow

```
novo → em_contato → qualificado → agendado → fechado
                                            ↘ perdido
                  ↘ perdido
```

### Conversation Status Flow

```
active → completed
       → abandoned
       → paused → active (resume)
```

### Follow-up Status Flow

```
pending → sent → completed
        → cancelled
```

## Idempotency Strategy

| Entity | Strategy |
|--------|----------|
| `auth.users` | SDK `createUser` with try/catch on existing email |
| `consultants` | UUID v5 deterministic + `ON CONFLICT (email) DO NOTHING` |
| `leads` | `ON CONFLICT (consultant_id, whatsapp_number) DO NOTHING` |
| `conversations` | Insert only if lead has < 2 conversations (SELECT count check) |
| `messages` | Insert only if conversation has < expected message count |
| `follow_ups` | `ON CONFLICT DO NOTHING` (no natural unique key — use deterministic UUIDs) |
| `message_templates` | `ON CONFLICT DO NOTHING` (use deterministic UUIDs) |
