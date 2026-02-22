# Research: Navigation Diagnostic & Link Crawler

**Feature**: `004-navigation-diagnostic`
**Date**: 2026-02-20

## R1: Authentication Method for Crawling Next.js Pages

**Decision**: Use Supabase Auth REST API to get JWT, then format session cookies for page requests and Bearer tokens for API requests.

**Rationale**: Next.js middleware (`src/middleware.ts`) uses `createServerClient` from `@supabase/ssr` which reads auth state from cookies (specifically `sb-<ref>-auth-token`). API routes also use the same cookie-based auth. Simply sending a Bearer header won't work for pages because the middleware intercepts first. The cookie format is a base64-encoded JSON containing `access_token` and `refresh_token`.

**Alternatives considered**:

- Playwright/Puppeteer browser automation: Too heavy for HTTP-level diagnostic, adds significant dependency
- Direct database queries to bypass auth: Wouldn't test actual route behavior
- Disabling middleware temporarily: Defeats the purpose of testing real access patterns

**Implementation note**: The Supabase SSR cookie name follows the pattern `sb-<project-ref>-auth-token`. In Docker local environment, the ref is derived from the URL. The cookie value is a base64-encoded JSON: `base64({"access_token":"...","refresh_token":"...","expires_at":...})`. For chunked cookies (large tokens), Supabase splits into `sb-<ref>-auth-token.0`, `sb-<ref>-auth-token.1`, etc.

## R2: HTML Parsing Library

**Decision**: Use `node-html-parser` for server-side HTML parsing.

**Rationale**: Lightweight (no browser engine), fast parsing, supports CSS selectors for finding `<a>` tags and content areas. Already available in the Node.js ecosystem. No need for a full DOM implementation since we're doing text analysis and link extraction, not rendering.

**Alternatives considered**:

- `cheerio`: Heavier, jQuery-like API more than needed
- `jsdom`: Full DOM implementation, overkill for link extraction and text analysis
- `regex`: Fragile for HTML parsing, error-prone
- Built-in `DOMParser`: Not available in Node.js without browser environment

## R3: Dynamic Route ID Resolution

**Decision**: Query Supabase REST API with service_role key to fetch one valid ID per entity type before crawling.

**Rationale**: Dynamic routes like `/dashboard/leads/[id]` need real IDs from the seed data. The seed-diagnostic script creates deterministic UUIDv5 IDs, but they depend on the seed namespace. Querying the database at crawl time is more reliable than hardcoding IDs.

**Entities to resolve**:

- `leads` → first lead ID (for `/dashboard/leads/[id]`, `/api/leads/[id]`)
- `flows` → first flow ID (for `/dashboard/flows/[id]`, `/api/flows/[id]`)
- `conversations` → first conversation ID (for `/api/conversations/[id]/message`)
- `consultants` → consultant IDs for webhook routes (`/api/webhook/meta/[consultantId]`)
- `files` → first file ID (for `/api/files/[id]`)
- `crm_integrations` → first integration ID (for CRM routes)
- `follow_ups` → first follow-up ID (for `/api/follow-ups/[id]`)
- `message_templates` → first template ID (for `/api/templates/[id]`)

**Alternatives considered**:

- Hardcode UUIDv5 values: Brittle, breaks if seed changes
- Skip dynamic routes: Loses significant test coverage

## R4: Handling Next.js Server-Side Rendering

**Decision**: Accept that HTTP-level crawling captures SSR output but not client-side hydration. Document this as a known limitation.

**Rationale**: Next.js pages using Server Components return full HTML on first request. Client Components render on the server too (initial SSR). The crawler gets the initial HTML which is sufficient for:

- Detecting 200/404/500 status codes
- Finding TODO markers and placeholder text in rendered HTML
- Extracting `<a>` links from navigation elements
- Detecting empty content areas

What it misses:

- Client-side JavaScript errors after hydration
- Dynamic content loaded via `useEffect` or React Query
- Interactive elements that only appear after user action

This is acceptable for Phase 1 diagnostic. Visual/browser testing can be added later.

## R5: Redirect Handling Strategy

**Decision**: Use `fetch` with `redirect: 'manual'` to capture redirects, then follow manually.

**Rationale**: The middleware redirects unauthenticated users to `/auth/login` and authenticated users away from `/auth/*`. Using `redirect: 'manual'` lets us capture the 307 redirect response, record the redirect target, and then decide whether to follow it. This is essential for detecting "Acesso Negado Inesperado" - a redirect to login for an authenticated user indicates a problem.

**Alternatives considered**:

- `redirect: 'follow'` (default): Would hide the redirect, making it impossible to detect unexpected login redirects
- Custom HTTP client: Unnecessary when `fetch` supports manual redirect handling natively

## R6: Report Output Location

**Decision**: Write to `diagnostics/reports/01-link-crawler.md` (gitignored pattern for generated reports).

**Rationale**: The `diagnostics/reports/` directory already exists with `00-project-mapping.md`. Generated reports should be gitignored since they contain environment-specific data (timestamps, response times) that change on every run. The numbering convention (`01-`) follows the existing pattern.

**Implementation note**: Add `diagnostics/reports/01-*.md` to `.gitignore` or keep the report in the directory but track only the script, not its output. Actually, the existing `00-project-mapping.md` IS tracked, so we should also track `01-link-crawler.md` since it's a diagnostic artifact. The report will be committed as part of this feature's deliverable.
