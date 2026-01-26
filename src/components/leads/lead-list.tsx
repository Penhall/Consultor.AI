'use client';

import { useMemo, useState } from 'react';
import type { Database } from '@/types/database';
import { LeadCard } from './lead-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Lead = Database['public']['Tables']['leads']['Row'];

const statuses: Array<{ value: Lead['status'] | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todos' },
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em contato' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Perdido' },
];

interface LeadListProps {
  leads: Lead[];
  onSelect?: (lead: Lead) => void;
  selectedId?: string;
}

export function LeadList({ leads, onSelect, selectedId }: LeadListProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Lead['status'] | 'todos'>('todos');

  const filtered = useMemo(() => {
    return leads
      .filter(lead => {
        if (status !== 'todos' && lead.status !== status) return false;
        if (!query) return true;
        const text = query.toLowerCase();
        return (
          (lead.name && lead.name.toLowerCase().includes(text)) ||
          lead.whatsapp_number.toLowerCase().includes(text)
        );
      })
      .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''));
  }, [leads, query, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Buscar por nome ou WhatsApp"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {statuses.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`rounded-full border px-3 py-1 text-sm ${
                status === option.value
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onClick={() => onSelect?.(lead)}
            isSelected={lead.id === selectedId}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Badge>Sem resultados</Badge>
          <span>Nenhum lead encontrado com os filtros atuais.</span>
        </div>
      )}
    </div>
  );
}
