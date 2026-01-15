# ✅ Sprint 2: Checklist de Progresso

**Data Início**: 2026-01-12
**Status**: EM ANDAMENTO
**Meta**: 40-50% cobertura de código
**Tempo Estimado**: 16 horas (2 semanas, 1-2h/dia)

---

## 🚀 Como Usar Este Checklist

1. **Marque `[x]`** quando completar uma tarefa
2. **Execute testes** após cada implementação: `npm run test:watch`
3. **Veja coverage** periodicamente: `npm run test:coverage`
4. **Commit** após cada módulo completo

---

## 📦 Setup Inicial

- [x] Executar script de setup: `./scripts/setup-sprint2-tests.sh`
- [ ] Validar que testes skeleton executam: `npm run test`
- [ ] Abrir watch mode: `npm run test:watch`

---

## 🔥 Módulo 1: Flow Engine (6h total)

### Parser Tests (2h) - ⭐⭐⭐ CRÍTICO

**Arquivo**: `tests/unit/lib/flow-engine/parser.test.ts`

**Implementação**:
- [ ] T037a: Implementar `validateFlowDefinition()` - aceitar flow válido
- [ ] T037b: Validar estrutura básica (id, nome, versao, vertical, etapas)
- [ ] T037c: Detectar referência circular
- [ ] T037d: Detectar referência inexistente
- [ ] T037e: Validar tipos de step (mensagem, escolha, executar)
- [ ] T037f: Validar IDs únicos

**Testes**:
- [ ] ✅ Todos os 17 testes do parser.test.ts passando
- [ ] 📊 Coverage do parser.ts > 80%

**Comando**: `npm run test tests/unit/lib/flow-engine/parser.test.ts`

---

### State Manager Tests (1.5h) - ⭐⭐⭐ CRÍTICO

**Arquivo**: `tests/unit/lib/flow-engine/state-manager.test.ts`

**Implementação**:
- [ ] T038a: Implementar `saveConversationState()`
- [ ] T038b: Implementar `loadConversationState()`
- [ ] T038c: Implementar `updateConversationVariables()`
- [ ] T038d: Implementar `getStepHistory()`

**Testes** (implementar seguindo template):
- [ ] Deve salvar estado em Supabase
- [ ] Deve recuperar estado corretamente
- [ ] Deve atualizar variáveis (perfil, idade, coparticipacao)
- [ ] Deve manter histórico de steps visitados
- [ ] Deve lidar com estado inexistente

**Coverage**:
- [ ] 📊 Coverage do state-manager.ts > 80%

**Comando**: `npm run test tests/unit/lib/flow-engine/state-manager.test.ts`

---

### Step Executors Tests (1.5h) - ⭐⭐⭐ CRÍTICO

**Arquivo**: `tests/unit/lib/flow-engine/executors.test.ts`

**Implementação**:
- [ ] T039a: `MessageExecutor` - substituir variáveis `{{nome}}`
- [ ] T039b: `ChoiceExecutor` - validar opções selecionadas
- [ ] T039c: `ExecuteExecutor` - chamar ação (ex: gerar_resposta_ia)
- [ ] T039d: Error handling - lidar com erros em cada executor

**Testes** (implementar seguindo template):
- [ ] MessageExecutor substitui variáveis corretamente
- [ ] MessageExecutor retorna mensagem sem variáveis se não definidas
- [ ] ChoiceExecutor valida opção selecionada existe
- [ ] ChoiceExecutor retorna próximo step correto
- [ ] ExecuteExecutor chama ação correta
- [ ] ExecuteExecutor retorna erro se ação não existe
- [ ] Todos os executors lidam com erros gracefully

**Coverage**:
- [ ] 📊 Coverage do executors.ts > 80%

**Comando**: `npm run test tests/unit/lib/flow-engine/executors.test.ts`

---

### Flow Engine Tests (1h) - ⭐⭐⭐ CRÍTICO

**Arquivo**: `tests/unit/lib/flow-engine/engine.test.ts`

**Implementação**:
- [ ] T040a: `executeFlow()` - orquestrar flow completo
- [ ] T040b: `selectExecutor()` - escolher executor correto por tipo
- [ ] T040c: Error handling - lidar com erros durante execução

