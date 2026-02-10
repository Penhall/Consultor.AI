/**
 * Cookie Consent Banner Component
 *
 * LGPD-compliant banner with accept/reject buttons.
 * Persists choice in localStorage. Analytics only load after consent.
 */

'use client';

import { useState, useEffect } from 'react';

const CONSENT_KEY = 'cookie-consent';

export type ConsentStatus = 'accepted' | 'rejected' | null;

export function useConsentStatus(): ConsentStatus {
  const [status, setStatus] = useState<ConsentStatus>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'accepted' || stored === 'rejected') {
      setStatus(stored);
    }
  }, []);

  return status;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-slate-600">
          Usamos cookies para melhorar sua experiência e analisar o uso do site. Ao aceitar, você
          concorda com nossa{' '}
          <a href="/privacidade" className="text-blue-600 underline">
            Política de Privacidade
          </a>
          .
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleReject}
            className="rounded-md border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Recusar
          </button>
          <button
            onClick={handleAccept}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
