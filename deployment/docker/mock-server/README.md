# Docker Setup - Consultor.AI

Este diretório contém a configuração Docker para desenvolvimento local do Consultor.AI.

## Estrutura

```
docker/
├── README.md                    # Este arquivo
├── mock-server/                 # Configuração do Mock Server
│   ├── initializerJson.json    # Mocks das APIs externas
│   └── mockserver.properties   # Configurações do Mock Server
└── (futuros serviços adicionais)
```

## Serviços Disponíveis

### 1. MailHog (SMTP Local)
- **Porta SMTP**: 1025
- **Porta Web UI**: 8025
- **Acesso**: http://localhost:8025
- **Uso**: Captura todos os emails enviados pela aplicação

### 2. Redis (Cache & Rate Limiting)
- **Porta**: 6379
- **Senha**: `consultorai_dev_password`
- **Uso**: Cache de sessões, rate limiting, filas

### 3. Redis Commander (Redis UI)
- **Porta**: 8081
- **Acesso**: http://localhost:8081
- **Uso**: Interface gráfica para gerenciar Redis

### 4. Mock Server (APIs Externas)
- **Porta**: 3001
- **Acesso**: http://localhost:3001
- **Uso**: Simula WhatsApp API, Google AI, Canva API

## Mock Server - APIs Simuladas

O Mock Server está configurado para simular as seguintes APIs:

### WhatsApp Business API
```bash
# Enviar mensagem
POST http://localhost:3001/v1/messages
Content-Type: application/json

{
  "to": "+5561999999999",
  "type": "text",
  "text": {
    "body": "Olá, tudo bem?"
  }
}

# Resposta:
{
  "success": true,
  "message_id": "wamid.mock123456789",
  "status": "sent"
}
```

### Google AI (Gemini)
```bash
# Gerar resposta
POST http://localhost:3001/v1beta/models/gemini-1.5-flash:generateContent
Content-Type: application/json

{
  "contents": [{
    "parts": [{
      "text": "Gere uma resposta para plano de saúde"
    }]
  }]
}

# Resposta: JSON com texto gerado (ver mock-server/initializerJson.json)
```

### Canva API
```bash
# Criar design
POST http://localhost:3001/v1/designs
Content-Type: application/json

{
  "template_id": "comparison-card",
  "data": {
    "plan1": "Plano A",
    "plan2": "Plano B"
  }
}

# Resposta:
{
  "design": {
    "id": "mock-design-123",
    "thumbnail": {
      "url": "https://via.placeholder.com/1200x630/..."
    }
  }
}
```

## Comandos Rápidos

### Iniciar todos os serviços
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Ver logs em tempo real
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Parar todos os serviços
```bash
docker-compose -f docker-compose.dev.yml down
```

### Parar e remover volumes (limpa dados)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

### Ver status dos containers
```bash
docker-compose -f docker-compose.dev.yml ps
```

### Acessar Redis CLI
```bash
docker exec -it consultorai-redis redis-cli -a consultorai_dev_password
```

## Configuração do .env.local

Para usar os serviços Docker localmente, configure no `.env.local`:

```bash
# SMTP local (MailHog)
SMTP_HOST=localhost
SMTP_PORT=1025

# Redis local
REDIS_URL=redis://:consultorai_dev_password@localhost:6379

# Mock APIs (opcional, para testes sem chaves reais)
WHATSAPP_API_URL=http://localhost:3001/v1
GOOGLE_AI_API_KEY=mock-google-ai-key
```

## Adicionando Novos Mocks

Para adicionar novos endpoints mockados, edite `mock-server/initializerJson.json`:

```json
{
  "id": "seu-mock-id",
  "httpRequest": {
    "method": "POST",
    "path": "/seu/endpoint"
  },
  "httpResponse": {
    "statusCode": 200,
    "body": {
      "sua": "resposta"
    }
  }
}
```

Após editar, reinicie o Mock Server:
```bash
docker-compose -f docker-compose.dev.yml restart mock-server
```

## Troubleshooting

### Porta já em uso
Se alguma porta estiver ocupada, edite `docker-compose.dev.yml` e altere o mapeamento:
```yaml
ports:
  - "8026:8025"  # Mudou de 8025 para 8026
```

### Containers não iniciam
Verifique os logs:
```bash
docker-compose -f docker-compose.dev.yml logs [nome-do-serviço]
```

### Limpar tudo e recomeçar
```bash
# Para tudo
docker-compose -f docker-compose.dev.yml down -v

# Remove imagens
docker-compose -f docker-compose.dev.yml down --rmi all

# Inicia novamente
docker-compose -f docker-compose.dev.yml up -d
```

## Monitoramento

### MailHog
Acesse http://localhost:8025 para ver todos os emails capturados.

### Redis Commander
Acesse http://localhost:8081 para visualizar keys, valores e estatísticas do Redis.

### Mock Server Logs
```bash
docker logs -f consultorai-mock-server
```

## Integração com Supabase Local

O Supabase roda separadamente via CLI:
```bash
npx supabase start
```

Para conectar os serviços:
1. Supabase: `http://localhost:54321`
2. PostgreSQL: `postgresql://postgres:postgres@localhost:54322/postgres`

## Recursos

- [MockServer Documentation](https://www.mock-server.com/)
- [MailHog Documentation](https://github.com/mailhog/MailHog)
- [Redis Documentation](https://redis.io/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
