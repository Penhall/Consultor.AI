# Guia de Teste de UI - Consultor.AI

**Data**: 2026-01-30
**Versão**: 0.3.0

---

## Resumo de Problemas Identificados

### Bugs Corrigidos

| Bug                                                         | Status       | Correção                                |
| ----------------------------------------------------------- | ------------ | --------------------------------------- |
| `/cadastro` redirecionava para `/auth/signup` (inexistente) | ✅ CORRIGIDO | Agora redireciona para `/auth/register` |

### Problemas Pendentes

| Problema            | Prioridade | Descrição                                                                      |
| ------------------- | ---------- | ------------------------------------------------------------------------------ |
| Páginas placeholder | Média      | `/dashboard/conversas`, `/dashboard/fluxos`, `/dashboard/perfil` são estáticas |
| Duplicação de rotas | Baixa      | `/dashboard/flows` (funcional) vs `/dashboard/fluxos` (placeholder)            |
| Performance         | Alta       | Tempo de carregamento entre páginas (investigar)                               |

---

## Mapa de Rotas da Aplicação

### Rotas Públicas

| Alias    | Endpoint    | Status       | Tipo                              |
| -------- | ----------- | ------------ | --------------------------------- |
| Landing  | `/`         | ✅ Funcional | Página estática                   |
| Login    | `/login`    | ✅ Redirect  | Redireciona para `/auth/login`    |
| Cadastro | `/cadastro` | ✅ Redirect  | Redireciona para `/auth/register` |

### Rotas de Autenticação

| Alias         | Endpoint                | Status       | Tipo       |
| ------------- | ----------------------- | ------------ | ---------- |
| Login Form    | `/auth/login`           | ✅ Funcional | Formulário |
| Registro      | `/auth/register`        | ✅ Funcional | Formulário |
| Esqueci Senha | `/auth/forgot-password` | ⚠️ Verificar | Formulário |
| Reset Senha   | `/auth/reset-password`  | ⚠️ Verificar | Formulário |

### Rotas do Dashboard (Protegidas)

| Alias           | Endpoint                             | Status         | Tipo             | Depende de              |
| --------------- | ------------------------------------ | -------------- | ---------------- | ----------------------- |
| Dashboard Home  | `/dashboard`                         | ✅ Funcional   | Client Component | `useAuth`               |
| Leads           | `/dashboard/leads`                   | ✅ Funcional   | Client Component | `/api/leads`            |
| Lead Detalhe    | `/dashboard/leads/[id]`              | ✅ Funcional   | Client Component | `/api/leads/[id]`       |
| Analytics       | `/dashboard/analytics`               | ✅ Funcional   | Client Component | `/api/analytics/*`      |
| Flows           | `/dashboard/flows`                   | ✅ Funcional   | Client Component | `/api/flows`            |
| Flow Editor     | `/dashboard/flows/[id]`              | ✅ Funcional   | Client Component | `/api/flows/[id]`       |
| Novo Flow       | `/dashboard/flows/new`               | ✅ Funcional   | Client Component | -                       |
| Integrações     | `/dashboard/integracoes`             | ✅ Funcional   | Client Component | `/api/integrations/crm` |
| Templates       | `/dashboard/templates`               | ✅ Funcional   | Client Component | `/api/templates`        |
| Perfil          | `/dashboard/perfil`                  | ⚠️ Placeholder | Estático         | -                       |
| WhatsApp Setup  | `/dashboard/perfil/whatsapp`         | ⚠️ Verificar   | Meta OAuth       | Meta API                |
| Conversas       | `/dashboard/conversas`               | ⚠️ Placeholder | Estático         | -                       |
| Fluxos (antigo) | `/dashboard/fluxos`                  | ⚠️ Deprecated  | Estático         | -                       |
| Simulador WA    | `/dashboard/test/whatsapp-simulator` | ⚠️ Verificar   | Test Tool        | -                       |

---

