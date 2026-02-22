# Tasks: Script de Seed para Diagnóstico

**Input**: Design documents from `/specs/003-diagnostic-seed-data/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli-contract.md, quickstart.md

**Tests**: Included — plan.md explicitly requires unit tests for helpers (safety guard, UUID generation, data generators).

**Organization**: Tasks grouped by user story. US1→US2 is strictly sequential (leads need consultants). US3 and US4 can run in parallel after US2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create file structure, configure npm script

- [x] T001 Install `uuid` as devDependency via `npm install --save-dev uuid @types/uuid` in package.json
- [x] T002 Create `scripts/seed-diagnostic.ts` with file skeleton: imports (`@supabase/supabase-js`, `uuid/v5`), type definitions (`SeedConsultant`, `SeedLead`, `SeedConfig`), empty `main()` with `process.exit`, and script entry point
- [x] T003 Add `"seed:diagnostic": "tsx scripts/seed-diagnostic.ts"` script to package.json

**Checkpoint**: File exists, compiles with `npx tsx --check scripts/seed-diagnostic.ts`, npm script registered.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on — safety guard, client init, helpers, data arrays

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Implement `assertLocalDatabase()` safety guard in `scripts/seed-diagnostic.ts` — read `SUPABASE_URL` from env, reject if contains `.supabase.co` OR does not contain `localhost`/`127.0.0.1`/`host.docker.internal`, exit with code 1 and clear error message per cli-contract.md
- [x] T005 Implement `createSupabaseClients()` in `scripts/seed-diagnostic.ts` — create admin client with `SUPABASE_SERVICE_ROLE_KEY` for auth operations and standard service-role client for data operations, validate env vars exist
- [x] T006 Implement `generateDeterministicId(seed: string): string` UUID v5 helper in `scripts/seed-diagnostic.ts` — define fixed namespace UUID constant `SEED_NAMESPACE`, generate deterministic UUIDs from string seeds (e.g., email) for idempotent ID generation
- [x] T007 Implement Brazilian data arrays in `scripts/seed-diagnostic.ts` — `FIRST_NAMES` (~40 names), `LAST_NAMES` (~30 surnames), `CITY_DDDS` (10 entries: `{city, ddd}` for SP/RJ/BH/CWB/POA/BSB/SSA/REC/FOR/BEL), `CITIES` array derived from CITY_DDDS
- [x] T008 Implement utility functions in `scripts/seed-diagnostic.ts` — `generateWhatsAppNumber(ddd: string): string` (format `+55{DDD}9XXXXXXXX`), `generateSlug(name: string): string` (lowercase, hyphenated, accents removed), `pickRandom<T>(array: T[]): T`, `pickRandomN<T>(array: T[], n: number): T[]`, `randomInt(min: number, max: number): number`
- [x] T009 Implement `main()` orchestrator skeleton in `scripts/seed-diagnostic.ts` — call `assertLocalDatabase()`, init clients, measure `performance.now()`, placeholder calls for each seed phase, print summary counts and elapsed time per cli-contract.md output format

**Checkpoint**: Script runs `npx tsx scripts/seed-diagnostic.ts`, passes safety check on local URL, initializes clients, prints empty summary. All helpers importable for tests.

---

## Phase 3: User Story 1 — Seed de Infraestrutura Base (Priority: P1) MVP

**Goal**: Create 6 auth users + 6 consultants with plan distribution (2 freemium + 2 pro + 1 agência + 1 admin)

**Independent Test**: Login as any of the 6 users, verify dashboard access. Admin sees `/admin` panel. Each consultant sees only their own (empty) data.

**Acceptance**: FR-001, FR-002, FR-003, FR-004, FR-010, FR-011, FR-016

### Implementation for User Story 1

- [x] T010 [US1] Define `CONSULTANT_CONFIGS` array in `scripts/seed-diagnostic.ts` — 6 entries with email (`consultor{N}@seed.local`), password (`seed123456`), name (Brazilian), plan (`freemium`/`pro`/`agencia`), credits, `monthly_credits_allocation`, `is_admin` flag, whatsapp_number, city, ddd — per data-model.md Plan Distribution Table
- [x] T011 [US1] Implement `seedAuthUsers(adminClient)` in `scripts/seed-diagnostic.ts` — iterate `CONSULTANT_CONFIGS`, call `supabase.auth.admin.createUser({ email, password, email_confirm: true })` with try/catch for existing users (409 status), generate deterministic user ID via `generateDeterministicId(email)`, return map of email→userId
- [x] T012 [US1] Implement `seedConsultants(client, userIdMap)` in `scripts/seed-diagnostic.ts` — build 6 consultant records with deterministic IDs, plan-specific credits/allocation per data-model.md, settings JSONB with notifications and preferences, slug from name, `ON CONFLICT (email) DO NOTHING` via upsert, return array of created consultant records
- [x] T013 [US1] Wire `seedAuthUsers()` and `seedConsultants()` into `main()` in `scripts/seed-diagnostic.ts` — call sequentially, pass userId map, log progress with emoji prefixes per cli-contract.md, track counts for summary

**Checkpoint**: `npx tsx scripts/seed-diagnostic.ts` creates 6 auth.users + 6 consultants. Re-run produces no duplicates. `SELECT count(*), subscription_plan FROM consultants WHERE email LIKE '%@seed.local' GROUP BY subscription_plan` returns 3 freemium, 2 pro, 1 agencia.

---

## Phase 4: User Story 2 — Seed de Leads com Distribuição Realista (Priority: P1)

**Goal**: Create 75 leads (15 per consultant) distributed across all 6 funnel stages with correlated scores and health metadata

**Independent Test**: Dashboard shows leads in all status stages. CSV export returns 15 per consultant. Score distribution correlates with status.

**Acceptance**: FR-005, FR-006, FR-007, FR-010, FR-012

**Depends on**: US1 (needs consultant IDs)

### Implementation for User Story 2

- [x] T014 [US2] Define status/score distribution constants in `scripts/seed-diagnostic.ts` — `STATUS_DISTRIBUTION` array per data-model.md: 3 novo (0–20), 3 em_contato (20–45), 3 qualificado (60–85), 2 agendado (50–75), 2 fechado (80–100), 2 perdido (0–30). Define `METADATA_OPTIONS` for perfil/faixa_etaria/coparticipacao values.
- [x] T015 [US2] Implement `generateLeadMetadata(): object` in `scripts/seed-diagnostic.ts` — return `{ perfil, faixa_etaria, coparticipacao }` with random values from defined options, ensuring all 4 perfil values and 4 faixa_etaria values appear across the 75 leads
- [x] T016 [US2] Implement `seedLeads(client, consultants)` in `scripts/seed-diagnostic.ts` — for each consultant, generate 15 leads with: unique WhatsApp numbers (using consultant's city DDD), Brazilian names from arrays, derived email, status from distribution, score within status range, metadata JSONB, source (`'whatsapp'` or `'manual'`), staggered `created_at` over past 30 days, `last_contacted_at` for non-novo leads. Use `ON CONFLICT (consultant_id, whatsapp_number) DO NOTHING`. Return all created lead records.
- [x] T017 [US2] Wire `seedLeads()` into `main()` in `scripts/seed-diagnostic.ts` — call after consultants, log progress, track counts

**Checkpoint**: `npx tsx scripts/seed-diagnostic.ts` creates 75 leads. `SELECT status, count(*) FROM leads WHERE consultant_id IN (...seed consultants...) GROUP BY status` shows all 6 statuses. Scores correlate with status.

---

## Phase 5: User Story 3 — Seed de Conversas e Mensagens (Priority: P2)

**Goal**: Create 150 conversations (2 per lead) linked to default health flow, with 450+ messages alternating inbound/outbound in Portuguese

**Independent Test**: Lead detail screen shows 2 conversations with message history. `message_count` matches actual messages per conversation.

**Acceptance**: FR-008, FR-009, FR-010, FR-012

**Depends on**: US2 (needs lead IDs)

### Implementation for User Story 3

- [x] T018 [US3] Implement `lookupDefaultFlow(client)` in `scripts/seed-diagnostic.ts` — query `flows` table `WHERE is_default = true AND vertical = 'saude'`, return flow ID or exit with error message per cli-contract.md if not found
- [x] T019 [US3] Define message content template arrays in `scripts/seed-diagnostic.ts` — `OUTBOUND_MESSAGES` (bot questions: greeting, perfil question, idade question, coparticipacao question, recommendation, closing — in Portuguese), `INBOUND_RESPONSES` (lead answers per step: perfil options, idade options, coparticipacao options — in Portuguese), per data-model.md message templates
- [x] T020 [US3] Implement `seedConversations(client, leads, flowId)` in `scripts/seed-diagnostic.ts` — for each lead create 2 conversations: first with `status='completed'`, `completion_percentage=100`, `current_step_id='finalizar'`, `completed_at` set, state JSONB with responses matching lead metadata; second with varied status (`active`/`completed`/`abandoned`), partial completion (30–80%). Use idempotency check: only insert if lead has < 2 conversations. Return all conversation records.
- [x] T021 [US3] Implement `seedMessages(client, conversations)` in `scripts/seed-diagnostic.ts` — for each conversation create 3–5 messages: alternate `outbound` (bot) / `inbound` (lead) directions, content from template arrays matching conversation step progression, `status='delivered'` for outbound / `'read'` for inbound, sequential `created_at` timestamps within conversation timeframe, `is_ai_generated=true` for outbound. Use idempotency: only insert if conversation `message_count` < expected.
- [x] T022 [US3] Wire `lookupDefaultFlow()`, `seedConversations()`, `seedMessages()` into `main()` in `scripts/seed-diagnostic.ts` — call sequentially after leads, log progress, track counts

**Checkpoint**: 150 conversations created. Each has 3–5 messages. `SELECT c.id, c.message_count, count(m.id) FROM conversations c LEFT JOIN messages m ON m.conversation_id = c.id GROUP BY c.id` shows consistent counts.

---

## Phase 6: User Story 4 — Seed de Follow-ups e Templates (Priority: P3)

**Goal**: Create 30+ follow-ups across lead subsets and 15+ message templates (3 per consultant) in distinct categories

**Independent Test**: Follow-up screen shows entries in pending/sent/completed/cancelled states. Template screen shows 3 templates per consultant in greeting/follow_up/qualification categories.

**Acceptance**: FR-013, FR-014, FR-010, FR-012

**Depends on**: US2 (follow-ups need lead IDs), US1 (templates need consultant IDs)

### Implementation for User Story 4

- [x] T023 [P] [US4] Implement `seedFollowUps(client, leads, consultants)` in `scripts/seed-diagnostic.ts` — select ~40% of leads (30+), create 1 follow-up each with: title `"Retorno - {lead_name}"`, Portuguese message content, status distribution (10 pending/8 sent/8 completed/4 cancelled per data-model.md), `scheduled_at` in future for pending and past for others, `is_automatic=false`, respect `valid_scheduled_at` constraint (`scheduled_at > created_at`). Use deterministic UUIDs for idempotency.
- [x] T024 [P] [US4] Implement `seedMessageTemplates(client, consultants)` in `scripts/seed-diagnostic.ts` — for each consultant create 3 templates: `greeting` ("Boas-vindas"), `follow_up` ("Retorno semanal"), `qualification` ("Qualificação inicial") with Portuguese content per data-model.md examples, variables `['{{nome_lead}}', '{{nome_consultor}}']`, `is_active=true`. Respect name length (3–100) and content length (10–1000) constraints. Use deterministic UUIDs for idempotency.
- [x] T025 [US4] Wire `seedFollowUps()` and `seedMessageTemplates()` into `main()` in `scripts/seed-diagnostic.ts` — call after conversations (or in parallel if leads/consultants available), log progress, track counts

**Checkpoint**: 30+ follow-ups across 4 statuses. 15+ templates (3 per consultant, 3 categories). `SELECT status, count(*) FROM follow_ups GROUP BY status` and `SELECT category, count(*) FROM message_templates GROUP BY category` show expected distributions.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Unit tests, validation, final cleanup

- [x] T026 [P] Create unit tests for foundational helpers in `tests/unit/seed-diagnostic.test.ts` — test `assertLocalDatabase()` (passes for localhost, rejects supabase.co), `generateDeterministicId()` (same input → same output, different input → different output), `generateWhatsAppNumber()` (matches `^\+55[0-9]{11}$`), `generateSlug()` (lowercase, no accents, hyphenated)
- [x] T027 [P] Create unit tests for data generators in `tests/unit/seed-diagnostic.test.ts` — test status/score correlation (fechado score > novo score), metadata generator (all fields present, valid values), lead distribution (15 per consultant, all 6 statuses), follow-up constraint (`scheduled_at > created_at`)
- [x] T028 Add final summary verification to `main()` in `scripts/seed-diagnostic.ts` — after all seed phases, query actual counts from database and compare against expected (6 auth users, 6 consultants, 75 leads, 150 conversations, 450+ messages, 30+ follow-ups, 15+ templates), warn if any count is below expected
- [ ] T029 Run full script locally via `npx tsx scripts/seed-diagnostic.ts` and verify output matches cli-contract.md expected format, verify idempotency by running 3 times consecutively, verify quickstart.md SQL queries return expected results (REQUIRES local Supabase running)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ─────────────────────────────────────────────┐
                                                            │
Phase 2: Foundational (safety, clients, helpers) ───────────┤
                                                            │
Phase 3: US1 - Auth Users & Consultants (P1) ──────────────┤
                                                            │
Phase 4: US2 - Leads (P1) ─────────────────────────────────┤
                                                     ┌──────┤
Phase 5: US3 - Conversations & Messages (P2) ───────┤      │
Phase 6: US4 - Follow-ups & Templates (P3) ─────────┘      │
                                                            │
Phase 7: Polish & Tests ────────────────────────────────────┘
```

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 (Foundational). **BLOCKS** US2, US3, US4.
- **US2 (P1)**: Depends on US1 (needs consultant IDs). **BLOCKS** US3, US4.
- **US3 (P2)**: Depends on US2 (needs lead IDs). Independent of US4.
- **US4 (P3)**: Depends on US2 (follow-ups need leads) + US1 (templates need consultants). Independent of US3.
- **US3 and US4 can run in parallel** after US2 completes.

