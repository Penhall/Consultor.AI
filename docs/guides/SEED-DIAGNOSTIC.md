# Guia de Seed para Diagnostico

**Ultima Atualizacao**: 2026-02-20

Guia completo para popular o banco de dados local com dados de teste usando o script `seed-diagnostic.ts`.

---

## Usuarios e Senhas de Teste

Todos os usuarios usam a mesma senha: **`seed123456`**

| Email | Senha | Nome | Role | Plano | Creditos | Cidade |
|-------|-------|------|------|-------|----------|--------|
| `consultor0@seed.local` | `seed123456` | Marcos Oliveira | **Admin** | freemium | 20/20 | Sao Paulo |
| `consultor1@seed.local` | `seed123456` | Camila Santos | Consultor | freemium | 15/20 | Rio de Janeiro |
| `consultor2@seed.local` | `seed123456` | Roberto Ferreira | Consultor | pro | 180/200 | Belo Horizonte |
| `consultor3@seed.local` | `seed123456` | Patricia Almeida | Consultor | pro | 150/200 | Curitiba |
| `consultor4@seed.local` | `seed123456` | Fernando Costa | Consultor | agencia | 950/1000 | Porto Alegre |
| `consultor5@seed.local` | `seed123456` | Juliana Lima | Consultor | freemium | 20/20 | Brasilia |

> **Nota**: A coluna "Creditos" mostra `creditos atuais / alocacao mensal`. Os valores de creditos so sao aplicados se a migration de billing estiver presente no banco.

### Distribuicao de Planos

| Plano | Quantidade | Creditos/mes | Limite de Leads |
|-------|-----------|--------------|-----------------|
| Freemium | 3 | 20 | 20 |
| Pro | 2 | 200 | 200 |
| Agencia | 1 | 1000 | 1000 |

---

## Dados Criados por Consultor

Cada consultor recebe automaticamente:

| Entidade | Quantidade | Detalhes |
|----------|-----------|---------|
| Leads | 15 | Distribuidos em 6 status diferentes |
| Conversas | 2 por lead (30 total) | Requer default flow no banco |
| Mensagens | 3-6 por conversa (90+ total) | Mix inbound/outbound |
| Follow-ups | ~5-6 | Distribuidos em 4 status |
| Templates | 3 | greeting, follow_up, qualification |

### Distribuicao de Leads por Status

| Status | Leads/consultor | Score Range | Descricao |
|--------|----------------|-------------|-----------|
| `novo` | 3 | 0-20 | Leads recem-capturados |
| `em_contato` | 3 | 20-45 | Em processo de contato |
| `qualificado` | 3 | 60-85 | Qualificados pelo flow |
| `agendado` | 2 | 50-75 | Com reuniao agendada |
| `fechado` | 2 | 80-100 | Venda concluida |
| `perdido` | 2 | 0-30 | Desistiram ou sem resposta |

---

## Como Testar via Docker

### Pre-requisitos

1. Docker Desktop rodando
2. Dependencias instaladas (`npm install`)

### Passo 1: Subir a stack Docker

```bash
# Sobe todos os servicos (Supabase + App + Redis)
npm run docker:full:up

# Aguarde todos os containers ficarem healthy (~2-3 min)
npm run docker:full:ps
```

### Passo 2: Verificar que o banco esta pronto

```bash
# Deve retornar os containers com status "healthy"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep consultorai
```

Aguarde ate que `consultorai-kong` e `consultorai-auth` mostrem `(healthy)`.

### Passo 3: Executar o seed

```bash
# Roda o seed a partir do host (conecta no Docker via porta 54321)
npm run seed:diagnostic
```

Ou diretamente:

```bash
npx tsx scripts/seed-diagnostic.ts
```

### Saida Esperada

```
🔒 Safety check: SUPABASE_URL = http://localhost:54321 ✓
📦 Creating 6 auth users...
  ✓ consultor0@seed.local (admin)
  ✓ consultor1@seed.local
  ✓ consultor2@seed.local
  ✓ consultor3@seed.local
  ✓ consultor4@seed.local
  ✓ consultor5@seed.local
👤 Creating 6 consultants...
  ✓ 3 freemium, 2 pro, 1 agencia
📋 Creating 90 leads (15 per consultant)...
  ✓ All 6 statuses represented per consultant
...
✅ Seed completed in X.Xs
```

> **Nota**: Se tabelas como `follow_ups`, `message_templates` ou o default flow nao existirem, o script pula essas etapas automaticamente com um aviso. Isso e normal no Docker sem a migration de billing aplicada.

### Passo 4: Testar o login

1. Acesse http://localhost:3000/auth/login
2. Use qualquer credencial da tabela acima, por exemplo:
   - **Email**: `consultor0@seed.local`
   - **Senha**: `seed123456`
3. Voce sera redirecionado para o dashboard com os 15 leads desse consultor

### Passo 5: Testar o painel admin

1. Faca login com `consultor0@seed.local` (unico admin)
2. Acesse http://localhost:3000/admin
3. Voce vera todos os 6 consultores e suas metricas

---

## Configuracao de Variaveis de Ambiente

O script carrega automaticamente variaveis de `.env` e `.env.local` (nesta ordem, `.env.local` tem prioridade).

### Variaveis aceitas

