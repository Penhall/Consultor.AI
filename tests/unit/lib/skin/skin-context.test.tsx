import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SkinProvider, useSkin } from '@/lib/skin/skin-context';

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({ ok: true });

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useSkin', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.removeAttribute('data-skin');
    document.documentElement.classList.remove('dark');
  });

  it('inicia com skin corporate por padrão', () => {
    const { result } = renderHook(() => useSkin(), {
      wrapper: ({ children }) => <SkinProvider>{children}</SkinProvider>,
    });
    expect(result.current.skinId).toBe('corporate');
  });

  it('setSkin aplica data-skin no html', async () => {
    const { result } = renderHook(() => useSkin(), {
      wrapper: ({ children }) => <SkinProvider>{children}</SkinProvider>,
    });
    await act(async () => {
      await result.current.setSkin('noturno');
    });
    expect(document.documentElement.getAttribute('data-skin')).toBe('noturno');
  });

  it('setSkin noturno adiciona classe .dark', async () => {
    const { result } = renderHook(() => useSkin(), {
      wrapper: ({ children }) => <SkinProvider>{children}</SkinProvider>,
    });
    await act(async () => {
      await result.current.setSkin('noturno');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('setSkin moderno remove classe .dark', async () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useSkin(), {
      wrapper: ({ children }) => <SkinProvider>{children}</SkinProvider>,
    });
    await act(async () => {
      await result.current.setSkin('moderno');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('setSkin salva no localStorage', async () => {
    const { result } = renderHook(() => useSkin(), {
      wrapper: ({ children }) => <SkinProvider>{children}</SkinProvider>,
    });
    await act(async () => {
      await result.current.setSkin('classico');
    });
    expect(localStorageMock.getItem('consultor-ai-skin')).toBe('classico');
  });

  it('setSkin chama PATCH /api/consultants/me', async () => {
    const { result } = renderHook(() => useSkin(), {
      wrapper: ({ children }) => <SkinProvider>{children}</SkinProvider>,
    });
    await act(async () => {
      await result.current.setSkin('moderno');
    });
    expect(fetch).toHaveBeenCalledWith(
      '/api/consultants/me',
      expect.objectContaining({ method: 'PATCH' })
    );
  });
});
