# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Consultor.AI** (also known as HealthBot/VendaFácil AI) is an AI-powered WhatsApp assistant designed to help autonomous salespeople automate lead capture, qualification, and nurturing. The platform targets two initial verticals:

1. **Health plan consultants** - Automated triaging of leads based on profile, age, and coparticipation preferences
2. **Real estate agents** - Property qualification and recommendation (planned expansion)

The system combines conversational AI with personalized content generation to create a 24/7 virtual sales assistant that maintains the consultant's voice and personality.

## Tech Stack

### Planned Architecture
- **Frontend (Landing Pages)**: Next.js 14 (App Router) + Tailwind CSS
- **Backend/API**: Supabase (Auth, PostgreSQL, Edge Functions)
- **WhatsApp Integration**: Weni Cloud (official WhatsApp Business API via 360dialog)
- **AI Text Generation**: Groq + Llama 3.1 70B (cost-optimized, ~3x faster than OpenAI)
- **AI Voice Cloning** (Premium): ElevenLabs or OpenVoice (open-source)
- **Image Generation**: Canva API for personalized comparison cards
- **Hosting**: Vercel (frontend) + Supabase Edge (backend)
- **Monitoring**: Better Stack or Sentry

### Current Status
This project is in the technical planning phase. Complete technical documentation has been created in `/docs/` (see Technical Documentation section below). The `/docs/motivação` directory contains the conceptual planning and conversation history that led to the current design, along with working prototype snippets.

## Project Structure

```
Consultor.AI/
├── docs/
│   ├── technical/               # Technical documentation
│   │   ├── SRS-Software-Requirements-Specification.md
│   │   └── Implementation-Plan.md
│   ├── architecture/            # Architecture documentation
│   │   ├── SAD-System-Architecture-Document.md
│   │   └── Database-Design-Document.md
│   ├── api/                     # API documentation
│   │   └── API-Specification.md
│   └── motivação/               # Conceptual planning & prototypes
│       ├── 0-Proposição Inicial.md
│       ├── 1-Resposta 1.md
│       ├── 3-Resposta 3.md
│       └── snippets de exemplo/
│           ├── fluxo_saude.json.json
│           ├── bot_mock.py.py
│           ├── gerar_resposta.txt.txt
│           └── webhook_mock.py.py
└── src/                         # Source code (to be developed)
```

## Technical Documentation

Complete technical specifications are available in `/docs/`. Refer to these documents when implementing features:

### Core Documents

1. **Software Requirements Specification (SRS)** - `docs/technical/SRS-Software-Requirements-Specification.md`
   - Complete functional and non-functional requirements
   - User stories and acceptance criteria
   - Compliance requirements (LGPD, ANS, WhatsApp Business Policy)
   - Feature priorities (P0-P3)
   - Use this to understand WHAT the system must do

2. **System Architecture Document (SAD)** - `docs/architecture/SAD-System-Architecture-Document.md`
   - High-level system architecture with component diagrams
   - Technology stack decisions and rationale
   - Integration patterns (WhatsApp, AI, Canva)
   - Security architecture and authentication flows
   - Deployment architecture and environments
   - Use this to understand HOW the system is structured

3. **Database Design Document** - `docs/architecture/Database-Design-Document.md`
   - Complete PostgreSQL schema with all tables
   - Entity-relationship diagrams
   - Indexing strategy and performance optimization
   - Row-level security (RLS) policies
   - Migration strategy and example migrations
   - Use this when working with data models

4. **API Specification** - `docs/api/API-Specification.md`
   - RESTful API endpoints with request/response examples
   - Authentication and authorization patterns
   - Error codes and handling
   - Webhook specifications for WhatsApp integration
   - Rate limiting and security measures
   - Use this when building or consuming APIs

5. **Implementation Plan** - `docs/technical/Implementation-Plan.md`
   - 90-day roadmap with 4 phases
   - Sprint breakdown (2-week sprints)
   - Testing strategy (unit, integration, E2E, load tests)
   - CI/CD pipeline configuration
   - Monitoring and observability setup
   - Risk management and mitigation strategies
   - Use this to plan development work

