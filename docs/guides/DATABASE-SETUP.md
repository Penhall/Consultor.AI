# Database Setup Guide - Consultor.AI

Guia completo para configurar o banco de dados PostgreSQL com Supabase localmente.

## 📋 Pré-requisitos

- [ ] Docker e Docker Compose instalados
- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] PostgreSQL client (psql) instalado (opcional, mas recomendado)

## 🚀 Quick Start

```bash
# 1. Inicializar Supabase (se ainda não foi feito)
supabase init

# 2. Iniciar Supabase local
supabase start

# 3. Aplicar migrations
./scripts/db-apply-migrations.sh

# 4. Gerar tipos TypeScript
./scripts/db-generate-types.sh

# 5. Aplicar seeds de desenvolvimento (opcional)
./scripts/db-seed.sh
```

---

## 📖 Passo a Passo Detalhado

### 1. Instalação do Supabase CLI

```bash
# Via npm (recomendado)
npm install -g supabase

# Ou via Homebrew (macOS)
brew install supabase/tap/supabase

# Verificar instalação
supabase --version
```

### 2. Iniciar Supabase Local

```bash
# Iniciar containers Docker
supabase start

# Aguardar até ver:
# ✅ Supabase local development setup is running.
```

**Serviços disponíveis após o start:**
- API URL: `http://localhost:54321`
- Studio URL: `http://localhost:54323`
- Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`

### 3. Aplicar Migrations

As migrations estão em `supabase/migrations/`:

```bash
# Via script
./scripts/db-apply-migrations.sh

# Ou manualmente
supabase db push
```

**Migrations incluídas:**
1. `20251217000001_initial_schema.sql` - Tabelas principais
2. `20251217000002_rls_policies.sql` - Políticas de segurança

### 4. Gerar Tipos TypeScript

```bash
# Via script
./scripts/db-generate-types.sh

# Ou manualmente
supabase gen types typescript --local > src/types/database.ts
```

Isso cria o arquivo `src/types/database.ts` com todos os tipos do schema.

### 5. Aplicar Seeds (Opcional)

⚠️ **Importante**: Antes de aplicar seeds, você precisa criar um usuário de teste:

#### 5.1. Criar Usuário de Teste

1. Acesse o Supabase Studio: `http://localhost:54323`
2. Vá em **Authentication** → **Users**
3. Clique em **Add user**
4. Preencha:
   - Email: `demo@consultor.ai`
   - Password: `Demo@123456`
   - Confirm password: `Demo@123456`
5. Clique em **Create user**
6. **Copie o UUID do usuário** (será algo como `123e4567-e89b-12d3-a456-426614174000`)

#### 5.2. Atualizar Seed File

1. Abra `supabase/seed/dev_seed.sql`
2. Encontre a linha:
   ```sql
   user_id,
   '00000000-0000-0000-0000-000000000000'::UUID,  -- REPLACE with actual auth.users.id
   ```
3. Substitua `00000000-0000-0000-0000-000000000000` pelo UUID copiado
4. Salve o arquivo

#### 5.3. Aplicar Seeds

```bash
# Via script
./scripts/db-seed.sh

# Ou manualmente
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/seed/dev_seed.sql
```

**Dados criados:**
- ✅ 1 consultor demo
- ✅ 5 leads com diferentes status
- ✅ 1 fluxo padrão (Plano de Saúde)
- ✅ 2 conversas exemplo
- ✅ Mensagens de demonstração

---

## 🗂️ Estrutura do Banco

### Tabelas Principais

| Tabela | Descrição | Rows (dev) |
|--------|-----------|------------|
| `consultants` | Consultores/usuários da plataforma | 1 |
| `leads` | Leads (potenciais clientes) | 5 |
| `flows` | Fluxos de conversação (JSON) | 1 |
| `conversations` | Sessões de conversa ativas | 2 |
| `messages` | Mensagens individuais | ~10 |
| `ai_responses` | Logs de respostas da IA | 0 |
| `webhook_events` | Audit trail de webhooks | 0 |
| `audit_logs` | Logs LGPD | 0 |

