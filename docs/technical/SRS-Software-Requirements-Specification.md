# Software Requirements Specification (SRS)
## Consultor.AI - AI-Powered Sales Assistant Platform

**Version:** 1.0
**Date:** 2025-12-12
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a complete description of the functional and non-functional requirements for Consultor.AI, an AI-powered WhatsApp assistant platform designed to automate lead qualification and nurturing for autonomous salespeople.

### 1.2 Scope
Consultor.AI is a SaaS platform that enables autonomous consultants (initially health plan sellers and real estate agents) to create personalized AI assistants that interact with leads via WhatsApp 24/7. The system qualifies leads through conversational flows, generates personalized recommendations, and facilitates appointment scheduling.

**Key Capabilities:**
- Multi-tenant platform supporting multiple consultants
- JSON-driven conversation flow engine
- AI-powered personalized response generation
- WhatsApp Business API integration
- Automated image generation for product comparisons
- Lead management dashboard
- CRM integration capabilities

### 1.3 Intended Audience
- Development Team
- Product Managers
- QA Engineers
- System Architects
- Stakeholders

### 1.4 Definitions and Acronyms
- **Consultant**: The autonomous salesperson using the platform
- **Lead**: A potential customer interacting with the AI assistant
- **Flow**: A structured conversation path defined in JSON
- **Vertical**: A business category (e.g., health plans, real estate)
- **ANS**: Brazilian National Regulatory Agency for Private Health Insurance
- **LGPD**: Brazilian General Data Protection Law (Lei Geral de Proteção de Dados)

---

## 2. Overall Description

### 2.1 Product Perspective
Consultor.AI is a standalone SaaS platform that integrates with:
- WhatsApp Business API (via Weni Cloud/360dialog)
- AI language models (Groq/Llama 3.1)
- Image generation services (Canva API)
- Calendar services (Google Calendar, Calendly)
- CRM platforms (RD Station, Pipedrive, Agendor)

### 2.2 Product Functions
1. **Consultant Onboarding**: Registration, profile setup, unique link generation
2. **Conversation Management**: Dynamic flow execution based on JSON definitions
3. **Lead Qualification**: Automated data collection through conversational interface
4. **AI Response Generation**: Context-aware, personalized responses maintaining consultant's voice
5. **Content Generation**: Automated creation of comparison images and product recommendations
6. **Lead Management**: Dashboard for consultants to view and manage leads
7. **Analytics**: Conversion metrics, response rates, engagement tracking
8. **Integration**: Webhooks and APIs for external system connectivity

### 2.3 User Classes and Characteristics

#### 2.3.1 Consultant (Primary User)
- Autonomous salesperson in health plans or real estate
- Limited technical expertise
- Needs simple onboarding and configuration
- Primarily mobile user
- Values time efficiency and lead quality

#### 2.3.2 Lead (End User)
- Potential customer seeking health plans or real estate
- WhatsApp user
- Expects quick, clear, trustworthy responses
- May be skeptical of automated systems

#### 2.3.3 Platform Administrator
- Manages platform infrastructure
- Monitors system health
- Handles support escalations
- Configures global settings

### 2.4 Operating Environment
- **Client**: WhatsApp mobile application (iOS/Android)
- **Consultant Portal**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Backend**: Cloud-hosted (Vercel, Supabase)
- **Database**: PostgreSQL 14+
- **Minimum Mobile Requirements**: Android 5.0+ / iOS 12+

### 2.5 Design and Implementation Constraints
- Must comply with WhatsApp Business Policy
- Must comply with LGPD (Brazilian data protection law)
- Must comply with ANS regulations for health plan marketing
- Cannot store sensitive health information
- Response time < 3 seconds for AI generation
- Must support Brazilian Portuguese
- Must operate within free tier limits for MVP (cost optimization)

