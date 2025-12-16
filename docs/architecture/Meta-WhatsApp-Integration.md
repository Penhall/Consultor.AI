# Meta WhatsApp Cloud API - Integração Automatizada

## 🎯 Visão Geral

Implementação da **API oficial da Meta (WhatsApp Business Platform)** com processo de onboarding **100% automatizado** via **Embedded Signup Flow**.

### Diferencial Competitivo

**Concorrentes** (Weni, Typebot, etc):
- ❌ Exigem conta em plataforma terceira
- ❌ Configuração manual complexa
- ❌ Copiar/colar API keys
- ❌ Configurar webhooks manualmente
- ❌ 5-10 passos técnicos

**Consultor.AI**:
- ✅ Login direto com Facebook Business
- ✅ 3 cliques para conectar
- ✅ **Zero configuração manual**
- ✅ Tudo automático via Meta Embedded Signup
- ✅ Experiência nativa da Meta

## 🏗️ Arquitetura com Meta Cloud API

```
┌──────────────────────────────────────────────────────────┐
│               CONSULTOR.AI PLATFORM                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Dashboard do Consultor                                 │
│  ┌────────────────────────────────┐                     │
│  │  Perfil → Conectar WhatsApp    │                     │
│  │                                 │                     │
│  │  [Conectar com Meta] ←────────┐│                     │
│  └─────────────────────────────────┘│                    │
│                                    ││                    │
│         ┌──────────────────────────┘│                    │
│         │                           │                    │
│         ↓                           │                    │
│  ┌─────────────────────────────────┐│                    │
│  │  Meta Embedded Signup           ││                    │
│  │  (iframe/popup)                 ││                    │
│  │                                 ││                    │
│  │  1. Login Facebook Business     ││                    │
│  │  2. Seleciona WhatsApp Account  ││                    │
│  │  3. Autoriza permissões         ││                    │
│  │  4. Meta retorna token          ││                    │
│  └─────────────────────────────────┘│                    │
│                                      │                    │
│         ┌────────────────────────────┘                    │
│         ↓                                                │
│  ┌─────────────────────────────────┐                     │
│  │  Backend processa:              │                     │
│  │  - Salva access_token           │                     │
│  │  - Salva WABA ID                │                     │
│  │  - Salva Phone Number ID        │                     │
│  │  - Registra webhook na Meta     │                     │
│  │  - Subscreve eventos            │                     │
│  └─────────────────────────────────┘                     │
│                                                          │
│         ✓ WhatsApp conectado!                            │
│                                                          │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────┐
│                META WHATSAPP CLOUD API                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  WhatsApp Business Account (do consultor)               │
│  - Phone Number: +5561982809595                         │
│  - Display Name: João Silva - Planos de Saúde          │
│  - Verified: ✓                                          │
│                                                          │
│  Webhook registrado:                                    │
│  https://consultor.ai/api/webhook/meta/{consultant_id}  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Onboarding Automatizado

### Passo 1: Consultor clica "Conectar WhatsApp"

```typescript
// app/dashboard/perfil/page.tsx

<Button onClick={() => setShowMetaSignup(true)}>
  <WhatsAppIcon /> Conectar WhatsApp Business
</Button>

{showMetaSignup && (
  <MetaEmbeddedSignup
    onSuccess={(data) => handleMetaCallback(data)}
    onError={(error) => showError(error)}
  />
)}
```

### Passo 2: Meta Embedded Signup abre

```typescript
// components/MetaEmbeddedSignup.tsx

'use client'

