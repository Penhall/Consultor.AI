# Feature Specification: SaaS Billing, Credits & Admin Panel

**Feature Branch**: `002-saas-billing-admin`
**Created**: 2026-02-08
**Status**: Draft
**Input**: Integração das regras de negócio do Open SaaS (wasp-lang/open-saas) no Consultor.AI — billing com Stripe, sistema de créditos, admin panel, cron jobs, file upload, email transacional, landing page e cookie consent.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Consultant Subscribes to a Paid Plan (Priority: P0)

A health plan consultant visits the pricing page and sees three plans: Freemium (R$0), Pro (R$47/mês), and Agência (R$147/mês). The consultant chooses the Pro plan, is redirected to a secure checkout page, enters payment details, and returns to the dashboard with the Pro plan activated. The system records the subscription status and unlocks Pro features (higher lead limits, auto follow-ups, CSV export).

**Why this priority**: Without billing, the platform cannot generate revenue. This is the foundational monetization mechanism.

**Independent Test**: Can be fully tested by creating a test user, navigating to pricing page, completing checkout with Stripe test card (4242...), and verifying subscription status is updated in the user record.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they click "Assinar" on a plan, **Then** they are redirected to the login page first, then back to checkout.
2. **Given** an authenticated free-tier consultant, **When** they complete Stripe checkout for the Pro plan, **Then** their subscription status becomes "active", their plan becomes "pro", and the payment date is recorded.
3. **Given** an authenticated Pro subscriber, **When** they visit the pricing page, **Then** they see a "Gerenciar Assinatura" button instead of "Assinar", linking to the Stripe Customer Portal.
4. **Given** an active subscriber, **When** they cancel via Stripe Customer Portal, **Then** their status becomes "cancel_at_period_end" and they retain access until the billing period ends.
5. **Given** a subscription with status "past_due", **When** the payment fails, **Then** the system sends a notification email and marks the subscription accordingly.

---

### User Story 2 - Credit-Based AI Usage (Priority: P0)

Consultants use AI-powered features (response generation, lead qualification) that consume credits. Free-tier users start with 20 credits/month. Pro users get 200 credits/month. Agência users get 1,000 credits/month. Credits reset monthly. Additional credit packs can be purchased as one-time payments.

**Why this priority**: Credits control access to the AI features that are the core differentiator. Without credits, the freemium/paid boundary cannot be enforced.

**Independent Test**: Can be tested by creating a free user with 20 credits, triggering AI responses, verifying credit decrement, and confirming the system blocks usage at 0 credits.

**Acceptance Scenarios**:

1. **Given** a free-tier user with 5 remaining credits, **When** they trigger an AI response, **Then** 1 credit is deducted and 4 credits remain.
2. **Given** a free-tier user with 0 credits, **When** they try to use AI features, **Then** the system shows a message "Seus créditos acabaram. Faça upgrade para continuar." with a link to the pricing page.
3. **Given** a Pro subscriber, **When** they use AI features within their monthly quota (200), **Then** credits are deducted normally without blocking.
4. **Given** any user, **When** they purchase a 50-credit pack (R$19.90), **Then** credits are added to their balance immediately after payment confirmation.
5. **Given** the first day of a new billing cycle, **When** the monthly reset runs, **Then** subscription-based credits are reset to the plan's allocation (20, 200, or 1,000).

---

### User Story 3 - Pricing Page with Plan Comparison (Priority: P0)

Visitors and logged-in users see a pricing page comparing the three plans side by side. Each plan card shows the name, price, feature list, and a call-to-action button. The page highlights the recommended plan (Pro). Subscribers see their current plan status and a link to manage their subscription.

**Why this priority**: The pricing page is the primary conversion point. It must clearly communicate value and enable frictionless checkout.

**Independent Test**: Can be tested by visiting /pricing as anonymous, free, and subscribed users and verifying correct rendering and button behavior for each state.

**Acceptance Scenarios**:

