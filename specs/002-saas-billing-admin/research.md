# Research: SaaS Billing, Credits & Admin Panel

**Date**: 2026-02-08
**Feature**: 002-saas-billing-admin

## R1: Stripe Integration with Next.js App Router

**Decision**: Use Stripe Node.js SDK v18+ with Next.js API Routes for server-side operations. Stripe Checkout (hosted) for payment flow. Stripe Customer Portal for subscription management.

**Rationale**: Hosted Checkout handles PCI compliance, reduces development effort, and supports Apple Pay/Google Pay automatically. Customer Portal provides self-service subscription management without custom UI.

**Alternatives considered**:

- Stripe Elements (embedded) — More customization but requires PCI-DSS SAQ A-EP compliance and significantly more development
- Custom payment form — Maximum control but highest PCI compliance burden, rejected

## R2: Webhook Handling in Next.js

**Decision**: Use raw body parsing (disable Next.js body parser) for Stripe webhook verification. Validate signatures using `stripe.webhooks.constructEvent()`. Return 200 immediately after processing.

**Rationale**: Stripe requires raw request body for HMAC signature verification. Next.js API routes auto-parse JSON which breaks signature validation. The Open SaaS pattern of deleting the JSON middleware and using raw parsing is the proven approach.

**Alternatives considered**:

- Edge Functions for webhooks — Lower latency but limited Node.js API support for Stripe SDK
- Supabase Edge Functions — Would decouple from Next.js but adds operational complexity

## R3: Credit System Architecture

**Decision**: Store credits as integer fields on the consultants table (`credits`, `monthly_credits_allocation`). Use Supabase RPC functions for atomic credit operations (decrement with floor check). Separate subscription credits (resettable) from purchased credits (permanent).

**Rationale**: Atomic RPC prevents race conditions where multiple AI requests could overdraw credits. Two-field approach (subscription vs purchased) allows proper reset logic without affecting one-time purchases.

**Alternatives considered**:

- Credit ledger table (append-only transactions) — More auditability but higher query complexity for balance checks
- Redis for credit tracking — Fast but adds infrastructure, risk of data loss

## R4: Scheduled Jobs (pg_cron vs alternatives)

**Decision**: Use Supabase pg_cron extension to schedule an hourly SQL function that calculates daily stats. The function calls out to a Supabase Edge Function for Stripe API data, or stores a simplified version that queries local data only.

**Rationale**: pg_cron runs inside PostgreSQL, requires no external infrastructure, and is available on Supabase paid plans. For the MVP, the stats job can calculate user counts and revenue from local webhook data (already stored via subscription updates) without calling Stripe API.

**Alternatives considered**:

- Vercel Cron Jobs — Good option but requires Vercel Pro plan ($20/mo)
- node-cron in custom server — Breaks Next.js serverless model on Vercel
- GitHub Actions scheduled workflow — Works but adds latency and complexity

## R5: File Storage Strategy

**Decision**: Use Supabase Storage with presigned URLs for upload and download. Create a `consultant_files` bucket with RLS policies tied to consultant_id.

**Rationale**: Supabase Storage is already part of the stack, supports presigned URLs, RLS policies, and CDN delivery. No additional AWS configuration needed.

**Alternatives considered**:

- AWS S3 directly — More control but adds AWS credentials management, separate from existing Supabase stack
- Cloudflare R2 — Good pricing but adds another service to manage

## R6: Email Provider Selection

**Decision**: Use Resend as primary email provider with React Email for templates. Fallback to console logging in development.

**Rationale**: Resend has first-class React Email support, simple API, generous free tier (100 emails/day), and excellent Next.js integration. React Email allows type-safe, component-based email templates.

**Alternatives considered**:

- SendGrid — More established but more complex API, heavier SDK
- Supabase built-in emails — Limited to auth emails only, no custom transactional emails
- Nodemailer + SMTP — Generic but requires SMTP server configuration

## R7: Analytics Provider for Page Views

**Decision**: Use Plausible Analytics (self-hosted or cloud) for page view tracking. Plausible API provides page views and sources without cookies.

**Rationale**: Plausible is privacy-first (no cookies for basic tracking), LGPD-friendly, and has a simple API for fetching stats. The daily stats job can pull data from Plausible's API.

**Alternatives considered**:

- Google Analytics 4 — Feature-rich but requires cookie consent, complex API
- Umami — Good open-source option but requires self-hosting
- PostHog — Powerful but overkill for page view counting

## R8: Admin Role Management

**Decision**: Add `is_admin` boolean column to the consultants table. Admin emails configured via `ADMIN_EMAILS` environment variable, auto-assigned at signup via Supabase trigger or application logic. Admin routes protected by middleware + RLS.

**Rationale**: Simple boolean flag is sufficient for the current single-role admin model. Environment variable approach matches Open SaaS pattern and avoids database-driven role configuration for MVP.

**Alternatives considered**:

- Supabase custom claims (JWT) — More secure but requires custom auth hooks, harder to toggle
- Role table with RBAC — Over-engineered for binary admin/non-admin distinction
- Supabase auth.users metadata — Works but mixing auth metadata with application data is fragile

## R9: BRL Currency in Stripe

**Decision**: Configure Stripe products and prices in BRL (Brazilian Real). Use `currency: 'brl'` in price creation. Stripe handles BRL natively including Boleto and Pix payment methods.

**Rationale**: Stripe fully supports BRL since 2020. Brazilian customers expect prices in BRL. Stripe automatically handles currency formatting and tax calculations for Brazil.

**Alternatives considered**:

- USD pricing with conversion — Confusing for Brazilian users, exchange rate fluctuation risk
- Pagar.me / PagSeguro — Brazilian-specific processors but smaller ecosystem, no Strategy Pattern reuse
