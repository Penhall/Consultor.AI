# Data Model: SaaS Billing, Credits & Admin Panel

**Date**: 2026-02-08
**Feature**: 002-saas-billing-admin

## Entity Relationship Overview

```
consultants (existing, extended)
  ├── 1:N → files
  ├── 1:N → contact_form_messages
  └── billing fields (inline)

daily_stats
  └── 1:N → page_view_sources

logs (standalone)
```

## Modified Entities

### consultants (ALTER TABLE — add billing fields)

Extends the existing `consultants` table with billing and admin fields.

| Field                        | Type         | Constraints             | Description                                             |
| ---------------------------- | ------------ | ----------------------- | ------------------------------------------------------- |
| `stripe_customer_id`         | varchar(255) | UNIQUE, nullable        | Stripe customer ID                                      |
| `subscription_status`        | varchar(50)  | nullable                | 'active', 'cancel_at_period_end', 'past_due', 'deleted' |
| `subscription_plan`          | varchar(50)  | nullable                | 'freemium', 'pro', 'agencia'                            |
| `date_paid`                  | timestamptz  | nullable                | Last successful payment date                            |
| `credits`                    | integer      | NOT NULL, DEFAULT 20    | Current credit balance (subscription + purchased)       |
| `purchased_credits`          | integer      | NOT NULL, DEFAULT 0     | Credits from one-time purchases (never reset)           |
| `monthly_credits_allocation` | integer      | NOT NULL, DEFAULT 20    | Monthly credits from subscription plan                  |
| `credits_reset_at`           | timestamptz  | nullable                | Last credits reset timestamp                            |
| `is_admin`                   | boolean      | NOT NULL, DEFAULT false | Admin role flag                                         |

**State transitions for `subscription_status`**:

```
NULL → 'active'                    (first subscription via webhook)
'active' → 'cancel_at_period_end'  (user cancels, retains until period end)
'cancel_at_period_end' → 'deleted' (period ends)
'active' → 'past_due'             (payment fails)
'past_due' → 'active'             (payment retried successfully)
'past_due' → 'deleted'            (payment permanently fails)
'deleted' → 'active'              (re-subscribes)
```

**Plan-to-credits mapping**:
| Plan | Monthly Credits | Lead Limit |
|------|----------------|------------|
| freemium | 20 | 20 |
| pro | 200 | 200 |
| agencia | 1000 | 1000 |

## New Entities

### daily_stats

Aggregated platform metrics calculated hourly by pg_cron job.

| Field                           | Type          | Constraints             | Description                           |
| ------------------------------- | ------------- | ----------------------- | ------------------------------------- |
| `id`                            | serial        | PK                      | Auto-increment ID                     |
| `date`                          | date          | UNIQUE, NOT NULL        | Stats date (UTC, one per day)         |
| `total_views`                   | integer       | NOT NULL, DEFAULT 0     | Page views from analytics provider    |
| `prev_day_views_change_percent` | varchar(10)   | NOT NULL, DEFAULT '0'   | Day-over-day change                   |
| `user_count`                    | integer       | NOT NULL, DEFAULT 0     | Total registered users                |
| `paid_user_count`               | integer       | NOT NULL, DEFAULT 0     | Users with active subscriptions       |
| `user_delta`                    | integer       | NOT NULL, DEFAULT 0     | User count change from yesterday      |
| `paid_user_delta`               | integer       | NOT NULL, DEFAULT 0     | Paid user count change from yesterday |
| `total_revenue`                 | numeric(12,2) | NOT NULL, DEFAULT 0     | Total revenue in BRL                  |
| `total_profit`                  | numeric(12,2) | NOT NULL, DEFAULT 0     | Total profit in BRL                   |
| `created_at`                    | timestamptz   | NOT NULL, DEFAULT now() | Record creation time                  |

### page_view_sources

Traffic sources linked to daily stats.

| Field            | Type         | Constraints                   | Description                            |
| ---------------- | ------------ | ----------------------------- | -------------------------------------- |
| `name`           | varchar(255) | PK (composite with date)      | Source name (e.g., 'google', 'direct') |
| `date`           | date         | PK (composite with name)      | Source date                            |
| `daily_stats_id` | integer      | FK → daily_stats.id, nullable | Parent stats record                    |
| `visitors`       | integer      | NOT NULL                      | Visitor count from this source         |