### 2.6 Assumptions and Dependencies
- WhatsApp Business API remains available and affordable
- Groq API maintains current pricing and latency
- Supabase maintains free tier offerings
- Consultants have active WhatsApp Business accounts
- Leads have access to WhatsApp

---

## 3. Functional Requirements

### 3.1 Consultant Management

#### FR-CM-001: Consultant Registration
**Priority:** High
**Description:** System shall allow consultants to create an account with email and password.
**Inputs:** Email, password, full name, phone number
**Processing:** Validate email uniqueness, hash password, send verification email
**Outputs:** User account, verification email
**Acceptance Criteria:**
- Email must be unique
- Password must be minimum 8 characters
- Verification email sent within 30 seconds

#### FR-CM-002: Profile Configuration
**Priority:** High
**Description:** Consultant shall configure their professional profile including bio, credentials, and vertical.
**Inputs:** Name, bio (max 200 chars), professional registration (CRM/CRECI), vertical selection
**Processing:** Generate unique URL slug from name, validate credential format
**Outputs:** Public profile page, unique link (e.g., consultor.ai/joana-saude)
**Acceptance Criteria:**
- Bio limited to 200 characters
- Unique slug generated (handle collisions with numeric suffix)
- Profile publicly accessible via unique link

#### FR-CM-003: WhatsApp Integration
**Priority:** High
**Description:** Consultant shall connect their WhatsApp Business number to the platform.
**Inputs:** WhatsApp Business phone number
**Processing:** Validate number format, send verification code, register webhook
**Outputs:** Connected WhatsApp account, webhook configuration
**Acceptance Criteria:**
- Support Brazilian phone number format (+55)
- Verification code valid for 5 minutes
- Webhook registered successfully

### 3.2 Conversation Flow Engine

#### FR-CF-001: Flow Definition
**Priority:** High
**Description:** System shall execute conversations based on JSON flow definitions.
**Inputs:** Flow JSON, lead responses
**Processing:** Parse JSON, execute current step, determine next step
**Outputs:** Bot messages, navigation to next step
**Acceptance Criteria:**
- Support step types: mensagem, escolha, executar
- Template variable substitution ({{nome_vendedor}})
- Error handling for malformed JSON

#### FR-CF-002: Multi-choice Questions
**Priority:** High
**Description:** System shall present multiple choice questions with numbered options.
**Inputs:** Question definition, option list
**Processing:** Format options, validate user selection
**Outputs:** Numbered option list, selected value storage
**Acceptance Criteria:**
- Support 2-6 options per question
- Accept numeric input (1, 2, 3...)
- Validate selection within range

#### FR-CF-003: Flow State Management
**Priority:** High
**Description:** System shall maintain conversation state for each lead.
**Inputs:** Lead ID, current step, collected responses
**Processing:** Store state in database, retrieve on message receipt
**Outputs:** Current conversation context
**Acceptance Criteria:**
- State persists across sessions
- Handle conversation timeout (24 hours)
- Support conversation restart

### 3.3 AI Response Generation

#### FR-AI-001: Personalized Response Generation
**Priority:** High
**Description:** System shall generate personalized responses using AI based on lead data and consultant profile.
**Inputs:** Lead responses, consultant bio, response template
**Processing:** Construct prompt, call Groq API, validate response
**Outputs:** Personalized text response
**Acceptance Criteria:**
- Response generated in < 3 seconds
- Tone matches consultant's bio
- Maximum 80 words
- No prohibited content (pricing promises, illegal claims)

#### FR-AI-002: Compliance Filtering
**Priority:** Critical
**Description:** AI responses shall be filtered for regulatory compliance.
**Inputs:** Generated response text
**Processing:** Check for prohibited terms, validate against rules
**Outputs:** Compliant response or error flag
**Acceptance Criteria:**
- Block exact pricing quotes
- Block requests for CPF, medical history
- Block promises of zero waiting period (health plans)
- Flag response for manual review if compliance uncertain

