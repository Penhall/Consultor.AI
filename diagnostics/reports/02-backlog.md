# Backlog Consolidado - Consultor.AI

**Data**: 2026-02-22
**Versão**: 0.4.0
**Branch**: `005-diagnostic-backlog`
**Status**: Diagnóstico concluído — nenhuma correção implementada

---

## Dados de Origem

| Relatório                | Arquivo                                     | Data       | Tipo                    |
| ------------------------ | ------------------------------------------- | ---------- | ----------------------- |
| Diagnóstico do Projeto   | `diagnostics/reports/00-project-mapping.md` | 2026-02-20 | Mapeamento estático     |
| Diagnóstico de Navegação | `diagnostics/reports/01-link-crawler.md`    | 2026-02-22 | Crawl dinâmico (Docker) |

**Ambiente de teste**: Docker Full-Stack (app + Supabase + Redis + Kong)
**Roles testados**: admin (`consultor0@seed.local`), consultant (`consultor1@seed.local`)
**Rotas testadas**: 49 por role (26 páginas + 23 APIs GET) = 98 total
**Rotas não testadas**: 13 (POST-only, webhooks, OAuth)

---

## Resumo Executivo

| Categoria              | Itens  | Esforço P | Esforço M | Esforço G |
| ---------------------- | ------ | --------- | --------- | --------- |
| 1. Críticos            | 4      | 2         | 0         | 2         |
| 2. Isolamento de Dados | 1      | 0         | 0         | 1         |
| 3. Páginas Placeholder | 0      | 0         | 0         | 0         |
| 4. Links Quebrados     | 4      | 2         | 2         | 0         |
| 5. Melhorias de UX     | 3      | 1         | 1         | 1         |
| **Total Acionável**    | **12** | **5**     | **3**     | **4**     |

| Roadmap Futuro (Fase 5) | 5 itens | sem estimativa |
| ----------------------- | ------- | -------------- |

**Legenda de esforço**: P = Pequeno (≤ 2h) | M = Médio (½ a 1 dia) | G = Grande (> 1 dia)

---

## 1. Críticos

> Problemas que bloqueiam o fluxo principal do usuário (login → dashboard → gerenciar leads)

### BL-001: Cookie de autenticação SSR não reconhecido pelo middleware

- **Descrição**: O crawler autentica via GoTrue REST API e envia o cookie `sb-127-auth-token` no formato SSR (base64-encoded JSON com access_token/refresh_token). No entanto, o middleware do Next.js (`@supabase/ssr` `createServerClient`) não reconhece este cookie, redirecionando todas as rotas protegidas para `/auth/login`. Isso afeta **17 páginas** (todas em `/dashboard/*` e `/admin/*`) para ambos os roles, resultando em 34 redirects (HTTP 307) no crawl.
- **Papel afetado**: admin, consultant
- **Esforço**: G (Grande)
- **Sugestão de solução**: Investigar o formato esperado pelo `createServerClient` do `@supabase/ssr`. O cookie pode precisar ser fragmentado em múltiplos chunks (`sb-127-auth-token.0`, `sb-127-auth-token.1`, etc.) conforme o padrão SSR do Supabase. Alternativamente, o middleware pode esperar cookies definidos pelo browser via `supabase.auth.signInWithPassword()` no lado client, não via API REST direta. Corrigir o formato do cookie no crawler ou ajustar o middleware para aceitar ambos os formatos.
- **Rotas relacionadas**: `/dashboard`, `/dashboard/leads`, `/dashboard/flows`, `/dashboard/analytics`, `/dashboard/conversas`, `/dashboard/templates`, `/dashboard/arquivos`, `/dashboard/integracoes`, `/dashboard/perfil`, `/dashboard/perfil/whatsapp`, `/dashboard/test/whatsapp-simulator`, `/dashboard/leads/[id]`, `/dashboard/flows/[id]`, `/dashboard/flows/new`, `/dashboard/fluxos`, `/admin`, `/admin/users`

### BL-002: APIs retornam 401 para usuários autenticados

