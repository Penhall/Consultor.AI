# Technical Implementation Plan
## Consultor.AI - AI-Powered Sales Assistant Platform

**Version:** 1.0
**Date:** 2025-12-12
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Project Overview
Consultor.AI will be developed in **4 phases over 90 days**, targeting an MVP release in 30 days with subsequent feature iterations. The implementation follows agile methodology with 2-week sprints.

### 1.2 Development Team Structure
- **Phase 1 (MVP):** 1-2 developers (full-stack)
- **Phase 2-4:** 2-3 developers (backend, frontend, QA)

### 1.3 Timeline Overview
```
Day 1-30:   MVP (Core features)
Day 31-60:  Enhancement (Pro features)
Day 61-90:  Scale (Agency features + optimization)
Day 90+:    Iterate (Based on user feedback)
```

---

## 2. Development Phases

### Phase 1: MVP Foundation (Days 1-30)

**Goal:** Launch functional platform with core features for 1 vertical (health plans).

**Deliverables:**
- Consultant registration and authentication
- Landing page with unique consultant links
- WhatsApp integration with basic flow
- AI-powered response generation
- Simple lead management dashboard
- PostgreSQL database with core schema

**Success Criteria:**
- 5 beta consultants onboarded
- 50+ leads processed successfully
- < 3s AI response time
- Zero data breaches

---

### Phase 2: Enhancement (Days 31-60)

**Goal:** Add premium features and polish user experience.

**Deliverables:**
- Image generation (Canva API)
- Advanced analytics dashboard
- Lead export functionality
- Flow customization (basic)
- Email notifications
- Multi-flow support

**Success Criteria:**
- 20 paying consultants
- 500+ leads processed
- 90% user satisfaction
- < 100ms database query time

---

### Phase 3: Scale (Days 61-90)

**Goal:** Optimize for scale and add enterprise features.

**Deliverables:**
- Second vertical (real estate)
- Calendar integration (Google Calendar)
- CRM integration (RD Station)
- Advanced flow editor (drag-and-drop)
- Performance optimizations
- Comprehensive monitoring

**Success Criteria:**
- 100 active consultants
- 5,000+ leads processed
- 99.5% uptime
- Support for 2 verticals

---

### Phase 4: Iterate (Days 90+)

**Goal:** Continuous improvement based on user feedback.

**Deliverables:**
- Voice cloning feature
- Template marketplace
- White-label option
- Mobile app (future)
- Additional integrations

---

## 3. Sprint Breakdown

### Sprint 1 (Days 1-7): Foundation

**Stories:**
1. **Setup Development Environment**
   - Initialize Next.js project with TypeScript
   - Configure Supabase local instance
   - Setup Git repository and CI/CD
   - **Estimate:** 4 hours

2. **Implement Database Schema**
   - Create migration files for core tables
   - Implement RLS policies
   - Add indexes and constraints
   - **Estimate:** 8 hours

3. **Build Authentication System**
   - Implement registration endpoint
   - Implement login/logout
   - Setup JWT handling
   - Create auth middleware
   - **Estimate:** 12 hours

4. **Create Consultant Profile Management**
   - Profile CRUD endpoints
   - Slug generation logic
   - Profile update UI
   - **Estimate:** 10 hours

**Total Effort:** 34 hours (~1 week for 1 developer)

**Definition of Done:**
- Unit tests passing (>80% coverage)
- API documentation updated
- Local testing successful
- Code review completed

---

### Sprint 2 (Days 8-14): Conversation Engine

**Stories:**
1. **Implement Flow Parser**
   - JSON schema validation
   - Flow execution engine
   - State management
   - **Estimate:** 16 hours

2. **Build WhatsApp Webhook Handler**
   - Signature verification
   - Message parsing
   - Idempotency handling
   - Error retry logic
   - **Estimate:** 12 hours

3. **Integrate AI Response Generation**
   - Groq API integration
   - Prompt engineering
   - Compliance validation
   - Response caching
   - **Estimate:** 14 hours

