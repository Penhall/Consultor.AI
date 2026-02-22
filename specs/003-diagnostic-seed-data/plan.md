# Implementation Plan: Script de Seed para Diagnóstico

**Branch**: `003-diagnostic-seed-data` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-diagnostic-seed-data/spec.md`

## Summary

Create a single TypeScript seed script (`scripts/seed-diagnostic.ts`) that populates the local Supabase database with realistic Brazilian test data for diagnostic purposes. The script creates 6 auth users via Supabase Admin SDK, 6 consultants across 3 plans, 75 leads with full funnel distribution, 150 conversations with 450+ messages, 30+ follow-ups, and 15+ message templates. Uses UUID v5 for deterministic IDs and `ON CONFLICT DO NOTHING` for idempotency. Includes a production safety guard checking `SUPABASE_URL` hostname.

## Technical Context

**Language/Version**: TypeScript 5.3 (executed via `npx tsx`)
**Primary Dependencies**: `@supabase/supabase-js` (already installed), `uuid` (for v5 generation — new dev dependency)
**Storage**: PostgreSQL via Supabase (local instance only)
**Testing**: Vitest — unit tests for helper functions (UUID generation, data generators, safety check)
**Target Platform**: Node.js CLI script (local development only)
**Project Type**: Single script within existing web project
**Performance Goals**: Complete execution < 30 seconds on local database
**Constraints**: Must not modify schema, must respect all constraints (FKs, UNIQUEs, CHECKs, RLS), must be idempotent
**Scale/Scope**: 6 users, 75 leads, 150 conversations, 450+ messages, 30+ follow-ups, 15+ templates (~720+ total records)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | PASS | TypeScript strict mode, English code, no `any` |
| II. Test-Driven Development | PASS | Unit tests for helpers and generators |
| III. User Experience Consistency | N/A | CLI script, no UI |
| IV. Performance and Scalability | PASS | < 30s execution target |
| V. Security and Compliance | PASS | Production safety guard, no sensitive data |
| VI. Architecture and Modularity | PASS | Single script, no architecture changes |
| VII. Documentation and Maintainability | PASS | quickstart.md covers usage |
| VIII. Development Workflow | PASS | Feature branch, conventional commits |

### Post-Design Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | PASS | Deterministic UUIDs, explicit types, error handling |
| II. Test-Driven Development | PASS | Test safety guard, UUID generation, data distributions |
| III. User Experience Consistency | N/A | No UI changes |
| IV. Performance and Scalability | PASS | Batch inserts, single transaction where possible |
| V. Security and Compliance | PASS | Dual hostname check prevents production execution |
| VI. Architecture and Modularity | PASS | No changes to existing architecture |
| VII. Documentation and Maintainability | PASS | data-model.md + quickstart.md + inline JSDoc |
| VIII. Development Workflow | PASS | Branch `003-diagnostic-seed-data` |

**Gate Result**: PASS — No violations. Proceed to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/003-diagnostic-seed-data/
├── plan.md              # This file
├── research.md          # Phase 0: Research decisions (R1-R6)
├── data-model.md        # Phase 1: Entity model with distributions
├── quickstart.md        # Phase 1: How to run the seed
├── contracts/           # Phase 1: CLI interface contract
│   └── cli-contract.md  # Expected inputs, outputs, exit codes
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
scripts/
└── seed-diagnostic.ts     # Main seed script (single file)

tests/
└── unit/
    └── seed-diagnostic.test.ts  # Unit tests for helpers

package.json               # Add "seed:diagnostic" script + uuid dev dependency
```

**Structure Decision**: Single script in the existing `scripts/` directory. This follows the project convention (scripts at root level) and keeps the implementation minimal — one TypeScript file with all logic self-contained. Tests in `tests/unit/` following existing test organization.

## Implementation Approach

### Phase 1: Safety & Infrastructure

1. **Production safety guard** — Check `SUPABASE_URL` against localhost patterns. Abort with clear error if non-local.
2. **Supabase client initialization** — Create admin client using `SUPABASE_SERVICE_ROLE_KEY` for auth user creation, and standard client for data operations.
3. **UUID v5 namespace** — Define a fixed namespace UUID for deterministic ID generation from seed strings.

### Phase 2: Auth Users & Consultants

4. **Create 6 auth users** via `supabase.auth.admin.createUser()` with try/catch for existing users.
5. **Create 6 consultants** with plan distribution (2 freemium + 2 pro + 1 agência + 1 admin/freemium) using `ON CONFLICT (email) DO NOTHING`.

### Phase 3: Leads

6. **Generate 75 leads** (15 per consultant) with:
   - Brazilian names from static arrays
   - WhatsApp numbers with real DDDs
   - Status distribution across all 6 enum values
   - Score correlated to status
   - Health metadata (perfil, faixa_etaria, coparticipacao)
   - Staggered `created_at` over past 30 days

### Phase 4: Conversations & Messages

7. **Look up default health flow** via `SELECT WHERE is_default = true AND vertical = 'saude'`.
8. **Create 150 conversations** (2 per lead) with state JSONB matching lead metadata.
9. **Create 450+ messages** (3+ per conversation) alternating inbound/outbound with Portuguese health plan dialogue.

### Phase 5: Follow-ups & Templates

10. **Create 30+ follow-ups** for ~40% of leads, distributed across all 4 statuses.
11. **Create 15+ message templates** (3 per consultant) in categories: greeting, follow_up, qualification.

### Phase 6: Testing & Validation

12. **Unit tests** for: safety guard, UUID generation, data generator functions, status/score correlation.
13. **Verification output** — Script prints summary counts matching spec expectations.

## Key Design Decisions

| Decision | Choice | Rationale | Reference |
|----------|--------|-----------|-----------|
| Auth user creation | Supabase Admin SDK | `auth.users` table cannot be directly inserted via SQL | [research.md R1](./research.md) |
| ID generation | UUID v5 deterministic | Same IDs across executions enable cross-reference | [research.md R2](./research.md) |
| Production safety | Dual hostname check | Rejects `.supabase.co` AND requires `localhost` | [research.md R3](./research.md) |
| Script structure | Single TypeScript file | Project convention, avoids coordination overhead | [research.md R4](./research.md) |
| Brazilian data | Static arrays | Deterministic, no external dependency | [research.md R5](./research.md) |
| Flow reference | Dynamic lookup | Flow ID from `01_default_flows.sql` is non-deterministic | [research.md R6](./research.md) |

## Dependencies

| Dependency | Type | Purpose | Status |
|------------|------|---------|--------|
| `@supabase/supabase-js` | Existing | Admin SDK + data operations | Already installed |
| `uuid` | New (devDependency) | UUID v5 generation | To be added |
| `tsx` | Existing (devDependency) | TypeScript execution | Already installed (check) |
| `.env.local` | Config | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Must exist locally |
| `01_default_flows.sql` | Seed | Default health flow must exist | Applied via `supabase db reset` |
| All migrations | Schema | Tables and constraints must exist | Applied via `supabase db reset` |

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Script run against production | HIGH | Dual hostname check + clear error message |
| UUID v5 collisions with existing data | LOW | Unique namespace for seed data |
| Schema changes break script | MEDIUM | Script validates table existence before inserting |
| `uuid` package not installed | LOW | Script checks import and provides install command |
| Default health flow missing | MEDIUM | Script checks and provides clear error with fix command |

## Complexity Tracking

> No constitution violations — this section is intentionally empty.

No violations to justify. The implementation is a single script file with unit tests, following all constitution principles.
