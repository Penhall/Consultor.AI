/**
 * Consultant Test Fixtures
 *
 * Mock data for consultant and WhatsApp integration testing
 */

/**
 * Mock consultant
 */
export const mockConsultant = {
  id: '123e4567-e89b-12d3-a456-426614174010',
  user_id: 'test-user-id',
  name: 'Consultor Teste',
  email: 'consultor@test.com',
  created_at: '2026-01-14T10:00:00Z',
  updated_at: '2026-01-14T10:00:00Z',
}

/**
 * Mock consultant (different user)
 */
export const mockOtherConsultant = {
  id: '123e4567-e89b-12d3-a456-426614174011',
  user_id: 'other-user-id',
  name: 'Outro Consultor',
  email: 'outro@test.com',
  created_at: '2026-01-14T09:00:00Z',
  updated_at: '2026-01-14T09:00:00Z',
}

/**
 * Mock WhatsApp integration
 */
export const mockWhatsAppIntegration = {
  id: '123e4567-e89b-12d3-a456-426614174030',
  consultant_id: '123e4567-e89b-12d3-a456-426614174010',
  provider: 'meta',
  access_token: 'encrypted_token_abc123',
  refresh_token: null,
  webhook_secret: 'encrypted_webhook_secret',
  phone_number: '+5511987654321',
  phone_number_id: '123456789',
  waba_id: '987654321',
  display_name: 'Consultor Teste',
  status: 'active',
  verified_at: '2026-01-14T10:00:00Z',
  expires_at: null,
  last_sync_at: null,
  metadata: {
    connected_via: 'embedded_signup',
    setup_completed_at: '2026-01-14T10:00:00Z',
  },
  created_at: '2026-01-14T10:00:00Z',
  updated_at: '2026-01-14T10:00:00Z',
}

/**
 * Mock Meta token response
 */
export const mockMetaTokenResponse = {
  access_token: 'EAABsbCS1iHgBO7ZCMwdQqzl0ZD',
  token_type: 'bearer',
  expires_in: 5184000, // 60 days
}

/**
 * Mock Meta debug token response
 */
export const mockMetaDebugTokenResponse = {
  data: {
    app_id: '123456789',
    type: 'USER',
    application: 'Consultor.AI',
    expires_at: 1735689600,
    is_valid: true,
    scopes: ['whatsapp_business_management', 'whatsapp_business_messaging'],
    granular_scopes: [
      {
        scope: 'whatsapp_business_management',
        target_ids: ['987654321'],
      },
      {
        scope: 'whatsapp_business_messaging',
        target_ids: ['987654321'],
      },
    ],
    user_id: '1234567890',
  },
}

/**
 * Mock Meta phone number
 */
export const mockMetaPhoneNumber = {
  verified_name: 'Consultor Teste',
  display_phone_number: '+55 11 98765-4321',
  id: '123456789',
  quality_rating: 'GREEN',
}

/**
 * Mock Meta phone numbers response
 */
export const mockMetaPhoneNumbersResponse = {
  data: [mockMetaPhoneNumber],
}

/**
 * Mock Meta webhook subscription response
 */
export const mockMetaWebhookSubscriptionResponse = {
  success: true,
}

/**
 * Mock Meta error response (token exchange failed)
 */
export const mockMetaTokenErrorResponse = {
  error: {
    message: 'Invalid authorization code',
    type: 'OAuthException',
    code: 100,
    fbtrace_id: 'AbCdEfGhIjKlMnOpQr',
  },
}

/**
 * Mock Meta debug token response (no WABA)
 */
export const mockMetaDebugTokenNoWABA = {
  data: {
    app_id: '123456789',
    type: 'USER',
    application: 'Consultor.AI',
    expires_at: 1735689600,
    is_valid: true,
    scopes: ['public_profile', 'email'],
    granular_scopes: [],
    user_id: '1234567890',
  },
}

/**
 * Mock Meta phone numbers response (empty)
 */
export const mockMetaPhoneNumbersEmptyResponse = {
  data: [],
}

/**
 * Mock createMetaIntegration success result
 */
export const mockCreateMetaIntegrationSuccess = {
  success: true,
  data: mockWhatsAppIntegration,
}

/**
 * Mock createMetaIntegration duplicate error
 */
export const mockCreateMetaIntegrationDuplicateError = {
  success: false,
  error: 'Meta integration already exists for this consultant',
}

/**
 * Mock createMetaIntegration generic error
 */
export const mockCreateMetaIntegrationError = {
  success: false,
  error: 'Database error',
}

/**
 * Mock getIntegration success result
 */
export const mockGetIntegrationSuccess = {
  success: true,
  data: mockWhatsAppIntegration,
}

/**
 * Mock getIntegration not found
 */
export const mockGetIntegrationNotFound = {
  success: false,
  error: 'Integration not found',
}

/**
 * Mock getIntegration error
 */
export const mockGetIntegrationError = {
  success: false,
  error: 'Database connection error',
}

/**
 * Mock safe integration (without sensitive fields)
 */
export const mockSafeIntegration = {
  phone_number: mockWhatsAppIntegration.phone_number,
  display_name: mockWhatsAppIntegration.display_name,
  status: mockWhatsAppIntegration.status,
  verified_at: mockWhatsAppIntegration.verified_at,
  provider: mockWhatsAppIntegration.provider,
}
