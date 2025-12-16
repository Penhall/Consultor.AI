# 🧪 Guia de Testes - Consultor.AI

## 📋 O Que Foi Implementado

Este guia documenta todos os componentes implementados e como testá-los.

### ✅ Implementado (Pronto para testes)

1. **Infraestrutura Base**
   - ✅ Estrutura de diretórios Next.js
   - ✅ Configuração Supabase local
   - ✅ Migrations do banco de dados
   - ✅ Sistema de criptografia AES-256-GCM

2. **Banco de Dados**
   - ✅ Schema inicial (consultants, leads, flows, messages, etc)
   - ✅ Tabela `whatsapp_integrations` (Meta Cloud API)
   - ✅ Tabela `subscription_tiers` (planos freemium/pro/agency)
   - ✅ RLS (Row Level Security) policies
   - ✅ Indexes otimizados

3. **Bibliotecas Core**
   - ✅ Sistema de criptografia (`src/lib/encryption/`)
   - ✅ Supabase clients (`src/lib/supabase/`)
   - ✅ Google AI integration (`src/lib/ai/gemini.ts`)

4. **Documentação**
   - ✅ Arquitetura Multi-Tenant completa
   - ✅ Integração Meta WhatsApp detalhada
   - ✅ Diferencial competitivo (onboarding)
   - ✅ Guias de setup

### 🔄 Pendente (Próximos passos)

- API endpoints (callback Meta, webhooks)
- Componentes React (MetaConnectButton, etc)
- Páginas (dashboard, perfil)
- Testes de integração E2E

---

## 🚀 Setup do Ambiente de Testes

### 1. Instalar Dependências

