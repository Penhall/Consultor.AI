# Arquitetura Multi-Tenant - Consultor.AI

## 🎯 Conceito Fundamental

O Consultor.AI é um **SAAS (Software as a Service)** multi-tenant onde:

- **Plataforma (você)**: Fornece a infraestrutura, IA, dashboard
- **Consultores (clientes)**: Conectam suas próprias contas WhatsApp
- **Leads**: Chegam diretamente no WhatsApp de cada consultor

## 🏗️ Diagrama de Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                    CONSULTOR.AI PLATFORM                     │
│                        (Multi-Tenant)                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │   Dashboard    │  │   AI Engine    │  │   Billing    │  │
│  │   (Next.js)    │  │  (Gemini API)  │  │   (Stripe)   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Central Database (PostgreSQL)              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │ Consultants  │  │    Leads     │  │ Messages  │  │   │
│  │  │              │  │              │  │           │  │   │
│  │  │ - id         │  │ - consultant │  │ - lead_id │  │   │
│  │  │ - name       │  │   _id        │  │ - content │  │   │
│  │  │ - email      │  │ - name       │  │ - sender  │  │   │
│  │  │ - tier       │  │ - phone      │  │           │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │     WhatsApp Integrations (por consultor)    │   │   │
│  │  │                                              │   │   │
│  │  │  - consultant_id (FK)                        │   │   │
│  │  │  - whatsapp_provider (weni, 360dialog, etc)  │   │   │
│  │  │  - api_key (encrypted)                       │   │   │
│  │  │  - phone_number                              │   │   │
│  │  │  - webhook_secret (encrypted)                │   │   │
│  │  │  - status (active, inactive)                 │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ↓               ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Consultor A  │ │ Consultor B  │ │ Consultor C  │
│              │ │              │ │              │
│ WhatsApp:    │ │ WhatsApp:    │ │ WhatsApp:    │
│ +5561982..   │ │ +5511998..   │ │ +5521987..   │
│              │ │              │ │              │
│ Weni Account │ │ 360dialog    │ │ Weni Account │
│ (própria)    │ │ (própria)    │ │ (própria)    │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ↓                ↓                ↓
   Leads do A       Leads do B       Leads do C
```

## 🔄 Fluxo de Dados

### 1. Onboarding do Consultor

```
1. Consultor se cadastra
   ↓
2. Escolhe plano (Freemium/Pro/Agência)
   ↓
3. Conecta WhatsApp Business
   │
   ├─ Opção A: Weni Cloud
   │  └─ Fornece API Key da Weni
   │
   ├─ Opção B: 360dialog
   │  └─ Fornece API Key da 360dialog
   │
   └─ Opção C: Twilio
      └─ Fornece credenciais Twilio
   ↓
4. Plataforma salva credenciais (encrypted)
   ↓
5. Plataforma registra webhook único:
   https://consultor.ai/api/webhook/whatsapp/{consultant_id}
```

### 2. Fluxo de Mensagem (Lead → Consultor)

```
Lead envia WhatsApp
     ↓
WhatsApp Business API (Weni/360dialog do CONSULTOR)
     ↓
POST https://consultor.ai/api/webhook/whatsapp/{consultant_id}
     ↓
Plataforma identifica consultor
     ↓
Busca credenciais do consultor no DB
     ↓
Processa com IA (Gemini - compartilhado)
     ↓
Envia resposta usando API Key DO CONSULTOR
     ↓
WhatsApp do consultor envia para lead
```

### 3. Fluxo de Mensagem (Consultor → Lead via Dashboard)

```
Consultor loga no dashboard
     ↓
Vê lista de leads
     ↓
Envia mensagem manual
     ↓
Plataforma usa credenciais DO CONSULTOR
     ↓
WhatsApp API envia mensagem
```

## 💾 Schema de Banco de Dados (Atualizado)

### Tabela: `whatsapp_integrations`

```sql
CREATE TABLE whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,

  -- Provedor (Weni, 360dialog, Twilio, etc)
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('weni', '360dialog', 'twilio')),

  -- Credenciais (ENCRYPTED)
  api_key TEXT NOT NULL,  -- Encrypted
  api_secret TEXT,        -- Encrypted (se necessário)
  webhook_secret TEXT NOT NULL,  -- Encrypted

  -- WhatsApp Info
  phone_number VARCHAR(20) NOT NULL,
  phone_number_id VARCHAR(100),  -- Para Meta/360dialog
  business_account_id VARCHAR(100),  -- Para Meta/360dialog

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  verified_at TIMESTAMPTZ,

  -- Metadata
  webhook_url TEXT GENERATED ALWAYS AS (
    'https://consultor.ai/api/webhook/whatsapp/' || consultant_id::text
  ) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(consultant_id, provider),  -- Um consultor pode ter múltiplos provedores
  UNIQUE(phone_number)  -- Cada número só pode estar em uma integração
);

-- Index para busca rápida por webhook
CREATE INDEX idx_whatsapp_integrations_consultant
  ON whatsapp_integrations(consultant_id)
  WHERE status = 'active';

