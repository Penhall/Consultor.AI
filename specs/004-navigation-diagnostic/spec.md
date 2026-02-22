# Feature Specification: Navigation Diagnostic & Link Crawler

**Feature Branch**: `004-navigation-diagnostic`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "Com o ambiente Docker rodando, criar e executar um diagnostico de navegacao completo do Consultor.AI com dados do seed ja populados. Para cada papel (admin, consultor), percorrer todas as rotas e registrar: URL, status HTTP, tempo de resposta. Se retornou conteudo real ou placeholder. Links internos quebrados (404, 500, redirect inesperado). Paginas que renderizam mas estao vazias ou com TODOs visiveis. Gerar relatorio em diagnostics/reports/01-link-crawler.md agrupado por: Funcionando / Quebrado / Placeholder / Acesso negado inesperado. Nenhuma correcao deve ser feita nesta fase."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Role-Based Route Crawling (Priority: P1)

As a developer, I want to run a diagnostic script that authenticates as each user role (admin and consultant) and visits every page and API route in the Consultor.AI application, recording the HTTP status, response time, and content type for each request.

**Why this priority**: This is the core diagnostic capability. Without crawling all routes with proper authentication, no other analysis is possible. It provides the fundamental data about what works and what doesn't.

**Independent Test**: Can be fully tested by running the crawler script against the Docker environment and verifying that it produces a list of all routes with HTTP status codes and response times.

**Acceptance Scenarios**:

1. **Given** the Docker full-stack environment is running with seed data, **When** the crawler authenticates as a consultant user, **Then** it visits all 26 page routes and 38 API routes, recording HTTP status and response time for each.
2. **Given** the Docker full-stack environment is running with seed data, **When** the crawler authenticates as an admin user, **Then** it visits all routes and records which admin-only routes return 200 vs which consultant-only routes differ in behavior.
3. **Given** a route returns a redirect (3xx), **When** the crawler encounters it, **Then** it records the redirect destination and follows it, recording the final status.
4. **Given** a route requires a dynamic parameter (e.g., `/leads/[id]`), **When** the crawler visits it, **Then** it uses a valid ID from the seed data to test the route with real content.

---

### User Story 2 - Content Quality Analysis (Priority: P2)

As a developer, I want the crawler to analyze the response body of each page to detect placeholder content, visible TODOs, empty pages, and other signs of incomplete implementation.

**Why this priority**: Knowing that a page returns 200 is not enough. A page could render successfully but contain only placeholder text, TODO markers, or be completely empty. This analysis reveals the true state of each page.

**Independent Test**: Can be tested by verifying that the crawler detects known placeholder content (e.g., "Coming soon", "TODO", "Lorem ipsum") in pages that contain such content.

**Acceptance Scenarios**:

1. **Given** a page returns HTTP 200, **When** the crawler analyzes its HTML content, **Then** it checks for visible TODO markers (`TODO`, `FIXME`, `HACK`, `XXX`), placeholder text ("Lorem ipsum", "Coming soon", "Placeholder"), and empty content areas.
2. **Given** a page renders but has no meaningful content (empty `<main>` or `<body>` with only wrapper divs), **When** the crawler analyzes it, **Then** it classifies the page as "empty/no content".
3. **Given** an API route returns 200, **When** the crawler analyzes the JSON response, **Then** it checks whether the response contains real data from the seed or empty arrays/objects.

---

### User Story 3 - Diagnostic Report Generation (Priority: P2)

As a developer, I want the crawler to generate a structured Markdown report at `diagnostics/reports/01-link-crawler.md` that groups all results into four categories: Functioning, Broken, Placeholder, and Unexpected Access Denied.

**Why this priority**: The report is the deliverable of this feature. Without a well-organized report, the diagnostic data is hard to act on. This is P2 (not P1) because the data collection must work first.

**Independent Test**: Can be tested by running the crawler and verifying that the output file exists at the correct path, contains all four categories, and includes every route that was crawled.

**Acceptance Scenarios**:

1. **Given** the crawler has completed visiting all routes for both roles, **When** the report is generated, **Then** it is written to `diagnostics/reports/01-link-crawler.md` in valid Markdown format.
2. **Given** crawl results are available, **When** the report groups them, **Then** routes are categorized into: **Funcionando** (200 with real content), **Quebrado** (4xx/5xx errors, timeouts), **Placeholder** (200 but with placeholder/empty content), **Acesso Negado Inesperado** (403/401 on routes that should be accessible for the given role).
3. **Given** the report is generated, **When** a developer reads it, **Then** each entry includes: URL, HTTP method tested, HTTP status code, response time in milliseconds, role used, and a brief note about content quality.
4. **Given** the report is generated, **When** it includes a summary section, **Then** the summary shows total routes tested, count per category, and per-role breakdown.

---

### User Story 4 - Internal Link Validation (Priority: P3)

As a developer, I want the crawler to extract internal links (`<a href>`) from each rendered page and verify that linked destinations are reachable, detecting broken internal navigation.

