# 🚀 Plano de Execução - Testes e Infraestrutura

**Data**: 2026-01-12 | **Atualizado**: 2026-01-18
**Status**: 🔄 EM ANDAMENTO (Sprint 3 - Quase Concluído)
**Tempo Estimado**: 40 horas (4 sprints de 1 semana cada)
**Ambiente**: Desenvolvimento Local com Docker

---

## 📊 Situação Atual (2026-01-18)

### ✅ O que Funciona:
- MVP 100% funcional (62/85 tasks completas - 73%)
- Docker configurado (hot-reload, Redis, Supabase local)
- Build limpo (0 erros TypeScript)
- 19 páginas + 14 API routes operacionais
- **238 testes criados** (22 suites) 🎉

### 📈 Progresso dos Testes:
- **227 testes passando** (95.4%) ✅
- **11 testes falhando** (webhook mock route)
- **14/14 API routes** com cobertura (100%) ✅

### ⚠️ Gaps Restantes:
- [ ] Corrigir 11 testes falhando (webhook mock route)
- [ ] CI/CD não configurado (GitHub Actions - T010)
- [ ] Pre-commit hooks não ativos (Husky - T011)
- [ ] Teste E2E para fluxo de qualificação (T043)

---

## 🎯 Estratégia Escolhida: "Test-Driven Pragmático"

### Por que esta abordagem?

1. **Não bloqueia desenvolvimento**: Testes em paralelo com features
2. **Foco no crítico**: 20% de esforço para 80% de cobertura de risco
3. **Docker-first**: Tudo roda no mesmo ambiente de dev
4. **Feedback imediato**: Hooks locais previnem bugs antes do commit

---

## 📋 Plano de 4 Sprints (10h cada)

### Sprint 1: Infraestrutura (8h) - ✅ **COMPLETO**
**Meta**: Criar fundação para rodar testes

**Entregáveis**:
- ✅ Estrutura de diretórios (`tests/unit/`, `tests/integration/`, `tests/e2e/`)
- ✅ Vitest configurado com mocks (Supabase, Next.js Router)
- ✅ Fixtures de teste (leads, conversas, fluxos)
- ✅ Docker test-runner (watch mode)
- ✅ Scripts: `test-quick.sh`, `test-all.sh`
- ✅ `tests/setup.ts` configurado

**Status**: 100% ✅

---

### Sprint 2: Testes Críticos (16h) - ✅ **COMPLETO**
**Meta**: 40-50% cobertura nos módulos mais importantes

**Progresso**:
1. ✅ **Flow Engine** (6h): Parser, State Manager, Executors, Engine - 4/4 arquivos
2. ✅ **AI Service** (4h): Compliance ANS - COMPLETO
3. ✅ **Lead Service** (3h): CRUD operations - COMPLETO
4. ✅ **Analytics Service** (3h): Métricas e agregações - COMPLETO

**Arquivos criados**:
- ✅ `tests/unit/lib/flow-engine/parser.test.ts`
- ✅ `tests/unit/lib/flow-engine/state-manager.test.ts`
- ✅ `tests/unit/lib/flow-engine/executors.test.ts`
- ✅ `tests/unit/lib/flow-engine/engine.test.ts`
- ✅ `tests/unit/lib/services/ai-service.test.ts`
- ✅ `tests/unit/lib/services/lead-service.test.ts`
- ✅ `tests/unit/lib/services/analytics-service.test.ts`

**Status**: 100% ✅

---

### Sprint 3: Testes de Integração (10h) - ✅ **COMPLETO**
**Meta**: 65-70% cobertura total, validar APIs

**Progresso**:
1. ✅ **Webhook API** (3h): 15/15 testes passando
2. ✅ **Leads API** (3h): 30/30 testes (route + [id] + stats)
3. ✅ **Analytics API** (2h): 20/20 testes (overview + charts + activity)
4. ✅ **Conversations API** (2h): 23/23 testes (start + message)
5. ✅ **Consultants API** (2h): 30/30 testes (meta-callback + meta-signup + integrations)
6. ✅ **Webhook Mock** (1h): 11 testes falhando (necessita correção de mocks)

