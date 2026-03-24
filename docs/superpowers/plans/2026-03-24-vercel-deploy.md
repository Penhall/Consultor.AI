# Vercel Deploy — Consultor.AI (Opção B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar o Consultor.AI no Vercel com autenticação, dashboard, leads e AI funcionando.

**Architecture:** Nenhuma mudança de código necessária. O projeto já tem `vercel.json`, `src/proxy.ts` (Next.js 16), e `next.config.js` condicional. O trabalho é: aplicar migrations no Supabase cloud, configurar variáveis de ambiente no Vercel, e deployar.

**Tech Stack:** Next.js 16, Supabase Auth + Postgres, Google AI (Gemini), Stripe, Vercel (região gru1)

**Spec:** `docs/superpowers/specs/2026-03-24-vercel-deploy-design.md`
**Guia completo:** `docs/guides/vercel-deploy.md`

---

## Arquivos envolvidos

| Arquivo                     | Status      | Descrição                                |
| --------------------------- | ----------- | ---------------------------------------- |
| `vercel.json`               | Pronto      | Região gru1, framework nextjs, sem crons |
| `src/proxy.ts`              | Pronto      | Auth middleware (Next.js 16)             |
| `next.config.js`            | Pronto      | standalone condicional (Docker only)     |
| `supabase/migrations/*.sql` | 16 arquivos | Aplicar no cloud via `db push`           |

---

## Task 1: Aplicar migrations no Supabase cloud

**Pré-requisito:** Supabase CLI instalado (`npx supabase --version` deve retornar versão)

**Files:**

- Run: `supabase/migrations/` (16 arquivos, aplicados via CLI)

- [ ] **Step 1: Fazer login no Supabase CLI**

```bash
npx supabase login
```

Esperado: abre o browser para autenticação. Após autenticar, terminal confirma "Logged in".

- [ ] **Step 2: Vincular projeto local ao cloud**

```bash
npx supabase link --project-ref qzljsendvthfetrntwab
```

Esperado: pedirá a senha do banco (database password) — está no Supabase Dashboard → Settings → Database → Database password. Resultado: `Finished supabase link.`

- [ ] **Step 3: Aplicar todas as migrations**

```bash
npx supabase db push
```

Esperado: lista as migrations a aplicar e confirma. Exemplo de saída:

```
Applying migration 20251217000001_initial_schema.sql...
Applying migration 20251217000002_rls_policies.sql...
...
Applying migration 20260318000001_add_theme_to_consultants.sql...
Finished supabase db push.
```

- [ ] **Step 4: Verificar tabelas criadas no Supabase Dashboard**

Acesse: Supabase Dashboard → Table Editor

Confirme que estas tabelas existem:

- `consultants`
- `leads`
- `conversations`
- `messages`
- `flows`
- `files`
- `daily_stats`

- [ ] **Step 5: Verificar funções RPC no Supabase Dashboard**

Acesse: Supabase Dashboard → Database → Functions

Confirme que existem:

- `decrement_credits`
- `reset_monthly_credits`
- `calculate_daily_stats`

> **pg_cron:** Os jobs agendados (`reset_monthly_credits`, `calculate_daily_stats`) requerem a extensão `pg_cron`, disponível apenas no **plano pago** do Supabase. No free tier, `supabase db push` termina sem erro, mas os jobs nunca executam. Para verificar: Supabase Dashboard → Database → Extensions → procure `pg_cron`. Se não aparecer como enabled, você está no free tier — os jobs precisarão ser executados manualmente via SQL Editor quando necessário.

---

## Task 2: Coletar credenciais e gerar segredos

**Files:** Nenhum arquivo do repositório — apenas coleta de valores externos.

- [ ] **Step 1: Copiar credenciais do Supabase cloud**

Acesse: Supabase Dashboard → Project Settings → API

Copie e guarde (serão usados no Task 3):

