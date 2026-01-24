# Guia de Teste Local com Docker

**Ultima Atualizacao**: 2026-01-20

Este guia explica como configurar e testar o Consultor.AI localmente usando Docker.

---

## Opcoes de Execucao

| Modo                   | Comando                  | Descricao                               |
| ---------------------- | ------------------------ | --------------------------------------- |
| **Stack Completa**     | `npm run docker:full:up` | Supabase + App + Redis (tudo em Docker) |
| **Dev + Supabase CLI** | `npm run local:start`    | App em Docker + Supabase via CLI        |
| **Apenas App**         | `npm run docker:up`      | Apenas Next.js + Redis                  |
| **Sem Docker**         | `npm run dev`            | Desenvolvimento local puro              |

**Recomendado para iniciantes**: Stack Completa (`npm run docker:full:up`)

---

## Pre-requisitos

### Software Necessário

| Software       | Versão Mínima | Verificar                  |
| -------------- | ------------- | -------------------------- |
| Docker Desktop | 4.0+          | `docker --version`         |
| Docker Compose | 2.0+          | `docker-compose --version` |
| Node.js        | 20.0+         | `node --version`           |
| npm            | 10.0+         | `npm --version`            |
| Git            | 2.0+          | `git --version`            |

### Instalação do Docker

**Windows**:

1. Baixe [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/)
2. Execute o instalador
3. Reinicie o computador
4. Abra Docker Desktop e aguarde inicializar

**Linux**:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Logout e login novamente
```

**macOS**:

1. Baixe [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop/)
2. Arraste para Applications
3. Abra e aguarde inicializar

---

## Configuração Inicial

### 1. Clone o Repositório

```bash
git clone https://github.com/Penhall/Consultor.AI.git
cd Consultor.AI
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local
```

### 4. Edite o `.env.local`

Abra o arquivo `.env.local` e configure as variáveis essenciais:

```env
# ==================================
# CONFIGURAÇÃO MÍNIMA PARA TESTE LOCAL
# ==================================

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Local (valores padrão do Supabase local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Google AI (obtenha em https://makersuite.google.com/app/apikey)
GOOGLE_AI_API_KEY=sua-chave-aqui
GOOGLE_AI_MODEL=gemini-1.5-flash

# Encryption Key (gere com: openssl rand -base64 32)
ENCRYPTION_KEY=chave-de-32-bytes-aqui-base64

# Meta WhatsApp (para testes completos - opcional)
NEXT_PUBLIC_META_APP_ID=seu-app-id
META_APP_SECRET=seu-app-secret
META_WEBHOOK_VERIFY_TOKEN=token-aleatorio

# Redis (configuração padrão do Docker)
REDIS_URL=redis://:consultorai_password@localhost:6379
REDIS_PASSWORD=consultorai_password
```

#### Gerando a Encryption Key

```bash
# Linux/macOS
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Ou use este valor de teste (NÃO use em produção):
# ENCRYPTION_KEY=dGVzdC1lbmNyeXB0aW9uLWtleS0zMi1ieXRlcw==
```

---

## Iniciando o Ambiente

### Opcao 1: Stack Completa (Recomendado)

Esta opcao sobe TODA a infraestrutura localmente, incluindo Supabase completo:

```bash
# Inicia todos os servicos (pode levar 2-3 minutos na primeira vez)
npm run docker:full:up

# Verificar status de todos os containers
npm run docker:full:ps

# Ver logs em tempo real
npm run docker:full:logs
```

**URLs Disponiveis**:

- **Aplicacao**: http://localhost:3000
- **Supabase API**: http://localhost:54321
- **Supabase Studio**: http://localhost:54323
- **Inbucket (Email)**: http://localhost:54324
- **PostgreSQL**: localhost:54322 (user: postgres, password: postgres)
- **Redis**: localhost:6379 (password: consultorai_password)

**Containers iniciados**:
| Container | Descricao | Porta |
|-----------|-----------|-------|
| consultorai-app | Next.js application | 3000 |
| consultorai-kong | API Gateway | 54321 |
| consultorai-db | PostgreSQL 15 | 54322 |
| consultorai-studio | Supabase Studio UI | 54323 |
| consultorai-auth | GoTrue (auth) | 9999 |
| consultorai-rest | PostgREST | 3001 |
| consultorai-realtime | Realtime subscriptions | 4000 |
| consultorai-storage | File storage | 5000 |
| consultorai-meta | Postgres Meta | 8080 |
| consultorai-redis | Cache | 6379 |
| consultorai-inbucket | Email testing | 54324 |
| consultorai-imgproxy | Image transformations | 8080 |

### Opcao 2: Apenas App Docker (Rapido)

```bash
# Terminal 1: Inicia Supabase local
npm run db:start

# Aguarde o Supabase inicializar (~30 segundos)
# Você verá as credenciais locais no terminal

# Terminal 2: Inicia Docker
npm run docker:up

# Ou use o comando combinado:
npm run local:start
```

### Opção 3: Desenvolvimento sem Docker

```bash
# Inicia apenas o servidor Next.js (sem Docker)
npm run dev
```

**Nota**: Nesta opção, você precisa de um Supabase remoto ou local rodando separadamente.

---

## Verificando a Instalação

### 1. Health Check da API

```bash
curl http://localhost:3000/api/health
```

**Resposta esperada**:

```json
{
  "status": "ok",
  "timestamp": "2026-01-20T...",
  "version": "0.1.0"
}
```

### 2. Acessar o Dashboard

1. Abra http://localhost:3000
2. Clique em "Entrar" ou "Cadastrar"
3. Crie uma conta de teste

### 3. Verificar Containers Docker

```bash
# Lista containers rodando
docker ps

# Saída esperada:
# CONTAINER ID   IMAGE                  STATUS          PORTS
# abc123...      consultorai-app        Up 5 minutes    0.0.0.0:3000->3000/tcp
# def456...      redis:7-alpine         Up 5 minutes    0.0.0.0:6379->6379/tcp
```

---

## Testando as Funcionalidades

### 1. Criar Conta de Consultor

1. Acesse http://localhost:3000/auth/signup
2. Preencha:
   - Email: `teste@exemplo.com`
   - Senha: `SenhaForte123!`
   - Nome: `Consultor Teste`
   - Telefone: `11999999999`
3. Clique em "Cadastrar"

### 2. Acessar o Dashboard

1. Faça login em http://localhost:3000/auth/login
2. Você será redirecionado para `/dashboard`
3. Explore as páginas:
   - `/dashboard` - Visão geral
   - `/dashboard/leads` - Lista de leads
   - `/dashboard/analytics` - Métricas e gráficos

### 3. Testar API de Leads

```bash
# Listar leads (requer autenticação via cookie)
curl http://localhost:3000/api/leads

# Criar lead via API (para testes)
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "whatsapp_number": "5511999999999",
    "name": "Lead Teste",
    "status": "novo"
  }'
```

### 4. Testar Webhook do WhatsApp (Mock)

```bash
# Simula mensagem recebida do WhatsApp
curl -X POST http://localhost:3000/api/webhook/mock \
  -H "Content-Type: application/json" \
  -d '{
    "consultantId": "test-consultant-id",
    "from": "5511988887777",
    "message": "Olá, quero saber sobre planos de saúde"
  }'
