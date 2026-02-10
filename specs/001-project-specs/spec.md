# Feature Specification: Consultor.AI - AI-Powered WhatsApp Sales Assistant Platform

**Feature Branch**: `001-project-specs`
**Created**: 2026-01-12
**Updated**: 2026-01-30
**Status**: Complete - Production Ready
**Version**: 0.3.0
**Input**: User description: "Analise a pasta .rules e a pasta docs para criar as especificações do projeto descrito nestas pastas"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Lead Qualification via WhatsApp (Priority: P1)

A health plan consultant wants their leads to be automatically qualified through conversational interactions on WhatsApp, collecting profile information, age range, and coparticipation preferences to generate personalized recommendations.

**Why this priority**: This is the core value proposition of the platform. Without automated lead qualification, the product has no purpose. This delivers immediate value by freeing consultants from repetitive initial conversations.

**Independent Test**: Can be fully tested by sending a WhatsApp message to a connected consultant number and completing the qualification flow (perfil → idade → coparticipação → AI recommendation). Delivers measurable value through reduced consultant time spent on initial lead screening.

**Acceptance Scenarios**:

1. **Given** a lead sends their first message to the consultant's WhatsApp number, **When** the message is received, **Then** the system creates a new lead record and initiates the health plan qualification flow with a welcome message
2. **Given** the lead is on the profile selection step, **When** they respond with "familia", **Then** the system stores their profile preference and advances to the age range question
3. **Given** the lead has completed all qualification questions (perfil, idade, coparticipação), **When** the final answer is submitted, **Then** the system generates a personalized AI response with 1-2 plan recommendations and a clear call-to-action
4. **Given** the lead provides an invalid response during a multiple-choice question, **When** the system receives the invalid input, **Then** the system prompts the lead to select a valid option without losing conversation context
5. **Given** a conversation has been inactive for 24 hours, **When** the lead sends a new message, **Then** the system offers to restart the qualification flow or continue from the last step

---

### User Story 2 - Consultant Dashboard and Lead Management (Priority: P2)

A consultant wants to view all their leads in a centralized dashboard, see qualification status, review conversation history, and manually update lead information to track their sales pipeline.

**Why this priority**: While automated qualification is critical, consultants need visibility into their pipeline to follow up on qualified leads. This enables the consultant to take action on the AI-generated qualifications.

**Independent Test**: Can be fully tested by logging into the dashboard and verifying all leads appear with correct statuses, scores, and conversation history. Delivers value through organized lead management replacing manual spreadsheets.

**Acceptance Scenarios**:

1. **Given** a consultant logs into their dashboard, **When** they navigate to the leads page, **Then** they see a list of all their leads sorted by most recent activity with status badges (novo, em_contato, qualificado, fechado, perdido)
2. **Given** a consultant is viewing the leads list, **When** they click on a specific lead, **Then** they see the complete lead profile including name, WhatsApp number, qualification responses, score, and full conversation history
3. **Given** a consultant is viewing a lead detail page, **When** they update the lead status to "fechado", **Then** the system saves the update, reflects it immediately in the dashboard, and updates analytics metrics
4. **Given** a consultant wants to track engagement, **When** they view the analytics section, **Then** they see 6 key metrics: total leads, leads by status, average score, conversion rate, response time, and active conversations
5. **Given** a consultant has leads from multiple time periods, **When** they apply date range filters, **Then** the dashboard updates to show only leads from the selected period

---

### User Story 3 - Consultant Onboarding and WhatsApp Integration (Priority: P1)

A new consultant wants to create an account, connect their WhatsApp Business number, and start receiving leads through their unique consultant link within minutes.

**Why this priority**: This is the entry point to the platform. Without simple onboarding, consultants won't adopt the product. This must be frictionless to minimize drop-off during registration.

**Independent Test**: Can be fully tested by creating a new account, completing profile setup, connecting a WhatsApp Business number via Meta Embedded Signup, and verifying the unique link is active. Delivers immediate value by enabling the consultant to start using the platform.

**Acceptance Scenarios**:

1. **Given** a new user visits the registration page, **When** they submit their email, password, name, and phone number, **Then** the system creates an account and sends a verification email within 30 seconds
2. **Given** a consultant has verified their email, **When** they complete their profile setup (bio, professional credentials, vertical selection), **Then** the system generates a unique URL slug (e.g., consultor.ai/joana-saude) and creates their public profile page
3. **Given** a consultant is on the WhatsApp integration page, **When** they click "Connect WhatsApp Business", **Then** the system initiates Meta Embedded Signup flow and guides them through a 3-click connection process
4. **Given** a consultant has successfully connected WhatsApp, **When** the integration is complete, **Then** the system registers the webhook, encrypts the access token with AES-256-GCM, and displays a confirmation message with their consultant link
5. **Given** a consultant's unique link is active, **When** a lead accesses the link, **Then** they are directed to initiate a WhatsApp conversation with the consultant's connected number

