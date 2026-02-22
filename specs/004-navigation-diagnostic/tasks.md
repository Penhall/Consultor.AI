# Tasks: Navigation Diagnostic & Link Crawler

**Input**: Design documents from `/specs/004-navigation-diagnostic/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Unit tests included in Polish phase (plan.md specifies tests for classifiers, route-registry, and report-generator).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Diagnostics scripts**: `diagnostics/scripts/` (CLI entry points)
- **Diagnostics lib**: `diagnostics/lib/` (modules)
- **Reports output**: `diagnostics/reports/` (generated Markdown)
- **Tests**: `tests/unit/` (consistent with existing project structure)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure, install dependencies, add npm script

- [x] T001 Create diagnostics directory structure: `diagnostics/scripts/`, `diagnostics/lib/`, ensure `diagnostics/reports/` exists
- [x] T002 Install `node-html-parser` dependency via `npm install node-html-parser`
- [x] T003 Add `diagnostic:crawl` npm script to `package.json` (`"diagnostic:crawl": "npx tsx diagnostics/scripts/link-crawler.ts"`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and authentication module used by ALL user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Define all TypeScript types (CrawlResult, RouteDefinition, SeedIds, DiagnosticReport, BrokenLink, SkippedRoute, ContentCategory) in `diagnostics/lib/types.ts` per data-model.md
- [x] T005 Implement Supabase authentication helper in `diagnostics/lib/auth.ts`: login via GoTrue REST API (`POST http://127.0.0.1:54321/auth/v1/token?grant_type=password`), return access_token + refresh_token, format Supabase SSR session cookies (base64-encoded JSON for `sb-*-auth-token`), support both admin (`consultor0@seed.local`) and consultant (`consultor1@seed.local`) credentials per research.md R1

**Checkpoint**: Types and auth ready - user story implementation can begin

---

## Phase 3: User Story 1 - Role-Based Route Crawling (Priority: P1) MVP

**Goal**: Authenticate as admin and consultant, crawl all 26 page routes and 38 API routes, record HTTP status, response time, and content type for each.

**Independent Test**: Run the crawler against Docker environment and verify it produces a list of all routes with HTTP status codes and response times for both roles.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create route registry with all 26 page routes and 38 API GET routes in `diagnostics/lib/route-registry.ts` — each entry has: path, type (page/api), method, requiresAuth, adminOnly, dynamicParams, description. Include all routes from plan.md. Mark POST/PUT/DELETE-only routes as skipped.
- [x] T007 [P] [US1] Implement HTTP crawler module in `diagnostics/lib/crawler.ts` — fetch with 10-second timeout via AbortController, `redirect: 'manual'` to capture redirects (research.md R5), record statusCode + responseTimeMs + contentType + redirectTo. Return CrawlResult for each request.
- [x] T008 [US1] Implement seed ID resolver function in `diagnostics/lib/crawler.ts` — query Supabase REST API with service_role key to fetch first valid ID for each entity (leads, flows, conversations, consultants, files, crm_integrations, follow_ups, message_templates). Return SeedIds object. Handle missing entities gracefully (null).
- [x] T009 [US1] Create main entry point in `diagnostics/scripts/link-crawler.ts` — (1) preflight health check via `GET http://127.0.0.1:3000/api/health`, (2) authenticate as admin and consultant via auth.ts, (3) resolve seed IDs, (4) for each role: resolve dynamic params in route registry using SeedIds, crawl all routes using crawler.ts, collect CrawlResult[]. Print progress to console.

**Checkpoint**: At this point, running `npm run diagnostic:crawl` should authenticate, crawl all routes, and print status codes to console for both roles.

---

## Phase 4: User Story 2 - Content Quality Analysis (Priority: P2)

**Goal**: Analyze response bodies to detect placeholder content, TODO markers, empty pages, and empty API responses.

**Independent Test**: Run the crawler and verify it detects known placeholder patterns (TODO, Lorem ipsum, empty content) and classifies routes correctly.