**Testes** (implementar seguindo template):
- [ ] Deve executar flow de 3 steps (mensagem → escolha → executar)
- [ ] Deve selecionar MessageExecutor para step tipo 'mensagem'
- [ ] Deve selecionar ChoiceExecutor para step tipo 'escolha'
- [ ] Deve selecionar ExecuteExecutor para step tipo 'executar'
- [ ] Deve parar execução quando step.proxima é null
- [ ] Deve salvar estado após cada step
- [ ] Deve retornar erro se step type inválido

**Coverage**:
- [ ] 📊 Coverage do engine.ts > 80%

**Comando**: `npm run test tests/unit/lib/flow-engine/engine.test.ts`

---

### ✅ Checkpoint Flow Engine

- [ ] **Todos os 4 arquivos testados**: parser, state-manager, executors, engine
- [ ] **Coverage geral do flow-engine**: > 80%
- [ ] **Commit**: `git commit -m "test: Sprint 2 - Flow Engine tests (80% coverage)"`

---

## 🤖 Módulo 2: AI Service (4h total) - ⚠️ MUITO CRÍTICO

### Compliance ANS Tests (3h) - ⭐⭐⭐ MUITO CRÍTICO

**Arquivo**: `tests/unit/lib/services/ai-service.test.ts`

**⚠️ IMPORTANTE**: Compliance ANS é CRÍTICO - falhas podem causar problemas legais!

**Implementação**:
- [ ] T062a: `generateCompliantResponse()` - gerar resposta sem preços exatos
- [ ] T062b: Validar prompt NÃO pede CPF/dados sensíveis
- [ ] T062c: Validar prompt NÃO promete "zero carência" ou "cobertura imediata"
- [ ] T062d: Resposta contém recomendações de planos (mínimo 1-2)
- [ ] T062e: Resposta em português brasileiro
- [ ] T062f: Resposta tem tom empático e acolhedor

**Testes**:
- [ ] ✅ NÃO retorna preços em formato R$ XXX,XX
- [ ] ✅ NÃO retorna faixas de preço (R$ X a R$ Y)
- [ ] ✅ PODE usar termos gerais (mensalidade, valor, investimento)
- [ ] ✅ NÃO pede CPF, RG, documento
- [ ] ✅ NÃO pede histórico médico
- [ ] ✅ NÃO pede dados financeiros (cartão, conta)
- [ ] ✅ NÃO promete cobertura imediata
- [ ] ✅ NÃO garante aceitação sem análise
- [ ] ✅ Contém recomendações de planos
- [ ] ✅ Tom empático (entendo, compreendo, perfeito, ótimo)
- [ ] ✅ Português brasileiro (acentuação, ç)
- [ ] ✅ Comprimento adequado (mínimo 150 caracteres)
- [ ] ✅ Inclui call-to-action

**Todos os 20+ testes do ai-service.test.ts passando** ✅

**Coverage**:
- [ ] 📊 Coverage do ai-service.ts > 90% (CRÍTICO!)

**Comando**: `npm run test tests/unit/lib/services/ai-service.test.ts`

---

### Fallback Tests (1h) - ⭐⭐ IMPORTANTE

**Implementação**:
- [ ] T062g: Fallback template quando Gemini falha
- [ ] T062h: Template específico por perfil (individual, familia, empresa)
- [ ] T062i: Retry logic (tentar 2x antes de fallback)

**Testes**:
- [ ] Retorna template quando Gemini falha (mock API error)
- [ ] Template individual diferente de template familia
- [ ] Tenta 2x antes de usar fallback
- [ ] Template tem mínimo 50 caracteres
- [ ] Template menciona palavra "plano"

**Coverage**:
- [ ] 📊 Fallback functions > 80%

**Comando**: `npm run test tests/unit/lib/services/ai-service.test.ts`

---

### Performance Tests - ⭐⭐ IMPORTANTE

**Testes**:
- [ ] Resposta gerada em < 3 segundos (p95)
- [ ] Fallback retorna em < 100ms

---

### ✅ Checkpoint AI Service

- [ ] **Todos os 20+ testes passando** (compliance + fallback + performance)
- [ ] **Coverage geral do ai-service.ts**: > 90%
- [ ] **CRÍTICO: Zero falhas em compliance tests**
- [ ] **Commit**: `git commit -m "test: Sprint 2 - AI Service compliance tests (90% coverage) ⚠️ CRÍTICO"`

---

