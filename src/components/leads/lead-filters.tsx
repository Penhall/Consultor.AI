'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X, ChevronDown, ChevronUp, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LeadFilters {
  search?: string;
  statuses?: string[];
  dateFrom?: string;
  dateTo?: string;
  scoreMin?: number;
  scoreMax?: number;
  source?: string;
}

interface LeadFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  className?: string;
}

const statusOptions = [
  { value: 'novo', label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  { value: 'em_contato', label: 'Em Contato', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'qualificado', label: 'Qualificado', color: 'bg-green-100 text-green-800' },
  { value: 'agendado', label: 'Agendado', color: 'bg-purple-100 text-purple-800' },
  { value: 'fechado', label: 'Fechado', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-100 text-red-800' },
];

const sourceOptions = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'manual', label: 'Manual' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Indicacao' },
];

export function LeadFilters({ filters, onFiltersChange, className }: LeadFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search: search || undefined });
  };

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    onFiltersChange({
      ...filters,
      statuses: newStatuses.length > 0 ? newStatuses : undefined,
    });
  };

  const handleDateFromChange = (date: string) => {
    onFiltersChange({ ...filters, dateFrom: date || undefined });
  };

  const handleDateToChange = (date: string) => {
    onFiltersChange({ ...filters, dateTo: date || undefined });
  };

  const handleScoreMinChange = (value: string) => {
    const num = parseInt(value, 10);
    onFiltersChange({
      ...filters,
      scoreMin: !isNaN(num) && num >= 0 ? num : undefined,
    });
  };

  const handleScoreMaxChange = (value: string) => {
    const num = parseInt(value, 10);
    onFiltersChange({
      ...filters,
      scoreMax: !isNaN(num) && num <= 100 ? num : undefined,
    });
  };

  const handleSourceChange = (source: string) => {
    onFiltersChange({
      ...filters,
      source: filters.source === source ? undefined : source,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = [
    filters.search,
    filters.statuses?.length,
    filters.dateFrom,
    filters.dateTo,
    filters.scoreMin !== undefined,
    filters.scoreMax !== undefined,
    filters.source,
  ].filter(Boolean).length;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Search and Toggle */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={filters.search || ''}
              onChange={e => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {expanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(option => {
                  const isActive = filters.statuses?.includes(option.value);
                  return (
                    <Badge
                      key={option.value}
                      variant={isActive ? 'default' : 'outline'}
                      className={cn('cursor-pointer transition-colors', isActive && option.color)}
                      onClick={() => handleStatusToggle(option.value)}
                    >
                      {option.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Data Inicial
                </Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={e => handleDateFromChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Data Final
                </Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={e => handleDateToChange(e.target.value)}
                />
              </div>
            </div>

            {/* Score Range Filter */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4" />
                  Score Minimo
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={filters.scoreMin ?? ''}
                  onChange={e => handleScoreMinChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Target className="h-4 w-4" />
                  Score Maximo
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={filters.scoreMax ?? ''}
                  onChange={e => handleScoreMaxChange(e.target.value)}
                />
              </div>
            </div>

            {/* Source Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Origem</Label>
              <div className="flex flex-wrap gap-2">
                {sourceOptions.map(option => {
                  const isActive = filters.source === option.value;
                  return (
                    <Badge
                      key={option.value}
                      variant={isActive ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors"
                      onClick={() => handleSourceChange(option.value)}
                    >
                      {option.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Convert LeadFilters to URL search params
 */
export function filtersToSearchParams(filters: LeadFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.statuses?.length) params.set('statuses', filters.statuses.join(','));
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.scoreMin !== undefined) params.set('scoreMin', filters.scoreMin.toString());
  if (filters.scoreMax !== undefined) params.set('scoreMax', filters.scoreMax.toString());
  if (filters.source) params.set('source', filters.source);

  return params;
}
