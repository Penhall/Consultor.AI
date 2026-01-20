# Plano de Próximos Passos - Consultor.AI

**Data**: 2026-01-20
**Status Atual**: MVP Fase 1 ✅ COMPLETO | Fase 1.5 (Testes) ✅ COMPLETO

---

## Resumo da Avaliação

### Estado Atual do Projeto

| Aspecto           | Status  | Observações                               |
| ----------------- | ------- | ----------------------------------------- |
| **Core Features** | ✅ 100% | Todos os 7 user stories P1 implementados  |
| **API Routes**    | ✅ 100% | 14/14 endpoints funcionando               |
| **Testes**        | ✅ 100% | 240/240 passando (22 suites)              |
| **CI/CD**         | ✅ 100% | GitHub Actions configurado                |
| **Docker**        | ✅ 95%  | Configuração correta (scripts corrigidos) |
| **TypeScript**    | ⚠️ 95%  | ~15 erros em testes (produção OK)         |
| **Documentação**  | ✅ 100% | CLAUDE.md e tasks.md atualizados          |

### Discrepâncias Corrigidas

1. **Scripts Docker** (`package.json`):
   - ❌ Antes: Apontavam para `configs/docker/` (arquivos desatualizados)
   - ✅ Agora: Apontam para root (arquivos corretos)
   - Adicionados: `docker:prod`, `docker:prod:down`, `docker:build`

2. **Documentação** (CLAUDE.md, tasks.md):
   - ❌ Antes: Mostrava 95.4% testes passando (227/238)
   - ✅ Agora: 100% testes passando (240/240)

3. **Estrutura Docker**:
   - `configs/docker/` marcado como deprecated
   - Arquivos root são a fonte da verdade

---

## Plano de Próximos Passos

### Prioridade 1: Preparação para Produção (1-2 dias)

#### 1.1 Corrigir Erros TypeScript em Testes

**Impacto**: Build pipeline pode falhar em CI strict mode

```bash
# Arquivos que precisam correção:
tests/unit/lib/flow-engine/executors.test.ts
tests/unit/lib/flow-engine/parser.test.ts
tests/unit/lib/flow-engine/state-manager.test.ts
tests/unit/lib/services/ai-service.test.ts
tests/unit/lib/services/lead-service.test.ts
```

**Principais problemas**:

- Tipos de mock não alinhados com tipos de produção
- Propriedades opcionais não tratadas
- Variáveis declaradas mas não usadas

#### 1.2 Limpar Duplicação Docker

```bash
# Remover arquivos deprecated (ou manter como backup)
configs/docker/docker-compose.dev.yml  # Versão antiga
configs/docker/Dockerfile.dev          # Versão antiga
```

---

### Prioridade 2: Fase 2 - Polimento (1-2 semanas)

#### 2.1 Lead Detail Page Completo

- [ ] Visualização completa de dados do lead
- [ ] Histórico de conversas
- [ ] Timeline de interações
- [ ] Edição de status inline

#### 2.2 Exportação de Leads

- [ ] Export CSV com filtros aplicados
- [ ] Export Excel (xlsx)
- [ ] Seleção de colunas
- [ ] Download em background para grandes volumes

#### 2.3 Filtros Avançados no Dashboard

- [ ] Filtro por data range
- [ ] Filtro por score
- [ ] Filtro por status múltiplo
- [ ] Busca por nome/telefone

#### 2.4 Monitoramento de Erros

- [ ] Integrar Sentry
- [ ] Configurar alertas
- [ ] Dashboard de erros

---

### Prioridade 3: Fase 3 - Expansão (2-4 semanas)

#### 3.1 Segundo Vertical (Imóveis)

- [ ] Flow template para imóveis
- [ ] Campos específicos para imóveis
- [ ] Compliance para setor imobiliário

#### 3.2 Integração CRM

- [ ] RD Station webhook
- [ ] Pipedrive API
- [ ] Agendor integration
- [ ] Retry logic com backoff

#### 3.3 Templates de Mensagens

- [ ] Biblioteca de templates
- [ ] Variables personalizáveis
- [ ] Preview antes de enviar

---

## Comandos Docker Atualizados

```bash
# Desenvolvimento
npm run docker:up        # Iniciar containers dev
npm run docker:down      # Parar containers dev
npm run docker:logs      # Ver logs
npm run docker:ps        # Status dos containers
npm run docker:clean     # Remover volumes

# Produção
npm run docker:prod      # Iniciar produção
npm run docker:prod:down # Parar produção
npm run docker:build     # Build images
```

---

## Checklist para Deploy em Produção

### Pré-Deploy

- [ ] Todos os testes passando (`npm test`)
- [ ] Build sem erros (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/TLS configurado
- [ ] Domain configurado

### Variáveis de Ambiente Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google AI
GOOGLE_AI_API_KEY=
GOOGLE_AI_MODEL=gemini-1.5-flash

# Meta WhatsApp
NEXT_PUBLIC_META_APP_ID=
META_APP_SECRET=
META_APP_ACCESS_TOKEN=
META_WEBHOOK_VERIFY_TOKEN=

# Encryption
ENCRYPTION_KEY=  # 32 bytes para AES-256-GCM

# Redis (opcional para rate limiting)
REDIS_URL=
REDIS_PASSWORD=
```

### Deploy Commands

```bash
# Build e start production
docker-compose up -d --build

# Verificar health
curl http://localhost:3000/api/health

# Ver logs
docker-compose logs -f app
```

---

## Métricas de Sucesso

| Métrica                | Target | Atual       |
| ---------------------- | ------ | ----------- |
| Testes Passando        | 100%   | ✅ 100%     |
| Cobertura de Código    | 80%    | -           |
| API Latency (P95)      | <500ms | -           |
| AI Response Time       | <3s    | -           |
| Build Time             | <5min  | ~45s ✅     |
| Zero TypeScript Errors | ✅     | ⚠️ (testes) |

---

## Conclusão

O projeto está em **excelente estado** para ir para produção:

✅ **Pronto**:

- Core features funcionando
- Testes 100% passando
- CI/CD configurado
- Docker configurado
- Documentação atualizada

⚠️ **Melhorias Recomendadas** (não bloqueiam deploy):

- Corrigir erros TypeScript em testes
- Adicionar Sentry para monitoramento
- Completar funcionalidades da Fase 2

O MVP está **production-ready** para testes com consultores beta.