export function MetaEmbeddedSignup({ onSuccess, onError }) {
  useEffect(() => {
    // Carrega SDK da Meta
    window.fbAsyncInit = function() {
      FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })
    }

    // Carrega script
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    document.body.appendChild(script)
  }, [])

  const launchWhatsAppSignup = () => {
    FB.login(
      (response) => {
        if (response.authResponse) {
          const code = response.authResponse.code
          // Envia code para backend
          fetch('/api/consultants/meta-callback', {
            method: 'POST',
            body: JSON.stringify({ code })
          })
            .then(res => res.json())
            .then(data => onSuccess(data))
            .catch(err => onError(err))
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {
            // Pré-preenche informações
            business: {
              name: 'João Silva Consultoria'
            }
          }
        }
      }
    )
  }

  return (
    <div className="meta-signup-container">
      <Button onClick={launchWhatsAppSignup}>
        Continuar com Meta
      </Button>
    </div>
  )
}
```

### Passo 3: Backend processa callback

```typescript
// app/api/consultants/meta-callback/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { encrypt } from '@/lib/encryption'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  const supabase = createClient()

  // 1. Troca code por access_token
  const tokenResponse = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${process.env.META_APP_ID}&` +
    `client_secret=${process.env.META_APP_SECRET}&` +
    `code=${code}`
  )

  const { access_token } = await tokenResponse.json()

  // 2. Busca informações da WABA (WhatsApp Business Account)
  const wabaResponse = await fetch(
    `https://graph.facebook.com/v18.0/debug_token?` +
    `input_token=${access_token}&` +
    `access_token=${process.env.META_APP_ACCESS_TOKEN}`
  )

  const wabaData = await wabaResponse.json()

  // 3. Busca Phone Numbers
  const phoneResponse = await fetch(
    `https://graph.facebook.com/v18.0/${wabaData.data.granular_scopes.waba_id}/phone_numbers`,
    {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    }
  )

  const { data: phoneNumbers } = await phoneResponse.json()
  const primaryPhone = phoneNumbers[0]

  // 4. Obtém informações do consultor
  const { data: { user } } = await supabase.auth.getUser()

  // 5. Salva integração no banco (encrypted)
  const { data: integration, error } = await supabase
    .from('whatsapp_integrations')
    .insert({
      consultant_id: user.id,
      provider: 'meta',

      // Credenciais (encrypted)
      access_token: encrypt(access_token),

      // IDs da Meta
      waba_id: wabaData.data.granular_scopes.waba_id,
      phone_number_id: primaryPhone.id,
      phone_number: primaryPhone.display_phone_number,

      // Metadata
      business_name: primaryPhone.verified_name,
      quality_rating: primaryPhone.quality_rating,

      status: 'active',
      verified_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // 6. Registra webhook na Meta
  await registerMetaWebhook(user.id, access_token, wabaData.data.granular_scopes.waba_id)

  // 7. Subscreve aos eventos necessários
  await subscribeToWebhookEvents(access_token, wabaData.data.granular_scopes.waba_id)

  return NextResponse.json({
    success: true,
    integration: {
      phoneNumber: primaryPhone.display_phone_number,
      businessName: primaryPhone.verified_name,
      qualityRating: primaryPhone.quality_rating
    }
  })
}

// Registra webhook automaticamente
async function registerMetaWebhook(
  consultantId: string,
  accessToken: string,
  wabaId: string
) {
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/meta/${consultantId}`
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN

  await fetch(
    `https://graph.facebook.com/v18.0/${wabaId}/subscribed_apps`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscribed_fields: [
          'messages',
          'message_status',
          'message_reactions',
          'message_echoes'
        ]
      })
    }
  )
}

async function subscribeToWebhookEvents(accessToken: string, wabaId: string) {
  // Já incluído em registerMetaWebhook via subscribed_fields
  return true
}
```

### Passo 4: Webhook da Meta recebe mensagens

```typescript
// app/api/webhook/meta/[consultantId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/encryption'
import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/ai/gemini'