## Roteiro de Testes Manuais

### Teste 1: Landing Page e Navegação

| Passo | Ação                            | Resultado Esperado                             |
| ----- | ------------------------------- | ---------------------------------------------- |
| 1.1   | Acessar `http://localhost:3000` | Landing page carrega com título "Consultor.AI" |
| 1.2   | Clicar "Começar Agora"          | Redireciona para `/auth/register`              |
| 1.3   | Voltar e clicar "Fazer Login"   | Redireciona para `/auth/login`                 |

**Critérios de Aceite:**

- [ ] Landing carrega em < 2s
- [ ] Botões funcionam corretamente
- [ ] Sem erros 404

---

### Teste 2: Fluxo de Registro

| Passo | Ação                         | Resultado Esperado                             |
| ----- | ---------------------------- | ---------------------------------------------- |
| 2.1   | Acessar `/auth/register`     | Formulário de registro exibido                 |
| 2.2   | Preencher nome, email, senha | Campos validados em tempo real                 |
| 2.3   | Clicar "Criar Conta"         | Redirecionamento para dashboard ou confirmação |

**Critérios de Aceite:**

- [ ] Validação de email formato
- [ ] Validação de senha mínima
- [ ] Mensagens de erro claras
- [ ] Feedback visual de loading

---

### Teste 3: Fluxo de Login

| Passo | Ação                          | Resultado Esperado          |
| ----- | ----------------------------- | --------------------------- |
| 3.1   | Acessar `/auth/login`         | Formulário de login exibido |
| 3.2   | Inserir credenciais válidas   | Login bem-sucedido          |
| 3.3   | Verificar redirecionamento    | Vai para `/dashboard`       |
| 3.4   | Inserir credenciais inválidas | Mensagem de erro exibida    |

**Critérios de Aceite:**

- [ ] Login funciona com credenciais válidas
- [ ] Erro claro para credenciais inválidas
- [ ] Sessão persiste após refresh

---

### Teste 4: Dashboard Home

| Passo | Ação                               | Resultado Esperado                                    |
| ----- | ---------------------------------- | ----------------------------------------------------- |
| 4.1   | Acessar `/dashboard` (logado)      | Dashboard carrega com saudação                        |
| 4.2   | Verificar cards de métricas        | 3 cards: Total Leads, Conversas Ativas, Limite Mensal |
| 4.3   | Verificar seção "Primeiros Passos" | 3 passos listados                                     |

**Critérios de Aceite:**

- [ ] Nome do consultor exibido
- [ ] Cards mostram valores (0 se sem dados)
- [ ] Layout responsivo

---

### Teste 5: Gestão de Leads

| Passo | Ação                       | Resultado Esperado               |
| ----- | -------------------------- | -------------------------------- |
| 5.1   | Acessar `/dashboard/leads` | Lista de leads ou mensagem vazia |
| 5.2   | Aplicar filtro por status  | Lista atualiza com filtro        |
| 5.3   | Clicar em um lead          | Painel de detalhe abre           |
| 5.4   | Alterar status do lead     | Status atualiza visualmente      |
| 5.5   | Clicar "Exportar CSV"      | Download inicia                  |

**API Dependencies:**

- `GET /api/leads` - Lista leads
- `GET /api/leads/[id]` - Detalhe do lead
- `PATCH /api/leads/[id]` - Atualizar lead
- `GET /api/leads/export` - Exportar CSV

**Critérios de Aceite:**

- [ ] Lista carrega com skeleton loading
- [ ] Filtros funcionam
- [ ] Detalhe do lead exibe timeline
- [ ] Export gera arquivo válido

---

### Teste 6: Analytics Dashboard

| Passo | Ação                           | Resultado Esperado              |
| ----- | ------------------------------ | ------------------------------- |
| 6.1   | Acessar `/dashboard/analytics` | Página de analytics carrega     |
| 6.2   | Verificar 6 metric cards       | Cards exibem valores ou loading |
| 6.3   | Verificar gráfico de pizza     | Distribuição por status         |
| 6.4   | Verificar gráfico de barras    | Distribuição por perfil         |