### files

User-uploaded files stored in Supabase Storage.

| Field           | Type         | Constraints                   | Description                                  |
| --------------- | ------------ | ----------------------------- | -------------------------------------------- |
| `id`            | uuid         | PK, DEFAULT gen_random_uuid() | File ID                                      |
| `consultant_id` | uuid         | FK → consultants.id, NOT NULL | Owner                                        |
| `name`          | varchar(255) | NOT NULL                      | Original file name                           |
| `type`          | varchar(50)  | NOT NULL                      | MIME type (application/pdf, image/png, etc.) |
| `storage_key`   | varchar(500) | NOT NULL                      | Supabase Storage object path                 |
| `size_bytes`    | integer      | nullable                      | File size in bytes                           |
| `created_at`    | timestamptz  | NOT NULL, DEFAULT now()       | Upload timestamp                             |

**Allowed types**: application/pdf, image/png, image/jpeg, image/webp
**Max size**: 10MB (10,485,760 bytes)

### logs

System event logs for debugging and monitoring.

| Field        | Type        | Constraints             | Description                          |
| ------------ | ----------- | ----------------------- | ------------------------------------ |
| `id`         | serial      | PK                      | Auto-increment ID                    |
| `message`    | text        | NOT NULL                | Log message                          |
| `level`      | varchar(20) | NOT NULL                | 'info', 'warn', 'error', 'job-error' |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Log timestamp                        |

### contact_form_messages

Messages from users via the contact form.

| Field           | Type        | Constraints                   | Description       |
| --------------- | ----------- | ----------------------------- | ----------------- |
| `id`            | uuid        | PK, DEFAULT gen_random_uuid() | Message ID        |
| `consultant_id` | uuid        | FK → consultants.id, NOT NULL | Sender            |
| `content`       | text        | NOT NULL                      | Message content   |
| `is_read`       | boolean     | NOT NULL, DEFAULT false       | Read status       |
| `replied_at`    | timestamptz | nullable                      | Reply timestamp   |
| `created_at`    | timestamptz | NOT NULL, DEFAULT now()       | Created timestamp |

## RLS Policies

### files

- **SELECT**: `consultant_id = auth.uid()` — Users see only their own files
- **INSERT**: `consultant_id = auth.uid()` — Users create files for themselves only
- **DELETE**: `consultant_id = auth.uid()` — Users delete only their own files

### daily_stats

- **SELECT**: Only via service_role (admin API routes check `is_admin` flag)
- **INSERT/UPDATE**: Only via service_role (pg_cron job uses service role)

### page_view_sources

- **SELECT**: Only via service_role (same as daily_stats)

### logs

- **INSERT**: Only via service_role (system-generated)
- **SELECT**: Only via service_role (admin viewing)

### contact_form_messages

- **SELECT**: `consultant_id = auth.uid()` OR `is_admin = true` (admin sees all)
- **INSERT**: `consultant_id = auth.uid()` — Users create their own messages

### consultants (updated policies)

- Existing policies remain. Add: admins can SELECT all consultants (for admin users table).

## Indexes

- `daily_stats`: UNIQUE index on `date`
- `files`: index on `consultant_id`
- `logs`: index on `created_at` (for recent log queries)
- `consultants`: index on `subscription_status` (for admin filtering)
- `consultants`: index on `stripe_customer_id` (for webhook lookups)

## Database Functions (RPC)

### decrement_credits(user_id uuid, amount integer)

Atomically decrements credits with floor check. Returns remaining credits or throws error if insufficient.

```sql
CREATE FUNCTION decrement_credits(user_id uuid, amount integer)
RETURNS integer AS $$
DECLARE
  remaining integer;
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
```

### reset_monthly_credits()

Called by pg_cron on the 1st of each month. Resets subscription credits without affecting purchased credits.

```sql
CREATE FUNCTION reset_monthly_credits()
RETURNS void AS $$
BEGIN
  UPDATE consultants
  SET credits = monthly_credits_allocation + purchased_credits,
      credits_reset_at = now()
  WHERE subscription_status IN ('active', 'cancel_at_period_end')
    OR subscription_plan = 'freemium'
    OR subscription_plan IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
