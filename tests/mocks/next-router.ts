/**
 * Mock: Next.js Router
 * Mock do router do Next.js para testes
 */

import { vi } from 'vitest'

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}

export const mockUseRouter = () => mockRouter
export const mockUsePathname = () => '/dashboard'
export const mockUseSearchParams = () => new URLSearchParams()