// GET - Verificação do webhook (Meta exige)
export async function GET(
  req: NextRequest,
  { params }: { params: { consultantId: string } }
) {
  const searchParams = req.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST - Recebe mensagens
export async function POST(
  req: NextRequest,
  { params }: { params: { consultantId: string } }
) {
  const body = await req.json()
  const consultantId = params.consultantId

  // 1. Valida assinatura da Meta
  const signature = req.headers.get('x-hub-signature-256')
  const isValid = validateMetaSignature(
    signature,
    JSON.stringify(body),
    process.env.META_APP_SECRET!
  )

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  // 2. Extrai mensagens do payload
  const entry = body.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value

  if (!value?.messages) {
    return NextResponse.json({ success: true }) // Não é mensagem, ignora
  }

  const message = value.messages[0]
  const from = message.from // Número do lead
  const messageText = message.text?.body

  if (!messageText) {
    return NextResponse.json({ success: true }) // Mensagem sem texto
  }

  // 3. Busca credenciais do consultor
  const supabase = createClient()
  const { data: integration } = await supabase
    .from('whatsapp_integrations')
    .select('*')
    .eq('consultant_id', consultantId)
    .eq('provider', 'meta')
    .eq('status', 'active')
    .single()

  if (!integration) {
    console.error('Integration not found for consultant:', consultantId)
    return NextResponse.json({ success: true })
  }

  // 4. Salva mensagem recebida
  await supabase.from('messages').insert({
    consultant_id: consultantId,
    lead_phone: from,
    content: messageText,
    direction: 'inbound',
    platform_message_id: message.id,
    metadata: { waba_id: integration.waba_id }
  })

  // 5. Gera resposta com IA
  const aiResponse = await generateAIResponse({
    consultantId,
    leadMessage: messageText,
    leadPhone: from
  })

  // 6. Envia resposta via Meta Cloud API
  const accessToken = decrypt(integration.access_token)

  await fetch(
    `https://graph.facebook.com/v18.0/${integration.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: aiResponse }
      })
    }
  )

  // 7. Salva resposta enviada
  await supabase.from('messages').insert({
    consultant_id: consultantId,
    lead_phone: from,
    content: aiResponse,
    direction: 'outbound',
    metadata: { waba_id: integration.waba_id }
  })

  return NextResponse.json({ success: true })
}

// Valida assinatura HMAC SHA256 da Meta
function validateMetaSignature(
  signature: string | null,
  payload: string,
  appSecret: string
): boolean {
  if (!signature) return false

  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', appSecret)
  const expectedSignature = 'sha256=' + hmac.update(payload).digest('hex')

  return signature === expectedSignature
}
```

## 💾 Schema Atualizado

### Tabela: `whatsapp_integrations`

```sql
CREATE TABLE whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,

  -- Provedor
  provider VARCHAR(50) NOT NULL DEFAULT 'meta' CHECK (provider IN ('meta', 'weni', '360dialog')),

  -- Meta Cloud API (quando provider = 'meta')
  access_token TEXT,  -- Encrypted - Long-lived token
  waba_id VARCHAR(100),  -- WhatsApp Business Account ID
  phone_number_id VARCHAR(100),  -- Phone Number ID (para enviar mensagens)
  business_account_id VARCHAR(100),  -- Facebook Business Account ID

  -- Informações do WhatsApp
  phone_number VARCHAR(20) NOT NULL,
  business_name VARCHAR(255),
  display_name VARCHAR(255),
  quality_rating VARCHAR(20),  -- GREEN, YELLOW, RED

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'rate_limited')),
  verified_at TIMESTAMPTZ,

  -- Metadata
  webhook_url TEXT GENERATED ALWAYS AS (
    CASE
      WHEN provider = 'meta' THEN 'https://consultor.ai/api/webhook/meta/' || consultant_id::text
      ELSE 'https://consultor.ai/api/webhook/whatsapp/' || consultant_id::text
    END
  ) STORED,

  -- Rate limits (Meta)
  messaging_limit_tier VARCHAR(20),  -- TIER_50, TIER_250, TIER_1K, TIER_10K, TIER_100K, TIER_UNLIMITED
  last_rate_limit_check TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(consultant_id, provider),
  UNIQUE(phone_number),
  UNIQUE(waba_id),
  UNIQUE(phone_number_id)
);

-- Index para busca por webhook
CREATE INDEX idx_whatsapp_integrations_consultant_active
  ON whatsapp_integrations(consultant_id, provider)
  WHERE status = 'active';

-- Index para busca por WABA ID
CREATE INDEX idx_whatsapp_integrations_waba
  ON whatsapp_integrations(waba_id)
  WHERE provider = 'meta';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_integrations_updated_at
  BEFORE UPDATE ON whatsapp_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE whatsapp_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY consultants_own_integrations
  ON whatsapp_integrations
  FOR ALL
  USING (consultant_id = auth.uid());
```

## 🎨 UI/UX - Área de Perfil

### Tela: Perfil → WhatsApp (Antes de conectar)

```typescript
// app/dashboard/perfil/whatsapp/page.tsx

export default function WhatsAppSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">WhatsApp Business</h1>
      <p className="text-gray-600 mb-8">
        Conecte sua conta WhatsApp Business para começar a receber leads
      </p>

      {/* Card de status */}
      <Card className="mb-6 border-2 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <CardTitle>WhatsApp não conectado</CardTitle>
              <CardDescription>
                Conecte seu WhatsApp Business em menos de 2 minutos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Como funciona */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Conecte com Meta</h3>
              <p className="text-sm text-gray-600">
                Faça login com sua conta Facebook Business. Se não tiver,
                criaremos uma para você automaticamente.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Autorize as permissões</h3>
              <p className="text-sm text-gray-600">
                Permita que o Consultor.AI envie e receba mensagens em seu nome.
                Você mantém controle total da sua conta.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Pronto!</h3>
              <p className="text-sm text-gray-600">
                Seu WhatsApp está conectado e pronto para receber leads.
                A configuração é 100% automática.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requisitos */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>O que você precisa?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Conta Facebook (pessoal ou empresarial)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Número de telefone não cadastrado no WhatsApp pessoal</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>2 minutos do seu tempo</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Tudo pronto?</h3>
            <p className="text-gray-600 mb-6">
              Clique no botão abaixo para iniciar a conexão com a Meta
            </p>

            <MetaConnectButton />

            <p className="text-xs text-gray-500 mt-4">
              Ao conectar, você concorda com os{' '}
              <a href="#" className="underline">Termos de Serviço da Meta</a>
              {' '}e nossa{' '}
              <a href="#" className="underline">Política de Privacidade</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Componente: Botão de Conexão Meta

```typescript
// components/MetaConnectButton.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useMetaSignup } from '@/hooks/useMetaSignup'
import { toast } from '@/components/ui/use-toast'

export function MetaConnectButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { launchSignup } = useMetaSignup()

  const handleConnect = async () => {
    setIsLoading(true)

    try {
      await launchSignup({
        onSuccess: (data) => {
          toast({
            title: '✓ WhatsApp conectado!',
            description: `Número ${data.phoneNumber} conectado com sucesso.`,
          })

          // Redireciona para dashboard
          window.location.href = '/dashboard'
        },
        onError: (error) => {
          toast({
            title: 'Erro ao conectar',
            description: error.message,
            variant: 'destructive'
          })
          setIsLoading(false)
        }
      })
    } catch (error) {
      console.error('Meta signup error:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-8 py-6 text-lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Conectar WhatsApp Business
        </>
      )}
    </Button>
  )
}
```

### Hook: useMetaSignup

```typescript
// hooks/useMetaSignup.ts

'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

interface MetaSignupOptions {
  onSuccess: (data: any) => void
  onError: (error: Error) => void
}

export function useMetaSignup() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)

  useEffect(() => {
    // Carrega SDK do Facebook apenas uma vez
    if (window.FB) {
      setIsSDKLoaded(true)
      return
    }

    window.fbAsyncInit = function() {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })
      setIsSDKLoaded(true)
    }

    // Carrega script
    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/pt_BR/sdk.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      const existingScript = document.getElementById('facebook-jssdk')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const launchSignup = async ({ onSuccess, onError }: MetaSignupOptions) => {
    if (!isSDKLoaded || !window.FB) {
      onError(new Error('Facebook SDK não carregado'))
      return
    }

    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          const code = response.authResponse.code

          try {
            // Envia code para backend
            const res = await fetch('/api/consultants/meta-callback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code })
            })

            if (!res.ok) {
              const error = await res.json()
              throw new Error(error.message || 'Erro ao processar conexão')
            }

            const data = await res.json()
            onSuccess(data.integration)
          } catch (error) {
            onError(error as Error)
          }
        } else {
          onError(new Error('Usuário cancelou a conexão'))
        }
      },
      {
        config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: '',
          sessionInfoVersion: 2
        }
      }
    )
  }

  return { launchSignup, isSDKLoaded }
}
```

## 🔑 Variáveis de Ambiente

```bash
# .env.local

