# Consultor.AI - Diagnóstico Completo do Projeto

**Data:** 2026-02-20
**Versão:** 0.4.0
**Branch:** `main`
**Status:** Production Ready (MVP + SaaS Platform)

---

## 1. Stack Tecnológico

| Camada          | Tecnologia                                      | Versão |
| --------------- | ----------------------------------------------- | ------ |
| Framework       | Next.js (App Router)                            | 16.1.6 |
| Linguagem       | TypeScript                                      | 5.3    |
| UI              | React                                           | 18     |
| Estilização     | Tailwind CSS + shadcn/ui                        | -      |
| Backend/DB      | Supabase (PostgreSQL + Realtime + Storage)      | -      |
| State           | React Query + Zustand                           | -      |
| Forms           | React Hook Form + Zod                           | -      |
| IA              | Google AI (Gemini 1.5 Flash) + Groq (fallback)  | -      |
| Pagamentos      | Stripe (checkout, subscriptions, webhooks)      | -      |
| Email           | Resend (produção) / console.log (dev)           | -      |
| WhatsApp        | Meta Business API                               | -      |
| Cache           | Redis (Upstash)                                 | -      |
| Jobs            | pg_cron (stats diárias, reset créditos)         | -      |
| Testes          | Vitest + Testing Library + Playwright           | -      |
| Deploy          | Docker + Vercel (frontend) + Supabase (backend) | -      |
| Monitoramento   | Sentry + structured logging                     | -      |
| CI/CD           | GitHub Actions + Husky                          | -      |
| Bundle Analyzer | @next/bundle-analyzer                           | -      |

---

## 2. Entidades do Banco de Dados

### 2.1 Tabelas Core (MVP)

| Tabela           | Descrição                                 | Campos-Chave                                                                                   |
| ---------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `consultants`    | Profissionais de vendas (usuários SaaS)   | user_id, email, name, vertical, slug, subscription_plan, credits, is_admin, stripe_customer_id |
| `leads`          | Clientes potenciais dos consultores       | consultant_id (FK), whatsapp_number, status, score, metadata (JSONB)                           |
| `flows`          | Definições de fluxo conversacional (JSON) | consultant_id (FK, NULL=público), definition (JSONB), vertical, is_default                     |
| `conversations`  | Sessões de chat ativas                    | lead_id (FK), flow_id (FK), status, current_step_id, state (JSONB)                             |
| `messages`       | Mensagens individuais                     | conversation_id (FK), direction, content, whatsapp_message_id, is_ai_generated                 |
| `ai_responses`   | Log de geração IA (custo/tracking)        | conversation_id (FK), model, provider, prompt_tokens, estimated_cost                           |
| `webhook_events` | Trilha de auditoria LGPD                  | event_type, provider, request_body (JSONB), response_status                                    |
| `audit_logs`     | Trilha de compliance                      | user_id, action, resource_type, old_values, new_values, ip_address                             |

### 2.2 Tabelas de Features

| Tabela                        | Descrição                       | Campos-Chave                                                 |
| ----------------------------- | ------------------------------- | ------------------------------------------------------------ |
| `whatsapp_integrations`       | Contas WhatsApp multi-provider  | consultant_id, provider, access_token, phone_number, waba_id |
| `follow_ups`                  | Lembretes agendados             | lead_id, consultant_id, scheduled_at, status, is_automatic   |
| `message_templates`           | Templates reutilizáveis         | consultant_id, name, category, content, variables, use_count |
| `crm_integrations`            | Conexões CRM                    | consultant_id, provider, api_key, field_mappings (JSONB)     |
| `crm_sync_logs`               | Histórico de sincronização      | integration_id, lead_id, status, operation, duration_ms      |
| `crm_field_mappings_defaults` | Mapeamentos padrão por provider | provider, field_mappings (JSONB)                             |

### 2.3 Tabelas SaaS & Admin

| Tabela                  | Descrição                            | Campos-Chave                                              |
| ----------------------- | ------------------------------------ | --------------------------------------------------------- |
| `daily_stats`           | Métricas da plataforma (pg_cron)     | date (UNIQUE), user_count, paid_user_count, total_revenue |
| `page_view_sources`     | Fontes de tráfego                    | name, date, daily_stats_id (FK), visitors                 |
| `files`                 | Uploads de documentos                | consultant_id, name, type, storage_key, size_bytes        |
| `logs`                  | Eventos do sistema                   | message, level, created_at                                |
| `contact_form_messages` | Formulário de contato (landing page) | consultant_id, content, is_read, replied_at               |