-- Index para busca por telefone
CREATE INDEX idx_whatsapp_integrations_phone
  ON whatsapp_integrations(phone_number);

-- RLS (Row Level Security)
ALTER TABLE whatsapp_integrations ENABLE ROW LEVEL SECURITY;

-- Política: Consultores só veem suas integrações
CREATE POLICY consultants_own_integrations
  ON whatsapp_integrations
  FOR ALL
  USING (consultant_id = auth.uid());
```

### Exemplo de dados

```sql
INSERT INTO whatsapp_integrations (
  consultant_id,
  provider,
  api_key,
  webhook_secret,
  phone_number,
  status
) VALUES (
  'uuid-do-consultor-a',
  'weni',
  encrypt('weni_api_key_do_consultor_a'),
  encrypt('webhook_secret_123'),
  '+5561982809595',
  'active'
);
```

## 🔐 Segurança das Credenciais

### Criptografia

```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes
const ALGORITHM = 'aes-256-gcm'

export function encrypt(text: string): string {
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Retorna: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)

  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
```

### Uso no código

```typescript
// app/api/consultants/connect-whatsapp/route.ts
import { encrypt } from '@/lib/encryption'

export async function POST(req: Request) {
  const { provider, apiKey, phoneNumber } = await req.json()
  const consultantId = await getAuthenticatedConsultant()

  // Criptografa antes de salvar
  const encryptedApiKey = encrypt(apiKey)
  const webhookSecret = randomBytes(32).toString('hex')
  const encryptedWebhookSecret = encrypt(webhookSecret)

  await supabase.from('whatsapp_integrations').insert({
    consultant_id: consultantId,
    provider,
    api_key: encryptedApiKey,
    webhook_secret: encryptedWebhookSecret,
    phone_number: phoneNumber,
  })

  return Response.json({
    webhookUrl: `https://consultor.ai/api/webhook/whatsapp/${consultantId}`,
    webhookSecret: webhookSecret,  // Retorna sem criptografar para o consultor configurar
  })
}
```

### Busca de credenciais

```typescript
// lib/whatsapp/client.ts
import { decrypt } from '@/lib/encryption'

export async function getConsultantWhatsAppClient(consultantId: string) {
  const { data } = await supabase
    .from('whatsapp_integrations')
    .select('*')
    .eq('consultant_id', consultantId)
    .eq('status', 'active')
    .single()

  if (!data) throw new Error('WhatsApp not connected')

  // Descriptografa antes de usar
  const apiKey = decrypt(data.api_key)

  // Retorna cliente configurado
  switch (data.provider) {
    case 'weni':
      return new WeniClient(apiKey, data.phone_number)
    case '360dialog':
      return new Dialog360Client(apiKey, data.phone_number_id)
    default:
      throw new Error('Unsupported provider')
  }
}
```

## 🌐 API Webhook (Multi-Tenant)

### Endpoint único por consultor

```typescript
// app/api/webhook/whatsapp/[consultantId]/route.ts
import { getConsultantWhatsAppClient } from '@/lib/whatsapp/client'

export async function POST(
  req: Request,
  { params }: { params: { consultantId: string } }
) {
  const consultantId = params.consultantId
  const body = await req.json()

  // 1. Valida webhook secret
  const signature = req.headers.get('x-webhook-signature')
  await validateWebhookSignature(consultantId, signature, body)

  // 2. Extrai mensagem
  const message = extractMessage(body)  // Depende do provider

  // 3. Salva no banco
  await supabase.from('messages').insert({
    consultant_id: consultantId,
    lead_phone: message.from,
    content: message.text,
    direction: 'inbound',
  })

  // 4. Processa com IA (motor compartilhado)
  const aiResponse = await generateAIResponse({
    consultantId,
    leadMessage: message.text,
    conversationHistory: await getHistory(consultantId, message.from)
  })

  // 5. Envia resposta usando credenciais DO CONSULTOR
  const whatsappClient = await getConsultantWhatsAppClient(consultantId)
  await whatsappClient.sendMessage(message.from, aiResponse)

  return Response.json({ success: true })
}
```

## 📊 Isolamento de Dados (Multi-Tenancy)

### Consultas sempre filtradas por tenant

```typescript
// ❌ ERRADO - Retorna dados de todos os consultores
const leads = await supabase.from('leads').select('*')

// ✅ CORRETO - Retorna apenas do consultor logado
const { data: consultant } = await supabase.auth.getUser()
const leads = await supabase
  .from('leads')
  .select('*')
  .eq('consultant_id', consultant.id)
```

### Row Level Security (RLS) automático

```sql
-- Todas as tabelas têm RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Política padrão: só acessa seus dados
CREATE POLICY tenant_isolation ON leads
  FOR ALL
  USING (consultant_id = auth.uid());

CREATE POLICY tenant_isolation ON messages
  FOR ALL
  USING (
    consultant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = messages.lead_id
      AND leads.consultant_id = auth.uid()
    )
  );
