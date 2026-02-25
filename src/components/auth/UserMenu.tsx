'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogoutButton } from './LogoutButton';

export function UserMenu() {
  const { user, consultant, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-1">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  if (!user) {
    // Auth timed out or session unavailable — show logout so user can recover
    return (
      <div className="border-t p-4 dark:border-gray-700">
        <LogoutButton variant="outline" className="w-full text-sm">
          Sair da conta
        </LogoutButton>
      </div>
    );
  }

  const displayName = consultant?.name || user.email?.split('@')[0] || 'Usuário';
  const email = user.email || '';

  // Get initials for avatar
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="border-t p-4 dark:border-gray-700">
      <div className="mb-3 flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
          <span className="text-sm font-semibold text-white">{initials}</span>
        </div>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
            {displayName}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">{email}</p>
          {consultant?.subscription_tier && (
            <p className="mt-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              {consultant.subscription_tier === 'freemium' && 'Plano Gratuito'}
              {consultant.subscription_tier === 'pro' && 'Plano Pro'}
              {consultant.subscription_tier === 'agencia' && 'Plano Agência'}
            </p>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <LogoutButton variant="outline" className="w-full text-sm">
        Sair da conta
      </LogoutButton>
    </div>
  );
}
