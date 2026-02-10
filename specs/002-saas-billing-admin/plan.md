# Implementation Plan: SaaS Billing, Credits & Admin Panel

**Branch**: `002-saas-billing-admin` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-saas-billing-admin/spec.md`

## Summary

Integrate SaaS monetization and platform management capabilities into Consultor.AI, adapting patterns from the Open SaaS starter kit. This includes Stripe-based subscription billing with three plans (Freemium/Pro/Agência), a credit system for AI usage metering, an admin panel with SaaS metrics and user management, automated daily stats via pg_cron, file uploads via Supabase Storage, transactional emails via Resend, an enhanced landing page, and LGPD cookie consent.

## Technical Context

**Language/Version**: TypeScript 5.3 (strict mode)
**Primary Dependencies**: Next.js 14 (App Router), React 18, Supabase JS v2, Stripe SDK, Resend, Tailwind CSS, shadcn/ui, Zod, React Query
**Storage**: PostgreSQL (Supabase) with RLS, Supabase Storage for files
**Testing**: Vitest + React Testing Library + Playwright
**Target Platform**: Web (Vercel deployment), API (Next.js API Routes)
**Project Type**: Web application (fullstack Next.js)
**Performance Goals**: P95 API < 500ms, AI response < 3s, Stripe webhook processing < 30s
**Constraints**: BRL currency, LGPD compliance, Supabase RLS on all tables, no PII in logs
**Scale/Scope**: 1,000 consultants, 50,000 leads, 3 subscription plans

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                              | Status | Notes                                                                                                                                   |
| -------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| I. Code Quality First                  | PASS   | TypeScript strict, Zod validation on all billing inputs, custom error classes for payment failures                                      |
| II. Test-Driven Development            | PASS   | Stripe mocked in tests, webhook handler unit tests, billing service integration tests                                                   |
| III. User Experience Consistency       | PASS   | UI in Portuguese, shadcn/ui components, loading states for checkout, mobile-first pricing page                                          |
| IV. Performance and Scalability        | PASS   | Atomic credit operations, pg_cron for stats, React Query caching for admin dashboard                                                    |
| V. Security and Compliance             | PASS   | Stripe webhook signature validation (HMAC), RLS on billing tables, LGPD cookie consent, no PII in logs                                  |
| VI. Architecture and Modularity        | PASS   | Service layer pattern for billing/credits/stats, Strategy Pattern for payment processors, API route structure follows existing patterns |
| VII. Documentation and Maintainability | PASS   | JSDoc on all services, Portuguese UI strings, CHANGELOG updated                                                                         |
| VIII. Development Workflow             | PASS   | Feature branch, conventional commits, CI/CD checks                                                                                      |

**Gate Result**: PASS — No violations. All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/002-saas-billing-admin/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── billing-api.md
│   ├── admin-api.md
│   └── files-api.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── billing/
│   │   │   ├── checkout/route.ts        # POST - Create Stripe checkout session
│   │   │   ├── portal/route.ts          # GET  - Get customer portal URL
│   │   │   ├── webhook/route.ts         # POST - Stripe webhook handler
│   │   │   └── credits/route.ts         # GET  - Get credit balance
│   │   ├── admin/
│   │   │   ├── stats/route.ts           # GET  - Daily stats
│   │   │   └── users/route.ts           # GET/PATCH - Users management
│   │   └── files/
│   │       ├── route.ts                 # GET/POST - List files, create upload URL
│   │       └── [id]/route.ts            # GET/DELETE - Download URL, delete file
│   ├── pricing/
│   │   └── page.tsx                     # Pricing page (public)
│   ├── checkout/
│   │   └── page.tsx                     # Checkout result page
│   ├── admin/
│   │   ├── layout.tsx                   # Admin layout with sidebar
│   │   ├── page.tsx                     # Admin analytics dashboard
│   │   └── users/
│   │       └── page.tsx                 # Admin users management
│   └── dashboard/
│       └── arquivos/
│           └── page.tsx                 # File upload page
│
├── components/
│   ├── billing/
│   │   ├── pricing-card.tsx             # Plan card component
│   │   ├── checkout-button.tsx          # Checkout CTA button
│   │   ├── subscription-status.tsx      # Current plan display
│   │   └── credit-balance.tsx           # Credits indicator
│   ├── admin/
│   │   ├── stats-card.tsx               # Metric card
│   │   ├── revenue-chart.tsx            # Revenue chart (SVG/recharts)
│   │   ├── users-table.tsx              # Paginated users table
│   │   ├── admin-sidebar.tsx            # Admin navigation
│   │   └── admin-guard.tsx              # Admin role check wrapper
│   ├── files/
│   │   ├── file-upload-zone.tsx         # Drag & drop upload
│   │   └── file-list.tsx                # File list with actions
│   ├── landing/
│   │   ├── hero.tsx                     # Hero section
│   │   ├── features-grid.tsx            # Features grid
│   │   ├── testimonials.tsx             # Testimonials carousel
│   │   ├── faq.tsx                      # FAQ accordion
│   │   └── footer.tsx                   # Footer
│   └── cookie-consent/
│       └── banner.tsx                   # LGPD cookie banner
│
├── hooks/
│   ├── useBilling.ts                    # Billing operations hook
│   ├── useCredits.ts                    # Credits balance hook
│   ├── useAdmin.ts                      # Admin data hooks
│   └── useFiles.ts                      # File operations hook
│
├── lib/
│   ├── services/
│   │   ├── billing-service.ts           # Billing business logic
│   │   ├── credit-service.ts            # Credit management logic
│   │   ├── stats-service.ts             # Daily stats calculation
│   │   ├── file-service.ts              # File upload/download logic
│   │   └── email-service.ts             # Transactional email sending
│   ├── payment/
│   │   ├── payment-processor.ts         # PaymentProcessor interface
│   │   ├── plans.ts                     # Plan definitions & enums
│   │   └── stripe/
│   │       ├── stripe-client.ts         # Stripe SDK initialization
│   │       ├── stripe-processor.ts      # Stripe PaymentProcessor impl
│   │       ├── checkout-utils.ts        # Checkout session helpers
│   │       └── webhook-handler.ts       # Webhook event handlers
│   ├── email/
│   │   ├── email-provider.ts            # Email provider interface
│   │   ├── resend-provider.ts           # Resend implementation
│   │   └── templates/                   # React Email templates
│   │       ├── welcome.tsx
│   │       ├── password-reset.tsx
│   │       └── subscription-canceled.tsx
│   └── validations/
│       ├── billing.ts                   # Billing Zod schemas
│       ├── admin.ts                     # Admin Zod schemas
│       └── file.ts                      # File upload Zod schemas
│
└── types/
    ├── billing.ts                       # Billing type definitions
    └── admin.ts                         # Admin type definitions

supabase/
├── migrations/
│   ├── 20260208000001_add_billing_fields.sql      # Add billing columns to consultants
│   ├── 20260208000002_add_daily_stats.sql          # DailyStats + PageViewSource tables
│   ├── 20260208000003_add_files_table.sql          # Files table
│   ├── 20260208000004_add_logs_table.sql           # Logs table
│   ├── 20260208000005_add_contact_messages.sql     # Contact messages table
│   ├── 20260208000006_billing_rls_policies.sql     # RLS for new tables
│   └── 20260208000007_setup_pg_cron.sql            # pg_cron job for daily stats
└── seed/
    └── billing-plans.sql                            # Seed default plan data

tests/
├── unit/
│   ├── lib/services/billing-service.test.ts
│   ├── lib/services/credit-service.test.ts
│   ├── lib/services/stats-service.test.ts
│   ├── lib/payment/stripe/webhook-handler.test.ts
│   └── lib/payment/plans.test.ts
├── integration/
│   ├── api/billing/checkout.test.ts
│   ├── api/billing/webhook.test.ts
│   ├── api/admin/stats.test.ts
│   └── api/admin/users.test.ts
└── e2e/
    └── billing-flow.test.ts
```

**Structure Decision**: Extends the existing Next.js App Router structure. New directories (`billing/`, `admin/`, `files/`, `payment/`, `email/`) follow the established service layer pattern in `src/lib/services/`. The `payment/` directory uses Strategy Pattern inspired by Open SaaS to allow future payment provider additions.

## Complexity Tracking

No constitution violations to justify.
