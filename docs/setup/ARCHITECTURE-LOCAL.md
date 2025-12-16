# Arquitetura de Desenvolvimento Local

## 🏗️ Visão Geral

Este documento descreve a arquitetura completa do ambiente de desenvolvimento local do Consultor.AI, permitindo desenvolver 100% offline com serviços simulados.

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOCALHOST                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │   Next.js App    │         │  Supabase Stack  │            │
│  │   :3000          │◄────────┤   :54321         │            │
│  │                  │         │                  │            │
│  │  - Frontend      │         │  - Auth          │            │
│  │  - API Routes    │         │  - PostgreSQL    │            │
│  │  - Webhooks      │         │  - Storage       │            │
│  └────────┬─────────┘         │  - Edge Funcs    │            │
│           │                   └──────────────────┘            │
│           │                                                    │
│           ├──────────────┬──────────────┬─────────────┐       │
│           │              │              │             │       │
│  ┌────────▼───────┐  ┌──▼──────────┐ ┌─▼──────────┐ ┌▼──────────┐
│  │   Mock Server  │  │   Redis     │ │  MailHog   │ │ Services  │
│  │   :3001        │  │   :6379     │ │  :8025     │ │ (Real)    │
│  │                │  │             │ │            │ │           │
│  │ - WhatsApp API │  │ - Cache     │ │ - SMTP UI  │ │ - Google  │
│  │ - Google AI    │  │ - Sessions  │ │ - Capture  │ │   AI      │
│  │ - Canva API    │  │ - Queue     │ │   Emails   │ │ - Weni    │
│  └────────────────┘  └─────────────┘ └────────────┘ └───────────┘
│                                                                 │
│  ┌──────────────────┐                                          │
│  │ Redis Commander  │                                          │
│  │ :8081            │                                          │
│  │ - Redis UI       │                                          │
│  └──────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Fluxo de Comunicação

### 1. Desenvolvimento Normal (Mocks)

```
Usuário → Next.js (:3000)
            ↓
    ┌───────┴────────┐
    ↓                ↓
Supabase        Mock Server
(:54321)        (:3001)
    ↓                ↓
PostgreSQL      [Simula APIs]
(:54322)        - WhatsApp
                - Google AI
                - Canva
```

### 2. Produção (APIs Reais)

```
Usuário → Next.js (:3000)
            ↓
    ┌───────┴────────┐
    ↓                ↓
Supabase (Cloud)   APIs Externas
    ↓               ↓
    └───────┬───────┘
            ↓
        Services
```

## 🎯 Estratégias de Desenvolvimento

### Modo 1: 100% Local (Desenvolvimento Inicial)

**Quando usar**: Desenvolvimento de features básicas sem dependências externas

**Configuração** (`.env.local`):
```bash
# APIs Mockadas
WHATSAPP_API_URL=http://localhost:3001/v1
GOOGLE_AI_API_KEY=mock-google-ai-key
CANVA_API_URL=http://localhost:3001/v1

# Serviços locais
SMTP_HOST=localhost
SMTP_PORT=1025
REDIS_URL=redis://:consultorai_dev_password@localhost:6379
```

**Vantagens**:
- ✅ Zero custo
- ✅ Desenvolvimento offline
- ✅ Respostas instantâneas
- ✅ Testes reproduzíveis

**Limitações**:
- ❌ Respostas mockadas (não realistas)
- ❌ Não testa integrações reais

### Modo 2: Híbrido (Desenvolvimento Avançado)

**Quando usar**: Testar integrações reais mantendo infraestrutura local

**Configuração** (`.env.local`):
```bash
# APIs Reais
GOOGLE_AI_API_KEY=sua-chave-real
WHATSAPP_API_URL=https://api.weni.ai/v1
WHATSAPP_API_KEY=sua-chave-real

# Infraestrutura Local
SMTP_HOST=localhost
SMTP_PORT=1025
REDIS_URL=redis://:consultorai_dev_password@localhost:6379

# Supabase Local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
```

