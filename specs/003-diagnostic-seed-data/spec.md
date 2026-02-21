# Feature Specification: Script de Seed para Diagnóstico

**Feature Branch**: `003-diagnostic-seed-data`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "Criar um script de seed completo para popular o banco de dados do Consultor.AI com dados fictícios brasileiros para fins de diagnóstico e depuração."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seed de Infraestrutura Base (Priority: P1)

Como desenvolvedor, preciso popular o banco com a conta admin e os 5 consultores em planos distintos para que o sistema tenha a hierarquia multi-tenant completa e funcional.

**Why this priority**: Sem usuários autenticados no banco, nenhuma outra entidade pode ser criada (todas dependem de `consultant_id` via FK). Este é o alicerce de todo o seed.

**Independent Test**: Após rodar o script, é possível fazer login como qualquer um dos 6 usuários (1 admin + 5 consultores) e verificar que cada um vê apenas seus próprios dados no dashboard. O admin deve ter acesso ao painel `/admin`.

**Acceptance Scenarios**:

1. **Given** banco de dados vazio (apenas schema), **When** o script de seed é executado, **Then** existem exatamente 6 registros em `auth.users` e 6 registros em `consultants`, sendo 1 com `is_admin = true`.
2. **Given** os 5 consultores criados, **When** consulto a tabela `consultants`, **Then** há pelo menos 1 consultor em cada plano (freemium, pro, agencia) com créditos e limites corretos para o plano.
3. **Given** o script já foi executado uma vez, **When** executo novamente, **Then** nenhum registro é duplicado (idempotência via `ON CONFLICT`).

---

### User Story 2 - Seed de Leads com Distribuição Realista (Priority: P1)

Como desenvolvedor, preciso de 15 leads por consultor (75 total) distribuídos nos 6 estágios do funil (`novo`, `em_contato`, `qualificado`, `agendado`, `fechado`, `perdido`) para validar filtros, analytics e dashboards.

**Why this priority**: Leads são a entidade central do sistema. Sem leads distribuídos nos diferentes status, é impossível testar analytics, filtros de listagem, exportação CSV e cálculo de scores.

**Independent Test**: Após rodar o script, acessar o dashboard de cada consultor e verificar que o gráfico de distribuição por status mostra barras em todos os estágios. A exportação CSV deve retornar 15 registros por consultor.

**Acceptance Scenarios**:

1. **Given** os 5 consultores existem, **When** o script de seed é executado, **Then** cada consultor possui exatamente 15 leads com números WhatsApp brasileiros válidos (formato `+55XXXXXXXXXXX`).
2. **Given** os 75 leads criados, **When** agrupo por status, **Then** todos os 6 valores do enum `lead_status` estão representados (pelo menos 1 lead em cada status por consultor).
3. **Given** os leads criados, **When** verifico os campos `metadata`, **Then** cada lead possui dados de perfil (`perfil`, `faixa_etaria`, `coparticipacao`) coerentes com o vertical saúde.
4. **Given** os leads criados, **When** verifico os scores, **Then** leads `fechado` e `qualificado` têm scores mais altos (60-100) e leads `novo` e `perdido` têm scores mais baixos (0-40).

---

### User Story 3 - Seed de Conversas e Mensagens (Priority: P2)

Como desenvolvedor, preciso de 2 conversas por lead (150 total) com mensagens associadas para testar o histórico de interações, o flow engine e a interface de conversas.

**Why this priority**: Conversas e mensagens validam o flow engine, o histórico de interações e a contagem de mensagens por conversa. Sem elas, metade das telas do dashboard ficam vazias.

**Independent Test**: Após rodar o script, acessar a tela de detalhe de qualquer lead e verificar que aparecem 2 conversas com mensagens (inbound e outbound) listadas cronologicamente.

**Acceptance Scenarios**:

1. **Given** os 75 leads existem, **When** o script de seed é executado, **Then** cada lead possui exatamente 2 conversas na tabela `conversations`.
2. **Given** as 150 conversas criadas, **When** verifico cada uma, **Then** possui pelo menos 3 mensagens (mix de `inbound` e `outbound`) e `message_count` é consistente.
3. **Given** as conversas criadas, **When** verifico os status, **Then** a primeira conversa está `completed` (fluxo finalizado) e a segunda varia entre `active`, `completed` e `abandoned`.
4. **Given** as mensagens criadas, **When** verifico o conteúdo, **Then** as mensagens inbound contêm respostas plausíveis em português e as outbound contêm perguntas do fluxo de qualificação.

---

### User Story 4 - Seed de Follow-ups e Templates (Priority: P3)

Como desenvolvedor, preciso de follow-ups agendados e templates de mensagem para testar a tela de follow-ups e a funcionalidade de templates reutilizáveis.

**Why this priority**: Follow-ups e templates são funcionalidades secundárias. Ter dados de seed para eles permite testar as telas completas mas não bloqueia o diagnóstico principal.

**Independent Test**: Após rodar o script, acessar a tela de follow-ups de um lead e verificar que existem follow-ups em diferentes status. Na tela de templates, verificar que há templates em diferentes categorias.

**Acceptance Scenarios**:

1. **Given** os 75 leads existem, **When** o script é executado, **Then** pelo menos 30 leads possuem 1 follow-up cada, distribuídos entre `pending`, `sent`, `completed` e `cancelled`.
2. **Given** os 5 consultores existem, **When** o script é executado, **Then** cada consultor possui pelo menos 3 message templates em categorias distintas (`greeting`, `follow_up`, `qualification`).

---

### Edge Cases

- O que acontece se o script for executado em um banco que já contém dados de produção? O script deve usar `ON CONFLICT DO NOTHING` ou IDs determinísticos para evitar colisão.
- O que acontece se um dos `auth.users` já existir com o email de seed? O script deve detectar e pular a criação sem erro.
- O que acontece se o schema de migrations não estiver atualizado? O script deve falhar com mensagem clara indicando dependência de migrations.
- O que acontece se executado contra Supabase remoto acidentalmente? O script deve incluir uma verificação de segurança (ex: checar variável de ambiente ou hostname) para prevenir execução em produção.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O script DEVE criar 6 usuários em `auth.users` com emails e senhas previsíveis para login manual (formato `consultor1@seed.local`, senha `seed123456`).
- **FR-002**: O script DEVE criar 6 registros em `consultants` vinculados aos `auth.users`, com dados brasileiros realistas (nomes, telefones no formato `+55XXXXXXXXXXX`, cidades).
- **FR-003**: O script DEVE distribuir os 5 consultores nos planos: 2 freemium, 2 pro, 1 agência, com créditos e `monthly_credits_allocation` corretos para cada plano.
- **FR-004**: O script DEVE marcar exatamente 1 consultor como `is_admin = true` (a conta admin do sistema).
- **FR-005**: O script DEVE criar 15 leads por consultor (75 total) com números WhatsApp brasileiros únicos, nomes brasileiros, e distribuição entre todos os 6 valores de `lead_status`.
- **FR-006**: O script DEVE preencher o campo `metadata` (JSONB) de cada lead com dados coerentes: `perfil` (individual/casal/familia/empresarial), `faixa_etaria` (ate_30/31_45/46_60/acima_60), `coparticipacao` (sim/nao).
- **FR-007**: O script DEVE atribuir scores (0-100) coerentes com o status do lead: scores altos para `qualificado`/`fechado`, médios para `agendado`/`em_contato`, baixos para `novo`/`perdido`.
- **FR-008**: O script DEVE criar 2 conversas por lead (150 total), vinculadas ao fluxo padrão de saúde, com status variados (`completed`, `active`, `abandoned`).
- **FR-009**: O script DEVE criar pelo menos 3 mensagens por conversa (450+ total) alternando `inbound` e `outbound`, com conteúdo em português brasileiro plausível para o fluxo de qualificação de planos de saúde.
- **FR-010**: O script DEVE ser idempotente: execuções repetidas não devem criar registros duplicados nem gerar erros.
- **FR-011**: O script DEVE usar IDs determinísticos (UUIDs gerados a partir de seeds fixos) para que os mesmos registros sejam referenciáveis entre execuções.
- **FR-012**: O script DEVE respeitar todas as constraints do banco (FKs, UNIQUEs, CHECKs) e não exigir desabilitação de RLS ou triggers.
- **FR-013**: O script DEVE criar pelo menos 30 follow-ups distribuídos entre os leads, com status variados e datas `scheduled_at` no futuro e no passado.
- **FR-014**: O script DEVE criar pelo menos 3 message templates por consultor (15 total) em categorias distintas.
- **FR-015**: O script NÃO DEVE alterar nenhuma migration, criar novas tabelas, ou modificar o schema existente.
- **FR-016**: O script DEVE incluir uma trava de segurança que impeça execução acidental em ambiente de produção.