---

### User Story 4 - AI-Powered Response Generation with Compliance (Priority: P1)

The system must generate personalized AI responses that maintain the consultant's voice, provide relevant health plan recommendations, and comply with ANS regulations by avoiding exact pricing, illegal claims, and prohibited promises.

**Why this priority**: AI generation is what makes the assistant "intelligent" and personalized. Without compliance filtering, the platform exposes consultants to legal risks. This is a non-negotiable core feature.

**Independent Test**: Can be fully tested by completing a qualification flow and verifying the AI response is generated in under 3 seconds, maintains empathetic tone, includes 1-2 realistic recommendations, and contains no prohibited content. Delivers value through personalized, compliant communication that builds trust.

**Acceptance Scenarios**:

1. **Given** a lead has completed all qualification questions, **When** the system triggers AI response generation, **Then** the response is generated in under 3 seconds with a maximum of 80 words
2. **Given** the AI receives lead qualification data (perfil: familia, idade: 35, coparticipação: sim), **When** it generates a recommendation, **Then** the response includes empathetic validation, 1-2 suitable plan types (without exact pricing), and a clear call-to-action
3. **Given** the AI generates a response, **When** the response is checked for compliance, **Then** it contains no exact pricing (e.g., "R$ 500/mês"), no illegal claims (e.g., "zero carência"), and no sensitive data requests (e.g., "me envie seu CPF")
4. **Given** a consultant's bio emphasizes "atendimento humanizado e confiável", **When** the AI generates responses for that consultant's leads, **Then** the tone reflects the consultant's personality and values
5. **Given** the AI service fails or times out, **When** the error occurs, **Then** the system falls back to a pre-defined response template and logs the failure for monitoring

---

### User Story 5 - Conversation Flow Customization (Priority: P3)

A consultant wants to customize their qualification flow by adding, removing, or reordering questions to match their specific sales process and target customer segments.

**Why this priority**: While the default health plan flow covers most use cases, advanced consultants may want customization. This is a "nice-to-have" that enhances product stickiness but isn't required for initial value delivery.

**Independent Test**: Can be fully tested by a consultant creating a custom flow JSON, uploading it through the dashboard, and verifying leads receive the updated question sequence. Delivers value through personalized qualification aligned with consultant's unique process.

**Acceptance Scenarios**:

1. **Given** a consultant navigates to the flow editor in their dashboard, **When** they view their current flow, **Then** they see a visual representation of all steps (mensagem, escolha, executar) with step IDs, content, and navigation paths
2. **Given** a consultant wants to add a new question about geographic location, **When** they create a new "escolha" step with location options, **Then** the system validates the JSON structure and updates the flow definition
3. **Given** a consultant has multiple custom flows (e.g., individual vs. family plans), **When** they select which flow to activate, **Then** new leads automatically receive the selected flow
4. **Given** a consultant modifies a flow, **When** they save changes, **Then** in-progress conversations continue with the old flow, and new conversations use the updated flow
5. **Given** a consultant uploads malformed flow JSON, **When** the validation runs, **Then** the system rejects the upload with clear error messages indicating which fields are invalid

---

### User Story 6 - Analytics and Performance Tracking (Priority: P2)

A consultant wants to track their performance metrics including total leads, conversion rates, average response time, and lead score distribution to optimize their sales process and measure ROI.

**Why this priority**: Data-driven insights help consultants understand what's working and justify continued platform investment. This builds consultant retention but isn't critical for initial adoption.

**Independent Test**: Can be fully tested by generating lead activity over a period, then verifying the analytics dashboard displays accurate metrics with visual charts. Delivers value through actionable insights for process improvement.

**Acceptance Scenarios**:

1. **Given** a consultant accesses the analytics dashboard, **When** the page loads, **Then** they see 6 real-time metrics: total leads, leads by status (pie chart), average lead score, conversion rate percentage, average response time, and active conversations count
2. **Given** a consultant wants to analyze trends, **When** they view the status distribution chart, **Then** they see a pie chart showing the percentage breakdown of leads across all statuses (novo, em_contato, qualificado, fechado, perdido)
3. **Given** a consultant has leads from different time periods, **When** they select a date range filter (últimos 7 dias, 30 dias, 90 dias), **Then** all metrics update to reflect only leads within that period
4. **Given** a consultant wants to identify high-quality leads, **When** they view the leads list, **Then** leads are sortable by score with visual indicators for scores above 70 (qualified threshold)
5. **Given** a consultant wants to track performance over time, **When** they view the activity table, **Then** they see recent lead interactions with timestamps, status changes, and quick-access links to lead details

---

### User Story 7 - Export and CRM Integration (Priority: P3)