| Variavel | Descricao | Obrigatoria |
|----------|-----------|-------------|
| `SUPABASE_URL` | URL do Supabase (server-side) | Uma das duas |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase (client-side) | Uma das duas |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de service role | Sim |

O script aceita tanto `SUPABASE_URL` quanto `NEXT_PUBLIC_SUPABASE_URL` como fallback. Se voce tem um `.env` do Docker com `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`, isso funciona.

### Exemplo minimo de `.env`

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

---

## Adaptacao Automatica ao Schema

O script detecta automaticamente quais tabelas e colunas existem no banco:

| Cenario | Comportamento |
|---------|--------------|
| Migration de billing **aplicada** | Insere todos os campos (credits, subscription_plan, is_admin, etc.) |
| Migration de billing **ausente** | Insere apenas campos core (email, name, slug, vertical, subscription_tier) |
| Tabela `follow_ups` **ausente** | Pula criacao de follow-ups com aviso |
| Tabela `message_templates` **ausente** | Pula criacao de templates com aviso |
| Default flow **ausente** | Pula conversas e mensagens com aviso |

Isso permite usar o seed tanto no ambiente Docker (que pode ter apenas as migrations iniciais) quanto com Supabase CLI (que tem todas as migrations).

---

## Idempotencia

O script e seguro para rodar varias vezes:

```bash
# Primeira execucao - cria todos os dados
npm run seed:diagnostic

# Segunda execucao - pula existentes, sem erros
npm run seed:diagnostic

# Terceira execucao - mesmo resultado final
npm run seed:diagnostic
```

| Entidade | Estrategia de Idempotencia |
|----------|---------------------------|
| Auth users | `createUser` + fallback para `listUsers` se ja existe |
| Consultants | `upsert` com `onConflict: 'email'` |
| Leads | `upsert` com `onConflict: 'consultant_id,whatsapp_number'` |
| Conversations | Verifica contagem existente antes de inserir |
| Messages | Verifica `count > 0` por conversation antes de inserir |
| Follow-ups | `upsert` com `onConflict: 'id'` (UUID deterministico) |
| Templates | `upsert` com `onConflict: 'id'` (UUID deterministico) |

---

## Guard de Seguranca

O script **recusa executar** em bancos nao-locais:

```
❌ SAFETY: Refusing to run seed on non-local database.
   SUPABASE_URL = https://abc123.supabase.co
   This script should only run against a local Supabase instance.
```

URLs aceitas: `localhost`, `127.0.0.1`, `host.docker.internal`

---

## Verificacao via SQL (Supabase Studio)

Acesse http://localhost:54323 e execute no SQL Editor:

```sql
-- Contar entidades criadas pelo seed
SELECT 'auth_users' AS entity, COUNT(*) FROM auth.users WHERE email LIKE '%@seed.local'
UNION ALL
SELECT 'consultants', COUNT(*) FROM consultants WHERE email LIKE '%@seed.local'
UNION ALL
SELECT 'leads', COUNT(*) FROM leads
  WHERE consultant_id IN (SELECT id FROM consultants WHERE email LIKE '%@seed.local');

-- Verificar distribuicao de planos
SELECT subscription_tier AS plano, COUNT(*) AS total
FROM consultants
WHERE email LIKE '%@seed.local'
GROUP BY subscription_tier;

-- Verificar leads por status e consultor
SELECT c.name AS consultor, l.status, COUNT(*) AS leads
FROM leads l
JOIN consultants c ON c.id = l.consultant_id
WHERE c.email LIKE '%@seed.local'
GROUP BY c.name, l.status
ORDER BY c.name, l.status;

-- Verificar isolamento entre consultores (cada um ve so seus leads)
SELECT c.name, COUNT(l.id) AS total_leads
FROM consultants c
LEFT JOIN leads l ON l.consultant_id = c.id
WHERE c.email LIKE '%@seed.local'
GROUP BY c.name
ORDER BY c.name;
```

---

## Troubleshooting

| Problema | Solucao |
|----------|---------|
| `SUPABASE_URL is not set` | Verifique se `.env` ou `.env.local` existe com `NEXT_PUBLIC_SUPABASE_URL` ou `SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY is not set` | Copie a service role key do `docker-compose.full.yml` ou `supabase status` |
| `SAFETY: Refusing to run` | URL aponta para producao. Use apenas `localhost` ou `127.0.0.1` |
| `Database error checking email` | Normal na segunda execucao (usuarios ja existem). O script recupera automaticamente |
| `column credits does not exist` | Migration de billing nao aplicada. Script adapta automaticamente |
| `Default health flow not found` | Esperado se `01_default_flows.sql` nao foi aplicado. Conversas/mensagens sao puladas |
| `relation does not exist` | Tabela nao existe no schema atual. Script pula automaticamente |
| Todos os containers `unhealthy` | Aumente memoria do Docker Desktop (minimo 4GB). Rode `npm run docker:full:clean` e tente novamente |

---

## Referencia Rapida

```bash
# Subir ambiente Docker completo
npm run docker:full:up

# Rodar seed
npm run seed:diagnostic

# Login admin
# Email: consultor0@seed.local
# Senha: seed123456

# Login consultor (Pro)
# Email: consultor2@seed.local
# Senha: seed123456

# Verificar dados no Studio
# http://localhost:54323

# Parar tudo
npm run docker:full:down
```
