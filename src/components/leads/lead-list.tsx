'use client'

import { useMemo, useState } from 'react'
import type { Database } from '@/types/database'
import { LeadCard } from './lead-card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Lead = Database['public']['Tables']['leads']['Row']

const statuses: Array<{ value: Lead['status'] | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em contato' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Perdido' },
]

interface LeadListProps {
  leads: Lead[]
  onSelect?: (lead: Lead) => void
}

export function LeadList({ leads, onSelect }: LeadListProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Lead['status'] | 'todos'>('todos')

  const filtered = useMemo(() => {
    return leads
      .filter((lead) => {
        if (status !== 'todos' && lead.status !== status) return false
        if (!query) return true
        const text = query.toLowerCase()
        return (
          (lead.name && lead.name.toLowerCase().includes(text)) ||
          lead.whatsapp_number.toLowerCase().includes(text)
        )
      })
      .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
  }, [leads, query, status])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Input
          placeholder="Buscar por nome ou WhatsApp"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {statuses.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`px-3 py-1 rounded-full text-sm border ${
                status === option.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={() => onSelect?.(lead)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Badge>Sem resultados</Badge>
          <span>Nenhum lead encontrado com os filtros atuais.</span>
        </div>
      )}
    </div>
  )
}
