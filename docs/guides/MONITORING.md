# Monitoring Guide

Este guia descreve como configurar e usar o sistema de monitoramento do Consultor.AI.

## Visao Geral

O sistema de monitoramento inclui:

- **Logging**: Logs estruturados com niveis (debug, info, warn, error)
- **Performance Tracking**: Metricas de tempo de resposta para APIs, IA e banco de dados
- **Error Tracking**: Captura de erros com Sentry (opcional)

## Configuracao

### Variaveis de Ambiente

```env
# Sentry (opcional - para producao)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# Log Level
LOG_LEVEL=info  # debug | info | warn | error

# Versao do App (para Sentry releases)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Ativando Sentry

1. Crie uma conta em [sentry.io](https://sentry.io)
2. Crie um novo projeto Next.js
3. Copie o DSN para as variaveis de ambiente
4. Em producao, o Sentry sera inicializado automaticamente

## Uso

### Logging

```typescript
import { logger, logRequest } from '@/lib/monitoring';

// Logs simples
logger.debug('Detalhes de debug', { userId: '123' });
logger.info('Operacao concluida');
logger.warn('Algo pode estar errado');
logger.error('Erro na operacao', { details: '...' }, error);

// Log de request (em API routes)
logRequest('POST /api/leads', 201, 150);
```

### Performance Tracking

```typescript
import {
  createTimer,
  measure,
  timed,
  trackApiPerformance,
  trackAiPerformance,
  trackDatabasePerformance,
} from '@/lib/monitoring';

// Timer manual
const timer = createTimer();
await doSomething();
const duration = timer(); // retorna duracao em ms

// Funcao measure
const result = await measure('operacao', async () => {
  return await doSomething();
});

// Decorator timed
const myFunction = timed('myFunction', async () => {
  return await doSomething();
});

// Tracking especializado
trackApiPerformance('/api/leads', 'GET', 200, 150);
trackAiPerformance('gemini', 100, 50, 180);
trackDatabasePerformance('leads.select', 25, 'success');
```

### Error Tracking (Sentry)

```typescript
import {
  captureException,
  captureMessage,
  setUser,
  setContext,
  addBreadcrumb,
  withErrorCapture,
} from '@/lib/monitoring';

// Capturar excecao
try {
  await riskyOperation();
} catch (error) {
  await captureException(error as Error, {
    operation: 'sync_lead',
    leadId: '123',
  });
}

// Capturar mensagem
await captureMessage('Lead qualificado com score alto', 'info', {
  leadId: '123',
  score: 95,
});

// Definir usuario para contexto
await setUser({
  id: userId,
  email: userEmail,
});

// Adicionar breadcrumb
await addBreadcrumb({
  category: 'crm',
  message: 'Integracao criada',
  level: 'info',
  data: { provider: 'rd-station' },
});

// Wrapper para funcoes
const safeFn = withErrorCapture(async data => await processData(data), {
  operation: 'process_data',
});
```

## Metricas Coletadas

### API Performance

- Endpoint
- Metodo HTTP
- Status code
- Tempo de resposta (ms)

### AI Performance

- Modelo utilizado
- Tokens de prompt
- Tokens de completion
- Latencia (ms)

### Database Performance

- Query/operacao
- Tempo de execucao (ms)
- Status (success/error)

## Thresholds Padrao

| Metrica      | Warning  | Critical  |
| ------------ | -------- | --------- |
| API Response | > 500ms  | > 2000ms  |
| AI Latency   | > 3000ms | > 10000ms |
| DB Query     | > 100ms  | > 500ms   |

## Dashboard e Alertas

### Sentry Dashboard

- Erros por tipo
- Taxa de erros
- Performance transactions
- User impact

### Alertas Recomendados

1. **Error Rate High**: > 1% de requests com erro
2. **Slow API**: P95 > 2s
3. **AI Timeout**: Latencia > 10s
4. **DB Connection Issues**: Erros de conexao

## Logs em Producao

Em producao, os logs sao formatados como JSON para facil ingestao por ferramentas como:

- Better Stack
- Datadog
- CloudWatch

Exemplo de log em producao:

```json
{
  "timestamp": "2026-01-27T10:30:00.000Z",
  "level": "info",
  "message": "API request completed",
  "context": {
    "path": "/api/leads",
    "method": "GET",
    "status": 200,
    "duration": 150
  }
}
```

## Troubleshooting

### Sentry nao esta capturando erros

1. Verifique se `SENTRY_DSN` esta configurado
2. Confirme que esta em ambiente de producao
3. Verifique se o erro nao esta sendo filtrado em `beforeSend`

### Logs nao aparecem

1. Verifique `LOG_LEVEL` - pode estar mais restritivo
2. Em desenvolvimento, logs aparecem no terminal
3. Em producao, verifique stdout/stderr do container

### Performance metrics nao coletadas

1. Certifique-se de usar as funcoes de tracking
2. Chame `flushMetrics()` ao final de uma request se necessario

---

## Metricas de Billing e SaaS

### Painel Admin

O painel admin (`/admin`) exibe metricas SaaS em tempo real:

- **Total de usuarios** - Cadastros acumulados
- **Usuarios pagantes** - Assinantes Pro + Agencia
- **Receita (MRR)** - Receita recorrente mensal estimada
- **Deltas diarios** - Variacao de usuarios e receita

Os dados vem da tabela `daily_stats`, populada automaticamente pelo pg_cron a cada hora.

### Metricas de Creditos

Monitorar o consumo de creditos por usuario:

```sql
-- Usuarios com creditos baixos
SELECT email, subscription_plan, credits, purchased_credits, monthly_credits_allocation
FROM consultants
WHERE credits < 5 AND subscription_status = 'active'
ORDER BY credits ASC;

-- Consumo medio de creditos
SELECT subscription_plan, AVG(monthly_credits_allocation - credits) as avg_usage
FROM consultants
WHERE subscription_status = 'active'
GROUP BY subscription_plan;
```

### Metricas de Email

Quando Resend esta configurado, monitore:

- **Taxa de entrega** - Verifique no dashboard do Resend
- **Bounces** - Emails invalidos retornados
- **Templates enviados** - Welcome, password reset, cancelamento

Em desenvolvimento, todos os emails sao logados no console com prefixo `[EMAIL]`.

### Alertas Recomendados para Billing

1. **Webhook failures** - Stripe nao consegue entregar eventos
2. **Credit exhaustion** - Usuarios sem creditos tentando usar IA
3. **Subscription churn** - Taxa de cancelamento > 5% ao mes
4. **Payment failures** - Invoices com status `past_due`
