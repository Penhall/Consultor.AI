# 🧪 Testes - README

## ❓ Docker é necessário para rodar testes?

### ❌ **NÃO!** Testes rodam 100% localmente no Node.js

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🖥️  SEU COMPUTADOR (Windows/Linux/Mac)                    │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                │
│  │              │         │              │                │
│  │   Node.js    │ ──────▶ │   Vitest     │                │
│  │   (local)    │         │   (testes)   │                │
│  │              │         │              │                │
│  └──────────────┘         └──────────────┘                │
│                                                             │
│  ✅ Testes rodam aqui (sem Docker!)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🐳 DOCKER (OPCIONAL - não necessário para testes)         │
│                                                             │
│  ┌──────────────┐                                          │
│  │              │                                          │
│  │   Container  │  ← Apenas se você QUISER isolar          │
│  │   (opcional) │                                          │
│  │              │                                          │
│  └──────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Como Rodar Testes (3 formas)

### Forma 1: **Localmente** (RECOMENDADO ⭐)
```bash
# Rodar testes uma vez
npm run test

# Watch mode (testes automáticos ao salvar)
npm run test:watch

# Com coverage
npm run test:coverage
```

**Vantagens**:
- ⚡ Mais rápido
- 🔧 Mais fácil debugar
- 💻 Usa menos recursos

---

### Forma 2: **Docker - Manualmente**
```bash
# Subir container de testes
docker-compose -f docker-compose.dev.yml --profile testing up -d

# Executar testes dentro do container
docker exec -it consultorai-test-runner npm run test

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f test-runner
```

**Quando usar**:
- Quer isolar ambiente
- Testar em ambiente próximo à produção

---

### Forma 3: **Docker - Watch Mode**
```bash
# Subir com watch mode (testes rodam automaticamente)
docker-compose -f docker-compose.dev.yml --profile testing up

# Pressionar Ctrl+C para parar
```

---

## 📋 Comandos Rápidos

```bash
# 1. TESTAR AGORA (teste de exemplo já criado)
npm run test

# 2. Setup completo (criar infraestrutura)
./scripts/setup-sprint1-tests.sh

# 3. Testes rápidos (só arquivos modificados)
./scripts/test-quick.sh

# 4. Suite completa (lint + type-check + testes)
./scripts/test-all.sh

# 5. Watch mode (desenvolvimento)
npm run test:watch

# 6. Coverage (relatório em coverage/index.html)
npm run test:coverage
```

---

## 🎯 Workflow Recomendado

### Durante Desenvolvimento (SEM Docker):
```bash
# Terminal 1: App rodando
npm run dev

# Terminal 2: Testes em watch mode
npm run test:watch

# Desenvolver normalmente - testes rodam automaticamente! ⚡
```

### Antes de Commit:
```bash
./scripts/test-quick.sh
git add .
git commit -m "feat: nova funcionalidade"
```

### Antes de PR:
```bash
./scripts/test-all.sh
git push origin minha-branch
```

---

## 📊 Status Atual

| Item | Status | Comando |
|------|--------|---------|
| **Infraestrutura** | ✅ Parcial | `./scripts/setup-sprint1-tests.sh` |
| **Teste de Exemplo** | ✅ Criado | `tests/unit/exemplo.test.ts` |
| **Rodar Testes** | ✅ Funciona | `npm run test` |
| **Coverage** | ✅ Funciona | `npm run test:coverage` |
| **Watch Mode** | ✅ Funciona | `npm run test:watch` |
| **Testes Reais (Sprint 2)** | ⏳ Próximo | Ver `docs/guides/PLANO-TESTES-DOCKER.md` |

---

## 📁 Estrutura Criada

```
tests/
├── setup.ts                 # ✅ Configuração global
├── mocks/                   # ✅ Mocks criados
│   └── (em breve: supabase, next-router)
├── fixtures/                # ⏳ Fixtures (após setup)
│   ├── leads.ts
│   └── flows.ts
├── unit/                    # ✅ Testes unitários
│   └── exemplo.test.ts      # ✅ Teste de exemplo FUNCIONA
├── integration/             # ⏳ Testes de integração (Sprint 3)
└── e2e/                     # ⏳ Testes E2E (Sprint 4)
```

---

## 🎓 Guias Disponíveis

1. **`TESTAR-AGORA.md`** ⚡ - Quick start (1 minuto)
2. **`docs/guides/GUIA-RAPIDO-TESTES.md`** 📖 - Guia completo SEM Docker
3. **`docs/guides/PLANO-TESTES-DOCKER.md`** 📋 - Plano de 4 sprints (40h)
4. **`PLANO-EXECUCAO.md`** 🎯 - Resumo executivo

---

## ❓ FAQ

### P: Por que tive "No test files found"?
**R**: Porque ainda não havia criado arquivos `.test.ts`. **Agora já existe**: `tests/unit/exemplo.test.ts` ✅

### P: Docker precisa estar rodando?
**R**: **NÃO!** Testes rodam localmente no Node.js.

### P: Como ver se funcionou?
**R**: Execute `npm run test` - deve ver 10 testes passando ✅

### P: E agora?
**R**: Execute `./scripts/setup-sprint1-tests.sh` para criar infraestrutura completa.

### P: Docker serve para quê então?
**R**: Docker é **opcional**, serve para:
- Isolar ambiente (se quiser)
- CI/CD (GitHub Actions)
- Testar em ambiente próximo à produção

---

## 🎉 Teste Agora!

```bash
# Execute este comando AGORA:
npm run test

# Deve ver:
# ✓ tests/unit/exemplo.test.ts (10)
# Test Files  1 passed (1)
# Tests  10 passed (10)
```

Se funcionou: **✅ Testes rodando perfeitamente SEM Docker!**

---

**Última atualização**: 2026-01-12
**Dúvidas?** Consulte os guias acima ou `.rules/testing-standards.md`