### Tipos Customizados

```sql
lead_status: 'novo' | 'em_contato' | 'qualificado' | 'agendado' | 'fechado' | 'perdido'
conversation_status: 'active' | 'completed' | 'abandoned' | 'paused'
message_direction: 'inbound' | 'outbound'
message_status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
vertical_type: 'saude' | 'imoveis'
```

---

## 🔐 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Consultores só podem:

- ✅ Ver seus próprios dados
- ✅ Criar dados para si mesmos
- ✅ Atualizar seus próprios dados
- ✅ Deletar seus próprios dados

**Funções auxiliares:**
- `is_consultant_owner(consultant_id)` - Verifica ownership
- `current_consultant_id()` - Retorna ID do consultor atual

---

## 🧪 Testando o Setup

### 1. Verificar Tabelas

```bash
# Conectar ao banco
psql "postgresql://postgres:postgres@localhost:54322/postgres"

# Listar tabelas
\dt

# Ver schema de uma tabela
\d consultants

# Sair
\q
```

### 2. Query de Teste

```sql
-- Ver consultores
SELECT id, email, name, subscription_tier FROM consultants;

-- Ver leads
SELECT id, name, status, score FROM leads;

-- Ver conversas ativas
SELECT id, status, current_step_id, message_count
FROM conversations
WHERE status = 'active';
```

### 3. Testar RLS

```sql
-- Tentar acessar dados sem autenticação (deve retornar vazio)
SELECT * FROM leads;

-- Com RLS, precisa estar autenticado via Supabase Auth
```

---

## 🔄 Comandos Úteis

### Gerenciamento do Supabase

```bash
# Iniciar
supabase start

# Parar
supabase stop

# Reiniciar
supabase restart

# Status
supabase status

# Ver logs
supabase logs
```

### Migrations

```bash
# Criar nova migration
supabase migration new migration_name

# Aplicar migrations
supabase db push

# Ver diff (mudanças não aplicadas)
supabase db diff

# Resetar banco (⚠️ apaga tudo!)
supabase db reset
```

### Tipos TypeScript

```bash
# Gerar tipos
supabase gen types typescript --local > src/types/database.ts

# Ou usar o script
./scripts/db-generate-types.sh
```

---

## 📝 Próximos Passos

Após configurar o banco:

1. **Testar Login**
   - Email: `demo@consultor.ai`
   - Senha: `Demo@123456`

2. **Desenvolver Features**
   - [ ] Implementar authentication pages
   - [ ] Criar dashboard com dados reais
   - [ ] Implementar CRUD de leads

3. **Adicionar Mais Dados**
   - Editar `supabase/seed/dev_seed.sql`
   - Adicionar mais leads, flows, etc.
   - Re-aplicar: `./scripts/db-seed.sh`

---

## ❓ Troubleshooting

### Supabase não inicia

```bash
# Verificar Docker
docker ps

# Limpar containers antigos
supabase stop
docker system prune

# Tentar novamente
supabase start
```

### Migrations falhando

```bash
# Ver erro detalhado
supabase db push --debug

# Resetar e re-aplicar
supabase db reset
supabase db push
```

### Seeds falhando

**Erro: "user_id violates foreign key constraint"**
- Certifique-se de criar o usuário no Supabase Studio primeiro
- Atualize o UUID no arquivo de seed
- Re-aplique: `./scripts/db-seed.sh`

### RLS bloqueando queries

- RLS está funcionando corretamente!
- Você precisa estar autenticado via Supabase Auth
- Use o Supabase Client nos componentes React

---

## 🔗 Referências

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Database Design Document](../architecture/Database-Design-Document.md)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última Atualização**: 2025-12-17
**Versão**: 1.0.0
**Autor**: Consultor.AI Team