**Vantagens**:
- ✅ Testa integrações reais
- ✅ Banco de dados local
- ✅ Sem custo de hosting

**Limitações**:
- ❌ Requer chaves de API
- ❌ Custos de uso das APIs

### Modo 3: Cloud Completo (Pré-Produção)

**Quando usar**: Testes finais antes do deploy

**Configuração**: Usar Vercel Preview + Supabase Preview

## 🛠️ Componentes Detalhados

### Next.js App (:3000)

**Responsabilidades**:
- Frontend React
- API Routes (`/api/*`)
- Server Actions
- Webhooks do WhatsApp

**Tecnologias**:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

### Supabase Stack (:54321)

**Serviços incluídos**:

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| API Gateway | 54321 | REST + Realtime |
| PostgreSQL | 54322 | Banco de dados |
| Studio | 54323 | Admin UI |
| Inbucket | 54324 | Email testing |
| Kong | 8000 | API Gateway |
| Auth | - | Autenticação |

**Dados persistidos em**: `.supabase/`

### Mock Server (:3001)

**APIs Mockadas**:

#### WhatsApp Business API
```javascript
// Enviar mensagem
POST /v1/messages
{
  "to": "+5561999999999",
  "type": "text",
  "text": { "body": "Olá!" }
}

// Resposta
{
  "success": true,
  "message_id": "wamid.mock123456789"
}
```

#### Google AI (Gemini)
```javascript
// Gerar resposta
POST /v1beta/models/gemini-1.5-flash:generateContent
{
  "contents": [{
    "parts": [{ "text": "Prompt aqui" }]
  }]
}

// Resposta mockada com texto realista
```

#### Canva API
```javascript
// Criar design
POST /v1/designs
{
  "template_id": "comparison-card",
  "data": { /* ... */ }
}

// Resposta
{
  "design": {
    "id": "mock-design-123",
    "thumbnail": { "url": "..." }
  }
}
```

### Redis (:6379)

**Casos de uso**:

1. **Cache de Sessões**
```typescript
// Armazenar sessão do usuário
await redis.setex(`session:${userId}`, 3600, sessionData)
```

2. **Rate Limiting**
```typescript
// Limitar requisições por IP
const count = await redis.incr(`rate:${ip}`)
await redis.expire(`rate:${ip}`, 60)
if (count > 100) throw new Error('Rate limit exceeded')
```

3. **Filas**
```typescript
// Enfileirar processamento de mensagem
await redis.lpush('queue:messages', JSON.stringify(message))
```

### MailHog (:8025)

**Funcionalidades**:
- Captura TODOS os emails enviados
- Interface web para visualização
- API JSON para testes automatizados
- Suporte a anexos

**Exemplo de uso**:
```typescript
// Aplicação envia email normalmente
await sendEmail({
  to: 'cliente@example.com',
  subject: 'Seu plano de saúde',
  body: '...'
})

// MailHog captura automaticamente
// Visualize em: http://localhost:8025
```

## 🔄 Ciclo de Desenvolvimento

### 1. Inicialização

```bash
# Terminal 1: Serviços Docker
./dev-setup.sh start

# Terminal 2: Aplicação
npm run dev
```

### 2. Desenvolvimento

```
┌─────────────────┐
│ Editar código   │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Hot Reload      │
│ (automático)    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Testar no       │
│ navegador       │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Ver logs        │
│ ./dev-setup.sh  │
│ logs            │
└─────────────────┘
```

### 3. Debugging

**Next.js**:
```typescript
// app/api/route.ts
console.log('Debug:', data) // Aparece no terminal
```

**Supabase**:
```bash
# Ver logs do PostgreSQL
npx supabase logs db
```

**Redis**:
```bash
# Conectar ao CLI
docker exec -it consultorai-redis redis-cli -a consultorai_dev_password

# Ver todas as keys
> KEYS *

# Ver valor
> GET session:user123
```

**MailHog**:
- Abrir http://localhost:8025
- Ver emails capturados
- API: `GET http://localhost:8025/api/v2/messages`

### 4. Testes

