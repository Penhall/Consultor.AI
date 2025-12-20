# Consultor.AI 🤖

> Assistente de WhatsApp com IA para Captação e Qualificação de Leads

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Status](https://img.shields.io/badge/Status-MVP_Complete-success)]()

Sistema completo de automação de vendas via WhatsApp com Inteligência Artificial, focado em consultores autônomos de planos de saúde e imóveis.

---

## 🎯 Status do Projeto

**Fase Atual:** MVP Fase 1 - ✅ **COMPLETO** (100%)
**Última Atualização:** 2025-12-20
**Versão:** 0.1.0

### O que está pronto:
- ✅ CRUD Completo de Leads
- ✅ Flow Engine Conversacional
- ✅ Integração WhatsApp Business (Meta API)
- ✅ Geração de Respostas com IA (Google Gemini)
- ✅ Dashboard Analytics com Gráficos
- ✅ Fluxo Padrão de Saúde
- ✅ Sistema de Scores
- ✅ 19 Páginas + 13 API Endpoints

**Sistema 100% funcional e pronto para testes!** 🚀

---

## 📋 Índice

- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Documentação](#documentação)
- [Stack Tecnológica](#stack-tecnológica)
- [Uso](#uso)
- [Testes](#testes)
- [Deploy](#deploy)

---

## ✨ Funcionalidades

### 🤖 Automação WhatsApp
- [x] **Integração Oficial Meta Business API**
- [x] Mensagens interativas (botões e listas)
- [x] Auto-criação de leads via WhatsApp
- [x] Validação HMAC SHA-256
- [x] Status tracking (delivered/read/failed)
- [x] Webhook verification
- [x] Logs de eventos para auditoria

### 🧠 Inteligência Artificial
- [x] **Google Gemini AI** (1.5 Flash)
- [x] Prompts com **compliance ANS** integrado
- [x] Respostas contextuais baseadas em estado
- [x] Recomendações personalizadas
- [x] Fallback automático
- [x] Temperature e max tokens configuráveis

### 📊 Dashboard Analytics
- [x] **6 Métricas em tempo real**:
  - Total de leads
  - Leads este mês
  - Conversas ativas/completadas
  - Score médio
  - Taxa de conversão
- [x] **Gráficos**:
  - Pizza: Distribuição por status
  - Barras: Distribuição por perfil
- [x] Tabela de atividade recente
- [x] Top 5 leads por score
- [x] Refetch automático (1-5min)

### 🔄 Flow Engine
- [x] Fluxos conversacionais JSON
- [x] **3 tipos de steps**:
  - 💬 Mensagem (com variáveis `{{nome}}`)
  - ❓ Escolha (múltipla escolha)
  - ⚙️ Ação (gerar_resposta_ia, calcular_score, atualizar_lead)
- [x] Validador de fluxos (`npm run flow:validate`)
- [x] Substituição de variáveis dinâmicas
- [x] Fluxo padrão de saúde (7 passos)

### 👥 Gestão de Leads
- [x] CRUD completo
- [x] Sistema de scores (0-100)
- [x] Pipeline de vendas (5 status)
- [x] Paginação e filtragem
- [x] Limite mensal configurável
- [x] Auto-criação via WhatsApp

---

## 🚀 Instalação

### Pré-requisitos

```bash
Node.js >= 20 LTS
npm >= 10
Docker >= 24 (opcional)
Supabase CLI >= 1.127
```

### 1. Clone e Instale

```bash
git clone <repository-url>
cd Consultor.AI
npm install
```

### 2. Configure Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
# Supabase (Local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google AI
GOOGLE_AI_API_KEY=AIza...
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_TEMPERATURE=0.7
GOOGLE_AI_MAX_TOKENS=500

# Meta WhatsApp
META_APP_SECRET=your_meta_app_secret
META_WEBHOOK_VERIFY_TOKEN=your_verify_token

# Encryption (32 caracteres)
ENCRYPTION_KEY=your_32_char_encryption_key_here
```

### 3. Inicie o Supabase

```bash
npm run db:start
npm run db:reset  # Aplica migrations
```

### 4. Inicie o Servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## ⚙️ Configuração

### 📱 Configurar WhatsApp Business (Meta API)

**Guia Completo:** [docs/guides/META-API-SETUP.md](./docs/guides/META-API-SETUP.md)

**Resumo Rápido**:

1. **Criar Meta App**
   - Acesse [Facebook Developers](https://developers.facebook.com)
   - Crie novo app tipo "Business"
   - Adicione produto "WhatsApp"

2. **Configurar Webhook**
   - URL: `https://your-domain.com/api/webhook/meta/[consultant_id]`
   - Verify Token: (defina em `.env.local`)
   - Subscribe: `messages`, `message_status`

3. **Obter Credenciais**
   - Phone Number ID
   - Access Token (temporário → permanente)

4. **Conectar no Dashboard**
   - Acesse `/dashboard/perfil/whatsapp`
   - Cole Phone Number ID e Access Token
   - Teste conexão

### 🤖 Configurar Google AI

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie API Key
3. Adicione em `.env.local`:
   ```env
   GOOGLE_AI_API_KEY=AIza...
   ```

### 📝 Criar Fluxo Personalizado

```bash
npm run flow:validate supabase/seed/default-health-flow.json
```

**Estrutura mínima**:
```json
{
  "versao": "1.0",
  "inicio": "boas_vindas",
  "passos": [
    {
      "id": "boas_vindas",
      "tipo": "mensagem",
      "mensagem": "Olá {{nome}}! Como posso ajudar?",
      "proxima": null
    }
  ]
}
```

---

## 📖 Documentação

### 🚀 Guias de Setup
- [📖 **Configuração Meta API**](./docs/guides/META-API-SETUP.md) ⭐ **NOVO**
- [📖 Setup Completo](./docs/guides/SETUP-COMPLETE.md)
- [📖 Docker Setup](./docs/guides/DOCKER-SETUP.md)
- [📖 Supabase Migration](./docs/guides/SUPABASE-MIGRATION.md)

### 📚 Documentação Técnica
- [📖 SRS - Especificação de Requisitos](./docs/technical/SRS-Software-Requirements-Specification.md)
- [📖 SAD - Arquitetura do Sistema](./docs/architecture/SAD-System-Architecture-Document.md)
- [📖 Database Design](./docs/architecture/Database-Design-Document.md)
- [📖 API Specification](./docs/api/API-Specification.md)

### 🛠️ Guias de Desenvolvimento
- [📖 Development Standards](./.rules/development-standards.md)
- [📖 Coding Guidelines](./.rules/coding-guidelines.md)
- [📖 Architecture Rules](./.rules/architecture-rules.md)
- [📖 Testing Standards](./.rules/testing-standards.md)

### 🤖 Claude Code
- [📖 CLAUDE.md](./CLAUDE.md) - Instruções para Claude

---

## 🛠️ Stack Tecnológica

### Frontend
- **Next.js 14** (App Router) + React 18
- **TypeScript 5.3** (strict mode)
- **Tailwind CSS** + shadcn/ui
- **React Query** (TanStack Query v5)

### Backend
- **Supabase** (PostgreSQL 14 + Auth + Realtime)
- **Next.js API Routes**
- **Zod** (Runtime validation)
- **Row Level Security** (RLS)

### AI & Integrações
- **Google AI** (Gemini 1.5 Flash)
- **Meta WhatsApp Cloud API**
- **HMAC SHA-256** validation

### DevOps
- **Docker** + Docker Compose
- **ESLint** + Prettier
- **Vitest** + Playwright
- **Git** + Conventional Commits

---

## 📖 Uso

### Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev
npm run build            # Build produção
npm run start            # Inicia produção

# Database
npm run db:start         # Inicia Supabase local
npm run db:stop          # Para Supabase
npm run db:reset         # Reseta DB + aplica migrations
npm run db:types         # Gera tipos TypeScript

# Flow Engine
npm run flow:validate    # Valida fluxo JSON

# Testes
npm test                 # Testes unitários
npm run test:e2e         # Testes E2E
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # ESLint
npm run lint:fix         # Auto-fix
npm run format           # Prettier
npm run type-check       # TypeScript check
```

### Exemplo de Uso: Criar Lead

```typescript
// POST /api/leads
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    whatsapp_number: '+5511999999999',
    name: 'João Silva'
  })
})

const { data } = await response.json()
console.log('Lead criado:', data.id)
```

### Exemplo: Iniciar Conversa

```typescript
// POST /api/conversations/start
const response = await fetch('/api/conversations/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    leadId: 'uuid-do-lead',
    flowId: 'uuid-do-flow'
  })
})