```
NEXT_PUBLIC_SUPABASE_URL=https://qzljsendvthfetrntwab.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

- [ ] **Step 2: Gerar ENCRYPTION_KEY**

```bash
openssl rand -base64 32
```

Guarde o resultado (ex: `k3F9mX2...`). Este valor criptografa os tokens WhatsApp dos consultores — **não pode ser alterado depois sem invalidar todos os tokens existentes.**

- [ ] **Step 3: Verificar GOOGLE_AI_API_KEY**

Confirme que você tem uma API key válida do [Google AI Studio](https://aistudio.google.com/app/apikey). O modelo usado é `gemini-1.5-flash`.

---

## Task 3: Criar projeto no Vercel e configurar env vars

**Files:** Nenhum arquivo do repositório — configuração via Vercel Dashboard.

- [ ] **Step 1: Importar repositório no Vercel**

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Selecione o repositório `consultor-ai`
4. Framework: **Next.js** (detectado automaticamente)
5. **Não clique em Deploy ainda**

- [ ] **Step 2: Adicionar variáveis de ambiente — Supabase + AI**

Na seção "Environment Variables", adicione uma a uma (marcar para **Production**, **Preview**, **Development**):

| Variável                        | Valor                                      |
| ------------------------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://qzljsendvthfetrntwab.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | valor coletado no Task 2                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | valor coletado no Task 2                   |
| `GOOGLE_AI_API_KEY`             | sua API key do Google AI Studio            |
| `ENCRYPTION_KEY`                | valor gerado no Task 2 Step 2              |

- [ ] **Step 3: Adicionar variáveis do Stripe**

As páginas de billing falharão em runtime sem essas variáveis. Adicione agora para evitar redeploy desnecessário:

| Variável                             | Onde pegar                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                  | Stripe Dashboard → Developers → API keys → Secret key (`sk_test_...`)      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys → Publishable key (`pk_test_...`) |
| `STRIPE_PRO_PRICE_ID`                | Stripe Dashboard → Products → plano Pro → Price ID                         |
| `STRIPE_AGENCIA_PRICE_ID`            | Stripe Dashboard → Products → plano Agência → Price ID                     |
| `STRIPE_CREDITS50_PRICE_ID`          | Stripe Dashboard → Products → pacote créditos → Price ID                   |

- [ ] **Step 4: Adicionar variável de admin**

`ADMIN_EMAILS` é lido no callback de OAuth para conceder role de admin. Sem ela, nenhum usuário admin pode ser criado.

| Variável       | Valor                                                   |
| -------------- | ------------------------------------------------------- |
| `ADMIN_EMAILS` | seu email (ex: `admin@consultor.ai,seuemail@gmail.com`) |

---

## Task 4: Primeiro deploy

- [ ] **Step 1: Iniciar deploy**

Clique em **"Deploy"** no Vercel Dashboard.

Acompanhe o build log. Duração esperada: 2-4 minutos.

- [ ] **Step 2: Verificar build bem-sucedido**

Esperado: `✓ Build Completed` sem erros.

Se falhar, verifique:

- Todas as variáveis obrigatórias foram preenchidas
- Build Logs → procure por `Error:` ou `TypeError:`

- [ ] **Step 3: Copiar URL gerada**

Após deploy, a URL estará disponível no topo da página. Exemplo:

```
https://consultor-ai-xyz.vercel.app
```

Guarde esta URL — será usada no próximo task.

---

## Task 5: Configurar NEXT_PUBLIC_APP_URL e redeploy

Esta variável precisa da URL real do deploy, por isso é adicionada após o primeiro deploy.

- [ ] **Step 1: Adicionar NEXT_PUBLIC_APP_URL**

1. Vercel Dashboard → seu projeto → **Settings** → **Environment Variables**
2. Clique em **"Add New"**
3. Adicione:
   - Key: `NEXT_PUBLIC_APP_URL`
   - Value: `https://consultor-ai-xyz.vercel.app` (URL do Task 4)
   - Ambientes: Production, Preview, Development

- [ ] **Step 2: Fazer redeploy sem cache**

1. Vercel Dashboard → **Deployments**
2. No deploy mais recente, clique nos três pontos (`...`)
3. Selecione **"Redeploy"**
4. Desmarque "Use existing build cache"
5. Confirme

Esperado: novo build completa com sucesso (~2 min).

---

## Task 6: Verificar funcionamento

Abra a URL do deploy e execute o checklist:

- [ ] **Step 1: Landing page**

Acesse `https://<sua-url>/`

Esperado: página de apresentação do Consultor.AI carrega sem erros de console.

- [ ] **Step 2: Signup**

Acesse `https://<sua-url>/auth/signup`

Crie uma conta de teste. Esperado: redireciona para o dashboard após signup.

- [ ] **Step 3: Login**

Faça logout e depois login novamente em `https://<sua-url>/auth/login`

Esperado: redireciona para `/dashboard`.

- [ ] **Step 4: Dashboard**

Esperado: dashboard carrega com métricas zeradas (0 leads, 0 conversas).

- [ ] **Step 5: Criar lead**

No dashboard, acesse Leads → Novo Lead e crie um lead de teste.

Esperado: lead criado e aparece na lista.

- [ ] **Step 6: Health check**

Acesse `https://<sua-url>/api/health`

Esperado: JSON com `{ "status": "ok" }` — confirma que a conexão com o Supabase está funcionando.

- [ ] **Step 7: AI responde**

Se houver um flow de conversa configurado, teste enviando uma mensagem de teste via simulador.

Esperado: AI retorna resposta usando Gemini 1.5 Flash.

---

## Task 7 (Opcional): Configurar Stripe Webhook

Necessário apenas se quiser testar o fluxo de billing de ponta a ponta.

- [ ] **Step 1: Criar endpoint no Stripe**

1. Acesse [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Clique em **"Add endpoint"**
3. Endpoint URL: `https://<sua-url>/api/billing/webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Clique em **"Add endpoint"**

- [ ] **Step 2: Copiar Signing secret**

Na página do webhook criado, clique em **"Reveal"** no campo "Signing secret".

Copie o valor `whsec_...`

- [ ] **Step 3: Adicionar STRIPE_WEBHOOK_SECRET no Vercel**

Vercel Dashboard → Settings → Environment Variables → Add New:

- Key: `STRIPE_WEBHOOK_SECRET`
- Value: `whsec_...` copiado acima

- [ ] **Step 4: Redeploy**

Vercel Dashboard → Deployments → Redeploy (sem cache).

- [ ] **Step 5: Testar checkout**

Acesse `https://<sua-url>/dashboard` → Billing → Upgrade

Use o cartão de teste Stripe: `4242 4242 4242 4242`, validade qualquer data futura, CVC qualquer.

Esperado: checkout completa, subscription ativa no Supabase (`consultants.subscription_status = 'active'`).

---

## Troubleshooting Rápido

| Sintoma                    | Causa provável                      | Solução                                  |
| -------------------------- | ----------------------------------- | ---------------------------------------- |
| Build falha: `Invalid URL` | `NEXT_PUBLIC_SUPABASE_URL` vazia    | Verifique env var no Vercel              |
| Redirect loop no login     | Cookie em conflito                  | Limpe cookies do browser                 |
| `crypto is not defined`    | Dependência Node.js em Edge runtime | Verifique imports no proxy.ts            |
| AI não responde            | GOOGLE_AI_API_KEY inválida          | Teste key no Google AI Studio            |
| Emails não chegam          | Normal sem RESEND_API_KEY           | Cheque Function Logs no Vercel           |
| Migrations falharam        | Senha do banco incorreta            | Supabase Dashboard → Settings → Database |