## 💼 Módulo 3: Lead Service (3h total)

### CRUD Operations Tests (2h) - ⭐⭐ IMPORTANTE

**Arquivo**: `tests/unit/lib/services/lead-service.test.ts`

**Implementação**:
- [ ] T077a: `createLead()` - criar lead válido
- [ ] T077b: Validar dados obrigatórios (consultant_id, whatsapp_number, name)
- [ ] T077c: `updateLead()` - atualizar status, score, metadata
- [ ] T077d: `deleteLead()` - deletar lead existente
- [ ] T077e: `getLeadById()` - buscar lead por ID

**Testes**:
- [ ] Cria lead com dados válidos (retorna ID)
- [ ] Rejeita lead com whatsapp_number inválido (< 10 dígitos)
- [ ] Rejeita lead sem consultant_id
- [ ] Rejeita lead com status inválido
- [ ] Cria lead com score padrão 0
- [ ] Cria lead com metadata vazio por padrão
- [ ] Atualiza status do lead
- [ ] Atualiza score do lead
- [ ] Atualiza metadata do lead
- [ ] Rejeita atualização com status inválido
- [ ] Rejeita atualização de lead inexistente
- [ ] Deleta lead existente
- [ ] Rejeita deletar lead inexistente
- [ ] Busca lead existente por ID
- [ ] Retorna erro para lead inexistente

**Coverage**:
- [ ] 📊 Coverage do lead-service.ts > 70%

**Comando**: `npm run test tests/unit/lib/services/lead-service.test.ts`

---

### Business Logic Tests (1h) - ⭐⭐ IMPORTANTE

**Implementação**:
- [ ] T077f: `calculateLeadScore()` - calcular score baseado em perfil/idade/copart
- [ ] T077g: `validateStatusTransition()` - validar transições de status
- [ ] T077h: `validateWhatsAppNumber()` - validar formato do número

**Testes**:
- [ ] Calcula score para perfil individual (0-100)
- [ ] Score alto para perfil empresa (>= 70)
- [ ] Considera idade no cálculo
- [ ] Considera coparticipação no cálculo
- [ ] Retorna 0 para dados incompletos
- [ ] Permite transição novo → em_contato
- [ ] Permite transição em_contato → qualificado
- [ ] Permite transição qualificado → fechado
- [ ] Permite transição qualquer → perdido
- [ ] Rejeita transição fechado → novo
- [ ] Rejeita transição perdido → qualificado
- [ ] Rejeita transição novo → fechado (pula etapas)
- [ ] Valida número brasileiro (+5511999998888)
- [ ] Rejeita número sem código do país
- [ ] Rejeita número muito curto
- [ ] Rejeita número com caracteres inválidos
- [ ] Aceita números internacionais

**Coverage**:
- [ ] 📊 Business logic functions > 80%

---

### ✅ Checkpoint Lead Service

- [ ] **Todos os 30+ testes passando** (CRUD + business logic)
- [ ] **Coverage geral do lead-service.ts**: > 70%
- [ ] **Commit**: `git commit -m "test: Sprint 2 - Lead Service tests (70% coverage)"`

---

## 📊 Módulo 4: Analytics Service (3h total)

### Metrics Tests (2h) - ⭐⭐ IMPORTANTE

**Arquivo**: `tests/unit/lib/services/analytics-service.test.ts`

**Implementação**:
- [ ] T090a: `getLeadCountByStatus()` - contar leads por status
- [ ] T090b: `getAverageScore()` - calcular média de score
- [ ] T090c: `getConversionRate()` - calcular taxa de conversão (fechados/total)
- [ ] T090d: `getAverageResponseTime()` - tempo médio de resposta

**Testes**:
- [ ] Conta leads por status corretamente
- [ ] Retorna 0 para todos status quando não há leads
- [ ] Conta corretamente quando todos têm o mesmo status
- [ ] Calcula média de score corretamente
- [ ] Retorna 0 quando não há leads
- [ ] Ignora leads com score null/undefined
- [ ] Arredonda para 2 casas decimais
- [ ] Lida com valores extremos (0 e 100)
- [ ] Calcula taxa de conversão corretamente
- [ ] Retorna 0 quando não há leads
- [ ] Retorna 0 quando nenhum lead fechado
- [ ] Retorna 100 quando todos leads fechados
- [ ] Arredonda taxa para 2 casas decimais
- [ ] Calcula tempo médio de resposta em minutos
- [ ] Retorna 0 quando não há conversas
- [ ] Ignora conversas sem primeira resposta
- [ ] Converte horas em minutos corretamente

