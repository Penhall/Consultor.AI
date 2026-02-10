# Deployment Guide

Este guia descreve como fazer deploy do Consultor.AI em diferentes ambientes.

## Pre-requisitos

- Node.js 20+
- npm 10+
- Docker (para deploy containerizado)
- Conta Supabase (ou Supabase self-hosted)
- Conta Vercel (opcional, para deploy serverless)

## Variaveis de Ambiente

### Obrigatorias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Criptografia
ENCRYPTION_KEY=base64-encoded-32-byte-key

# Site URL
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com.br
```

### Opcionais

```env
# AI
GOOGLE_AI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...

# WhatsApp
META_APP_ID=123456789
META_APP_SECRET=abcdef123456
META_VERIFY_TOKEN=seu-token-verificacao

# CRM (para integracoes)
RD_STATION_CLIENT_ID=
RD_STATION_CLIENT_SECRET=
PIPEDRIVE_API_TOKEN=

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info

# Performance
NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS=false
```

## Deploy com Docker

### Producao

```bash
# Build da imagem
docker build -t consultor-ai:latest .

# Executar container
docker run -d \
  --name consultor-ai \
  -p 3000:3000 \
  --env-file .env.production \
  consultor-ai:latest
```

### Docker Compose

```bash
# Iniciar todos os servicos
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## Deploy na Vercel

### Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy (producao)
vercel --prod
```

### Via GitHub

1. Conecte seu repositorio a Vercel
2. Configure as variaveis de ambiente no dashboard
3. Push para `main` aciona deploy automatico

### Configuracoes Vercel

No `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["gru1"]
}
```

## Supabase

### Migracao de Banco

```bash
# Local para remoto
npx supabase db push

# Gerar tipos TypeScript
npx supabase gen types typescript --project-id=seu-projeto > src/types/database.ts
```

### Seed Data

```bash
# Executar seed
npx supabase db reset
```

## Checklist Pre-Deploy

- [ ] Todas as variaveis de ambiente configuradas
- [ ] Migrations aplicadas no Supabase remoto
- [ ] Build local funciona: `npm run build`
- [ ] Testes passam: `npm test`
- [ ] Lint sem erros: `npm run lint`

## Checklist Pos-Deploy

- [ ] Site acessivel no dominio
- [ ] Login/Signup funcionando
- [ ] Dashboard carrega corretamente
- [ ] Webhook WhatsApp configurado
- [ ] Sentry recebendo eventos
- [ ] Logs visiveis na plataforma

## Rollback

### Vercel

```bash
# Listar deployments
vercel ls

# Promover deploy anterior para producao
vercel promote [deployment-url]
```

### Docker

```bash
# Parar container atual
docker stop consultor-ai

# Iniciar com imagem anterior
docker run -d --name consultor-ai -p 3000:3000 consultor-ai:previous-tag
```

## Monitoramento de Deploy

### Health Check

```bash
curl https://seu-dominio.com.br/api/health
```

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-27T10:00:00.000Z",
    "version": "0.2.1"
  }
}
```

### Metricas

- Uptime: > 99.5%
- TTFB: < 500ms
- Build time: < 5min

## Troubleshooting

### Build falha

1. Verifique erros de TypeScript: `npm run type-check`
2. Verifique erros de ESLint: `npm run lint`
3. Limpe cache: `rm -rf .next node_modules && npm install`

### 500 errors em producao

1. Verifique logs no Vercel/Docker
2. Confirme variaveis de ambiente
3. Verifique conexao com Supabase
4. Verifique Sentry para stack traces

### Performance ruim

1. Analise bundle: `npm run analyze`
2. Verifique queries N+1
3. Revise cache headers
4. Considere edge caching (Vercel/Cloudflare)

## SSL/TLS

- Vercel: SSL automatico
- Docker: Configure reverse proxy (nginx/traefik) com Let's Encrypt

## Backups

### Supabase

- Backups automaticos diarios (plano Pro+)
- Export manual: `npx supabase db dump`

### Arquivos

- Armazenados no Supabase Storage
- Configure replicacao para DR se necessario