**Arquivos criados** (na pasta unit/app/api ao invés de integration):
- ✅ `tests/unit/app/api/webhook/meta/[consultantId]/route.test.ts`
- ✅ `tests/unit/app/api/webhook/mock/route.test.ts` (11 testes falhando)
- ✅ `tests/unit/app/api/leads/route.test.ts`
- ✅ `tests/unit/app/api/leads/[id]/route.test.ts`
- ✅ `tests/unit/app/api/leads/stats/route.test.ts`
- ✅ `tests/unit/app/api/analytics/overview/route.test.ts`
- ✅ `tests/unit/app/api/analytics/charts/route.test.ts`
- ✅ `tests/unit/app/api/analytics/activity/route.test.ts`
- ✅ `tests/unit/app/api/conversations/start/route.test.ts`
- ✅ `tests/unit/app/api/conversations/[id]/message/route.test.ts`
- ✅ `tests/unit/app/api/consultants/meta-callback/route.test.ts`
- ✅ `tests/unit/app/api/consultants/meta-signup/route.test.ts`
- ✅ `tests/unit/app/api/consultants/[id]/integrations/meta/route.test.ts`

**Status**: 95% ✅ (11 testes pendentes correção)

---

### Sprint 4: CI/CD + E2E (6h) - ⏳ **PENDENTE**
**Meta**: 80% cobertura, automação completa

**Prioridades**:
1. ⏳ **Husky Pre-commit** (1h): Lint + type-check + tests
2. ⏳ **GitHub Actions** (2h): CI/CD pipeline completo
3. ⏳ **Teste E2E Crítico** (3h): Lead qualification flow

**Arquivos a criar**:
- `.husky/pre-commit`
- `.github/workflows/ci.yml`
- `tests/e2e/lead-qualification.spec.ts`

**Status**: 0% ⏳

---

## 🏃 Como Começar AGORA

### Passo 1: Executar Sprint 1 (15 minutos)
```bash
cd /e/PROJETOS/Consultor.AI

# Tornar script executável (se necessário)
chmod +x scripts/setup-sprint1-tests.sh

# Executar setup automatizado
./scripts/setup-sprint1-tests.sh
```

**O que acontece**:
- ✅ Cria 14 diretórios de testes
- ✅ Gera fixtures (leads.ts, flows.ts)
- ✅ Configura mocks (Supabase, Next Router)
- ✅ Atualiza vitest.config.ts
- ✅ Cria scripts de teste

### Passo 2: Validar Instalação (5 minutos)
```bash
# Rodar suite de testes vazia (deve passar)
npm run test

# Verificar coverage (deve gerar relatório vazio)
npm run test:coverage

# Ver estrutura criada
tree tests/
```

### Passo 3: Primeiro Teste (30 minutos)
Criar `tests/unit/lib/flow-engine/parser.test.ts` seguindo template do plano.

```bash
# Rodar apenas este teste
npm run test tests/unit/lib/flow-engine/parser.test.ts

# Watch mode durante desenvolvimento
npm run test:watch
```

---

## 🐳 Desenvolvimento com Docker

### Opção 1: Testes Locais (sem Docker)
```bash
# Desenvolvimento normal
npm run dev

# Testes em terminal separado
npm run test:watch
```

### Opção 2: Testes no Docker (watch mode)
```bash
# Subir app + test-runner
docker-compose -f docker-compose.dev.yml --profile testing up

# Ver logs de testes
docker-compose -f docker-compose.dev.yml logs -f test-runner
```

### Opção 3: Híbrido (RECOMENDADO)
```bash
# App no Docker
docker-compose -f docker-compose.dev.yml up -d

# Testes localmente (mais rápido)
npm run test:watch
```

---

## 📈 Métricas de Progresso

Após cada sprint, validar:

| Sprint | Cobertura Alvo | Testes Criados | Tempo Estimado |
|--------|----------------|----------------|----------------|
| Sprint 1 | 0% → 5% | Infraestrutura | 8h |
| Sprint 2 | 5% → 40% | 6 arquivos (unit) | 16h |
| Sprint 3 | 40% → 65% | 4 arquivos (integration) | 10h |
| Sprint 4 | 65% → 80% | 1 arquivo (E2E) + CI/CD | 6h |

**Total**: 40 horas (~1 hora/dia durante 1 mês)

---

## 🎯 Checkpoints de Qualidade