### Key Entities

- **Usuário Auth (auth.users)**: Registro de autenticação com email e senha. 6 registros (1 admin + 5 consultores).
- **Consultor (consultants)**: Profissional de vendas vinculado 1:1 ao auth.users. Contém plano, créditos, flag admin. 6 registros.
- **Lead (leads)**: Cliente potencial de um consultor. Contém WhatsApp, status no funil, score, metadata de qualificação. 75 registros (15 por consultor).
- **Conversa (conversations)**: Sessão de chat entre bot e lead, vinculada a um fluxo. Contém estado, step atual, progresso. 150 registros (2 por lead).
- **Mensagem (messages)**: Mensagem individual dentro de uma conversa (inbound ou outbound). 450+ registros (3+ por conversa).
- **Follow-up (follow_ups)**: Lembrete agendado para um lead. 30+ registros distribuídos entre leads.
- **Template (message_templates)**: Modelo de mensagem reutilizável por consultor. 15+ registros (3+ por consultor).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O script completa a execução em menos de 30 segundos em um banco local.
- **SC-002**: Após execução, o dashboard de cada consultor exibe dados em todos os widgets (contadores, gráficos, tabelas) sem estados vazios.
- **SC-003**: O painel admin (`/admin`) mostra métricas agregadas: 6 usuários totais, distribuição de planos, e leads por status.
- **SC-004**: A exportação CSV de leads retorna exatamente 15 registros por consultor com todos os campos preenchidos.
- **SC-005**: A tela de detalhe de qualquer lead exibe 2 conversas com histórico de mensagens visível.
- **SC-006**: Executar o script 3 vezes consecutivas resulta no mesmo estado final do banco (idempotência verificável).
- **SC-007**: Nenhum consultor consegue visualizar leads de outro consultor ao navegar pelo dashboard (isolamento multi-tenant).
- **SC-008**: Todos os 6 usuários de seed conseguem fazer login com suas credenciais e acessar o sistema conforme seu papel (admin vs consultor).

## Assumptions

- O banco de dados já possui todas as migrations aplicadas (schema completo conforme `supabase/migrations/`).
- O fluxo padrão de saúde (`is_default = true`, `vertical = 'saude'`) já existe via seed existente (`01_default_flows.sql`).
- O script será executado localmente via Supabase CLI (`supabase db reset` ou `psql`) e não em produção.
- CPFs serão gerados no formato correto (`XXX.XXX.XXX-XX`) mas não precisam passar validação de dígito verificador (são fictícios).
- Números WhatsApp usam DDDs reais de capitais brasileiras (11-SP, 21-RJ, 31-BH, 41-CWB, 51-POA, 61-BSB, 71-SSA, 81-REC, 85-FOR, 91-BEL).

## Scope Boundaries

### In Scope

- Criação de usuários auth, consultores, leads, conversas, mensagens, follow-ups e templates
- Dados fictícios brasileiros realistas
- Script SQL puro (compatível com PostgreSQL)
- Idempotência completa
- Trava contra execução em produção

### Out of Scope

- Seed de `crm_integrations` e `crm_sync_logs` (requerem tokens de API reais)
- Seed de `files` (requerem upload real ao Storage)
- Seed de `daily_stats` e `page_view_sources` (calculados automaticamente via pg_cron)
- Seed de `webhook_events` e `audit_logs` (gerados automaticamente pelo sistema)
- Criação de novos fluxos (usa o fluxo padrão de saúde já existente)
- Qualquer alteração de schema/migrations