**API Dependencies:**

- `GET /api/analytics/overview` - Métricas
- `GET /api/analytics/charts` - Dados dos gráficos
- `GET /api/analytics/activity` - Atividade recente

**Critérios de Aceite:**

- [ ] Métricas carregam corretamente
- [ ] Gráficos renderizam (mesmo sem dados)
- [ ] Loading states visíveis

---

### Teste 7: Gestão de Fluxos

| Passo | Ação                           | Resultado Esperado        |
| ----- | ------------------------------ | ------------------------- |
| 7.1   | Acessar `/dashboard/flows`     | Lista de fluxos exibida   |
| 7.2   | Filtrar por vertical           | Lista filtra corretamente |
| 7.3   | Clicar menu de fluxo           | Dropdown com ações        |
| 7.4   | Duplicar um fluxo              | Modal abre para nomear    |
| 7.5   | Acessar `/dashboard/flows/new` | Editor de novo fluxo      |

**API Dependencies:**

- `GET /api/flows` - Lista fluxos
- `POST /api/flows/[id]/duplicate` - Duplicar
- `POST /api/flows/[id]/activate` - Ativar

**Critérios de Aceite:**

- [ ] Fluxo padrão de saúde existe
- [ ] Ações do menu funcionam
- [ ] Status ativo/inativo visível

---

### Teste 8: Integrações CRM

| Passo | Ação                             | Resultado Esperado            |
| ----- | -------------------------------- | ----------------------------- |
| 8.1   | Acessar `/dashboard/integracoes` | Página de integrações carrega |
| 8.2   | Clicar "Nova Integração"         | Modal de conexão abre         |
| 8.3   | Selecionar RD Station            | Formulário específico exibido |
| 8.4   | Ver histórico de sync            | Tabela de logs exibida        |

**API Dependencies:**

- `GET /api/integrations/crm` - Lista integrações
- `POST /api/integrations/crm` - Criar integração
- `GET /api/integrations/crm/logs` - Histórico

**Critérios de Aceite:**

- [ ] Providers disponíveis: RD Station, Pipedrive
- [ ] Validação de API key
- [ ] Histórico paginado

---

### Teste 9: Templates de Mensagens

| Passo | Ação                           | Resultado Esperado    |
| ----- | ------------------------------ | --------------------- |
| 9.1   | Acessar `/dashboard/templates` | Lista de templates    |
| 9.2   | Criar novo template            | Formulário de criação |
| 9.3   | Editar template existente      | Campos editáveis      |
| 9.4   | Excluir template               | Confirmação e remoção |

**API Dependencies:**

- `GET /api/templates` - Lista templates
- `POST /api/templates` - Criar template
- `PATCH /api/templates/[id]` - Atualizar
- `DELETE /api/templates/[id]` - Excluir

**Critérios de Aceite:**

- [ ] CRUD completo funciona
- [ ] Variáveis detectadas no conteúdo
- [ ] Categorias funcionam

---

### Teste 10: Navegação do Dashboard

| Passo | Ação                     | Resultado Esperado                 |
| ----- | ------------------------ | ---------------------------------- |
| 10.1  | Clicar cada item do menu | Página correspondente carrega      |
| 10.2  | Verificar breadcrumbs    | Navegação clara                    |
| 10.3  | Testar logout            | Sessão encerrada, volta para login |

**Itens do Menu para Testar:**

- [ ] Dashboard (Home)
- [ ] Leads
- [ ] Analytics
- [ ] Fluxos
- [ ] Integrações
- [ ] Templates
- [ ] Perfil

---

## Testes de API (Backend)

### Health Check

```bash
curl http://localhost:3000/api/health
```

**Esperado:** `{"status":"ok","timestamp":"..."}`

---

### Leads API

