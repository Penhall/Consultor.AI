# Session Log — Playwright E2E Fixes (2026-02-28)

Registro completo de prompts, tarefas e ações realizadas durante a sessão de correção dos testes E2E Playwright.

---

## Contexto Inicial

**Objetivo geral:** Fazer todos os testes Playwright E2E passarem para o app Consultor.AI rodando em Docker via `docker-compose --env-file .env.docker -f docker-compose.full.yml up -d`.

**Workflow:** Executar `.\run-e2e-tests.ps1` → analisar falhas → corrigir → repetir.

**Testes originalmente falhando:**

- `dashboard should show leads-per-status breakdown`
- `admin users list should show seed consultants`

---

## Prompts da Sessão Anterior (resumida por limite de contexto)

### Prompt 1 — Início da investigação

> _(prompt inicial — contexto não disponível; sessão iniciou com análise dos 2 testes falhando)_

**Tarefas executadas:**

- Leitura de `tests/e2e/dashboard-data.spec.ts`, `run-e2e-tests.ps1`, `playwright.config.ts`
- Identificação das causas-raiz dos 2 testes falhando

---

### Prompt 2 — "prossiga"

> prossiga

**Contexto:** O usuário aprovou o plano discutido e pediu para implementar.

**Tarefas executadas:**

1. **`run-e2e-tests.ps1`** — Adicionado loop de retry (60s) para aguardar o app antes de executar testes
2. **`run-e2e-tests.ps1`** — Corrigido label do step `[2/4]` → `[2/5]`
3. **`run-e2e-tests.ps1`** — Adicionada aplicação da migration `20260224000001_fix_consultants_rls_recursion.sql` após a migration de billing
4. **`tests/e2e/dashboard-data.spec.ts`** — Corrigida race condition: `page.waitForResponse()` registrado ANTES do `page.goto()`
5. **`tests/e2e/dashboard-data.spec.ts`** — Substituído locator corrompido `text=DistribuiÃ§Ã£o por Status` por seletor encoding-safe via `getByRole('heading', { level: 2 }).filter({ hasText: /Distribui/i })`

---

### Prompt 3 — Falha novamente + análise mais profunda

> os testes falharam mais uma vez. Estou testando via Docker. Precisamos de uma análise mais aprofundada. [output completo dos testes]

**Falhas reportadas:**

- `dashboard should show leads-per-status breakdown` — `[class*="rounded-lg"][class*="px-4"]` não encontrado
- `admin users list should show seed consultants` — "Admin access denied - redirected"

**Investigação profunda:**

- Leitura de `test-results/.../error-context.md` — confirmou que os elementos JÁ estavam no DOM
- Leitura de `src/app/dashboard/page.tsx` — status cards usam `rounded-lg px-4 py-3 ${color}`
- Leitura de `src/hooks/useAuth.ts` — `AUTH_INIT_TIMEOUT_MS = 20000`
- Leitura de `src/components/admin/admin-guard.tsx` — redireciona quando `!isAuthenticated || !consultant?.is_admin`
- Leitura de `supabase/migrations/20260208000006_billing_rls_policies.sql` — política recursiva quebrada
- Leitura de `supabase/migrations/20260224000001_fix_consultants_rls_recursion.sql` — migration de fix

**Causas-raiz descobertas:**

| Teste            | Causa-raiz                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Status breakdown | `AUTH_INIT_TIMEOUT_MS=20000` dispara em 20s → elementos aparecem em ~21s → timeout da assertion expira antes                       |
| Admin redirect   | Mesmo timeout de 20s → `isAuthenticated=false` → AdminGuard faz `router.replace('/dashboard')` antes do `fetchConsultant` retornar |
| Networking       | Browser (Playwright no Windows host) → `localhost:54321` (Docker PostgREST via WSL2) adiciona ~20-21s de latência                  |

**Ações tomadas:**

- **`src/hooks/useAuth.ts`** — `AUTH_INIT_TIMEOUT_MS`: `20000` → `45000`
- **`tests/e2e/dashboard-data.spec.ts`** — timeout do heading de status: `20000` → `30000`; adicionado check `text=Novos`

---

### Prompt 4 — "acredito que tivemos avanços. Analise:"

> acredito que tivemos avanços. Analise: [output completo dos testes com novas falhas]

**Novas falhas reportadas:**

- `should login and reach dashboard` — h1 não encontrado (timeout 30s)
- `admin should access /admin page` — `page.goto: Timeout 30000ms exceeded` (TODAS as tentativas)
- Múltiplos testes flaky (auth.setup, billing)
- Step [2/5] — "WARN - Supabase não respondendo"

**Análise:**

- Supabase estava intermitentemente indisponível durante o run
- `page.goto: Timeout 30000ms exceeded` em vários testes — middleware Next.js travando no Supabase
- `AUTH_INIT_TIMEOUT_MS=45000` fez o h1 aparecer em ~45s, mas assertion timeout ainda era 30s
- `navigationTimeout: 30000` no `playwright.config.ts` era muito curto para Docker lento

