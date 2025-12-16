# Guia de Onboarding do Consultor

## 🎯 Objetivo

Permitir que consultores de planos de saúde **conectem sua própria conta WhatsApp** à plataforma Consultor.AI.

## 📊 Fluxo Visual Completo

```
┌─────────────────────────────────────────────────────────────┐
│ PASSO 1: Consultor cria conta na plataforma                │
└─────────────────────────────────────────────────────────────┘

Consultor acessa: https://consultor.ai/signup
                         ↓
              ┌──────────────────────┐
              │  Formulário Signup   │
              │                      │
              │  Nome: João Silva    │
              │  Email: joao@ex.com  │
              │  Senha: ********     │
              │  Plano: Freemium     │
              │                      │
              │  [Criar Conta]       │
              └──────────┬───────────┘
                         ↓
              ┌──────────────────────┐
              │ Conta criada! ✓      │
              │ Email verificado     │
              └──────────┬───────────┘
                         ↓
              ┌──────────────────────┐
              │  Dashboard vazio     │
              │                      │
              │  ⚠️  Conecte seu     │
              │  WhatsApp para       │
              │  começar             │
              │                      │
              │  [Conectar WhatsApp] │
              └──────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ PASSO 2: Consultor cria conta no provedor WhatsApp         │
└─────────────────────────────────────────────────────────────┘

Consultor acessa: https://weni.ai
                         ↓
              ┌──────────────────────┐
              │  Weni Cloud Signup   │
              │                      │
              │  - Cria conta        │
              │  - Verifica empresa  │
              │  - Conecta WhatsApp  │
              │    Business          │
              │  - Verifica número   │
              │                      │
              └──────────┬───────────┘
                         ↓
              ┌──────────────────────┐
              │ Número verificado ✓  │
              │ +5561982809595       │
              │                      │
              │ API Key gerada:      │
              │ weni_abc123def456    │
              └──────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ PASSO 3: Consultor conecta WhatsApp na plataforma          │
└─────────────────────────────────────────────────────────────┐

Volta para: https://consultor.ai/dashboard
                         ↓
              ┌──────────────────────┐
              │ Conectar WhatsApp    │
              │                      │
              │ Provedor:            │
              │ ○ Weni Cloud ✓       │
              │ ○ 360dialog          │
              │ ○ Twilio             │
              │                      │
              │ API Key:             │
              │ [weni_abc123def456]  │
              │                      │
              │ Telefone:            │
              │ [+5561982809595]     │
              │                      │
              │ [Conectar]           │
              └──────────┬───────────┘
                         ↓
              ┌──────────────────────────────────────┐
              │ ✓ Validado e salvo (encrypted)       │
              │                                      │
              │ Configure webhook na Weni:           │
              │                                      │
              │ URL:                                 │
              │ https://consultor.ai/api/webhook/    │
              │       whatsapp/uuid-joao             │
              │                                      │
              │ Secret:                              │
              │ whsec_abc123def456ghi789             │
              │                                      │
              │ [Copiar URL] [Copiar Secret]         │
              └──────────┬───────────────────────────┘
                         ↓
              ┌──────────────────────┐
              │ [Já configurei]      │
              └──────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ PASSO 4: Consultor configura webhook na Weni               │
└─────────────────────────────────────────────────────────────┘

Volta para: https://weni.ai/dashboard
                         ↓
              ┌──────────────────────────────────────┐
              │ Settings → Webhooks → Add Webhook   │
              │                                      │
              │ Webhook URL:                         │
              │ [https://consultor.ai/api/webhook/   │
              │  whatsapp/uuid-joao]                 │
              │                                      │
              │ Webhook Secret:                      │
              │ [whsec_abc123def456ghi789]           │
              │                                      │
              │ Events:                              │
              │ ☑ message.received                   │
              │ ☑ message.status                     │
              │                                      │
              │ [Save Webhook]                       │
              └──────────┬───────────────────────────┘
                         ↓
              ┌──────────────────────┐
              │ Webhook ativo ✓      │
              └──────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ PASSO 5: Teste de conexão                                  │
└─────────────────────────────────────────────────────────────┘

Volta para: https://consultor.ai/dashboard
                         ↓
              ┌──────────────────────┐
              │ [Enviar Teste]       │
              └──────────┬───────────┘
                         ↓
              ┌──────────────────────────────────────┐
              │ Plataforma envia mensagem teste      │
              │ usando API Key do consultor          │
              └──────────┬───────────────────────────┘
                         ↓
              ┌──────────────────────┐
              │ ✓ Teste enviado!     │
              │                      │
              │ Verifique seu        │
              │ WhatsApp             │
              └──────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│ RESULTADO: Sistema funcionando                             │
└─────────────────────────────────────────────────────────────┘

Lead envia mensagem → WhatsApp do consultor (+5561982...)
                         ↓
      WhatsApp API (Weni - conta do consultor)
                         ↓
      POST https://consultor.ai/api/webhook/whatsapp/uuid-joao
                         ↓
      ┌─────────────────────────────────────┐
      │ Plataforma Consultor.AI             │
      │                                     │
      │ 1. Identifica consultor (uuid-joao) │
      │ 2. Busca credenciais (decrypted)    │
      │ 3. Processa com IA (Gemini)         │
      │ 4. Gera resposta personalizada      │
      └────────────┬────────────────────────┘
                   ↓
      Envia resposta usando API do consultor
                   ↓
      WhatsApp do consultor responde ao lead
                   ↓
      Lead recebe resposta automática ✓
```

