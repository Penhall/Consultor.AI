'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-3xl font-bold text-slate-900">Algo deu errado!</h2>
        <p className="mb-8 text-slate-600">
          Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
        {error.digest && (
          <p className="mb-4 text-sm text-slate-500">Código do erro: {error.digest}</p>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Tentar Novamente</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}
