# Próximos Passos - Consultor.AI

**Status Atual:** Planejamento 60% completo
**Próxima Fase:** Configuração do Projeto
**Estimativa:** 2 dias (14 horas)

---

## Checklist de Ações Imediatas

### 1. Configurações do Projeto (CRÍTICO - 4h)

#### A. Package.json e Dependências
```bash
- [ ] Criar package.json
- [ ] Instalar Next.js 14
- [ ] Instalar React 18
- [ ] Instalar TypeScript
- [ ] Instalar Supabase clients
- [ ] Instalar shadcn/ui
- [ ] Instalar Tailwind CSS
- [ ] Instalar Zod para validação
- [ ] Instalar React Query
- [ ] Instalar ferramentas de desenvolvimento (ESLint, Prettier, Vitest, Playwright)
```

**Dependências principais:**
- next@14.x
- react@18.x
- typescript@5.x
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs
- groq-sdk
- zod
- @tanstack/react-query
- tailwindcss
- @radix-ui/react-* (via shadcn/ui)

#### B. Configurações TypeScript
```bash
- [ ] Criar tsconfig.json com strict mode
- [ ] Configurar paths (@/ para src/)
- [ ] Configurar target ES2022
```

#### C. Configurações Next.js
```bash
- [ ] Criar next.config.js
- [ ] Habilitar App Router
- [ ] Configurar experimental features
- [ ] Configurar image optimization
```

#### D. Variáveis de Ambiente
```bash
- [ ] Criar .env.example
- [ ] Documentar todas as variáveis necessárias:
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    - SUPABASE_SERVICE_ROLE_KEY
    - GROQ_API_KEY
    - WHATSAPP_API_KEY
    - WHATSAPP_API_URL
```

#### E. Git Configuration
```bash
- [ ] Criar .gitignore completo
- [ ] Configurar .gitattributes
```

---

### 2. Estrutura de Código (CRÍTICO - 2h)

```bash
- [ ] Criar src/app/ (App Router)
  - [ ] src/app/layout.tsx
  - [ ] src/app/page.tsx
  - [ ] src/app/error.tsx
  - [ ] src/app/loading.tsx
  - [ ] src/app/not-found.tsx

- [ ] Criar src/app/(auth)/
  - [ ] src/app/(auth)/login/page.tsx
  - [ ] src/app/(auth)/cadastro/page.tsx

- [ ] Criar src/app/(dashboard)/
  - [ ] src/app/(dashboard)/layout.tsx
  - [ ] src/app/(dashboard)/dashboard/page.tsx
  - [ ] src/app/(dashboard)/leads/page.tsx
  - [ ] src/app/(dashboard)/conversas/page.tsx

- [ ] Criar src/app/api/
  - [ ] src/app/api/leads/route.ts
  - [ ] src/app/api/conversations/route.ts
  - [ ] src/app/api/webhooks/whatsapp/route.ts

- [ ] Criar src/components/
  - [ ] src/components/ui/ (shadcn/ui)
  - [ ] src/components/leads/
  - [ ] src/components/conversations/

- [ ] Criar src/lib/
  - [ ] src/lib/supabase/client.ts
  - [ ] src/lib/supabase/server.ts
  - [ ] src/lib/api/groq.ts
  - [ ] src/lib/flow-engine/
  - [ ] src/lib/services/
  - [ ] src/lib/utils/
  - [ ] src/lib/validators/

- [ ] Criar src/types/
  - [ ] src/types/database.ts
  - [ ] src/types/api.ts
  - [ ] src/types/flow.ts

- [ ] Criar src/hooks/
  - [ ] src/hooks/use-leads.ts
  - [ ] src/hooks/use-conversations.ts
```

---

### 3. Supabase Setup (CRÍTICO - 4h)

```bash
- [ ] Instalar Supabase CLI
    npm install -g supabase

- [ ] Inicializar Supabase
    supabase init

- [ ] Criar arquivo de configuração
    - [ ] supabase/config.toml

- [ ] Criar primeira migration
    - [ ] supabase/migrations/20250101000000_initial_schema.sql
    - [ ] Copiar schema do Database Design Document

- [ ] Criar seed data
    - [ ] supabase/seed.sql
    - [ ] Adicionar consultor de teste
    - [ ] Adicionar leads de exemplo
    - [ ] Adicionar fluxo de exemplo

- [ ] Estruturar Edge Functions
    - [ ] supabase/functions/process-message/index.ts
    - [ ] supabase/functions/process-message/deno.json

- [ ] Testar localmente
    supabase start
    supabase db reset
```

---

### 4. Linting e Formatação (IMPORTANTE - 2h)

```bash
- [ ] Configurar ESLint
    - [ ] Criar .eslintrc.json
    - [ ] Instalar plugins (next, react, typescript)
    - [ ] Configurar regras conforme coding-guidelines.md

- [ ] Configurar Prettier
    - [ ] Criar .prettierrc
    - [ ] Configurar integração com ESLint
    - [ ] Criar .prettierignore

- [ ] Configurar Husky (pre-commit hooks)
    - [ ] Instalar husky
    - [ ] Configurar lint-staged
    - [ ] Configurar pre-commit para rodar lint e format
```

---

### 5. Testing Setup (IMPORTANTE - 2h)

