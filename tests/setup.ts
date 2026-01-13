/**
 * Test Setup
 * Configuração global para todos os testes
 */

import '@testing-library/jest-dom'
import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// =============================================================================
// Environment Variables
// =============================================================================
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-for-testing'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars!!'
  process.env.GOOGLE_AI_API_KEY = 'test-google-ai-key'
  process.env.META_APP_SECRET = 'test-meta-secret'
  process.env.META_WEBHOOK_VERIFY_TOKEN = 'test-verify-token'
})

// =============================================================================
// Global Mocks
// =============================================================================

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}))

// Mock Next.js Navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// =============================================================================
// Cleanup
// =============================================================================
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