A consultant wants to export their lead data to CSV/Excel format and integrate with external CRM systems (RD Station, Pipedrive, Agendor) to maintain their existing sales workflows.

**Why this priority**: This enables advanced users to integrate with their existing tools, but most consultants can operate fully within the platform. This is a growth feature that increases product flexibility.

**Independent Test**: Can be fully tested by clicking the export button and verifying a CSV file downloads with all lead data, or by configuring CRM webhook integration and verifying leads sync automatically. Delivers value through workflow continuity and data portability.

**Acceptance Scenarios**:

1. **Given** a consultant is viewing the leads page, **When** they click "Exportar" and select CSV format, **Then** a file downloads containing all visible leads with columns: name, WhatsApp number, status, score, created date, updated date, and qualification responses
2. **Given** a consultant wants to filter their export, **When** they apply status filters (e.g., only "qualificado" leads) before exporting, **Then** the CSV contains only leads matching the applied filters
3. **Given** a consultant navigates to integrations settings, **When** they connect their RD Station account via API key, **Then** the system validates the key and enables automatic lead syncing
4. **Given** a new lead is qualified, **When** the lead status changes to "qualificado", **Then** the system automatically sends lead data to the connected CRM via webhook within 5 seconds
5. **Given** a CRM integration fails, **When** the webhook returns an error, **Then** the system retries up to 3 times with exponential backoff and logs the failure for manual review

---

### Edge Cases

- **What happens when a lead sends messages outside the 24-hour WhatsApp messaging window?** System cannot send proactive messages and must wait for the lead to initiate contact. Display notification in dashboard that conversation is "paused" pending lead response.

- **How does the system handle simultaneous messages from multiple leads to the same consultant?** Each conversation maintains independent state in the database. Flow engine processes messages sequentially but conversation states are isolated, preventing cross-contamination.

- **What happens when a consultant disconnects their WhatsApp Business number?** All in-progress conversations are marked as "inactive". New leads cannot start conversations. Dashboard displays warning banner with reconnection instructions. Historical conversation data is preserved.

- **How does the system handle leads who restart the conversation mid-flow?** System detects restart keywords ("começar de novo", "recomeçar") and resets conversation state to the initial step while preserving the original lead record with a new conversation ID for history tracking.

- **What happens when the AI service (Groq/Gemini) is unavailable or times out?** System falls back to a pre-defined template response: "Obrigado pelas informações! Um de nossos consultores entrará em contato em breve." Error is logged with lead ID for manual follow-up.

- **How does the system handle leads who send images, videos, or voice messages?** System acknowledges the media with "Recebi sua mensagem! Por favor, responda com texto para continuar." and prompts the lead to provide text input. Media is stored as metadata but not processed.

- **What happens when a consultant tries to use a slug that's already taken?** System appends a numeric suffix (e.g., joana-saude-2, joana-saude-3) and notifies the consultant of the modified slug during profile setup.

- **How does the system handle leads who provide contradictory information (e.g., changing their age range)?** System stores all responses with timestamps. The most recent response is used for AI generation. Conversation history shows the change for consultant review.

- **What happens when database queries fail during conversation flow execution?** System responds with "Desculpe, ocorreu um erro temporário. Por favor, tente novamente em alguns instantes." and logs the error. Conversation state is not advanced to prevent data loss.

- **How does the system handle consultants exceeding rate limits (e.g., 10 requests per 10 seconds)?** API returns 429 status with "Rate limit exceeded" error. Dashboard shows warning. Webhook processing continues but delayed responses are queued.

## Requirements _(mandatory)_

### Functional Requirements

**Authentication & Authorization:**

- **FR-001**: System MUST allow consultants to register with email, password, full name, and phone number, validating email uniqueness and minimum 8-character passwords
- **FR-002**: System MUST send email verification within 30 seconds of registration and require verification before allowing profile setup
- **FR-003**: System MUST authenticate all API routes using Supabase JWT tokens stored in httpOnly cookies with automatic refresh token rotation
- **FR-004**: System MUST enforce Row-Level Security (RLS) policies ensuring consultants can only access their own leads, conversations, and data
- **FR-005**: System MUST implement rate limiting of 10 requests per 10 seconds per IP address using Redis (Upstash) for all public API endpoints

**Consultant Profile & Onboarding:**

- **FR-006**: System MUST allow consultants to configure their profile including bio (max 200 characters), professional credentials (CRM/CRECI), and vertical selection (saúde or imóveis)
- **FR-007**: System MUST generate a unique URL slug from the consultant's name, handling collisions by appending numeric suffixes (e.g., joana-saude, joana-saude-2)
- **FR-008**: System MUST create a publicly accessible profile page at consultor.ai/{slug} displaying consultant bio, credentials, and WhatsApp contact button
- **FR-009**: System MUST integrate with Meta Embedded Signup to allow consultants to connect their WhatsApp Business number in 3 clicks without manual token management
- **FR-010**: System MUST encrypt and store Meta access tokens using AES-256-GCM encryption with keys managed via environment variables

