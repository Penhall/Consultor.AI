'use client'

import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { consultant, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const displayName = consultant?.name || 'Consultor'

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bem-vindo, {displayName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aqui está um resumo da sua atividade
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Leads */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total de Leads
            </h3>
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Nenhum lead cadastrado ainda
          </p>
        </div>

        {/* Active Conversations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Conversas Ativas
            </h3>
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Nenhuma conversa ativa
          </p>
        </div>

        {/* Monthly Limit */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Limite Mensal
            </h3>
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            0 / {consultant?.monthly_lead_limit || 20}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Leads processados este mês
          </p>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          🚀 Primeiros Passos
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Configure seu perfil
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete suas informações e conecte seu WhatsApp Business
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                2
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Crie seu primeiro fluxo
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Personalize as conversas automatizadas para seu negócio
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                3
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Comece a receber leads
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Compartilhe seu link do WhatsApp e deixe a IA trabalhar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
