# System Architecture Document (SAD)
## Consultor.AI - AI-Powered Sales Assistant Platform

**Version:** 1.0
**Date:** 2025-12-12
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose
This document describes the architecture of Consultor.AI, providing a comprehensive architectural overview of the system using different architectural views to depict different aspects of the system.

### 1.2 Scope
This document covers the architectural design for the MVP and production versions of Consultor.AI, including:
- System context and boundaries
- Component architecture
- Data architecture
- Deployment architecture
- Security architecture
- Integration patterns

### 1.3 Architectural Goals and Constraints

#### Goals
- **Scalability**: Support growth from 10 to 10,000 consultants
- **Cost Efficiency**: Minimize operational costs (target: < R$50/month for MVP)
- **Low Latency**: AI responses in < 3 seconds
- **Reliability**: 99.5% uptime SLA
- **Maintainability**: Enable rapid feature development
- **Compliance**: Meet LGPD and ANS regulatory requirements

#### Constraints
- Must use free tier services for MVP
- Must integrate with WhatsApp Business API
- Must support Brazilian Portuguese
- Limited budget for third-party services
- Small development team (1-3 developers)

---

## 2. Architectural Representation

### 2.1 Architectural Style
The system follows a **microservices-inspired architecture** with the following characteristics:
- **Event-driven**: Webhook-triggered processing
- **Serverless**: Edge functions for business logic
- **API-first**: RESTful APIs with OpenAPI specification
- **JAMstack**: Static frontend with API backend

### 2.2 Architectural Patterns
- **Repository Pattern**: Data access abstraction
- **Strategy Pattern**: Pluggable conversation flows
- **Chain of Responsibility**: Message processing pipeline
- **Template Method**: AI prompt construction
- **Observer Pattern**: Real-time dashboard updates

---

## 3. System Context

### 3.1 Context Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       External Systems                          │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │WhatsApp  │  │  Groq    │  │  Canva   │  │ Google   │      │
│  │Business  │  │   API    │  │   API    │  │ Calendar │      │
│  │   API    │  │          │  │          │  │          │      │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘      │
│        │             │              │             │            │
└────────┼─────────────┼──────────────┼─────────────┼────────────┘
         │             │              │             │
         │             │              │             │
         ▼             ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONSULTOR.AI                               │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Frontend   │◄───┤   Backend    │◄───┤   Database   │    │
│  │   (Next.js)  │    │  (Supabase)  │    │ (PostgreSQL) │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │                                            │
         ▼                                            ▼
