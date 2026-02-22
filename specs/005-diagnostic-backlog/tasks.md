# Tasks: Consolidated Diagnostic Backlog

**Input**: Design documents from `/specs/005-diagnostic-backlog/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not applicable — this feature generates a Markdown report only. Validation is manual (checklist-based).

**Organization**: Tasks are grouped by user story to enable incremental writing of each backlog section.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different sections, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Read and analyze source diagnostic reports

- [x] T001 Read and analyze diagnostics/reports/00-project-mapping.md — extract: route observations, missing providers, RLS assessment, security layers, duplicated routes
- [x] T002 Read and analyze diagnostics/reports/01-link-crawler.md — extract: "Acesso Negado Inesperado" root causes, "Quebrado" items, "Links Internos Quebrados" unique links, "Placeholder" count
- [x] T003 Create report skeleton with header, data sources section, and empty section headings in diagnostics/reports/02-backlog.md

---

## Phase 2: Foundational (Report Structure)

**Purpose**: Write the report header and data sources section that all user stories reference

**⚠️ CRITICAL**: Sections reference source data — T001 and T002 must be complete

- [x] T004 Write "Dados de Origem" section in diagnostics/reports/02-backlog.md listing both source reports with filenames, paths, generation dates, and report types

**Checkpoint**: Report skeleton ready — section writing can begin

---

## Phase 3: User Story 1 - Backlog de Correções Críticas (Priority: P1) 🎯 MVP

**Goal**: Document all problems that block the main user flow (login → dashboard → manage leads)

**Independent Test**: Verify the "Críticos" section contains: auth cookie root cause item (72 routes), broken seed items (2 entities), API auth propagation analysis — each with ID, description, affected role, effort, and solution

### Implementation for User Story 1

- [x] T005 [US1] Write BL-001: Auth cookie SSR not recognized by middleware — describe root cause affecting 17 page routes (307 redirect to login) for both admin and consultant roles, effort G, solution suggestion in diagnostics/reports/02-backlog.md
- [x] T006 [US1] Write BL-002: API routes return 401 for authenticated users — describe 20 API endpoints unreachable for admin role + 18 for consultant role due to same auth cookie issue, effort G (same root cause as BL-001), solution suggestion in diagnostics/reports/02-backlog.md
- [x] T007 [US1] Write BL-003: Missing seed data for fileId entity — /api/files/[id] marked as "Quebrado" for both roles because no file record exists in seed, effort P, solution: add file upload to seed-diagnostic.ts in diagnostics/reports/02-backlog.md
- [x] T008 [US1] Write BL-004: Missing seed data for crmIntegrationId entity — /api/integrations/crm/[id] marked as "Quebrado" for both roles, effort P, solution: add CRM integration to seed-diagnostic.ts in diagnostics/reports/02-backlog.md

**Checkpoint**: "Críticos" section complete — 4 items documenting all blockers

---

## Phase 4: User Story 2 - Backlog de Links Quebrados e Páginas Ausentes (Priority: P2)

**Goal**: Document all broken internal links and missing pages found by the crawler

**Independent Test**: Verify the "Links Quebrados" section contains all 4 unique broken links from the crawl report, each with source page, destination, link text, HTTP status, and suggested fix

### Implementation for User Story 2

- [x] T009 [US2] Write BL-005: Link /auth/signup returns 404 — linked from landing page "/" with text "Começar Gratuitamente", correct page is /auth/register, effort P, solution: fix href in landing page CTA in diagnostics/reports/02-backlog.md
- [x] T010 [US2] Write BL-006: Page /termos does not exist (404) — linked from landing page footer "Termos de Uso", LGPD compliance requirement, effort M, solution: create static terms of use page in diagnostics/reports/02-backlog.md
- [x] T011 [US2] Write BL-007: Page /privacidade does not exist (404) — linked from landing page footer "Política de Privacidade", LGPD compliance requirement, effort M, solution: create static privacy policy page in diagnostics/reports/02-backlog.md
- [x] T012 [US2] Write BL-008: Link /dashboard from /checkout redirects (302) — "Voltar ao Dashboard" link on checkout page redirects to login due to auth issue (cross-ref BL-001), effort P (resolved when BL-001 is fixed) in diagnostics/reports/02-backlog.md

**Checkpoint**: "Links Quebrados" section complete — 4 items covering all broken links

---

## Phase 5: User Story 3 - Backlog de Melhorias e Implementações Pendentes (Priority: P3)

**Goal**: Document tenant isolation assessment, placeholder status, UX improvements, and future roadmap items

**Independent Test**: Verify sections for "Isolamento de Dados", "Páginas Placeholder", "Melhorias de UX", and "Roadmap Futuro" are all present with appropriate content

### Implementation for User Story 3

- [x] T013 [P] [US3] Write "Isolamento de Dados entre Tenants" section — assess RLS coverage from 00-project-mapping.md section 6.1 (6 defense layers), document that RLS is active on all tables, note that auth issue (BL-001) is the primary isolation concern, cross-ref BL-001 in diagnostics/reports/02-backlog.md
- [x] T014 [P] [US3] Write "Páginas Placeholder" section — document that crawler found 0 placeholder routes (category count = 0), note all pages either return real content or redirect, mark section as clean in diagnostics/reports/02-backlog.md
- [x] T015 [US3] Write BL-009: Route duplication /dashboard/flows vs /dashboard/fluxos — both routes coexist (EN vs PT-BR naming), effort M, solution: consolidate to single route with redirect from deprecated path in diagnostics/reports/02-backlog.md
- [x] T016 [US3] Write BL-010: Landing page CTA inconsistency — "Começar Gratuitamente" links to /auth/signup (doesn't exist) instead of /auth/register, while "Cadastrar" correctly links to /cadastro, effort P in diagnostics/reports/02-backlog.md
- [x] T017 [US3] Write BL-011: Admin API routes return 401 for admin user — /api/admin/stats and /api/admin/users should be accessible to admin but return 401, same root cause as BL-001 but specific to admin-only routes, cross-ref BL-001 in diagnostics/reports/02-backlog.md
- [x] T018 [US3] Write "Roadmap Futuro" section — list 5 Phase 5 items from 00-project-mapping.md section 5.2: HubSpot provider, Agendor provider, Vertical Imóveis, Voice Cloning, Image Generation — no effort estimate, reference only in diagnostics/reports/02-backlog.md

**Checkpoint**: All 5 main sections + Roadmap Futuro complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize report with executive summary and validation

- [x] T019 Write "Resumo Executivo" section at top of diagnostics/reports/02-backlog.md — count items per category (Críticos: 4, Isolamento: 1 assessment, Placeholder: 0 items, Links Quebrados: 4, Melhorias UX: 3), count per effort level (P/M/G), total actionable items
- [x] T020 Validate completeness — cross-check every issue from 01-link-crawler.md (72 access denied, 4 broken, 0 placeholder, 8 broken links) and every observation from 00-project-mapping.md (5 notes, 5 future items) against 02-backlog.md items
- [x] T021 Final review of diagnostics/reports/02-backlog.md — verify all BL-XXX items have 5 required fields (ID, description, affected role, effort, solution), verify resumo executivo counts match, verify markdown formatting

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — read source reports
- **Foundational (Phase 2)**: Depends on Setup (T001, T002) — report skeleton
- **User Story 1 (Phase 3)**: Depends on Phase 2 — "Críticos" section
- **User Story 2 (Phase 4)**: Depends on Phase 2 — "Links Quebrados" section
- **User Story 3 (Phase 5)**: Depends on Phase 2 — remaining sections
- **Polish (Phase 6)**: Depends on all user stories — resumo executivo needs final counts

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Phase 2. MVP — documents the main blocker.
- **User Story 2 (P2)**: Independent after Phase 2. Can run in parallel with US1.
- **User Story 3 (P3)**: Independent after Phase 2. Can run in parallel with US1/US2. Contains cross-references to US1 items.

### Parallel Opportunities

- T001 and T002 can run in parallel (reading different source reports)
- T005-T008 (US1) and T009-T012 (US2) can run in parallel (different sections)
- T013 and T014 (US3) can run in parallel (different sections)
- All user story phases can start simultaneously after Phase 2

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Read source reports (T001-T002)
2. Complete Phase 2: Create report skeleton (T003-T004)
3. Complete Phase 3: Write "Críticos" section (T005-T008)
4. **STOP and VALIDATE**: Verify 4 critical items are documented with all required fields
5. This alone provides the highest-value output (auth blocker documentation)

### Full Delivery

1. Setup + Foundational → Report skeleton ready
2. US1: Críticos → 4 items documenting flow-blocking issues
3. US2: Links Quebrados → 4 items documenting broken navigation
4. US3: Isolamento + Placeholder + UX + Roadmap → Remaining sections
5. Polish: Resumo Executivo + validation → Complete report

---

## Notes

- All tasks write to a single file: `diagnostics/reports/02-backlog.md`
- Since all tasks target the same file, true parallel execution requires section-by-section assembly
- In practice, execute sequentially within each phase for clean file writes
- The [P] marker on US3 tasks indicates conceptual independence, not file-level parallelism
- Total estimated backlog items: 11 actionable (BL-001 through BL-011) + 5 roadmap reference items
- Commit after completing each phase checkpoint