### Implementation for User Story 2

- [x] T010 [US2] Implement HTML content classifier in `diagnostics/lib/content-classifier.ts` — detect: TODO/FIXME/HACK/XXX markers in text content, "Lorem ipsum"/"Coming soon"/"Placeholder" text, empty `<main>` or `<body>` with only wrapper divs, pages with very little text content (<50 chars visible text). Return contentFlags array and category classification.
- [x] T011 [US2] Implement JSON content classifier in `diagnostics/lib/content-classifier.ts` — detect empty arrays `[]`, null data fields, empty objects `{}`, stub/mock responses. Return contentFlags array.
- [x] T012 [US2] Integrate content classifier into crawler flow in `diagnostics/scripts/link-crawler.ts` — after each crawl result, run classifier on response body to set category (funcionando/quebrado/placeholder/acesso_negado) and contentFlags on CrawlResult. Apply classification rules from plan.md Content Classification table.

**Checkpoint**: At this point, each CrawlResult has a category and contentFlags. Console output shows classification alongside status codes.

---

## Phase 5: User Story 3 - Diagnostic Report Generation (Priority: P2)

**Goal**: Generate structured Markdown report at `diagnostics/reports/01-link-crawler.md` with 4 categories + summary.

**Independent Test**: Run the crawler and verify report file is created at correct path, contains all 4 category sections, summary table, and every crawled route.

### Implementation for User Story 3

- [x] T013 [US3] Implement Markdown report generator in `diagnostics/lib/report-generator.ts` — generate report with sections: header (date, environment, roles), Resumo summary table (per-category + per-role counts), Funcionando section, Quebrado section, Placeholder section, Acesso Negado Inesperado section, Rotas Não Testadas section. Each route entry: URL, method, status, response time, role, notes. Follow format from plan.md Report Format.
- [x] T014 [US3] Integrate report generation into main script in `diagnostics/scripts/link-crawler.ts` — after crawling both roles, call report generator with all CrawlResult[] and SkippedRoute[]. Write output to `diagnostics/reports/01-link-crawler.md`. Print summary to console.

**Checkpoint**: At this point, running the crawler produces a complete Markdown report with all 4 categories and summary table.

---

## Phase 6: User Story 4 - Internal Link Validation (Priority: P3)

**Goal**: Extract `<a href>` internal links from HTML pages and verify they are reachable, detecting broken navigation.

**Independent Test**: Run the crawler and verify it finds internal links from rendered pages, follows them, and reports any that return 404 or unexpected errors.

### Implementation for User Story 4

- [x] T015 [US4] Implement link extractor in `diagnostics/lib/link-extractor.ts` — parse HTML with node-html-parser, find all `<a href>` attributes, filter to internal links only (same host, starts with `/`), deduplicate, return array of `{ sourcePath, targetPath, linkText }`.
- [x] T016 [US4] Add internal link validation to main script in `diagnostics/scripts/link-crawler.ts` — for each role, after page crawling, extract internal links from all successfully rendered pages, follow each unique link using crawler.ts, collect BrokenLink[] for links returning 404/500 or unexpected redirects to login.
- [x] T017 [US4] Add "Links Internos Quebrados" section to report generator in `diagnostics/lib/report-generator.ts` — table with columns: source page, target URL, link text, status code, role.

**Checkpoint**: Full diagnostic complete — all routes crawled, content analyzed, report generated, internal links validated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Unit tests, console UX improvements, final validation