#### FR-AI-003: Recommendation Generation
**Priority:** High
**Description:** System shall generate 1-2 product recommendations based on lead qualification.
**Inputs:** Lead profile, age, preferences
**Processing:** Match to recommendation rules, format output
**Outputs:** Product names, differentiators, call-to-action
**Acceptance Criteria:**
- Recommendations relevant to collected data
- Include specific differentiators
- Include contextual CTA

### 3.4 Content Generation

#### FR-CG-001: Comparison Image Generation
**Priority:** Medium
**Description:** System shall generate visual comparison images using Canva API.
**Inputs:** Template ID, product data (names, features)
**Processing:** Populate template variables, request image generation
**Outputs:** PNG image URL
**Acceptance Criteria:**
- Image generated in < 5 seconds
- Consultant branding included
- Image size optimized for WhatsApp (< 500KB)

#### FR-CG-002: Dynamic Content Personalization
**Priority:** Medium
**Description:** Generated content shall include consultant's name and branding.
**Inputs:** Consultant profile data
**Processing:** Template variable substitution
**Outputs:** Personalized content
**Acceptance Criteria:**
- Name displayed correctly
- Branding consistent across messages

### 3.5 Lead Management

#### FR-LM-001: Lead Capture
**Priority:** High
**Description:** System shall automatically create lead record on first contact.
**Inputs:** WhatsApp number, profile name
**Processing:** Check for existing lead, create if new
**Outputs:** Lead record with status "novo"
**Acceptance Criteria:**
- Deduplicate by WhatsApp number
- Capture timestamp
- Associate with correct consultant

#### FR-LM-002: Lead Dashboard
**Priority:** High
**Description:** Consultant shall view all leads in a dashboard with filtering and sorting.
**Inputs:** Consultant ID, filter criteria
**Processing:** Query database, apply filters, sort results
**Outputs:** Paginated lead list
**Acceptance Criteria:**
- Display: name, status, date, last interaction
- Filter by: status, date range, profile type
- Sort by: date, name, status
- Pagination (20 per page)

#### FR-LM-003: Lead Status Management
**Priority:** High
**Description:** System shall track lead status through the sales funnel.
**Inputs:** Lead ID, new status
**Processing:** Update status, timestamp change
**Outputs:** Updated lead record
**Acceptance Criteria:**
- Status values: novo, em_contato, agendado, fechado
- Status history tracked
- Automatic status transitions based on actions

#### FR-LM-004: Lead Export
**Priority:** Medium
**Description:** Consultant shall export leads to CSV format.
**Inputs:** Filter criteria
**Processing:** Generate CSV with selected fields
**Outputs:** CSV file download
**Acceptance Criteria:**
- Include: name, phone, responses, status, date
- UTF-8 encoding with BOM (Excel compatibility)
- Filename includes timestamp

### 3.6 Integration

#### FR-IN-001: Webhook API
**Priority:** High
**Description:** System shall receive webhook events from WhatsApp Business API.
**Inputs:** HTTP POST with message payload
**Processing:** Validate signature, parse payload, route to conversation engine
**Outputs:** HTTP 200 response, message processing
**Acceptance Criteria:**
- Respond within 5 seconds
- Validate webhook signature
- Handle duplicate messages (idempotency)

#### FR-IN-002: Calendar Integration
**Priority:** Medium
**Description:** System shall support appointment scheduling via calendar integration.
**Inputs:** Lead request for appointment
**Processing:** Check consultant availability, create event
**Outputs:** Calendar event, confirmation message
**Acceptance Criteria:**
- Support Google Calendar and Calendly
- Avoid double-booking
- Send confirmation to both parties

#### FR-IN-003: CRM Integration
**Priority:** Low (Future)
**Description:** System shall export leads to external CRM platforms.
**Inputs:** Lead data, CRM credentials
**Processing:** Map fields to CRM schema, API call
**Outputs:** CRM contact record
**Acceptance Criteria:**
- Support RD Station, Pipedrive, Agendor
- Bi-directional sync
- Error handling and retry logic

