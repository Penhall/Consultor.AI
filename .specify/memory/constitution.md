<!--
Sync Impact Report:
- Version change: INITIAL → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections: All core principles established
- Removed sections: N/A
- Templates requiring updates:
  ✅ plan-template.md - aligned with quality and testing requirements
  ✅ spec-template.md - aligned with scope and compliance standards
  ✅ tasks-template.md - aligned with principle-driven task categorization
- Follow-up TODOs: None (all placeholders filled)
-->

# Consultor.AI Constitution

## Core Principles

### I. Code Quality First

**All code MUST meet strict quality standards before deployment:**

- **TypeScript Strict Mode**: All code written in TypeScript with strict type checking enabled. No `any` types without explicit justification. All functions must have explicit parameter and return types.
- **English for Code**: Variables, functions, classes, types, and technical comments MUST be written in English. Brazilian Portuguese is reserved only for UI text, user-facing messages, and business documentation.
- **Zero Warnings Policy**: The codebase MUST build with zero TypeScript errors and zero ESLint warnings. Any warnings must be addressed immediately or explicitly suppressed with justification.
- **Immutable Patterns**: Prefer immutable operations (map, filter, reduce) over mutations. Use spread operators for object updates. State updates must be immutable.
- **Error Handling**: All async operations MUST have explicit error handling. Use custom error classes (ValidationError, NotFoundError, UnauthorizedError). Never silently catch errors.

**Rationale**: Quality code reduces bugs, improves maintainability, and ensures long-term project health. The strict type system catches errors at compile-time rather than runtime.

### II. Test-Driven Development (TDD)

**Testing is non-negotiable and follows the Testing Pyramid:**

- **Minimum Coverage**: 80% overall code coverage required. Unit tests must exceed 90% coverage.
- **Testing Pyramid Distribution**: 60% unit tests, 30% integration tests, 10% E2E tests.
- **Test Frameworks**: Vitest for unit/integration tests, Playwright for E2E tests, React Testing Library for components.
- **Test Structure**: Tests organized in `tests/unit/`, `tests/integration/`, `tests/e2e/` with clear naming conventions.
- **Behavior Testing**: Test behavior, not implementation. Focus on what the code does, not how it does it.
- **Mock External Services**: Database connections (Supabase), AI APIs (Groq/Gemini), WhatsApp API must be mocked in tests.
- **CI/CD Integration**: All tests must pass in CI/CD pipeline before merge. Failed tests block deployments.

**Rationale**: Comprehensive testing prevents regressions, enables confident refactoring, and serves as living documentation. TDD ensures features are well-designed before implementation.

### III. User Experience Consistency

**The user interface must provide a consistent, accessible, and performant experience:**

- **Portuguese UI**: All user-facing text (buttons, labels, messages, errors) MUST be in Brazilian Portuguese with clear, empathetic tone.
- **Accessibility (a11y)**: Use semantic HTML elements (nav, main, section, header). Include proper ARIA labels and roles. Support keyboard navigation. Minimum contrast ratios met.
- **Design System**: Use shadcn/ui components consistently. Follow Tailwind CSS conventions. Maintain consistent spacing, typography, and color schemes.
- **Loading States**: All async operations must show loading indicators. Skeleton screens for data loading. Immediate feedback for user actions.
- **Error Messages**: User-friendly error messages in Portuguese. Technical details logged to console but hidden from users. Provide actionable recovery steps.
- **Mobile-First**: Design and test for mobile devices first. Responsive layouts required for all pages. Touch targets minimum 44×44px.

**Rationale**: Consistent UX builds trust, reduces cognitive load, and ensures accessibility for all users. The platform's primary users (consultants and leads) interact primarily via mobile WhatsApp.

### IV. Performance and Scalability

**System performance is critical for user retention and regulatory compliance:**

- **API Response Times**: P95 latency < 500ms for API routes. AI response generation < 3 seconds. Database queries < 100ms P95.
- **Build Optimization**: Production builds must complete in < 5 minutes. Tree-shaking and code splitting required. Dynamic imports for heavy components.
- **Image Optimization**: Use Next.js Image component for all images. WebP format preferred. Lazy loading for below-fold images.
- **Database Performance**: Proper indexes on all frequently queried columns. Use RLS policies for authorization. Limit SELECT columns to only what's needed.
- **Caching Strategy**: React Query for client-side caching (1-minute stale time). Redis (Upstash) for rate limiting and session management.
- **Bundle Size**: Monitor bundle size with each build. Lazy load routes and heavy dependencies. Keep client-side JavaScript minimal.

**Rationale**: Fast performance improves user satisfaction, reduces bounce rates, and meets the critical < 3s AI response requirement for WhatsApp conversations.

