# 🚀 Guia de Início Rápido - Desenvolvimento Local

Este guia mostra como configurar e executar **100% do ambiente localmente** usando Docker, sem necessidade de serviços em nuvem durante o desenvolvimento.

## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Docker Desktop** ([Download](https://docs.docker.com/get-docker/))
  - Windows: Docker Desktop for Windows
  - macOS: Docker Desktop for Mac
  - Linux: Docker Engine + Docker Compose
- **Node.js 20 LTS** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### Verificar instalação

```bash
docker --version          # Docker 24.0+
docker-compose --version  # Docker Compose 2.0+
node --version            # Node.js 20.x
npm --version             # npm 10.x
```

## 🎯 Setup Automático (Recomendado)

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd Consultor.AI
```

### 2. Execute o script de setup

```bash
# Dá permissão de execução (somente primeira vez)
chmod +x dev-setup.sh

# Inicia todo o ambiente
./dev-setup.sh start
```

O script automaticamente:
- ✅ Verifica dependências
- ✅ Cria arquivo `.env.local` com configurações locais
- ✅ Inicia serviços Docker (Redis, MailHog, Mock Server)
- ✅ Inicia Supabase local
- ✅ Mostra URLs de acesso

### 3. Instale dependências Node.js

```bash
npm install
```

### 4. Inicie a aplicação Next.js

```bash
npm run dev
```

### 5. Acesse o ambiente

O script mostrará todas as URLs disponíveis:

- **Aplicação**: http://localhost:3000
- **Supabase Studio**: http://localhost:54323
- **MailHog (Email)**: http://localhost:8025
- **Redis Commander**: http://localhost:8081
- **Mock Server**: http://localhost:3001

## 🔧 Setup Manual

Se preferir fazer manualmente:

### 1. Criar arquivo de ambiente

```bash
cp .env.example .env.local
```

### 2. Editar `.env.local`

Ajuste as seguintes variáveis para desenvolvimento local:

```bash
# SMTP Local (MailHog)
SMTP_HOST=localhost
SMTP_PORT=1025

# Redis Local
REDIS_URL=redis://:consultorai_dev_password@localhost:6379

# Mock APIs (para testar sem APIs reais)
WHATSAPP_API_URL=http://localhost:3001/v1
GOOGLE_AI_API_KEY=mock-google-ai-key

# NextAuth Secret (gere um novo)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 3. Iniciar serviços Docker

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Iniciar Supabase

```bash
npx supabase start
```

### 5. Copiar credenciais do Supabase

Após `supabase start`, copie as credenciais exibidas no terminal para `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<exibido-no-terminal>
SUPABASE_SERVICE_ROLE_KEY=<exibido-no-terminal>
```

### 6. Instalar dependências

```bash
npm install
```

### 7. Executar migrations

```bash
npm run db:migrate
```

### 8. Iniciar aplicação

```bash
npm run dev
```

## 📊 Serviços Disponíveis

### 1. **Next.js App** (Aplicação Principal)
- URL: http://localhost:3000
- Porta: 3000

### 2. **Supabase Studio** (Admin UI)
- URL: http://localhost:54323
- Porta: 54323
- Login: Email + senha do primeiro usuário criado

### 3. **PostgreSQL** (Banco de Dados)
- Host: localhost
- Porta: 54322
- Usuário: `postgres`
- Senha: `postgres`
- Database: `postgres`

### 4. **MailHog** (Email Local)
- SMTP: localhost:1025
- Web UI: http://localhost:8025
- Uso: Captura todos os emails enviados

### 5. **Redis** (Cache)
- Host: localhost
- Porta: 6379
- Senha: `consultorai_dev_password`

### 6. **Redis Commander** (Redis UI)
- URL: http://localhost:8081
- Uso: Visualizar dados do Redis

### 7. **Mock Server** (APIs Simuladas)
- URL: http://localhost:3001
- Simula: WhatsApp API, Google AI, Canva API

## 🧪 Testando Componentes

### Testar envio de email

```bash
# A aplicação enviará para MailHog automaticamente
# Visualize em: http://localhost:8025
```

### Testar WhatsApp (Mockado)

```bash
curl -X POST http://localhost:3001/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5561999999999",
    "type": "text",
    "text": { "body": "Teste" }
  }'
```

