/**
 * WhatsApp Settings Page
 * Allows consultants to connect their WhatsApp Business account
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { MetaEmbeddedSignup } from '@/components/whatsapp/MetaEmbeddedSignup'

interface IntegrationData {
  phone_number: string
  display_name: string
  status: string
  verified_at: string
}

export default function WhatsAppSettingsPage() {
  const { consultant, isLoading: authLoading } = useAuth()
  const [integration, setIntegration] = useState<IntegrationData | null>(null)
  const [isLoadingIntegration, setIsLoadingIntegration] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch existing integration on mount
  useEffect(() => {
    async function fetchIntegration() {
      if (!consultant?.id) {
        setIsLoadingIntegration(false)
        return
      }

      try {
        const response = await fetch(
          `/api/consultants/${consultant.id}/integrations/meta`
        )

        if (response.ok) {
          const data = await response.json()
          if (data.integration) {
            setIntegration(data.integration)
          }
        }
      } catch (err) {
        console.error('Error fetching integration:', err)
      } finally {
        setIsLoadingIntegration(false)
      }
    }

    fetchIntegration()
  }, [consultant?.id])

  const handleSuccess = (data: { phone_number: string; display_name: string }) => {
    setIntegration({
      phone_number: data.phone_number,
      display_name: data.display_name,
      status: 'active',
      verified_at: new Date().toISOString(),
    })
    setError(null)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const isLoading = authLoading || isLoadingIntegration
  const isConnected = integration && integration.status === 'active'

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">WhatsApp Business</h1>
      <p className="text-gray-600 mb-8">
        Conecte sua conta WhatsApp Business para começar a receber leads
      </p>

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 p-6 border rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600">Carregando informações...</p>
          </div>
        </div>
      )}

      {/* Status Card */}
      {!isLoading && !isConnected && (
        <div className="mb-6 p-6 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-900">
                WhatsApp não conectado
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Conecte seu WhatsApp Business em menos de 2 minutos
              </p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && isConnected && (
        <div className="mb-6 p-6 border-2 border-green-200 bg-green-50 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-green-600 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">
                WhatsApp conectado
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {integration?.phone_number}
                {integration?.display_name && ` - ${integration.display_name}`}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Conectado em {new Date(integration?.verified_at || '').toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* How it works */}
      <div className="mb-6 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Como funciona?</h2>

        <div className="space-y-4">
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
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-6 p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">O que você precisa?</h2>

        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Conta Facebook (pessoal ou empresarial)</span>
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Número de telefone não cadastrado no WhatsApp pessoal</span>
          </li>
          <li className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>2 minutos do seu tempo</span>
          </li>
        </ul>
      </div>

      {/* CTA - Only show if not connected and not loading */}
      {!isLoading && !isConnected && consultant?.id && (
        <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Tudo pronto?</h3>
            <p className="text-gray-600 mb-6">
              Clique no botão abaixo para iniciar a conexão com a Meta
            </p>

            <MetaEmbeddedSignup
              consultantId={consultant.id}
              onSuccess={handleSuccess}
              onError={handleError}
            />

            <p className="text-xs text-gray-500 mt-4">
              Ao conectar, você concorda com os{' '}
              <a href="#" className="underline">
                Termos de Serviço da Meta
              </a>{' '}
              e nossa{' '}
              <a href="#" className="underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Reconnect option if already connected */}
      {!isLoading && isConnected && (
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold mb-2">Gerenciar conexão</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sua conta WhatsApp Business está ativa. Caso precise reconectar ou atualizar
            permissões, entre em contato com o suporte.
          </p>
          <button
            className="text-sm text-red-600 hover:text-red-700 underline"
            onClick={() => {
              if (confirm('Tem certeza que deseja desconectar seu WhatsApp?')) {
                // TODO: Implement disconnect functionality
                alert('Funcionalidade de desconexão será implementada em breve')
              }
            }}
          >
            Desconectar WhatsApp
          </button>
        </div>
      )}
    </div>
  )
}