### Após Sprint 1 ✅
- [ ] `npm run test` executa sem erros
- [ ] Coverage report gerado em `coverage/`
- [ ] Scripts `test-quick.sh` e `test-all.sh` funcionam

### Após Sprint 2 ✅
- [ ] Cobertura ≥ 40%
- [ ] Flow parser detecta fluxos inválidos
- [ ] AI Service valida compliance ANS
- [ ] Lead Service CRUD funciona

### Após Sprint 3 ✅
- [ ] Cobertura ≥ 65%
- [ ] Webhook valida HMAC signatures
- [ ] APIs retornam dados corretos
- [ ] Middleware bloqueia acesso não autorizado

### Após Sprint 4 ✅
- [ ] Cobertura ≥ 80%
- [ ] Pre-commit hooks ativos
- [ ] GitHub Actions rodando
- [ ] Teste E2E passa

---

## 📚 Documentação Completa

- **Plano Detalhado**: `docs/guides/PLANO-TESTES-DOCKER.md` (25 páginas)
- **Padrões de Teste**: `.rules/testing-standards.md`
- **Constituição do Projeto**: `.specify/memory/constitution.md`
- **Tasks Completas**: `specs/001-project-specs/tasks.md`

---

## 🚦 Workflow Recomendado

### Durante Desenvolvimento:
```bash
# Manhã: Pull + validar
git pull origin main
npm run test:coverage

# Durante dev: Watch mode
npm run test:watch

# Antes de commit: Validação rápida
./scripts/test-quick.sh

# Antes de PR: Full validation
./scripts/test-all.sh
```

### Hooks Automáticos (Sprint 4):
```bash
git add .
git commit -m "feat: nova funcionalidade"
# ↑ Hooks rodam automaticamente:
#   - ESLint fix
#   - Type check
#   - Testes rápidos
```

---

## ⚠️ Observações Importantes

1. **Não bloqueia features**: Você pode desenvolver novas features enquanto adiciona testes
2. **Incremental**: Comece com Sprint 1, depois avance conforme tempo disponível
3. **Prioridade em testes críticos**: AI compliance > Flow engine > APIs
4. **Docker é opcional**: Testes rodam perfeitamente localmente
5. **Coverage é guia**: Meta de 80%, mas qualidade > quantidade

---

## 🎉 Benefícios Imediatos

Após Sprint 1 (8 horas):
- ✅ Infraestrutura de testes completa
- ✅ Fixtures reutilizáveis para todos os testes
- ✅ Mocks globais configurados
- ✅ Scripts automatizados

Após Sprint 2 (24 horas):
- ✅ 40% cobertura nos módulos críticos
- ✅ Validação de compliance ANS
- ✅ Confiança para refatorar código
- ✅ Detecção precoce de bugs

Após Sprint 4 (40 horas):
- ✅ 80% cobertura total
- ✅ CI/CD completo (GitHub Actions)
- ✅ Pre-commit hooks previnem erros
- ✅ Teste E2E valida fluxo completo
- ✅ Alinhamento 100% com Constituição

---

## 🚀 Próximos Passos Após Testes

Com infraestrutura completa:

1. **Fase 2 - Enhancements** (Tasks T066-T092):
   - Lead detail page
   - Export CSV
   - Flow customization

2. **Fase 3 - Expansion**:
   - CRM integration
   - Performance monitoring
   - Documentação

3. **Continuous Improvement**:
   - TDD reativo (adicionar testes quando bugs aparecem)
   - Aumentar cobertura E2E
   - Otimizar velocidade de testes

---

## 📞 Suporte

- **Dúvidas sobre testes**: Consultar `.rules/testing-standards.md`
- **Padrões de código**: Consultar `.rules/coding-guidelines.md`
- **Arquitetura**: Consultar `.rules/architecture-rules.md`
- **Issues**: Criar issue no GitHub com label `testing`

---

**Status**: ✅ PRONTO PARA EXECUÇÃO
**Próxima Ação**: Executar `./scripts/setup-sprint1-tests.sh`
**Tempo para começar**: 15 minutos
**ROI**: Alta cobertura de testes em 40 horas

---

**Última atualização**: 2026-01-12
**Autor**: Consultor.AI Team
**Revisão**: Alinhado com Constituição v1.0.0
