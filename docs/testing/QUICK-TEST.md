# ⚡ Guia Rápido de Testes - Consultor.AI

## 🚀 Setup em 5 Minutos

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar Supabase
npx supabase start
# ⚠️ IMPORTANTE: Copie as credenciais exibidas!

# 3. Criar .env.local
cp .env.example .env.local

# 4. Editar .env.local com credenciais do Supabase
# Cole: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 5. Gerar chave de criptografia
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env.local

# 6. Adicionar Google AI key (obter em: https://makersuite.google.com/app/apikey)
echo "GOOGLE_AI_API_KEY=sua-chave-aqui" >> .env.local

# 7. Aplicar migrations
npx supabase db push

# 8. Iniciar Next.js
npm run dev
```

## ✅ Verificar Tudo Funcionando

### 1. Supabase
```bash
npx supabase status
# Deve mostrar tudo verde ✓
```

### 2. Banco de Dados
```bash
psql postgresql://postgres:postgres@localhost:54322/postgres

# Listar tabelas
\dt

# Verificar tiers
SELECT name, price_monthly, max_leads FROM subscription_tiers;

# Deve mostrar:
# freemium  | 0.00  | 20
# pro       | 47.00 | 200
# agency    | 147.00| 1000

\q
```

### 3. Criptografia
```bash
npm run test src/lib/encryption/encryption.test.ts

# Deve passar todos os testes ✓
```

### 4. Interface Web
```bash
# Abra: http://localhost:3000/dashboard/perfil/whatsapp

# Deve ver:
# - Página de configuração WhatsApp
# - Botão "Conectar WhatsApp Business"
# - Instruções em português
```

### 5. Supabase Studio
```bash
# Abra: http://localhost:54323

# Explore:
# - Table Editor → whatsapp_integrations (vazio)
# - Table Editor → subscription_tiers (3 registros)
# - SQL Editor → Execute queries
```

## 🧪 Testes Avançados

### Testar Google AI
```bash
cat > test-ai.mjs << 'EOF'
import { generateAIResponse } from './src/lib/ai/gemini.ts'

const response = await generateAIResponse({
  consultantId: 'test-uuid',
  leadMessage: 'Olá, quero plano de saúde',
  leadPhone: '+5561999999999',
  consultantData: {
    name: 'João Silva',
    businessName: 'João Silva Planos',
    vertical: 'saude'
  }
})

console.log('Resposta AI:', response)
EOF

node --loader ts-node/esm test-ai.mjs
```

### Testar Criptografia Manual
```bash
node << 'EOF'
import('./src/lib/encryption/index.js').then(({ encrypt, decrypt }) => {
  const secret = 'teste-123-secret'
  console.log('Original:', secret)

  const encrypted = encrypt(secret)
  console.log('Encrypted:', encrypted.substring(0, 50) + '...')

  const decrypted = decrypt(encrypted)
  console.log('Decrypted:', decrypted)
  console.log('Match:', secret === decrypted ? '✅' : '❌')
})
EOF
```

### Testar Webhook (Mock)
```bash
# Terminal 1: Iniciar Next.js
npm run dev

# Terminal 2: Simular webhook
curl -X POST http://localhost:3000/api/webhook/meta/test-consultant-id \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: sha256=mock" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "id": "msg_123",
            "from": "5561999999999",
            "type": "text",
            "timestamp": "1234567890",
            "text": { "body": "Olá" }
          }]
        }
      }]
    }]
  }'

# Nota: Vai falhar na validação de signature, mas testa o endpoint
```

## 🔧 Troubleshooting Rápido

### Erro: "ENCRYPTION_KEY not set"
```bash
echo "ENCRYPTION_KEY=$(openssl rand -base64 32)" >> .env.local
```

### Erro: "Cannot connect to Supabase"
```bash
npx supabase stop
npx supabase start
# Copiar credenciais novamente
```

### Erro: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Migration failed"
```bash
npx supabase db reset
npx supabase db push
```

## 📊 Checklist Completo

Antes de considerar o ambiente 100% funcional:

- [ ] `npm install` executado sem erros
- [ ] `npx supabase status` mostra tudo verde
- [ ] `.env.local` criado e populado
- [ ] `npx supabase db push` aplicou migrations
- [ ] `npm run dev` inicia sem erros
- [ ] http://localhost:3000/dashboard/perfil/whatsapp carrega
- [ ] http://localhost:54323 (Supabase Studio) acessível
- [ ] `npm run test` passa nos testes de criptografia
- [ ] `SELECT * FROM subscription_tiers` retorna 3 registros
- [ ] Botão "Conectar WhatsApp" aparece na interface

## 🎯 Próximo Passo

Após validar tudo acima, escolha:

**Opção A: Testar com Mock (sem Meta App)**
- Criar dados manualmente no banco
- Simular webhooks
- Ver UI funcionando

**Opção B: Conectar com Meta Real**
1. Seguir `docs/guides/meta-app-setup.md`
2. Configurar Meta App
3. Adicionar credenciais ao `.env.local`
4. Testar fluxo completo real

## 💡 Dicas

### Ver logs em tempo real
```bash
# Terminal 1
npm run dev

# Terminal 2
npx supabase logs db -f

# Terminal 3
docker-compose -f docker-compose.dev.yml logs -f
```

### Resetar tudo
```bash
# Para TUDO
npx supabase stop --no-backup
docker-compose -f docker-compose.dev.yml down -v

# Remove node_modules
rm -rf node_modules

# Reinstala
npm install

# Recomeça
npx supabase start
npx supabase db push
npm run dev
```

### Backup do banco local
```bash
npx supabase db dump -f backup.sql
```

### Restaurar backup
```bash
psql postgresql://postgres:postgres@localhost:54322/postgres < backup.sql
```

---

**Tempo total de setup:** 5 minutos ⚡
**Comandos:** ~10 linhas
**Resultado:** Ambiente 100% funcional para desenvolvimento local

---

Para mais detalhes, ver:
- `TESTING-GUIDE.md` - Guia completo de testes
- `MVP-COMPLETE.md` - Resumo do que foi implementado
- `docs/guides/meta-app-setup.md` - Setup Meta App