**WhatsApp Integration:**

- **FR-011**: System MUST register webhooks with Meta's WhatsApp Business API to receive incoming messages in real-time
- **FR-012**: System MUST validate all incoming webhook requests using HMAC SHA-256 signature verification, rejecting requests with invalid signatures with 401 status
- **FR-013**: System MUST send WhatsApp messages (text, buttons, lists) via Meta Cloud API with delivery confirmation tracking
- **FR-014**: System MUST respect WhatsApp's 24-hour messaging window, preventing proactive messages outside this window and notifying consultants in the dashboard
- **FR-015**: System MUST handle webhook verification requests from Meta by responding with the challenge parameter during initial setup

**Lead Management:**

- **FR-016**: System MUST automatically create a new lead record when a WhatsApp message is received from an unknown number, storing WhatsApp number, consultant ID, and initial status "novo"
- **FR-017**: System MUST allow consultants to view all their leads in a sortable, filterable list showing name, status, score, created date, and last activity
- **FR-018**: System MUST allow consultants to view detailed lead information including full profile, qualification responses, score, conversation history, and metadata
- **FR-019**: System MUST allow consultants to manually update lead status (novo, em_contato, qualificado, fechado, perdido) with immediate reflection in dashboard and analytics
- **FR-020**: System MUST calculate lead scores automatically based on qualification responses using a weighted algorithm (e.g., profile weight 30%, age weight 40%, coparticipation weight 30%)
- **FR-021**: System MUST validate all lead data updates using Zod schemas to ensure data integrity and type safety

**Conversation Flow Engine:**

- **FR-022**: System MUST execute conversations based on JSON flow definitions supporting three step types: mensagem (bot message), escolha (multiple choice), executar (action trigger)
- **FR-023**: System MUST maintain conversation state for each lead including current step ID, collected responses, and context variables, persisting to database after each interaction
- **FR-024**: System MUST support template variable substitution in messages (e.g., {{nome_vendedor}}, {{perfil_lead}}) using the consultant's profile and lead data
- **FR-025**: System MUST validate user responses against the current step definition, rejecting invalid choices and prompting the user to select a valid option
- **FR-026**: System MUST advance conversation state to the next step only after successful response validation and database persistence
- **FR-027**: System MUST handle conversation timeouts by marking conversations inactive after 24 hours and offering restart option when the lead returns
- **FR-028**: System MUST support multiple-choice questions with 2-6 options, accepting numeric input (1, 2, 3...) or text matching option values

**AI Response Generation:**

- **FR-029**: System MUST generate personalized AI responses using Google Gemini 1.5 Flash (or Groq Llama 3.1 70B) based on lead qualification data and consultant profile
- **FR-030**: System MUST construct AI prompts that include: consultant bio, lead responses (perfil, idade, coparticipação), tone guidelines (empathetic, clear, trustworthy), and compliance rules
- **FR-031**: System MUST generate AI responses within 3 seconds (P95 latency) and limit output to maximum 80 words
- **FR-032**: System MUST filter AI responses for prohibited content: exact pricing (e.g., "R$ 500/mês"), illegal claims (e.g., "zero carência", "cobertura imediata"), and sensitive data requests (e.g., "CPF", "histórico médico")
- **FR-033**: System MUST structure AI responses with: (1) empathetic validation, (2) 1-2 realistic plan recommendations without pricing, (3) clear call-to-action
- **FR-034**: System MUST implement fallback mechanisms when AI service fails, using pre-defined response templates and logging errors for monitoring
- **FR-035**: System MUST maintain response history associating each AI-generated message with the lead, conversation, and generation timestamp

**Analytics & Reporting:**

- **FR-036**: System MUST calculate and display 6 real-time dashboard metrics: total leads, leads by status (counts), average lead score, conversion rate (percentage of qualified leads), average response time, active conversations
- **FR-037**: System MUST generate visual charts: pie chart for lead status distribution, bar chart for leads over time
- **FR-038**: System MUST allow consultants to filter analytics by date range (últimos 7 dias, 30 dias, 90 dias, custom range)
- **FR-039**: System MUST display recent activity table showing last 10 lead interactions with timestamps, status changes, and quick-access links
- **FR-040**: System MUST update all dashboard metrics in real-time without page refresh using React Query with 1-minute stale time

**Data Export & Integrations:**

- **FR-041**: System MUST allow consultants to export lead data to CSV format including columns: name, WhatsApp number, status, score, created date, updated date, qualification responses (JSON)
- **FR-042**: System MUST apply current dashboard filters to exports, allowing consultants to export only visible/filtered leads
- **FR-043**: System MUST support webhook integrations with external CRM systems (RD Station, Pipedrive, Agendor) via API keys or OAuth2
- **FR-044**: System MUST automatically sync qualified leads to connected CRM systems within 5 seconds of status change using webhook delivery with retry logic (3 attempts, exponential backoff)
- **FR-045**: System MUST log all integration errors and display them in a dedicated integrations monitoring page for manual review

