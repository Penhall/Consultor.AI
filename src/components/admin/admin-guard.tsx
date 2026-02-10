/**
 * Admin Guard Component
 *
 * Checks is_admin flag and redirects non-admins with toast message.
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { consultant, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !consultant?.is_admin) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, consultant, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !consultant?.is_admin) {
    return null;
  }

  return <>{children}</>;
}
