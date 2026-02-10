# Deployment Guide

Este guia descreve como fazer deploy do Consultor.AI em diferentes ambientes.

**Ultima Atualizacao**: 2026-02-10
**Versao**: 0.4.0

---

## Pre-requisitos

- Node.js 20+
- npm 10+
- Docker (para deploy containerizado)
- Conta Supabase (ou Supabase self-hosted)
- Conta Vercel (opcional, para deploy serverless)
- Conta Stripe (para billing)

---

## Variaveis de Ambiente

### Core (Obrigatorias)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Criptografia
ENCRYPTION_KEY=base64-encoded-32-byte-key

# Site URL
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com.br
NEXT_PUBLIC_APP_URL=https://seu-dominio.com.br

# AI
GOOGLE_AI_API_KEY=AIzaSy...
GOOGLE_AI_MODEL=gemini-1.5-flash
```

### Stripe Billing (Obrigatorias para SaaS)

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (crie no Stripe Dashboard)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCIA_PRICE_ID=price_...
STRIPE_CREDITS50_PRICE_ID=price_...
```

**Configuracao Stripe:**

1. Crie os produtos e precos no [Stripe Dashboard](https://dashboard.stripe.com/products)
   - **Pro**: R$47/mes (recorrente)
   - **Agencia**: R$147/mes (recorrente)
   - **Credits50**: R$19,90 (pagamento unico)
2. Copie os Price IDs para as variaveis acima
3. Configure o webhook endpoint em Stripe > Developers > Webhooks:
   - URL: `https://seu-dominio.com.br/api/billing/webhook`
   - Eventos: `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copie o Webhook Signing Secret para `STRIPE_WEBHOOK_SECRET`

> **Teste vs Live:** Use `sk_test_` e `pk_test_` para testes. Mude para `sk_live_` e `pk_live_` em producao.

### Email (Recomendadas)

```env
# Resend (transactional emails)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@seu-dominio.com.br
```

**Configuracao Resend:**

1. Crie conta em [resend.com](https://resend.com)
2. Adicione e verifique seu dominio
3. Crie uma API key
4. Sem configuracao, emails sao logados no console (fallback dev)

### Admin

```env
# Emails com acesso ao painel admin (separados por virgula)
ADMIN_EMAILS=admin@seu-dominio.com.br,outro-admin@email.com
```

### WhatsApp (Obrigatorias para integracao)

```env
META_APP_ID=123456789
META_APP_SECRET=abcdef123456
META_WEBHOOK_VERIFY_TOKEN=seu-token-verificacao
NEXT_PUBLIC_META_APP_ID=123456789
NEXT_PUBLIC_META_CONFIG_ID=987654321
```

### Monitoring (Recomendadas)

```env
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info
NEXT_PUBLIC_APP_VERSION=0.4.0
```

### CRM (Opcionais)

```env
RD_STATION_CLIENT_ID=
RD_STATION_CLIENT_SECRET=
PIPEDRIVE_API_TOKEN=
```

---

## Supabase em Producao

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a URL e as chaves (anon key, service role key)
3. Configure as variaveis de ambiente

### 2. Aplicar Migrations

```bash
# Linkar ao projeto remoto
npx supabase link --project-ref=seu-projeto-ref

# Aplicar todas as migrations
npx supabase db push
```

**Migrations incluidas:**

| Migration                                 | Descricao                                      |
| ----------------------------------------- | ---------------------------------------------- |
| `20251217000001_initial_schema.sql`       | Tabelas core (consultants, leads, flows, etc.) |
| `20251217000002_rls_policies.sql`         | Politicas de seguranca RLS                     |
| `20260127000001_add_crm_integrations.sql` | Tabelas CRM                                    |
| `20260208000001_add_billing_fields.sql`   | Campos de billing em consultants               |
| `20260208000002_add_daily_stats.sql`      | Tabela daily_stats para metricas admin         |
| `20260208000003_add_files_table.sql`      | Tabela de armazenamento de arquivos            |
| `20260208000004_add_logs_table.sql`       | Tabela de logs de erro                         |
| `20260208000005_add_contact_messages.sql` | Mensagens de contato                           |
| `20260208000006_billing_rls_policies.sql` | RLS para tabelas de billing                    |
| `20260208000007_setup_pg_cron.sql`        | Jobs agendados (credit reset, stats)           |

### 3. pg_cron (Plano Pago)

O `pg_cron` requer Supabase **plano pago** (Pro ou superior). Ele gerencia:

- **Reset mensal de creditos** - Roda no dia 1 de cada mes as 00:05 UTC
- **Calculo de stats diarios** - Roda a cada hora

Se estiver no plano Free, esses jobs nao executam silenciosamente. Alternativa: usar um cron externo (GitHub Actions, Vercel Cron) para chamar endpoints equivalentes.

### 4. Gerar Tipos TypeScript

```bash
npx supabase gen types typescript --project-id=seu-projeto > src/types/database.ts
```

---

## Deploy com Docker

### Producao

```bash
# Build da imagem
docker build -t consultor-ai:latest .

# Executar container
docker run -d \
  --name consultor-ai \
  -p 3000:3000 \
  --env-file .env.production \
  consultor-ai:latest
```

### Docker Compose

```bash
# Iniciar todos os servicos
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

---

## Deploy na Vercel

### Via CLI

```bash
npm i -g vercel
vercel login
vercel         # preview
vercel --prod  # producao
```

### Via GitHub

1. Conecte seu repositorio a Vercel
2. Configure todas as variaveis de ambiente no dashboard
3. Push para `main` aciona deploy automatico

### Configuracoes Vercel

No `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["gru1"]
}
```

---

## Checklist Pre-Deploy

- [ ] Todas as variaveis de ambiente configuradas
- [ ] Migrations aplicadas no Supabase remoto
- [ ] Stripe webhook endpoint configurado
- [ ] Resend dominio verificado
- [ ] ADMIN_EMAILS definido
- [ ] Build local funciona: `npm run build`
- [ ] Testes passam: `npm test`
- [ ] Lint sem erros: `npm run lint`

## Checklist Pos-Deploy

- [ ] Site acessivel no dominio
- [ ] Login/Signup funcionando
- [ ] Dashboard carrega corretamente
- [ ] Stripe checkout funciona (testar com cartao de teste)
- [ ] Webhook WhatsApp configurado
- [ ] Sentry recebendo eventos
- [ ] Emails sendo enviados (testar signup)
- [ ] Painel admin acessivel para ADMIN_EMAILS

---

## Rollback

### Vercel

```bash
vercel ls
vercel promote [deployment-url]
```

### Docker

```bash
docker stop consultor-ai
docker run -d --name consultor-ai -p 3000:3000 consultor-ai:previous-tag
```

---

## Health Check

```bash
curl https://seu-dominio.com.br/api/health
```

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-02-10T10:00:00.000Z",
    "version": "0.4.0"
  }
}
```

---

## SSL/TLS

- **Vercel**: SSL automatico
- **Docker**: Configure reverse proxy (nginx/traefik) com Let's Encrypt

## Backups

- **Supabase**: Backups automaticos diarios (plano Pro+)
- **Export manual**: `npx supabase db dump`
- **Arquivos**: Armazenados no Supabase Storage