4. **Create Lead Management**
   - Lead creation/update
   - Status management
   - Search and filtering
   - **Estimate:** 10 hours

**Total Effort:** 52 hours

**Definition of Done:**
- End-to-end conversation flow works
- AI responses comply with regulations
- Webhook handles 100 msg/min
- Integration tests passing

---

### Sprint 3 (Days 15-21): Dashboard & Analytics

**Stories:**
1. **Build Consultant Dashboard**
   - Lead list view with filters
   - Lead detail view
   - Conversation history
   - **Estimate:** 16 hours

2. **Implement Analytics**
   - Metrics calculation
   - Funnel analysis
   - Charts and visualizations
   - **Estimate:** 12 hours

3. **Create Landing Page Builder**
   - Public consultant profile
   - Custom slug routing
   - WhatsApp click-to-chat
   - **Estimate:** 10 hours

4. **Add Real-time Updates**
   - WebSocket integration (Supabase Realtime)
   - Live dashboard updates
   - **Estimate:** 8 hours

**Total Effort:** 46 hours

**Definition of Done:**
- Dashboard loads < 2 seconds
- Real-time updates work reliably
- Public pages SEO-optimized
- Responsive on mobile

---

### Sprint 4 (Days 22-30): Polish & Launch

**Stories:**
1. **Deployment & DevOps**
   - Production environment setup (Vercel + Supabase)
   - Environment variable configuration
   - Domain setup and SSL
   - Monitoring (Sentry)
   - **Estimate:** 12 hours

2. **Testing & QA**
   - End-to-end testing
   - Load testing (100 concurrent users)
   - Security audit
   - Fix critical bugs
   - **Estimate:** 16 hours

3. **Documentation**
   - API documentation finalization
   - User onboarding guide
   - Admin documentation
   - **Estimate:** 8 hours

4. **Beta Launch**
   - Onboard 5 beta consultants
   - Collect feedback
   - Monitor performance
   - **Estimate:** 8 hours

**Total Effort:** 44 hours

**Definition of Done:**
- Production deployed successfully
- All critical bugs resolved
- Beta users onboarded
- Monitoring dashboards active

---

## 4. Technology Stack Implementation

### 4.1 Frontend (Next.js)

**Structure:**
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── leads/
│   │   └── analytics/
│   ├── (public)/
│   │   └── [slug]/
│   └── api/
│       └── webhooks/
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── leads/
│   ├── analytics/
│   └── layout/
├── lib/
│   ├── supabase.ts
│   ├── api-client.ts
│   └── utils.ts
└── types/
    └── database.ts  # Generated from Supabase
```

**Key Libraries:**
- `next`: 14.x (App Router)
- `react`: 18.x
- `@supabase/supabase-js`: 2.x
- `@tanstack/react-query`: For data fetching
- `zustand`: State management
- `zod`: Runtime validation
- `recharts`: Analytics charts
- `tailwindcss`: Styling
- `shadcn/ui`: Component library

**Implementation Priorities:**
1. Authentication pages (login, register)
2. Dashboard layout and navigation
3. Lead management UI
4. Analytics visualizations
5. Public consultant profile pages

---

### 4.2 Backend (Supabase)

**Edge Functions:**
```
supabase/
├── functions/
│   ├── whatsapp-webhook/
│   │   └── index.ts
│   ├── process-message/
│   │   └── index.ts
│   ├── generate-ai-response/
│   │   └── index.ts
│   └── generate-image/
│       └── index.ts
├── migrations/
│   ├── 20251201000000_initial_schema.sql
│   ├── 20251202000000_add_flows.sql
│   └── 20251203000000_add_analytics_views.sql
└── seed.sql
```

**Key Services:**
- **Authentication:** Supabase Auth (GoTrue)
- **Database:** PostgreSQL with RLS
- **Storage:** Supabase Storage (S3-compatible)
- **Realtime:** WebSocket subscriptions

**Implementation Priorities:**
1. Database migrations
2. RLS policies
3. Webhook handler edge function
4. AI response generation function
5. Analytics materialized views

---

### 4.3 External Integrations

**Priority Order:**
1. **WhatsApp (Weni Cloud)** - Day 10
   - Account setup
   - Webhook configuration
   - Message templates approval

2. **AI (Groq API)** - Day 12
   - API key setup
   - Prompt engineering
   - Rate limiting implementation

3. **Image Generation (Canva API)** - Day 40 (Phase 2)
   - Template creation
   - API integration
   - Image optimization

4. **Calendar (Google Calendar)** - Day 70 (Phase 3)
   - OAuth setup
   - Event creation
   - Availability checking

5. **CRM (RD Station)** - Day 80 (Phase 3)
   - API integration
   - Field mapping
   - Sync logic

---

## 5. Testing Strategy

### 5.1 Unit Tests
- **Tool:** Vitest
- **Coverage Target:** 80%
- **Focus Areas:**
  - Utility functions
  - API route handlers
  - Business logic (flow parser, AI orchestration)

**Example:**
```typescript
// tests/lib/flow-parser.test.ts
import { describe, it, expect } from 'vitest';
import { FlowParser } from '@/lib/flow-parser';