```bash
cd /mnt/e/PROJETOS/Consultor.AI
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie `.env.local` baseado no `.env.example`:

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha:

```bash
# Supabase Local (gerado automaticamente)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<será-gerado-pelo-supabase-start>
SUPABASE_SERVICE_ROLE_KEY=<será-gerado-pelo-supabase-start>
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Google AI (obtenha em https://makersuite.google.com/app/apikey)
GOOGLE_AI_API_KEY=your-real-api-key-here
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_TEMPERATURE=0.4
GOOGLE_AI_MAX_TOKENS=200

# Encryption (gere um novo)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Meta WhatsApp (para desenvolvimento futuro)
NEXT_PUBLIC_META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-secret
META_APP_ACCESS_TOKEN=your-meta-token
NEXT_PUBLIC_META_CONFIG_ID=your-config-id
META_WEBHOOK_VERIFY_TOKEN=$(openssl rand -hex 32)

# Redis (Docker)
REDIS_URL=redis://:consultorai_dev_password@localhost:6379
REDIS_PASSWORD=consultorai_dev_password
```

### 3. Iniciar Supabase Local

```bash
# Inicia Supabase (PostgreSQL, Auth, Storage, Studio)
npx supabase start
```

**Importante**: Copie as credenciais exibidas no terminal:
```
API URL: http://localhost:54321
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

Cole essas chaves no `.env.local`.

### 4. Aplicar Migrations

```bash
# Aplica todas as migrations
npx supabase db push
```

### 5. Iniciar Serviços Docker (Opcional)

```bash
# Inicia Redis, MailHog, Mock Server
./dev-setup.sh start
```

Ou manualmente:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 6. Verificar Tudo Está Rodando

```bash
# Verificar Supabase
npx supabase status

# Verificar Docker
docker-compose -f docker-compose.dev.yml ps

# Acessar interfaces
# - Supabase Studio: http://localhost:54323
# - MailHog: http://localhost:8025
# - Redis Commander: http://localhost:8081
```

---

## 🧪 Testes dos Componentes

### 1. Testar Sistema de Criptografia

```bash
npm run test src/lib/encryption/encryption.test.ts
```

**O que testa:**
- Encriptação/decriptação de strings
- Diferentes IVs para mesma mensagem
- Detecção de dados adulterados
- Validação de formato
- Mascaramento de dados sensíveis

**Resultado esperado:** Todos os testes passam ✅

### 2. Testar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql postgresql://postgres:postgres@localhost:54322/postgres
```

**Comandos de teste:**

```sql
-- Verificar tabelas criadas
\dt

-- Verificar whatsapp_integrations
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'whatsapp_integrations';

-- Verificar subscription_tiers
SELECT * FROM subscription_tiers;

-- Resultado esperado:
-- freemium | 0.00  | 20    | {...}
-- pro      | 47.00 | 200   | {...}
-- agency   | 147.00| 1000  | {...}

-- Verificar RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Sair
\q
```

### 3. Testar Google AI (Gemini)

Crie um script de teste:

```bash
cat > test-gemini.mjs << 'EOF'
import { generateAIResponse } from './src/lib/ai/gemini.ts'

const params = {
  consultantId: 'test-uuid',
  leadMessage: 'Olá, quero informações sobre plano de saúde',
  leadPhone: '+5561999999999',
  conversationHistory: [],
  consultantData: {
    name: 'João Silva',
    businessName: 'João Silva Planos de Saúde',
    vertical: 'saude'
  }
}

console.log('Testando Google AI...')
console.log('Mensagem do lead:', params.leadMessage)
console.log('\nGerando resposta...\n')

const response = await generateAIResponse(params)

console.log('Resposta gerada:')
console.log(response)
console.log('\n✅ Teste concluído!')
EOF

# Executar teste
node --loader ts-node/esm test-gemini.mjs
```

**Resultado esperado:**
```
Testando Google AI...
Mensagem do lead: Olá, quero informações sobre plano de saúde

Gerando resposta...

Resposta gerada:
Olá! Que bom que você está buscando um plano de saúde! Para te ajudar melhor,
pode me contar: você está buscando para você, família ou empresa? E qual sua
faixa etária? Assim consigo te recomendar as melhores opções! 😊

✅ Teste concluído!
```

### 4. Testar Criptografia em Produção

Teste manual de encrypt/decrypt:

```bash
node -e "
import('./src/lib/encryption/index.js').then(({ encrypt, decrypt }) => {
  const secret = 'meta-access-token-abc123'
  console.log('Original:', secret)

  const encrypted = encrypt(secret)
  console.log('Encrypted:', encrypted)

  const decrypted = decrypt(encrypted)
  console.log('Decrypted:', decrypted)

  console.log('Match:', secret === decrypted ? '✅' : '❌')
})
"
```

### 5. Testar Supabase Client

```bash
cat > test-supabase.mjs << 'EOF'
import { createServiceClient } from './src/lib/supabase/server.js'

console.log('Testing Supabase connection...')

const supabase = createServiceClient()

// Test query
const { data, error } = await supabase
  .from('subscription_tiers')
  .select('*')

if (error) {
  console.error('❌ Error:', error)
} else {
  console.log('✅ Connected! Found tiers:')
  data.forEach(tier => {
    console.log(`  - ${tier.name}: R$${tier.price_monthly}/mês (${tier.max_leads} leads)`)
  })
}
EOF

node --loader ts-node/esm test-supabase.mjs
```

**Resultado esperado:**
```
Testing Supabase connection...
✅ Connected! Found tiers:
  - freemium: R$0/mês (20 leads)
  - pro: R$47/mês (200 leads)
  - agency: R$147/mês (1000 leads)
```

---

## 📊 Verificação do Schema

### Tabelas Criadas

```bash
npx supabase db diff --schema public
```

Deve mostrar:
- ✅ `consultants` (com novos campos: business_name, cpf_cnpj, etc)
- ✅ `whatsapp_integrations` (Meta Cloud API)
- ✅ `subscription_tiers` (planos)
- ✅ `consultant_subscriptions` (assinaturas)
- ✅ `leads`, `flows`, `conversations`, `messages` (existentes atualizados)

### Verificar Indexes

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('whatsapp_integrations', 'messages')
ORDER BY tablename, indexname;
```

Deve incluir:
- `idx_whatsapp_integrations_consultant_active`
- `idx_whatsapp_integrations_waba`
- `idx_messages_consultant_lead`

---

## 🔍 Troubleshooting

### Problema: "ENCRYPTION_KEY environment variable is not set"

**Solução:**
```bash
# Gerar nova chave
openssl rand -base64 32

# Adicionar ao .env.local
echo "ENCRYPTION_KEY=<chave-gerada>" >> .env.local
```

### Problema: "Cannot connect to Supabase"

**Solução:**
```bash
# Verificar se está rodando
npx supabase status

# Se não, iniciar
npx supabase start

# Verificar credenciais no .env.local
```

### Problema: "Google AI API key invalid"

**Solução:**
1. Acesse https://makersuite.google.com/app/apikey
2. Gere nova API key
3. Cole no `.env.local`

### Problema: "Migration failed"

**Solução:**
```bash
# Resetar banco (CUIDADO: apaga dados)
npx supabase db reset

# Aplicar migrations novamente
npx supabase db push
```

---

## 📝 Checklist de Testes

Antes de considerar o ambiente pronto:

- [ ] Supabase iniciado (`npx supabase status` mostra tudo verde)
- [ ] Migrations aplicadas (tabelas criadas)
- [ ] .env.local configurado com todas as chaves
- [ ] Testes de criptografia passando
- [ ] Google AI respondendo (teste manual)
- [ ] Supabase client conectando
- [ ] Docker services rodando (opcional, mas recomendado)
- [ ] Acesso ao Supabase Studio (http://localhost:54323)

---

## 🎯 Próximos Passos

Após validar todos os testes acima, você pode:

1. **Implementar APIs**
   - POST `/api/consultants/meta-callback`
   - POST `/api/webhook/meta/[consultantId]`

2. **Criar Componentes React**
   - `MetaConnectButton`
   - `useMetaSignup` hook
   - Página de perfil/WhatsApp

3. **Testes de Integração**
   - Mock do Meta Embedded Signup
   - Simulação de webhooks
   - Fluxo completo de onboarding

4. **Deploy em Staging**
   - Vercel (frontend)
   - Supabase Cloud (backend)
   - Configurar Meta App real

---

## 📚 Documentação Relacionada

- [Arquitetura Multi-Tenant](docs/architecture/Multi-Tenant-Architecture.md)
- [Integração Meta WhatsApp](docs/architecture/Meta-WhatsApp-Integration.md)
- [Guia de Setup Meta](docs/guides/meta-app-setup.md)
- [Diferencial Competitivo](docs/product/Competitive-Advantage-Onboarding.md)
- [Quick Start Local](QUICK-START-LOCAL.md)

---

**Última atualização:** 2025-12-15
**Status:** ✅ Infraestrutura base pronta para testes