**Coverage**:
- [ ] 📊 Coverage metrics functions > 70%

**Comando**: `npm run test tests/unit/lib/services/analytics-service.test.ts`

---

### Charts Tests (1h) - ⭐⭐ IMPORTANTE

**Implementação**:
- [ ] T090e: `getPieChartData()` - formatar dados para pie chart
- [ ] T090f: `getBarChartData()` - agrupar leads por data
- [ ] T090g: `filterByDateRange()` - filtrar leads por período

**Testes**:
- [ ] Formata dados para pie chart corretamente
- [ ] Calcula percentagens corretamente
- [ ] Retorna array vazio quando não há leads
- [ ] Agrupa leads por data (day) corretamente
- [ ] Agrupa leads por semana quando solicitado
- [ ] Agrupa leads por mês quando solicitado
- [ ] Ordena resultados por data (mais antigo primeiro)
- [ ] Filtra leads dentro do range
- [ ] Inclui datas de início e fim (inclusive)
- [ ] Retorna todos leads quando não há filtro
- [ ] Filtra apenas por startDate quando endDate não fornecido
- [ ] Filtra apenas por endDate quando startDate não fornecido

**Coverage**:
- [ ] 📊 Coverage charts functions > 70%

---

### Edge Cases Tests

**Testes**:
- [ ] Lida com leads sem timestamps
- [ ] Lida com dados malformados gracefully
- [ ] Retorna métricas vazias para array vazio

---

### ✅ Checkpoint Analytics Service

- [ ] **Todos os 30+ testes passando** (metrics + charts + edge cases)
- [ ] **Coverage geral do analytics-service.ts**: > 70%
- [ ] **Commit**: `git commit -m "test: Sprint 2 - Analytics Service tests (70% coverage)"`

---

## 🎉 Conclusão Sprint 2

### Coverage Geral

Execute: `npm run test:coverage`

**Metas**:
- [ ] **Flow Engine**: > 80% coverage
- [ ] **AI Service**: > 90% coverage ⚠️ CRÍTICO
- [ ] **Lead Service**: > 70% coverage
- [ ] **Analytics Service**: > 70% coverage
- [ ] **GERAL**: 40-50% coverage 🎯

### Final Checklist

- [ ] Todos os 100+ testes passando
- [ ] Coverage geral entre 40-50%
- [ ] Zero falhas em compliance tests (AI Service)
- [ ] Documentação atualizada
- [ ] Commit final: `git commit -m "feat: Sprint 2 completo - 40-50% coverage"`
- [ ] Push para GitHub: `git push origin 001-project-specs`

---

## 📈 Progresso Visual

```
Sprint 2 Progress: [████████░░░░░░░░░░░░] 40%

✅ Flow Engine:    [████████████░░░░░░░░] 60%
✅ AI Service:     [░░░░░░░░░░░░░░░░░░░░] 0%
✅ Lead Service:   [░░░░░░░░░░░░░░░░░░░░] 0%
✅ Analytics:      [░░░░░░░░░░░░░░░░░░░░] 0%
```

**Atualizar manualmente após cada checkpoint!**

---

## 🆘 Ajuda Rápida

### Comandos Úteis

```bash
# Watch mode (recomendado)
npm run test:watch

# Testar arquivo específico
npm run test tests/unit/lib/flow-engine/parser.test.ts

# Ver coverage
npm run test:coverage

# Rodar todos os testes
npm run test

# Ver coverage de módulo específico
npm run test:coverage -- tests/unit/lib/flow-engine
```

### Troubleshooting

**Testes não executam?**
- Verifique que executou `./scripts/setup-sprint2-tests.sh`
- Verifique que fixtures existem em `tests/fixtures/`

**Imports não resolvem?**
- Verifique alias `@/` em `vitest.config.ts`
- Verifique `tsconfig.json` tem `paths` configurado

**Mocks não funcionam?**
- Verifique `tests/setup.ts`
- Verifique `tests/mocks/supabase.ts`

---

**Última atualização**: 2026-01-12
**Status**: ✅ PRONTO PARA USO
**Próximo**: Começar implementação Flow Engine!