```bash
# Testes unitários (com mocks)
npm run test:unit

# Testes de integração (com serviços locais)
npm run test:integration

# Testes E2E (Playwright)
npm run test:e2e
```

## 🔐 Segurança Local

### Credenciais Padrão

| Serviço | Usuário | Senha |
|---------|---------|-------|
| PostgreSQL | postgres | postgres |
| Redis | (nenhum) | consultorai_dev_password |
| Supabase Studio | - | Auto-gerado |

### Boas Práticas

1. **NUNCA commitar `.env.local`**
```bash
# Adicionar ao .gitignore (já está)
.env.local
.env*.local
```

2. **Usar secrets diferentes em prod**
```bash
# Dev
NEXTAUTH_SECRET=dev-secret-123

# Prod
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

3. **Não expor portas publicamente**
```yaml
# docker-compose.dev.yml
ports:
  - "127.0.0.1:6379:6379"  # ✅ Apenas localhost
  # - "6379:6379"          # ❌ Acessível externamente
```

## 📊 Monitoramento Local

### Health Checks

```bash
# Verificar status de todos os serviços
./dev-setup.sh status

# Ou individualmente
curl http://localhost:3000/api/health      # Next.js
curl http://localhost:54321/health         # Supabase
docker ps                                  # Docker services
```

### Logs

```bash
# Todos os logs
./dev-setup.sh logs

# Serviço específico
docker logs -f consultorai-redis
docker logs -f consultorai-mailhog
docker logs -f consultorai-mock-server
```

### Métricas

```bash
# Redis stats
docker exec -it consultorai-redis redis-cli -a consultorai_dev_password INFO stats

# PostgreSQL connections
docker exec -it $(docker ps -qf "name=supabase_db") \
  psql -U postgres -c "SELECT count(*) FROM pg_stat_activity"
```

## 🚀 Performance

### Recursos Utilizados

| Serviço | RAM | CPU | Disco |
|---------|-----|-----|-------|
| Next.js | ~200MB | Baixo | - |
| Supabase | ~500MB | Médio | ~100MB |
| Redis | ~50MB | Baixo | ~10MB |
| PostgreSQL | ~100MB | Médio | ~50MB |
| MailHog | ~20MB | Baixo | ~5MB |
| Mock Server | ~30MB | Baixo | - |
| **TOTAL** | **~900MB** | - | **~165MB** |

### Otimizações

1. **Limitar logs**
```bash
# docker-compose.dev.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

2. **Restart policy**
```yaml
restart: unless-stopped  # Não reinicia se parado manualmente
```

3. **Health checks**
```yaml
healthcheck:
  interval: 30s  # Não sobrecarregar
```

## 📚 Referências

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [MockServer](https://www.mock-server.com/)
- [MailHog](https://github.com/mailhog/MailHog)
- [Redis](https://redis.io/docs/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Next.js](https://nextjs.org/docs)

## 🆘 Troubleshooting Avançado

### Problema: Containers não iniciam

```bash
# Ver logs de criação
docker-compose -f docker-compose.dev.yml up

# Verificar portas em conflito
lsof -i :3001
lsof -i :6379
lsof -i :8025

# Forçar recriação
docker-compose -f docker-compose.dev.yml up --force-recreate
```

### Problema: Banco de dados corrompido

```bash
# Resetar Supabase
npx supabase db reset --no-backup

# Ou limpar tudo
./dev-setup.sh clean
./dev-setup.sh start
```

### Problema: Mock Server não responde

```bash
# Ver logs
docker logs consultorai-mock-server

# Recarregar configuração
docker-compose -f docker-compose.dev.yml restart mock-server

# Testar endpoint
curl http://localhost:3001/v1/messages
```

### Problema: Redis connection refused

```bash
# Verificar se está rodando
docker ps | grep redis

# Testar conexão
docker exec -it consultorai-redis redis-cli -a consultorai_dev_password PING

# Reiniciar
docker restart consultorai-redis
```

---

**Última atualização**: 2025-12-15
**Versão**: 1.0.0