### V. Security and Compliance

**Security is defense-in-depth; compliance is mandatory:**

- **Authentication**: Supabase Auth with JWT tokens. httpOnly cookies for session management. No credentials in localStorage.
- **Authorization**: Row-Level Security (RLS) policies on all tables. No consultant can access another consultant's data. Auth middleware on all protected routes.
- **Input Validation**: Zod schemas validate all API inputs. Sanitize user inputs. Parameterized queries prevent SQL injection (Supabase handles this).
- **LGPD Compliance**: No collection of sensitive health data (CPF, medical history). Audit logs for data access. Data retention policies enforced.
- **ANS Compliance**: AI responses filtered for prohibited content (exact pricing, illegal claims, zero waiting period promises). Compliance checks in prompt engineering.
- **WhatsApp Policy**: Respect 24-hour messaging window. Opt-in required. No spam or mass messaging. HMAC SHA-256 webhook validation.
- **Secrets Management**: Environment variables for all secrets. Never commit .env files. Use encrypted storage for Meta access tokens (AES-256-GCM).

**Rationale**: Security breaches destroy user trust and violate legal requirements. LGPD and ANS compliance are non-negotiable for operating in the Brazilian health insurance market.

### VI. Architecture and Modularity

**System architecture follows separation of concerns and server-first principles:**

- **Server Components Default**: Use React Server Components by default. Client Components only when needed (interactivity, hooks, browser APIs).
- **Layer Separation**: Components (UI) → Hooks (data/state) → API Routes (server logic) → Services (business logic) → Supabase (data access).
- **Service Layer Pattern**: Business logic in dedicated service files (`lib/services/`). No business logic in API routes or components.
- **Flow Engine Modularity**: Flow definition (JSON) separate from execution (parser, state manager, executors). Extensible for new flow types.
- **API Route Structure**: Standard pattern: (1) Authentication, (2) Input Validation, (3) Business Logic (via service), (4) Authorization, (5) Response/Error Handling.
- **Database Access**: Use Supabase client directly for simple queries. Use RPC functions for complex transactions. RLS policies enforce authorization.
- **Integration Wrappers**: External services (Groq, WhatsApp, Canva) wrapped in dedicated client classes (`lib/api/`).

**Rationale**: Modular architecture enables parallel development, easier testing, and reduces coupling. Server-first reduces client bundle size and improves SEO.

### VII. Documentation and Maintainability

**Code must be self-documenting with clear intent:**

- **JSDoc Comments**: All public functions/methods require JSDoc with description, parameters, return value, throws, and example.
- **Portuguese Business Logic**: Documentation in Portuguese for business rules, user stories, and product requirements. English for technical specifications.
- **README Files**: Each major directory (`lib/`, `components/`, `app/`) should have a README explaining its purpose and organization.
- **Inline Comments**: Complex logic explained with comments. No obvious comments ("increment counter" for `i++`). Why over what.
- **Type Documentation**: Complex types documented with inline comments. Use descriptive names over cryptic abbreviations.
- **Commit Messages**: Follow Conventional Commits format: `feat(scope): description`, `fix(scope): description`. Include issue/ticket numbers.
- **CHANGELOG**: Maintain CHANGELOG.md with all notable changes per version. Follow Keep a Changelog format.

**Rationale**: Clear documentation reduces onboarding time, enables collaboration, and prevents knowledge silos. Future developers (including yourself) will thank you.

### VIII. Development Workflow

**Consistent workflow ensures quality and predictability:**

- **Branch Naming**: `feature/description`, `fix/description`, `hotfix/critical-bug`, `docs/update-section`.
- **Pull Request Requirements**: All PRs require (1) passing tests, (2) no linting errors, (3) code review approval, (4) updated documentation.
- **Code Review Checklist**: Functionality, code quality, performance, security, testing, documentation verified before approval.
- **Git Workflow**: Feature branches from `main`. No direct commits to `main`. Squash commits on merge. Delete branches after merge.
- **Local Testing**: Run `npm run lint`, `npm run type-check`, `npm test` before pushing. Use Git hooks to automate checks.
- **CI/CD Pipeline**: GitHub Actions run tests, linting, and build on all PRs. Deployment blocked on failures.

**Rationale**: Structured workflow prevents broken builds, ensures code quality, and maintains clean Git history.

## Security Requirements

### Authentication and Authorization

- **Authentication**: Supabase Auth with magic links or password. Email verification required. Session timeout after 7 days inactivity.
- **Password Policy**: Minimum 8 characters, at least one uppercase, one lowercase, one number. No password history reuse (last 3).
- **API Security**: All API routes authenticated via Supabase middleware. Rate limiting via Upstash Redis (10 req/10s per IP).
- **Token Management**: JWT tokens stored in httpOnly cookies. Refresh tokens rotated. Access tokens expire after 1 hour.
- **RLS Policies**: Every table has RLS enabled. Consultants can only access their own leads, conversations, and data.