## 💾 O que fica salvo no banco

```sql
-- Tabela: consultants
id: uuid-joao
name: João Silva
email: joao@example.com
tier: freemium
created_at: 2025-12-15

-- Tabela: whatsapp_integrations
id: uuid-integration-123
consultant_id: uuid-joao
provider: weni
api_key: [ENCRYPTED] iv:tag:ciphertext
webhook_secret: [ENCRYPTED] iv:tag:ciphertext
phone_number: +5561982809595
status: active
verified_at: 2025-12-15
```

## 🔐 Segurança

### API Keys são criptografadas

```typescript
// Antes de salvar
const plainApiKey = "weni_abc123def456"
const encryptedApiKey = encrypt(plainApiKey)
// Resultado: "a1b2c3:d4e5f6:g7h8i9..."

// Salva no banco
await db.insert({ api_key: encryptedApiKey })

// Quando precisa usar
const { api_key } = await db.findOne(...)
const plainApiKey = decrypt(api_key)
// Resultado: "weni_abc123def456"

// Usa para fazer chamada
await weniClient.sendMessage(plainApiKey, ...)
```

### Webhook validation

```typescript
// Cada requisição é validada
const signature = req.headers['x-webhook-signature']
const expectedSignature = hmac(webhookSecret, body)

if (signature !== expectedSignature) {
  throw new Error('Invalid webhook signature')
}
```

## 🎨 UI/UX do Dashboard

### Tela: Conectar WhatsApp

```
┌────────────────────────────────────────────────────────┐
│ Conectar WhatsApp Business                             │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Passo 1: Escolha seu provedor                         │
│                                                        │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│ │    Weni    │  │ 360dialog  │  │   Twilio   │       │
│ │   Cloud    │  │            │  │            │       │
│ │            │  │            │  │            │       │
│ │ Recomendado│  │   Popular  │  │  Avançado  │       │
│ │            │  │            │  │            │       │
│ │ [Selecionar│  │ [Selecionar│  │ [Selecionar│       │
│ └────────────┘  └────────────┘  └────────────┘       │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Passo 2: Configure sua conta Weni                     │
│                                                        │
│ Ainda não tem conta na Weni?                          │
│ [Criar conta grátis →]                                │
│                                                        │
│ Já tem conta? Siga os passos:                         │
│                                                        │
│ 1. Acesse weni.ai e faça login                        │
│ 2. Vá em Settings → API Keys                          │
│ 3. Clique em "Generate New Key"                       │
│ 4. Copie a API Key gerada                             │
│ 5. Cole abaixo                                         │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Passo 3: Cole suas credenciais                        │
│                                                        │
│ API Key *                                              │
│ ┌────────────────────────────────────────────────┐    │
│ │ weni_abc123def456ghi789jkl012                  │    │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│ Número de WhatsApp *                                   │
│ ┌────────────────────────────────────────────────┐    │
│ │ +55 61 98280-9595                              │    │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│ ☐ Li e aceito que minhas credenciais serão            │
│   armazenadas de forma criptografada                  │
│                                                        │
│              [Conectar WhatsApp]                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Tela: Configurar Webhook (após conectar)

```
┌────────────────────────────────────────────────────────┐
│ ✓ WhatsApp conectado com sucesso!                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Último passo: Configure o webhook na Weni             │
│                                                        │
│ 1. Acesse weni.ai/dashboard                           │
│ 2. Vá em Settings → Webhooks                          │
│ 3. Clique em "Add Webhook"                            │
│ 4. Cole as informações abaixo:                        │
│                                                        │
│ ┌────────────────────────────────────────────────┐    │
│ │ Webhook URL                                    │    │
│ │ https://consultor.ai/api/webhook/whatsapp/...  │    │
│ │                                      [Copiar]  │    │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│ ┌────────────────────────────────────────────────┐    │
│ │ Webhook Secret                                 │    │
│ │ whsec_abc123def456ghi789jkl012mno345pqr678     │    │
│ │                                      [Copiar]  │    │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│ 5. Marque os eventos:                                 │
│    ☑ message.received                                 │
│    ☑ message.status                                   │
│                                                        │
│ 6. Salve o webhook                                    │
│                                                        │
│ ┌────────────────────────────────────────────────┐    │
│ │ ⚠️  Importante: Não compartilhe estas          │    │
│ │    informações com terceiros                   │    │
│ └────────────────────────────────────────────────┘    │
│                                                        │
│         [Já configurei] [Preciso de ajuda]            │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Tela: Dashboard (após conectar)

