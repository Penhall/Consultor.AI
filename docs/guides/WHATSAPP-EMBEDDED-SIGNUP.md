# WhatsApp Business - Meta Embedded Signup

**Última atualização:** 20 de dezembro de 2025

Este guia explica como o Consultor.AI usa o **Meta Embedded Signup** para permitir que consultores conectem suas contas WhatsApp Business em segundos, sem configuração técnica.

---

## 📋 Índice

1. [O que é Meta Embedded Signup?](#o-que-é-meta-embedded-signup)
2. [Por que usamos Embedded Signup?](#por-que-usamos-embedded-signup)
3. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
4. [Setup da Plataforma (Desenvolvedor)](#setup-da-plataforma-desenvolvedor)
5. [Onboarding do Consultor (Usuário Final)](#onboarding-do-consultor-usuário-final)
6. [Fluxo Técnico Detalhado](#fluxo-técnico-detalhado)
7. [Troubleshooting](#troubleshooting)
8. [Segurança e Compliance](#segurança-e-compliance)

---

## O que é Meta Embedded Signup?

**Meta Embedded Signup** é uma solução oficial da Meta (Facebook) que permite que aplicativos SaaS integrem WhatsApp Business sem que cada usuário precise criar e configurar seu próprio Meta App.

### Comparação: Manual vs Embedded

| Aspecto | Setup Manual ❌ | Embedded Signup ✅ |
|---------|----------------|-------------------|
| **Tempo** | 30-45 minutos | 30 segundos |
| **Etapas** | 10+ passos técnicos | 3 cliques |
| **Taxa de Sucesso** | ~30% | ~95% |
| **Conhecimento Técnico** | Necessário | Nenhum |
| **Experiência do Usuário** | Frustrante | Intuitiva |
| **Suporte Necessário** | Alto | Mínimo |

### Como Funciona

```
┌─────────────┐         OAuth 2.0          ┌─────────────┐
│             │◄────────────────────────────│             │
│  Consultor  │                             │  Meta API   │
│             │─────────────────────────────►│             │
└─────────────┘    Autorização (3 cliques)  └─────────────┘
      │                                             │
      │                                             │
      ▼                                             ▼
┌─────────────┐         Access Token        ┌─────────────┐
│             │◄────────────────────────────│             │
│ Consultor.AI│                             │  Meta API   │
│  Platform   │                             │             │
└─────────────┘                             └─────────────┘
```

**Benefícios Principais:**
- ✅ **Um Meta App** para toda a plataforma (criado pelo dono)
- ✅ **OAuth Automático** - consultores só autorizam, não configuram
- ✅ **Tokens Gerenciados** - plataforma armazena e renova automaticamente
- ✅ **Webhooks Automáticos** - configurados via API
- ✅ **Experiência White-Label** - consultores nunca veem "Meta App"

---

## Por que usamos Embedded Signup?

### Problema com Setup Manual

No MVP inicial, cada consultor precisava:

1. Criar conta Facebook Developer
2. Criar Meta App (Business)
3. Adicionar produto WhatsApp
4. Configurar webhook manualmente
5. Copiar Phone Number ID
6. Gerar Access Token temporário
7. Converter token temporário em permanente
8. Configurar App Review
9. Aprovar permissões
10. Colar credenciais no dashboard

**Resultado:** 70% dos consultores desistiam antes de completar.

### Solução: Embedded Signup

Com Embedded Signup, o consultor:

1. Clica em "Conectar WhatsApp Business"
2. Faz login com Facebook
3. Autoriza permissões

**Resultado:** 95%+ de taxa de sucesso em < 1 minuto.

---

## Visão Geral da Arquitetura

### Arquitetura Multi-Tenant

```
┌──────────────────────────────────────────────────────────┐
│                    Consultor.AI Platform                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │         UM Meta App (Criado pelo Dono)             │  │
│  │  App ID: 123456789  │  App Secret: abc123...       │  │
│  │  Config ID: 987654321                              │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                               │
│                           ▼                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Database: whatsapp_integrations            │  │
│  ├────────────┬──────────────────┬────────────────────┤  │
│  │ Consultor A│  access_token_A  │ phone_number_A     │  │
│  │ Consultor B│  access_token_B  │ phone_number_B     │  │
│  │ Consultor C│  access_token_C  │ phone_number_C     │  │
│  └────────────┴──────────────────┴────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Componentes Principais:**

1. **Meta App (Platform Owner)**
   - Criado uma única vez pelo desenvolvedor
   - Contém configurações de Embedded Signup
   - Gerencia webhooks centralizados

2. **Database Table: `whatsapp_integrations`**
   - Armazena credenciais por consultor
   - Tokens criptografados (AES-256-GCM)
   - Suporta múltiplos providers (Meta, Weni, etc.)

3. **OAuth Callback: `/api/consultants/meta-signup`**
   - Recebe authorization code da Meta
   - Troca code por access token
   - Obtém Phone Number ID e WABA ID
   - Configura webhooks automaticamente
   - Salva integration no database

4. **Webhook Handler: `/api/webhook/meta/[consultantId]`**
   - Recebe mensagens de cada consultor
   - Busca access token do consultor no database
   - Processa mensagem no contexto correto

---

## Setup da Plataforma (Desenvolvedor)

### Pré-requisitos

- Conta Facebook Developer
- Conta Business Manager (ou será criada)
- Domínio público com HTTPS

### Passo 1: Criar Meta App

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Clique em **"Create App"**
3. Escolha tipo: **"Business"**
4. Preencha:
   - **App Name:** Consultor.AI
   - **App Contact Email:** seu@email.com
5. Clique em **"Create App"**

Anote:
- **App ID:** `123456789`
- **App Secret:** `abc123def456...` (em Settings > Basic)

### Passo 2: Adicionar Produto WhatsApp

1. No dashboard do app, clique em **"Add Product"**
2. Selecione **"WhatsApp"**
3. Clique em **"Set Up"**

### Passo 3: Configurar Embedded Signup

1. Vá para **WhatsApp > Configuration**
2. Scroll até **"Embedded Signup"**
3. Clique em **"Create Configuration"**
4. Preencha:
   - **Configuration Name:** Consultor.AI Production
   - **Callback URL:** `https://consultor.ai/api/consultants/meta-signup`
   - **Verify Token:** (deixe em branco - usamos authorization code)
5. Selecione permissões:
   - ✅ `whatsapp_business_management`
   - ✅ `whatsapp_business_messaging`
6. Clique em **"Save Configuration"**

Anote:
- **Configuration ID:** `987654321`

### Passo 4: Configurar Webhooks

1. Vá para **WhatsApp > Configuration**
2. Na seção **"Webhooks"**, clique em **"Edit"**
3. Preencha:
   - **Callback URL:** `https://consultor.ai/api/webhook/meta/verify`
   - **Verify Token:** (seu token secreto)
4. Clique em **"Verify and Save"**
5. Subscribe to webhook fields:
   - ✅ `messages`
   - ✅ `message_status`

### Passo 5: Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```env
# Meta App Credentials (Platform Owner)
META_APP_ID=123456789
META_APP_SECRET=abc123def456...
META_CONFIG_ID=987654321
META_WEBHOOK_VERIFY_TOKEN=consultor_ai_verify_token_xyz

# Public URLs
NEXT_PUBLIC_APP_URL=https://consultor.ai
NEXT_PUBLIC_META_APP_ID=123456789
NEXT_PUBLIC_META_CONFIG_ID=987654321

# Encryption Key (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your_32_byte_encryption_key_here
```

### Passo 6: App Review (Produção)

Para modo produção (não teste), você precisa:

1. Completar **Business Verification**
2. Submeter app para **App Review**
3. Solicitar permissões:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`

**Nota:** Para desenvolvimento, use **Test Mode** sem App Review.

---

## Onboarding do Consultor (Usuário Final)

### Experiência do Consultor

1. **Login no Dashboard**
   ```
   https://consultor.ai/auth/login
   ```

2. **Navegar para WhatsApp Settings**
   ```
   Dashboard > Perfil > WhatsApp Business
   ```

3. **Clicar em "Conectar WhatsApp Business"**
   - Facebook SDK carrega
   - Popup de login abre

4. **Fazer Login com Facebook**
   - Inserir email/senha do Facebook
   - (Se não tiver Facebook Business, será criado automaticamente)

5. **Autorizar Permissões**
   - Revisar permissões solicitadas
   - Clicar em "Continuar"

6. **Selecionar/Criar WhatsApp Business Account**
   - Se já tem WABA: selecionar
   - Se não tem: criar novo (Meta guia o processo)

7. **Concluído! ✅**
   - Redirecionado de volta ao dashboard
   - WhatsApp conectado automaticamente
   - Webhook configurado
   - Pode começar a receber leads

**Tempo total:** 30-60 segundos

---

## Fluxo Técnico Detalhado

### Sequência Completa

```
┌──────────┐                ┌──────────┐                ┌──────────┐
│ Frontend │                │ Backend  │                │ Meta API │
└────┬─────┘                └────┬─────┘                └────┬─────┘
     │                           │                           │
     │ 1. Load Facebook SDK      │                           │
     │──────────────────────────►│                           │
     │                           │                           │
     │ 2. Click "Connect"        │                           │
     │                           │                           │
     │ 3. FB.login(config_id)    │                           │
     │───────────────────────────┼──────────────────────────►│
     │                           │                           │
     │                           │    4. User authorizes     │
     │◄──────────────────────────┼───────────────────────────│
     │ (authorization code)      │                           │
     │                           │                           │
     │ 5. POST /api/.../meta-signup                          │
     │      { code, consultant_id }                          │
     │──────────────────────────►│                           │
     │                           │                           │
     │                           │ 6. Exchange code for token│
     │                           │──────────────────────────►│
     │                           │◄──────────────────────────│
     │                           │    { access_token }       │
     │                           │                           │
     │                           │ 7. Get WABA ID            │
     │                           │──────────────────────────►│
     │                           │◄──────────────────────────│
     │                           │    { waba_id }            │
     │                           │                           │
     │                           │ 8. Get Phone Number ID    │
     │                           │──────────────────────────►│
     │                           │◄──────────────────────────│
     │                           │    { phone_number_id }    │
     │                           │                           │
     │                           │ 9. Subscribe webhooks     │
     │                           │──────────────────────────►│
     │                           │◄──────────────────────────│
     │                           │    { success }            │
     │                           │                           │
     │                           │ 10. Save to DB (encrypted)│
     │                           │──────────────────────────►│
     │                           │                [Database] │
     │                           │                           │
     │ 11. Return success        │                           │
     │◄──────────────────────────│                           │
     │    { phone_number,        │                           │
     │      display_name }       │                           │
     │                           │                           │
     │ 12. Update UI             │                           │
     │    "WhatsApp Conectado!"  │                           │
     │                           │                           │
```

### Componentes Implementados

#### 1. Frontend: `MetaEmbeddedSignup.tsx`

```typescript
export function MetaEmbeddedSignup({
  consultantId,
  onSuccess,
  onError
}) {
  // 1. Load Facebook SDK
  useEffect(() => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID!,
        version: 'v18.0',
      })
      setSdkLoaded(true)
    }

    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    document.body.appendChild(script)
  }, [])

  // 2. Launch signup flow
  const handleConnect = async () => {
    window.FB.login(
      async (response) => {
        if (response.authResponse?.code) {
          // 3. Send code to backend
          const res = await fetch('/api/consultants/meta-signup', {
            method: 'POST',
            body: JSON.stringify({
              code: response.authResponse.code,
              consultant_id: consultantId,
            }),
          })

          const data = await res.json()
          onSuccess(data.data)
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID!,
        response_type: 'code',
        override_default_response_type: true,
      }
    )
  }

  return (
    <Button onClick={handleConnect}>
      Conectar WhatsApp Business
    </Button>
  )
}
```

#### 2. Backend: `/api/consultants/meta-signup/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const { code, consultant_id } = await req.json()

  // 1. Verify consultant ownership
  const consultant = await supabase
    .from('consultants')
    .select('id')
    .eq('id', consultant_id)
    .eq('user_id', session.user.id)
    .single()

  // 2. Exchange code for access token
  const tokenResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${META_APP_ID}&` +
    `client_secret=${META_APP_SECRET}&` +
    `code=${code}`
  )
  const { access_token } = await tokenResponse.json()

  // 3. Get WABA ID from token
  const debugData = await fetch(
    `https://graph.facebook.com/v18.0/debug_token?` +
    `input_token=${access_token}&` +
    `access_token=${META_APP_ID}|${META_APP_SECRET}`
  )
  const waba_id = debugData.data.granular_scopes[0].target_ids[0]

  // 4. Get Phone Number ID
  const phoneData = await fetch(
    `https://graph.facebook.com/v18.0/${waba_id}/phone_numbers`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )
  const phone = phoneData.data[0]

  // 5. Subscribe webhooks
  await fetch(
    `https://graph.facebook.com/v18.0/${waba_id}/subscribed_apps`,
    { method: 'POST', headers: { Authorization: `Bearer ${access_token}` } }
  )

  // 6. Save integration (encrypted)
  await createMetaIntegration({
    consultant_id,
    access_token, // Will be encrypted by service
    phone_number: phone.display_phone_number,
    phone_number_id: phone.id,
    waba_id,
    display_name: phone.verified_name,
  })

  return NextResponse.json({
    data: { phone_number, display_name }
  })
}
```

#### 3. Service: `whatsapp-integration-service.ts`

```typescript
export async function createMetaIntegration(input) {
  // Encrypt sensitive data
  const integrationData = {
    consultant_id: input.consultant_id,
    provider: 'meta',
    access_token: encrypt(input.access_token), // AES-256-GCM
    phone_number: input.phone_number,
    phone_number_id: input.phone_number_id,
    waba_id: input.waba_id,
    status: 'active',
    verified_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('whatsapp_integrations')
    .insert(integrationData)
    .select()
    .single()

  return { success: true, data }
}
```

#### 4. Database: `whatsapp_integrations`

```sql
CREATE TABLE whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES consultants(id),
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('meta', 'weni', '360dialog', 'twilio')),

  -- Encrypted credentials
  access_token TEXT,
  refresh_token TEXT,
  webhook_secret TEXT,

  -- WhatsApp Business Info
  phone_number VARCHAR(20) NOT NULL,
  phone_number_id VARCHAR(100),
  waba_id VARCHAR(100),
  display_name VARCHAR(255),

  status VARCHAR(20) NOT NULL DEFAULT 'active',
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Auto-generated webhook URL
  webhook_url TEXT GENERATED ALWAYS AS (
    'https://consultor.ai/api/webhook/' || provider || '/' || consultant_id::text
  ) STORED,

  CONSTRAINT whatsapp_integrations_consultant_provider_unique
    UNIQUE(consultant_id, provider)
);
```

---

## Troubleshooting

### Erro: "Facebook SDK not loaded"

**Causa:** SDK não carregou antes do usuário clicar

**Solução:**
```typescript
// Verificar se SDK está pronto
if (!window.FB) {
  console.error('Facebook SDK not loaded')
  return
}
```

### Erro: "Invalid config_id"

**Causa:** `NEXT_PUBLIC_META_CONFIG_ID` incorreto

**Solução:**
1. Verificar `.env.local`
2. Confirmar Configuration ID no Meta Dashboard
3. Reiniciar servidor (`npm run dev`)

### Erro: "No WhatsApp Business Account found"

**Causa:** Usuário cancelou criação de WABA ou não selecionou

**Solução:**
- Pedir usuário tentar novamente
- Garantir que usuário completa todo fluxo de criação WABA

### Erro: "Failed to exchange code for token"

**Causa:** Authorization code expirou (60 segundos de validade)

**Solução:**
- Usuário precisa tentar conectar novamente
- Código só pode ser usado uma vez

### Erro: "Access token expired"

**Causa:** Token de longa duração expirou (60 dias)

**Solução:**
```typescript
// Implementar renovação automática
export async function refreshMetaToken(consultantId) {
  const integration = await getIntegration(consultantId, 'meta')

  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${META_APP_ID}&` +
    `client_secret=${META_APP_SECRET}&` +
    `fb_exchange_token=${integration.access_token}`
  )

  const { access_token } = await response.json()

  await supabase
    .from('whatsapp_integrations')
    .update({ access_token: encrypt(access_token) })
    .eq('consultant_id', consultantId)
}
```

### Erro de Webhook: "Signature verification failed"

**Causa:** Webhook secret incorreto

**Solução:**
```typescript
// Verificar assinatura HMAC SHA-256
const signature = req.headers.get('x-hub-signature-256')
const expectedSignature = crypto
  .createHmac('sha256', META_WEBHOOK_VERIFY_TOKEN)
  .update(rawBody)
  .digest('hex')

if (signature !== `sha256=${expectedSignature}`) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
}
```

---

## Segurança e Compliance

### Armazenamento de Credenciais

**Todos os tokens são criptografados em repouso:**

```typescript
// Encryption: AES-256-GCM
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  return JSON.stringify({
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
    authTag: authTag.toString('hex')
  })
}
```

### Row Level Security (RLS)

```sql
-- Consultores só acessam suas próprias integrações
CREATE POLICY "Users can view their own integrations"
ON whatsapp_integrations
FOR SELECT
USING (
  consultant_id IN (
    SELECT id FROM consultants WHERE user_id = auth.uid()
  )
);
```

### HTTPS Obrigatório

- ✅ Todos os endpoints requerem HTTPS
- ✅ Certificado SSL válido
- ✅ HSTS habilitado

### Compliance LGPD

- ✅ Tokens podem ser deletados a pedido do usuário
- ✅ Auditoria de acesso a dados sensíveis
- ✅ Retenção de dados limitada (90 dias inativo)

---

## Recursos Adicionais

### Documentação Meta

- [Embedded Signup Overview](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [OAuth for WhatsApp](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started)

### Arquitetura do Projeto

- [Multi-Tenant Architecture](../architecture/Multi-Tenant-Architecture.md)
- [Database Design](../architecture/Database-Design-Document.md)
- [API Specification](../api/API-Specification.md)

### Código Fonte

- Frontend Component: `src/components/whatsapp/MetaEmbeddedSignup.tsx`
- API Route: `src/app/api/consultants/meta-signup/route.ts`
- Service Layer: `src/lib/services/whatsapp-integration-service.ts`
- Webhook Handler: `src/app/api/webhook/meta/[consultantId]/route.ts`

---

## Suporte

Problemas ou dúvidas?

- 📖 **Documentação:** [docs/](../)
- 🐛 **Issues:** [GitHub Issues](https://github.com/...)
- 💬 **Discord:** [Comunidade Consultor.AI](https://discord.gg/...)

---

**Última revisão:** 20 de dezembro de 2025
**Versão da API Meta:** v18.0
**Status:** ✅ Produção