### Quick Reference Guide

**When you need to:**
- Understand requirements → Read **SRS** sections 3 (Functional) and 4 (Non-Functional)
- Design a new feature → Check **SAD** section 4 (Component Architecture)
- Create database tables → Reference **Database Design** section 3 (Table Definitions)
- Build an API endpoint → Follow **API Specification** patterns and conventions
- Plan implementation → Review **Implementation Plan** sprint breakdowns
- Understand compliance → Check **SRS** section 4.7 (Compliance Requirements)
- Setup development environment → See **Implementation Plan** section 13.1

## Core Components

### 1. Conversation Flow System (`fluxo_saude.json`)

The conversation engine is JSON-driven with three step types:
- **`mensagem`**: Bot sends a message (supports `{{template_variables}}`)
- **`escolha`**: Multiple choice question with predefined options
- **`executar`**: Triggers actions like `gerar_resposta_ia`

Each step has a `proxima` field defining the next step ID, enabling dynamic conversation paths.

### 2. Lead Qualification Flow (Health Plans)

The health plan flow collects three critical data points:
1. **Profile**: Individual / Couple / Family / Corporate
2. **Age Range**: Up to 30 / 31-45 / 46-60 / Above 60
3. **Coparticipation**: Yes (lower cost) / No (full coverage)

Based on responses, the AI generates personalized plan recommendations with a soft call-to-action.

### 3. AI Response Generation

The prompt template (`gerar_resposta.txt`) enforces:
- **Tone**: Welcoming, clear, empathetic, jargon-free
- **Structure**:
  1. Empathetic validation
  2. 1-2 realistic (but fictional) plan recommendations with differentiators
  3. Contextual call-to-action
- **Compliance**: No exact pricing, no requests for sensitive data (CPF, pre-existing conditions), no illegal promises (zero waiting period)

### 4. Bot Simulator (`bot_mock.py`)

A command-line simulator for testing flows offline without WhatsApp integration:
- Loads conversation flow from JSON
- Simulates user choices via numbered input
- Demonstrates AI response generation (currently mocked)
- Useful for validating conversation logic before production deployment

## Development Phases

The project follows a **90-day implementation plan** divided into 4 phases with 2-week sprints. See `docs/technical/Implementation-Plan.md` for detailed sprint breakdowns and tasks.

### Phase 1: MVP Foundation (Days 1-30)
**Goal:** Launch functional platform with core features for health plans vertical.
- Sprint 1: Foundation (auth, database setup)
- Sprint 2: Conversation engine (flow parser, WhatsApp integration, AI)
- Sprint 3: Dashboard & analytics
- Sprint 4: Polish & beta launch
- **Success Criteria:** 5 beta consultants, 50+ leads processed, < 3s AI response time

### Phase 2: Enhancement (Days 31-60)
**Goal:** Add premium features and polish UX.
- Image generation (Canva API)
- Advanced analytics
- Lead export
- Multi-flow support
- **Success Criteria:** 20 paying consultants, 500+ leads, 90% satisfaction

### Phase 3: Scale (Days 61-90)
**Goal:** Optimize for scale and add enterprise features.
- Second vertical (real estate)
- Calendar integration
- CRM integration
- Performance optimizations
- **Success Criteria:** 100 active consultants, 5,000+ leads, 99.5% uptime

### Phase 4: Iterate (Days 90+)
**Goal:** Continuous improvement based on user feedback.
- Voice cloning
- Template marketplace
- White-label options
- Additional integrations

### Database Schema Overview

Complete schema with all tables, indexes, and RLS policies is documented in `docs/architecture/Database-Design-Document.md`.

