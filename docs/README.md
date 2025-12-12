# Consultor.AI - Technical Documentation

This directory contains the complete technical documentation for the Consultor.AI project, an AI-powered WhatsApp assistant platform for autonomous salespeople.

## Documentation Index

### 📋 Requirements & Planning

#### [Software Requirements Specification (SRS)](technical/SRS-Software-Requirements-Specification.md)
**What the system must do**
- Functional requirements (FR) for all features
- Non-functional requirements (NFR) for performance, security, reliability
- Compliance requirements (LGPD, ANS, WhatsApp Business Policy)
- User stories and acceptance criteria
- Feature priorities (P0-P3)

**Read this when:** You need to understand what features to build and their acceptance criteria.

---

### 🏗️ Architecture & Design

#### [System Architecture Document (SAD)](architecture/SAD-System-Architecture-Document.md)
**How the system is structured**
- High-level architecture with component diagrams
- Technology stack decisions and rationale
- Integration patterns (WhatsApp, AI, Canva, Calendar, CRM)
- Security architecture and authentication flows
- Deployment architecture (development, staging, production)
- Event-driven architecture and data flows

**Read this when:** You need to understand the overall system design or make architectural decisions.

#### [Database Design Document](architecture/Database-Design-Document.md)
**How data is organized and stored**
- Complete PostgreSQL schema with all tables
- Entity-relationship diagrams
- Indexing strategy and query optimization
- Row-level security (RLS) policies for multi-tenancy
- Migration strategy with example migrations
- Backup and recovery procedures
- Materialized views for analytics

**Read this when:** You need to create or modify database tables, optimize queries, or implement data features.

---

### 🔌 API & Integrations

#### [API Specification](api/API-Specification.md)
**How to interact with the system**
- RESTful API endpoints with request/response examples
- Authentication and authorization (JWT-based)
- Error codes and handling patterns
- Webhook specifications for WhatsApp integration
- Rate limiting and security measures
- Pagination, filtering, and caching strategies
- SDK examples (TypeScript, Python)

**Read this when:** You need to build or consume API endpoints, integrate with webhooks, or implement API clients.

---

### 🚀 Implementation & Operations

#### [Technical Implementation Plan](technical/Implementation-Plan.md)
**How to build the system**
- 90-day roadmap with 4 phases (MVP → Enhancement → Scale → Iterate)
- Sprint breakdown with detailed tasks and estimates
- Testing strategy (unit, integration, E2E, load tests)
- CI/CD pipeline configuration (GitHub Actions)
- Deployment strategy and feature flags
- Monitoring and observability setup (Sentry, Better Stack)
- Cost management and optimization
- Risk management and mitigation strategies

**Read this when:** You need to plan development work, set up infrastructure, or understand the project timeline.

---

## Documentation Structure

```
docs/
├── README.md                           # This file
├── technical/
│   ├── SRS-Software-Requirements-Specification.md
│   └── Implementation-Plan.md
├── architecture/
│   ├── SAD-System-Architecture-Document.md
│   └── Database-Design-Document.md
├── api/
│   └── API-Specification.md
└── motivação/                          # Conceptual planning & prototypes
    ├── 0-Proposição Inicial.md
    ├── 1-Resposta 1.md
    ├── 3-Resposta 3.md
    └── snippets de exemplo/
        ├── fluxo_saude.json.json       # Working conversation flow
        ├── bot_mock.py.py              # CLI simulator for testing
        ├── gerar_resposta.txt.txt      # AI prompt template
        └── webhook_mock.py.py          # Webhook simulation
```

---

## Quick Navigation by Task

### 🎯 I want to...

**Understand what features to build**
→ Read [SRS](technical/SRS-Software-Requirements-Specification.md) sections 3 (Functional Requirements) and 4 (Non-Functional Requirements)

**Design a new feature**
→ Check [SAD](architecture/SAD-System-Architecture-Document.md) section 4 (Component Architecture)

**Create or modify database tables**
→ Reference [Database Design](architecture/Database-Design-Document.md) section 3 (Table Definitions)

**Build an API endpoint**
→ Follow [API Specification](api/API-Specification.md) patterns and conventions

**Plan a sprint or estimate work**
→ Review [Implementation Plan](technical/Implementation-Plan.md) section 3 (Sprint Breakdown)

**Set up my development environment**
→ See [Implementation Plan](technical/Implementation-Plan.md) section 13.1 (Development Environment Setup)

**Understand compliance requirements**
→ Check [SRS](technical/SRS-Software-Requirements-Specification.md) section 4.7 (Compliance Requirements)

**Deploy to production**
→ Follow [Implementation Plan](technical/Implementation-Plan.md) section 6 (Deployment Strategy)

**Test conversation flows**
→ Use `motivação/snippets de exemplo/bot_mock.py.py` CLI simulator

---

## Document Conventions

### Version Control
All documents include a revision history table at the end tracking:
- Version number
- Date of changes
- Author
- Summary of changes

### Cross-References
Documents reference each other using relative paths:
- Internal references: `See section 4.2`
- External references: `See docs/architecture/SAD-System-Architecture-Document.md section 4`

### Code Examples
Code examples use syntax highlighting:
- TypeScript: `typescript`
- SQL: `sql`
- Bash: `bash`
- JSON: `json`

### Diagrams
ASCII diagrams are used for architecture visualizations to ensure plain-text compatibility and version control friendliness.

---

## Contributing to Documentation

### When to Update Documentation

**Always update documentation when:**
- Adding a new feature (update SRS with requirements)
- Changing architecture (update SAD with new design)
- Modifying database schema (update Database Design with new tables/columns)
- Adding API endpoints (update API Specification)
- Changing development process (update Implementation Plan)

### Documentation Review Process

1. Make changes to relevant documentation files
2. Update revision history at end of document
3. Submit pull request with documentation changes
4. Documentation review required before merging
5. Keep documentation and code in sync

---

## Additional Resources

### External Documentation
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **WhatsApp Business API**: https://developers.facebook.com/docs/whatsapp
- **Groq API**: https://console.groq.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/

### Regulatory Resources
- **LGPD**: http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- **ANS Resolution 195/2009**: https://www.ans.gov.br/component/legislacao/?view=legislacao&task=textoLei&format=raw&id=1469
- **WhatsApp Business Policy**: https://www.whatsapp.com/legal/business-policy

---

## Document Status

| Document | Status | Last Updated | Version |
|----------|--------|--------------|---------|
| SRS | Draft | 2025-12-12 | 1.0 |
| SAD | Draft | 2025-12-12 | 1.0 |
| Database Design | Draft | 2025-12-12 | 1.0 |
| API Specification | Draft | 2025-12-12 | 1.0 |
| Implementation Plan | Draft | 2025-12-12 | 1.0 |

**Status Definitions:**
- **Draft**: Initial version, subject to significant changes
- **Review**: Under review by team
- **Approved**: Approved for implementation
- **Final**: Finalized and in use

---

## Contact & Support

For questions about this documentation:
1. Check the relevant document's appendices for FAQs
2. Review the Quick Navigation section above
3. Consult the Implementation Plan for development guidance

---

*Last updated: 2025-12-12*
