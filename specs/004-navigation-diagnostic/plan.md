# Implementation Plan: Navigation Diagnostic & Link Crawler

**Branch**: `004-navigation-diagnostic` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-navigation-diagnostic/spec.md`

## Summary

Build a TypeScript diagnostic script that authenticates as both admin and consultant roles against the Docker full-stack environment, crawls all 26 page routes and 38 API routes, analyzes content quality (placeholder detection, empty pages, TODO markers), extracts and validates internal links, and generates a structured Markdown report at `diagnostics/reports/01-link-crawler.md` grouped into four categories: Funcionando, Quebrado, Placeholder, and Acesso Negado Inesperado.

## Technical Context

**Language/Version**: TypeScript 5.3 (Node.js 20 LTS)
**Primary Dependencies**: `@supabase/supabase-js` (auth), `node-html-parser` (HTML parsing), built-in `fetch` (HTTP requests)
**Storage**: File system only (Markdown report output)
**Testing**: Vitest (unit tests for classifiers, report generator, route registry)
**Target Platform**: Local development (Docker environment)
**Project Type**: CLI script (diagnostics tooling)
**Performance Goals**: Complete full crawl of both roles within 5 minutes
**Constraints**: Read-only (no data modifications), 10-second per-request timeout
**Scale/Scope**: ~64 routes × 2 roles = ~128 HTTP requests + internal link follows

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                              | Status | Notes                                                                                                 |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| I. Code Quality First                  | PASS   | TypeScript strict mode, English for code, explicit types                                              |
| II. Test-Driven Development            | PASS   | Unit tests for classifiers and report generator; diagnostic script is tooling, not production feature |
| III. User Experience Consistency       | N/A    | No user-facing UI; developer tooling only                                                             |
| IV. Performance and Scalability        | PASS   | 5-minute max crawl time, 10s per-request timeout                                                      |
| V. Security and Compliance             | PASS   | Read-only diagnostic; uses existing seed credentials; no secrets committed                            |
| VI. Architecture and Modularity        | PASS   | Modular design: route registry, crawler, classifiers, report generator                                |
| VII. Documentation and Maintainability | PASS   | Report is self-documenting; script has JSDoc                                                          |
| VIII. Development Workflow             | PASS   | Feature branch, conventional commits                                                                  |

**Gate Result**: ALL PASS - proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/004-navigation-diagnostic/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (entities)
├── quickstart.md        # Phase 1 output (usage guide)
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
diagnostics/
├── scripts/
│   └── link-crawler.ts          # Main crawler entry point
├── lib/
│   ├── types.ts                 # CrawlResult, Route, DiagnosticReport types
│   ├── route-registry.ts        # All known routes with expected access levels
│   ├── auth.ts                  # Supabase authentication helper
│   ├── crawler.ts               # HTTP crawler (fetch with timeout, redirect tracking)
│   ├── content-classifier.ts    # Placeholder/empty/real content detection
│   ├── link-extractor.ts        # Internal link extraction from HTML
│   └── report-generator.ts      # Markdown report writer
├── reports/
│   ├── 00-project-mapping.md    # Existing project mapping report
│   └── 01-link-crawler.md       # Generated output (gitignored)
└── README.md                    # (if needed)

tests/
└── unit/
    ├── content-classifier.test.ts
    ├── route-registry.test.ts
    └── report-generator.test.ts
```

**Structure Decision**: CLI-style diagnostics tooling under `diagnostics/` directory (already established with `diagnostics/reports/00-project-mapping.md`). Separate from `src/` since this is not part of the production Next.js app. Tests go in existing `tests/unit/` directory to stay consistent with project conventions.

## Complexity Tracking

No constitution violations. No complexity justification needed.

---

## Implementation Details

### Authentication Strategy

The crawler authenticates via the Supabase Auth REST API (GoTrue) to obtain JWT access tokens, then uses those tokens in HTTP headers for page and API requests:

1. **POST** to `http://127.0.0.1:54321/auth/v1/token?grant_type=password` with seed credentials
2. Extract `access_token` from response
3. For **page routes**: Set `Authorization: Bearer <token>` header AND simulate Supabase session cookies (the Next.js middleware reads cookies, not Bearer tokens)
4. For **API routes**: Set `Authorization: Bearer <token>` header (API routes typically use `createServerClient` which reads cookies from the request)

**Key insight**: Since Next.js middleware uses cookie-based auth (Supabase SSR), the crawler must either:

- Option A: Set the `sb-<project>-auth-token` cookies on requests (complex, cookie format varies)
- Option B: Make requests directly to API routes with Bearer token (works for API routes; page routes will redirect to login)
- **Chosen**: Option B for API routes + Option A for page routes (using the base64-encoded session cookie format)

### Seed Credentials

| Role             | Email                   | Password     | Admin |
| ---------------- | ----------------------- | ------------ | ----- |
| Admin/Consultant | `consultor0@seed.local` | `seed123456` | Yes   |
| Consultant       | `consultor1@seed.local` | `seed123456` | No    |

### Route Registry Design

The route registry is a static list of all known routes with metadata:

```typescript
interface RouteDefinition {
  path: string; // e.g., '/dashboard/leads'
  type: 'page' | 'api';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
  adminOnly: boolean;
  dynamicParams?: Record<string, string>; // e.g., { id: 'seed-lead-id' }
  description: string;
}
```

Dynamic route IDs are resolved at crawl time by querying the database for seed data IDs (leads, flows, conversations, etc.) via the Supabase REST API.

### Content Classification

| Category                     | Detection Logic                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Funcionando**              | HTTP 200 + real content (non-empty HTML with meaningful text or JSON with data)                                                                         |
| **Quebrado**                 | HTTP 4xx/5xx, timeout, connection error                                                                                                                 |
| **Placeholder**              | HTTP 200 but contains: TODO/FIXME/HACK/XXX markers, "Lorem ipsum", "Coming soon", "Placeholder", empty `<main>`, empty JSON arrays/objects with no data |
| **Acesso Negado Inesperado** | HTTP 401/403 on a route the current role should have access to, OR redirect to `/auth/login` for an authenticated user                                  |

### Report Format

```markdown
# Diagnóstico de Navegação - Consultor.AI

**Data**: YYYY-MM-DD HH:mm
**Ambiente**: Docker Full-Stack
**Roles testados**: admin (consultor0@seed.local), consultor (consultor1@seed.local)

## Resumo

| Categoria                | Admin | Consultor | Total |
| ------------------------ | ----- | --------- | ----- |
| Funcionando              | X     | Y         | Z     |
| Quebrado                 | X     | Y         | Z     |
| Placeholder              | X     | Y         | Z     |
| Acesso Negado Inesperado | X     | Y         | Z     |
| **Total**                | X     | Y         | Z     |

## Funcionando

[table of routes with 200 + real content]

## Quebrado

[table of routes with errors]

## Placeholder

[table of routes with placeholder content]

## Acesso Negado Inesperado

[table of routes with unexpected 401/403]

## Links Internos Quebrados

[table of broken internal links found in HTML]

## Rotas Não Testadas

[routes skipped: write-only, WebSocket, missing seed data]
```

### Execution Flow

1. **Pre-flight**: Health check → verify Docker is up (`GET /api/health`)
2. **Auth**: Login as admin, login as consultant → get tokens + cookies
3. **Resolve IDs**: Query Supabase for seed data IDs (lead, flow, conversation, consultant, file)
4. **Crawl**: For each role, visit every route in the registry
5. **Classify**: Analyze each response body for content quality
6. **Extract links**: From HTML pages, find internal `<a href>` links
7. **Validate links**: Follow extracted internal links, check for broken ones
8. **Report**: Generate Markdown grouped by category
9. **Summary**: Print summary to console

### NPM Script

```json
{
  "scripts": {
    "diagnostic:crawl": "npx tsx diagnostics/scripts/link-crawler.ts"
  }
}
```