┌────────────────┐                          ┌────────────────┐
│  Consultant    │                          │     Lead       │
│  (Web Portal)  │                          │  (WhatsApp)    │
└────────────────┘                          └────────────────┘
```

### 3.2 System Boundaries
**Inside System Boundary:**
- Consultant web portal
- Conversation flow engine
- AI orchestration layer
- Lead management system
- Analytics engine
- Database

**Outside System Boundary:**
- WhatsApp messaging infrastructure
- AI model training and hosting (Groq)
- Image generation service (Canva)
- Calendar services
- External CRMs

---

## 4. Component Architecture

### 4.1 High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│  ┌──────────────────────────────────────────────────────┐      │
│  │          Next.js Web Application                     │      │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │      │
│  │  │ Landing    │  │Consultant  │  │  Lead      │    │      │
│  │  │ Pages      │  │ Dashboard  │  │ Management │    │      │
│  │  └────────────┘  └────────────┘  └────────────┘    │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Supabase API Gateway                         │      │
│  │  - Authentication (JWT)                              │      │
│  │  - Rate Limiting                                     │      │
│  │  - Request Validation                                │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                         │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Conversation  │  │      AI        │  │   Content      │  │
│  │    Engine      │  │ Orchestration  │  │  Generator     │  │
│  │  - Flow Parser │  │ - Prompt Build │  │ - Image Gen    │  │
│  │  - State Mgmt  │  │ - Response Val │  │ - Templating   │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │     Lead       │  │   Analytics    │  │  Integration   │  │
│  │  Management    │  │    Service     │  │    Service     │  │
│  │  - CRUD Ops    │  │ - Metrics Calc │  │ - Calendar     │  │
│  │  - Export      │  │ - Funnel Track │  │ - CRM Sync     │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Access Layer                          │
│  ┌──────────────────────────────────────────────────────┐      │
│  │         Repository Pattern Implementation             │      │
│  │  - ConsultantRepository                              │      │
│  │  - LeadRepository                                    │      │
│  │  - FlowRepository                                    │      │
│  │  - ConversationStateRepository                       │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Storage Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ PostgreSQL  │  │   Redis     │  │  S3/Storage │            │
│  │  (Primary)  │  │  (Cache)    │  │   (Files)   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Descriptions

#### 4.2.1 Conversation Engine
**Responsibilities:**
- Parse JSON flow definitions
- Manage conversation state
- Determine next conversation step
- Handle user input validation
- Execute flow actions

**Technologies:** TypeScript, Supabase Edge Functions

**Key Interfaces:**
- `executeFlow(leadId, userInput): NextStep`
- `loadFlow(flowId): FlowDefinition`
- `saveState(leadId, state): void`

#### 4.2.2 AI Orchestration Service
**Responsibilities:**
- Construct AI prompts with context
- Call Groq API with retry logic
- Validate AI responses for compliance
- Cache frequent responses
- Monitor token usage

**Technologies:** TypeScript, Groq SDK

**Key Interfaces:**
- `generateResponse(context, lead, consultant): AIResponse`
- `validateCompliance(response): ValidationResult`
- `buildPrompt(template, variables): string`

#### 4.2.3 Content Generator
**Responsibilities:**
- Generate comparison images via Canva API
- Populate templates with dynamic data
- Optimize images for WhatsApp
- Cache generated content

**Technologies:** TypeScript, Canva API, Sharp (image processing)

**Key Interfaces:**
- `generateComparisonImage(products, consultant): ImageURL`
- `populateTemplate(templateId, data): Template`

#### 4.2.4 Lead Management Service
**Responsibilities:**
- CRUD operations for leads
- Status tracking and transitions
- Lead assignment to consultants
- Export functionality
- Search and filtering

**Technologies:** TypeScript, Supabase

**Key Interfaces:**
- `createLead(whatsapp, consultantId): Lead`
- `updateLeadStatus(leadId, status): void`
- `exportLeads(consultantId, filters): CSV`
- `searchLeads(query, filters): Lead[]`

#### 4.2.5 Analytics Service
**Responsibilities:**
- Calculate conversion metrics
- Track funnel performance
- Generate reports
- Real-time metric updates

**Technologies:** TypeScript, PostgreSQL (with materialized views)

**Key Interfaces:**
- `getConversionMetrics(consultantId, dateRange): Metrics`
- `getFunnelAnalysis(flowId): FunnelData`
- `getFlowPerformance(consultantId): FlowMetrics`

---

## 5. Data Architecture

### 5.1 Entity Relationship Diagram

```
┌─────────────────┐
│   consultants   │
├─────────────────┤
│ id (PK)         │
│ email           │◄───────┐
│ name            │        │
│ bio             │        │
│ crm_number      │        │
│ whatsapp_number │        │
│ vertical        │        │
│ slug            │        │ 1:N
│ created_at      │        │
│ updated_at      │        │
└─────────────────┘        │
                           │
                           │
┌─────────────────┐        │
│     leads       │        │
├─────────────────┤        │
│ id (PK)         │        │
│ consultant_id   │────────┘
│ whatsapp_number │
│ name            │
│ status          │
│ respostas       │ (JSONB)
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│  conversations  │       │     flows       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ lead_id (FK)    │       │ name            │
│ flow_id (FK)    │───────┤ vertical        │
│ current_step    │       │ definition      │ (JSONB)
│ state           │ (JSONB)│ version         │
│ started_at      │       │ is_active       │
│ updated_at      │       │ created_at      │
└─────────────────┘       └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    messages     │
├─────────────────┤
│ id (PK)         │
│ conversation_id │
│ direction       │ (inbound/outbound)
│ content         │
│ message_type    │ (text/image/button)
│ whatsapp_id     │
│ created_at      │
└─────────────────┘


