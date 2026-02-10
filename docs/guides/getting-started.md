# Getting Started - Consultor.AI

Este guia irá te ajudar a configurar o ambiente de desenvolvimento do Consultor.AI do zero.

**Ultima Atualizacao**: 2026-02-10
**Versao**: 0.4.0

---

## Pre-requisitos

Antes de comecar, certifique-se de ter instalado:

### Obrigatorios

- **Node.js 20 LTS ou superior**
  - Download: https://nodejs.org/
  - Verificar versao: `node --version`

- **npm 10 ou superior**
  - Geralmente instalado com Node.js
  - Verificar versao: `npm --version`

- **Docker Desktop**
  - Download: https://www.docker.com/products/docker-desktop/
  - Necessario para rodar Supabase localmente
  - Verificar: `docker --version`

- **Git**
  - Download: https://git-scm.com/
  - Verificar: `git --version`

### Opcionais (Recomendados)

- **VS Code** - Editor recomendado
  - Download: https://code.visualstudio.com/
  - Extensoes recomendadas: ESLint, Prettier, Tailwind CSS IntelliSense

---

## Passo 1: Clonar o Repositorio

```bash
git clone https://github.com/Penhall/Consultor.AI.git
cd Consultor.AI
```

---

## Passo 2: Instalar Dependencias

```bash
npm install
```

Isso ira instalar Next.js 14, React 18, TypeScript, Supabase clients, Tailwind CSS, shadcn/ui, Vitest, Playwright e todas as outras dependencias.

---

## Passo 3: Configurar Variaveis de Ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha as variaveis necessarias:

### Variaveis Essenciais

```env
# Supabase Local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sera gerado no passo 4>
SUPABASE_SERVICE_ROLE_KEY=<sera gerado no passo 4>

# Google AI (obtenha em https://makersuite.google.com/app/apikey)
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
GOOGLE_AI_MODEL=gemini-1.5-flash

# Criptografia (gere com: openssl rand -base64 32)
ENCRYPTION_KEY=chave-de-32-bytes-aqui

# Site URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Variaveis SaaS/Billing (Opcionais para dev)

```env
# Stripe (necessario para testar billing)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCIA_PRICE_ID=price_...
STRIPE_CREDITS50_PRICE_ID=price_...

# Email (fallback para console.log se nao configurado)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@consultor.ai

# Admin (emails que terao acesso ao painel admin)
ADMIN_EMAILS=admin@consultor.ai

# WhatsApp Meta (opcional para dev)
NEXT_PUBLIC_META_APP_ID=seu-app-id
META_APP_SECRET=seu-app-secret
META_WEBHOOK_VERIFY_TOKEN=token-aleatorio

# Redis
REDIS_URL=redis://:consultorai_password@localhost:6379
REDIS_PASSWORD=consultorai_password
```

### Como obter as API keys

**Google AI API:**

1. Acesse: https://makersuite.google.com/app/apikey
2. Faca login com sua conta Google
3. Clique em "Create API Key"
4. Copie e cole em `GOOGLE_AI_API_KEY`

**Stripe (para testar billing):**

1. Acesse: https://dashboard.stripe.com/test/apikeys
2. Copie a Secret key e Publishable key
3. Crie Products/Prices no Stripe Dashboard
4. Copie os Price IDs para as variaveis `STRIPE_*_PRICE_ID`

---

## Passo 4: Configurar Supabase Local

### 4.1 Instalar Supabase CLI

```bash
npm install -g supabase
supabase --version
```

### 4.2 Iniciar Supabase

```bash
supabase start
```

**Primeira vez:** Isso ira baixar as imagens Docker necessarias (~2GB). Pode demorar 5-10 minutos.

Quando terminar, voce vera as credenciais:

```
         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhb...
service_role key: eyJhb...
```

**IMPORTANTE:** Copie `anon key` e `service_role key` para o `.env.local`.

### 4.3 Rodar Migrations

```bash
supabase db reset
```

Isso ira criar todas as tabelas (consultants, leads, flows, billing, etc.), configurar RLS policies, e popular dados de exemplo.

### 4.4 Verificar o Banco

Abra o Supabase Studio em: http://localhost:54323

Voce deve ver as tabelas core (consultants, leads, flows, conversations, messages) e as tabelas de billing (daily_stats, contact_messages, etc.).

---

## Passo 5: Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra seu navegador em: **http://localhost:3000**

> **Dica:** Para desenvolvimento com Docker, veja [LOCAL-DOCKER-TESTING.md](./LOCAL-DOCKER-TESTING.md).

---

## Passo 6: Rodar os Testes

```bash
# Todos os testes
npm test

# Apenas testes unitarios
npm run test:unit

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch

# Testes E2E (requer app rodando)
npx playwright install  # apenas primeira vez
npm run test:e2e
```

### Linting e Formatacao

```bash
npm run lint          # Verificar lint
npm run lint:fix      # Corrigir automaticamente
npm run format:check  # Verificar formatacao
npm run format        # Formatar codigo
npm run type-check    # Verificar tipos TypeScript
```

---

## Funcionalidades SaaS

Alem do core de WhatsApp/leads, o Consultor.AI inclui:

- **Billing com Stripe** - 3 planos (Freemium/Pro/Agencia) + compra avulsa de creditos
- **Sistema de Creditos** - Creditos mensais (resetam) + creditos comprados (permanentes)
- **Painel Admin** - Metricas SaaS, gestao de usuarios, toggle admin
- **Email Transacional** - Welcome, password reset, cancelamento (via Resend, fallback para console em dev)
- **Landing Page** - Hero, features, pricing, testimonials, FAQ
- **Cookie Consent (LGPD)** - Banner de consentimento com persistencia localStorage

---

## Estrutura do Projeto

```
Consultor.AI/
├── .rules/               # Regras de desenvolvimento (LEIA PRIMEIRO!)
├── docs/                 # Documentacao tecnica
├── src/
│   ├── app/             # Next.js 14 App Router (pages + API routes)
│   ├── components/      # Componentes React (ui, billing, admin, landing)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Core (services, payment, email, flow-engine)
│   └── types/           # TypeScript types
├── supabase/            # Migrations, seed, config
├── tests/               # Testes (unit, integration, e2e)
└── package.json
```

---

## Comandos Uteis

| Comando                 | Descricao                   |
| ----------------------- | --------------------------- |
| `npm run dev`           | Servidor de desenvolvimento |
| `npm run build`         | Build para producao         |
| `npm test`              | Todos os testes             |
| `npm run test:unit`     | Testes unitarios            |
| `npm run test:e2e`      | Testes E2E                  |
| `npm run test:coverage` | Testes com coverage         |
| `npm run lint`          | Verificar ESLint            |
| `npm run format`        | Formatar com Prettier       |
| `npm run type-check`    | Verificar tipos TypeScript  |
| `supabase start`        | Iniciar Supabase local      |
| `supabase db reset`     | Resetar banco (recria tudo) |

---

## Proximos Passos

1. Leia as regras de desenvolvimento em `.rules/`
2. Explore o dashboard em http://localhost:3000/dashboard
3. Teste o simulador WhatsApp em http://localhost:3000/dashboard/test/whatsapp-simulator
4. Veja o [ROADMAP.md](./ROADMAP.md) para proximas fases

**Guias relacionados:**

- [LOCAL-DOCKER-TESTING.md](./LOCAL-DOCKER-TESTING.md) - Desenvolvimento com Docker
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy para producao
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Resolucao de problemas