### 3.7 Analytics

#### FR-AN-001: Conversion Metrics
**Priority:** Medium
**Description:** Dashboard shall display conversion funnel metrics.
**Inputs:** Consultant ID, date range
**Processing:** Aggregate lead data, calculate percentages
**Outputs:** Metrics display
**Acceptance Criteria:**
- Display: total leads, response rate, appointment rate, close rate
- Date range filter (last 7/30/90 days)
- Visual charts (bar/line)

#### FR-AN-002: Flow Performance
**Priority:** Low
**Description:** System shall track completion rate for each flow step.
**Inputs:** Flow ID
**Processing:** Count leads at each step, calculate drop-off
**Outputs:** Funnel visualization
**Acceptance Criteria:**
- Show drop-off percentage per step
- Identify bottleneck steps
- Suggest flow optimizations

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### NFR-PF-001: Response Time
**Description:** AI response generation shall complete within 3 seconds under normal load.
**Measurement:** 95th percentile response time < 3s

#### NFR-PF-002: Concurrent Users
**Description:** System shall support 100 concurrent conversations.
**Measurement:** Load test with 100 simultaneous webhook requests

#### NFR-PF-003: Message Throughput
**Description:** System shall process 1000 messages per minute.
**Measurement:** Sustained load test at 1000 msg/min for 10 minutes

### 4.2 Security Requirements

#### NFR-SC-001: Data Encryption
**Description:** All data in transit shall be encrypted using TLS 1.3.
**Verification:** SSL Labs scan shows A+ rating

#### NFR-SC-002: Authentication
**Description:** Consultant portal shall require multi-factor authentication.
**Verification:** Support TOTP-based MFA

#### NFR-SC-003: Data Privacy
**Description:** System shall comply with LGPD requirements.
**Verification:**
- Data processing consent collected
- Data deletion on request within 30 days
- Privacy policy displayed
- Data export capability

#### NFR-SC-004: Webhook Signature Validation
**Description:** All webhook requests shall be validated for authenticity.
**Verification:** Reject unsigned or invalid signature requests

### 4.3 Reliability Requirements

#### NFR-RL-001: Availability
**Description:** System shall maintain 99.5% uptime.
**Measurement:** Monthly uptime calculation excluding planned maintenance

#### NFR-RL-002: Data Backup
**Description:** Database shall be backed up daily with 30-day retention.
**Verification:** Successful backup restoration test

#### NFR-RL-003: Error Recovery
**Description:** Transient API failures shall be retried with exponential backoff.
**Verification:** Simulate API failure, verify retry behavior

### 4.4 Maintainability Requirements

#### NFR-MT-001: Code Documentation
**Description:** All public APIs shall have OpenAPI documentation.
**Verification:** 100% API endpoint documentation coverage

#### NFR-MT-002: Logging
**Description:** All errors shall be logged with context for debugging.
**Verification:** Error logs include: timestamp, user ID, request ID, stack trace

#### NFR-MT-003: Monitoring
**Description:** System health metrics shall be monitored in real-time.
**Verification:** Alerts configured for: error rate > 1%, latency > 5s, uptime < 99%

### 4.5 Usability Requirements

#### NFR-US-001: Onboarding Time
**Description:** Consultant shall complete onboarding in < 10 minutes.
**Measurement:** User testing with 5 consultants, average time < 10min

#### NFR-US-002: Mobile Responsiveness
**Description:** Dashboard shall be fully functional on mobile devices.
**Verification:** Test on iPhone SE, Samsung Galaxy A series

#### NFR-US-003: Accessibility
**Description:** Web interface shall meet WCAG 2.1 Level AA standards.
**Verification:** Automated accessibility audit (Axe, Lighthouse)

### 4.6 Scalability Requirements