```

### 5. Executar Testes Automatizados

```bash
# Todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Testes com interface visual
npm run test:ui

# Testes E2E (requer app rodando)
npm run test:e2e
```

---

## Comandos Docker Uteis

### Stack Completa (Supabase + App)

| Comando                       | Descricao                            |
| ----------------------------- | ------------------------------------ |
| `npm run docker:full:up`      | Inicia stack completa                |
| `npm run docker:full:down`    | Para stack completa                  |
| `npm run docker:full:logs`    | Ver logs de todos os containers      |
| `npm run docker:full:ps`      | Status de todos os containers        |
| `npm run docker:full:clean`   | Remove containers, volumes e imagens |
| `npm run docker:full:rebuild` | Rebuild completo                     |
| `npm run docker:full:restart` | Reinicia toda a stack                |
| `npm run local:full`          | Alias para docker:full:up            |
| `npm run local:full:stop`     | Alias para docker:full:down          |

### Apenas App (Requer Supabase externo)

| Comando                | Descricao                   |
| ---------------------- | --------------------------- |
| `npm run docker:up`    | Inicia containers dev       |
| `npm run docker:down`  | Para containers dev         |
| `npm run docker:logs`  | Ver logs em tempo real      |
| `npm run docker:ps`    | Status dos containers       |
| `npm run docker:clean` | Remove containers e volumes |
| `npm run docker:prod`  | Inicia em modo producao     |
| `npm run docker:build` | Rebuild das imagens         |

### Comandos Docker Diretos

```bash
# Rebuild forçado
docker-compose -f docker-compose.dev.yml build --no-cache

# Acessar shell do container
docker exec -it consultorai-dev sh

# Ver uso de recursos
docker stats

# Limpar tudo (CUIDADO: remove dados)
docker system prune -a
```

---

## Estrutura dos Containers

### Desenvolvimento (`docker-compose.dev.yml`)

```
┌─────────────────────────────────────┐
│           consultorai-dev           │
│  ┌─────────────────────────────┐   │
│  │   Next.js Dev Server        │   │
│  │   Port: 3000                │   │
│  │   Hot Reload: Enabled       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Volumes:                           │
│  - ./src → /app/src (hot-reload)   │
│  - ./public → /app/public          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         consultorai-redis           │
│  ┌─────────────────────────────┐   │
│  │   Redis 7 Alpine            │   │
│  │   Port: 6379                │   │
│  │   Password: consultorai_*   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Produção (`docker-compose.yml`)

```
┌─────────────────────────────────────┐
│           consultorai-app           │
│  ┌─────────────────────────────┐   │
│  │   Next.js Standalone        │   │
│  │   Port: 3000                │   │
│  │   Multi-stage build         │   │
│  │   Non-root user             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         consultorai-redis           │
│  ┌─────────────────────────────┐   │
│  │   Redis 7 Alpine            │   │
│  │   Persistence: AOF          │   │
│  │   Healthcheck: Enabled      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## Supabase Local (Opcional)

### Iniciar Supabase Local

```bash
# Inicia todos os serviços Supabase
npm run db:start

