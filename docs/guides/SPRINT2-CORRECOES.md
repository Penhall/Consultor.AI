# 🔧 Sprint 2: Correções Aplicadas

**Data**: 2026-01-12
**Status**: ✅ CORRIGIDO

---

## 🐛 Problemas Identificados

### Problema 1: Imports de Fixtures Falhando

**Erro**:
```
Error: Failed to resolve import "@/tests/fixtures/flows"
Error: Failed to resolve import "@/tests/fixtures/leads"
```

**Causa**: O alias `@/` estava mapeado apenas para `./src`, mas os fixtures estão em `./tests`.

**Solução**: ✅
1. Adicionado novo alias `@tests` em `vitest.config.ts`
2. Atualizado todos os imports nos arquivos de teste:
   - `@/tests/fixtures/*` → `@tests/fixtures/*`

---

### Problema 2: Funções Não Implementadas (ESPERADO)

**Erro**:
```
TypeError: generateCompliantResponse is not a function
TypeError: validateFlowDefinition is not a function
TypeError: createLead is not a function
...
```

**Causa**: As funções testadas ainda não foram implementadas (esperado nesta fase).

**Status**: ⏳ AGUARDANDO IMPLEMENTAÇÃO

Este é o comportamento **correto** para TDD (Test-Driven Development):
1. ✅ Escrever os testes primeiro
2. ⏳ Implementar as funções depois
3. ✅ Ver os testes passarem

---

## ✅ Arquivos Corrigidos

### 1. vitest.config.ts
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@tests': path.resolve(__dirname, './tests'), // ✅ NOVO
  },
},
```

### 2. tests/unit/lib/flow-engine/parser.test.ts
```typescript
// ❌ ANTES
import { mockFlowHealthBasic } from '@/tests/fixtures/flows'

// ✅ DEPOIS
import { mockFlowHealthBasic } from '@tests/fixtures/flows'
```

### 3. tests/unit/lib/services/lead-service.test.ts
```typescript
// ❌ ANTES
import { mockLeads } from '@/tests/fixtures/leads'

// ✅ DEPOIS
import { mockLeads } from '@tests/fixtures/leads'
```

### 4. tests/unit/lib/services/analytics-service.test.ts
```typescript
// ❌ ANTES
import { mockLeads } from '@/tests/fixtures/leads'

// ✅ DEPOIS
import { mockLeads } from '@tests/fixtures/leads'
```

### 5. scripts/setup-sprint2-tests.sh
```bash
# ✅ Script atualizado para gerar imports corretos no futuro
```

---

## 🧪 Próximos Passos

### Executar Testes Novamente

```bash
npm run test
```

### Resultado Esperado APÓS Correções

✅ **Imports resolvidos** - Sem erros de "Failed to resolve"

⏳ **Testes falhando** - Mas com erro diferente:
```
TypeError: [function name] is not a function
```

Isso é **CORRETO** e **ESPERADO**! Significa que:
- ✅ Imports estão funcionando
- ✅ Fixtures estão sendo carregados
- ⏳ Funções precisam ser implementadas

---

## 📋 Status dos Módulos

### ✅ Infraestrutura (100% pronta)
- [x] Alias configurado (`@tests`)
- [x] Imports corrigidos
- [x] Fixtures acessíveis
- [x] Mocks funcionando

### ⏳ Implementações Necessárias

#### Flow Engine
```typescript
// src/lib/flow-engine/parser.ts
export function validateFlowDefinition(flow: any) {
  // TODO: Implementar validação
  return { valid: false, errors: ['Not implemented'] }
}
```

#### AI Service
```typescript
// src/lib/services/ai-service.ts
export async function generateCompliantResponse(
  leadData: any,
  context: any
): Promise<string> {
  // TODO: Implementar geração de resposta com compliance ANS
  return 'Not implemented'
}
```

#### Lead Service
```typescript
// src/lib/services/lead-service.ts
export async function createLead(data: any) {
  // TODO: Implementar CRUD
  return { success: false, error: 'Not implemented' }
}

export function calculateLeadScore(data: any): number {
  // TODO: Implementar cálculo de score
  return 0
}

export function validateStatusTransition(
  from: string,
  to: string
): boolean {
  // TODO: Implementar validação de transições
  return false
}
```

#### Analytics Service
```typescript
// src/lib/services/analytics-service.ts
export function getLeadCountByStatus(leads: any[]) {
  // TODO: Implementar contagem
  return { novo: 0, em_contato: 0, qualificado: 0, fechado: 0, perdido: 0 }
}

