# Guia de Configuração: Meta WhatsApp Business API

> **Guia Completo para Integração do WhatsApp Business com Consultor.AI**

Este guia fornece instruções passo a passo para configurar a integração oficial do WhatsApp Business usando a Meta Cloud API.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo 1: Criar Conta Meta Business](#passo-1-criar-conta-meta-business)
4. [Passo 2: Criar Aplicativo Meta](#passo-2-criar-aplicativo-meta)
5. [Passo 3: Adicionar Produto WhatsApp](#passo-3-adicionar-produto-whatsapp)
6. [Passo 4: Configurar Webhook](#passo-4-configurar-webhook)
7. [Passo 5: Obter Credenciais](#passo-5-obter-credenciais)
8. [Passo 6: Conectar no Consultor.AI](#passo-6-conectar-no-consultarai)
9. [Passo 7: Testar Integração](#passo-7-testar-integração)
10. [Solução de Problemas](#solução-de-problemas)
11. [Segurança e Boas Práticas](#segurança-e-boas-práticas)
12. [Perguntas Frequentes](#perguntas-frequentes)

---

## Visão Geral

### O que você vai configurar

A integração com a Meta WhatsApp Business API permite que o Consultor.AI:

- ✅ **Receba mensagens** de clientes via WhatsApp
- ✅ **Envie respostas automatizadas** com IA
- ✅ **Use mensagens interativas** (botões e listas)
- ✅ **Rastreie status** de entrega e leitura
- ✅ **Crie leads automaticamente** a partir de conversas

### Arquitetura da Integração

```
WhatsApp (Cliente)
    ↓
Meta Cloud API
    ↓
Webhook (Consultor.AI)
    ↓
Flow Engine + IA
    ↓
Resposta via Meta API
    ↓
WhatsApp (Cliente)
```

### Tempo Estimado

⏱️ **30-45 minutos** (primeira vez)

---

## Pré-requisitos

### Contas Necessárias

- [ ] **Conta Facebook** (pessoal ou business)
- [ ] **Número de telefone** dedicado para WhatsApp Business
  - ⚠️ Não pode estar vinculado a outro WhatsApp
  - ⚠️ Deve ser capaz de receber SMS/chamadas para verificação
  - ✅ Recomendado: número corporativo exclusivo

### Acesso ao Sistema

- [ ] **Consultor.AI** rodando localmente ou em produção
- [ ] **HTTPS habilitado** (obrigatório para webhooks)
  - Desenvolvimento: use [ngrok](https://ngrok.com/) ou [localhost.run](https://localhost.run/)
  - Produção: use Vercel, AWS, ou servidor com SSL

### Informações que Você Vai Precisar

Tenha em mãos:

1. **URL do Webhook**: `https://seu-dominio.com/api/webhook/meta/[consultantId]`
2. **Verify Token**: Uma string secreta qualquer (você define)
3. **App Secret**: Será gerado pela Meta
4. **Encryption Key**: 32 caracteres para criptografia de tokens

---

## Passo 1: Criar Conta Meta Business

### 1.1 Acessar Meta Business Suite

1. Acesse: [https://business.facebook.com/](https://business.facebook.com/)
2. Faça login com sua conta Facebook
3. Clique em **"Criar Conta"** (se ainda não tiver)

### 1.2 Preencher Informações da Empresa

- **Nome da Empresa**: Nome do seu negócio (ex: "Minha Consultoria")
- **Seu Nome**: Seu nome completo
- **E-mail Corporativo**: E-mail profissional

### 1.3 Verificar Identidade

A Meta pode solicitar:
- Documento de identificação (RG/CNH)
- Comprovante de endereço comercial
- Documento da empresa (CNPJ, contrato social)

**⏱️ Tempo de aprovação**: 1-3 dias úteis (em média)

---

## Passo 2: Criar Aplicativo Meta

### 2.1 Acessar Facebook Developers

1. Acesse: [https://developers.facebook.com/](https://developers.facebook.com/)
2. Faça login com a mesma conta Facebook
3. Clique em **"Meus Aplicativos"** (canto superior direito)
4. Clique em **"Criar Aplicativo"**

### 2.2 Escolher Tipo de Aplicativo

- Selecione: **"Business"** (não "Consumer" ou "Gaming")
- Clique em **"Próximo"**

### 2.3 Preencher Detalhes do App

| Campo | Valor |
|-------|-------|
| **Nome de Exibição do Aplicativo** | "Consultor.AI WhatsApp Bot" (ou outro nome) |
| **E-mail de Contato do Aplicativo** | Seu e-mail profissional |
| **Conta Comercial do Aplicativo** | Selecione a conta criada no Passo 1 |

**Captcha**: Complete a verificação
**Criar**: Clique em **"Criar Aplicativo"**

### 2.4 Anotar App ID e App Secret

Após criar:
1. Vá em **"Configurações" → "Básico"** (menu lateral)
2. Anote:
   - **ID do Aplicativo** (App ID)
   - **Chave Secreta do Aplicativo** (App Secret) - clique em "Mostrar"

```env
# Adicione ao seu .env.local
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456...
```

---

## Passo 3: Adicionar Produto WhatsApp

### 3.1 Adicionar Produto

1. No painel do aplicativo, clique em **"Adicionar Produto"**
2. Procure por **"WhatsApp"**
3. Clique em **"Configurar"**

### 3.2 Configuração Inicial do WhatsApp

A Meta vai:
- Criar uma conta WhatsApp Business automaticamente
- Fornecer um número de teste temporário
- Permitir enviar mensagens para até 5 números

### 3.3 Adicionar Número de Telefone (Produção)

⚠️ **Atenção**: Só faça isso quando estiver pronto para produção.

1. Vá em **"WhatsApp" → "Introdução"**
2. Clique em **"Adicionar Número de Telefone"**
3. Selecione:
   - **Novo número** (se não tiver conta WhatsApp Business)
   - **Número existente** (migrar conta existente)
4. Siga o processo de verificação:
   - Insira o número no formato internacional (+5511999999999)
   - Receba código via SMS ou chamada
   - Insira o código de verificação
   - Aguarde aprovação (1-2 horas)

### 3.4 Configurar Perfil do WhatsApp Business

1. Vá em **"WhatsApp" → "Configurações" → "Perfil"**
2. Preencha:
   - **Nome da empresa**
   - **Descrição** (até 256 caracteres)
   - **Categoria** (ex: "Serviços Financeiros", "Seguros")
   - **Endereço**
   - **Website**
   - **E-mail**
3. Salve as alterações

---

## Passo 4: Configurar Webhook

### 4.1 Preparar URL do Webhook

#### Desenvolvimento Local (ngrok)

```bash
# Instale ngrok
npm install -g ngrok

# Inicie o Consultor.AI
npm run dev

# Em outro terminal, crie túnel HTTPS
ngrok http 3000

# Anote a URL gerada
# Exemplo: https://abc123.ngrok.io
```

**URL do Webhook**:
```
https://abc123.ngrok.io/api/webhook/meta/[consultantId]
```

⚠️ **Substitua `[consultantId]` pelo ID real do consultor no banco**

#### Produção (Vercel)

```
https://seu-app.vercel.app/api/webhook/meta/[consultantId]
```

### 4.2 Definir Verify Token

Escolha uma string secreta aleatória (32+ caracteres):

```bash
# Gere um token seguro
openssl rand -base64 32
# Exemplo: Kj8fH3kLm9Pq2Rs5Vw8Xz1Bc4De7Gh0J
```

Adicione ao `.env.local`:

```env
META_WEBHOOK_VERIFY_TOKEN=Kj8fH3kLm9Pq2Rs5Vw8Xz1Bc4De7Gh0J
```

### 4.3 Configurar Webhook na Meta

1. No painel Meta Developers, vá em **"WhatsApp" → "Configuração"**
2. Na seção **"Webhook"**, clique em **"Configurar"** ou **"Editar"**
3. Preencha:

| Campo | Valor |
|-------|-------|
| **URL de Retorno de Chamada** | `https://seu-dominio.com/api/webhook/meta/[consultantId]` |
| **Token de Verificação** | O token que você definiu no passo 4.2 |

4. Clique em **"Verificar e Salvar"**

**✅ Sucesso**: Você verá uma mensagem verde "Webhook verificado"
**❌ Erro**: Veja [Solução de Problemas](#webhook-verification-failed)

### 4.4 Assinar Eventos do Webhook

Na mesma página, role até **"Campos do Webhook"**:

Marque as caixas:
- ✅ **messages** (mensagens recebidas)
- ✅ **message_status** (status de entrega/leitura)

Clique em **"Salvar"**

---

## Passo 5: Obter Credenciais

### 5.1 Obter Phone Number ID

1. Vá em **"WhatsApp" → "Introdução"**
2. Na seção **"Enviar e receber mensagens"**, você verá:
   - **Número de telefone**: +1 555 0100 (exemplo de teste)
   - **ID do número de telefone**: 123456789012345

3. Copie o **ID do número de telefone** (não o número em si)

```env
# Adicione ao .env.local
META_PHONE_NUMBER_ID=123456789012345
```

### 5.2 Obter Access Token Temporário

1. Na mesma página **"WhatsApp" → "Introdução"**
2. Role até **"Token de Acesso Temporário"**
3. Clique em **"Copiar"**

⚠️ **Importante**: Este token expira em 24 horas. Use-o apenas para testes.

```env
# APENAS PARA TESTES
META_ACCESS_TOKEN=EAAxxxxxxxxxxxx...
```

### 5.3 Gerar Access Token Permanente

Para produção, você precisa de um token permanente:

#### Opção A: Usar Token do Sistema (Recomendado)

1. Vá em **"WhatsApp" → "Introdução"**
2. Role até **"Tokens de Acesso"**
3. Clique em **"Criar Token do Sistema"**
4. Selecione:
   - **Aplicativo**: Seu app criado
   - **Token de Acesso**: Gerar novo
   - **Permissões**: `whatsapp_business_management`, `whatsapp_business_messaging`
5. Copie e salve o token (só aparece uma vez!)

#### Opção B: Usar OAuth Flow

Implemente o fluxo OAuth no seu app (já configurado em `/api/consultants/meta-callback`):

1. Redirecione usuário para:
```
https://www.facebook.com/v18.0/dialog/oauth?
  client_id={META_APP_ID}&
  redirect_uri={YOUR_REDIRECT_URI}&
  state={RANDOM_STATE}&
  scope=whatsapp_business_management,whatsapp_business_messaging
```

2. Receba o código de autorização no callback
3. Troque por token permanente (válido por 60 dias)
4. Implemente refresh automático

**Armazenamento**:

```typescript
// O sistema já criptografa automaticamente
// Tabela: consultants.meta_access_token (encrypted)
```

---

## Passo 6: Conectar no Consultor.AI

### 6.1 Configurar Variáveis de Ambiente

Edite `.env.local`:

```env
# Meta WhatsApp Business API
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456ghi789jkl012mno345pq
META_WEBHOOK_VERIFY_TOKEN=Kj8fH3kLm9Pq2Rs5Vw8Xz1Bc4De7Gh0J

# Encryption (32 caracteres exatos)
ENCRYPTION_KEY=01234567890123456789012345678901
```

**Gerar Encryption Key**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').slice(0, 32))"
```

### 6.2 Reiniciar Aplicação

```bash
# Pare o servidor (Ctrl+C)
npm run dev

# Ou com Docker
docker-compose restart
```

### 6.3 Acessar Dashboard

1. Acesse: `http://localhost:3000/dashboard/perfil/whatsapp`
2. Faça login (se necessário)

### 6.4 Conectar Conta WhatsApp

Na página de configuração:

1. **Phone Number ID**:
   - Cole o ID obtido no Passo 5.1
   - Formato: apenas números (sem espaços ou +)
   - Exemplo: `123456789012345`

2. **Access Token**:
   - Cole o token permanente do Passo 5.3
   - Formato: `EAAxxxxxxxxxx...` (longo)
   - ⚠️ Será criptografado e salvo no banco

3. Clique em **"Salvar e Testar Conexão"**

**✅ Sucesso**: Mensagem verde "Conectado com sucesso!"
**❌ Erro**: Veja [Solução de Problemas](#connection-failed)

---

## Passo 7: Testar Integração

### 7.1 Enviar Mensagem de Teste

#### Usando o Número de Teste da Meta

1. Vá em **Meta Developers → "WhatsApp" → "Introdução"**
2. Na seção **"Enviar e receber mensagens"**:
   - Adicione seu número pessoal em **"Para"**
   - Clique em **"Enviar mensagem"**
3. Você deve receber uma mensagem de boas-vindas

#### Usando Seu WhatsApp

1. No seu celular, abra o WhatsApp
2. Inicie conversa com o número configurado
3. Envie: **"Olá"**

### 7.2 Verificar Logs

#### No Terminal do Consultor.AI

```bash
# Você deve ver logs como:
[Webhook] Received message from +5511999999999
[Lead] Created new lead: João Silva (ID: uuid-123)
[Conversation] Started conversation (ID: uuid-456)
[Flow Engine] Current step: boas_vindas
[WhatsApp] Message sent (ID: wamid.xxx)
```

#### No Meta Developers

1. Vá em **"WhatsApp" → "Webhooks"**
2. Clique em **"Ver eventos de webhook"**
3. Você deve ver eventos:
   - `messages` (mensagem recebida)
   - `message_status` (status delivered/read)

### 7.3 Testar Fluxo Completo

Envie mensagens sequenciais no WhatsApp:

```
Você: Olá
Bot: Olá! 👋 Seja muito bem-vindo(a)! Eu sou o assistente virtual...

Bot: Primeiro, me conta: você está buscando um plano para:
1️⃣ Individual (só para mim)
2️⃣ Casal (eu + cônjuge)
3️⃣ Família (com dependentes)
4️⃣ Empresarial (MEI/Empresa)

Você: [Clica em "Individual"]

Bot: Perfeito! Agora me conta, você está em qual faixa etária?
...
```

### 7.4 Verificar no Dashboard

1. Acesse: `http://localhost:3000/dashboard/leads`
2. Você deve ver o lead criado automaticamente
3. Verifique:
   - ✅ Nome extraído do contato
   - ✅ WhatsApp number no formato +5511999999999
   - ✅ Status = "novo"
   - ✅ Score sendo atualizado

4. Acesse: `http://localhost:3000/dashboard/analytics`
5. Verifique:
   - ✅ Total de Leads: 1
   - ✅ Conversas Ativas: 1

---

## Solução de Problemas

### Webhook Verification Failed

**Erro**: "The callback URL or verify token couldn't be validated."

**Causas**:

1. **URL incorreta**
   - ✅ Deve ser HTTPS (não HTTP)
   - ✅ Deve ser acessível publicamente
   - ✅ `[consultantId]` deve ser um UUID válido no banco

2. **Verify Token incorreto**
   - ✅ Confira se `.env.local` tem `META_WEBHOOK_VERIFY_TOKEN`
   - ✅ Reinicie o servidor após alterar `.env`

3. **Servidor não responde**
   - ✅ Teste manualmente: `curl https://seu-dominio.com/api/webhook/meta/uuid-123?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=1234`
   - ✅ Deve retornar: `1234`

**Debug**:

```typescript
// Adicione logs em src/app/api/webhook/meta/[consultantId]/route.ts

export async function GET(req: NextRequest) {
  console.log('Webhook verification request:', {
    mode: searchParams.get('hub.mode'),
    token: searchParams.get('hub.verify_token'),
    challenge: searchParams.get('hub.challenge'),
    expectedToken: process.env.META_WEBHOOK_VERIFY_TOKEN,
  })
  // ...
}
```

### Connection Failed

**Erro**: "Não foi possível conectar à Meta API"

**Causas**:

1. **Access Token inválido**
   - ✅ Verifique se não expirou (tokens temporários duram 24h)
   - ✅ Gere um token permanente (Passo 5.3)
   - ✅ Confirme que tem as permissões corretas

2. **Phone Number ID incorreto**
   - ✅ Copie exatamente da Meta Developers
   - ✅ Deve ser apenas números (sem +, espaços, hífens)

3. **Firewall bloqueando**
   - ✅ Libere acesso a `graph.facebook.com`

**Teste manual**:

```bash
curl -X GET "https://graph.facebook.com/v18.0/ME?access_token=SEU_TOKEN"

# Deve retornar:
# {"id":"123456789012345","name":"Seu App Name"}
```

### Messages Not Arriving

**Problema**: Mensagens não chegam ao webhook

**Verificações**:

1. **Campos do webhook assinados**
   - ✅ `messages` marcado
   - ✅ `message_status` marcado

2. **HMAC validation falhando**
   ```typescript
   // Adicione logs temporários
   console.log('Signature received:', signature)
   console.log('Signature calculated:', calculatedSignature)
   ```

3. **Evento sendo enviado para URL errada**
   - ✅ Confira a URL configurada na Meta
   - ✅ Certifique-se que `[consultantId]` está correto

4. **24-hour window expirado**
   - ⚠️ Você só pode responder mensagens dentro de 24h
   - ⚠️ Após 24h, precisa usar message templates

### AI Not Responding

**Problema**: Fluxo funciona mas IA não gera respostas

**Verificações**:

1. **Google AI API Key**
   ```env
   GOOGLE_AI_API_KEY=AIza...
   ```
   - ✅ Obtenha em: https://makersuite.google.com/app/apikey

2. **Quota excedida**
   - ✅ Gemini 1.5 Flash tem 15 RPM free tier
   - ✅ Verifique logs: `[AI] Rate limit exceeded`

3. **Fallback sendo usado**
   - ✅ Confira logs: `[AI] Using fallback response`
   - ✅ Indica que a chamada à API falhou

**Teste manual**:

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=SUA_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Database Errors

**Erro**: "Lead not found" ou "Conversation not created"

**Verificações**:

1. **Migrações aplicadas**
   ```bash
   npm run db:reset
   ```

2. **RLS policies ativas**
   - ✅ Verifique no Supabase Dashboard → Authentication → Policies
   - ✅ Tabelas: `leads`, `conversations`, `messages`, `flows`

3. **Service Role Key**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```
   - ✅ Deve ser a **service_role** (não anon)
   - ✅ Bypass RLS policies para criação automática

**Debug SQL**:

```sql
-- No Supabase SQL Editor
SELECT * FROM leads WHERE whatsapp_number = '+5511999999999';
SELECT * FROM conversations WHERE lead_id = 'uuid-do-lead';
SELECT * FROM messages WHERE conversation_id = 'uuid-da-conversa';
```

---

## Segurança e Boas Práticas

### Protegendo Credenciais

**❌ NUNCA**:
- Commite `.env.local` no Git
- Exponha tokens em logs públicos
- Compartilhe App Secret em chats/emails
- Use tokens temporários em produção

**✅ SEMPRE**:
- Use variáveis de ambiente
- Rotacione tokens periodicamente (a cada 60 dias)
- Armazene tokens criptografados no banco
- Use HTTPS para todas as comunicações

### Validação de Webhooks

O sistema já implementa:

```typescript
// src/lib/whatsapp/webhook-validation.ts
export function validateMetaSignature(
  signature: string | null,
  payload: string,
  appSecret: string
): boolean {
  if (!signature || !signature.startsWith('sha256=')) {
    return false
  }

  const expectedHash = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex')

  const receivedHash = signature.slice(7) // Remove 'sha256='

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(receivedHash)
  )
}
```

**⚠️ Nunca desabilite esta validação em produção!**

### Rate Limiting

Meta WhatsApp Cloud API tem limites:

| Tier | Mensagens/dia | Custo |
|------|---------------|-------|
| **Teste** | 250 | Grátis |
| **Tier 1** | 1.000 | Grátis |
| **Tier 2** | 10.000 | Pago |
| **Tier 3** | 100.000 | Pago |

**Como aumentar tier**:
1. Verifique sua conta comercial (Business Verification)
2. Use o número em produção por 7+ dias
3. Mantenha baixa taxa de bloqueios (<2%)
4. Meta aumenta automaticamente conforme uso

### Compliance WhatsApp

**Regras obrigatórias**:

1. **Opt-in obrigatório**
   - ✅ Usuário deve iniciar a conversa
   - ✅ Ou fornecer opt-in explícito

2. **24-hour window**
   - ✅ Mensagens livres apenas dentro de 24h da última mensagem do usuário
   - ✅ Após 24h, use apenas templates aprovados

3. **Message templates**
   - ✅ Crie em Meta Business Suite → WhatsApp Manager → Message Templates
   - ✅ Aguarde aprovação (1-2 dias)
   - ✅ Use para follow-ups após 24h

4. **Proibições**:
   - ❌ Spam
   - ❌ Conteúdo sensível (sem opt-in)
   - ❌ Compartilhamento de dados com terceiros
   - ❌ Envio massivo não solicitado

**Monitoramento**:
- Quality rating: Mantenha acima de "Medium"
- Phone number status: "Connected" (não "Flagged" ou "Restricted")

---

## Perguntas Frequentes

### Posso usar meu WhatsApp pessoal?

❌ **Não recomendado**. Quando você conecta um número à Business API:
- Não pode mais usar WhatsApp App (móvel/web)
- Perde acesso a conversas anteriores
- Precisa comunicar via API apenas

✅ **Solução**: Use um número dedicado (chip novo).

### Qual o custo da Meta API?

**Mensagens gratuitas** (por mês):
- 1.000 conversas de service (atendimento)
- Ilimitadas conversas iniciadas por usuário (dentro de 24h)

**Mensagens pagas**:
- Após o limite gratuito
- Conversas iniciadas por negócio (templates)
- Varia por país: Brasil ~R$0,30 por conversa

**Consulte**: [Meta Pricing](https://developers.facebook.com/docs/whatsapp/pricing)

### Como funciona o número de teste?

Meta fornece um número temporário (+1 555 0100) que permite:
- ✅ Enviar mensagens para até 5 números verificados
- ✅ Testar todos os recursos (botões, listas, mídia)
- ✅ Desenvolvimento sem precisar de número real
- ❌ **Limitação**: Outros números não conseguem te enviar mensagem

**Adicionar número de teste**:
1. Meta Developers → WhatsApp → Introdução
2. Role até "Para"
3. Clique em "Gerenciar números de telefone"
4. Adicione até 5 números

### Posso usar várias contas de consultor?

✅ **Sim!** O sistema suporta multi-tenant:

- Cada consultor tem um `consultantId` único
- Webhook separado: `/api/webhook/meta/[consultantId]`
- Credenciais isoladas (criptografadas por consultor)
- Leads e conversas vinculados ao consultor

**Para adicionar novo consultor**:

```sql
-- Crie no Supabase SQL Editor
INSERT INTO consultants (email, name, vertical, slug)
VALUES (
  'consultor@example.com',
  'João Silva',
  'saude',
  'joao-silva'
);
```

Depois configure WhatsApp no dashboard em `/dashboard/perfil/whatsapp`.

### Como criar message templates?

Templates são necessários para mensagens após 24h.

**Criar template**:

1. Acesse [Meta Business Suite](https://business.facebook.com/)
2. Vá em **WhatsApp Manager** → **Message Templates**
3. Clique em **"Criar Template"**
4. Preencha:
   - **Nome**: `follow_up_saude` (snake_case)
   - **Categoria**: Utility (atendimento) ou Marketing
   - **Idioma**: Portuguese (BR)
   - **Corpo**:
   ```
   Olá {{1}}! 👋

   Vi que você estava interessado em planos de saúde. Posso te ajudar a encontrar a melhor opção?

   Responda SIM para conversar comigo.
   ```
5. Aguarde aprovação (1-2 dias)

**Usar no código**:

```typescript
// src/lib/whatsapp/meta-client.ts (adicione método)
async sendTemplate(
  to: string,
  templateName: string,
  parameters: string[]
): Promise<{ messageId: string }> {
  const message = {
    to: this.formatPhoneNumber(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: parameters.map((value) => ({ type: 'text', text: value })),
        },
      ],
    },
  }
  return this.sendMessage(message)
}

// Uso:
await whatsappClient.sendTemplate(
  '+5511999999999',
  'follow_up_saude',
  ['João'] // Substitui {{1}}
)
```

### Como migrar de outra solução (Twilio, 360dialog)?

**Exportar dados**:
1. Exporte leads da plataforma atual (CSV)
2. Importe no Consultor.AI via SQL:

```sql
COPY leads(consultant_id, whatsapp_number, name, status)
FROM '/path/to/leads.csv'
DELIMITER ','
CSV HEADER;
```

**Migrar número WhatsApp**:

⚠️ **Atenção**: Processo delicado!

1. **Backup**: Exporte conversas da plataforma atual
2. **Delete**: Remova número da plataforma anterior
3. **Aguarde**: 24-48h para liberação completa
4. **Configure**: Adicione na Meta API (Passo 3.3)

**Alternativa**: Use um número novo e redirecione aos poucos.

### Como testar localmente sem ngrok?

**Opção 1: localhost.run** (sem instalação)

```bash
ssh -R 80:localhost:3000 localhost.run

# Copie a URL gerada
# Exemplo: https://abc123.lhr.life
```

**Opção 2: Cloudflare Tunnel** (mais estável)

```bash
# Instale
npm install -g cloudflared

# Crie túnel
cloudflared tunnel --url http://localhost:3000

# URL gerada: https://xyz.trycloudflare.com
```

**Opção 3: Deploy temporário**

```bash
# Vercel (grátis)
vercel --prod

# URL: https://consultor-ai-xxx.vercel.app
```

---

## Próximos Passos

Após configurar a integração:

1. **Personalize o Fluxo**
   - Edite `supabase/seed/default-health-flow.json`
   - Valide: `npm run flow:validate`
   - Aplique: insira no banco via SQL

2. **Configure Templates de Follow-up**
   - Crie templates aprovados na Meta
   - Implemente envio automático após 24h

3. **Monitore Métricas**
   - Acesse `/dashboard/analytics`
   - Acompanhe taxa de conversão
   - Ajuste prompts da IA conforme feedback

4. **Expanda para Produção**
   - Adicione número real
   - Configure domínio próprio
   - Implemente backup de conversas

---

## Recursos Adicionais

### Documentação Oficial

- [Meta WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Getting Started Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Webhooks Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Message Types](https://developers.facebook.com/docs/whatsapp/cloud-api/messages)

### Ferramentas Úteis

- [WhatsApp Business Platform](https://business.whatsapp.com/)
- [Meta Business Suite](https://business.facebook.com/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Webhook Tester](https://webhook.site/)

### Comunidade

- [WhatsApp Business Developers](https://www.facebook.com/groups/whatsappbusiness)
- [Stack Overflow - WhatsApp API](https://stackoverflow.com/questions/tagged/whatsapp-business-api)

---

## Suporte

### Problemas com a Integração

- 📧 **E-mail**: suporte@consultor.ai
- 💬 **GitHub Issues**: [Abrir Issue](https://github.com/seu-repo/issues)

### Problemas com Meta/WhatsApp

- 🏢 **Meta Business Support**: [Help Center](https://www.facebook.com/business/help)
- 📱 **WhatsApp Business API Support**: [Contact Support](https://business.whatsapp.com/support)

---

**Última Atualização**: 2025-12-20
**Versão do Sistema**: 0.1.0
**Versão da Meta API**: v18.0

---

**✅ Configuração Completa!** Agora você tem o WhatsApp integrado ao Consultor.AI e pronto para automatizar suas conversas com IA.
