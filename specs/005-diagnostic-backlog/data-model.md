# Data Model: Consolidated Diagnostic Backlog

**Feature**: 005-diagnostic-backlog
**Date**: 2026-02-22

## Overview

This feature produces a Markdown report only — no database changes. The "data model" describes the logical structure of backlog items within the report.

## Entities

### Backlog Item

Represents a single problem or improvement identified from diagnostic reports.

| Field          | Type     | Description                                                 |
| -------------- | -------- | ----------------------------------------------------------- |
| id             | string   | Unique identifier (BL-001, BL-002, ...)                     |
| title          | string   | Short descriptive title                                     |
| category       | enum     | One of: critico, isolamento, placeholder, link-quebrado, ux |
| description    | string   | Detailed problem description                                |
| affected_roles | string[] | One or more of: admin, consultant, publico                  |
| effort         | enum     | P (≤2h), M (½-1 dia), G (>1 dia)                            |
| solution       | string   | High-level suggested fix                                    |
| related_routes | string[] | Affected route paths                                        |
| source_report  | string   | Which diagnostic report identified this (00 or 01)          |

### Category Enum

| Value         | Label               | Priority    | Description                                          |
| ------------- | ------------------- | ----------- | ---------------------------------------------------- |
| critico       | Críticos            | 1 (highest) | Blocks main user flow (login → dashboard → actions)  |
| isolamento    | Isolamento de Dados | 2           | Tenant data isolation, RLS, authorization gaps       |
| placeholder   | Páginas Placeholder | 3           | Empty pages, TODO markers, Lorem ipsum content       |
| link-quebrado | Links Quebrados     | 4           | Internal links returning 404 or unexpected redirects |
| ux            | Melhorias de UX     | 5 (lowest)  | Duplicate routes, naming inconsistencies, polish     |

### Report Source

| Field        | Type   | Description                     |
| ------------ | ------ | ------------------------------- |
| filename     | string | Report file name                |
| path         | string | Full path relative to repo root |
| generated_at | date   | When the report was generated   |
| type         | enum   | mapeamento, crawl               |

## Relationships

```
Report Source (1) ──produces──> (N) Backlog Item
Backlog Item (1) ──belongs to──> (1) Category
Backlog Item (1) ──affects──> (N) Roles
Backlog Item (1) ──references──> (N) Routes
```

## Expected Item Counts (from diagnostic analysis)

| Category            | Estimated Items | Source                                                                           |
| ------------------- | --------------- | -------------------------------------------------------------------------------- |
| Críticos            | 3-4             | Auth cookie (72 routes), broken seed (2 entities), API auth propagation          |
| Isolamento de Dados | 2-3             | RLS assessment, admin route access control                                       |
| Páginas Placeholder | 0-1             | Crawler found 0 placeholders; section will note clean status                     |
| Links Quebrados     | 3-4             | /auth/signup (404), /termos (404), /privacidade (404), /dashboard redirect       |
| Melhorias de UX     | 3-5             | Route duplication, naming inconsistency, missing CRM providers, landing page CTA |

**Total estimated**: 12-17 actionable items + 5 roadmap items (Phase 5)