**Core Tables:**
- `consultants` - Sales consultants using the platform
- `leads` - Potential customers
- `conversations` - Active conversation sessions
- `messages` - Individual message history
- `flows` - Conversation flow definitions (JSON-based)
- `ai_responses` - AI generation logs for analytics
- `generated_images` - Image generation metadata
- `webhook_events` - Webhook audit trail
- `audit_logs` - LGPD compliance logs

## Business Model

### Pricing Tiers
| Tier | Price | Features |
|------|-------|----------|
| **Freemium** | R$0/mês | Up to 20 leads/month, basic flow, text-only responses |
| **Pro** | R$47/mês | Up to 200 leads/month, Canva images, auto follow-up, CSV export |
| **Agência** | R$147/mês | Up to 1000 leads, custom flows, dashboard, CRM integration |

### Upsell Opportunities
- Voice cloning (consultant's voice): +R$15/month
- Interactive quizzes: +R$20/month
- Real-time plan pricing via operator APIs: +R$50/month

## Key Design Principles

1. **Consultant's Identity First**: The bot is positioned as an "assistant" to the consultant, not a replacement
2. **Compliance by Design**: AI prompts explicitly prevent illegal promises or sensitive data collection
3. **Local Development**: All components can be tested locally before cloud deployment
4. **Free Tier Optimization**: MVP designed to run on free tiers (Vercel, Supabase Free, Groq Free)
5. **Modular Flows**: JSON-based conversation flows enable non-technical consultants to customize conversations (future feature)

## Testing Commands

```bash
# Run bot simulator (requires Python 3.8+)
cd docs/motivação/snippets\ de\ exemplo/
python bot_mock.py.py

# The simulator will walk through the health plan flow interactively
```

## Important Constraints

- **No Pricing Promises**: AI must never quote exact plan prices (regulatory requirement)
- **No Sensitive Data Collection**: Never request CPF, pre-existing conditions, or medical history via WhatsApp
- **No Illegal Claims**: Never promise "zero waiting period" or "immediate coverage" (violates ANS regulations)
- **WhatsApp Compliance**: All outbound messages must follow WhatsApp Business Policy (24-hour window for non-template messages)

## Expansion Strategy

1. **Vertical Expansion**: Add real estate agents, car salespeople, insurance brokers
2. **Template Marketplace**: Let consultants share/sell custom conversation flows
3. **CRM Integration**: Connect to RD Station, Agendor, Pipedrive
4. **White Label**: Offer branded versions for health plan operators

## Resources

- **Groq Playground**: https://console.groq.com/playground (for testing AI prompts)
- **Weni Cloud**: https://weni.ai/cloud (WhatsApp Business API)
- **Supabase Local**: https://supabase.com/docs/guides/cli (local development)
- **Canva API**: https://www.canva.com/developers (image generation)

## Getting Started with Development

### Prerequisites
- Node.js 20 LTS
- Docker Desktop (for local Supabase)
- Git
- Visual Studio Code (recommended)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd Consultor.AI

# Install dependencies
npm install

# Setup local Supabase
npx supabase init
npx supabase start

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Development Commands
See `docs/technical/Implementation-Plan.md` section 13.2 for complete command reference.

### First Steps for Implementation
1. Read `docs/technical/SRS-Software-Requirements-Specification.md` sections 3.1 and 3.2 (Consultant and Flow requirements)
2. Review `docs/architecture/Database-Design-Document.md` section 3 (Table Definitions)
3. Set up development environment per `docs/technical/Implementation-Plan.md` section 13.1
4. Follow Sprint 1 tasks in `docs/technical/Implementation-Plan.md` section 3
5. Test conversation flow using `docs/motivação/snippets de exemplo/bot_mock.py.py`

## Notes for Future Development

- The project is in technical planning phase with complete documentation and working prototypes
- All code in `snippets de exemplo/` is functional and ready for testing
- Start with MVP (Phase 1) focusing on health plans vertical only
- Prioritize getting one consultant successfully using the system before scaling
- Follow the 4-phase implementation plan for systematic development
- Refer to technical documentation for all architectural and design decisions
