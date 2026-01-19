'use client'

import type { Database } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Lead = Database['public']['Tables']['leads']['Row']

const statusOptions: Array<{ value: Lead['status']; label: string }> = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em contato' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Perdido' },
]

interface LeadDetailProps {
  lead: Lead
  onStatusChange?: (status: Lead['status']) => Promise<void> | void
}

export function LeadDetail({ lead, onStatusChange }: LeadDetailProps) {
  const handleStatus = async (status: Lead['status']) => {
    if (status === lead.status) return
    await onStatusChange?.(status)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{lead.name || lead.whatsapp_number}</span>
            <Badge>{lead.status.replace('_', ' ')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <p className="text-gray-500">WhatsApp</p>
              <p className="font-semibold">{lead.whatsapp_number}</p>
            </div>
            <div>
              <p className="text-gray-500">Score</p>
              <p className="font-semibold">{lead.score ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Criado</p>
              <p>{new Date(lead.created_at).toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-gray-500">Atualizado</p>
              <p>{new Date(lead.updated_at).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-2">Dados de qualificação</p>
            <pre className="bg-gray-50 dark:bg-gray-900 text-xs p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
              {JSON.stringify(lead.metadata ?? {}, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status do lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={option.value === lead.status ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => handleStatus(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