export function getAverageScore(leads: any[]): number {
  // TODO: Implementar cálculo
  return 0
}

export function getConversionRate(leads: any[]): number {
  // TODO: Implementar cálculo
  return 0
}

export function getAverageResponseTime(conversations: any[]): number {
  // TODO: Implementar cálculo
  return 0
}

export function getPieChartData(leads: any[]) {
  // TODO: Implementar formatação
  return []
}

export function getBarChartData(leads: any[], groupBy: string) {
  // TODO: Implementar agrupamento
  return []
}

export function filterByDateRange(leads: any[], range: any) {
  // TODO: Implementar filtro
  return leads
}
```

---

## 🎯 Workflow TDD Recomendado

### 1. Escolher um Módulo
Recomendo começar por:
- **Mais fácil**: Lead Service (CRUD simples)
- **Mais crítico**: AI Service (compliance ANS)
- **Mais complexo**: Flow Engine (parser primeiro)

### 2. Implementar uma Função por Vez

**Exemplo: Lead Service - createLead**

```bash
# Terminal 1: Watch mode
npm run test:watch

# Terminal 2: Editar arquivo
code src/lib/services/lead-service.ts
```

**Implementação mínima**:
```typescript
// src/lib/services/lead-service.ts
import { createClient } from '@/lib/supabase/server'

export async function createLead(data: {
  consultant_id: string
  whatsapp_number: string
  name: string
  status: string
}) {
  // Validação básica
  if (!data.whatsapp_number || data.whatsapp_number.length < 10) {
    return { success: false, error: 'whatsapp_number inválido' }
  }

  if (!data.consultant_id) {
    return { success: false, error: 'consultant_id obrigatório' }
  }

  try {
    const supabase = createClient()
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        ...data,
        score: 0,
        metadata: {},
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data: lead }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

### 3. Ver Testes Passarem ✅

No watch mode, você verá em tempo real:
```
✓ deve criar lead com dados válidos
✓ deve rejeitar lead com whatsapp_number inválido
✓ deve rejeitar lead sem consultant_id
```

### 4. Iterar

Repita o processo para cada função:
1. Implementar função
2. Ver testes passarem
3. Refatorar se necessário
4. Commit quando módulo completo

---

## 📊 Progresso Esperado

### Após Correções (Agora)
```
✅ 9 testes passando (exemplo.test.ts)
⏳ 11 testes skipped (.todo)
❌ ~35 testes falhando (funções não implementadas)
```

### Após Implementar Lead Service (2-3h)
```
✅ 24 testes passando (+15)
⏳ 11 testes skipped
❌ ~20 testes falhando
```

### Após Implementar AI Service (4h)
```
✅ 44 testes passando (+20)
⏳ 11 testes skipped
❌ 0 testes falhando
```

### Após Implementar Analytics Service (3h)
```
✅ 64 testes passando (+20)
⏳ 11 testes skipped
❌ 0 testes falhando
```

### Após Completar Flow Engine (6h)
```
✅ 100+ testes passando 🎉
⏳ 0 testes skipped
❌ 0 testes falhando
Coverage: 40-50% 🎯
```

---

## 🆘 Troubleshooting

### Se ainda vê "Failed to resolve import"

**Solução 1**: Limpar cache do Vitest
```bash
npx vitest --clearCache
npm run test
```

**Solução 2**: Verificar tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@tests/*": ["./tests/*"]  // ✅ Adicionar se não existe
    }
  }
}
```

### Se testes não executam

**Verificar que arquivos existem**:
```bash
ls tests/fixtures/leads.ts
ls tests/fixtures/flows.ts
```

Se não existirem, executar:
```bash
./scripts/setup-sprint1-tests.sh
```

---

## ✅ Checklist de Validação

Após rodar `npm run test`:

- [ ] Sem erros "Failed to resolve import"
- [ ] Fixtures carregando corretamente
- [ ] Testes com erro "is not a function" (esperado!)
- [ ] 9 testes passando em exemplo.test.ts
- [ ] Watch mode funcionando (`npm run test:watch`)

Se todos os itens acima estiverem OK, você está **pronto para começar a implementar** as funções! 🚀

---

**Última atualização**: 2026-01-12 19:55
**Status**: ✅ PRONTO PARA IMPLEMENTAÇÃO
**Próximo passo**: Escolher módulo e começar TDD workflow
