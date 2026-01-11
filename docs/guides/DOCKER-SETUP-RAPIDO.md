# Docker Setup Rápido - Consultor.AI

**Data:** 2026-01-09
**Objetivo:** Rodar toda a aplicação (Supabase + App) via Docker

---

## 🎯 Duas Opções Disponíveis

### ⚡ Opção 1: Modo Rápido (RECOMENDADO AGORA)

Use quando precisar iniciar o desenvolvimento **rapidamente**:

```bash
# 1. Garantir que Supabase está rodando
npx supabase start

# 2. Iniciar aplicação Next.js
npm run dev
```

**Pronto!** Acesse: `http://localhost:3000`

---

### 🐳 Opção 2: Tudo via Docker (EM DESENVOLVIMENTO)

Use quando quiser **isolar completamente** o ambiente:

```bash
# Iniciar tudo com um comando
./scripts/dev-start.sh
```

Ou manualmente:

```bash
# 1. Verificar se Supabase está rodando
docker ps | grep supabase

# 2. Iniciar aplicação via Docker Compose
docker-compose -f docker-compose.dev.yml up --build
```

---

## 📋 Comandos Úteis

### Verificar status

```bash
# Ver containers rodando
docker ps

# Ver apenas Supabase
docker ps | grep supabase

# Ver apenas aplicação
docker ps | grep consultorai
```

### Logs

```bash
# Logs do Supabase
npx supabase logs

# Logs da aplicação (se rodando via Docker)
docker-compose -f docker-compose.dev.yml logs -f app

# Logs da aplicação (se rodando via npm)
# Os logs aparecem no terminal onde executou npm run dev
```

### Parar serviços

```bash
# Parar tudo (script)
./scripts/dev-stop.sh

# Parar apenas aplicação Docker
docker-compose -f docker-compose.dev.yml down

# Parar apenas Supabase
npx supabase stop

# Parar tudo (Supabase + App Docker)
docker-compose -f docker-compose.dev.yml down && npx supabase stop
```

### Reiniciar

```bash
# Reiniciar aplicação Docker
docker-compose -f docker-compose.dev.yml restart app

# Reiniciar Supabase
npx supabase restart

# Reiniciar tudo
./scripts/dev-stop.sh && ./scripts/dev-start.sh
```

---

## 🔧 Troubleshooting

### ❌ Erro: "Port 3000 already in use"

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar comando direto
pkill -f "next dev"
```

### ❌ Erro: "Cannot connect to Supabase"

```bash
# Verificar se Supabase está rodando
docker ps | grep supabase

# Se não estiver, iniciar
npx supabase start

# Verificar porta 54321
curl http://localhost:54321/rest/v1/
```

### ❌ Docker build muito lento

O npm install pode demorar. Para desenvolver mais rápido, use **Opção 1** (npm run dev).

### ❌ Erro: "network consultorai-dev not found"

```bash
# Recriar rede
docker network create consultorai-dev

# Ou deixar o docker-compose criar automaticamente
docker-compose -f docker-compose.dev.yml up
```

---

## 📦 O que foi criado?

### Arquivos novos:

1. **`Dockerfile.dev`** - Container para desenvolvimento com hot-reload
2. **`docker-compose.dev.yml`** - Orquestração da aplicação
3. **`scripts/dev-start.sh`** - Script para iniciar tudo
4. **`scripts/dev-stop.sh`** - Script para parar tudo

### Configurações:

- **Porta 3000**: Aplicação Next.js
- **Porta 54321**: Supabase API
- **Porta 54323**: Supabase Studio

- **Volumes**: Código é montado para permitir hot-reload
- **Network**: Bridge personalizada para isolar aplicação

---

## 🚀 Workflow Recomendado

### Para desenvolvimento diário:

```bash
# Manhã - iniciar ambiente
npx supabase start
npm run dev

# Durante o dia - trabalhe normalmente
# O código atualiza automaticamente (hot-reload)

# Final do dia - parar (opcional)
Ctrl+C  # no terminal do npm run dev
npx supabase stop  # se quiser economizar recursos
```

### Para testes de integração:

```bash
# Use Docker Compose para garantir ambiente limpo
docker-compose -f docker-compose.dev.yml up --build
```

---

## 💡 Dicas

1. **Use Opção 1** para desenvolvimento rápido
2. **Use Opção 2** para testes de integração ou deployment
3. **Mantenha Supabase rodando** o tempo todo (é leve)
4. **Pare a aplicação** quando não estiver usando (economiza RAM)

---

## 🔗 Links Úteis

- Aplicação: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Simulador WhatsApp: http://localhost:3000/dashboard/test/whatsapp-simulator
- Supabase Studio: http://localhost:54323
- Health Check: http://localhost:3000/api/health

---

**Última atualização**: 2026-01-09
**Status**: Opção 1 ✅ | Opção 2 🏗️ (em desenvolvimento)