describe('FlowParser', () => {
  it('should parse valid flow definition', () => {
    const flow = { etapas: [...] };
    const parser = new FlowParser(flow);
    expect(parser.isValid()).toBe(true);
  });

  it('should reject invalid flow definition', () => {
    const flow = { invalid: true };
    const parser = new FlowParser(flow);
    expect(parser.isValid()).toBe(false);
  });
});
```

---

### 5.2 Integration Tests
- **Tool:** Playwright
- **Focus Areas:**
  - API endpoints
  - Database operations
  - External API mocking

**Example:**
```typescript
// tests/api/leads.test.ts
import { test, expect } from '@playwright/test';

test('should create lead via webhook', async ({ request }) => {
  const response = await request.post('/api/webhooks/whatsapp/message', {
    data: {
      message: { from: '5511999999999', text: { body: 'Olá' } }
    }
  });
  expect(response.status()).toBe(200);

  // Verify lead created in database
  const lead = await db.leads.findFirst({
    where: { whatsapp_number: '+5511999999999' }
  });
  expect(lead).toBeDefined();
});
```

---

### 5.3 End-to-End Tests
- **Tool:** Playwright
- **Coverage:** Critical user journeys
- **Frequency:** Before each deployment

**Test Scenarios:**
1. Consultant registration and profile setup
2. Lead receives message → AI responds → conversation completes
3. Consultant views lead in dashboard
4. Export leads to CSV
5. Update lead status

---

### 5.4 Load Testing
- **Tool:** k6
- **Target:** 100 concurrent users, 1000 req/min
- **Metrics:** Response time, error rate, throughput

**Test Script:**
```javascript
// tests/load/webhook-load.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up
    { duration: '5m', target: 100 }, // Sustained load
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% under 3s
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
};

export default function () {
  const payload = JSON.stringify({
    message: { from: '5511999999999', text: { body: 'Teste' } }
  });

  const res = http.post('https://api.consultor.ai/webhooks/whatsapp/message', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
  });
}
```

---

## 6. Deployment Strategy

### 6.1 Environments

| Environment | URL | Purpose | Database | Deployment |
|-------------|-----|---------|----------|------------|
| **Local** | localhost:3000 | Development | Local Supabase | Manual |
| **Staging** | staging.consultor.ai | QA/Testing | Supabase Staging | Auto (main branch) |
| **Production** | consultor.ai | Live users | Supabase Production | Manual approval |

---

### 6.2 CI/CD Pipeline

**Tool:** GitHub Actions

**Pipeline Stages:**
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: staging

  deploy-production:
    needs: test
    if: github.event_name == 'release'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

---

### 6.3 Database Migration Strategy

**Process:**
1. Write migration file locally
2. Test on local Supabase instance
3. Deploy to staging via CLI
4. Run integration tests
5. Deploy to production (with backup)

**Rollback Plan:**
- Keep previous migration for 7 days
- Point-in-time recovery available (7-day window)
- Automatic backup before migration

**Example Migration:**
```sql
-- migrations/20251215000000_add_flow_templates.sql
BEGIN;