┌─────────────────┐       ┌─────────────────┐
│   ai_responses  │       │  generated_imgs │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ lead_id (FK)    │       │ lead_id (FK)    │
│ prompt          │       │ template_id     │
│ response        │       │ data            │ (JSONB)
│ model           │       │ image_url       │
│ tokens_used     │       │ created_at      │
│ latency_ms      │       └─────────────────┘
│ created_at      │
└─────────────────┘


┌─────────────────┐
│ webhook_events  │
├─────────────────┤
│ id (PK)         │
│ event_type      │
│ payload         │ (JSONB)
│ processed       │
│ error_msg       │
│ received_at     │
│ processed_at    │
└─────────────────┘
```

### 5.2 Data Flow

#### 5.2.1 Lead Capture Flow
```
WhatsApp → Webhook → Event Validation → Lead Creation →
Flow Initialization → First Message → State Persistence
```

#### 5.2.2 Conversation Flow
```
User Message → Webhook → Load State → Parse Input →
Determine Next Step → Execute Action → Generate Response →
Update State → Send WhatsApp Message → Persist
```

#### 5.2.3 AI Response Flow
```
Trigger → Load Context (Lead + Consultant + Responses) →
Build Prompt → Call Groq API → Validate Compliance →
Store Response → Return to Conversation Engine
```

---

## 6. Deployment Architecture

### 6.1 Production Deployment Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Vercel Edge Network                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │            Next.js Application (SSG/SSR)               │     │
│  │  - Static pages cached at edge                         │     │
│  │  - API routes proxied to Supabase                      │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Supabase Cloud (AWS)                        │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│  │  PostgreSQL 14  │  │  Edge Functions │  │   Realtime      ││
│  │  - Primary DB   │  │  - Webhooks     │  │   (WebSocket)   ││
│  │  - Replication  │  │  - Business     │  │                 ││
│  │  - Backups      │  │    Logic        │  │                 ││
│  └─────────────────┘  └─────────────────┘  └─────────────────┘│
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │   Auth Service  │  │   Storage       │                      │
│  │   (GoTrue)      │  │   (S3-compat)   │                      │
│  └─────────────────┘  └─────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
         │                       │                        │
         │                       │                        │
         ▼                       ▼                        ▼
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│  Groq API      │    │  Canva API     │    │ WhatsApp API   │
│  (External)    │    │  (External)    │    │ (Weni Cloud)   │
└────────────────┘    └────────────────┘    └────────────────┘
```

### 6.2 Environment Configuration

#### Development
- **Frontend**: localhost:3000 (Next.js dev server)
- **Backend**: Supabase local (Docker)
- **Database**: PostgreSQL local
- **Webhooks**: ngrok tunnel

#### Staging
- **Frontend**: staging.consultor.ai (Vercel preview)
- **Backend**: Supabase staging project
- **Database**: Supabase staging database
- **Webhooks**: Weni test environment

#### Production
- **Frontend**: consultor.ai (Vercel production)
- **Backend**: Supabase production project
- **Database**: Supabase production (multi-region)
- **Webhooks**: Weni production

