/**
 * Mock: Supabase Client
 * Mock do cliente Supabase para testes
 */

import { vi } from 'vitest'

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@consultant.com',
          },
          access_token: 'test-access-token',
        },
      },
      error: null,
    }),
    signIn: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: null,
    }),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
  })),
}

export const createMockSupabaseClient = () => mockSupabaseClient
