# Data Model: Navigation Diagnostic & Link Crawler

**Feature**: `004-navigation-diagnostic`
**Date**: 2026-02-20

> This feature does not create database tables. All data is in-memory during crawl execution and persisted as a Markdown report file. The entities below describe the TypeScript types used by the crawler.

## Entities

### CrawlResult

Represents the outcome of visiting a single route.

| Field          | Type           | Description                                                               |
| -------------- | -------------- | ------------------------------------------------------------------------- |
| url            | string         | Full URL visited (e.g., `http://127.0.0.1:3000/dashboard/leads`)          |
| path           | string         | Route path (e.g., `/dashboard/leads`)                                     |
| method         | string         | HTTP method used (`GET`, `HEAD`)                                          |
| role           | string         | Role used for this request (`admin`, `consultant`)                        |
| statusCode     | number         | HTTP status code (200, 301, 404, 500, etc.)                               |
| responseTimeMs | number         | Response time in milliseconds                                             |
| contentType    | string         | Response content type (`text/html`, `application/json`, etc.)             |
| category       | string         | Classification: `funcionando`, `quebrado`, `placeholder`, `acesso_negado` |
| redirectTo     | string or null | Redirect destination if status was 3xx                                    |
| notes          | string         | Human-readable description of classification reason                       |
| contentFlags   | string[]       | Detected issues: `TODO`, `FIXME`, `empty`, `lorem-ipsum`, etc.            |

### RouteDefinition

Describes a known route to be tested.

| Field         | Type           | Description                                                          |
| ------------- | -------------- | -------------------------------------------------------------------- |
| path          | string         | Route path pattern (e.g., `/dashboard/leads/[id]`)                   |
| resolvedPath  | string or null | Path with dynamic params replaced (e.g., `/dashboard/leads/abc-123`) |
| type          | string         | `page` or `api`                                                      |
| method        | string         | HTTP method to test (`GET` by default)                               |
| requiresAuth  | boolean        | Whether the route requires authentication                            |
| adminOnly     | boolean        | Whether the route is admin-only                                      |
| dynamicParams | object or null | Map of param name to entity type (e.g., `{ id: 'lead' }`)            |
| description   | string         | Human-readable route description                                     |

### SeedIds

Contains resolved IDs from the seed database for dynamic route params.

| Field            | Type           | Description                          |
| ---------------- | -------------- | ------------------------------------ |
| leadId           | string or null | First lead ID from seed data         |
| flowId           | string or null | First flow ID from seed data         |
| conversationId   | string or null | First conversation ID from seed data |
| consultantId     | string or null | Consultant ID for webhook routes     |
| fileId           | string or null | First file ID from seed data         |
| crmIntegrationId | string or null | First CRM integration ID             |
| followUpId       | string or null | First follow-up ID                   |
| templateId       | string or null | First message template ID            |

### DiagnosticReport

The final aggregated output.

| Field         | Type           | Description                                         |
| ------------- | -------------- | --------------------------------------------------- |
| timestamp     | Date           | When the crawl was executed                         |
| environment   | string         | Environment description (e.g., "Docker Full-Stack") |
| roles         | string[]       | Roles tested                                        |
| results       | CrawlResult[]  | All individual crawl results                        |
| brokenLinks   | BrokenLink[]   | Internal links that failed                          |
| skippedRoutes | SkippedRoute[] | Routes not tested (with reason)                     |
| summary       | object         | Counts per category and per role                    |

### BrokenLink

Represents an internal link extracted from a page that leads to an error.

| Field      | Type   | Description                         |
| ---------- | ------ | ----------------------------------- |
| sourcePath | string | Page where the link was found       |
| targetPath | string | URL the link points to              |
| linkText   | string | Visible text of the link            |
| statusCode | number | Status code when following the link |
| role       | string | Role used when testing              |

### SkippedRoute

Represents a route that was not tested.

| Field  | Type   | Description                                                          |
| ------ | ------ | -------------------------------------------------------------------- |
| path   | string | Route path                                                           |
| reason | string | Why it was skipped (e.g., "write-only", "no seed data", "WebSocket") |

## Relationships

```
DiagnosticReport
  ├── contains many → CrawlResult
  ├── contains many → BrokenLink
  └── contains many → SkippedRoute

RouteDefinition → resolves to → CrawlResult (one per role)
RouteDefinition → uses → SeedIds (for dynamic params)
```

## State Transitions

No persistent state. The crawler runs as a single-shot process:

```
INIT → PREFLIGHT_CHECK → AUTHENTICATE → RESOLVE_IDS → CRAWL → CLASSIFY → EXTRACT_LINKS → VALIDATE_LINKS → GENERATE_REPORT → DONE
```

If any phase fails critically (e.g., preflight check fails, authentication fails), the process exits with an error message and does not generate a partial report.
