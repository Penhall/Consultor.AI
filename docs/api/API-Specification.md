# API Specification
## Consultor.AI - AI-Powered Sales Assistant Platform

**Version:** 1.0
**Date:** 2025-12-12
**Status:** Draft

---

## 1. Overview

### 1.1 Base URLs
- **Production:** `https://api.consultor.ai/v1`
- **Staging:** `https://staging-api.consultor.ai/v1`
- **Local Development:** `http://localhost:54321/functions/v1`

### 1.2 Authentication
All API endpoints (except webhooks) require authentication via JWT token:

```http
Authorization: Bearer <jwt_token>
```

### 1.3 Response Format
All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-12T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid"
    }
  },
  "meta": {
    "timestamp": "2025-12-12T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### 1.4 Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `UNPROCESSABLE_ENTITY` | Semantic error in request |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### 1.5 Rate Limiting
- **Free Tier:** 60 requests/minute
- **Pro Tier:** 300 requests/minute
- **Agency Tier:** 1000 requests/minute

Rate limit headers:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1639392000
```

---

## 2. Authentication Endpoints

### 2.1 Register Consultant

**Endpoint:** `POST /auth/register`

**Description:** Create a new consultant account.

**Request:**
```json
{
  "email": "joana@example.com",
  "password": "SecurePass123!",
  "name": "Joana Silva",
  "whatsapp_number": "+5511987654321",
  "vertical": "health_plans"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "joana@example.com",
    "name": "Joana Silva",
    "slug": "joana-silva",
    "verification_email_sent": true
  }
}
```

**Validation:**
- Email must be valid and unique
- Password minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- WhatsApp number must be valid Brazilian format (+55XXXXXXXXXXX)
- Vertical must be one of: `health_plans`, `real_estate`, `automotive`, `insurance`

---

### 2.2 Login

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "joana@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1.MR3g...",
    "expires_in": 3600,
    "consultant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "joana@example.com",
      "name": "Joana Silva",
      "slug": "joana-silva"
    }
  }
}
```

---

### 2.3 Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refresh_token": "v1.MR3g..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

---

### 2.4 Logout

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

## 3. Consultant Endpoints

### 3.1 Get Consultant Profile

**Endpoint:** `GET /consultants/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "joana@example.com",
    "name": "Joana Silva",
    "bio": "Especialista em planos de saúde há 10 anos",
    "crm_number": "CRM-SP 123456",
    "whatsapp_number": "+5511987654321",
    "vertical": "health_plans",
    "slug": "joana-silva",
    "profile_image_url": "https://storage.consultor.ai/profiles/joana.jpg",
    "subscription_tier": "pro",
    "subscription_expires_at": "2026-01-12T00:00:00Z",
    "is_active": true,
    "created_at": "2025-01-01T10:00:00Z"
  }
}
```

---

### 3.2 Update Consultant Profile

**Endpoint:** `PATCH /consultants/me`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Joana Silva Santos",
  "bio": "Especialista em planos de saúde para famílias",
  "crm_number": "CRM-SP 123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Joana Silva Santos",
    "bio": "Especialista em planos de saúde para famílias",
    "updated_at": "2025-12-12T10:30:00Z"
  }
}
```

**Validation:**
- Bio max 200 characters
- CRM number format validation (if provided)

---

### 3.3 Get Public Profile

**Endpoint:** `GET /public/consultants/:slug`

**Description:** Public endpoint for consultant landing pages.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "name": "Joana Silva",
    "bio": "Especialista em planos de saúde há 10 anos",
    "vertical": "health_plans",
    "profile_image_url": "https://storage.consultor.ai/profiles/joana.jpg",
    "whatsapp_link": "https://wa.me/5511987654321?text=Olá%20Joana"
  }
}
```

---

## 4. Lead Endpoints

### 4.1 List Leads

**Endpoint:** `GET /leads`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (`novo`, `em_contato`, `agendado`, `fechado`)
- `search` (optional): Search by name or WhatsApp number
- `date_from` (optional): ISO 8601 date
- `date_to` (optional): ISO 8601 date
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20, max: 100)

**Example:** `GET /leads?status=novo&page=1&per_page=20`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "lead-uuid-1",
        "name": "Maria Santos",
        "whatsapp_number": "+5511999999999",
        "status": "novo",
        "respostas": {
          "perfil": "familia",
          "idade": "31_45",
          "copart": "nao"
        },
        "last_interaction_at": "2025-12-12T09:00:00Z",
        "created_at": "2025-12-12T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

### 4.2 Get Lead Details

**Endpoint:** `GET /leads/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "lead-uuid-1",
    "name": "Maria Santos",
    "whatsapp_number": "+5511999999999",
    "profile_name": "Maria S.",
    "status": "em_contato",
    "respostas": {
      "perfil": "familia",
      "idade": "31_45",
      "copart": "nao"
    },
    "metadata": {
      "source": "instagram",
      "utm_campaign": "black_friday"
    },
    "conversations": [
      {
        "id": "conv-uuid-1",
        "flow_id": "flow-uuid-1",
        "is_completed": true,
        "started_at": "2025-12-12T08:00:00Z",
        "completed_at": "2025-12-12T08:15:00Z"
      }
    ],
    "created_at": "2025-12-12T08:00:00Z",
    "updated_at": "2025-12-12T09:00:00Z"
  }
}
```