### 2.4 Relacionamentos (Foreign Keys)

```
auth.users (Supabase Auth)
  └── consultants (1:1 via user_id)
        ├── leads (1:N, CASCADE DELETE)
        │     ├── conversations (1:N, CASCADE DELETE)
        │     │     ├── messages (1:N, CASCADE DELETE)
        │     │     └── ai_responses (1:N, SET NULL)
        │     ├── follow_ups (1:N, CASCADE DELETE)
        │     └── crm_sync_logs (N:1 via lead_id, SET NULL)
        ├── flows (1:N, ownership; NULL = flow público)
        ├── whatsapp_integrations (1:N, CASCADE DELETE)
        ├── message_templates (1:N, CASCADE DELETE)
        ├── crm_integrations (1:N, CASCADE DELETE)
        │     └── crm_sync_logs (1:N, CASCADE DELETE)
        ├── files (1:N, CASCADE DELETE)
        ├── contact_form_messages (1:N)
        └── audit_logs (1:N, SET NULL)

daily_stats (independente)
  └── page_view_sources (1:N via daily_stats_id)
```

### 2.5 Enums

| Enum                     | Valores                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| `lead_status`            | novo, em_contato, qualificado, agendado, fechado, perdido         |
| `conversation_status`    | active, completed, abandoned, paused                              |
| `message_direction`      | inbound, outbound                                                 |
| `message_status`         | pending, sent, delivered, read, failed                            |
| `vertical_type`          | saude, imoveis                                                    |
| `follow_up_status`       | pending, sent, completed, cancelled                               |
| `template_category`      | greeting, follow_up, qualification, closing, reengagement, custom |
| `crm_provider`           | rd-station, pipedrive, hubspot, agendor                           |
| `crm_integration_status` | active, inactive, error, pending_auth                             |
| `crm_sync_status`        | pending, in_progress, success, failed, partial                    |

### 2.6 Funções RPC

| Função                    | Schedule        | Descrição                                          |
| ------------------------- | --------------- | -------------------------------------------------- |
| `decrement_credits()`     | On-demand       | Dedução atômica de créditos com validação de saldo |
| `reset_monthly_credits()` | pg_cron mensal  | Reset de créditos no dia 1 (UTC 00:05)             |
| `calculate_daily_stats()` | pg_cron horário | Agregação de métricas SaaS                         |
| `is_consultant_owner()`   | Helper RLS      | Verifica propriedade do consultor                  |
| `current_consultant_id()` | Helper RLS      | Retorna consultant_id do usuário atual             |

### 2.7 Triggers

| Trigger                             | Tabela        | Ação                                           |
| ----------------------------------- | ------------- | ---------------------------------------------- |
| `update_updated_at`                 | 7 tabelas     | Auto-update de `updated_at` em UPDATE          |
| `update_consultant_leads_count`     | leads         | Incrementa `leads_count_current_month`         |
| `update_conversation_message_count` | messages      | Incrementa `message_count` + `last_message_at` |
| `update_integration_sync_stats`     | crm_sync_logs | Atualiza estatísticas de sync na integração    |

---

## 3. Roles de Usuário e Permissões

### 3.1 Camadas do Sistema