**Security & Compliance:**

- **FR-046**: System MUST enforce HTTPS for all connections with TLS 1.2+ minimum and reject HTTP requests
- **FR-047**: System MUST implement LGPD compliance by: (1) never collecting sensitive health data (CPF, medical records), (2) storing only profile, age range, and preferences, (3) implementing audit logs for data access
- **FR-048**: System MUST delete inactive leads after 90 days, purge conversation history after 30 days (configurable), and retain audit logs for 1 year
- **FR-049**: System MUST implement ANS compliance in AI prompts, explicitly prohibiting: exact pricing, illegal health plan claims, zero waiting period promises, sensitive data collection
- **FR-050**: System MUST validate all webhook signatures within 5-minute timestamp window to prevent replay attacks

**Performance & Reliability:**

- **FR-051**: System MUST achieve API route P95 latency under 500ms for all endpoints except AI generation (which has 3s target)
- **FR-052**: System MUST achieve database query P95 latency under 100ms using proper indexes on frequently queried columns (consultant_id, status, created_at)
- **FR-053**: System MUST limit database SELECT queries to only necessary columns to reduce data transfer overhead
- **FR-054**: System MUST implement React Query client-side caching with 1-minute stale time for dashboard data
- **FR-055**: System MUST build production bundles in under 5 minutes with code splitting and tree-shaking enabled

### Key Entities

- **Consultant**: Represents the sales professional using the platform. Attributes: id (UUID), email, name, whatsapp_number, bio (200 chars max), vertical (saúde/imóveis), slug (unique URL identifier), meta_access_token (encrypted), whatsapp_business_account_id, created_at, updated_at. Relationships: owns many Leads, owns many Conversations, owns many Flows.

- **Lead**: Represents a potential customer who interacted with the consultant via WhatsApp. Attributes: id (UUID), consultant_id (foreign key), whatsapp_number, name (optional), status (novo/em_contato/qualificado/fechado/perdido), score (integer 0-100), metadata (JSONB for qualification responses), created_at, updated_at. Relationships: belongs to one Consultant, has many Conversations, has many Messages.

- **Conversation**: Represents an active or completed chat session between a lead and the AI assistant. Attributes: id (UUID), lead_id (foreign key), flow_id (foreign key), state (JSONB containing current_step_id, responses, context variables), status (active/completed/abandoned), created_at, updated_at. Relationships: belongs to one Lead, belongs to one Flow, has many Messages.

- **Message**: Represents a single message exchanged in a conversation. Attributes: id (UUID), conversation_id (foreign key), direction (inbound/outbound), content (text), whatsapp_message_id, status (sent/delivered/read/failed), created_at. Relationships: belongs to one Conversation.

- **Flow**: Represents a conversation flow definition in JSON format. Attributes: id (UUID), consultant_id (foreign key), name, vertical (saúde/imóveis), definition (JSONB containing steps array), is_active (boolean), version, created_at, updated_at. Relationships: belongs to one Consultant, has many Conversations. Structure: Each flow contains steps with properties: id (step identifier), tipo (mensagem/escolha/executar), conteudo (message text or question), opcoes (array of choices for escolha type), proxima (next step ID).

- **Analytics Metric**: Represents calculated performance metrics for consultants (not directly stored, computed from Leads and Conversations). Computed attributes: total_leads, leads_by_status (map of status to count), average_score, conversion_rate (percentage of leads in qualificado/fechado status), average_response_time (time from lead message to bot response), active_conversations_count.

## Success Criteria _(mandatory)_

### Measurable Outcomes

**User Adoption & Engagement:**

- **SC-001**: 90% of registered consultants successfully connect their WhatsApp Business number within the first session
- **SC-002**: 95% of leads complete the health plan qualification flow (perfil → idade → coparticipação) without abandonment
- **SC-003**: Consultants spend less than 5 minutes on initial lead screening tasks (measured as time saved vs. manual qualification)
- **SC-004**: 80% of consultants log into the dashboard at least once per week to review leads

**Performance & Reliability:**

- **SC-005**: AI responses are generated in under 3 seconds for 95% of requests (P95 latency target)
- **SC-006**: API endpoints respond in under 500ms for 95% of requests (excluding AI generation)
- **SC-007**: System maintains 99.5% uptime measured monthly, with downtime incidents under 5 minutes resolved within 15 minutes
- **SC-008**: WhatsApp messages are delivered within 5 seconds of user input for 95% of messages

**Data Quality & Compliance:**

