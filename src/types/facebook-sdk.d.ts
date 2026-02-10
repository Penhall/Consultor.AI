/**
 * Facebook SDK Type Declarations
 *
 * Global type definitions for the Facebook JavaScript SDK
 */

interface FBLoginResponse {
  authResponse?: {
    code?: string
    accessToken?: string
    expiresIn?: number
  }
  status?: string
}

interface FBLoginOptions {
  config_id?: string
  response_type?: string
  override_default_response_type?: boolean
  scope?: string
  extras?: Record<string, unknown>
}

interface FBInitParams {
  appId: string
  cookie?: boolean
  xfbml?: boolean
  version: string
}

interface FacebookSDK {
  init: (params: FBInitParams) => void
  login: (
    callback: (response: FBLoginResponse) => void,
    options?: FBLoginOptions
  ) => void
}

declare global {
  interface Window {
    FB?: FacebookSDK
    fbAsyncInit?: () => void
  }
}

export {}
