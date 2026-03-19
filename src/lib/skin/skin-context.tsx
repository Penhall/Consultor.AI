'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_SKIN_ID, SKINS } from './skins';
import { type SkinId, isValidSkinId } from './types';

const STORAGE_KEY = 'consultor-ai-skin';
const COOKIE_NAME = 'skin';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

interface SkinContextValue {
  skinId: SkinId;
  setSkin: (id: SkinId) => Promise<void>;
  skins: typeof SKINS;
}

const SkinContext = createContext<SkinContextValue | null>(null);

export function SkinProvider({
  children,
  initialSkin,
}: {
  children: React.ReactNode;
  initialSkin?: SkinId;
}) {
  const [skinId, setSkinId] = useState<SkinId>(initialSkin ?? DEFAULT_SKIN_ID);

  // Aplica a skin no DOM
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-skin', skinId);
    // Noturno precisa da classe .dark para compatibilidade com dark: variants remanescentes
    if (skinId === 'noturno') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [skinId]);

  // Ao montar, lê localStorage (pode sobrescrever o SSR cookie se diferente)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidSkinId(stored) && stored !== skinId) {
      setSkinId(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSkin = useCallback(async (id: SkinId) => {
    setSkinId(id);

    // Cache local
    localStorage.setItem(STORAGE_KEY, id);

    // Cookie SSR anti-flash
    document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

    // Persistência no banco
    try {
      await fetch('/api/consultants/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: id }),
      });
    } catch {
      // Falha silenciosa — skin já foi aplicada localmente
    }
  }, []);

  return (
    <SkinContext.Provider value={{ skinId, setSkin, skins: SKINS }}>
      {children}
    </SkinContext.Provider>
  );
}

export function useSkin(): SkinContextValue {
  const ctx = useContext(SkinContext);
  if (!ctx) throw new Error('useSkin must be used within SkinProvider');
  return ctx;
}
