# Quickstart: Consolidated Diagnostic Backlog

**Feature**: 005-diagnostic-backlog
**Date**: 2026-02-22

## Prerequisites

- Diagnostic reports must exist in `diagnostics/reports/`:
  - `00-project-mapping.md` (project structure and route mapping)
  - `01-link-crawler.md` (navigation diagnostic crawl results)

## Usage

### Generating the Backlog

The backlog is generated manually by analyzing the source reports and writing the consolidated Markdown file. No script execution required.

**Output file**: `diagnostics/reports/02-backlog.md`

### Updating the Backlog

After running a new diagnostic crawl (`npm run diagnostic:crawl`), the backlog should be regenerated from the updated reports.

## Scenarios

### Scenario 1: Initial Backlog Generation

1. Read `diagnostics/reports/00-project-mapping.md`
2. Read `diagnostics/reports/01-link-crawler.md`
3. Categorize each finding into one of 5 sections
4. Assign effort (P/M/G) and suggest solutions
5. Write `diagnostics/reports/02-backlog.md`
6. Verify all source findings are represented in the backlog

### Scenario 2: Validating Backlog Completeness

1. Count distinct issues in source reports:
   - 01-link-crawler: "Quebrado" section items
   - 01-link-crawler: "Acesso Negado Inesperado" root causes
   - 01-link-crawler: "Links Internos Quebrados" unique links
   - 00-project-mapping: "Observações" items
   - 00-project-mapping: "Rotas Previstas mas Ausentes" items
2. Count items in 02-backlog.md (BL-XXX IDs)
3. Verify no source issue is missing from the backlog

### Scenario 3: Stakeholder Review

1. Open `diagnostics/reports/02-backlog.md`
2. Read "Resumo Executivo" for high-level overview
3. Review "Críticos" section for immediate action items
4. Use effort estimates to plan sprint capacity

### Scenario 4: Post-Fix Verification

After implementing fixes from the backlog:

1. Re-run `npm run diagnostic:crawl`
2. Compare new `01-link-crawler.md` with previous version
3. Update `02-backlog.md` to mark resolved items
4. Verify "Acesso Negado" count decreased

## Troubleshooting

| Issue                    | Solution                                                     |
| ------------------------ | ------------------------------------------------------------ |
| Source reports not found | Run `npm run diagnostic:crawl` with Docker up first          |
| Item counts don't match  | Check for grouped items (e.g., 72 routes under 1 root cause) |
| Missing effort estimate  | Review estimation criteria in plan.md (P ≤2h, M ½-1d, G >1d) |