---

### 4.3 Update Lead Status

**Endpoint:** `PATCH /leads/:id/status`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "agendado",
  "notes": "Consulta agendada para 15/12"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "lead-uuid-1",
    "status": "agendado",
    "updated_at": "2025-12-12T10:30:00Z"
  }
}
```

**Validation:**
- Status must be valid enum value
- Status transitions must follow business rules

---

### 4.4 Export Leads

**Endpoint:** `POST /leads/export`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "filters": {
    "status": "fechado",
    "date_from": "2025-01-01",
    "date_to": "2025-12-31"
  },
  "format": "csv"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "download_url": "https://storage.consultor.ai/exports/leads_2025-12-12.csv",
    "expires_at": "2025-12-13T10:30:00Z",
    "total_records": 127
  }
}
```

**Notes:**
- Export file available for 24 hours
- Logged in audit trail for LGPD compliance

---

## 5. Conversation Endpoints

### 5.1 Get Conversation History

**Endpoint:** `GET /conversations/:id/messages`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv-uuid-1",
    "lead": {
      "id": "lead-uuid-1",
      "name": "Maria Santos"
    },
    "messages": [
      {
        "id": "msg-uuid-1",
        "direction": "inbound",
        "content": "Olá",
        "message_type": "text",
        "created_at": "2025-12-12T08:00:00Z"
      },
      {
        "id": "msg-uuid-2",
        "direction": "outbound",
        "content": "Olá! Aqui é a assistente da Joana...",
        "message_type": "text",
        "created_at": "2025-12-12T08:00:05Z"
      },
      {
        "id": "msg-uuid-3",
        "direction": "outbound",
        "content": "Comparativo de planos",
        "message_type": "image",
        "media_url": "https://storage.consultor.ai/images/comparison.png",
        "created_at": "2025-12-12T08:05:00Z"
      }
    ]
  }
}
```

---

## 6. Flow Endpoints

### 6.1 List Flows

**Endpoint:** `GET /flows`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `vertical` (optional): Filter by vertical
- `is_template` (optional): Show only templates (boolean)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "flows": [
      {
        "id": "flow-uuid-1",
        "name": "Triagem Básica - Planos de Saúde",
        "vertical": "health_plans",
        "description": "Fluxo padrão para qualificação de leads",
        "version": 1,
        "is_active": true,
        "is_template": true,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

---

### 6.2 Get Flow Definition

**Endpoint:** `GET /flows/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "flow-uuid-1",
    "name": "Triagem Básica - Planos de Saúde",
    "vertical": "health_plans",
    "definition": {
      "etapas": [
        {
          "id": "inicio",
          "tipo": "mensagem",
          "conteudo": "Olá! Aqui é a assistente da {{nome_vendedor}}...",
          "proxima": "perfil"
        },
        {
          "id": "perfil",
          "tipo": "escolha",
          "pergunta": "Você busca plano para:",
          "opcoes": [
            {"rotulo": "Só eu", "valor": "individual"},
            {"rotulo": "Família", "valor": "familia"}
          ],
          "proxima": "idade"
        }
      ]
    }
  }
}
```

---

### 6.3 Create Custom Flow (Future)

**Endpoint:** `POST /flows`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Meu Fluxo Customizado",
  "vertical": "health_plans",
  "description": "Fluxo personalizado",
  "definition": { ... }
}
```

**Response:** `201 Created`

**Note:** Only available for Pro and Agency tiers.

---

## 7. Analytics Endpoints

### 7.1 Get Dashboard Metrics

**Endpoint:** `GET /analytics/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (optional): `7d`, `30d`, `90d` (default: `30d`)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "total_leads": 156,
    "new_leads": 23,
    "leads_by_status": {
      "novo": 45,
      "em_contato": 67,
      "agendado": 28,
      "fechado": 16
    },
    "conversion_rate": 10.26,
    "avg_response_time_minutes": 2.5,
    "total_conversations": 189,
    "completed_conversations": 145,
    "ai_metrics": {
      "total_responses": 342,
      "avg_latency_ms": 850,
      "total_tokens_used": 45600
    }
  }
}
```

---

### 7.2 Get Funnel Analysis

