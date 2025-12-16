# Guia de Configuração: Meta WhatsApp Cloud API

## 🎯 Objetivo

Configurar a integração oficial da Meta (WhatsApp Business Platform) com Embedded Signup para permitir que consultores conectem seus WhatsApps em 3 cliques.

## ⏱️ Tempo estimado

- **Primeira configuração**: 20-30 minutos
- **Configurações futuras**: 5 minutos

## 📋 Pré-requisitos

- [ ] Conta Facebook (pessoal ou empresarial)
- [ ] Acesso a https://developers.facebook.com
- [ ] Domínio verificado (ex: consultor.ai)
- [ ] SSL/HTTPS configurado

## 🚀 Passo a Passo

### 1. Criar Meta App

#### 1.1. Acessar Meta for Developers

1. Vá para https://developers.facebook.com/apps
2. Clique em **"Create App"** (Criar aplicativo)

#### 1.2. Escolher tipo de app

1. Selecione: **"Business"**
2. Clique em **"Next"** (Avançar)

#### 1.3. Preencher informações básicas

```
App Name: Consultor.AI
App Contact Email: contato@consultor.ai
Business Account: [Selecione ou crie uma]
```

3. Clique em **"Create App"** (Criar aplicativo)

#### 1.4. Copiar credenciais

Após criar, vá em **Settings → Basic**:

```bash
# Copie esses valores:
App ID: 1234567890123456
App Secret: [Clique em "Show" para ver]
```

Adicione ao `.env.production`:
```bash
NEXT_PUBLIC_META_APP_ID=1234567890123456
META_APP_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

### 2. Adicionar WhatsApp ao App

#### 2.1. Adicionar produto WhatsApp

1. No dashboard do app, clique em **"Add Product"**
2. Encontre **"WhatsApp"**
3. Clique em **"Set Up"** (Configurar)

#### 2.2. Aceitar termos

1. Leia e aceite os **WhatsApp Business Platform Terms**
2. Clique em **"Accept"** (Aceitar)

---

### 3. Configurar Embedded Signup

#### 3.1. Acessar configurações

1. No menu lateral, clique em **WhatsApp → Configuration**
2. Localize seção **"Embedded Signup"**

#### 3.2. Criar configuração

1. Clique em **"Create Configuration"** (Criar configuração)
2. Preencha:

```
Configuration Name: Consultor.AI Production

Callback URL:
https://consultor.ai/api/consultants/meta-callback

Deauthorize Callback URL:
https://consultor.ai/api/consultants/meta-deauthorize

Data Deletion URL:
https://consultor.ai/api/consultants/meta-data-deletion
```

3. Clique em **"Save"** (Salvar)

#### 3.3. Copiar Configuration ID

Após salvar, copie o **Configuration ID** exibido:

```bash
# Adicione ao .env.production:
NEXT_PUBLIC_META_CONFIG_ID=987654321098765
```

---

### 4. Configurar Webhooks

#### 4.1. Gerar Verify Token

Gere um token aleatório:

```bash
openssl rand -hex 32
```

Copie o resultado:
```bash
# Adicione ao .env.production:
META_WEBHOOK_VERIFY_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

#### 4.2. Configurar webhook endpoint

1. WhatsApp → **Configuration → Webhooks**
2. Clique em **"Edit"** (Editar)
3. Preencha:

```
Callback URL:
https://consultor.ai/api/webhook/meta/verify

Verify Token:
[Cole o META_WEBHOOK_VERIFY_TOKEN gerado acima]
```

4. Clique em **"Verify and Save"** (Verificar e salvar)

#### 4.3. Subscrever aos eventos

Após verificar, marque os eventos:

- [x] **messages** - Mensagens recebidas
- [x] **messaging_postbacks** - Respostas de botões
- [x] **messaging_optins** - Opt-ins
- [x] **messaging_optouts** - Opt-outs
- [x] **message_echoes** - Eco de mensagens
- [x] **message_deliveries** - Entregas
- [x] **message_reads** - Leituras

Clique em **"Save"** (Salvar)

---

### 5. Criar System User

System User é necessário para registrar webhooks automaticamente.

#### 5.1. Acessar Business Settings

1. Vá para https://business.facebook.com/settings
2. Clique em **"Users" → "System Users"**

#### 5.2. Criar novo System User

1. Clique em **"Add"** (Adicionar)
2. Preencha:

```
System User Name: Consultor.AI Backend
System User Role: Admin
```

3. Clique em **"Create System User"** (Criar)

#### 5.3. Atribuir assets

1. Clique no System User criado
2. Clique em **"Add Assets"** (Adicionar recursos)
3. Selecione **"Apps"**
4. Encontre **"Consultor.AI"**
5. Marque: **Full Control** (Controle total)
6. Clique em **"Save Changes"** (Salvar)

#### 5.4. Gerar token

1. Clique em **"Generate New Token"** (Gerar novo token)
2. Selecione **"Consultor.AI"** app
3. Marque permissões:
   - [x] `whatsapp_business_management`
   - [x] `whatsapp_business_messaging`
4. Clique em **"Generate Token"** (Gerar token)
5. **IMPORTANTE**: Copie o token AGORA (só aparece uma vez!)

```bash
# Adicione ao .env.production:
META_APP_ACCESS_TOKEN=EAABsbCS1iHgBO7ZC8wc4FRxkZBpgpRpZBpgpRpZBpgpRpZBpgpRp...
```

---

### 6. Configurar domínio do app

#### 6.1. Adicionar domínio