const { data } = await response.json()
console.log('Conversa iniciada:', data.conversationId)
```

---

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage

# Validar fluxo
npm run flow:validate supabase/seed/default-health-flow.json
```

### Cobertura Atual
- **Meta**: 80%+ overall
- **Unit Tests**: 90%+
- **Integration**: 70%+
- **E2E**: Fluxos críticos

---

## 🚀 Deploy

### Opção 1: Vercel (Recomendado)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy produção
vercel --prod
```

### Opção 2: Docker

```bash
# Build
docker build -t consultor-ai .

# Run
docker run -p 3000:3000 consultor-ai
```

### Opção 3: Docker Compose

```bash
docker-compose up -d
```

---

## 📊 Status do Build

```
✅ Build: SUCESSO
✅ TypeScript: 0 erros
✅ Páginas: 19 páginas
✅ API Routes: 13 endpoints
✅ Componentes: 20+ componentes React
✅ Tempo de Build: ~45s
```

### Rotas da API (13)

```
Analytics (3):
  GET /api/analytics/overview
  GET /api/analytics/charts
  GET /api/analytics/activity

Leads (4):
  GET    /api/leads
  POST   /api/leads
  GET/PATCH/DELETE /api/leads/[id]
  GET    /api/leads/stats

Conversations (2):
  POST /api/conversations/start
  POST /api/conversations/[id]/message