### Within Each User Story

1. Data generators / constants defined first
2. Seed functions implemented
3. Wired into `main()` orchestrator
4. Verified at checkpoint

### Parallel Opportunities

- **Phase 2**: T007 (data arrays) and T008 (utilities) could be written in parallel with T004–T006
- **Phase 6**: T023 (follow-ups) and T024 (templates) are in different functions — marked [P]
- **Phase 7**: T026 (helper tests) and T027 (generator tests) are in the same file but independent test blocks — marked [P]
- **US3 and US4** can run in parallel after US2 checkpoint

---

## Parallel Example: After US2 Completes

```bash
# US3 and US4 can start simultaneously:
Task: "Implement lookupDefaultFlow() in scripts/seed-diagnostic.ts"          # US3
Task: "Implement seedFollowUps() in scripts/seed-diagnostic.ts"              # US4
Task: "Implement seedMessageTemplates() in scripts/seed-diagnostic.ts"       # US4

# Tests can run in parallel with polish:
Task: "Create unit tests for foundational helpers in tests/unit/seed-diagnostic.test.ts"
Task: "Create unit tests for data generators in tests/unit/seed-diagnostic.test.ts"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T009)
3. Complete Phase 3: US1 — Auth Users & Consultants (T010–T013)
4. **STOP and VALIDATE**: Login as all 6 users, verify admin panel access, check plan distribution
5. Deploy seed for immediate diagnostic use (consultants exist, dashboards load)

### Incremental Delivery

1. Setup + Foundational → Script runs, safety verified
2. + US1 → 6 users loginable, dashboard accessible (MVP!)
3. + US2 → 75 leads visible, analytics populated, CSV export works
4. + US3 → Conversation history visible, message counts correct
5. + US4 → Follow-ups and templates screens populated
6. + Polish → Tests pass, idempotency verified 3x, counts validated

### Single Developer (Recommended)

Execute phases sequentially: 1 → 2 → 3 → 4 → 5 → 6 → 7. Each phase builds directly on the previous. Stop at any checkpoint to validate. Since this is a single-file script, parallel execution within phases is limited.

---

## Notes

- All implementation tasks target a single file: `scripts/seed-diagnostic.ts`
- Tests target `tests/unit/seed-diagnostic.test.ts` — must export helpers from main script for testability
- [P] tasks = different functions/sections, no blocking dependencies
- [Story] label maps task to specific user story for traceability
- Commit after each phase completion (not individual tasks, since all touch same file)
- Stop at any checkpoint to validate the story independently
- Idempotency must be verified at every checkpoint (run twice, check no duplicates)