#### NFR-SL-001: Horizontal Scaling
**Description:** System shall support horizontal scaling of API servers.
**Verification:** Deploy 3 API instances, verify load distribution

#### NFR-SL-002: Database Performance
**Description:** Database queries shall maintain < 100ms response time at 10,000 leads.
**Measurement:** Load database with 10k leads, measure query times

### 4.7 Compliance Requirements

#### NFR-CM-001: WhatsApp Business Policy
**Description:** All messages shall comply with WhatsApp Business Policy.
**Verification:**
- No spam or unsolicited messages
- 24-hour response window enforced
- Approved message templates used

#### NFR-CM-002: ANS Regulations (Health Plans)
**Description:** Health plan marketing shall comply with ANS Resolution 195/2009.
**Verification:**
- No pricing quotes without context
- No false promises of coverage
- Transparent information about waiting periods

#### NFR-CM-003: Data Retention
**Description:** Lead data shall be retained for maximum 5 years unless deleted.
**Verification:** Automated cleanup job for data > 5 years

---

## 5. System Features by Priority

### P0 (Critical - MVP)
- FR-CM-001, FR-CM-002, FR-CM-003: Consultant management
- FR-CF-001, FR-CF-002, FR-CF-003: Conversation engine
- FR-AI-001, FR-AI-002: AI generation with compliance
- FR-LM-001, FR-LM-002: Lead capture and dashboard
- FR-IN-001: WhatsApp webhook

### P1 (High - Launch)
- FR-AI-003: Recommendation generation
- FR-CG-001: Image generation
- FR-LM-003, FR-LM-004: Lead management
- FR-AN-001: Basic analytics

### P2 (Medium - Post-Launch)
- FR-IN-002: Calendar integration
- FR-CG-002: Advanced personalization
- FR-AN-002: Flow analytics

### P3 (Low - Future)
- FR-IN-003: CRM integration
- Voice cloning
- Template marketplace

---

## 6. External Interface Requirements

### 6.1 User Interfaces
- **Consultant Portal**: Responsive web application (Next.js)
- **Lead Interface**: WhatsApp chat (no custom UI)

### 6.2 Hardware Interfaces
None (cloud-based system)

### 6.3 Software Interfaces

#### 6.3.1 WhatsApp Business API (Weni/360dialog)
- **Protocol**: HTTPS REST
- **Data Format**: JSON
- **Authentication**: API key
- **Operations**: Send message, receive webhook, get message status

#### 6.3.2 Groq API
- **Protocol**: HTTPS REST
- **Data Format**: JSON
- **Authentication**: Bearer token
- **Operations**: Chat completion

#### 6.3.3 Canva API
- **Protocol**: HTTPS REST
- **Data Format**: JSON
- **Authentication**: OAuth 2.0
- **Operations**: Generate image from template

#### 6.3.4 Supabase
- **Protocol**: PostgreSQL wire protocol, HTTPS REST
- **Data Format**: JSON
- **Authentication**: API key, JWT
- **Operations**: CRUD, real-time subscriptions, edge functions

### 6.4 Communications Interfaces
- **HTTPS**: TLS 1.3 for all API communication
- **WebSocket**: Real-time dashboard updates (via Supabase)

---

## 7. Appendices

### 7.1 Glossary
- **Coparticipation**: Health plan model where patient pays a fee per consultation
- **CRM/CRECI**: Professional registration numbers for health consultants and real estate agents
- **Edge Function**: Serverless function running close to users for low latency
- **Template Message**: Pre-approved WhatsApp message format

### 7.2 References
- WhatsApp Business Policy: https://www.whatsapp.com/legal/business-policy
- LGPD Law Text: http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- ANS Resolution 195/2009: https://www.ans.gov.br/component/legislacao/?view=legislacao&task=textoLei&format=raw&id=1469

### 7.3 Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-12 | Initial | First draft of SRS document |
