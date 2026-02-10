'use client';

import type { Database } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Lead = Database['public']['Tables']['leads']['Row'];

const statusColor: Record<string, string> = {
  novo: 'bg-blue-100 text-blue-800',
  em_contato: 'bg-yellow-100 text-yellow-800',
  agendado: 'bg-purple-100 text-purple-800',
  qualificado: 'bg-green-100 text-green-800',
  fechado: 'bg-emerald-100 text-emerald-800',
  perdido: 'bg-red-100 text-red-800',
};

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  isSelected?: boolean;
}

export function LeadCard({ lead, onClick, isSelected }: LeadCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        isSelected && 'shadow-md ring-2 ring-blue-500'
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="truncate text-base font-semibold">
          {lead.name || lead.whatsapp_number}
        </CardTitle>
        <Badge className={statusColor[lead.status ?? ''] || 'bg-gray-100 text-gray-800'}>
          {(lead.status ?? 'novo').replace('_', ' ')}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex justify-between">
          <span className="text-gray-500">Score</span>
          <span className="font-semibold">{lead.score ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Última atualização</span>
          <span>
            {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString('pt-BR') : '—'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