### 6.3 Infrastructure as Code
```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["gru1"],  # São Paulo region
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

---

## 7. Security Architecture

### 7.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                  │
│  - TLS 1.3 encryption                                       │
│  - DDoS protection (Vercel/Cloudflare)                      │
│  - Rate limiting (per IP, per user)                         │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Authentication & Authorization                    │
│  - JWT-based authentication                                 │
│  - Row-level security (RLS) in PostgreSQL                   │
│  - API key validation for webhooks                          │
│  - Multi-factor authentication (TOTP)                       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Application Security                              │
│  - Input validation (Zod schemas)                           │
│  - SQL injection prevention (parameterized queries)         │
│  - XSS protection (Content Security Policy)                 │
│  - CSRF protection (SameSite cookies)                       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Data Security                                     │
│  - Encryption at rest (AES-256)                             │
│  - Encryption in transit (TLS 1.3)                          │
│  - PII anonymization in logs                                │
│  - Secure secret management (Vercel env vars)               │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Authentication Flow

```
┌──────────┐                ┌──────────┐               ┌──────────┐
│          │                │          │               │          │
│  Client  │                │  Next.js │               │ Supabase │
│          │                │          │               │   Auth   │
└────┬─────┘                └────┬─────┘               └────┬─────┘
     │                           │                          │
     │  1. Login Request         │                          │
     ├──────────────────────────►│                          │
     │                           │  2. Validate & Forward   │
     │                           ├─────────────────────────►│
     │                           │                          │
     │                           │  3. Generate JWT         │
     │                           │◄─────────────────────────┤
     │  4. Return JWT            │                          │
     │◄──────────────────────────┤                          │
     │                           │                          │
     │  5. API Request + JWT     │                          │
     ├──────────────────────────►│                          │
     │                           │  6. Verify JWT           │
     │                           ├─────────────────────────►│
     │                           │  7. User Data            │
     │                           │◄─────────────────────────┤
     │  8. Response              │                          │
     │◄──────────────────────────┤                          │
```

### 7.3 Data Privacy (LGPD Compliance)

**Principles:**
1. **Data Minimization**: Collect only necessary data
2. **Purpose Limitation**: Use data only for stated purpose
3. **Consent**: Obtain explicit consent before processing
4. **Right to Access**: Allow users to view their data
5. **Right to Delete**: Allow users to request data deletion
6. **Data Portability**: Provide data export in machine-readable format

**Implementation:**
- Consent checkbox during consultant registration
- Privacy policy page
- "Export my data" button in dashboard
- "Delete my account" with 30-day retention for compliance
- Audit log of all data access

---

## 8. Integration Architecture

### 8.1 WhatsApp Integration Pattern

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │  Webhook│              │ Process │              │
│  WhatsApp    ├────────►│  Edge Func   ├────────►│ Conversation │
│  (Weni)      │  POST   │  /webhook    │  Queue  │   Engine     │
│              │         │              │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       ▲                                                   │
       │                                                   │
       │                Send Message                       │
       └───────────────────────────────────────────────────┘
```

**Retry Logic:**
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Maximum 5 retries
- Dead letter queue for failed messages