- **Descrição**: Todas as 20 APIs autenticadas retornam HTTP 401 quando chamadas com o token Bearer do GoTrue para o role admin, e 18 APIs para o role consultant. A causa raiz é a mesma do BL-001 — o token de sessão obtido via API REST não é propagado corretamente para as API routes do Next.js que usam `createServerClient` para extrair a sessão dos cookies.
- **Papel afetado**: admin, consultant
- **Esforço**: G (Grande — mesma correção do BL-001)
- **Sugestão de solução**: Resolução conjunta com BL-001. Uma vez que o formato de cookie esteja correto, tanto as páginas (middleware redirect) quanto as APIs (extração de sessão) devem funcionar. Testar isoladamente se as APIs aceitam Bearer token no header `Authorization` como fallback.
- **Rotas relacionadas**: `/api/leads`, `/api/leads/[id]`, `/api/leads/stats`, `/api/leads/export`, `/api/leads/[id]/conversations`, `/api/leads/[id]/follow-ups`, `/api/flows`, `/api/flows/[id]`, `/api/analytics/overview`, `/api/analytics/charts`, `/api/analytics/activity`, `/api/billing/credits`, `/api/files`, `/api/follow-ups/[id]`, `/api/integrations/crm`, `/api/integrations/crm/logs`, `/api/templates`, `/api/templates/[id]`, `/api/admin/stats`, `/api/admin/users`

### BL-003: Seed data ausente para entidade File

- **Descrição**: A rota `/api/files/[id]` aparece como "Quebrado" (status 0) para ambos os roles porque o seed diagnostic não popula a tabela `files`. Sem um `fileId` válido, o crawler não consegue resolver o parâmetro dinâmico `[id]` e a rota não é testada.
- **Papel afetado**: admin, consultant
- **Esforço**: P (Pequeno)
- **Sugestão de solução**: Adicionar criação de ao menos 1 registro na tabela `files` em `scripts/seed-diagnostic.ts`. Incluir: nome, tipo (PDF ou imagem), `storage_key` fictício, `consultant_id` do seed admin. Após isso, re-executar o crawl para validar a rota.
- **Rotas relacionadas**: `/api/files/[id]`

### BL-004: Seed data ausente para entidade CRM Integration

- **Descrição**: A rota `/api/integrations/crm/[id]` aparece como "Quebrado" (status 0) para ambos os roles porque o seed diagnostic não popula a tabela `crm_integrations`. Sem um `crmIntegrationId` válido, o parâmetro dinâmico não é resolvido.
- **Papel afetado**: admin, consultant
- **Esforço**: P (Pequeno)
- **Sugestão de solução**: Adicionar criação de ao menos 1 registro na tabela `crm_integrations` em `scripts/seed-diagnostic.ts`. Usar provider `rd-station` ou `pipedrive` (já implementados), com `api_key` fictício criptografado e `field_mappings` padrão. Re-executar o crawl após seed atualizado.
- **Rotas relacionadas**: `/api/integrations/crm/[id]`

---

## 2. Isolamento de Dados entre Tenants

> Avaliação do isolamento de dados por consultor via RLS e mecanismos de autorização

### BL-005: Avaliação de RLS e isolamento — parcialmente verificável

- **Descrição**: O mapeamento do projeto (00-project-mapping.md) documenta 6 camadas de defesa ativas: (1) Middleware Next.js para redirect, (2) RLS PostgreSQL por `consultant_id`, (3) AdminGuard React para `/admin/*`, (4) Admin API check nos handlers, (5) Webhook signatures HMAC, (6) Validação Zod. No entanto, devido ao problema de autenticação (BL-001/BL-002), **não foi possível verificar em tempo de execução** se o RLS está efetivamente isolando dados entre tenants — todas as rotas autenticadas falharam antes de atingir a camada de banco de dados. A documentação indica RLS ativa em todas as tabelas, mas a verificação empírica depende da resolução do BL-001.
- **Papel afetado**: admin, consultant
- **Esforço**: G (Grande — requer resolução do BL-001 + novo crawl + testes de isolamento cruzado)
- **Sugestão de solução**: Após resolver BL-001, executar novo crawl e verificar: (a) consultant não vê leads de outro consultant, (b) admin não acessa dados de tenant específico via API pública, (c) RPC functions (`decrement_credits`, `reset_monthly_credits`) respeitam `user_id`. Adicionalmente, criar testes automatizados de isolamento (dois consultores tentando acessar dados cruzados).
- **Rotas relacionadas**: Todas as rotas autenticadas (37 admin + 35 consultant)