# Meta WhatsApp Cloud API
NEXT_PUBLIC_META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
NEXT_PUBLIC_META_CONFIG_ID=your-embedded-signup-config-id
META_APP_ACCESS_TOKEN=your-app-access-token
META_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token-random-string

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key
```

## 📋 Checklist de Configuração Meta

### 1. Criar Meta App

1. Acesse: https://developers.facebook.com/apps/create
2. Tipo: Business
3. Nome: Consultor.AI
4. Adicione produto: **WhatsApp** ✓
5. Copie:
   - App ID → `NEXT_PUBLIC_META_APP_ID`
   - App Secret → `META_APP_SECRET`

### 2. Configurar Embedded Signup

1. WhatsApp → Configuration
2. Embedded Signup → Add Configuration
3. Callback URL: `https://consultor.ai/api/consultants/meta-callback`
4. Webhook URL: `https://consultor.ai/api/webhook/meta/DYNAMIC`
5. Copie Configuration ID → `NEXT_PUBLIC_META_CONFIG_ID`

### 3. Configurar Webhook

1. WhatsApp → Configuration → Webhook
2. Callback URL: `https://consultor.ai/api/webhook/meta/test`
3. Verify Token: Gere um aleatório → `META_WEBHOOK_VERIFY_TOKEN`
4. Subscribe to:
   - ☑ messages
   - ☑ message_status
   - ☑ message_reactions

