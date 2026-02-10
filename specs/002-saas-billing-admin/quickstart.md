# Quickstart: SaaS Billing, Credits & Admin Panel

**Feature**: 002-saas-billing-admin
**Date**: 2026-02-08

## Prerequisites

- Node.js 20 LTS
- Docker & Docker Compose (for local Supabase)
- Stripe CLI (for webhook testing)
- Existing Consultor.AI local dev environment working

## Environment Variables

Add the following to `.env.local`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCIA_PRICE_ID=price_...
STRIPE_CREDITS50_PRICE_ID=price_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@consultor.ai

# Admin
ADMIN_EMAILS=admin@consultor.ai,your-email@example.com

# Analytics (Plausible - optional for dev)
PLAUSIBLE_API_KEY=...
PLAUSIBLE_SITE_ID=consultor.ai
```

## Setup Steps

### 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js resend react-email @react-email/components
npm install -D stripe-event-types
```

### 2. Apply Database Migrations

```bash
# Start local Supabase
npx supabase start

# Apply new migrations
npx supabase db push
```

Migrations add billing fields to `consultants` table and create new tables: `daily_stats`, `page_view_sources`, `files`, `logs`, `contact_form_messages`.

### 3. Stripe Setup

#### Create Products & Prices

In Stripe Dashboard (Test Mode):

1. **Pro Plan**: Product "Pro", Price R$47.00/month (BRL, recurring)
2. **Agência Plan**: Product "Agência", Price R$147.00/month (BRL, recurring)
3. **Credit Pack**: Product "50 Créditos", Price R$19.90 (BRL, one-time)

Copy the Price IDs into `.env.local`.

#### Configure Webhook

```bash
# Listen for webhook events locally
stripe listen --forward-to localhost:3000/api/billing/webhook

# Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET
```

Events to subscribe: `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Supabase Storage Bucket

Create a storage bucket for file uploads:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('consultant_files', 'consultant_files', false);
```

### 5. Start Development

```bash
npm run dev
```

## Verification Checklist

- [ ] Visit `/pricing` — Three plan cards render with BRL prices
- [ ] Click "Assinar" on Pro — Redirects to Stripe Checkout (test mode)
- [ ] Complete test payment with card `4242 4242 4242 4242` — Dashboard shows Pro status
- [ ] Stripe webhook fires `invoice.paid` — Console shows webhook processed
- [ ] Visit `/admin` as admin — Dashboard renders with stats cards
- [ ] Visit `/admin/users` — Users table loads with pagination
- [ ] Upload a PDF on `/dashboard/arquivos` — File appears in list
- [ ] Check credit balance via `/api/billing/credits` — Returns credit info

## Key Test Commands

```bash
# Run unit tests for billing
npm test -- --grep "billing"

# Run integration tests
npm run test:integration

# Trigger Stripe test events
stripe trigger invoice.paid
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

## Architecture Quick Reference

```
Billing Flow:
  User → Pricing Page → Checkout Button → Stripe Checkout → Webhook → DB Update

Credit Flow:
  AI Request → Credit Check → Decrement (atomic RPC) → AI Response

Admin Flow:
  Admin Login → /admin → Stats API → daily_stats table → Dashboard

File Flow:
  Upload → Presigned URL → Supabase Storage → DB Record → Signed Download URL
```

## Troubleshooting

| Issue                     | Fix                                                                 |
| ------------------------- | ------------------------------------------------------------------- |
| Webhook signature fails   | Ensure `STRIPE_WEBHOOK_SECRET` matches `stripe listen` output       |
| Credits not resetting     | Check pg_cron job is running: `SELECT * FROM cron.job;`             |
| Admin access denied       | Verify email is in `ADMIN_EMAILS` env var and `is_admin=true` in DB |
| File upload fails         | Check Supabase Storage bucket exists and RLS policies are applied   |
| Stripe Checkout 400 error | Verify Price IDs in env match Stripe Dashboard                      |