```bash
# Listar leads
curl http://localhost:3000/api/leads -H "Cookie: ..."

# Criar lead (precisa auth)
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","whatsapp_number":"+5511999887766"}'
```

---

### Analytics API

```bash
# Overview
curl http://localhost:3000/api/analytics/overview -H "Cookie: ..."

# Charts
curl http://localhost:3000/api/analytics/charts?days=30 -H "Cookie: ..."
```

---

## Checklist de Performance

| Métrica                  | Alvo    | Como Medir  |
| ------------------------ | ------- | ----------- |
| First Contentful Paint   | < 1.5s  | Lighthouse  |
| Time to Interactive      | < 3s    | Lighthouse  |
| Largest Contentful Paint | < 2.5s  | Lighthouse  |
| API Response Time (P95)  | < 500ms | Network tab |

### Verificar Performance

1. Abrir DevTools (F12)
2. Tab "Network"
3. Navegar entre páginas
4. Verificar tempo de cada request

**Páginas Críticas para Testar:**

- [ ] `/dashboard` - Deve carregar < 2s
- [ ] `/dashboard/leads` - Deve carregar lista < 1s
- [ ] `/dashboard/analytics` - Gráficos < 2s

---

## Páginas que Precisam de Implementação

### Alta Prioridade

| Página                 | Status Atual | Ação Necessária                   |
| ---------------------- | ------------ | --------------------------------- |
| `/dashboard/perfil`    | Estático     | Conectar com API do consultor     |
| `/dashboard/conversas` | Placeholder  | Implementar listagem de conversas |

### Média Prioridade

| Página                       | Status Atual | Ação Necessária                       |
| ---------------------------- | ------------ | ------------------------------------- |
| `/dashboard/fluxos`          | Deprecated   | Remover ou redirecionar para `/flows` |
| `/dashboard/perfil/whatsapp` | Parcial      | Testar OAuth Meta                     |

---

## Rotas de API por Status

### Funcionais (Testados)

- ✅ `GET /api/health`
- ✅ `GET /api/leads`
- ✅ `POST /api/leads`
- ✅ `GET /api/leads/[id]`
- ✅ `PATCH /api/leads/[id]`
- ✅ `DELETE /api/leads/[id]`
- ✅ `GET /api/leads/export`
- ✅ `GET /api/leads/stats`
- ✅ `GET /api/analytics/overview`
- ✅ `GET /api/analytics/charts`
- ✅ `GET /api/analytics/activity`
- ✅ `GET /api/flows`
- ✅ `POST /api/flows`
- ✅ `GET /api/flows/[id]`
- ✅ `POST /api/flows/[id]/activate`
- ✅ `POST /api/flows/[id]/duplicate`
- ✅ `GET /api/integrations/crm`
- ✅ `POST /api/integrations/crm`
- ✅ `GET /api/templates`
- ✅ `POST /api/templates`

### Requerem Teste Manual

- ⚠️ `POST /api/webhook/meta/[consultantId]` - Webhook WhatsApp
- ⚠️ `POST /api/consultants/meta-callback` - OAuth Meta
- ⚠️ `POST /api/conversations/start` - Iniciar conversa
- ⚠️ `POST /api/integrations/crm/[id]/sync` - Sync CRM
- ⚠️ `POST /api/integrations/crm/[id]/test` - Test connection

---

## Comandos para Diagnóstico

```bash
# Verificar build
npm run build

# Rodar testes
npm test

# Verificar tipos
npm run type-check

# Verificar lint
npm run lint

# Iniciar dev server
npm run dev
```

---

## Próximos Passos

1. **Imediato**: Testar fluxo completo de registro → login → dashboard
2. **Curto prazo**: Implementar páginas placeholder (perfil, conversas)
3. **Médio prazo**: Remover rotas duplicadas (fluxos)
4. **Performance**: Investigar tempo de carregamento entre páginas

---

**Última Atualização**: 2026-01-30