```
┌────────────────────────────────────────────────────────┐
│ Dashboard - João Silva                    [Freemium]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ WhatsApp: ✓ Conectado                                 │
│ +55 61 98280-9595 (Weni Cloud)                        │
│ Status: Ativo | Última msg: há 2 minutos              │
│ [Testar] [Desconectar]                                │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Leads este mês: 8/20 (Freemium)                       │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ Maria Silva          +5561999887766  Há 5min     │  │
│ │ "Quero informações sobre plano de saúde"         │  │
│ │ → Bot respondeu automaticamente                  │  │
│ ├──────────────────────────────────────────────────┤  │
│ │ Pedro Santos         +5561988776655  Há 15min    │  │
│ │ "Qual o valor do plano?"                         │  │
│ │ → Bot respondeu automaticamente                  │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│              [Ver todos os leads]                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo Técnico (Backend)

### 1. Consultor conecta WhatsApp

```typescript
// POST /api/consultants/connect-whatsapp
{
  provider: "weni",
  apiKey: "weni_abc123def456",
  phoneNumber: "+5561982809595"
}

↓

// Backend processa
const consultantId = await getAuthUser()
const encryptedApiKey = encrypt(apiKey)
const webhookSecret = generateSecret()
const encryptedSecret = encrypt(webhookSecret)

await db.insert('whatsapp_integrations', {
  consultant_id: consultantId,
  provider: 'weni',
  api_key: encryptedApiKey,
  webhook_secret: encryptedSecret,
  phone_number: phoneNumber,
  status: 'active'
})

↓

// Retorna para frontend
{
  success: true,
  webhookUrl: `https://consultor.ai/api/webhook/whatsapp/${consultantId}`,
  webhookSecret: webhookSecret  // Sem criptografar (para configurar na Weni)
}
```

### 2. Lead envia mensagem

```typescript
// POST /api/webhook/whatsapp/[consultantId]
// Headers: { x-webhook-signature: "..." }
// Body: { from: "+5561999887766", text: "Olá" }

↓

// Backend processa
const consultantId = params.consultantId

// 1. Valida signature
const integration = await db.findOne('whatsapp_integrations', { consultant_id })
const decryptedSecret = decrypt(integration.webhook_secret)
const isValid = validateSignature(body, signature, decryptedSecret)

// 2. Salva mensagem
await db.insert('messages', {
  consultant_id: consultantId,
  lead_phone: body.from,
  content: body.text,
  direction: 'inbound'
})

// 3. Gera resposta com IA
const response = await generateAIResponse({
  consultantId,
  message: body.text
})

// 4. Envia usando API do consultor
const decryptedApiKey = decrypt(integration.api_key)
const weniClient = new WeniClient(decryptedApiKey)
await weniClient.sendMessage(body.from, response)

// 5. Salva resposta
await db.insert('messages', {
  consultant_id: consultantId,
  lead_phone: body.from,
  content: response,
  direction: 'outbound'
})

return { success: true }
```

## 📚 Documentos Relacionados

- `docs/architecture/Multi-Tenant-Architecture.md` - Arquitetura completa
- `docs/architecture/Database-Design-Document.md` - Schema do banco
- `docs/api/API-Specification.md` - Endpoints da API

## ✅ Checklist de Implementação

- [ ] Criar tabela `whatsapp_integrations`
- [ ] Implementar funções de criptografia
- [ ] Criar endpoint POST `/api/consultants/connect-whatsapp`
- [ ] Criar endpoint POST `/api/webhook/whatsapp/[consultantId]`
- [ ] Criar UI de conexão WhatsApp
- [ ] Implementar validação de webhook
- [ ] Criar cliente Weni
- [ ] Criar cliente 360dialog
- [ ] Criar cliente Twilio
- [ ] Testes de integração
- [ ] Documentação para consultores
