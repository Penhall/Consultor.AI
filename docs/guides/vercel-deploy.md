# Guia de Deploy no Vercel

**Versão:** 1.0 | **Atualizado:** 2026-03-24

Guia passo a passo para fazer o deploy do Consultor.AI no Vercel com autenticação, dashboard, leads e IA funcionando.

---

## Pré-requisitos

- Repositório no GitHub com a branch `main` atualizada
- Conta no [Vercel](https://vercel.com)
- Acesso ao [Supabase Dashboard](https://supabase.com/dashboard) do projeto cloud
- [Google AI Studio](https://aistudio.google.com) API key
- [Stripe](https://dashboard.stripe.com) (opcional para teste inicial)

---

## Passo 1 — Aplicar Migrations no Supabase Cloud

O banco de dados cloud precisa ter todas as tabelas criadas antes do deploy.

```bash
# Login no Supabase CLI
npx supabase login

# Vincular ao projeto cloud
npx supabase link --project-ref qzljsendvthfetrntwab

# Aplicar todas as migrations
npx supabase db push

# (Opcional) Aplicar seed dos flows de conversa
npx supabase db seed
```

Após executar, verifique no Supabase Dashboard → Table Editor que as tabelas foram criadas (`consultants`, `leads`, `conversations`, etc.).

---

## Passo 2 — Gerar Segredos

Execute localmente para gerar valores seguros:

```bash
# ENCRYPTION_KEY (para tokens criptografados)
openssl rand -base64 32

# NEXTAUTH_SECRET (para sessões)
openssl rand -base64 32
```

Guarde os valores gerados — você vai precisar no próximo passo.

---

## Passo 3 — Criar Projeto no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Selecione o repositório `consultor-ai`
4. Framework: **Next.js** (detectado automaticamente)
5. **NÃO clique em Deploy ainda** — configure as variáveis primeiro

---

## Passo 4 — Configurar Variáveis de Ambiente

Na tela de configuração do projeto, adicione as seguintes variáveis:

### Obrigatórias

| Variável                        | Onde pegar                                                 |
| ------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard → Settings → API → Project URL          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Dashboard → Settings → API → service_role key     |
| `GOOGLE_AI_API_KEY`             | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `ENCRYPTION_KEY`                | Valor gerado no Passo 2                                    |
| `NEXTAUTH_SECRET`               | Valor gerado no Passo 2                                    |

> `NEXT_PUBLIC_APP_URL` será adicionada após o 1º deploy (ver Passo 6).

### Para Stripe (billing)

| Variável                             | Onde pegar                               |
| ------------------------------------ | ---------------------------------------- |
| `STRIPE_SECRET_KEY`                  | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_PRO_PRICE_ID`                | Stripe Dashboard → Products              |
| `STRIPE_AGENCIA_PRICE_ID`            | Stripe Dashboard → Products              |

> `STRIPE_WEBHOOK_SECRET` será adicionada após o 1º deploy (ver Passo 7).

### Opcionais

| Variável                 | Efeito sem ela                        |
| ------------------------ | ------------------------------------- |
| `RESEND_API_KEY`         | Emails aparecem só no log do servidor |
| `NEXT_PUBLIC_SENTRY_DSN` | Sem rastreamento de erros             |
| `ADMIN_EMAILS`           | Nenhum usuário admin                  |

---

## Passo 5 — Primeiro Deploy

Clique em **"Deploy"** e aguarde o build completar (~2-3 minutos).

Se o build falhar, verifique:

- Todos as variáveis obrigatórias foram preenchidas
- O log de build em Vercel → Deployments → [deployment] → Build Logs

---

## Passo 6 — Configurar URL do App

Após o deploy:

1. Copie a URL gerada (ex: `https://consultor-ai-xyz.vercel.app`)
2. Vá em **Vercel → Settings → Environment Variables**
3. Adicione: `NEXT_PUBLIC_APP_URL` = `https://consultor-ai-xyz.vercel.app`
4. Vá em **Vercel → Deployments** → clique nos três pontos → **"Redeploy"**
5. Marque **"Use existing build cache: No"** e confirme

---

## Passo 7 — Configurar Webhook do Stripe (opcional)

Para que o billing funcione de ponta a ponta:

1. Acesse [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Clique em **"Add endpoint"**
3. URL: `https://<sua-url>/api/billing/webhook`
4. Eventos: selecione `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copie o **Signing secret** (`whsec_...`)
6. Adicione `STRIPE_WEBHOOK_SECRET` nas env vars do Vercel
7. Faça redeploy

---

## Passo 8 — Verificar Funcionamento

Acesse sua URL e verifique:

- [ ] Landing page carrega (`/`)
- [ ] Signup cria conta (`/auth/signup`)
- [ ] Login funciona (`/auth/login`)
- [ ] Dashboard carrega após login (`/dashboard`)
- [ ] Criação de lead funciona
- [ ] AI responde no fluxo de conversa

---

## Troubleshooting

**Build falha com erro de TypeScript:**
Verifique `npm run type-check` localmente antes de pushear.

**"Invalid URL" no startup:**
`NEXT_PUBLIC_SUPABASE_URL` está vazia ou incorreta. Verifique se começa com `https://`.

**Redirect loop no login:**
O cookie `sb-consultorai-auth-token` pode estar em conflito. Limpe os cookies do browser.

**AI não responde:**
`GOOGLE_AI_API_KEY` inválida ou sem quota. Verifique no Google AI Studio.

**Emails não chegam:**
Normal sem `RESEND_API_KEY` — os emails aparecem nos Function Logs do Vercel.

---

## Domínio Customizado (opcional)

1. Vercel → Settings → Domains → Add Domain
2. Configure os DNS records no seu registrador
3. Atualize `NEXT_PUBLIC_APP_URL` com o domínio customizado
4. Faça redeploy