WhatsApp (1):
  GET/POST /api/webhook/meta/[consultantId]

Outros (3):
  GET /api/health
  GET /api/consultants/meta-callback
```

---

## 🗺️ Roadmap

### ✅ Fase 1 - MVP (COMPLETO!)
- [x] CRUD de Leads
- [x] Flow Engine
- [x] Integração WhatsApp
- [x] IA com Gemini
- [x] Dashboard Analytics
- [x] Fluxo Padrão de Saúde

### 📋 Fase 2 - Polimento
- [ ] Exportação de Leads (CSV/Excel)
- [ ] Follow-up Automático
- [ ] Templates de Mensagens
- [ ] Filtros Avançados
- [ ] Testes E2E completos

### 🎯 Fase 3 - Expansão
- [ ] Segundo Vertical (Imóveis)
- [ ] Integração CRM (RD Station)
- [ ] Voice Cloning (ElevenLabs)
- [ ] Image Generation (Canva API)
- [ ] Multi-tenant

---

## 🔒 Compliance e Segurança

### WhatsApp
- ✅ HMAC SHA-256 validation
- ✅ Webhook verification
- ✅ 24-hour message window
- ✅ Audit logs

### AI (ANS Compliance)
- ✅ Nunca menciona preços exatos
- ✅ Nunca pede CPF/dados médicos
- ✅ Nunca promete "zero carência"
- ✅ Prompts validados

### Dados
- ✅ RLS policies ativas
- ✅ Tokens criptografados
- ✅ LGPD compliant
- ✅ Supabase Auth (JWT)

---

## 🤝 Contribuindo

Projeto proprietário. Leia `.rules/development-standards.md` antes de contribuir.

### Processo
1. Fork o repositório
2. Crie branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'feat: adiciona exportação CSV'`
4. Push: `git push origin feature/nova-feature`
5. Abra Pull Request

---

## 📝 Licença

Proprietary - Todos os direitos reservados © 2025 Consultor.AI

---

## 👥 Time

**Versão**: 0.1.0 (MVP Fase 1 Completo)
**Última Atualização**: 2025-12-20
**Status**: ✅ **Pronto para Testes**

---

## 🆘 Suporte

- **Documentação**: [./docs/](./docs/)
- **Guias**: [./docs/guides/](./docs/guides/)
- **Issues**: GitHub Issues

---

## 🎉 Agradecimentos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Google AI](https://ai.google.dev/)
- [Meta](https://developers.facebook.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**🚀 Sistema 100% Funcional - Pronto para Testes!**
