'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect, type ReactNode } from 'react';
import { initSentry } from '@/lib/monitoring';
import { SkinProvider } from '@/lib/skin/skin-context';
import type { SkinId } from '@/lib/skin/types';

export function Providers({
  children,
  initialSkin,
}: {
  children: ReactNode;
  initialSkin?: SkinId;
}) {
  useEffect(() => {
    initSentry().catch(console.error);
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <SkinProvider initialSkin={initialSkin}>{children}</SkinProvider>
        {process.env.NODE_ENV === 'development' &&
          process.env.NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS === 'true' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
