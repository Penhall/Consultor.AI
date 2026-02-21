# Quickstart: Script de Seed para Diagnóstico

**Branch**: `003-diagnostic-seed-data` | **Date**: 2026-02-20

## Prerequisites

1. **Supabase local** running (`supabase start` or `docker-compose up`)
2. **Migrations applied** (`supabase db reset` or manual migration)
3. **Default health flow** exists (created by `supabase/seed/01_default_flows.sql`)
4. **Environment variables** configured in `.env.local`:
   - `SUPABASE_URL` — must point to localhost (e.g., `http://localhost:54321`)
   - `SUPABASE_SERVICE_ROLE_KEY` — service role key from `supabase status`

## Running the Seed

```bash
# From project root
npx tsx scripts/seed-diagnostic.ts
```

## Expected Output

```
🔒 Safety check: SUPABASE_URL = http://localhost:54321 ✓
📦 Creating 6 auth users...
  ✓ consultor0@seed.local (admin)
  ✓ consultor1@seed.local
  ✓ consultor2@seed.local
  ✓ consultor3@seed.local
  ✓ consultor4@seed.local
  ✓ consultor5@seed.local
👤 Creating 6 consultants...
  ✓ 2 freemium, 2 pro, 1 agência
📋 Creating 75 leads (15 per consultant)...
  ✓ All 6 statuses represented per consultant
💬 Creating 150 conversations (2 per lead)...
  ✓ Flow: Qualificação Saúde (default)
📝 Creating 450+ messages (3+ per conversation)...
  ✓ Mix of inbound/outbound
📅 Creating 30+ follow-ups...
  ✓ Distributed across statuses
📄 Creating 15+ message templates (3 per consultant)...
  ✓ Categories: greeting, follow_up, qualification

✅ Seed completed in X.Xs
   6 auth users | 6 consultants | 75 leads | 150 conversations | 450+ messages | 30+ follow-ups | 15+ templates
```

## Verifying the Seed

### Login Credentials

| Email | Password | Role | Plan |
|-------|----------|------|------|
| `consultor0@seed.local` | `seed123456` | Admin | freemium |
| `consultor1@seed.local` | `seed123456` | Consultant | freemium |
| `consultor2@seed.local` | `seed123456` | Consultant | pro |
| `consultor3@seed.local` | `seed123456` | Consultant | pro |
| `consultor4@seed.local` | `seed123456` | Consultant | agência |
| `consultor5@seed.local` | `seed123456` | Consultant | freemium |

### Quick Verification Queries

```sql
-- Count all seeded entities
SELECT 'consultants' AS entity, COUNT(*) FROM consultants WHERE email LIKE '%@seed.local'
UNION ALL
SELECT 'leads', COUNT(*) FROM leads WHERE consultant_id IN (SELECT id FROM consultants WHERE email LIKE '%@seed.local')
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations WHERE lead_id IN (SELECT id FROM leads WHERE consultant_id IN (SELECT id FROM consultants WHERE email LIKE '%@seed.local'))
UNION ALL
SELECT 'messages', COUNT(*) FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE lead_id IN (SELECT id FROM leads WHERE consultant_id IN (SELECT id FROM consultants WHERE email LIKE '%@seed.local')));

-- Verify plan distribution
SELECT subscription_plan, COUNT(*) FROM consultants WHERE email LIKE '%@seed.local' GROUP BY subscription_plan;

-- Verify lead status distribution
SELECT c.name, l.status, COUNT(*) FROM leads l JOIN consultants c ON c.id = l.consultant_id WHERE c.email LIKE '%@seed.local' GROUP BY c.name, l.status ORDER BY c.name, l.status;
```

## Idempotency

The script is fully idempotent. Running it multiple times produces the same result:

```bash
# First run - creates all data
npx tsx scripts/seed-diagnostic.ts

# Second run - skips existing, no errors
npx tsx scripts/seed-diagnostic.ts

# Third run - same result
npx tsx scripts/seed-diagnostic.ts
```

## Safety Guard

The script **refuses to run** if `SUPABASE_URL`:
- Contains `.supabase.co` (production Supabase)
- Does NOT contain `localhost`, `127.0.0.1`, or `host.docker.internal`

```
❌ SAFETY: Refusing to run seed on non-local database.
   SUPABASE_URL = https://abc123.supabase.co
   This script should only run against a local Supabase instance.
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `SUPABASE_URL not set` | Copy `.env.example` to `.env.local` and fill values |
| `SUPABASE_SERVICE_ROLE_KEY not set` | Run `supabase status` and copy the service role key |
| `Default health flow not found` | Run `supabase db reset` to apply seeds including `01_default_flows.sql` |
| `Auth user already exists` | Normal — script skips existing users (idempotent) |
| `Relation does not exist` | Migrations not applied — run `supabase db reset` |
| `Permission denied` | Ensure you're using the **service role key**, not the anon key |

## npm Script (Optional)

After implementation, add to `package.json`:

```json
{
  "scripts": {
    "seed:diagnostic": "tsx scripts/seed-diagnostic.ts"
  }
}
```

Then run with: `npm run seed:diagnostic`