- **SC-009**: Zero compliance violations detected in AI-generated responses (no exact pricing, illegal claims, or sensitive data requests)
- **SC-010**: 100% of webhook requests pass HMAC signature validation (invalid requests rejected)
- **SC-011**: Lead qualification data has 95% completeness (all three questions answered) for leads marked as "qualificado"

**Business Impact:**

- **SC-012**: Consultants report 40% reduction in time spent on initial lead qualification (measured via survey)
- **SC-013**: Qualified lead conversion rate (qualificado → fechado) improves by 25% compared to manual processes (baseline established in first 30 days)
- **SC-014**: Consultants achieve 3x increase in concurrent lead management capacity (measured as number of active leads handled simultaneously)
- **SC-015**: 70% of consultants rate the platform as "useful" or "very useful" in user satisfaction surveys (conducted monthly)

**Technical Quality:**

- **SC-016**: Production builds complete in under 5 minutes with zero TypeScript errors
- **SC-017**: Test coverage maintains minimum 80% overall (90% for unit tests) measured on every commit
- **SC-018**: Client-side JavaScript bundle sizes stay under 200KB gzipped for main bundle and under 100KB for route bundles

## Assumptions _(included if needed)_

1. **WhatsApp Business API Availability**: We assume Meta's WhatsApp Business API remains available, affordable, and maintains current pricing/rate limits. If API pricing increases significantly, we may need to pass costs to consultants or optimize message volume.

2. **AI Service Reliability**: We assume Groq (Llama 3.1 70B) or Google Gemini 1.5 Flash maintain current response times (<3s) and pricing. If latency degrades, we may need to switch providers or implement aggressive caching.

3. **Brazilian Portuguese Language**: All UI text, error messages, and AI-generated responses are in Brazilian Portuguese. International expansion requires localization infrastructure not included in this specification.

4. **Consultant Technical Literacy**: We assume consultants can complete basic web forms, click through a 3-step WhatsApp integration, and navigate a dashboard. Users requiring more guidance may need additional onboarding documentation or video tutorials.

5. **Lead WhatsApp Adoption**: We assume target leads (health plan seekers in Brazil) have active WhatsApp accounts. This is reasonable given WhatsApp's 95%+ penetration in Brazil, but edge cases may exist.

6. **Health Plan Vertical Focus**: Initial scope focuses exclusively on health plan consultants. Real estate expansion (planned Phase 3) requires additional flow templates, compliance checks, and lead qualification criteria.

7. **Default Flow Adequacy**: We assume the default 7-step health plan qualification flow (perfil → idade → coparticipação → AI response) covers 80% of consultant use cases. Custom flow creation (User Story 5) addresses the remaining 20%.

8. **Supabase Free Tier Limits**: We assume MVP traffic stays within Supabase free tier limits (500MB database, 2GB bandwidth, 50k monthly active users). Exceeding these limits requires upgrading to paid plan.

9. **Single Consultant Per WhatsApp Number**: We assume each WhatsApp Business number connects to exactly one consultant account. Multi-user team scenarios (e.g., consultant with assistants) are out of scope.

10. **Synchronous Webhook Processing**: We assume webhook processing completes within WhatsApp's expected response window (under 5 seconds). For heavy operations (AI generation, database writes), we use async processing with immediate 200 OK response.

## Dependencies _(included if needed)_

**External Services:**

1. **Meta WhatsApp Business API**: Required for sending/receiving messages. Dependency on Meta's API stability, rate limits (1000 messages/day per number on free tier), and webhook delivery. Alternative: 360dialog or Twilio as backup providers if Meta API issues occur.

2. **Supabase**: Required for PostgreSQL database, authentication (Supabase Auth), and real-time subscriptions. Dependency on Supabase uptime and free tier limits (500MB database). Migration plan: Can migrate to self-hosted PostgreSQL + Supabase Auth libraries if needed.

3. **Google Gemini 1.5 Flash / Groq Llama 3.1 70B**: Required for AI response generation. Dependency on API uptime, response latency (<3s target), and cost per token. Mitigation: Support both providers with configurable fallback (Gemini primary, Groq backup).

4. **Upstash Redis**: Required for rate limiting and session caching. Dependency on Redis uptime and free tier limits (10k commands/day). Mitigation: Graceful degradation if Redis unavailable (skip rate limiting, warn in logs).

5. **Vercel**: Required for Next.js frontend hosting. Dependency on Vercel build pipelines and edge network. Alternative: Can deploy to any Node.js hosting provider (AWS, DigitalOcean, Railway).

**Internal Dependencies:**

1. **Flow Engine Implementation**: Lead qualification (User Story 1) depends on flow engine being fully implemented before testing. No workaround; this is foundational infrastructure.

2. **Supabase RLS Policies**: All data access (User Story 2) depends on Row-Level Security policies being correctly configured. Testing requires RLS policies deployed to prevent data leakage between consultants.