```

## 💰 Modelo de Cobrança

### Por consultor, não por uso da plataforma

```typescript
// Cada consultor paga PARA VOCÊ
// Você NÃO paga pela conta WhatsApp dele
const pricingTiers = {
  freemium: {
    price: 0,
    limits: {
      maxLeads: 20,
      features: ['basic_flow', 'text_only']
    }
  },
  pro: {
    price: 47,  // R$/mês - VOCÊ recebe
    limits: {
      maxLeads: 200,
      features: ['custom_flows', 'images', 'analytics']
    }
  },
  agency: {
    price: 147,  // R$/mês - VOCÊ recebe
    limits: {
      maxLeads: 1000,
      features: ['all']
    }
  }
}

// Custos DO CONSULTOR (ele paga direto para Weni/360dialog):
// - Weni: ~R$200-500/mês (depende do volume)
// - 360dialog: Similar
// - Você NÃO paga isso
```

## 🔧 Configuração da Plataforma (.env)

### O que VOCÊ configura (plataforma)

```bash
# .env.production (PLATAFORMA)

# IA (compartilhada por todos os consultores)
GOOGLE_AI_API_KEY=sua-chave-google-ai  # VOCÊ paga isso

# Banco de dados (multi-tenant)
DATABASE_URL=sua-conexao-supabase  # VOCÊ paga isso

# Criptografia de credenciais
ENCRYPTION_KEY=chave-de-32-bytes  # Para criptografar API keys dos consultores

# Billing (Stripe)
STRIPE_SECRET_KEY=sua-chave-stripe  # Para cobrar dos consultores

# Email (notificações)
SMTP_HOST=smtp.sendgrid.net  # VOCÊ paga isso

# NÃO TEM:
# ❌ WHATSAPP_API_KEY  (cada consultor tem a sua)
# ❌ WHATSAPP_PHONE_NUMBER  (cada consultor tem o seu)
```

### O que CADA CONSULTOR configura (no dashboard)

```typescript
// Interface de configuração no dashboard
interface ConsultantWhatsAppSetup {
  provider: 'weni' | '360dialog' | 'twilio'
  apiKey: string  // Fornecido pelo consultor
  phoneNumber: string  // Número do consultor
}

// Consultor preenche no dashboard:
// 1. Seleciona provedor (Weni, 360dialog, etc)
// 2. Cola API Key da conta dele
// 3. Informa número de telefone
// 4. Plataforma retorna webhook URL para ele configurar
```

## 🚀 Fluxo de Onboarding

### 1. Consultor cria conta

```
https://consultor.ai/signup
  ↓
[Consultor preenche]
- Nome: João Silva
- Email: joao@example.com
- Senha: ********
  ↓
[Conta criada - Freemium]
```

### 2. Consultor conecta WhatsApp

```
Dashboard → Configurações → Conectar WhatsApp
  ↓
[Escolhe provedor]
● Weni Cloud (recomendado)
○ 360dialog
○ Twilio
  ↓
[Instruções exibidas]
1. Crie conta em weni.ai
2. Configure WhatsApp Business
3. Copie API Key
4. Cole aqui: [_____________]
5. Informe telefone: [+5561982809595]
  ↓
[Plataforma valida e salva]
  ↓
[Retorna webhook URL]
"Configure este webhook na Weni:
https://consultor.ai/api/webhook/whatsapp/uuid-do-joao

Webhook Secret: abc123def456"
```

### 3. Consultor configura webhook na Weni

```
[Consultor vai em weni.ai]
  ↓
Settings → Webhooks
  ↓
URL: https://consultor.ai/api/webhook/whatsapp/uuid-do-joao
Secret: abc123def456
  ↓
[Salva]
  ↓
[Testa enviando mensagem teste]
  ↓
✅ Conexão estabelecida
```

## 📈 Escalabilidade

### Plataforma suporta N consultores

```
1 consultor = 1 webhook único
100 consultores = 100 webhooks únicos
10.000 consultores = 10.000 webhooks únicos

Cada webhook:
- Identifica consultor por URL path
- Busca credenciais do consultor
- Usa API do consultor para responder
```

### Você SÓ paga:
- ✅ Hosting (Vercel/Railway)
- ✅ Banco de dados (Supabase)
- ✅ IA (Google AI/Groq)
- ✅ Email (SendGrid)

### Você NÃO paga:
- ❌ WhatsApp API (cada consultor paga a sua)
- ❌ Número de telefone (cada consultor usa o seu)

## 📚 Resumo

| Aspecto | Arquitetura Antiga (❌) | Arquitetura Correta (✅) |
|---------|-------------------------|--------------------------|
| **WhatsApp Account** | 1 conta para todos | 1 conta por consultor |
| **API Keys** | 1 key no .env | N keys no banco (encrypted) |
| **Leads** | Todos no mesmo número | Cada consultor recebe os seus |
| **Custos WhatsApp** | Você paga tudo | Cada consultor paga o seu |
| **Escalabilidade** | Não escala | Escala infinitamente |
| **Isolamento** | Sem isolamento | Isolamento total |

---

**Próximo passo**: Atualizar schema do banco de dados e implementar fluxo de onboarding.
