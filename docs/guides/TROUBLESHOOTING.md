# Troubleshooting - Consultor.AI

**Data**: 2026-01-30

---

## Problema: APIs retornando 404 (Perfil de consultor não encontrado)

### Diagnóstico

Ao navegar pelo dashboard, as APIs retornam 404:

```
GET /api/leads? 404
GET /api/flows 404
GET /api/analytics/overview 404
GET /api/integrations/crm 404
```

**Causa**: O usuário está autenticado (tem sessão), mas não existe um registro na tabela `consultants` associado ao `user_id`.

### Fluxo Esperado

1. Usuário faz signup → Supabase Auth cria usuário
2. SignupForm insere registro em `consultants` com `user_id`
3. Login → Sessão criada
4. Dashboard → APIs buscam `consultant` por `user_id` → Encontra perfil

### O que pode ter falhado

1. **Supabase não está rodando** - Banco de dados inacessível
2. **RLS bloqueando insert** - Política de segurança impedindo criação
3. **Migrations não aplicadas** - Tabela `consultants` não existe
4. **Erro silencioso** - Insert falhou mas erro foi ignorado

---

## Solução 1: Verificar se Supabase está rodando

### Para desenvolvimento local (npm run dev)

O Supabase local precisa estar rodando separadamente:

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Iniciar Supabase local
cd E:/PROJETOS/Consultor.AI
supabase start
```

Isso vai mostrar as credenciais:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhbG...
service_role key: eyJhbG...
```

### Para Docker completo

```bash
# Iniciar toda a stack (app + supabase + redis)
docker-compose -f docker-compose.full.yml up -d

# Verificar containers
docker ps
```

---

## Solução 2: Aplicar migrations

```bash
# Com Supabase CLI
supabase db push

# Ou aplicar manualmente via Studio
# Abrir http://localhost:54323 (Supabase Studio)
# SQL Editor → Executar arquivos em supabase/migrations/
```

### Migrations necessárias

1. `20251217000001_initial_schema.sql` - Tabelas core
2. `20251217000002_rls_policies.sql` - Políticas de segurança
3. `20260127000001_add_crm_integrations.sql` - Tabelas CRM

---

## Solução 3: Criar perfil de consultor manualmente

Se o usuário já existe no Auth mas não tem perfil:

### Via Supabase Studio

1. Abrir http://localhost:54323
2. Ir em Authentication → Users
3. Copiar o `user_id` do usuário
4. Ir em Table Editor → consultants
5. Inserir novo registro:

```sql
INSERT INTO consultants (user_id, email, name, slug, vertical, subscription_tier, monthly_lead_limit)
VALUES (
  'seu-user-id-aqui',
  'email@exemplo.com',
  'Nome do Consultor',
  'seu-slug',
  'saude',
  'freemium',
  20
);
```

### Via SQL Editor

```sql
-- Verificar usuários sem perfil de consultor
SELECT au.id, au.email, c.id as consultant_id
FROM auth.users au
LEFT JOIN public.consultants c ON c.user_id = au.id
WHERE c.id IS NULL;

-- Criar perfil para usuário específico
INSERT INTO consultants (user_id, email, name, slug, vertical, subscription_tier, monthly_lead_limit)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', 'Consultor'),
  LOWER(REGEXP_REPLACE(email, '@.*', '')),
  'saude',
  'freemium',
  20
FROM auth.users
WHERE id = 'seu-user-id-aqui'
AND NOT EXISTS (SELECT 1 FROM consultants WHERE user_id = auth.users.id);
```

---

## Solução 4: Limpar sessão e refazer registro

Se preferir começar do zero:

```bash
# Limpar cookies do navegador para localhost:3000
# Ou usar aba anônima

# Acessar /auth/register e criar nova conta
```

---

## Problema: Refresh Token Not Found

```
[AuthApiError: Invalid Refresh Token: Refresh Token Not Found]
```

**Causa**: Sessão expirada ou cookies corrompidos.

### Solução

1. Limpar cookies do navegador para `localhost`
2. Fazer logout e login novamente
3. Se persistir, limpar localStorage:

```javascript
// No console do navegador (F12)
localStorage.clear();
sessionStorage.clear();
```

---

## Problema: Warning de segurança do Supabase

```
Using the user object as returned from supabase.auth.getSession() ... could be insecure!
Use supabase.auth.getUser() instead
```

**Causa**: Código usa `getSession()` que pode ser manipulado pelo cliente.

### Solução (não urgente)

Atualizar as API routes para usar `getUser()` em vez de `getSession()`:

```typescript
// Antes (menos seguro)
const {
  data: { session },
} = await supabase.auth.getSession();

// Depois (mais seguro)
const {
  data: { user },
  error,
} = await supabase.auth.getUser();
```