1. **Given** an anonymous visitor, **When** they view the pricing page, **Then** all three plans are displayed with prices in BRL, features, and "Começar" buttons.
2. **Given** a free-tier logged-in user, **When** they click "Assinar" on the Pro plan, **Then** a Stripe checkout session is created and the user is redirected.
3. **Given** a Pro subscriber, **When** they view the pricing page, **Then** their current plan is highlighted and a "Gerenciar Assinatura" button appears.
4. **Given** a mobile user, **When** they view the pricing page, **Then** the layout is responsive and all plans are accessible.

---

### User Story 4 - Admin Dashboard with SaaS Metrics (Priority: P1)

A platform administrator accesses `/admin` and sees a dashboard with key SaaS metrics: total revenue, number of paying users, total signups, page views, and user growth deltas. A revenue chart shows weekly trends. The admin can navigate to a users management page.

**Why this priority**: Admins need visibility into platform health and revenue to make business decisions.

**Independent Test**: Can be tested by logging in as an admin user, navigating to /admin, and verifying that metric cards and charts render with data from the daily stats table.

**Acceptance Scenarios**:

1. **Given** a non-admin user, **When** they try to access `/admin`, **Then** they are redirected to the dashboard with an "access denied" message.
2. **Given** an admin user, **When** they access `/admin`, **Then** they see 4 metric cards (Revenue, Paying Users, Total Signups, Page Views) with current values and day-over-day deltas.
3. **Given** daily stats have been generated, **When** the admin views the dashboard, **Then** a weekly revenue/profit chart is displayed with the last 7 data points.
4. **Given** no daily stats exist yet, **When** the admin views the dashboard, **Then** a helpful message explains that stats will appear after the first daily job run.

---

### User Story 5 - Admin User Management (Priority: P1)

Administrators can view a paginated table of all platform users, filter by email, subscription status, and admin role. They can toggle admin privileges inline and view each user's Stripe customer ID and subscription details.

**Why this priority**: User management is essential for support, troubleshooting, and platform governance.

**Independent Test**: Can be tested by seeding the database with mock users, logging in as admin, and verifying filtering, pagination, and admin toggle functionality.

**Acceptance Scenarios**:

1. **Given** 50 registered users, **When** the admin views the users page, **Then** a paginated table shows users with columns: email, subscription status, payment processor ID, and admin toggle.
2. **Given** the admin types "maria" in the email filter, **When** the filter debounces, **Then** only users with "maria" in their email are shown.
3. **Given** the admin selects "active" subscription status filter, **When** applied, **Then** only actively subscribed users are shown.
4. **Given** the admin toggles a user's admin switch, **When** confirmed, **Then** the user's isAdmin flag is updated in the database.
5. **Given** the admin is viewing their own row, **When** they see the admin toggle, **Then** it is disabled to prevent self-demotion.

---

### User Story 6 - Automated Daily Stats Calculation (Priority: P1)

A scheduled job runs every hour, calculating daily platform metrics: total users, paid users, user growth, revenue from Stripe, and page views from the analytics provider. These stats are persisted and displayed in the admin dashboard.

**Why this priority**: Automated metrics are the data source for the admin dashboard and business intelligence.

**Independent Test**: Can be tested by triggering the stats job manually and verifying that DailyStats records are created/updated with correct values.

**Acceptance Scenarios**:

1. **Given** the scheduled job runs, **When** it completes, **Then** a DailyStats record is created or updated for today with userCount, paidUserCount, totalRevenue, and totalViews.
2. **Given** yesterday's stats exist, **When** today's job runs, **Then** userDelta and paidUserDelta are calculated as the difference from yesterday.
3. **Given** Stripe has recorded payments, **When** the job fetches revenue, **Then** totalRevenue reflects the sum of all Stripe charges converted from centavos to reais.
4. **Given** an error occurs during stats calculation, **When** the job fails, **Then** the error is logged to a Logs table and the job does not crash.

---

### User Story 7 - File Upload for Marketing Materials (Priority: P2)

Consultants can upload documents (PDFs, images) such as price tables, marketing materials, and plan comparisons. Files are stored securely and can be downloaded via signed URLs. Each consultant sees only their own files.