### Testar Google AI (Mockado)

```bash
curl -X POST http://localhost:3001/v1beta/models/gemini-1.5-flash:generateContent \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{ "text": "Gere uma resposta" }]
    }]
  }'
```

### Testar Redis

```bash
# Conectar ao Redis CLI
docker exec -it consultorai-redis redis-cli -a consultorai_dev_password

# Testar comandos
> SET test "Hello World"
> GET test
> EXIT
```

## 🔄 Comandos Úteis do Script

```bash
./dev-setup.sh start     # Inicia todos os serviços
./dev-setup.sh stop      # Para todos os serviços
./dev-setup.sh restart   # Reinicia tudo
./dev-setup.sh status    # Mostra status dos serviços
./dev-setup.sh logs      # Monitora logs em tempo real
./dev-setup.sh urls      # Mostra URLs de acesso
./dev-setup.sh clean     # Limpa volumes e dados (CUIDADO!)
./dev-setup.sh env       # Recria .env.local
```

## 🐛 Troubleshooting

### Porta já em uso

```bash
# Descubra qual processo está usando a porta
lsof -i :3000    # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Pare o processo ou altere a porta no docker-compose.dev.yml
```

### Supabase não inicia

```bash
# Para tudo
npx supabase stop --no-backup

# Limpa volumes
docker volume prune -f

# Reinicia
npx supabase start
```

### Erro de permissão no script

```bash
chmod +x dev-setup.sh
```

### Docker daemon não está rodando

```bash
# Inicie o Docker Desktop
# Ou no Linux:
sudo systemctl start docker
```

### Limpar tudo e recomeçar

```bash
# Para TUDO
./dev-setup.sh stop

# Remove volumes
docker volume prune -f

# Remove containers órfãos
docker container prune -f

# Reinicia do zero
./dev-setup.sh start
```

## 📝 Workflow de Desenvolvimento

1. **Manhã**: `./dev-setup.sh start`
2. **Desenvolvimento**: `npm run dev`
3. **Testar emails**: Abrir http://localhost:8025
4. **Ver banco de dados**: Abrir http://localhost:54323
5. **Debugar Redis**: Abrir http://localhost:8081
6. **Fim do dia**: `./dev-setup.sh stop` (opcional)

## 🔐 Segurança no Desenvolvimento

### ⚠️ NUNCA commitar:
- `.env.local` (contém chaves reais)
- `.env.production` (contém chaves de produção)
- Qualquer arquivo com credenciais

### ✅ SEMPRE commitar:
- `.env.example` (com valores placeholder)
- Configurações Docker
- Scripts de setup

### Verificar antes de commitar:

```bash
# Ver arquivos que serão commitados
git status

# Se `.env.local` aparecer, adicione ao .gitignore
echo ".env.local" >> .gitignore
```

## 📚 Próximos Passos

Após configurar o ambiente local:

1. ✅ Ler `docs/guides/getting-started.md`
2. ✅ Explorar Supabase Studio em http://localhost:54323
3. ✅ Testar bot simulador: `python docs/motivação/snippets\ de\ exemplo/bot_mock.py.py`
4. ✅ Revisar `docs/technical/Implementation-Plan.md`
5. ✅ Começar Sprint 1 (Foundation)

## 🆘 Precisa de Ajuda?

- **Documentação completa**: Ver `/docs`
- **Issues conhecidos**: Verificar GitHub Issues
- **Logs**: `./dev-setup.sh logs`
- **Status**: `./dev-setup.sh status`

## 🎉 Tudo Funcionando?

Se todos os serviços estão rodando:
- ✅ http://localhost:3000 (Next.js)
- ✅ http://localhost:54323 (Supabase)
- ✅ http://localhost:8025 (MailHog)
- ✅ http://localhost:8081 (Redis Commander)

**Parabéns! Seu ambiente está pronto para desenvolvimento.** 🚀

---

**Dica Pro**: Adicione um alias ao seu `.bashrc` ou `.zshrc`:

```bash
alias consultor-start="cd ~/Consultor.AI && ./dev-setup.sh start && npm run dev"
alias consultor-stop="cd ~/Consultor.AI && ./dev-setup.sh stop"
```
