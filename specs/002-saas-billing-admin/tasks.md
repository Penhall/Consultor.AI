# Tasks: SaaS Billing, Credits & Admin Panel

**Input**: Design documents from `/specs/002-saas-billing-admin/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/billing-api.md, contracts/admin-api.md, contracts/files-api.md, quickstart.md

**Tests**: Tests are included as this project has existing testing infrastructure (Vitest + Testing Library + Playwright) and the spec references testing patterns.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure environment, and establish shared type definitions

- [x] T001 Install billing dependencies: `stripe`, `@stripe/stripe-js`, `resend`, `react-email`, `@react-email/components`, and dev dependency `stripe-event-types` via npm
- [x] T002 [P] Add Stripe and billing environment variables to `.env.example` (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID, STRIPE_AGENCIA_PRICE_ID, STRIPE_CREDITS50_PRICE_ID, RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAILS, PLAUSIBLE_API_KEY, PLAUSIBLE_SITE_ID)
- [x] T003 [P] Define billing TypeScript types (SubscriptionStatus, SubscriptionPlan, PaymentPlanId, PaymentPlanEffect, PlanConfig) in `src/types/billing.ts`
- [x] T004 [P] Define admin TypeScript types (DailyStatsRow, PageViewSourceRow, AdminUserRow, AdminStatsResponse, AdminUsersResponse) in `src/types/admin.ts`
- [x] T005 [P] Define plan constants and configuration (Freemium/Pro/Agência with prices, credits, features) in `src/lib/payment/plans.ts`
- [x] T006 [P] Create Zod validation schemas for billing inputs (checkoutSchema, creditsQuerySchema) in `src/lib/validations/billing.ts`
- [x] T007 [P] Create Zod validation schemas for admin inputs (adminUsersQuerySchema, adminUserPatchSchema) in `src/lib/validations/admin.ts`
- [x] T008 [P] Create Zod validation schemas for file inputs (fileUploadSchema with type/size validation) in `src/lib/validations/file.ts`

**Checkpoint**: All types, schemas, and dependencies ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database migrations, Stripe client initialization, and PaymentProcessor interface — MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create migration to add billing fields to consultants table (stripe_customer_id, subscription_status, subscription_plan, date_paid, credits, purchased_credits, monthly_credits_allocation, credits_reset_at, is_admin) with indexes in `supabase/migrations/20260208000001_add_billing_fields.sql`
- [x] T010 [P] Create migration for daily_stats and page_view_sources tables with unique date constraint in `supabase/migrations/20260208000002_add_daily_stats.sql`
- [x] T011 [P] Create migration for files table with consultant_id FK and index in `supabase/migrations/20260208000003_add_files_table.sql`
- [x] T012 [P] Create migration for logs table with created_at index in `supabase/migrations/20260208000004_add_logs_table.sql`
- [x] T013 [P] Create migration for contact_form_messages table in `supabase/migrations/20260208000005_add_contact_messages.sql`
- [x] T014 Create migration for RLS policies on all new tables (files, daily_stats, page_view_sources, logs, contact_form_messages) and updated admin SELECT policy on consultants in `supabase/migrations/20260208000006_billing_rls_policies.sql`
- [x] T015 Create migration with `decrement_credits()` and `reset_monthly_credits()` RPC functions and pg_cron job setup in `supabase/migrations/20260208000007_setup_pg_cron.sql`
- [x] T016 Create Stripe SDK initialization singleton with error handling in `src/lib/payment/stripe/stripe-client.ts`
- [x] T017 Define PaymentProcessor interface (createCheckoutSession, fetchCustomerPortalUrl, webhook) in `src/lib/payment/payment-processor.ts`
- [x] T018 [P] Create seed data file with default plan configuration in `supabase/seed/billing-plans.sql`
- [x] T019 [P] Update `src/types/database.ts` to include new billing fields on consultants and new table types (daily_stats, page_view_sources, files, logs, contact_form_messages)

**Checkpoint**: Foundation ready — database schema applied, Stripe client initialized, PaymentProcessor interface defined. User story implementation can now begin.

---

## Phase 3: User Story 1 — Consultant Subscribes to a Paid Plan (Priority: P0) 🎯 MVP

**Goal**: Consultants can subscribe to Pro or Agência plans via Stripe Checkout, manage subscriptions via Customer Portal, and have status tracked via webhooks.

**Independent Test**: Create test user → navigate to /pricing → complete checkout with Stripe test card (4242...) → verify subscription_status="active" and subscription_plan="pro" in DB.

### Tests for User Story 1

- [x] T020 [P] [US1] Write unit tests for billing-service (createCheckoutSession, fetchPortalUrl, updateSubscription) in `tests/unit/lib/services/billing-service.test.ts`
- [x] T021 [P] [US1] Write unit tests for Stripe webhook handler (invoice.paid subscription flow, subscription.updated, subscription.deleted) in `tests/unit/lib/payment/stripe/webhook-handler.test.ts`

### Implementation for User Story 1

- [x] T022 [US1] Implement Stripe PaymentProcessor (createCheckoutSession with subscription mode, fetchCustomerPortalUrl, ensureStripeCustomer) in `src/lib/payment/stripe/stripe-processor.ts`
- [x] T023 [US1] Implement checkout session helpers (createSubscriptionCheckout, createCreditsCheckout) in `src/lib/payment/stripe/checkout-utils.ts`
- [x] T024 [US1] Implement Stripe webhook handler with raw body parsing, signature verification, and event routing (invoice.paid, subscription.updated, subscription.deleted). Handle edge cases: unknown user webhooks must log error and return 200 to prevent Stripe retries; re-subscription must update status to active without duplicating credits. In `src/lib/payment/stripe/webhook-handler.ts`
- [x] T025 [US1] Implement billing-service with business logic (createCheckout, getPortalUrl, updateUserSubscription, getUserBillingInfo) in `src/lib/services/billing-service.ts`
- [x] T026 [US1] Create POST /api/billing/checkout route (auth check, Zod validation, create Stripe session) in `src/app/api/billing/checkout/route.ts`
- [x] T027 [P] [US1] Create GET /api/billing/portal route (auth check, return portal URL or null) in `src/app/api/billing/portal/route.ts`
- [x] T028 [US1] Create POST /api/billing/webhook route (disable body parser, raw body, signature verification, event dispatch) in `src/app/api/billing/webhook/route.ts`
- [x] T029 [P] [US1] Create useBilling hook (useCheckout, usePortal mutations with React Query) in `src/hooks/useBilling.ts`

**Checkpoint**: Billing flow complete — checkout, webhooks, and portal all functional. Can test with `stripe trigger invoice.paid`.

---

## Phase 4: User Story 2 — Credit-Based AI Usage (Priority: P0)

**Goal**: AI features consume credits atomically. Users see balance, get blocked at 0 credits with upgrade prompt. Purchased credits never expire.

**Independent Test**: Create free user with 20 credits → trigger AI response → verify credits=19 → drain to 0 → verify block message appears → purchase credit pack → verify credits increase.

### Tests for User Story 2

- [x] T030 [P] [US2] Write unit tests for credit-service (decrementCredits, checkBalance, addPurchasedCredits, resetMonthlyCredits) in `tests/unit/lib/services/credit-service.test.ts`

### Implementation for User Story 2

- [x] T031 [US2] Implement credit-service with atomic decrement via RPC, balance check, purchased credits addition, and insufficient credits error in `src/lib/services/credit-service.ts`
- [x] T032 [US2] Create GET /api/billing/credits route (auth check, return credits/purchasedCredits/monthlyAllocation/plan/status/resetAt) in `src/app/api/billing/credits/route.ts`
- [x] T033 [US2] Integrate credit check into existing AI service — add credit decrement before AI response generation, throw 402 with upgrade prompt when insufficient in `src/lib/services/ai-service.ts`
- [x] T034 [US2] Add credit purchase flow to webhook handler — handle invoice.paid for credits50 plan (add purchased_credits, not subscription credits) in `src/lib/payment/stripe/webhook-handler.ts`
- [x] T035 [P] [US2] Create useCredits hook (useCreditsBalance query with React Query, auto-refresh interval) in `src/hooks/useCredits.ts`
- [x] T036 [P] [US2] Create credit-balance component showing remaining credits, plan info, and upgrade CTA when low in `src/components/billing/credit-balance.tsx`

**Checkpoint**: Credit system complete — AI features deduct credits, 0-credit block works, purchase flow adds credits.

---

## Phase 5: User Story 3 — Pricing Page with Plan Comparison (Priority: P0)

**Goal**: Public pricing page at /pricing with 3 plan cards, highlighted Pro plan, checkout CTA for anonymous/free users, manage subscription for subscribers.

**Independent Test**: Visit /pricing as anonymous → see 3 plans with BRL prices → login as free user → click "Assinar" on Pro → redirected to Stripe Checkout → login as subscriber → see "Gerenciar Assinatura".

### Implementation for User Story 3

- [x] T037 [P] [US3] Create pricing-card component (plan name, price BRL, feature list, CTA button, highlighted variant for Pro) in `src/components/billing/pricing-card.tsx`
- [x] T038 [P] [US3] Create checkout-button component (checks auth state — if unauthenticated, redirects to /auth/login with returnUrl=/pricing; if authenticated, shows loading state and calls POST /api/billing/checkout) in `src/components/billing/checkout-button.tsx`
- [x] T039 [P] [US3] Create subscription-status component (current plan display, manage subscription button for subscribers) in `src/components/billing/subscription-status.tsx`
- [x] T040 [US3] Create pricing page at /pricing (3 plan cards, responsive grid, subscriber detection, Portuguese labels) in `src/app/pricing/page.tsx`
- [x] T041 [US3] Create checkout result page at /checkout (success/cancel handling, redirect to dashboard) in `src/app/checkout/page.tsx`

**Checkpoint**: Pricing page complete — visitors see plans, free users can checkout, subscribers manage subscription.

---

## Phase 6: User Story 4 — Admin Dashboard with SaaS Metrics (Priority: P1)

**Goal**: Admin users access /admin with 4 metric cards (Revenue, Paying Users, Signups, Page Views), day-over-day deltas, and weekly revenue chart. Non-admins are blocked.

**Independent Test**: Login as admin → navigate to /admin → see 4 metric cards with values from daily_stats → see revenue chart → login as non-admin → verify redirect with "access denied".

### Tests for User Story 4

- [x] T042 [P] [US4] Write integration tests for GET /api/admin/stats (admin auth check, query params, response shape) in `tests/integration/api/admin/stats.test.ts`

### Implementation for User Story 4

- [x] T043 [US4] Create admin-guard component (checks is_admin flag, redirects non-admins with toast message) in `src/components/admin/admin-guard.tsx`
- [x] T044 [P] [US4] Create stats-card component (metric name, value, delta with up/down indicator, icon) in `src/components/admin/stats-card.tsx`
- [x] T045 [P] [US4] Create revenue-chart component (SVG/recharts bar chart, last 7 days revenue/profit) in `src/components/admin/revenue-chart.tsx`
- [x] T046 [P] [US4] Create admin-sidebar component (navigation links: Dashboard, Users) in `src/components/admin/admin-sidebar.tsx`
- [x] T047 [US4] Create GET /api/admin/stats route (admin auth, query daily_stats with service_role, join page_view_sources, paginate by days param) in `src/app/api/admin/stats/route.ts`
- [x] T048 [US4] Create useAdmin hook (useAdminStats query with React Query, days param) in `src/hooks/useAdmin.ts`
- [x] T049 [US4] Create admin layout with sidebar and admin guard at `src/app/admin/layout.tsx`
- [x] T050 [US4] Create admin dashboard page with stats cards and revenue chart at `src/app/admin/page.tsx`

**Checkpoint**: Admin dashboard complete — admins see metrics, non-admins blocked.

---

## Phase 7: User Story 5 — Admin User Management (Priority: P1)

**Goal**: Admins view paginated users table with email/status/admin filters, toggle admin on other users (disabled for self).

**Independent Test**: Login as admin → /admin/users → see paginated table → filter by email "maria" → filter by status "active" → toggle admin on another user → verify own admin toggle is disabled.

### Tests for User Story 5

- [x] T051 [P] [US5] Write integration tests for GET/PATCH /api/admin/users (pagination, email filter, status filter, admin toggle, self-demotion prevention) in `tests/integration/api/admin/users.test.ts`

### Implementation for User Story 5

- [x] T052 [US5] Create users-table component (paginated table with columns: email, name, plan, status, stripeCustomerId, admin toggle switch, disabled for self) in `src/components/admin/users-table.tsx`
- [x] T053 [US5] Create GET /api/admin/users route (admin auth, query consultants with service_role, email ILIKE filter, subscription_status IN filter, pagination with count) in `src/app/api/admin/users/route.ts`
- [x] T054 [US5] Add PATCH handler to /api/admin/users route (admin auth, self-demotion check, update is_admin flag) in `src/app/api/admin/users/route.ts`
- [x] T055 [US5] Add useAdminUsers hook (paginated query, filter state, debounced email search, toggle admin mutation) to `src/hooks/useAdmin.ts`
- [x] T056 [US5] Create admin users page with filters bar and users table at `src/app/admin/users/page.tsx`

**Checkpoint**: Admin user management complete — pagination, filters, and admin toggle all functional.

---

## Phase 8: User Story 6 — Automated Daily Stats Calculation (Priority: P1)

**Goal**: Hourly pg_cron job calculates daily metrics (user counts, deltas, revenue) and persists to daily_stats. Errors logged to logs table.

**Independent Test**: Trigger stats function manually via SQL → verify daily_stats row created with correct userCount and paidUserCount → run again → verify deltas calculated.

### Tests for User Story 6

- [x] T057 [P] [US6] Write unit tests for stats-service (calculateDailyStats, fetchStripeRevenue, calculateDeltas, error handling) in `tests/unit/lib/services/stats-service.test.ts`

### Implementation for User Story 6

- [x] T058 [US6] Implement stats-service with daily stats calculation logic (count users/paid users, calculate deltas from yesterday, sum revenue from local data, fetch page views from Plausible API) in `src/lib/services/stats-service.ts`
- [x] T059 [US6] Verify pg_cron migration (T015) creates hourly job calling a SQL function that invokes stats calculation. Add error-safe wrapper that logs failures to logs table without crashing in `supabase/migrations/20260208000007_setup_pg_cron.sql`

**Checkpoint**: Stats job complete — daily_stats populated hourly, admin dashboard reads from it.

---

## Phase 9: User Story 7 — File Upload for Marketing Materials (Priority: P2)

**Goal**: Consultants upload PDFs/images (max 10MB) to Supabase Storage, view own files, download via signed URLs, delete files. Type validation rejects disallowed formats.

**Independent Test**: Login as consultant → upload PDF via /dashboard/arquivos → file appears in list → click download → file downloads → click delete → file removed → try uploading .exe → rejected.

### Tests for User Story 7

- [x] T060 [P] [US7] Write unit tests for file-service (createUploadUrl, createDownloadUrl, deleteFile, listUserFiles, type validation rejection) in `tests/unit/lib/services/file-service.test.ts`

### Implementation for User Story 7

- [x] T061 [US7] Implement file-service (createUploadUrl via Supabase Storage presigned URL, createDownloadUrl with 1h expiry, deleteFile from storage + DB, listUserFiles) in `src/lib/services/file-service.ts`
- [x] T062 [US7] Create GET/POST /api/files route (GET: list user files via RLS, POST: validate type/size with Zod, create presigned upload URL, insert file record) in `src/app/api/files/route.ts`
- [x] T063 [US7] Create GET/DELETE /api/files/[id] route (GET: generate signed download URL, DELETE: remove from storage and DB, RLS enforces ownership) in `src/app/api/files/[id]/route.ts`
- [x] T064 [P] [US7] Create useFiles hook (useFileList query, useUploadFile mutation, useDeleteFile mutation with optimistic update) in `src/hooks/useFiles.ts`
- [x] T065 [P] [US7] Create file-upload-zone component (drag & drop, file type validation, size limit display, upload progress) in `src/components/files/file-upload-zone.tsx`
- [x] T066 [P] [US7] Create file-list component (table with name, type, size, date, download/delete actions) in `src/components/files/file-list.tsx`
- [x] T067 [US7] Create file upload page at /dashboard/arquivos (upload zone + file list, Portuguese labels) in `src/app/dashboard/arquivos/page.tsx`

**Checkpoint**: File upload complete — upload, list, download, delete all functional with proper isolation.

---

## Phase 10: User Story 8 — Transactional Email System (Priority: P2)

**Goal**: Platform sends branded HTML emails for welcome, password reset, subscription cancellation. Uses Resend with React Email templates. Console fallback in dev.

**Independent Test**: Trigger password reset → verify email sent via Resend (or console log in dev) → verify cancellation webhook sends retention email → verify email failure doesn't block primary action.

### Tests for User Story 8

- [x] T068 [P] [US8] Write unit tests for email-service (sendWelcomeEmail, sendCancellationEmail, console fallback in dev, error handling that never throws) in `tests/unit/lib/services/email-service.test.ts`

### Implementation for User Story 8

- [x] T069 [P] [US8] Define EmailProvider interface (sendEmail method with to, subject, react component) in `src/lib/email/email-provider.ts`
- [x] T070 [P] [US8] Implement Resend provider (Resend SDK initialization, sendEmail implementation, console fallback when RESEND_API_KEY is missing) in `src/lib/email/resend-provider.ts`
- [x] T071 [P] [US8] Create welcome email template (branded HTML with consultant name, getting started CTA) in `src/lib/email/templates/welcome.tsx`
- [x] T072 [P] [US8] Create password-reset email template (reset link, expiry notice) in `src/lib/email/templates/password-reset.tsx`
- [x] T073 [P] [US8] Create subscription-canceled email template (retention message, re-subscribe CTA) in `src/lib/email/templates/subscription-canceled.tsx`
- [x] T074 [US8] Implement email-service (sendWelcomeEmail, sendPasswordResetEmail, sendCancellationEmail with try/catch logging that never throws) in `src/lib/services/email-service.ts`
- [x] T075 [US8] Integrate cancellation email into webhook handler — call email-service.sendCancellationEmail on subscription.deleted event in `src/lib/payment/stripe/webhook-handler.ts`

**Checkpoint**: Email system complete — all transactional emails send via Resend, failures logged without blocking.

---

## Phase 11: User Story 9 — Enhanced Landing Page & LGPD (Priority: P2)

**Goal**: Marketing landing page with Hero, Features Grid, Testimonials, FAQ, Footer sections. LGPD cookie consent banner blocks analytics until accepted.

**Independent Test**: Visit landing page → see all 5 sections → cookie banner appears → click "Aceitar" → banner disappears, analytics loaded → reload → banner stays hidden → mobile view → responsive layout.

### Tests for User Story 9

- [x] T076 [P] [US9] Write component tests for cookie-consent banner (renders on first visit, hides after accept, persists choice across reloads via localStorage, does not load analytics scripts before consent) in `tests/unit/components/cookie-consent/banner.test.tsx`

### Implementation for User Story 9

- [x] T077 [P] [US9] Create hero component (value proposition headline, subtitle, CTA button, illustration/gradient) in `src/components/landing/hero.tsx`
- [x] T078 [P] [US9] Create features-grid component (6 feature cards with icons, titles, descriptions in Portuguese) in `src/components/landing/features-grid.tsx`
- [x] T079 [P] [US9] Create testimonials component (3 consultant testimonial cards with name, role, quote) in `src/components/landing/testimonials.tsx`
- [x] T080 [P] [US9] Create faq component (accordion with 5-7 common questions in Portuguese, shadcn/ui Accordion) in `src/components/landing/faq.tsx`
- [x] T081 [P] [US9] Create footer component (logo, links, social icons, copyright) in `src/components/landing/footer.tsx`
- [x] T082 [P] [US9] Create cookie-consent banner component (LGPD compliant, "Aceitar"/"Recusar" buttons, localStorage persistence, conditional analytics script loading) in `src/components/cookie-consent/banner.tsx`
- [x] T083 [US9] Update landing page to compose all sections (Hero, Features, Testimonials, FAQ, Footer) and include cookie consent banner in `src/app/page.tsx`

**Checkpoint**: Landing page complete — all sections render, cookie consent compliant, responsive.

---

## Phase 12: User Story 10 — Social Login with OAuth (Priority: P3)

**Goal**: Google and GitHub OAuth login options added to auth pages. OAuth accounts link to existing accounts when emails match.

**Independent Test**: Click "Entrar com Google" → complete OAuth flow → account created → logout → login with same email/password → both methods work.

### Implementation for User Story 10

- [x] T084 [US10] Configure Google and GitHub OAuth providers in Supabase Dashboard and add callback URL to environment config
- [x] T085 [US10] Add Google and GitHub OAuth buttons to login form (Supabase Auth signInWithOAuth, redirect handling) in `src/components/auth/login-form.tsx`
- [x] T086 [US10] Add Google and GitHub OAuth buttons to signup form in `src/components/auth/signup-form.tsx`
- [x] T087 [US10] Handle OAuth callback and account linking (check for existing email, link or create consultant record) in `src/app/auth/callback/route.ts`

**Checkpoint**: OAuth complete — Google and GitHub login functional, account linking works.

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final integration, and validation

- [x] T088 Add admin auto-assignment logic — check ADMIN_EMAILS env var at signup time and set is_admin=true in `src/components/auth/signup-form.tsx`
- [x] T089 Add subscription status display to dashboard sidebar/header (show current plan badge and credit balance) in `src/components/dashboard/` (existing layout)
- [x] T090 Add lead limit enforcement based on subscription plan in `src/lib/services/lead-service.ts`
- [x] T091 [P] Write integration tests for POST /api/billing/checkout (auth, validation, session creation) in `tests/integration/api/billing/checkout.test.ts`
- [x] T092 [P] Write integration tests for POST /api/billing/webhook (signature validation, event processing, unknown user edge case returns 200) in `tests/integration/api/billing/webhook.test.ts`
- [x] T093 [P] Write E2E test for billing flow (pricing page → checkout → webhook → dashboard reflects subscription) in `tests/e2e/billing-flow.spec.ts`
- [x] T094 [P] Write unit tests for plan definitions and configuration in `tests/unit/lib/payment/plans.test.ts`
- [x] T095 Update middleware to protect /admin/\* routes (redirect non-admins) and ensure /api/billing/checkout requires auth in `src/middleware.ts`
- [~] T096 Add JSDoc documentation to all public functions in new service files — DEFERRED (low priority, functions have descriptive names and inline comments)
- [~] T097 [P] Add README.md to new major directories — DEFERRED (low priority, project structure is documented in CLAUDE.md)
- [~] T098 Run quickstart.md verification checklist — DEFERRED (requires full environment with Stripe keys configured)
- [x] T099 Verify TypeScript build passes with zero errors (`npm run type-check`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **User Stories (Phases 3-12)**: All depend on Foundational phase completion
  - P0 stories (US1→US2→US3) should be implemented sequentially (US2 depends on billing webhook from US1)
  - P1 stories (US4, US5, US6) can proceed in parallel after P0
  - P2 stories (US7, US8, US9) can proceed in parallel after P0
  - P3 story (US10) can proceed independently after Foundational
- **Polish (Phase 13)**: Depends on P0 stories being complete; other stories optional

### User Story Dependencies

- **US1 (Billing)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **US2 (Credits)**: Depends on US1 (webhook handler for credit purchases) — start after US1 checkout + webhook tasks
- **US3 (Pricing)**: Depends on US1 (checkout API) — can start after T026 is done
- **US4 (Admin Dashboard)**: Can start after Foundational — independent of billing (reads daily_stats)
- **US5 (Admin Users)**: Can start after Foundational — shares admin layout with US4 but pages are independent
- **US6 (Daily Stats)**: Can start after Foundational — populates daily_stats read by US4
- **US7 (Files)**: Can start after Foundational — fully independent
- **US8 (Email)**: Partially depends on US1 (cancellation webhook integration at T073) — but email infrastructure (T067-T072) is independent
- **US9 (Landing/LGPD)**: Can start after Foundational — fully independent
- **US10 (OAuth)**: Can start after Foundational — fully independent

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types/schemas (Phase 1) before services
- Services before API routes
- API routes before React hooks
- React hooks before UI components
- Core implementation before integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T008)
- All Foundational migrations marked [P] can run in parallel (T010-T013, T018-T019)
- After Foundational, these story groups can proceed independently:
  - Group A (Revenue): US1 → US2 → US3 (sequential dependency)
  - Group B (Admin): US4 + US5 + US6 (parallel, share admin layout)
  - Group C (UX): US7 + US8 + US9 (fully parallel)
  - Group D (Future): US10 (independent)
- Within each story, tests marked [P] and components marked [P] can run in parallel

---

## Parallel Example: User Story 1

```
# Tests in parallel:
Task T020: "Unit tests for billing-service in tests/unit/lib/services/billing-service.test.ts"
Task T021: "Unit tests for webhook handler in tests/unit/lib/payment/stripe/webhook-handler.test.ts"