CREATE TABLE flow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  vertical VARCHAR(50) NOT NULL,
  definition JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraint
ALTER TABLE flows
  ADD COLUMN template_id UUID REFERENCES flow_templates(id);

COMMIT;
```

---

### 6.4 Feature Flags

**Tool:** Vercel Edge Config or simple database table

**Use Cases:**
- Gradual rollout of new features
- A/B testing
- Emergency kill switch

**Implementation:**
```typescript
// lib/feature-flags.ts
export async function isFeatureEnabled(
  feature: string,
  consultantId: string
): Promise<boolean> {
  const flags = await db.feature_flags.findFirst({
    where: { feature, consultant_id: consultantId }
  });
  return flags?.enabled ?? false;
}

// Usage
if (await isFeatureEnabled('image_generation', consultantId)) {
  // Generate image
}
```

---

## 7. Monitoring and Observability

### 7.1 Application Monitoring

**Tool:** Sentry

**Tracked Metrics:**
- Error rate and stack traces
- Performance (transaction traces)
- User sessions
- Custom events (lead created, conversation completed)

**Setup:**
```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Scrub PII
    if (event.request?.data) {
      delete event.request.data.whatsapp_number;
    }
    return event;
  }
});
```

---

### 7.2 Database Monitoring

**Tool:** Supabase Dashboard + Custom Alerts

**Metrics:**
- Query performance (slow query log)
- Connection pool usage
- Table size and bloat
- Replication lag

**Alerts:**
- Query time > 1s: Warning
- Connection pool > 80%: Warning
- Disk usage > 85%: Critical

---

### 7.3 External API Monitoring

**Tracked Services:**
- WhatsApp API (Weni)
- Groq API
- Canva API

**Metrics:**
- Request latency
- Error rate
- Rate limit remaining
- Cost tracking (tokens used)

**Implementation:**
```typescript
// lib/api-monitor.ts
export async function callGroqAPI(prompt: string) {
  const start = Date.now();
  try {
    const response = await groq.chat.completions.create({ ... });
    const latency = Date.now() - start;

    await db.ai_responses.create({
      prompt,
      response: response.choices[0].message.content,
      latency_ms: latency,
      tokens_used: response.usage.total_tokens
    });

    return response;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { service: 'groq' },
      extra: { prompt }
    });
    throw error;
  }
}
```

---

### 7.4 Uptime Monitoring

**Tool:** Better Stack (formerly Better Uptime)

**Checks:**
- Homepage (https://consultor.ai)
- API health endpoint (https://api.consultor.ai/health)
- Dashboard (https://consultor.ai/dashboard)

**Frequency:** Every 1 minute

**Alerting:** Email + Slack

---

## 8. Security Implementation

### 8.1 Authentication Security

**Measures:**
- Password hashing (bcrypt, cost factor 12)
- JWT with short expiry (1 hour)
- Refresh tokens (7 days, single-use)
- Account lockout after 5 failed login attempts
- Email verification required

---

### 8.2 API Security

**Measures:**
- Rate limiting (per IP, per user)
- Request validation (Zod schemas)
- CORS configuration (whitelist origins)
- Webhook signature verification (HMAC-SHA256)
- SQL injection prevention (parameterized queries)
- XSS prevention (Content Security Policy)

**CSP Header:**
```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://api.consultor.ai https://*.supabase.co;
  frame-ancestors 'none';
`;
```

---

### 8.3 Data Security

**Measures:**
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- PII anonymization in logs
- Row-level security (RLS) in database
- Regular security audits
- LGPD compliance (data export, deletion)

---

## 9. Cost Management