1. Settings → **Basic**
2. Localize **"App Domains"**
3. Adicione: `consultor.ai`
4. Clique em **"Save Changes"** (Salvar)

#### 6.2. Configurar Site URL

1. Na mesma tela, localize **"Website"**
2. Preencha:

```
Site URL: https://consultor.ai
```

3. Clique em **"Save Changes"** (Salvar)

---

### 7. Configurar Privacy Policy e Terms

#### 7.1. Privacy Policy

1. Settings → **Basic**
2. Localize **"Privacy Policy URL"**
3. Preencha: `https://consultor.ai/privacy`
4. Salvar

#### 7.2. Terms of Service

1. Localize **"Terms of Service URL"**
2. Preencha: `https://consultor.ai/terms`
3. Salvar

---

### 8. Modo de Produção

#### 8.1. Completar Business Verification

Para usar em produção, você precisa verificar seu negócio:

1. Business Settings → **Security Center**
2. Clique em **"Start Verification"** (Iniciar verificação)
3. Envie documentos solicitados:
   - CNPJ ou CPF
   - Comprovante de endereço
   - Documento oficial da empresa

**Tempo de aprovação**: 1-3 dias úteis

#### 8.2. Mudar app para Live

Após aprovação:

1. Settings → **Basic**
2. Localize **"App Mode"**
3. Toggle para **"Live"** (Produção)

---

### 9. Testar Integração

#### 9.1. Endpoint de verificação

Teste se o webhook está respondendo:

```bash
curl "https://consultor.ai/api/webhook/meta/verify?hub.mode=subscribe&hub.verify_token=SEU_VERIFY_TOKEN&hub.challenge=test123"

# Deve retornar: test123
```

#### 9.2. Testar Embedded Signup

1. Acesse: `https://consultor.ai/dashboard/perfil/whatsapp`
2. Clique em **"Conectar WhatsApp"**
3. Modal da Meta deve abrir
4. Complete o fluxo

---

## 🔐 Segurança

### Variáveis de Ambiente

**NUNCA** commite essas variáveis no Git:

```bash
# .env.production (NUNCA commitar)
NEXT_PUBLIC_META_APP_ID=...
META_APP_SECRET=...
META_APP_ACCESS_TOKEN=...
NEXT_PUBLIC_META_CONFIG_ID=...
META_WEBHOOK_VERIFY_TOKEN=...
```

### Configurar no Vercel

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione cada variável
3. Scope: **Production**
4. Clique em **"Save"**

---

## 🧪 Ambiente de Desenvolvimento

### Testar localmente

Para testar Embedded Signup localmente, você precisa de HTTPS.

#### Opção 1: ngrok

```bash
# Instalar ngrok
npm install -g ngrok

# Iniciar túnel
ngrok http 3000

# Copie a URL HTTPS gerada
# Ex: https://abc123.ngrok.io
```

Configure no Meta App:
- Callback URL: `https://abc123.ngrok.io/api/consultants/meta-callback`
- Webhook URL: `https://abc123.ngrok.io/api/webhook/meta/verify`

#### Opção 2: Cloudflare Tunnel

```bash
# Instalar cloudflared
brew install cloudflare/cloudflare/cloudflared  # macOS
# ou baixe em: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Iniciar túnel
cloudflared tunnel --url http://localhost:3000
```

---

## 🐛 Troubleshooting

### Erro: "Invalid Verify Token"

**Causa**: Verify token não confere

**Solução**:
1. Verifique se `META_WEBHOOK_VERIFY_TOKEN` no .env é o mesmo configurado no Meta
2. Reinicie o servidor após alterar .env
3. Tente verificar novamente

### Erro: "Callback URL unreachable"

**Causa**: Meta não consegue acessar sua URL

**Solução**:
1. Verifique se servidor está rodando
2. Confirme que URL é HTTPS
3. Teste acessar a URL pelo navegador
4. Verifique firewall/CORS

### Erro: "App not approved for WhatsApp"

**Causa**: App ainda em modo Development

**Solução**:
1. Complete Business Verification
2. Mude app para Live mode
3. Aguarde aprovação (1-3 dias)

### Erro: "Access token expired"

**Causa**: System User token expirou

**Solução**:
1. Gere novo token (passo 5.4)
2. Atualize `META_APP_ACCESS_TOKEN`
3. Reinicie aplicação

---

## 📊 Checklist Final

Antes de ir para produção:

- [ ] Meta App criado
- [ ] WhatsApp produto adicionado
- [ ] Embedded Signup configurado
- [ ] Webhooks configurados e verificados
- [ ] System User criado com token
- [ ] Domínio configurado
- [ ] Privacy Policy e Terms publicados
- [ ] Business Verification completa
- [ ] App em modo Live
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Teste completo do fluxo de onboarding
- [ ] Webhook recebendo mensagens

---

## 📚 Referências

- [Meta for Developers](https://developers.facebook.com)
- [WhatsApp Business Platform Docs](https://developers.facebook.com/docs/whatsapp)
- [Embedded Signup Guide](https://developers.facebook.com/docs/whatsapp/embedded-signup)
- [Webhooks Reference](https://developers.facebook.com/docs/graph-api/webhooks)
- [Business Verification](https://www.facebook.com/business/help/2058515294227817)

---

## 🆘 Suporte

Se encontrar problemas:

1. Consulte [Meta Developer Community](https://developers.facebook.com/community/)
2. Verifique [Status da API](https://developers.facebook.com/status/)
3. Abra ticket no [Meta Business Support](https://business.facebook.com/help/support)

---

**Última atualização**: 2025-12-15