# Aguarde e anote as credenciais exibidas:
# - API URL: http://localhost:54321
# - Anon Key: eyJ...
# - Service Role Key: eyJ...
# - Studio URL: http://localhost:54323
```

### Acessar Supabase Studio

- **URL**: http://localhost:54323
- Visualize tabelas, execute queries, gerencie dados

### Comandos Supabase

```bash
npm run db:start      # Iniciar
npm run db:stop       # Parar
npm run db:status     # Ver status
npm run db:reset      # Reset completo (PERDE DADOS)
npm run db:migrate    # Aplicar migrations
npm run db:types      # Gerar tipos TypeScript
```

---

## Troubleshooting

### Stack Completa - Problemas Comuns

#### Kong nao inicia (erro de configuracao)

```bash
# Verifique se o arquivo kong.yml existe
ls docker/volumes/kong/kong.yml

# Verifique logs do Kong
docker logs consultorai-kong

# Recrie a configuracao se necessario
npm run docker:full:clean && npm run docker:full:up
```

#### Database nao conecta

```bash
# Verifique se o DB esta rodando
docker logs consultorai-db

# Teste conexao direta
docker exec -it consultorai-db psql -U postgres -c "SELECT 1"

# Aguarde o DB inicializar completamente (pode levar 30-60s)
docker-compose -f docker-compose.full.yml logs -f db
```

#### Auth service falha

```bash
# Verifique logs do GoTrue
docker logs consultorai-auth

# O auth depende do DB - certifique que o DB esta saudavel
docker exec -it consultorai-db pg_isready -U postgres
```

#### Studio nao abre

```bash
# Studio depende do Meta e Kong
docker logs consultorai-studio
docker logs consultorai-meta

# Verifique se todos os servicos estao healthy
npm run docker:full:ps
```

#### Resetar tudo (ultimo recurso)

```bash
# Remove TUDO: containers, volumes, imagens
npm run docker:full:clean

# Remove tambem dados do Docker
docker system prune -a --volumes

# Reinicia do zero
npm run docker:full:up
```

### Container nao inicia (geral)

```bash
# Verifique logs de erro
docker-compose -f docker-compose.dev.yml logs app

# Possíveis causas:
# 1. Porta 3000 em uso
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# 2. Falta de memória Docker
# Aumente no Docker Desktop: Settings → Resources → Memory (mínimo 4GB)
```

### Problema: Erro de conexão com Redis

```bash
# Verifique se Redis está rodando
docker ps | grep redis

# Teste conexão
docker exec -it consultorai-redis redis-cli ping
# Deve retornar: PONG
```

### Problema: Hot-reload não funciona

```bash
# No Windows, pode ser necessário polling
# Já configurado no docker-compose.dev.yml:
# - WATCHPACK_POLLING=true
# - CHOKIDAR_USEPOLLING=true

# Se ainda não funcionar, reinicie:
npm run docker:down && npm run docker:up
```

### Problema: Erro de permissão no Linux

```bash
# Adicione seu usuário ao grupo docker
sudo usermod -aG docker $USER

# Logout e login, ou:
newgrp docker
```

### Problema: Build falha por falta de memória

```bash
# Limpe cache Docker
docker system prune -a

# Aumente memória no Docker Desktop (mínimo 4GB)
# Settings → Resources → Memory
```

### Problema: Variáveis de ambiente não carregam

```bash
# Verifique se .env.local existe
ls -la .env.local

# Recrie a partir do exemplo
cp .env.example .env.local

# Reinicie os containers
npm run docker:down && npm run docker:up
```

---

## URLs Importantes (Stack Completa)

| Servico         | URL                              | Descricao           |
| --------------- | -------------------------------- | ------------------- |
| App             | http://localhost:3000            | Aplicacao principal |
| API Health      | http://localhost:3000/api/health | Health check        |
| Supabase API    | http://localhost:54321           | API Gateway (Kong)  |
| Supabase Studio | http://localhost:54323           | Admin do banco      |
| Inbucket        | http://localhost:54324           | Email testing UI    |
| PostgreSQL      | localhost:54322                  | Conexao direta DB   |
| Redis           | localhost:6379                   | Cache               |

### Credenciais Padrao

**Supabase**:

- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`

**PostgreSQL**:

- Host: `localhost`
- Port: `54322`
- User: `postgres`
- Password: `postgres`
- Database: `postgres`

**Redis**:

- Host: `localhost`
- Port: `6379`
- Password: `consultorai_password`

---

## Próximos Passos

Após configurar o ambiente local:

1. **Explore o código**: Leia `CLAUDE.md` e arquivos em `.rules/`
2. **Execute os testes**: `npm test`
3. **Crie uma feature**: Siga o fluxo em `specs/001-project-specs/tasks.md`
4. **Contribua**: Abra um PR seguindo as guidelines

---

## Suporte

- **Issues**: https://github.com/Penhall/Consultor.AI/issues
- **Documentação**: `/docs/guides/`
- **Regras de Desenvolvimento**: `/.rules/`