**Endpoint:** `GET /analytics/funnel`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `flow_id` (optional): Filter by specific flow
- `period` (optional): `7d`, `30d`, `90d`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "flow_name": "Triagem Básica - Planos de Saúde",
    "steps": [
      {
        "step_id": "inicio",
        "step_name": "Início",
        "total_reached": 156,
        "completed": 156,
        "drop_off_rate": 0
      },
      {
        "step_id": "perfil",
        "step_name": "Seleção de Perfil",
        "total_reached": 156,
        "completed": 142,
        "drop_off_rate": 8.97
      },
      {
        "step_id": "idade",
        "step_name": "Faixa Etária",
        "total_reached": 142,
        "completed": 138,
        "drop_off_rate": 2.82
      }
    ]
  }
}
```

---

## 8. Webhook Endpoints

### 8.1 WhatsApp Message Webhook

**Endpoint:** `POST /webhooks/whatsapp/message`

**Description:** Receives incoming WhatsApp messages from Weni/360dialog.

**Authentication:** Webhook signature validation (HMAC-SHA256)

**Headers:**
- `X-Webhook-Signature`: HMAC signature
- `Content-Type`: `application/json`

**Request Payload:**
```json
{
  "event_type": "message",
  "timestamp": "2025-12-12T08:00:00Z",
  "message": {
    "id": "wamid.HBgLNTU...",
    "from": "5511999999999",
    "type": "text",
    "text": {
      "body": "Olá"
    },
    "timestamp": "2025-12-12T08:00:00Z"
  },
  "contact": {
    "profile": {
      "name": "Maria Santos"
    },
    "wa_id": "5511999999999"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message_received": true,
    "conversation_id": "conv-uuid-1"
  }
}
```

**Error Handling:**
- Invalid signature: `401 Unauthorized`
- Duplicate message (idempotency): `200 OK` (no-op)
- Processing error: `500 Internal Server Error` (triggers retry)

---

### 8.2 WhatsApp Status Webhook

**Endpoint:** `POST /webhooks/whatsapp/status`

**Description:** Receives message delivery status updates.

**Request Payload:**
```json
{
  "event_type": "status",
  "timestamp": "2025-12-12T08:00:10Z",
  "statuses": [
    {
      "id": "wamid.HBgLNTU...",
      "status": "delivered",
      "timestamp": "2025-12-12T08:00:10Z",
      "recipient_id": "5511999999999"
    }
  ]
}
```

**Response:** `200 OK`

**Status Values:**
- `sent`: Message sent to WhatsApp servers
- `delivered`: Message delivered to recipient's device
- `read`: Message read by recipient
- `failed`: Message delivery failed

---

## 9. Integration Endpoints (Future)

### 9.1 Google Calendar Integration

**Endpoint:** `POST /integrations/calendar/connect`

**Request:**
```json
{
  "provider": "google",
  "authorization_code": "4/0AY..."
}
```

**Response:** `200 OK`

---

### 9.2 CRM Integration

**Endpoint:** `POST /integrations/crm/sync`

**Request:**
```json
{
  "provider": "rd_station",
  "lead_ids": ["lead-uuid-1", "lead-uuid-2"]
}
```

**Response:** `200 OK`

---

## 10. OpenAPI 3.0 Specification

Complete OpenAPI specification available at:
- **Swagger UI:** `https://api.consultor.ai/docs`
- **JSON:** `https://api.consultor.ai/openapi.json`
- **YAML:** `https://api.consultor.ai/openapi.yaml`

---

## 11. SDK and Client Libraries

### 11.1 Official SDKs (Planned)
- **JavaScript/TypeScript:** `npm install @consultor-ai/sdk`
- **Python:** `pip install consultor-ai`

### 11.2 Example Usage (TypeScript)

```typescript
import { ConsultorAI } from '@consultor-ai/sdk';

const client = new ConsultorAI({
  apiKey: process.env.CONSULTOR_AI_API_KEY
});

// Fetch leads
const leads = await client.leads.list({
  status: 'novo',
  page: 1,
  per_page: 20
});

// Update lead status
await client.leads.updateStatus('lead-uuid-1', {
  status: 'agendado',
  notes: 'Consulta marcada'
});

// Get analytics
const metrics = await client.analytics.dashboard({
  period: '30d'
});
```

---

## 12. Webhook Signature Verification

### 12.1 Signature Generation (Server-Side)

```typescript
import crypto from 'crypto';

function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}
```

### 12.2 Signature Verification (Client-Side)

```typescript
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 13. Versioning Strategy

### 13.1 API Versioning
- Version included in URL: `/v1/`, `/v2/`
- Breaking changes require new major version
- Non-breaking changes (new fields, endpoints) don't increment version

### 13.2 Deprecation Policy
- Minimum 6 months notice for endpoint deprecation
- Deprecation warnings in response headers: `X-API-Deprecated: true`
- Migration guide provided

---

## 14. Best Practices

### 14.1 Pagination
Always use pagination for list endpoints to avoid performance issues:
```http
GET /leads?page=1&per_page=20
```

### 14.2 Filtering
Use query parameters for filtering, not POST body:
```http
GET /leads?status=novo&date_from=2025-01-01
```

### 14.3 Idempotency
Use `Idempotency-Key` header for safe retries:
```http
POST /leads/:id/status
Idempotency-Key: unique-key-123
```

### 14.4 Caching
Respect cache headers:
```http
Cache-Control: public, max-age=300
ETag: "abc123"
```

Use `If-None-Match` for conditional requests:
```http
GET /consultants/me
If-None-Match: "abc123"
```

---

## 15. Appendices

### 15.1 HTTP Status Codes Summary

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE with no body |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Semantic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Maintenance or overload |

### 15.2 Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-12 | Initial | First draft of API specification |
