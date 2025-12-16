# Consultor.AI

**AI-Powered WhatsApp Sales Assistant for Autonomous Consultants**

Consultor.AI is a SaaS platform that enables autonomous salespeople to create personalized AI assistants that interact with leads via WhatsApp 24/7, automating lead qualification, nurturing, and appointment scheduling.

---

## 🎯 Project Status

**Current Phase:** Technical Planning
**Target MVP:** 30 days from development start
**Documentation:** Complete ✅

This repository contains:
- ✅ Complete technical documentation
- ✅ Working conversation flow prototypes
- ⏳ Source code (to be developed)

---

## 🚀 Quick Start

### For Developers

**1. Read the Documentation**
Start with [`docs/README.md`](docs/README.md) for a complete documentation index.

**Key Documents:**
- [Software Requirements Specification](docs/technical/SRS-Software-Requirements-Specification.md) - What to build
- [System Architecture Document](docs/architecture/SAD-System-Architecture-Document.md) - How to structure it
- [Implementation Plan](docs/technical/Implementation-Plan.md) - How to build it

**2. Test the Prototype**
```bash
cd docs/motivação/snippets\ de\ exemplo/
python bot_mock.py.py
```

**3. Set Up Development Environment**
```bash
# Prerequisites: Node.js 20 LTS, Docker Desktop

# Install dependencies
npm install

# Start local Supabase
npx supabase init
npx supabase start

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

See [Implementation Plan - Section 13.1](docs/technical/Implementation-Plan.md) for detailed setup instructions.

---

## 📋 Features

### MVP (Phase 1 - Days 1-30)
- ✅ Consultant registration and authentication
- ✅ WhatsApp integration (Weni Cloud)
- ✅ AI-powered conversation engine (Google AI + Gemini Pro)
- ✅ Lead qualification flows (JSON-driven)
- ✅ Lead management dashboard
- ✅ Basic analytics

### Phase 2 (Days 31-60)
- ⏳ Image generation (Canva API)
- ⏳ Advanced analytics and funnel tracking
- ⏳ Lead export (CSV)
- ⏳ Multi-flow support

### Phase 3 (Days 61-90)
- ⏳ Real estate vertical
- ⏳ Calendar integration (Google Calendar)
- ⏳ CRM integration (RD Station)
- ⏳ Performance optimizations

### Future
- ⏳ Voice cloning
- ⏳ Template marketplace
- ⏳ White-label options
- ⏳ Mobile app

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│   Next.js 14 + Tailwind + shadcn/ui        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│            Business Logic                   │
│   Supabase Edge Functions (TypeScript)     │
│   - Conversation Engine                     │
│   - AI Orchestration                        │
│   - Content Generation                      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│           Data Layer                        │
│   PostgreSQL 14 (Supabase)                 │
│   - Row-Level Security (RLS)               │
│   - Real-time Subscriptions                │
└─────────────────────────────────────────────┘

External Integrations:
├── WhatsApp Business API (Weni Cloud)
├── AI (Google AI + Gemini Pro)
├── Image Generation (Canva API)
├── Calendar (Google Calendar)
└── CRM (RD Station, Pipedrive)
```

See [System Architecture Document](docs/architecture/SAD-System-Architecture-Document.md) for detailed architecture.

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript | SSR/SSG, excellent DX, Vercel integration |
| **Styling** | Tailwind CSS, shadcn/ui | Rapid UI development, accessible components |
| **Backend** | Supabase (PostgreSQL + Edge Functions) | All-in-one platform, generous free tier |
| **Authentication** | Supabase Auth | Built-in JWT, RLS integration |
| **Database** | PostgreSQL 14 | Relational data, JSONB support, battle-tested |
| **AI** | Google AI + Gemini Pro | Multimodal capabilities, fast, reliable |
| **WhatsApp** | Weni Cloud (360dialog) | Official API, no blocking risk |
| **Image Gen** | Canva API | Template-based, professional results |
| **Hosting** | Vercel + Supabase Cloud | Zero-config deployment, global CDN |
| **Monitoring** | Sentry + Better Stack | Error tracking, uptime monitoring |