3. **Meta Embedded Signup Configuration**: WhatsApp integration (User Story 3) depends on Meta app being approved for Embedded Signup. Requires Meta business verification which can take 1-2 weeks. Temporary workaround: Manual token input during MVP phase.

4. **Webhook Signature Validation**: All WhatsApp message processing depends on HMAC SHA-256 signature validation being implemented first. Without this, system is vulnerable to spoofed webhook requests.

5. **Encryption Library**: Storing Meta access tokens depends on AES-256-GCM encryption being implemented. Tokens cannot be stored in plain text due to security requirements.

**Data Dependencies:**

1. **Default Health Plan Flow JSON**: Lead qualification requires a default flow definition seeded in the database during initial deployment. File location: `supabase/seed/default-health-flow.json`.

2. **Consultant Profile Completion**: AI response generation (User Story 4) depends on consultants completing their bio during onboarding. System uses fallback generic tone if bio is missing, but quality degrades.

3. **Lead Qualification Responses**: Analytics (User Story 6) depends on leads completing qualification flows to generate meaningful metrics. Empty dashboard state shown if no leads exist.

**Infrastructure Dependencies:**

1. **Environment Variables**: All features depend on environment variables being correctly configured: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `META_APP_SECRET`, `GROQ_API_KEY`, `ENCRYPTION_KEY`. Deployment fails if any critical variable is missing.

2. **Database Migrations**: Application startup depends on all Supabase migrations being applied. Migration files located in `supabase/migrations/` must be run in sequence before first deployment.

3. **HTTPS Certificate**: Meta webhooks require HTTPS. Dependency on Vercel providing valid TLS certificates for deployed domains. Cannot test webhooks on localhost without ngrok or similar tunneling.

## Out of Scope _(included if needed)_

**Explicitly Excluded from Current Specification:**

1. **Voice and Video Messages**: System only processes text-based WhatsApp messages. Voice notes and video messages are acknowledged but not transcribed or analyzed. Future consideration for speech-to-text integration.

2. **Multi-Language Support**: Only Brazilian Portuguese is supported for UI, error messages, and AI responses. International expansion (Spanish, English) requires separate localization effort.

3. **Real Estate Vertical Flows**: While the platform architecture supports multiple verticals, only health plan qualification flows are included in this specification. Real estate flows, compliance rules, and lead criteria are planned for Phase 3 expansion.

4. **Team Collaboration Features**: Single consultant per account only. No support for teams, assistants, or role-based access control. Each WhatsApp number maps to exactly one consultant account.

5. **Voice Cloning**: AI responses are text-only. Audio generation using consultant's voice (via ElevenLabs or similar) is planned for Phase 3 but out of current scope.

6. **Image Generation**: While architecture references Canva API for comparison images, actual image generation implementation is deferred to Phase 3. Current scope is text-only recommendations.

7. **Payment Processing**: No built-in payment gateway integration. Consultants handle payment transactions outside the platform. Future consideration for integrated checkout.

8. **Appointment Scheduling**: While User Story 1 mentions "appointment scheduling" in the overview, actual calendar integration (Google Calendar, Calendly) is not implemented in Phase 1. Consultants manually schedule appointments based on qualified leads.

9. **Email Notifications**: No automated email notifications for lead status changes, new messages, or analytics reports. All notifications are in-dashboard only. Email infrastructure planned for Phase 2.

10. **Mobile Native Apps**: Web-based dashboard only. No iOS or Android native applications. Dashboard is mobile-responsive but accessed via browser.

11. **Advanced Analytics**: Basic metrics only (6 key metrics, 2 charts). No funnel analysis, cohort reports, predictive modeling, or custom report builder. Advanced analytics planned for Phase 2.

12. **A/B Testing Framework**: No built-in A/B testing for flow variations, message templates, or response strategies. Consultants can manually create multiple flows but no automated experimentation.

13. **Lead Enrichment**: No automatic data enrichment from third-party sources (social media profiles, company databases). System only stores data explicitly provided by lead during qualification.

14. **Bulk Operations**: No bulk actions for lead management (bulk status updates, bulk exports with custom filters, bulk delete). All operations are per-lead only.

15. **White-Label Solution**: Single-brand platform (Consultor.AI). No white-labeling, custom domain mapping, or agency reseller features. Planned for Phase 4.

16. **Offline Mode**: No progressive web app (PWA) offline capabilities. Dashboard requires internet connection. WhatsApp messages queue on Meta's side if consultant is offline.

## Notes _(optional, include if helpful)_

**Technical Implementation Guidance:**

1. **Flow Engine Design**: The flow engine is the core differentiator. Prioritize clean separation between flow definition (JSON), parsing (validation), state management (persistence), and execution (step processors). Each step type (mensagem, escolha, executar) should have a dedicated executor class implementing a common interface.

