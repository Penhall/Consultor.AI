# 🚀 Guia Rápido: Rodando Testes Localmente (SEM Docker)

**Criado**: 2026-01-12
**Público**: Desenvolvedores
**Tempo de leitura**: 5 minutos

---

## ❓ Dúvida Comum: Preciso do Docker para rodar testes?

### Resposta: **NÃO!** 🎉

Os testes rodam **100% localmente** no seu Node.js. Docker é **opcional** e serve apenas para:
- Isolar ambiente (se quiser)
- Rodar testes em CI/CD
- Simular ambiente de produção

**Para desenvolvimento local**: Testes rodam direto no seu terminal, **sem Docker**.

---

## 🔧 Setup Inicial (Executar UMA vez)

### Passo 1: Executar Script de Setup
```bash
cd /e/PROJETOS/Consultor.AI

# Executar script que cria infraestrutura
./scripts/setup-sprint1-tests.sh
```

**O que acontece**:
- ✅ Cria diretórios: `tests/unit/`, `tests/integration/`, `tests/e2e/`, `tests/fixtures/`
- ✅ Cria fixtures: `tests/fixtures/leads.ts`, `tests/fixtures/flows.ts`
- ✅ Cria mocks: `tests/mocks/supabase.ts`, `tests/mocks/next-router.ts`
- ✅ Atualiza: `vitest.config.ts`, `tests/setup.ts`
- ✅ Cria scripts: `test-quick.sh`, `test-all.sh`

**Tempo**: ~15 segundos

### Passo 2: Validar Setup
```bash
# Rodar testes (vai mostrar "no tests" porque ainda não criamos nenhum)
npm run test

# Deve aparecer:
# "No test files found"
# Isso é NORMAL! Só criamos a infraestrutura.
```

---

## ✍️ Criar Seu Primeiro Teste

Vamos criar um teste simples para validar que tudo funciona:

### Criar arquivo de teste:
```bash
# Criar diretório se não existir
mkdir -p tests/unit/lib

# Criar teste de exemplo
cat > tests/unit/lib/exemplo.test.ts << 'EOF'
import { describe, it, expect } from 'vitest'

describe('Teste de Exemplo', () => {
  it('deve somar dois números', () => {
    const resultado = 2 + 2
    expect(resultado).toBe(4)
  })

  it('deve concatenar strings', () => {
    const resultado = 'Hello' + ' ' + 'World'
    expect(resultado).toBe('Hello World')
  })
})
EOF
```

### Rodar o teste:
```bash
npm run test
```

**Saída esperada**:
```
✓ tests/unit/lib/exemplo.test.ts (2)
  ✓ Teste de Exemplo (2)
    ✓ deve somar dois números
    ✓ deve concatenar strings

Test Files  1 passed (1)
     Tests  2 passed (2)
```

🎉 **Parabéns! Testes rodando localmente!**

---

## 📋 Comandos Úteis (SEM Docker)

### Durante Desenvolvimento (Watch Mode)
```bash
# Testes rodam automaticamente quando você salva arquivos
npm run test:watch
```

**Vantagens**:
- ⚡ Feedback instantâneo
- 🔄 Re-roda apenas testes afetados
- 🎯 Foco no que você está editando

### Antes de Commit (Testes Rápidos)
```bash
# Roda apenas testes dos arquivos que você modificou
./scripts/test-quick.sh
```

### Antes de PR (Suite Completa)
```bash
# Roda TUDO: lint + type-check + testes + coverage
./scripts/test-all.sh
```

### Ver Coverage (Relatório HTML)
```bash
# Gera relatório em coverage/index.html
npm run test:coverage

# Abrir no navegador (Windows)
start coverage/index.html

# Ou (Linux/Mac)
open coverage/index.html
```

---

## 🐳 E o Docker? Quando usar?

### Opção A: **SEM Docker** (RECOMENDADO para dev local)
```bash
# Terminal 1: App rodando
npm run dev

# Terminal 2: Testes em watch mode
npm run test:watch
```

**Vantagens**:
- ⚡ Mais rápido
- 🔧 Mais fácil debugar
- 💻 Menos recursos (RAM/CPU)

### Opção B: **COM Docker** (Opcional - ambiente isolado)
```bash
# Subir app + test-runner
docker-compose -f docker-compose.dev.yml --profile testing up -d

# Ver logs de testes
docker-compose -f docker-compose.dev.yml logs -f test-runner

# Executar testes manualmente dentro do container
docker exec -it consultorai-test-runner npm run test
```

**Quando usar Docker para testes**:
- ✅ Quer isolar ambiente completamente
- ✅ Testar em ambiente próximo à produção
- ✅ CI/CD (GitHub Actions)
- ❌ **NÃO é necessário para desenvolvimento diário**

---

## 🎯 Workflow Recomendado (Dia-a-dia)

### Manhã (início do dia):
```bash
# 1. Pull latest
git pull origin main

# 2. Instalar dependências (se houver novas)
npm install

# 3. Rodar testes para garantir que tudo está OK
npm run test:coverage
```

### Durante Desenvolvimento:
```bash
# Terminal 1: App
npm run dev

# Terminal 2: Testes em watch mode
npm run test:watch

# Desenvolver normalmente - testes rodam automaticamente! ⚡
```

### Antes de Commit:
```bash
# Testes rápidos (só arquivos modificados)
./scripts/test-quick.sh

# Se passar, commit
git add .
git commit -m "feat: nova funcionalidade"
```

### Antes de PR:
```bash
# Suite completa
./scripts/test-all.sh

# Se tudo passar:
git push origin minha-branch
```

---

## 🧪 Exemplo Completo: Criar Teste Real

Vamos criar um teste real para a função de validação de leads:

### 1. Criar arquivo de teste:
`tests/unit/lib/validations/lead.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
import { leadCreateSchema, leadUpdateSchema } from '@/lib/validations/lead'

describe('Lead Validation', () => {
  describe('leadCreateSchema', () => {
    it('deve aceitar lead válido', () => {
      const validLead = {
        consultant_id: 'consultant-123',
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'novo',
      }

      const result = leadCreateSchema.safeParse(validLead)

      expect(result.success).toBe(true)
    })

    it('deve rejeitar whatsapp_number inválido', () => {
      const invalidLead = {
        consultant_id: 'consultant-123',
        whatsapp_number: '123', // Muito curto
        name: 'João Silva',
        status: 'novo',
      }

      const result = leadCreateSchema.safeParse(invalidLead)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('whatsapp_number')
      }
    })

    it('deve rejeitar status inválido', () => {
      const invalidLead = {
        consultant_id: 'consultant-123',
        whatsapp_number: '+5511999998888',
        name: 'João Silva',
        status: 'invalido', // Status não existe
      }

      const result = leadCreateSchema.safeParse(invalidLead)

      expect(result.success).toBe(false)
    })
  })
})
```

### 2. Rodar apenas este teste:
```bash
npm run test tests/unit/lib/validations/lead.test.ts
```

### 3. Ver coverage deste arquivo:
```bash
npm run test:coverage -- tests/unit/lib/validations/lead.test.ts
```

---

## 📊 Entendendo a Saída dos Testes

### Saída Típica de Sucesso:
```
✓ tests/unit/lib/validations/lead.test.ts (3)
  ✓ Lead Validation (3)
    ✓ deve aceitar lead válido
    ✓ deve rejeitar whatsapp_number inválido
    ✓ deve rejeitar status inválido

Test Files  1 passed (1)
     Tests  3 passed (3)
  Start at  16:30:45
  Duration  245ms
```

### Saída de Teste Falhando:
```
❯ tests/unit/lib/validations/lead.test.ts (3)
  ❯ Lead Validation (3)
    × deve aceitar lead válido

AssertionError: expected false to be true

 ❯ tests/unit/lib/validations/lead.test.ts:15:7
      13|       const result = leadCreateSchema.safeParse(validLead)
      14|
      15|       expect(result.success).toBe(true)
        |       ^
      16|     })

Test Files  1 failed (1)
     Tests  1 failed | 2 passed (3)
```

**Como debugar**:
1. Olhar a linha indicada (`:15:7`)
2. Ver o erro (`expected false to be true`)
3. Adicionar `console.log(result)` para investigar
4. Corrigir o código
5. Testes rodam automaticamente no watch mode!

---

## 🐞 Troubleshooting

### "No test files found"
**Causa**: Ainda não criou arquivos `.test.ts` ou `.spec.ts`

**Solução**:
```bash
# 1. Verificar se setup foi executado
ls tests/unit/

# 2. Criar teste de exemplo
cat > tests/unit/exemplo.test.ts << 'EOF'
import { describe, it, expect } from 'vitest'
describe('Exemplo', () => {
  it('funciona', () => expect(true).toBe(true))
})
EOF

# 3. Rodar testes
npm run test
```

### "Cannot find module '@/...'"
**Causa**: Path alias não configurado

**Solução**:
```bash
# Verificar se vitest.config.ts tem:
# resolve: {
#   alias: {
#     '@': path.resolve(__dirname, './src'),
#   },
# }

# Re-executar setup
./scripts/setup-sprint1-tests.sh
```

### "Module not found: Can't resolve '@testing-library/react'"
**Causa**: Dependências de teste não instaladas

**Solução**:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Testes muito lentos
**Causa**: Rodando todos os testes sempre

**Solução**:
```bash
# Use watch mode (roda apenas testes afetados)
npm run test:watch

# Ou testes rápidos (apenas arquivos modificados)
./scripts/test-quick.sh
```

---

## ✅ Checklist de Sucesso

Após executar o setup, você deve ter:

- [ ] Diretórios criados: `tests/unit/`, `tests/integration/`, `tests/e2e/`, `tests/fixtures/`
- [ ] Fixtures: `tests/fixtures/leads.ts`, `tests/fixtures/flows.ts`
- [ ] Mocks: `tests/mocks/supabase.ts`, `tests/mocks/next-router.ts`
- [ ] Configs: `vitest.config.ts` atualizado
- [ ] Scripts: `test-quick.sh`, `test-all.sh` executáveis
- [ ] `npm run test` executa sem erros (mesmo que sem testes ainda)
- [ ] `npm run test:coverage` gera relatório em `coverage/`

---

## 🎯 Próximos Passos

1. **Criar primeiro teste real**: Escolha um módulo simples (ex: validações)
2. **Usar watch mode**: `npm run test:watch` para feedback instantâneo
3. **Seguir Sprint 2**: Criar testes críticos (Flow Engine, AI Service)
4. **Aumentar cobertura**: Adicionar testes conforme desenvolve

---

## 📚 Documentação Relacionada

- **Plano Completo**: `docs/guides/PLANO-TESTES-DOCKER.md`
- **Padrões de Teste**: `.rules/testing-standards.md`
- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/

---

## 💡 Dica de Ouro

**Use watch mode SEMPRE durante desenvolvimento**:
```bash
npm run test:watch
```

- ⚡ Testes rodam automaticamente quando você salva
- 🎯 Roda apenas testes afetados (super rápido)
- 🐛 Feedback instantâneo se algo quebrou
- 🚀 Produtividade máxima!

---

**Última atualização**: 2026-01-12
**Dúvidas?** Consulte `.rules/testing-standards.md` ou abra uma issue