**Why this priority**: Enables consultants to share materials with leads, enhancing the sales process.

**Independent Test**: Can be tested by uploading a PDF, verifying it appears in the file list, downloading via signed URL, and confirming another user cannot access it.

**Acceptance Scenarios**:

1. **Given** a logged-in consultant, **When** they upload a PDF file (max 10MB), **Then** the file is stored in cloud storage and a record is saved with the file name, type, and storage key.
2. **Given** a consultant with uploaded files, **When** they view the files page, **Then** they see only their own files listed with name, type, and upload date.
3. **Given** a consultant clicks "Download" on a file, **When** the system generates a signed URL, **Then** the file downloads directly and the URL expires after 1 hour.
4. **Given** a consultant clicks "Excluir" on a file, **When** confirmed, **Then** the file is deleted from both storage and the database.
5. **Given** a user tries to upload a .exe file, **When** validation runs, **Then** the upload is rejected with an error message.

---

### User Story 8 - Transactional Email System (Priority: P2)

The platform sends transactional emails for key events: email verification, password reset, subscription cancellation warning, welcome email after signup, and payment failure notification. Emails use branded HTML templates.

**Why this priority**: Email communication is essential for account security (password reset) and retention (cancellation warning).

**Independent Test**: Can be tested by triggering a password reset, verifying the email is sent (via dev email viewer), and confirming the reset link works.

**Acceptance Scenarios**:

1. **Given** a new user signs up, **When** the signup completes, **Then** a verification email is sent with a confirmation link.
2. **Given** a user requests a password reset, **When** the request is submitted, **Then** an email with a reset link is sent within 30 seconds.
3. **Given** a subscriber cancels, **When** the cancellation webhook fires, **Then** a retention email is sent offering an alternative.
4. **Given** the email service is unavailable, **When** an email fails to send, **Then** the error is logged and the user is not blocked from their action.

---

### User Story 9 - Enhanced Landing Page (Priority: P2)

The public landing page is redesigned with marketing-optimized sections: Hero with value proposition, Features Grid highlighting key capabilities, Testimonials from consultants, FAQ accordion for common questions, Footer with links, and a Cookie Consent banner for LGPD compliance.

**Why this priority**: A compelling landing page improves conversion from visitor to signup.

**Independent Test**: Can be tested by visiting the landing page and verifying all sections render, the cookie banner appears, and responsive design works on mobile.

**Acceptance Scenarios**:

1. **Given** a first-time visitor, **When** they load the landing page, **Then** they see Hero, Features, Testimonials, FAQ, and Footer sections.
2. **Given** a first-time visitor, **When** the page loads, **Then** a cookie consent banner appears at the bottom.
3. **Given** the visitor clicks "Aceitar" on the cookie banner, **When** the choice is saved, **Then** the banner disappears and analytics scripts are loaded.
4. **Given** a mobile user, **When** they view the landing page, **Then** all sections stack vertically and remain readable.

---

### User Story 10 - Social Login with OAuth (Priority: P3)

Users can sign up and log in using their Google or GitHub accounts as an alternative to email/password. The OAuth flow links social accounts to existing email-based accounts when the email matches.

**Why this priority**: Reduces friction at signup but is not essential for MVP monetization.

**Independent Test**: Can be tested by clicking "Entrar com Google", completing the OAuth flow, and verifying a user account is created or linked.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they click "Entrar com Google", **Then** they are redirected to Google's OAuth consent screen.
2. **Given** the user authorizes the app, **When** Google redirects back, **Then** an account is created with the Google email and they are logged in.
3. **Given** an existing email-based user with the same email, **When** they log in via Google, **Then** the accounts are linked and both methods work.

---

### Edge Cases

