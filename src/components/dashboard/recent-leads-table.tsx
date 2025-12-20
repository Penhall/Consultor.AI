/**
 * Recent Leads Table Component
 *
 * Displays a list of recent leads
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RecentLead } from '@/hooks/useAnalytics'

interface RecentLeadsTableProps {
  leads: RecentLead[]
  loading?: boolean
}

export function RecentLeadsTable({ leads, loading = false }: RecentLeadsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            Nenhum lead registrado ainda
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      novo: 'bg-blue-100 text-blue-800',
      em_contato: 'bg-yellow-100 text-yellow-800',
      qualificado: 'bg-green-100 text-green-800',
      fechado: 'bg-purple-100 text-purple-800',
      perdido: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      novo: 'Novo',
      em_contato: 'Em Contato',
      qualificado: 'Qualificado',
      fechado: 'Fechado',
      perdido: 'Perdido',
    }
    return labels[status] || status
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                {(lead.name || lead.whatsapp_number).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {lead.name || lead.whatsapp_number}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                      lead.status
                    )}`}
                  >
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {lead.whatsapp_number}
                  {lead.score !== null && ` • Score: ${lead.score}`}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(lead.created_at)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