2. **AI Prompt Engineering**: Compliance filtering is critical for legal protection. The AI prompt must include explicit prohibition rules (no pricing, no illegal claims, no sensitive data requests) AND the system should implement post-generation validation using regex patterns to catch any compliance violations that slip through prompt engineering.

3. **Webhook Reliability**: WhatsApp webhooks can be retried by Meta if initial delivery fails. Implement idempotency using `whatsapp_message_id` as a unique constraint to prevent duplicate message processing. Always respond with 200 OK immediately, then process asynchronously.

4. **Database Indexing Strategy**: With RLS enabled, Supabase performs authorization checks on every query. Create composite indexes on `(consultant_id, status)`, `(consultant_id, created_at)` to optimize filtered queries. Monitor query performance using Supabase dashboard's query analyzer.

5. **TypeScript Strict Mode**: The project enforces strict TypeScript with no `any` types. Generate database types from Supabase schema using `supabase gen types typescript` and import them across the codebase for full type safety.

**Business Context:**

1. **Target Market**: Initial focus is autonomous health plan consultants in Brazil who currently manage leads via spreadsheets and manual WhatsApp conversations. Primary pain point is time spent on repetitive initial qualification conversations.

2. **Competitive Landscape**: Consultants currently use basic tools (WhatsApp Web + Google Sheets). Main competition is inertia and "good enough" manual processes, not sophisticated competing products. Key differentiator is AI-powered personalization while maintaining consultant's unique voice.

3. **Pricing Strategy**: Freemium model planned (20 leads/month free, R$47/month for 200 leads, R$147/month agency tier). Free tier optimizes for viral growth as consultants recommend platform to peers. Monetization via lead volume tiers.

4. **Regulatory Landscape**: ANS (Brazilian health insurance regulator) strictly prohibits misleading marketing practices. Consultants can be fined for illegal claims (e.g., "zero waiting period"). Platform reduces regulatory risk by enforcing compliance programmatically.

**Development Phases:**

- **Phase 1 (MVP - COMPLETED)**: Core flow engine, WhatsApp integration, dashboard, AI generation, default health plan flow. Status: 100% complete, 19 pages, 13 API routes, 0 TypeScript errors.

- **Phase 2 (Polish - PLANNED)**: Lead export (CSV/Excel), follow-up automation, message templates, advanced filters, comprehensive E2E tests. Timeline: 30 days after MVP launch.

- **Phase 3 (Scale - FUTURE)**: Real estate vertical, CRM integrations (RD Station, Pipedrive), voice cloning, image generation, multi-tenant architecture. Timeline: 60 days after Phase 2.

- **Phase 4 (Expansion - FUTURE)**: White-label options, template marketplace, mobile native apps, additional verticals. Timeline: 90+ days.

**Testing Strategy:**

1. **Unit Tests**: Focus on flow engine components (parser, state manager, executors), utility functions (formatters, validators), and service layer logic. Target 90%+ coverage.

2. **Integration Tests**: API routes, database queries, Supabase RLS policies, webhook handlers. Use test database to avoid polluting production data.

3. **E2E Tests**: Critical user flows only (registration → WhatsApp connection, lead qualification end-to-end, dashboard navigation). Use Playwright with headless browser. Limit to high-value scenarios to keep test suite fast.

4. **Manual Testing**: Compliance validation (AI response content review), WhatsApp message delivery, Meta Embedded Signup flow (requires production Meta app). Automate where possible, accept manual verification for OAuth flows.

**Monitoring & Observability:**

1. **Error Tracking**: Integrate Sentry (or Better Stack) for production error monitoring. Alert on error rate > 5%, immediate escalation for 500 errors.

2. **Performance Monitoring**: Track API P95 latency, AI generation latency, database query performance. Alert on degradation > 50% from baseline.

3. **Business Metrics**: Daily active consultants, leads created, qualification completion rate, conversion rate (qualificado → fechado). Dashboard for product team.

4. **Cost Monitoring**: Track WhatsApp message volume, AI API token usage, Supabase bandwidth. Alert when approaching budget limits to prevent unexpected bills.

**Risk Mitigation:**

1. **AI Service Outage**: Implement fallback to pre-defined response templates if Groq/Gemini fails. Log all AI failures for manual consultant follow-up.

2. **WhatsApp API Rate Limits**: Monitor message volume per consultant. Implement queuing if approaching limits (1000 messages/day on free tier).

3. **Database Migration Issues**: Test all Supabase migrations on staging environment before production deployment. Maintain rollback scripts for critical schema changes.

4. **Consultant Churn**: Track engagement metrics (dashboard logins, lead activity). Implement re-engagement campaigns for dormant accounts (email reminders, feature highlights).

5. **Compliance Violations**: Maintain audit log of all AI-generated responses. Implement manual review queue for flagged content. Provide consultant training on ANS regulations.