- What happens when a Stripe webhook is received for a user that doesn't exist in the database? System logs the error and returns 200 to Stripe to prevent retries.
- What happens when a user's credit balance goes negative due to race conditions? Use atomic database operations (increment/decrement) to prevent negative balances.
- What happens when the daily stats job runs but Stripe API is unreachable? The job logs the error, saves partial data, and retries on the next scheduled run.
- What happens when a file upload exceeds the maximum size? The presigned URL is configured with size limits; storage rejects the upload and the client shows an error.
- What happens when a user cancels and re-subscribes within the same billing period? The system updates the subscription status back to "active" and does not duplicate credits.
- What happens when the cookie consent is rejected? Analytics scripts are not loaded, and only essential cookies are used (LGPD compliance).

## Requirements _(mandatory)_

### Functional Requirements

#### Billing & Subscriptions

- **FR-001**: System MUST support three subscription plans: Freemium (R$0/mês, 20 leads, 20 créditos IA), Pro (R$47/mês, 200 leads, 200 créditos IA), Agência (R$147/mês, 1000 leads, 1000 créditos IA).
- **FR-002**: System MUST integrate with Stripe for payment processing using a Strategy Pattern interface (`PaymentProcessor`) to allow future provider additions.
- **FR-003**: System MUST create Stripe Checkout Sessions for new subscriptions and one-time credit purchases.
- **FR-004**: System MUST provide access to the Stripe Customer Portal for subscribers to manage payment methods, view invoices, and cancel subscriptions.
- **FR-005**: System MUST handle Stripe webhooks for events: `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`.
- **FR-006**: System MUST validate Stripe webhook signatures using the webhook secret to prevent unauthorized events.
- **FR-007**: System MUST track subscription status per consultant: `active`, `cancel_at_period_end`, `past_due`, `deleted`.
- **FR-008**: System MUST support one-time credit pack purchases (e.g., 50 créditos por R$19.90) processed as Stripe `payment` mode.

#### Credits System

- **FR-009**: System MUST assign default credits based on subscription plan: Freemium=20, Pro=200, Agência=1000 per month.
- **FR-010**: System MUST decrement credits atomically when AI features are used (1 credit per AI response generation).
- **FR-011**: System MUST block AI feature usage when credit balance reaches 0 for non-subscribed users, showing an upgrade prompt.
- **FR-012**: System MUST reset subscription-based credits on the first day of each billing cycle.
- **FR-013**: System MUST add purchased credit packs to the user's balance immediately upon payment confirmation.
- **FR-014**: Purchased credits (one-time) MUST NOT expire and MUST NOT be reset on billing cycles.

#### Pricing Page

- **FR-015**: System MUST display a pricing page at `/pricing` with three plan cards showing name, price in BRL, feature list, and CTA button.
- **FR-016**: System MUST highlight the recommended plan (Pro) visually.
- **FR-017**: System MUST show "Gerenciar Assinatura" button for active subscribers instead of "Assinar".
- **FR-018**: System MUST redirect unauthenticated users to login before checkout.

#### Admin Panel

- **FR-019**: System MUST restrict admin pages (`/admin/*`) to users with `isAdmin: true`.
- **FR-020**: System MUST display an admin analytics dashboard with metrics: total revenue, paying users, total signups, page views, and day-over-day deltas.
- **FR-021**: System MUST display a weekly revenue chart with the last 7 days of data.
- **FR-022**: System MUST provide a paginated users table with filters by email (with debounce), subscription status (multi-select), and admin role.
- **FR-023**: System MUST allow admins to toggle `isAdmin` on other users inline, but prevent self-demotion.
- **FR-024**: Admin users MUST be auto-assigned based on an `ADMIN_EMAILS` environment variable at signup time.

#### Daily Stats Job

- **FR-025**: System MUST run a scheduled job (hourly) to calculate daily platform metrics.
- **FR-026**: The daily stats job MUST calculate: total users, paid users, user/paid-user deltas, total revenue (from Stripe), and total page views (from analytics provider).
- **FR-027**: System MUST persist daily stats with date uniqueness to prevent duplicates.
- **FR-028**: System MUST log errors from the stats job to a Logs table without crashing.

#### File Upload

