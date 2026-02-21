# CLI Contract: seed-diagnostic

**Type**: CLI script (no REST API)
**Invocation**: `npx tsx scripts/seed-diagnostic.ts`
**Alias**: `npm run seed:diagnostic`

## Environment Variables (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase instance URL (must be local) | `http://localhost:54321` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | `eyJhbGciOiJIUzI1NiIs...` |

## Input

No command-line arguments. All configuration via environment variables.

## Output

### Success (exit code 0)

```
🔒 Safety check: SUPABASE_URL = http://localhost:54321 ✓
📦 Creating 6 auth users... ✓
👤 Creating 6 consultants... ✓
📋 Creating 75 leads... ✓
💬 Creating 150 conversations... ✓
📝 Creating 450+ messages... ✓
📅 Creating 30+ follow-ups... ✓
📄 Creating 15+ message templates... ✓

✅ Seed completed in X.Xs
   6 auth users | 6 consultants | 75 leads | 150 conversations | 450+ messages | 30+ follow-ups | 15+ templates
```

### Safety Guard Failure (exit code 1)

```
❌ SAFETY: Refusing to run seed on non-local database.
   SUPABASE_URL = https://abc123.supabase.co
   This script should only run against a local Supabase instance.
```

### Missing Environment (exit code 1)

```
❌ ERROR: SUPABASE_URL is not set.
   Please configure .env.local with your local Supabase URL.
```

```
❌ ERROR: SUPABASE_SERVICE_ROLE_KEY is not set.
   Run 'supabase status' and copy the service_role key to .env.local.
```

### Missing Prerequisites (exit code 1)

```
❌ ERROR: Default health flow not found.
   Expected: is_default = true AND vertical = 'saude'
   Fix: Run 'supabase db reset' to apply seeds including 01_default_flows.sql.
```

```
❌ ERROR: Database table 'consultants' does not exist.
   Migrations may not be applied. Run 'supabase db reset'.
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success — all seed data created or already exists |
| 1 | Failure — safety guard, missing env, missing prerequisites, or database error |

## Idempotency Guarantee

| Run # | Behavior |
|-------|----------|
| 1st | Creates all records |
| 2nd+ | Skips existing records, no errors, same final state |

## Data Created

| Entity | Count | Table |
|--------|-------|-------|
| Auth users | 6 | `auth.users` |
| Consultants | 6 | `consultants` |
| Leads | 75 | `leads` |
| Conversations | 150 | `conversations` |
| Messages | 450+ | `messages` |
| Follow-ups | 30+ | `follow_ups` |
| Message templates | 15+ | `message_templates` |
| **Total** | **~720+** | |