### 8.2 AI Integration Pattern

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │ Request │              │  API    │              │
│  AI Orch.    ├────────►│  Cache Layer ├────────►│  Groq API    │
│  Service     │         │  (Redis)     │  Call   │              │
│              │◄────────┤              │◄────────┤              │
└──────────────┘Response └──────────────┘ Response└──────────────┘
```

**Caching Strategy:**
- Cache key: `hash(prompt + consultant_id + lead_profile)`
- TTL: 24 hours
- Cache invalidation: On consultant profile update

### 8.3 Event-Driven Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Event Bus (Supabase Realtime)         │
└──────────────────────────────────────────────────────────┘
         │                  │                   │
         │ lead.created     │ conversation.    │ message.sent
         │                  │ completed         │
         ▼                  ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Analytics   │   │   Dashboard  │   │   Webhook    │
│  Updater     │   │   Notifier   │   │   Forwarder  │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 9. Technology Stack Decisions

### 9.1 Frontend: Next.js 14

**Rationale:**
- Server-side rendering for SEO
- API routes for BFF pattern
- Excellent developer experience
- Built-in optimization (images, fonts)
- Vercel deployment integration

**Alternatives Considered:**
- React SPA: Worse SEO, no SSR
- Vue/Nuxt: Less ecosystem maturity for our use case

### 9.2 Backend: Supabase

**Rationale:**
- PostgreSQL with built-in auth
- Row-level security (RLS)
- Real-time subscriptions
- Edge functions (Deno)
- Generous free tier
- Managed infrastructure

**Alternatives Considered:**
- Firebase: NoSQL less suitable for relational data
- Custom Node.js: Higher operational overhead
- AWS Amplify: Steeper learning curve

### 9.3 AI: Groq + Llama 3.1

**Rationale:**
- 3x faster than OpenAI (hardware acceleration)
- Lower cost (R$0.03 vs R$0.15 per 1k tokens)
- Open-source model (Llama 3.1)
- Good Portuguese support
- Sufficient quality for conversational use

**Alternatives Considered:**
- OpenAI GPT-4: Higher cost, slower
- Anthropic Claude: Not available in Brazil
- Self-hosted: Too much operational overhead

### 9.4 WhatsApp: Weni Cloud

**Rationale:**
- Official WhatsApp Business API
- No risk of number blocking
- Brazilian company (local support)
- Template message approval
- Webhook infrastructure included

**Alternatives Considered:**
- WhatsApp Web + Puppeteer: Risk of blocking
- Twilio: Higher cost
- Direct 360dialog: More complex setup

---

## 10. Performance Architecture

### 10.1 Performance Optimization Strategies

**Frontend:**
- Static page generation for landing pages
- Image optimization (Next.js Image component)
- Code splitting and lazy loading
- CDN caching (Vercel Edge Network)

**Backend:**
- Database connection pooling
- Prepared statements
- Materialized views for analytics
- Redis caching for hot data

**AI:**
- Prompt caching (identical prompts)
- Response streaming (future)
- Batch processing for bulk operations

### 10.2 Scalability Strategy

**Horizontal Scaling:**
- Stateless edge functions (auto-scale)
- Database read replicas
- CDN for static assets

**Vertical Scaling:**
- Database: Supabase Pro tier (8GB RAM → 32GB RAM)
- Redis: Upstash Pro tier

**Monitoring:**
- Latency: p50, p95, p99 tracking
- Error rate: <1% target
- Database query performance: <100ms average

---

## 11. Disaster Recovery and Backup

### 11.1 Backup Strategy

**Database:**
- Automated daily backups (Supabase)
- Point-in-time recovery (7-day window)
- Weekly full backup export to S3

**Configuration:**
- Version control for all code (Git)
- Environment variables in secure vault (Vercel)
- Infrastructure as code (Terraform/Pulumi for future)

### 11.2 Recovery Procedures

**Database Corruption:**
1. Identify corruption time
2. Restore from PITR to 1 hour before corruption
3. Replay transactions from audit log
4. Verify data integrity

**Complete Service Outage:**
1. Switch to Supabase backup region
2. Update DNS (5-minute TTL)
3. Verify functionality
4. Investigate root cause

**RTO (Recovery Time Objective):** 1 hour
**RPO (Recovery Point Objective):** 15 minutes

---

## 12. Future Architectural Considerations

### 12.1 Multi-Region Deployment
- Primary: AWS São Paulo (gru1)
- Secondary: AWS Rio de Janeiro (future)
- Data replication strategy

### 12.2 Microservices Split
Current monolithic edge functions may be split:
- Conversation service
- AI orchestration service
- Integration service
- Analytics service

### 12.3 Message Queue Introduction
Replace synchronous processing with queues:
- RabbitMQ or AWS SQS
- Retry and dead-letter handling
- Better scalability under load

---

## 13. Appendices

### 13.1 Technology Versions
- Next.js: 14.x
- React: 18.x
- TypeScript: 5.x
- Supabase JS: 2.x
- PostgreSQL: 14.x
- Node.js: 20.x LTS

### 13.2 References
- Next.js Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Groq API: https://console.groq.com/docs

### 13.3 Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-12 | Initial | First draft of architecture document |
