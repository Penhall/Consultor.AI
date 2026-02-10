/**
 * Meta Embedded Signup Component
 *
 * Implements Meta's Embedded Signup flow for WhatsApp Business
 * Provides 3-click onboarding for consultants
 */

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MetaEmbeddedSignupProps {
  consultantId: string
  onSuccess?: (data: { phone_number: string; display_name: string }) => void
  onError?: (error: string) => void
}

// Facebook SDK types are defined in src/types/facebook-sdk.d.ts

export function MetaEmbeddedSignup({
  consultantId,
  onSuccess,
  onError,
}: MetaEmbeddedSignupProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sdkLoaded, setSdkLoaded] = useState(false)

  // Load Facebook SDK
  useEffect(() => {
    // Check if SDK already loaded
    if (window.FB) {
      setSdkLoaded(true)
      return
    }

    // Initialize FB SDK
    window.fbAsyncInit = function () {
      const appId = process.env.NEXT_PUBLIC_META_APP_ID
      if (appId) {
        window.FB?.init({
          appId,
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        })
      }
      setSdkLoaded(true)
    }

    // Load SDK script
    const script = document.createElement('script')
    script.id = 'facebook-jssdk'
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'

    document.body.appendChild(script)

    return () => {
      // Cleanup
      const existingScript = document.getElementById('facebook-jssdk')
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [])

  const handleConnect = async () => {
    if (!sdkLoaded || !window.FB) {
      setError('Facebook SDK not loaded. Please refresh the page.')
      return
    }

    if (!process.env.NEXT_PUBLIC_META_APP_ID) {
      setError('Meta App ID not configured. Please contact support.')
      return
    }

    if (!process.env.NEXT_PUBLIC_META_CONFIG_ID) {
      setError('Meta Config ID not configured. Please contact support.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Launch Meta Embedded Signup
      window.FB.login(
        async (response) => {
          // Handle response
          if (response.authResponse && response.authResponse.code) {
            const code = response.authResponse.code

            console.log('[MetaSignup] Authorization code received')

            try {
              // Send code to backend
              const apiResponse = await fetch('/api/consultants/meta-signup', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  code,
                  consultant_id: consultantId,
                }),
              })

              const data = await apiResponse.json()

              if (!apiResponse.ok) {
                throw new Error(data.error || 'Failed to complete signup')
              }

              console.log('[MetaSignup] Signup completed successfully')

              // Success!
              if (onSuccess && data.data) {
                onSuccess(data.data)
              }

              setLoading(false)
            } catch (err) {
              console.error('[MetaSignup] API error:', err)
              const errorMessage =
                err instanceof Error ? err.message : 'Failed to connect WhatsApp'
              setError(errorMessage)
              if (onError) {
                onError(errorMessage)
              }
              setLoading(false)
            }
          } else {
            // User cancelled or error occurred
            console.log('[MetaSignup] Login cancelled or failed', response)
            setError('WhatsApp connection cancelled. Please try again.')
            if (onError) {
              onError('Connection cancelled')
            }
            setLoading(false)
          }
        },
        {
          config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID ?? '',
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: '',
            sessionInfoVersion: 2,
          },
        }
      )
    } catch (err) {
      console.error('[MetaSignup] Exception:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleConnect}
        disabled={loading || !sdkLoaded}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
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
            Conectando...
          </>
        ) : !sdkLoaded ? (
          'Carregando...'
        ) : (
          <>
            <svg
              className="mr-2 h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Conectar WhatsApp Business
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Você será redirecionado para fazer login com o Facebook Business e autorizar o
        Consultor.AI a usar seu WhatsApp Business.
      </p>
    </div>
  )
}