- [x] T018 [P] Write unit tests for content-classifier in `tests/unit/content-classifier.test.ts` — test HTML placeholder detection (TODO, Lorem ipsum, empty content), JSON empty response detection, edge cases (no body, binary content)
- [x] T019 [P] Write unit tests for route-registry in `tests/unit/route-registry.test.ts` — test all routes are registered, dynamic params are defined, no duplicate paths, page vs API counts match expected (26 pages, 38 API routes)
- [x] T020 [P] Write unit tests for report-generator in `tests/unit/report-generator.test.ts` — test Markdown output format, summary table generation, all 4 categories present, handles empty categories gracefully
- [x] T021 Run full diagnostic against Docker environment (`npm run diagnostic:crawl`) and verify report at `diagnostics/reports/01-link-crawler.md`
- [x] T022 Verify no data was modified (compare DB record counts before and after crawl per SC-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001, T002) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (T004, T005) — core crawling
- **User Story 2 (Phase 4)**: Depends on US1 (T009 creates the crawl loop that US2 integrates into)
- **User Story 3 (Phase 5)**: Depends on US2 (T012 produces classified CrawlResults that the report groups)
- **User Story 4 (Phase 6)**: Depends on US1 (T009 provides crawler infrastructure); can run in parallel with US2/US3 but report integration (T017) depends on US3 (T013)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 (P2)**: Depends on US1 (needs CrawlResult from crawler loop to classify)
- **US3 (P2)**: Depends on US2 (needs classified CrawlResults to group into report categories)
- **US4 (P3)**: Depends on US1 (needs crawler infrastructure) + US3 (report generator for broken links section)

### Within Each User Story

- Types defined before implementations
- Modules (lib/) before integrations (scripts/)
- Core logic before console output

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 are sequential (T003 depends on package.json)
- **Phase 2**: T004 and T005 can run in parallel [P] (different files)
- **Phase 3**: T006 and T007 can run in parallel [P] (different files, no cross-dependency)
- **Phase 4**: T010 and T011 are sequential (same file: content-classifier.ts)
- **Phase 7**: T018, T019, T020 can all run in parallel [P] (different test files)

---

## Parallel Example: User Story 1

```bash
# Launch route registry and crawler in parallel (different files):
Task: "Create route registry in diagnostics/lib/route-registry.ts"       # T006
Task: "Implement HTTP crawler in diagnostics/lib/crawler.ts"             # T007

# Then sequentially:
Task: "Implement seed ID resolver in diagnostics/lib/crawler.ts"         # T008 (same file as T007)
Task: "Create main entry point in diagnostics/scripts/link-crawler.ts"   # T009 (depends on T006, T007, T008)
```

## Parallel Example: Polish Phase

```bash
# Launch all unit tests in parallel (different files):
Task: "Unit tests for content-classifier in tests/unit/content-classifier.test.ts"  # T018
Task: "Unit tests for route-registry in tests/unit/route-registry.test.ts"          # T019
Task: "Unit tests for report-generator in tests/unit/report-generator.test.ts"      # T020
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T005)
3. Complete Phase 3: User Story 1 (T006-T009)
4. **STOP and VALIDATE**: Run `npm run diagnostic:crawl` — should authenticate, crawl all routes, print status codes
5. Delivers: full route inventory with HTTP status for both roles

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 → Route crawling works → Can see which routes return 200/404/500
3. Add US2 → Content analysis → Crawler now detects placeholders and empty pages
4. Add US3 → Report generation → Full Markdown report with 4 categories
5. Add US4 → Link validation → Broken internal links detected
6. Polish → Unit tests + final validation run

### Sequential Strategy (Single Developer)

1. T001 → T002 → T003 (Setup)
2. T004 ∥ T005 (Foundational — parallel)
3. T006 ∥ T007 → T008 → T009 (US1 — route registry and crawler parallel, then sequential)
4. T010 → T011 → T012 (US2 — sequential, same file)
5. T013 → T014 (US3 — sequential)
6. T015 → T016 → T017 (US4 — sequential)
7. T018 ∥ T019 ∥ T020 → T021 → T022 (Polish — tests parallel, then validation)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Total: 22 tasks across 7 phases
- The report (`diagnostics/reports/01-link-crawler.md`) will be committed as a diagnostic artifact
- Seed credentials: `consultor0@seed.local` (admin), `consultor1@seed.local` (consultant), password: `seed123456`
- Docker environment must be running for US1+ (Phases 1-2 are code-only)