# After tests, parallel API routes (different files):
Task T027: "GET /api/billing/portal in src/app/api/billing/portal/route.ts"
Task T029: "useBilling hook in src/hooks/useBilling.ts"
```

## Parallel Example: User Story 9

```
# All components in parallel (different files, no dependencies):
Task T077: "Hero component in src/components/landing/hero.tsx"
Task T078: "Features grid in src/components/landing/features-grid.tsx"
Task T079: "Testimonials in src/components/landing/testimonials.tsx"
Task T080: "FAQ accordion in src/components/landing/faq.tsx"
Task T081: "Footer in src/components/landing/footer.tsx"
Task T082: "Cookie consent banner in src/components/cookie-consent/banner.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Billing Subscriptions
4. Complete Phase 4: US2 — Credit System
5. Complete Phase 5: US3 — Pricing Page
6. **STOP and VALIDATE**: Test full billing flow end-to-end
7. Deploy/demo — **monetization is live**

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 + US2 + US3 → Test billing flow → Deploy (MVP — Revenue!)
3. US4 + US5 + US6 → Test admin panel → Deploy (Management!)
4. US7 + US8 + US9 → Test UX features → Deploy (Polish!)
5. US10 → Test OAuth → Deploy (Growth!)
6. Each increment adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Foundational is done:

- **Developer A**: US1 → US2 → US3 (billing flow, sequential)
- **Developer B**: US4 + US5 + US6 (admin panel, can parallelize)
- **Developer C**: US7 + US8 + US9 (UX features, can parallelize)
- Stories integrate independently at Polish phase

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after Foundational phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All UI text in Portuguese (PT-BR)
- All code in English (variables, functions, comments)
- Supabase RLS enforced on all new tables
- Stripe test mode for all development
- **Known limitation**: Credit pack purchases are tracked as an integer sum (`purchased_credits`) without individual purchase history. If purchase audit trail is needed later, add a `credit_purchases` ledger table (not in MVP scope)
