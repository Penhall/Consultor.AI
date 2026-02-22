# Research: Script de Seed para Diagnóstico

**Date**: 2026-02-20
**Branch**: `003-diagnostic-seed-data`

## R1: Criação de auth.users

**Decision**: Usar script TypeScript com Supabase Admin SDK (`supabase.auth.admin.createUser`)

**Rationale**: A tabela `auth.users` do Supabase não permite INSERT direto via SQL padrão (requer bcrypt hash interno, gerenciamento de JWT, e campos internos do GoTrueAuth). O Admin SDK encapsula tudo isso e garante registros válidos.

**Alternatives considered**:
- SQL puro com INSERT em `auth.users` + `auth.identities`: funciona apenas em Supabase local, frágil a mudanças internas do schema auth, requer conhecimento do hash bcrypt
- Script SQL + criação manual via Dashboard: não é automatizável, quebra idempotência
- **Escolhido**: TypeScript seed runner que cria auth users via SDK e dados via SQL/Supabase client

## R2: Idempotência

**Decision**: Usar UUIDs determinísticos (v5 namespace-based) + `ON CONFLICT DO NOTHING`

**Rationale**: O padrão existente no projeto (`dev_seed.sql`) já usa `ON CONFLICT DO NOTHING`. Para IDs determinísticos, UUIDs v5 permitem gerar o mesmo ID a partir da mesma string seed em qualquer execução.

**Alternatives considered**:
- `gen_random_uuid()` com `ON CONFLICT (email/whatsapp)`: IDs mudam a cada execução, dificulta referência cruzada
- IDs hardcoded: frágil, conflita com `uuid_generate_v4()` defaults
- **Escolhido**: UUIDs v5 com namespace fixo para auth.users e consultants; para leads/conversations/messages, usar lookup por email/whatsapp após criação

## R3: Trava de Produção

**Decision**: Verificar `SUPABASE_URL` contra padrão local (`localhost`, `127.0.0.1`, `host.docker.internal`)

**Rationale**: O script roda localmente via `npx tsx`. Se `SUPABASE_URL` não contém hostname local, aborta com mensagem clara.

**Alternatives considered**:
- Variável `SEED_ENABLED=true`: fácil de esquecer de desligar
- Hostname check: `supabase.co` presente = produção
- **Escolhido**: Dual check - rejeita se URL contém `.supabase.co` OU não contém `localhost/127.0.0.1`

## R4: Estrutura do Script

**Decision**: Um único arquivo TypeScript (`scripts/seed-diagnostic.ts`) executável via `npx tsx`

**Rationale**: O projeto já tem `scripts/` no root. Um único arquivo evita coordenação entre partes. TypeScript permite type-safety e acesso ao Supabase SDK.

**Alternatives considered**:
- Múltiplos SQL files (01_users.sql, 02_leads.sql...): mais SQL-purista mas não resolve auth.users
- Arquivo `.mjs` com fetch API: mais leve mas perde tipagem
- **Escolhido**: TypeScript com `@supabase/supabase-js` (já é dependência do projeto)

## R5: Dados Brasileiros

**Decision**: Arrays estáticos de nomes, sobrenomes, cidades e DDDs brasileiros hardcoded no script

**Rationale**: 75 leads + 6 consultores = ~80 nomes únicos necessários. Bibliotecas de faker são overhead para dados estáticos de seed. Arrays simples são mais previsíveis e determinísticos.

**Alternatives considered**:
- `@faker-js/faker` com locale pt_BR: adiciona dependência, resultados variam entre execuções
- Arquivo JSON separado com dados: overhead de I/O desnecessário
- **Escolhido**: Arrays inline com ~40 nomes + 30 sobrenomes brasileiros comuns, 10 DDDs de capitais

## R6: Flow ID Reference

**Decision**: Buscar o flow padrão de saúde por `WHERE is_default = true AND vertical = 'saude'` no momento da execução

**Rationale**: O flow é criado por `01_default_flows.sql` com `gen_random_uuid()`, então o ID é dinâmico. O script deve fazer SELECT para obter o ID real.

**Alternatives considered**:
- Criar um flow com ID fixo: conflita com o seed existente
- Usar o flow do `dev_seed.sql`: tem nome diferente, pode não existir
- **Escolhido**: Lookup dinâmico com fallback para criação se não existir