**Nota**: Isso é um warning, não um erro. O sistema funciona, mas é recomendado corrigir para produção.

---

## Problema: Performance lenta entre páginas

**Possíveis causas:**

1. **Supabase local lento** - Primeira query após inatividade
2. **Muitas compilações** - Next.js compilando páginas on-demand em dev
3. **Chamadas redundantes** - APIs chamadas múltiplas vezes

### Verificar no DevTools

1. Abrir F12 → Network
2. Navegar entre páginas
3. Verificar tempos de resposta

### Melhorias recomendadas

1. **Prefetch de links** - Adicionar prefetch nos links do menu
2. **Aumentar staleTime** - React Query já está configurado com 1min
3. **Build de produção** - `npm run build && npm start` é muito mais rápido

---

## Comandos de Diagnóstico Rápido

```bash
# Verificar se Supabase está rodando
curl http://localhost:54321/rest/v1/ -H "apikey: eyJhbG..."

# Verificar health da aplicação
curl http://localhost:3000/api/health

# Verificar containers Docker
docker ps

# Ver logs do Supabase
supabase logs

# Resetar banco local
supabase db reset
```

---

## Checklist de Setup para Desenvolvimento

- [ ] Node.js 20+ instalado
- [ ] Docker Desktop rodando
- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] Supabase local rodando (`supabase start`)
- [ ] Arquivo `.env` com credenciais corretas
- [ ] Migrations aplicadas (`supabase db push`)
- [ ] `npm run dev` sem erros

---

## Arquitetura de Ambiente

### Modo 1: npm run dev (Local)

```
┌─────────────┐     ┌─────────────────┐
│ Next.js App │────▶│ Supabase Local  │
│ :3000       │     │ :54321 (API)    │
└─────────────┘     │ :54322 (DB)     │
                    │ :54323 (Studio) │
                    └─────────────────┘
```

**Requer**: `supabase start` rodando separadamente

### Modo 2: Docker Compose Dev

```
┌─────────────────────────────────────┐
│           Docker Network            │
│ ┌─────────────┐ ┌─────────────────┐ │
│ │ Next.js App │ │ Supabase Local  │ │
│ │ (container) │ │ (host machine)  │ │
│ └─────────────┘ └─────────────────┘ │
└─────────────────────────────────────┘
```

**Requer**: `supabase start` + `docker-compose -f docker-compose.dev.yml up`

### Modo 3: Docker Compose Full (Produção-like)

```
┌──────────────────────────────────────────────┐
│              Docker Compose Full             │
│ ┌──────────┐ ┌──────────┐ ┌───────────────┐ │
│ │ Next.js  │ │  Redis   │ │   Supabase    │ │
│ │  :3000   │ │  :6379   │ │ (all-in-one)  │ │
│ └──────────┘ └──────────┘ └───────────────┘ │
└──────────────────────────────────────────────┘
```

**Comando**: `docker-compose -f docker-compose.full.yml up`

---

## Problema: Stripe Webhook falha (400/401)

**Causa**: Webhook secret incorreto ou body parsing incorreto.

### Solucao

1. Verifique `STRIPE_WEBHOOK_SECRET` no `.env`
2. Confirme que o webhook endpoint e `https://seu-dominio/api/billing/webhook`
3. No Stripe Dashboard > Developers > Webhooks, verifique os eventos:
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Teste com Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

---

## Problema: Creditos nao resetam no inicio do mes

**Causa**: pg_cron nao esta configurado ou Supabase esta no plano Free.

### Solucao

1. Verifique se a migration `20260208000007_setup_pg_cron.sql` foi aplicada
2. pg_cron requer Supabase **plano pago** (Pro+)
3. Alternativa: crie um cron externo que chame a funcao:

```sql
SELECT reset_monthly_credits();
```

---

## Problema: Painel admin nao acessivel (403)

**Causa**: Email do usuario nao esta na lista `ADMIN_EMAILS` ou flag `is_admin` nao esta ativa.

### Solucao

1. Verifique `ADMIN_EMAILS` no `.env` (separado por virgula)
2. Ou ative manualmente no banco:

```sql
UPDATE consultants SET is_admin = true WHERE email = 'seu-email@exemplo.com';
```

---

## Problema: Emails nao enviados

**Causa**: `RESEND_API_KEY` nao configurada ou dominio nao verificado.

### Solucao

1. Em desenvolvimento: emails sao logados no console (fallback automatico)
2. Em producao: configure `RESEND_API_KEY` e verifique o dominio em [resend.com](https://resend.com)
3. Verifique logs do servidor para erros de envio

---

## Contatos e Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Troubleshooting](https://nextjs.org/docs/messages)
- [Stripe Docs](https://stripe.com/docs)
- [Projeto GitHub Issues](https://github.com/Penhall/Consultor.AI/issues)