**Ações tomadas (em progresso):**

- **`playwright.config.ts`** — `navigationTimeout`: `30000` → `60000`

---

## Prompts da Sessão Atual (2026-02-28)

### Prompt 5 — Continuação automática

> _(sessão retomada após limite de contexto — continuação das mudanças pendentes)_

**Tarefas executadas:**

1. **`playwright.config.ts`** — Confirmado `navigationTimeout: 60000` já aplicado; atualizado comentário explicando o motivo

2. **`tests/e2e/dashboard-data.spec.ts`** — Timeout do h1: `30000` → `50000`

   ```typescript
   // Antes:
   await expect(page.locator('h1')).toContainText('Bem-vindo', { timeout: 30000 });
   // Depois:
   await expect(page.locator('h1')).toContainText('Bem-vindo', { timeout: 50000 });
   ```

3. **`run-e2e-tests.ps1`** — Step 2 (Supabase) convertido de check único para loop de retry (60s)
   ```powershell
   # Antes: check único que avisava e continuava mesmo com Supabase offline
   # Depois: loop de 12 tentativas × 5s = até 60s aguardando Supabase responder
   ```

---

### Prompt 6 — Este arquivo

> quero que você faça um arquivo em markdown com todas as minhas solicitação aqui no claude code. Todos os prompts, todas as t[arefas]

**Tarefa executada:** Criação deste arquivo.

---

## Resumo de Todas as Alterações

| Arquivo                            | Mudança                                   | Motivo                                                            |
| ---------------------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| `run-e2e-tests.ps1`                | Step 1: loop retry 60s para app           | auth.setup falhava quando app não estava pronto                   |
| `run-e2e-tests.ps1`                | Step 2: label `[2/4]` → `[2/5]`           | numeração incorreta                                               |
| `run-e2e-tests.ps1`                | Step 3b: aplica migration RLS fix         | fix nunca era aplicado (init scripts só rodam no 1º boot)         |
| `run-e2e-tests.ps1`                | Step 2: loop retry 60s para Supabase      | Supabase offline causava cascade failures em todos os testes      |
| `tests/e2e/dashboard-data.spec.ts` | `waitForResponse` antes do `goto`         | race condition: resposta chegava antes do listener ser registrado |
| `tests/e2e/dashboard-data.spec.ts` | Locator encoding-safe para status         | `text=DistribuiÃ§Ã£o` corrompido em ambiente Windows              |
| `tests/e2e/dashboard-data.spec.ts` | h1 timeout: `30000` → `50000`             | precisa exceder `AUTH_INIT_TIMEOUT_MS` (45s)                      |
| `src/hooks/useAuth.ts`             | `AUTH_INIT_TIMEOUT_MS`: `20000` → `45000` | WSL2 adiciona ~20-21s de latência; timeout disparava cedo demais  |
| `playwright.config.ts`             | `navigationTimeout`: `30000` → `60000`    | middleware Next.js trava quando Supabase está lento               |

---

## Causas-raiz Documentadas

### 1. RLS Recursão (PostgreSQL error 42P17)

- **Migration:** `20260208000006_billing_rls_policies.sql`
- **Política quebrada:** `consultants_admin_select_all` usa `id = auth.uid()` (coluna errada) + EXISTS recursivo na mesma tabela protegida por RLS
- **Impacto:** Admin listando todos os usuários → recursão infinita → falha
- **Fix:** `20260224000001_fix_consultants_rls_recursion.sql` cria `auth_is_admin()` com `SECURITY DEFINER` (bypass seguro do RLS)

### 2. WSL2 Networking Latency

- **Contexto:** Playwright roda no host Windows → conecta em `localhost:54321` (PostgREST via WSL2)
- **Latência:** ~20-21s por chamada ao Supabase (vs <1ms interno ao Docker)
- **Impacto:** `AUTH_INIT_TIMEOUT_MS=20000` disparava antes do `fetchConsultant` retornar → `isAuthenticated=false` → AdminGuard redirecionava

### 3. Init Scripts Docker

- **Comportamento:** Scripts em `/docker-entrypoint-initdb.d/` rodam apenas no PRIMEIRO boot (volume vazio)
- **Impacto:** Migration de fix nunca era aplicada em volumes já existentes
- **Fix:** PS1 aplica as migrations via `docker exec psql` a cada run (idempotente)

---

## Como Executar

```powershell
# Iniciar Docker
docker-compose --env-file .env.docker -f docker-compose.full.yml up -d

# Executar testes (chromium apenas, mais rápido)
.\run-e2e-tests.ps1

# Executar testes (todos os browsers)
.\run-e2e-tests.ps1 -AllBrowsers

# Pular seed (se já populado)
.\run-e2e-tests.ps1 -SkipSeed

# Ver relatório HTML
npx playwright show-report
```
