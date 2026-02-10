/**
 * Checkout Result Page
 *
 * Handles success and cancel redirects from Stripe Checkout.
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = '/dashboard';
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  if (status === 'success') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Assinatura confirmada!</h1>
          <p className="mt-2 text-muted-foreground">
            Sua assinatura foi processada com sucesso. Seus créditos já estão disponíveis.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Redirecionando para o dashboard em {countdown}s...
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
          >
            Ir para o Dashboard
          </a>
        </div>
      </main>
    );
  }

  // Cancel or unknown status
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Pagamento cancelado</h1>
        <p className="mt-2 text-muted-foreground">
          O processo de pagamento foi cancelado. Você pode tentar novamente quando quiser.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <a
            href="/pricing"
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
          >
            Ver planos
          </a>
          <a
            href="/dashboard"
            className="rounded-lg border border-border px-6 py-2 text-sm font-semibold"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
