'use client'

import { useAuth } from '@/hooks/useAuth'
import { LogoutButton } from './LogoutButton'

export function UserMenu() {
  const { user, consultant, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = consultant?.name || user.email?.split('@')[0] || 'Usuário'
  const email = user.email || ''

  // Get initials for avatar
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="border-t dark:border-gray-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <span className="text-white font-semibold text-sm">{initials}</span>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {email}
          </p>
          {consultant?.subscription_tier && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
              {consultant.subscription_tier === 'freemium' && 'Plano Gratuito'}
              {consultant.subscription_tier === 'pro' && 'Plano Pro'}
              {consultant.subscription_tier === 'agencia' && 'Plano Agência'}
            </p>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <LogoutButton
        variant="outline"
        className="w-full text-sm"
      >
        Sair da conta
      </LogoutButton>
    </div>
  )
}
