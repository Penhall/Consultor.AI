'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (Sentry)
    console.error('Dashboard error:', error);

    // In production, send to Sentry
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // TODO: Implement Sentry when configured
      // Sentry.captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md px-4 text-center">
        {/* Error Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Ops! Algo deu errado
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Encontramos um problema ao carregar esta pagina. Nossa equipe foi notificada e estamos
          trabalhando para resolver.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-lg bg-gray-100 p-4 text-left dark:bg-gray-800">
            <p className="break-all font-mono text-sm text-red-600 dark:text-red-400">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="w-full rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700 sm:w-auto"
          >
            Tentar Novamente
          </button>
          <Link
            href="/dashboard"
            className="w-full rounded-lg border px-6 py-2.5 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
          >
            Voltar ao Inicio
          </Link>
        </div>

        {/* Help Link */}
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Precisa de ajuda?{' '}
          <a
            href="mailto:suporte@consultor.ai"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Entre em contato com o suporte
          </a>
        </p>
      </div>
    </div>
  );
}