### Data Protection

- **Encryption at Rest**: Database encryption enabled (Supabase default). Meta access tokens encrypted with AES-256-GCM.
- **Encryption in Transit**: HTTPS enforced for all connections. TLS 1.2+ required.
- **Sensitive Data**: No collection of CPF, medical records, or financial data via WhatsApp. Only profile, age range, preferences collected.
- **Data Retention**: Inactive leads deleted after 90 days. Conversation history retained for 30 days. Audit logs kept for 1 year.
- **Audit Logging**: Log all data access, modifications, and deletions with timestamps and user IDs.

### Webhook Security

- **Signature Validation**: All WhatsApp webhooks validated with HMAC SHA-256 signature. Reject invalid signatures with 401.
- **Replay Protection**: Timestamps verified within 5-minute window. Nonce tracking prevents replay attacks.
- **Error Handling**: Webhook errors logged but never expose internal details to external services.

## Performance Standards

### Response Time Requirements

- **API Routes**: P50 < 200ms, P95 < 500ms, P99 < 1000ms
- **AI Generation**: P95 < 3s (critical for WhatsApp UX)
- **Database Queries**: P95 < 100ms
- **Page Load**: First Contentful Paint (FCP) < 1.5s, Time to Interactive (TTI) < 3.5s
- **WhatsApp Messages**: Delivered within 5 seconds of user input

### Resource Limits

- **Bundle Size**: Main bundle < 200KB gzipped. Route bundles < 100KB gzipped.
- **Image Size**: Hero images < 200KB. Thumbnails < 50KB. Use WebP format.
- **Database Connections**: Connection pooling enabled. Max 20 concurrent connections per instance.
- **Memory Usage**: Server components use < 512MB RAM. Edge functions < 128MB.

### Monitoring and Alerts

- **Uptime**: 99.5% uptime target. Downtime > 5 minutes triggers alert.
- **Error Rates**: Error rate > 5% triggers alert. 500 errors escalate immediately.
- **Performance Degradation**: P95 latency increase > 50% triggers investigation.
- **Cost Monitoring**: Daily spending tracked. Alerts when approaching budget limits.

## Quality Gates

### Pre-Commit Checks

- ESLint passes with zero errors and warnings
- Prettier formatting applied
- TypeScript compilation successful
- Unit tests pass
- No console.log statements in production code

### Pre-Merge Checks

- All tests pass (unit, integration, E2E)
- Code coverage meets 80% threshold
- No new TypeScript errors introduced
- Performance benchmarks within acceptable range
- Security scan passes (dependency vulnerabilities)
- Code review approved by at least one reviewer

### Pre-Deployment Checks

- Staging environment tests pass
- Database migrations tested
- Environment variables verified
- Rollback plan documented
- Monitoring and alerts configured

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines. When conflicts arise, this document takes precedence. All team members must understand and follow these principles.

### Amendment Process

1. **Proposal**: Amendments proposed via GitHub issue with `constitution-amendment` label
2. **Discussion**: Minimum 7-day discussion period for team feedback
3. **Approval**: Requires 80% team approval (or project owner approval for critical changes)
4. **Migration Plan**: Breaking changes require migration guide and backward compatibility period
5. **Documentation**: Updated constitution merged with version bump following semantic versioning

### Version Bump Rules

- **MAJOR** (X.0.0): Backward-incompatible principle changes, removal of core requirements
- **MINOR** (0.X.0): New principles added, material expansions to existing sections
- **PATCH** (0.0.X): Clarifications, wording improvements, typo fixes

### Compliance Review

- **Weekly**: Development lead verifies recent PRs comply with constitution
- **Monthly**: Team review session to discuss pain points and potential amendments
- **Quarterly**: Full constitution review to ensure alignment with project evolution
- **Annual**: Major review for strategic alignment with business goals

### Enforcement

- PRs violating principles are blocked until corrected
- Repeated violations trigger mentoring sessions
- Critical violations (security, compliance) escalated immediately
- Documentation of exceptions maintained in `docs/constitution-exceptions.md`

### Runtime Guidance

For day-to-day development guidance, refer to:
- `.rules/development-standards.md` - Coding standards and conventions
- `.rules/coding-guidelines.md` - TypeScript and React patterns
- `.rules/architecture-rules.md` - System architecture patterns
- `.rules/testing-standards.md` - Testing philosophy and practices

---

**Version**: 1.0.0 | **Ratified**: 2026-01-12 | **Last Amended**: 2026-01-12
