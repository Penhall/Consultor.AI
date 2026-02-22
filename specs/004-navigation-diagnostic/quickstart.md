# Quickstart: Navigation Diagnostic & Link Crawler

**Feature**: `004-navigation-diagnostic`
**Date**: 2026-02-20

## Prerequisites

1. Docker full-stack environment running:

   ```bash
   docker-compose -f docker-compose.full.yml up -d
   ```

2. Seed data applied (the seed-diagnostic script should have been run):

   ```bash
   npx tsx scripts/seed-diagnostic.ts
   ```

3. Verify environment is healthy:
   ```bash
   curl http://127.0.0.1:3000/api/health
   # Should return 200 OK
   ```

## Running the Crawler

```bash
npm run diagnostic:crawl
```

Or directly:

```bash
npx tsx diagnostics/scripts/link-crawler.ts
```

## Expected Output

### Console Output

```
🔍 Consultor.AI - Navigation Diagnostic
========================================

Preflight check...
  ✓ App is running at http://127.0.0.1:3000
  ✓ Supabase Auth is accessible

Authenticating...
  ✓ Admin: consultor0@seed.local
  ✓ Consultant: consultor1@seed.local

Resolving seed data IDs...
  ✓ Lead: abc-123-...
  ✓ Flow: def-456-...
  ✓ Conversation: ghi-789-...
  ...

Crawling as admin (64 routes)...
  [1/64] GET /                          200  45ms  ✓ Funcionando
  [2/64] GET /dashboard                 200  120ms ✓ Funcionando
  ...

Crawling as consultant (64 routes)...
  [1/64] GET /                          200  32ms  ✓ Funcionando
  ...

Extracting internal links...
  Found 85 internal links across 20 pages
  Testing 85 links...

Generating report...
  ✓ Written to diagnostics/reports/01-link-crawler.md

========================================
Summary:
  Funcionando:              98 (76%)
  Quebrado:                  8 (6%)
  Placeholder:              12 (9%)
  Acesso Negado Inesperado:  4 (3%)
  Não Testado:               6 (5%)
  Links Internos Quebrados:  3
  Total:                   128
========================================
```

### Report Output

The Markdown report is written to `diagnostics/reports/01-link-crawler.md` and contains:

1. **Resumo** - Summary table with counts per category and per role
2. **Funcionando** - Routes working correctly
3. **Quebrado** - Routes returning errors
4. **Placeholder** - Routes with placeholder/empty content
5. **Acesso Negado Inesperado** - Routes unexpectedly blocking access
6. **Links Internos Quebrados** - Broken internal navigation links
7. **Rotas Não Testadas** - Routes skipped with reasons

## Scenarios

### Scenario 1: Happy Path - Full Crawl

**Steps**:

1. Start Docker environment
2. Run seed-diagnostic script
3. Run `npm run diagnostic:crawl`

**Expected**: Report generated with all routes categorized. Console shows summary with zero errors in the crawler itself.

### Scenario 2: Docker Not Running

**Steps**:

1. Stop Docker environment
2. Run `npm run diagnostic:crawl`

**Expected**: Script exits with error:

```
✗ Preflight check failed: Cannot connect to http://127.0.0.1:3000/api/health
  Ensure Docker environment is running: docker-compose -f docker-compose.full.yml up -d
```

### Scenario 3: Seed Data Not Applied

**Steps**:

1. Start Docker with fresh database (no seed)
2. Run `npm run diagnostic:crawl`

**Expected**: Authentication fails:

```
✗ Authentication failed for consultor0@seed.local
  Ensure seed data is applied: npx tsx scripts/seed-diagnostic.ts
```

### Scenario 4: Partial Failures

**Steps**:

1. Start Docker environment
2. Stop only the Next.js app container
3. Run `npm run diagnostic:crawl`

**Expected**: Preflight check fails (health endpoint unreachable).

## Troubleshooting

| Issue                                    | Cause                                   | Solution                                                             |
| ---------------------------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| "Cannot connect to health endpoint"      | Docker not running or app not started   | `docker-compose -f docker-compose.full.yml up -d`                    |
| "Authentication failed"                  | Seed data not applied                   | `npx tsx scripts/seed-diagnostic.ts`                                 |
| Many "Acesso Negado" for pages           | Cookie auth not working                 | Check that Supabase Auth (GoTrue) container is healthy               |
| All pages show "redirect to /auth/login" | Session cookies not being set correctly | Verify ANON_KEY and JWT_SECRET match between app and auth containers |
| Timeout on many routes                   | App is under heavy load or starting up  | Wait for containers to be healthy, try again                         |