**Why this priority**: This catches navigation issues that route-level crawling might miss - for example, a sidebar link pointing to a deleted page or a button linking to a wrong URL. It's P3 because the core route crawl and report already provide significant value.

**Independent Test**: Can be tested by verifying that the crawler finds and follows internal links from at least the main dashboard page and reports any that return 404 or unexpected errors.

**Acceptance Scenarios**:

1. **Given** a page is successfully rendered, **When** the crawler extracts all `<a href>` links pointing to internal routes, **Then** it records each link source and destination.
2. **Given** an internal link points to a route that returns 404 or 500, **When** the crawler tests it, **Then** it is reported as a broken internal link with the source page noted.
3. **Given** an internal link causes an unexpected redirect (e.g., to a login page when the user is authenticated), **When** the crawler detects it, **Then** it is flagged as a potentially broken navigation path.

---

### Edge Cases

- What happens when a page requires a dynamic ID that doesn't exist in seed data? The crawler uses known seed IDs and skips routes where no valid ID can be determined, noting them in the report as "skipped - no seed data".
- How does the system handle routes that hang or take extremely long? The crawler enforces a 10-second timeout per request and reports timeouts as broken routes.
- What happens when the Docker environment is not running? The crawler detects this upfront via a health check and exits with a clear error message before attempting any requests.
- How are API routes that require POST/PUT/DELETE handled? The crawler tests GET and HEAD methods only by default for safety (read-only diagnostic). POST-only routes are noted as "not tested (write-only)".
- What happens with WebSocket or SSE endpoints? They are skipped and noted as "not applicable for HTTP crawling".

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST authenticate as a consultant user using seed data credentials and visit all application routes
- **FR-002**: System MUST authenticate as an admin user using seed data credentials and visit all application routes
- **FR-003**: System MUST record HTTP status code, response time (ms), and content type for every route visited
- **FR-004**: System MUST detect placeholder content in HTML responses (TODO, FIXME, Lorem ipsum, Coming soon, empty content areas)
- **FR-005**: System MUST detect empty or meaningless API responses (empty arrays, null data, stub responses)
- **FR-006**: System MUST generate a Markdown report at `diagnostics/reports/01-link-crawler.md`
- **FR-007**: System MUST group report results into four categories: Funcionando, Quebrado, Placeholder, Acesso Negado Inesperado
- **FR-008**: System MUST include a summary section with total counts per category and per role
- **FR-009**: System MUST use valid seed data IDs for dynamic routes (e.g., lead ID, flow ID)
- **FR-010**: System MUST enforce a per-request timeout to avoid hanging on unresponsive routes
- **FR-011**: System MUST verify that the Docker environment is accessible before starting the crawl
- **FR-012**: System MUST extract and test internal links from rendered pages, reporting broken ones
- **FR-013**: System MUST NOT modify any data, create records, or trigger side effects (read-only diagnostic)
- **FR-014**: System MUST test API routes using safe HTTP methods only (GET, HEAD) unless the route only supports other methods
- **FR-015**: System MUST handle redirects by recording both the redirect and the final destination

### Key Entities

- **CrawlResult**: Represents one route visit - URL, HTTP method, status code, response time, role, content classification, notes
- **DiagnosticReport**: The aggregated collection of CrawlResults grouped by category with summary statistics
- **Route**: A page or API endpoint to be tested, with its expected access level per role and any required dynamic parameters

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The crawler visits 100% of known page routes (26 pages) and API GET routes for both admin and consultant roles
- **SC-002**: The report correctly categorizes at least 90% of routes (manual spot-check of 10 routes confirms correct classification)
- **SC-003**: The diagnostic completes within 5 minutes for the full crawl of both roles
- **SC-004**: The generated report is valid Markdown that renders correctly and includes all four categories
- **SC-005**: Broken internal links (if any) are detected and reported with source page context
- **SC-006**: The crawler detects at least one known placeholder or empty page (if any exist) to confirm content analysis works
- **SC-007**: No data is modified in the database as a result of running the diagnostic (verified by comparing record counts before and after)

## Assumptions

- The Docker full-stack environment (`docker-compose.full.yml`) is running with all containers healthy
- Seed data has been applied, providing at least one consultant user and one admin user with known credentials
- The Next.js application is accessible at `http://localhost:3000` (or the configured port)
- The Supabase Auth service is running and accepting login requests
- Pages are server-rendered or return meaningful HTML (not purely client-rendered SPAs that require JavaScript execution)
- For client-rendered pages, the crawler can detect basic HTML structure but may not detect JavaScript-rendered content; this is an acceptable limitation for this phase

## Scope Boundaries

**In Scope**:

- All Next.js page routes and API GET routes
- Authentication as consultant and admin roles
- HTTP-level content analysis (HTML parsing, JSON inspection)
- Report generation in Markdown format
- Internal link extraction and validation

**Out of Scope**:

- Fixing any issues found (diagnosis only)
- Testing write operations (POST, PUT, DELETE) that modify data
- Visual/screenshot comparison or visual regression testing
- JavaScript execution or browser-based rendering
- Performance load testing or stress testing
- External link validation (only internal links)
- Mobile responsiveness testing