- **FR-029**: System MUST allow consultants to upload files (PDF, PNG, JPG, WEBP) up to 10MB.
- **FR-030**: System MUST store files using presigned upload URLs (Supabase Storage or AWS S3).
- **FR-031**: System MUST generate time-limited signed download URLs (1 hour expiry).
- **FR-032**: System MUST enforce user isolation — consultants can only see and manage their own files.
- **FR-033**: System MUST validate file types and reject disallowed formats.

#### Email System

- **FR-034**: System MUST send transactional emails for: email verification, password reset, subscription cancellation, and welcome.
- **FR-035**: System MUST support at least one email provider (Resend or SendGrid) with a fallback logging mechanism in development.
- **FR-036**: Email sending failures MUST be logged and MUST NOT block the user's primary action.

#### Landing Page & LGPD

- **FR-037**: System MUST display a marketing landing page with Hero, Features Grid, Testimonials, FAQ, and Footer sections.
- **FR-038**: System MUST show a LGPD-compliant cookie consent banner on first visit.
- **FR-039**: System MUST only load analytics/tracking scripts after the user accepts cookies.
- **FR-040**: System MUST persist the user's cookie consent choice.

#### OAuth (Future)

- **FR-041**: System SHOULD support Google OAuth login as an alternative to email/password.
- **FR-042**: System SHOULD link OAuth accounts to existing accounts when emails match.

### Key Entities

- **Subscription**: Represents a consultant's billing relationship — includes plan ID, status, payment processor customer ID, date paid, and billing cycle.
- **Credits**: Represents a consultant's AI usage balance — includes current balance, monthly allocation based on plan, and purchased (non-expiring) credits.
- **DailyStats**: Represents aggregated platform metrics for a single day — includes user counts, revenue, page views, and growth deltas.
- **PageViewSource**: Represents traffic sources for a given day — includes source name and visitor count, linked to DailyStats.
- **File**: Represents an uploaded document — includes file name, type, storage key, and owner (consultant).
- **Logs**: Represents system events for debugging — includes message, level, and timestamp.
- **ContactFormMessage**: Represents a message sent by a user via contact form — includes content, read status, and reply timestamp.

## Assumptions

- **Stripe is the sole payment provider** for the initial implementation. The Strategy Pattern allows adding Lemon Squeezy or Polar later.
- **BRL currency** (Brazilian Real) is used for all pricing. Stripe will handle currency conversion if needed.
- **Supabase Storage** will be used instead of AWS S3 for file uploads, to maintain consistency with the existing stack.
- **Resend** will be the primary email provider due to its modern API and React Email support.
- **Plausible Analytics** will be the analytics provider for page view tracking (privacy-first, no cookies required for basic tracking).
- **pg_cron** (Supabase extension) will be used for the daily stats job instead of PgBoss, since PgBoss requires a Node.js runtime.
- **Admin emails** are configured via environment variable (`ADMIN_EMAILS`) and checked at signup time.
- **Credit reset** happens via a monthly cron job that runs on the 1st of each month.
- **Lead limits** per plan are enforced at the application layer, not database constraints.
- **The existing authentication system** (Supabase Auth with email/password) is retained; OAuth is additive.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Consultants can complete the subscription checkout flow (from pricing page to active subscription) in under 3 minutes.
- **SC-002**: Credit balance updates are reflected in the UI within 2 seconds of an AI feature usage.
- **SC-003**: The admin dashboard loads with all metric cards in under 3 seconds.
- **SC-004**: The admin users table supports filtering and pagination for up to 10,000 users without performance degradation.
- **SC-005**: Stripe webhook events are processed and reflected in the system within 30 seconds of receipt.
- **SC-006**: File uploads of up to 10MB complete within 15 seconds on a standard connection.
- **SC-007**: Transactional emails are delivered within 60 seconds of the triggering event.
- **SC-008**: The landing page achieves a Lighthouse performance score of 80+ on mobile.
- **SC-009**: 100% of Stripe webhook events are acknowledged with a 2xx response (no retries from Stripe).
- **SC-010**: The cookie consent banner complies with LGPD requirements — no tracking scripts load before explicit consent.
