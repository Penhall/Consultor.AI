/**
 * Meta Embedded Signup Hook
 * Handles Meta OAuth flow for WhatsApp integration
 */

'use client'

import { useEffect, useState, useCallback } from 'react'

declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

export interface MetaSignupOptions {
  onSuccess: (data: any) => void
  onError: (error: Error) => void
}

export function useMetaSignup() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Skip if already loaded
    if (window.FB) {
      setIsSDKLoaded(true)
      return
    }

    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })
      setIsSDKLoaded(true)
    }

    // Load SDK script
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

  const launchSignup = useCallback(async ({ onSuccess, onError }: MetaSignupOptions) => {
    if (!isSDKLoaded || !window.FB) {
      onError(new Error('Facebook SDK not loaded'))
      return
    }

    setIsLoading(true)

    try {
      window.FB.login(
        async (response: any) => {
          if (response.authResponse) {
            const code = response.authResponse.code

            try {
              // Send code to backend
              const res = await fetch('/api/consultants/meta-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
              })

              if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to connect WhatsApp')
              }

              const data = await res.json()
              setIsLoading(false)
              onSuccess(data.integration)
            } catch (error) {
              setIsLoading(false)
              onError(error as Error)
            }
          } else {
            setIsLoading(false)
            onError(new Error('User cancelled the connection'))
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
    } catch (error) {
      setIsLoading(false)
      onError(error as Error)
    }
  }, [isSDKLoaded])

  return {
    launchSignup,
    isSDKLoaded,
    isLoading,
  }
}