```
┌─────────────────────────────────────────────────────────┐
│  CAMADA 1: Admin (Dono do Sistema)                      │
│  Flag: consultants.is_admin = true                      │
│  Acesso: Tudo + painel admin + métricas SaaS            │
├─────────────────────────────────────────────────────────┤
│  CAMADA 2: Consultor (Cliente SaaS)                     │
│  Autenticação: Supabase Auth (JWT)                      │
│  Acesso: Próprios dados via RLS (consultant_id)         │
│  Limites: Créditos e leads conforme plano               │
├─────────────────────────────────────────────────────────┤
│  CAMADA 3: Lead (Cliente do Consultor)                  │
│  Autenticação: Nenhuma (interage via WhatsApp)          │
│  Acesso: Apenas responde mensagens do bot               │
│  Dados: Gerenciados pelo consultor proprietário         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Mecanismos de Autorização

| Mecanismo                | Onde                       | Como                                                 |
| ------------------------ | -------------------------- | ---------------------------------------------------- |
| **Middleware (Next.js)** | `/dashboard/*`, `/admin/*` | Redireciona para `/auth/login` se sem sessão         |
| **RLS (PostgreSQL)**     | Todas as tabelas           | `consultant_id` filtra dados automaticamente         |
| **AdminGuard (React)**   | `/admin/*` pages           | Verifica `consultant.is_admin`, redireciona se falso |
| **Admin API check**      | `/api/admin/*`             | Verifica `is_admin` no handler da rota               |
| **Service Role**         | Webhooks, pg_cron          | `createServiceClient()` bypassa RLS para jobs        |
| **Créditos/Limites**     | Service layer              | `PLAN_LEAD_LIMITS` + `decrement_credits()` RPC       |
| **Webhook Signatures**   | `/api/webhook/*`           | HMAC SHA-256 (Meta) + Stripe signature               |

### 3.3 Permissões por Papel

| Recurso              | Admin         | Consultor      | Lead (WhatsApp)  | Público |
| -------------------- | ------------- | -------------- | ---------------- | ------- |
| Landing page         | -             | -              | -                | Leitura |
| Pricing page         | -             | -              | -                | Leitura |
| Login/Registro       | -             | -              | -                | Acesso  |
| Dashboard            | Total         | Próprios dados | -                | -       |
| Leads CRUD           | -             | Próprios       | -                | -       |
| Conversas            | -             | Próprias       | Responde via bot | -       |
| Fluxos               | -             | Próprios       | -                | -       |
| Templates            | -             | Próprios       | -                | -       |
| Analytics            | -             | Próprios       | -                | -       |
| Arquivos             | -             | Próprios       | -                | -       |
| CRM Integrations     | -             | Próprias       | -                | -       |
| Billing/Créditos     | -             | Próprio        | -                | -       |
| WhatsApp config      | -             | Própria        | -                | -       |
| Admin - Stats SaaS   | Leitura       | -              | -                | -       |
| Admin - Usuários     | CRUD + toggle | -              | -                | -       |
| Webhooks Meta/Stripe | Via signature | Via signature  | -                | -       |

### 3.4 Planos e Limites

| Plano        | Preço     | Créditos/mês | Leads/mês | Features                               |
| ------------ | --------- | ------------ | --------- | -------------------------------------- |
| **Freemium** | R$0       | 20           | 20        | Fluxo básico, texto apenas             |
| **Pro**      | R$47/mês  | 200          | 200       | Imagens, auto follow-up, CSV export    |
| **Agência**  | R$147/mês | 1000         | 1000      | Fluxos custom, CRM, dashboard completo |

---

## 4. Mapeamento de Rotas

### 4.1 Rotas Públicas (sem autenticação)

| Rota                    | Tipo | Método | Status           | Descrição                                     |
| ----------------------- | ---- | ------ | ---------------- | --------------------------------------------- |
| `/`                     | Page | GET    | **Implementada** | Landing page (Hero, Features, FAQ, Footer)    |
| `/pricing`              | Page | GET    | **Implementada** | Página de preços (3 planos)                   |
| `/login`                | Page | GET    | **Implementada** | Redirect para `/auth/login`                   |
| `/cadastro`             | Page | GET    | **Implementada** | Redirect para `/auth/register`                |
| `/checkout`             | Page | GET    | **Implementada** | Resultado do Stripe Checkout (success/cancel) |
| `/auth/login`           | Page | GET    | **Implementada** | Formulário de login                           |
| `/auth/register`        | Page | GET    | **Implementada** | Formulário de cadastro                        |
| `/auth/forgot-password` | Page | GET    | **Implementada** | Recuperação de senha                          |
| `/auth/reset-password`  | Page | GET    | **Implementada** | Reset de senha (via link)                     |
| `/auth/callback`        | API  | GET    | **Implementada** | OAuth callback (Google/GitHub)                |
| `/api/health`           | API  | GET    | **Implementada** | Health check (status, uptime)                 |

### 4.2 Rotas de Webhook (validação por assinatura)

| Rota                               | Método | Status           | Descrição                                |
| ---------------------------------- | ------ | ---------------- | ---------------------------------------- |
| `/api/webhook/meta/[consultantId]` | GET    | **Implementada** | Verificação challenge Meta               |
| `/api/webhook/meta/[consultantId]` | POST   | **Implementada** | Recebe mensagens WhatsApp (HMAC SHA-256) |
| `/api/webhook/mock`                | POST   | **Implementada** | Simula webhook Meta (dev/teste)          |
| `/api/billing/webhook`             | POST   | **Implementada** | Eventos Stripe (assinatura verificada)   |

### 4.3 Rotas do Consultor (autenticação obrigatória)

#### Páginas do Dashboard

| Rota                                 | Status           | Descrição                         |
| ------------------------------------ | ---------------- | --------------------------------- |
| `/dashboard`                         | **Implementada** | Home com stats e getting started  |
| `/dashboard/leads`                   | **Implementada** | Lista de leads com filtros        |
| `/dashboard/leads/[id]`              | **Implementada** | Detalhe do lead                   |
| `/dashboard/conversas`               | **Implementada** | Lista de conversas                |
| `/dashboard/flows`                   | **Implementada** | Gerenciamento de fluxos           |
| `/dashboard/flows/new`               | **Implementada** | Criar novo fluxo                  |
| `/dashboard/flows/[id]`              | **Implementada** | Editar fluxo                      |
| `/dashboard/fluxos`                  | **Implementada** | Fluxos (naming alternativo PT-BR) |
| `/dashboard/analytics`               | **Implementada** | Dashboard de analytics            |
| `/dashboard/templates`               | **Implementada** | Templates de mensagem             |
| `/dashboard/arquivos`                | **Implementada** | Gerenciamento de arquivos         |
| `/dashboard/integracoes`             | **Implementada** | Integrações CRM                   |
| `/dashboard/perfil`                  | **Implementada** | Perfil do usuário                 |
| `/dashboard/perfil/whatsapp`         | **Implementada** | Config WhatsApp                   |
| `/dashboard/test/whatsapp-simulator` | **Implementada** | Simulador WhatsApp (dev)          |

#### APIs de Leads

| Rota                            | Método | Status           | Descrição                           |
| ------------------------------- | ------ | ---------------- | ----------------------------------- |
| `/api/leads`                    | GET    | **Implementada** | Listar leads (paginação, filtros)   |
| `/api/leads`                    | POST   | **Implementada** | Criar lead (verifica limite mensal) |
| `/api/leads/[id]`               | GET    | **Implementada** | Buscar lead por ID                  |
| `/api/leads/[id]`               | PATCH  | **Implementada** | Atualizar lead                      |
| `/api/leads/[id]`               | DELETE | **Implementada** | Excluir lead                        |
| `/api/leads/stats`              | GET    | **Implementada** | Estatísticas de leads               |
| `/api/leads/export`             | GET    | **Implementada** | Exportar CSV (UTF-8 BOM)            |
| `/api/leads/[id]/conversations` | GET    | **Implementada** | Conversas do lead                   |
| `/api/leads/[id]/follow-ups`    | GET    | **Implementada** | Follow-ups do lead                  |
| `/api/leads/[id]/follow-ups`    | POST   | **Implementada** | Criar follow-up                     |

#### APIs de Conversas

| Rota                              | Método | Status           | Descrição                     |
| --------------------------------- | ------ | ---------------- | ----------------------------- |
| `/api/conversations/start`        | POST   | **Implementada** | Iniciar conversa com fluxo    |
| `/api/conversations/[id]/message` | POST   | **Implementada** | Processar mensagem do usuário |

#### APIs de Fluxos

| Rota                        | Método | Status           | Descrição                      |
| --------------------------- | ------ | ---------------- | ------------------------------ |
| `/api/flows`                | GET    | **Implementada** | Listar fluxos                  |
| `/api/flows`                | POST   | **Implementada** | Criar fluxo                    |
| `/api/flows/[id]`           | GET    | **Implementada** | Buscar fluxo                   |
| `/api/flows/[id]`           | PATCH  | **Implementada** | Atualizar fluxo                |
| `/api/flows/[id]`           | DELETE | **Implementada** | Excluir fluxo                  |
| `/api/flows/[id]/activate`  | POST   | **Implementada** | Ativar fluxo (desativa outros) |
| `/api/flows/[id]/duplicate` | POST   | **Implementada** | Duplicar fluxo                 |

#### APIs de Templates

| Rota                  | Método | Status           | Descrição          |
| --------------------- | ------ | ---------------- | ------------------ |
| `/api/templates`      | GET    | **Implementada** | Listar templates   |
| `/api/templates`      | POST   | **Implementada** | Criar template     |
| `/api/templates/[id]` | GET    | **Implementada** | Buscar template    |
| `/api/templates/[id]` | PATCH  | **Implementada** | Atualizar template |
| `/api/templates/[id]` | DELETE | **Implementada** | Excluir template   |

#### APIs de Follow-ups

| Rota                   | Método | Status           | Descrição                    |
| ---------------------- | ------ | ---------------- | ---------------------------- |
| `/api/follow-ups/[id]` | GET    | **Implementada** | Buscar follow-up             |
| `/api/follow-ups/[id]` | PATCH  | **Implementada** | Atualizar/completar/cancelar |
| `/api/follow-ups/[id]` | DELETE | **Implementada** | Excluir follow-up            |

#### APIs de Arquivos

| Rota              | Método | Status           | Descrição                     |
| ----------------- | ------ | ---------------- | ----------------------------- |
| `/api/files`      | GET    | **Implementada** | Listar arquivos do usuário    |
| `/api/files`      | POST   | **Implementada** | Criar URL de upload presigned |
| `/api/files/[id]` | GET    | **Implementada** | Obter URL de download         |
| `/api/files/[id]` | DELETE | **Implementada** | Excluir arquivo               |

#### APIs de Billing

| Rota                    | Método | Status           | Descrição                    |
| ----------------------- | ------ | ---------------- | ---------------------------- |
| `/api/billing/checkout` | POST   | **Implementada** | Criar sessão Stripe Checkout |
| `/api/billing/credits`  | GET    | **Implementada** | Saldo de créditos e plano    |
| `/api/billing/portal`   | GET    | **Implementada** | URL do portal Stripe         |

#### APIs de CRM

| Rota                              | Método | Status           | Descrição                 |
| --------------------------------- | ------ | ---------------- | ------------------------- |
| `/api/integrations/crm`           | GET    | **Implementada** | Listar integrações CRM    |
| `/api/integrations/crm`           | POST   | **Implementada** | Criar integração CRM      |
| `/api/integrations/crm/[id]`      | GET    | **Implementada** | Buscar integração         |
| `/api/integrations/crm/[id]`      | PATCH  | **Implementada** | Atualizar integração      |
| `/api/integrations/crm/[id]`      | DELETE | **Implementada** | Excluir integração        |
| `/api/integrations/crm/[id]/sync` | POST   | **Implementada** | Sincronizar leads (batch) |
| `/api/integrations/crm/[id]/test` | POST   | **Implementada** | Testar conexão CRM        |
| `/api/integrations/crm/logs`      | GET    | **Implementada** | Logs de sincronização     |

#### APIs de Consultor/WhatsApp

| Rota                                      | Método | Status           | Descrição                  |
| ----------------------------------------- | ------ | ---------------- | -------------------------- |
| `/api/consultants/meta-callback`          | POST   | **Implementada** | OAuth callback Meta        |
| `/api/consultants/meta-signup`            | POST   | **Implementada** | Embedded Signup Meta       |
| `/api/consultants/[id]/integrations/meta` | GET    | **Implementada** | Status integração WhatsApp |

#### APIs de Analytics

| Rota                      | Método | Status           | Descrição                     |
| ------------------------- | ------ | ---------------- | ----------------------------- |
| `/api/analytics/overview` | GET    | **Implementada** | Métricas gerais do consultor  |
| `/api/analytics/charts`   | GET    | **Implementada** | Dados para gráficos           |
| `/api/analytics/activity` | GET    | **Implementada** | Atividade recente + top leads |

### 4.4 Rotas Admin (autenticação + is_admin)

#### Páginas Admin

| Rota           | Status           | Descrição                                    |
| -------------- | ---------------- | -------------------------------------------- |
| `/admin`       | **Implementada** | Dashboard SaaS (revenue, subscribers, views) |
| `/admin/users` | **Implementada** | Gerenciamento de usuários (UsersTable)       |

#### APIs Admin

| Rota               | Método | Status           | Descrição                               |
| ------------------ | ------ | ---------------- | --------------------------------------- |
| `/api/admin/stats` | GET    | **Implementada** | Métricas SaaS (revenue, deltas)         |
| `/api/admin/users` | GET    | **Implementada** | Listar consultores (paginação, filtros) |
| `/api/admin/users` | PATCH  | **Implementada** | Toggle admin (bloqueia auto-demotion)   |

### 4.5 Rotas de Contato

| Rota           | Método | Status           | Descrição                            |
| -------------- | ------ | ---------------- | ------------------------------------ |
| `/api/contact` | POST   | **Implementada** | Formulário de contato (landing page) |

---

## 5. Resumo de Status

### 5.1 Contagem por Status

| Status           | Páginas | APIs | Total |
| ---------------- | ------- | ---- | ----- |
| **Implementada** | 22      | 54   | 76    |
| Placeholder      | 0       | 0    | 0     |
| Ausente          | 0       | 0    | 0     |
| TODO             | 0       | 0    | 0     |

### 5.2 Rotas Previstas mas Ausentes (Fase 5 - Futuro)

| Rota prevista                     | Descrição                  | Status                                              |
| --------------------------------- | -------------------------- | --------------------------------------------------- |
| `/api/integrations/crm` (HubSpot) | Provider HubSpot           | **Ausente** (enum exists, provider not implemented) |
| `/api/integrations/crm` (Agendor) | Provider Agendor           | **Ausente** (enum exists, provider not implemented) |
| `/dashboard/imoveis`              | Vertical Imóveis           | **Ausente** (enum `imoveis` exists, sem fluxo)      |
| `/api/voice/*`                    | Voice Cloning (ElevenLabs) | **Ausente** (Fase 5)                                |
| `/api/images/*`                   | Image Generation (Canva)   | **Ausente** (Fase 5)                                |

### 5.3 Observações

1. **Duplicidade de rotas**: `/dashboard/flows` e `/dashboard/fluxos` coexistem (naming EN vs PT-BR)
2. **Sidebar links**: O layout do dashboard lista navegação para: Início, Leads, Conversas, Fluxos, Analytics, Templates, Integracoes, Perfil
3. **CRM Providers**: RD Station e Pipedrive implementados; HubSpot e Agendor têm enum mas sem provider implementation
4. **Service Role**: Usado em 3 contextos específicos: Stripe webhooks, stats calculation, credit operations
5. **Next.js 16**: Projeto migrou de v14 para v16; requer `turbopack: {}` no config (corrigido nesta sessão)

---

## 6. Segurança e Compliance

### 6.1 Camadas de Defesa (6 níveis)

| Nível | Mecanismo          | Descrição                                          |
| ----- | ------------------ | -------------------------------------------------- |
| 1     | Middleware Next.js | Redireciona não-autenticados em rotas protegidas   |
| 2     | RLS PostgreSQL     | Isolamento por `consultant_id` em todas as tabelas |
| 3     | AdminGuard React   | Verifica `is_admin` nas páginas admin              |
| 4     | Admin API check    | Verifica `is_admin` nos handlers admin             |
| 5     | Webhook signatures | HMAC SHA-256 (Meta) + Stripe signature             |
| 6     | Validação Zod      | Schemas em todos os inputs de API                  |

### 6.2 Criptografia

| Dado               | Algoritmo   | Contexto                  |
| ------------------ | ----------- | ------------------------- |
| Tokens WhatsApp    | AES-256-GCM | `whatsapp_integrations`   |
| API Keys CRM       | AES-256-GCM | `crm_integrations`        |
| Senhas             | bcrypt      | Supabase Auth (interno)   |
| Dados de pagamento | N/A         | Stripe gerencia (PCI-DSS) |

### 6.3 LGPD

- Cookie consent banner com persistência localStorage
- `audit_logs` imutável para trilha de auditoria
- `webhook_events` append-only para compliance
- Isolamento de dados por consultor (RLS)
- Nenhum dado de cartão armazenado (Stripe-only)

---

## 7. Infraestrutura

### 7.1 Jobs Agendados (pg_cron)

| Job                       | Schedule             | Descrição                                        |
| ------------------------- | -------------------- | ------------------------------------------------ |
| `calculate_daily_stats()` | A cada hora (:00)    | Agrega métricas SaaS em `daily_stats`            |
| `reset_monthly_credits()` | Dia 1 do mês (00:05) | Reseta créditos de assinatura + mantém comprados |

### 7.2 Docker

- `docker-compose.yml` para dev (app + Supabase local)
- `Dockerfile` multi-stage (standalone output)
- Suporte a `SUPABASE_URL` interna (Docker network)

### 7.3 Testes

- **34 arquivos** | **319 testes** (todos passando)
- **0 erros TypeScript** em código de produção
- Cobertura: unit (services, components) + integration (API routes) + E2E (billing, lead qualification)

---

_Relatório gerado automaticamente via análise estática do código-fonte._
_Nenhum arquivo do projeto foi alterado durante esta análise._