---

## 3. Páginas Placeholder

> Rotas que retornam conteúdo vazio, TODO visível, ou Lorem ipsum

**Nenhum placeholder identificado.**

O crawl de navegação classificou 0 rotas na categoria "Placeholder" para ambos os roles. Todas as páginas acessíveis (9 públicas) retornam conteúdo real e funcional. As páginas protegidas (17 rotas `/dashboard/*` e `/admin/*`) não puderam ser avaliadas quanto ao conteúdo devido ao problema de autenticação (BL-001) — elas redirecionam para login antes de renderizar.

> **Nota**: Após resolver BL-001, recomenda-se re-executar o crawl para avaliar se as páginas do dashboard contêm conteúdo real ou placeholders.

---

## 4. Links Quebrados

> Links internos que retornam 404 ou redirecionamento inesperado

### BL-006: Link /auth/signup retorna 404

- **Descrição**: A landing page (`/`) contém o botão "Começar Gratuitamente" com href `/auth/signup`, que retorna 404. A página correta de cadastro é `/auth/register`.
- **Papel afetado**: público (visitantes da landing page)
- **Esforço**: P (Pequeno)
- **Sugestão de solução**: Corrigir o href do CTA na landing page de `/auth/signup` para `/auth/register`. Localizar o componente em `src/components/landing/` (provavelmente Hero ou CTA section).
- **Rotas relacionadas**: `/` → `/auth/signup`

### BL-007: Página /termos não existe (404) — Compliance LGPD

- **Descrição**: O footer da landing page contém o link "Termos de Uso" apontando para `/termos`, que retorna 404. Termos de uso são obrigatórios para plataformas SaaS que processam dados pessoais sob a LGPD.
- **Papel afetado**: público
- **Esforço**: M (Médio)
- **Sugestão de solução**: Criar página estática `/termos` em `src/app/termos/page.tsx` com conteúdo de termos de uso. Pode ser conteúdo Markdown renderizado ou texto estático. Incluir: uso da plataforma, responsabilidades, política de cancelamento, jurisdição.
- **Rotas relacionadas**: `/` → `/termos`

### BL-008: Página /privacidade não existe (404) — Compliance LGPD

- **Descrição**: O footer da landing page contém o link "Política de Privacidade" apontando para `/privacidade`, que retorna 404. Política de privacidade é obrigatória sob a LGPD (Lei 13.709/2018) para qualquer plataforma que coleta dados pessoais.
- **Papel afetado**: público
- **Esforço**: M (Médio)
- **Sugestão de solução**: Criar página estática `/privacidade` em `src/app/privacidade/page.tsx`. Incluir: dados coletados, finalidade, compartilhamento, direitos do titular (acesso, correção, exclusão), contato do DPO, uso de cookies (integrar com banner LGPD existente).
- **Rotas relacionadas**: `/` → `/privacidade`

### BL-009: Link /dashboard em /checkout redireciona para login

- **Descrição**: A página `/checkout` contém o link "Voltar ao Dashboard" com href `/dashboard`, que redireciona (HTTP 302) para `/auth/login` devido ao problema de autenticação (BL-001). Este link funcionará corretamente após a resolução do BL-001.
- **Papel afetado**: admin, consultant
- **Esforço**: P (Pequeno — resolvido automaticamente com BL-001)
- **Sugestão de solução**: Nenhuma ação necessária além da correção do BL-001. Após resolver a autenticação, re-verificar que o link `/dashboard` funciona para usuários logados.
- **Rotas relacionadas**: `/checkout` → `/dashboard`

---

## 5. Melhorias de UX