### 4. Gerar System User Token

1. Business Settings → System Users
2. Add System User: "Consultor.AI System"
3. Assign Assets → Apps → Consultor.AI (Full Control)
4. Generate Token → Permissions:
   - `whatsapp_business_management`
   - `whatsapp_business_messaging`
5. Copie → `META_APP_ACCESS_TOKEN`

## 🚀 Vantagens da Meta Cloud API

| Aspecto | Meta Cloud API | Weni/360dialog |
|---------|----------------|----------------|
| **Setup** | 3 cliques (embedded) | 10+ passos manuais |
| **Confiabilidade** | API oficial | Intermediário |
| **Custo** | Grátis até 1.000/mês | R$200+/mês |
| **SLA** | 99.9% (Meta) | Depende do provedor |
| **Escalabilidade** | Ilimitada | Limitada por tier |
| **Manutenção** | Zero (automática) | Manual |
| **Suporte** | Meta oficial | Provedor terceiro |

## 📊 Rate Limits da Meta

```typescript
// Tiers de messaging automaticamente atribuídos

TIER_50      // 50 conversas/24h (início)
TIER_250     // 250 conversas/24h
TIER_1K      // 1.000 conversas/24h
TIER_10K     // 10.000 conversas/24h
TIER_100K    // 100.000 conversas/24h
TIER_UNLIMITED // Ilimitado (após aprovação)

// Meta aumenta tier automaticamente baseado em:
// - Quality rating (verde)
// - Volume consistente
// - Baixa taxa de bloqueio
```

## 🎯 Próximos Passos

1. ✅ Criar Meta App
2. ✅ Configurar Embedded Signup
3. ✅ Implementar frontend (`MetaConnectButton`)
4. ✅ Implementar backend (`/api/consultants/meta-callback`)
5. ✅ Implementar webhook (`/api/webhook/meta/[consultantId]`)
6. ✅ Testar fluxo completo
7. ✅ Deploy em produção

---

**Diferencial confirmado**: Setup em 3 cliques vs 10+ passos da concorrência! 🚀