---

## 📊 Project Structure

```
Consultor.AI/
├── docs/                        # 📚 Technical documentation
│   ├── README.md                # Documentation index
│   ├── technical/               # Requirements & planning
│   │   ├── SRS-Software-Requirements-Specification.md
│   │   └── Implementation-Plan.md
│   ├── architecture/            # Architecture & database design
│   │   ├── SAD-System-Architecture-Document.md
│   │   └── Database-Design-Document.md
│   ├── api/                     # API specifications
│   │   └── API-Specification.md
│   ├── guides/                  # Getting started guides
│   │   └── getting-started.md
│   └── motivação/               # Conceptual planning & prototypes
│       └── snippets de exemplo/ # Working prototypes (bot_mock.py, etc.)
├── deployment/                  # 🚀 Deployment configurations
│   ├── kubernetes/              # Kubernetes manifests
│   │   ├── 00-namespace.yaml
│   │   ├── 05-app-deployment.yaml
│   │   └── README.md
│   └── scripts/                 # Deployment scripts
│       ├── build-and-push.sh
│       ├── deploy-k8s.sh
│       └── README.md
├── src/                         # 🚧 Source code (to be developed)
│   ├── app/                     # Next.js app router
│   ├── components/              # React components
│   ├── lib/                     # Utilities and helpers
│   └── types/                   # TypeScript type definitions
├── supabase/                    # 🗄️ Database & backend
│   ├── functions/               # Edge functions
│   └── migrations/              # Database migrations
├── tests/                       # 🧪 Test suites
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
├── Dockerfile                   # Production Docker image
├── Dockerfile.dev               # Development Docker image
├── docker-compose.yml           # Docker Compose for production/staging
├── CLAUDE.md                    # 🤖 Guide for Claude Code
└── README.md                    # This file
```

---

## 📖 Documentation

### Core Documents

1. **[Software Requirements Specification](docs/technical/SRS-Software-Requirements-Specification.md)**
   - Complete functional and non-functional requirements
   - Compliance requirements (LGPD, ANS)
   - Feature priorities

2. **[System Architecture Document](docs/architecture/SAD-System-Architecture-Document.md)**
   - High-level architecture and component design
   - Technology stack decisions
   - Integration patterns

3. **[Database Design Document](docs/architecture/Database-Design-Document.md)**
   - Complete PostgreSQL schema
   - Indexing strategy
   - Migration plans

4. **[API Specification](docs/api/API-Specification.md)**
   - RESTful API endpoints
   - Authentication flows
   - Webhook specifications

5. **[Implementation Plan](docs/technical/Implementation-Plan.md)**
   - 90-day roadmap with sprints
   - Testing strategy
   - Deployment procedures

**See [`docs/README.md`](docs/README.md) for complete documentation index.**

---

## 🎯 Target Verticals

### Phase 1: Health Plan Consultants
- Lead qualification based on profile, age, coparticipation
- AI-generated plan recommendations
- Compliance with ANS regulations

### Phase 2: Real Estate Agents
- Property qualification (price, location, type)
- Automated property suggestions
- Virtual tour scheduling

### Future: Additional Verticals
- Automotive sales
- Insurance brokers
- Financial consultants

---

## 💰 Business Model

| Tier | Price | Features |
|------|-------|----------|
| **Freemium** | R$0/mês | 20 leads/month, basic flow, text-only |
| **Pro** | R$47/mês | 200 leads/month, images, auto follow-up, CSV export |
| **Agência** | R$147/mês | 1000 leads, custom flows, dashboard, CRM integration |

**Upsell Opportunities:**
- Voice cloning: +R$15/month
- Interactive quizzes: +R$20/month
- Real-time pricing APIs: +R$50/month

---

## 🔒 Compliance

The platform is designed with compliance at its core:

- **LGPD (Brazilian GDPR)**: Data minimization, consent management, right to deletion
- **ANS Regulations**: No pricing promises, transparent information, waiting period disclosures
- **WhatsApp Business Policy**: 24-hour window, approved templates, no spam

See [SRS - Section 4.7](docs/technical/SRS-Software-Requirements-Specification.md) for detailed compliance requirements.

---

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Load tests
npm run test:load

# Coverage report
npm run test:coverage
```

**Target Coverage:** 80%

See [Implementation Plan - Section 5](docs/technical/Implementation-Plan.md) for complete testing strategy.

---

## 🚀 Deployment

### Environments

| Environment | URL | Purpose | Deployment Method |
|-------------|-----|---------|-------------------|
| **Development** | localhost:3000 | Local development | `npm run dev` |
| **Staging** | staging.consultor.ai | QA/Testing | Docker Compose |
| **Production** | consultor.ai | Live users | Kubernetes |

### Deployment Options

#### 1. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

#### 2. Docker Compose (Staging/Small Production)

Perfect for staging environments or small production deployments.

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

See [`docker-compose.yml`](docker-compose.yml) for configuration.

**Includes:**
- Next.js application
- Redis cache
- Health checks
- Auto-restart policies

#### 3. Kubernetes (Production)

For high-availability production deployments with auto-scaling.

```bash
# Build and push Docker image
./deployment/scripts/build-and-push.sh v1.0.0

# Deploy to cluster
./deployment/scripts/deploy-k8s.sh

# Check status
./deployment/scripts/status.sh
```

See [`deployment/kubernetes/README.md`](deployment/kubernetes/README.md) for detailed instructions.

**Features:**
- Horizontal Pod Autoscaling (3-10 replicas)
- Rolling updates with zero downtime
- TLS with Let's Encrypt
- Network policies for security
- Health checks and monitoring
- Persistent Redis storage

**Deployment Scripts:**
- `build-and-push.sh` - Build and push Docker images
- `deploy-k8s.sh` - Deploy to Kubernetes
- `status.sh` - Check deployment status
- `update.sh` - Update to new version
- `rollback.sh` - Rollback to previous version
- `logs.sh` - View application logs

See [`deployment/scripts/README.md`](deployment/scripts/README.md) for script documentation.

### CI/CD Pipeline

- **GitHub Actions** for automated testing and deployment
- **Docker** for containerization
- **Kubernetes** for orchestration
- Automatic deployment to staging on `main` branch
- Manual approval required for production

See [Implementation Plan - Section 6](docs/technical/Implementation-Plan.md) for complete deployment procedures.

---

## 📈 Success Metrics

### Technical Metrics
- API response time (p95): < 500ms
- AI response time: < 3s
- Uptime: > 99.5%
- Error rate: < 0.5%

### Business Metrics (90 days)
- Active consultants: 50
- Total leads processed: 2,000
- Conversion rate: 10%
- Monthly recurring revenue: R$2,000

---

## 🤝 Contributing

This is a private project in the technical planning phase. Development will begin following the [Implementation Plan](docs/technical/Implementation-Plan.md).

**For future contributors:**
1. Read the [SRS](docs/technical/SRS-Software-Requirements-Specification.md) to understand requirements
2. Review the [SAD](docs/architecture/SAD-System-Architecture-Document.md) for architectural guidelines
3. Follow the coding standards defined in the Implementation Plan
4. Write tests for all new features (80% coverage target)
5. Update documentation when making significant changes

---

## 📝 License

[License information to be added]

---

## 📞 Contact

[Contact information to be added]

---

## 🙏 Acknowledgments

This project was designed with careful consideration of:
- Brazilian regulatory requirements (LGPD, ANS)
- WhatsApp Business API best practices
- AI safety and compliance guidelines
- Modern software architecture patterns

---

**Status:** Technical Planning Phase ✅ | Deployment Infrastructure Ready ✅ | Development: Not Started ⏳

*Last updated: 2025-12-16*