> Duplicidade de rotas, naming inconsistente, e oportunidades de melhoria

### BL-010: Duplicidade de rotas /dashboard/flows e /dashboard/fluxos

- **Descrição**: As rotas `/dashboard/flows` e `/dashboard/fluxos` coexistem no sistema, sendo a primeira em inglês e a segunda em português. Ambas são registradas como rotas válidas no Next.js App Router. A sidebar do dashboard provavelmente referencia apenas uma delas, mas ambas são acessíveis.
- **Papel afetado**: admin, consultant
- **Esforço**: M (Médio)
- **Sugestão de solução**: Consolidar para uma única rota. Recomendação: manter `/dashboard/fluxos` (PT-BR, consistente com outros nomes como `/dashboard/conversas`, `/dashboard/integracoes`, `/dashboard/arquivos`) e criar redirect permanente (308) de `/dashboard/flows` para `/dashboard/fluxos`. Atualizar links na sidebar.
- **Rotas relacionadas**: `/dashboard/flows`, `/dashboard/fluxos`

### BL-011: Inconsistência de CTA na landing page

- **Descrição**: A landing page tem dois CTAs de cadastro com URLs diferentes: "Começar Gratuitamente" aponta para `/auth/signup` (que não existe — ver BL-006) e o botão "Cadastrar" aponta para `/cadastro` (que funciona e redireciona para `/auth/register`). A inconsistência gera confusão e o primeiro CTA está quebrado.
- **Papel afetado**: público
- **Esforço**: P (Pequeno)
- **Sugestão de solução**: Unificar ambos os CTAs para apontar para `/cadastro` (ou diretamente `/auth/register`). Corrigir o link do "Começar Gratuitamente" resolve tanto a inconsistência quanto o 404 (BL-006).
- **Rotas relacionadas**: `/` (landing page)

### BL-012: Admin API retorna 401 para usuário admin autenticado

- **Descrição**: As rotas `/api/admin/stats` e `/api/admin/users` retornam 401 para o role admin, embora o crawl classificasse "Expected 401/403" para consultant como "Funcionando" (comportamento correto). Para o admin, o 401 é inesperado e resulta da mesma falha de autenticação (BL-001/BL-002). Após resolver a autenticação, é necessário verificar se a lógica `is_admin` funciona corretamente.
- **Papel afetado**: admin
- **Esforço**: G (Grande — depende da resolução de BL-001 + verificação do fluxo admin)
- **Sugestão de solução**: Após resolver BL-001, testar especificamente: (a) admin consegue acessar `/api/admin/stats` e `/api/admin/users`, (b) consultant recebe 401/403 nestas rotas (já confirmado pelo crawl), (c) AdminGuard React funciona para páginas `/admin/*`.
- **Rotas relacionadas**: `/api/admin/stats`, `/api/admin/users`, `/admin`, `/admin/users`

---

## 6. Roadmap Futuro (Fase 5)

> Features previstas mas não implementadas — referência para planejamento, sem estimativa de esforço

| Item             | Descrição                                                                                        | Status    |
| ---------------- | ------------------------------------------------------------------------------------------------ | --------- |
| HubSpot Provider | CRM provider para HubSpot — enum `crm_provider` já inclui `hubspot` mas sem implementação        | Ausente   |
| Agendor Provider | CRM provider para Agendor — enum `crm_provider` já inclui `agendor` mas sem implementação        | Ausente   |
| Vertical Imóveis | Segunda vertical (real estate) — enum `vertical_type` inclui `imoveis`, sem fluxo conversacional | Ausente   |
| Voice Cloning    | Clonagem de voz via ElevenLabs — sem endpoint `/api/voice/*`                                     | Planejado |
| Image Generation | Geração de imagens via Canva API — sem endpoint `/api/images/*`                                  | Planejado |

---

_Relatório gerado a partir dos diagnósticos em `diagnostics/reports/`. Nenhum arquivo de código-fonte foi alterado._
_Próximo passo recomendado: Resolver BL-001 (autenticação SSR) e re-executar o crawl diagnóstico._