### 9.1 Infrastructure Costs (Monthly Estimate)

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| Vercel | Hobby → Pro | R$0 → R$100 | Free for MVP, Pro at scale |
| Supabase | Free → Pro | R$0 → R$125 | Free for <500 users |
| Groq API | Pay-as-go | R$50-200 | Varies by usage |
| Weni Cloud | Starter | R$90 | WhatsApp API access |
| Canva API | Pro | R$65 | Image generation |
| Sentry | Developer | R$0 | Free tier sufficient |
| Better Stack | Free | R$0 | Free tier sufficient |
| **Total (MVP)** | | **R$90** | |
| **Total (Scale)** | | **R$530** | At 100 consultants |

### 9.2 Cost Optimization Strategies

1. **Caching:** Cache AI responses to reduce API calls
2. **Image Optimization:** Compress images before upload
3. **Query Optimization:** Use indexes, materialized views
4. **Free Tiers:** Maximize free tier usage (Vercel, Supabase, Groq)
5. **Monitoring:** Track costs daily, set alerts

---

## 10. Risk Management

### 10.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| WhatsApp API rate limits | Medium | High | Implement queue, backoff logic |
| AI response quality issues | Medium | Medium | Prompt engineering, human review |
| Database performance degradation | Low | High | Indexing, caching, read replicas |
| Third-party API downtime | Medium | High | Circuit breaker, fallback logic |
| Data breach | Low | Critical | Security audit, encryption, monitoring |

---

### 10.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user adoption | Medium | High | User research, beta testing, feedback |
| Regulatory changes (LGPD, ANS) | Low | High | Legal consultation, compliance monitoring |
| Competition launch similar product | Medium | Medium | Focus on UX, speed to market |
| WhatsApp policy changes | Low | Critical | Diversify channels (SMS, email) |

---

## 11. Success Metrics

### 11.1 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time (p95) | < 500ms | Monitoring dashboard |
| AI response time | < 3s | Application logs |
| Uptime | > 99.5% | Better Stack |
| Error rate | < 0.5% | Sentry |
| Test coverage | > 80% | CI pipeline |

---

### 11.2 Business Metrics

| Metric | Target (30 days) | Target (90 days) |
|--------|------------------|------------------|
| Active consultants | 5 | 50 |
| Total leads processed | 50 | 2,000 |
| Conversion rate | 5% | 10% |
| User satisfaction (NPS) | 40 | 60 |
| Monthly recurring revenue | R$0 | R$2,000 |

---

## 12. Post-Launch Activities

### 12.1 Week 1 Post-Launch
- Monitor error rates closely
- Collect user feedback via in-app surveys
- Fix critical bugs (< 24 hours)
- Daily standup with beta users

### 12.2 Month 1 Post-Launch
- Analyze usage patterns
- Identify top feature requests
- Optimize bottlenecks
- Plan roadmap for Phase 2

### 12.3 Ongoing
- Weekly deployment cadence
- Monthly security audits
- Quarterly infrastructure review
- Continuous user research

---

## 13. Appendices

### 13.1 Development Environment Setup

**Prerequisites:**
- Node.js 20 LTS
- Docker Desktop
- Git
- Visual Studio Code (recommended)

**Steps:**
```bash
# Clone repository
git clone https://github.com/your-org/consultor-ai.git
cd consultor-ai

# Install dependencies
npm install

# Setup Supabase local
npx supabase init
npx supabase start

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Open http://localhost:3000
```

---

### 13.2 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run lint             # Run linter
npm run type-check       # TypeScript check

# Testing
npm run test:unit        # Run unit tests
npm run test:integration # Run integration tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Coverage report

# Database
npm run db:migrate       # Run migrations
npm run db:reset         # Reset database
npm run db:seed          # Seed with sample data
npm run db:studio        # Open Supabase Studio

# Deployment
npm run build            # Production build
npm run start            # Start production server
vercel --prod            # Deploy to Vercel
```

---

### 13.3 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-12 | Initial | First draft of implementation plan |
