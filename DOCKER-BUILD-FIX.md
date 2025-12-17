# Docker Build Fix - Correções Aplicadas

## Problemas Identificados e Solucionados

### 1. ❌ Erro: `Cannot find module 'autoprefixer'`

**Causa**: O Dockerfile estava instalando apenas dependências de produção (`--only=production`), mas o build do Next.js precisa de dependências de desenvolvimento como `autoprefixer`, `postcss`, `tailwindcss`.

**Solução**: Modificado o Dockerfile para instalar TODAS as dependências no stage `builder`:

```dockerfile
# ANTES (errado)
FROM node:20-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules  # ❌ Só prod deps

# DEPOIS (correto)
FROM node:20-alpine AS builder
RUN npm ci --ignore-scripts  # ✅ Instala TODAS as deps (prod + dev)
```

### 2. ❌ Erro: `Module not found: Can't resolve '@supabase/ssr'`

**Causa**: A dependência `@supabase/ssr` não estava listada no `package.json`.

**Solução**: Adicionada ao `package.json`:

```json
"dependencies": {
  "@supabase/ssr": "^0.0.10",
  // ...
}
```

### 3. ⚠️ Warning: `version` is obsolete

**Causa**: Docker Compose não requer mais a declaração `version: '3.8'`.

**Solução**: Removido do `docker-compose.yml`.

## Estrutura do Dockerfile Corrigida

```dockerfile
# Stage 1: Deps (Produção) - Para o stage final
FROM node:20-alpine AS deps
RUN npm ci --only=production --ignore-scripts
# Resultado: node_modules SÓ com dependências de produção

# Stage 2: Builder (Todas) - Para fazer o build
FROM node:20-alpine AS builder
RUN npm ci --ignore-scripts
# Resultado: node_modules com TODAS as dependências
RUN npm run build
# Resultado: .next/standalone + .next/static

# Stage 3: Runner (Final) - Imagem final otimizada
FROM node:20-alpine AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# Resultado: Imagem final SÓ com deps de produção
```

## Por Que Isso Funciona

1. **Stage `deps`**: Instala apenas produção → usado no stage final
2. **Stage `builder`**: Instala tudo (prod + dev) → usado para build
3. **Stage `runner`**: Copia deps de produção + arquivos buildados → imagem final pequena

**Resultado**:
- ✅ Build funciona (tem todas as deps)
- ✅ Imagem final é pequena (só prod deps)
- ✅ Segurança mantida (dev deps não vão para produção)

## Como Testar Agora

### 1. Instalar Nova Dependência Localmente

```bash
npm install
```

### 2. Testar Build Local

```bash
npm run build
# Deve funcionar sem erros
```

### 3. Testar Docker Build

```bash
# Rebuild sem cache
docker-compose build --no-cache

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f app
```

### 4. Verificar Aplicação

```bash
# Health check
curl http://localhost:3000/api/health

# Abrir navegador
# http://localhost:3000
```

## Troubleshooting

### Ainda dá erro de módulo faltando

```bash
# 1. Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# 2. Verificar package.json
cat package.json | grep "@supabase/ssr"
# Deve aparecer

# 3. Rebuild Docker sem cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Build demora muito

Isso é normal na primeira vez. O Docker está:
1. Baixando imagem Node.js Alpine
2. Instalando todas as dependências
3. Compilando o Next.js

Builds subsequentes serão mais rápidos devido ao cache.

### Erro de memória durante build

Se você tiver pouco RAM disponível:

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_OPTIONS: "--max-old-space-size=4096"  # Aumenta memória
```

## Próximos Passos

Depois que o build funcionar:

1. ✅ Configure as variáveis de ambiente no `.env`
2. ✅ Obtenha a SECRET_KEY do Supabase
3. ✅ Configure o Google AI API Key
4. ✅ Teste a aplicação completa

## Referências

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Supabase SSR Package](https://github.com/supabase/auth-helpers)
