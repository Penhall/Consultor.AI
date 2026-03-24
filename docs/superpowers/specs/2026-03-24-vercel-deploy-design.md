# Design: Deploy no Vercel (Opção B — App Completo)

**Data:** 2026-03-24
**Status:** Aprovado
**Escopo:** Auth, dashboard, leads, AI funcionando no Vercel

---

## Contexto

O projeto Consultor.AI (Next.js 14, Supabase, Stripe, Google AI) já foi preparado para Vercel no commit `fd7dd67` (vercel.json, proxy.ts, next.config.js condicional). Falta aplicar as migrations no Supabase cloud e configurar as variáveis de ambiente no Vercel.

**O que já está pronto:**

- `vercel.json` com região `gru1` e cron jobs configurados
- `src/proxy.ts` (renomeado de middleware.ts — padrão Next.js 15+)
- `next.config.js` com `output: 'standalone'` condicional (apenas para Docker)
- Projeto Supabase cloud existente: `qzljsendvthfetrntwab.supabase.co`

**Sem mudanças de código necessárias** — Redis não está implementado no código-fonte.

---

## Componentes do Deploy

### 1. Supabase Cloud — Migrations

Aplicar todas as migrations do diretório `supabase/migrations/` no projeto cloud:

```bash
npx supabase login
npx supabase link --project-ref qzljsendvthfetrntwab
npx supabase db push
# Opcional: aplicar seed dos flows
npx supabase db seed
```

### 2. Variáveis de Ambiente — Vercel Dashboard

**Obrigatórias:**

| Variável                        | Descrição                                |
| ------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL do projeto Supabase cloud            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon/publishable)         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Chave secreta (service_role)             |
| `GOOGLE_AI_API_KEY`             | Google AI Studio API key                 |
| `ENCRYPTION_KEY`                | Gerada com `openssl rand -base64 32`     |
| `NEXTAUTH_SECRET`               | Gerada com `openssl rand -base64 32`     |
| `NEXT_PUBLIC_APP_URL`           | URL do Vercel (adicionar após 1º deploy) |

**Para billing (Stripe):**

| Variável                             | Descrição                 |
| ------------------------------------ | ------------------------- |
| `STRIPE_SECRET_KEY`                  | `sk_test_...`             |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...`             |
| `STRIPE_WEBHOOK_SECRET`              | `whsec_...`               |
| `STRIPE_PRO_PRICE_ID`                | Price ID do plano Pro     |
| `STRIPE_AGENCIA_PRICE_ID`            | Price ID do plano Agência |

**Opcionais (fallback gracioso):**

| Variável                 | Fallback               |
| ------------------------ | ---------------------- |
| `RESEND_API_KEY`         | Emails → `console.log` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sem error tracking     |
| `META_*`                 | WhatsApp desativado    |
| `ADMIN_EMAILS`           | Sem admin configurado  |

### 3. Passos de Deploy

1. `vercel.com/new` → Import Git Repository → selecionar `consultor-ai`
2. Framework: Next.js (auto-detectado)
3. Adicionar variáveis de ambiente obrigatórias
4. Deploy
5. Copiar URL gerada → adicionar como `NEXT_PUBLIC_APP_URL`
6. Redeploy (sem cache)

### 4. Webhook Stripe (pós-deploy)

Configurar no Stripe Dashboard → Webhooks → endpoint:
`https://<url-vercel>/api/billing/webhook`

Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## Checklist de Verificação

- [ ] Landing page carrega (`/`)
- [ ] Login/signup funciona (`/auth/login`)
- [ ] Dashboard carrega após login (`/dashboard`)
- [ ] Criar um lead funciona
- [ ] AI responde no flow de conversa

---

## Fora do Escopo

- WhatsApp (Meta API) — requer configuração adicional pós-deploy
- Redis/rate limiting — não implementado no código atual
- Voice cloning, image generation — Fase 5 futura