```bash
- [ ] Configurar Vitest
    - [ ] Criar vitest.config.ts
    - [ ] Criar tests/setup.ts
    - [ ] Configurar coverage thresholds (80%)

- [ ] Configurar Playwright
    - [ ] Criar playwright.config.ts
    - [ ] Instalar navegadores
    - [ ] Criar testes E2E básicos

- [ ] Criar estrutura de testes
    - [ ] tests/unit/
    - [ ] tests/integration/
    - [ ] tests/e2e/
    - [ ] tests/fixtures/
    - [ ] tests/mocks/
```

---

### 6. CI/CD (OPCIONAL - Pode ser feito depois)

```bash
- [ ] Criar .github/workflows/test.yml
- [ ] Criar .github/workflows/deploy-staging.yml
- [ ] Criar .github/PULL_REQUEST_TEMPLATE.md
- [ ] Criar .github/ISSUE_TEMPLATE/bug_report.md
- [ ] Criar .github/ISSUE_TEMPLATE/feature_request.md
```

---

### 7. Scripts de Automação (OPCIONAL)

```bash
- [ ] Criar scripts/setup.sh
- [ ] Criar scripts/reset-db.sh
- [ ] Criar scripts/generate-types.sh
```

---

### 8. Documentação de Setup (NECESSÁRIO - 2h)

```bash
- [ ] Criar docs/guides/getting-started.md
    - [ ] Pré-requisitos
    - [ ] Instalação passo a passo
    - [ ] Configuração de ambiente
    - [ ] Troubleshooting comum

- [ ] Atualizar README.md
    - [ ] Adicionar seção "Prerequisites"
    - [ ] Melhorar seção "Quick Start"
    - [ ] Adicionar "Troubleshooting"

- [ ] Criar CONTRIBUTING.md (opcional)
```

---

## Ordem de Execução Recomendada

### Dia 1 (6-8 horas)

**Manhã:**
1. ✅ Criar package.json e instalar dependências (1h)
2. ✅ Criar configurações TypeScript, Next.js, ESLint, Prettier (1h)
3. ✅ Criar .gitignore e .env.example (30min)
4. ✅ Criar estrutura básica de pastas em src/ (1h)

**Tarde:**
5. ✅ Inicializar Supabase localmente (30min)
6. ✅ Criar primeira migration com schema completo (2h)
7. ✅ Criar seed.sql com dados de teste (1h)
8. ✅ Testar setup local completo (1h)

### Dia 2 (6-8 horas)

**Manhã:**
9. ✅ Configurar Vitest e Playwright (1h)
10. ✅ Criar arquivos base de layout e páginas (1h)
11. ✅ Criar clients do Supabase (client.ts e server.ts) (1h)
12. ✅ Criar types básicos do database (1h)

**Tarde:**
13. ✅ Documentar processo de setup em getting-started.md (1h)
14. ✅ Atualizar README.md com instruções (30min)
15. ✅ Criar primeiro componente de teste (30min)
16. ✅ Validar que tudo funciona (1h)

---

## Validação Final

Após completar todas as tarefas acima, você deve ser capaz de:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar Supabase local
supabase start

# 3. Rodar migrations
npm run db:migrate

# 4. Iniciar servidor de desenvolvimento
npm run dev

# 5. Rodar testes
npm run test

# 6. Rodar linter
npm run lint

# 7. Acessar aplicação
# Abrir http://localhost:3000 e ver a página inicial
```

Se todos os comandos acima funcionarem, você está **100% pronto para começar o desenvolvimento do MVP**.

---

## Recursos Úteis para Setup

### Instalação de Ferramentas

```bash
# Node.js 20 LTS
https://nodejs.org/

# Docker Desktop
https://www.docker.com/products/docker-desktop/

# Supabase CLI
npm install -g supabase

# VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Error Translator
```

### Contas Necessárias

1. **Supabase** - https://supabase.com
   - Criar projeto
   - Obter URL e anon key
   - Obter service role key

2. **Groq** - https://console.groq.com
   - Criar conta
   - Obter API key

3. **Weni Cloud** - https://weni.ai
   - Configurar WhatsApp Business API
   - Obter credenciais

4. **Vercel** (para deploy) - https://vercel.com
   - Conectar repositório GitHub

---

## Decisão: O Que Fazer Agora?

Você tem 3 opções:

### Opção 1: Criar Configurações Automaticamente (Recomendado)
**Tempo:** 1-2 horas
**Ação:** Pedir para Claude Code criar todos os arquivos de configuração básicos agora
**Vantagem:** Ambiente pronto rapidamente
**Próximo passo:** Você só precisa rodar `npm install` e `supabase start`

### Opção 2: Criar Manualmente Seguindo Checklist
**Tempo:** 2 dias
**Ação:** Seguir este checklist passo a passo manualmente
**Vantagem:** Você aprende cada configuração em detalhes
**Desvantagem:** Mais demorado

### Opção 3: Começar Desenvolvimento Direto (Não Recomendado)
**Tempo:** Imediato
**Ação:** Pular configurações e começar a codificar
**Vantagem:** Sensação de progresso rápido
**Desvantagem:** Vai precisar parar depois para configurar tudo

---

## Recomendação Final

**Escolha a Opção 1** e permita que o Claude Code crie todos os arquivos de configuração agora. Em 1-2 horas você terá:

✅ Projeto configurado completamente
✅ Estrutura de pastas pronta
✅ Supabase inicializado
✅ Testes configurados
✅ CI/CD básico pronto
✅ Documentação de setup completa

**Depois disso, você estará 100% pronto para iniciar o Sprint 1 do MVP.**

---

**Preparado por:** Claude Code Assistant
**Data:** 2025-12-12
**Decisão pendente:** Qual opção você escolhe?
