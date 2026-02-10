'use client';

import { useState, useEffect } from 'react';
import type { Database } from '@/types/database';
import { LeadList } from '@/components/leads/lead-list';
import { LeadDetail } from '@/components/leads/lead-detail';
import {
  LeadFilters,
  filtersToSearchParams,
  type LeadFilters as LeadFiltersType,
} from '@/components/leads/lead-filters';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RefreshCw } from 'lucide-react';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { LeadCardSkeleton, FilterSkeleton, CardSkeleton } from '@/components/ui/skeleton';

type Lead = Database['public']['Tables']['leads']['Row'];

export default function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFiltersType>({});

  // Use optimized React Query hook
  const {
    data: leadsData,
    isLoading: loading,
    isFetching,
    refetch,
    error: queryError,
  } = useLeads(filters);

  const updateLead = useUpdateLead();

  const leads = leadsData?.data ?? [];
  const totalLeads = leadsData?.pagination?.total ?? 0;

  // Auto-select first lead when data loads
  useEffect(() => {
    if (leads.length > 0 && !selectedLead) {
      setSelectedLead(leads[0] ?? null);
    }
  }, [leads, selectedLead]);

  // Set error from query
  useEffect(() => {
    if (queryError) {
      setError('Nao foi possivel carregar os leads.');
    }
  }, [queryError]);

  const handleFiltersChange = (newFilters: LeadFiltersType) => {
    setFilters(newFilters);
    setSelectedLead(null); // Reset selection when filters change
  };

  const handleStatusChange = async (status: Lead['status']) => {
    if (!selectedLead) return;
    try {
      const updatedLead = await updateLead.mutateAsync({
        leadId: selectedLead.id,
        updates: { status },
      });
      setSelectedLead(updatedLead);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar status do lead.');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      // Export with current filters applied
      const params = filtersToSearchParams(filters);
      const res = await fetch(`/api/leads/export?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao exportar leads');

      // Get the blob and create download link
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      setError('Nao foi possivel exportar os leads.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Leads</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie e avance seus leads.
            {totalLeads > 0 && (
              <span className="ml-2 text-sm">
                ({totalLeads} {totalLeads === 1 ? 'lead' : 'leads'})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || leads.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={loading || isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-6">
          <FilterSkeleton />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:col-span-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <LeadCardSkeleton key={i} />
              ))}
            </div>
            <div className="xl:col-span-1">
              <CardSkeleton className="h-96" />
            </div>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="mb-2 text-gray-500">Nenhum lead encontrado</p>
            {Object.keys(filters).length > 0 && (
              <p className="text-sm text-gray-400">
                Tente ajustar os filtros para ver mais resultados.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <LeadList leads={leads} onSelect={setSelectedLead} selectedId={selectedLead?.id} />
          </div>
          <div className="xl:col-span-1">
            {selectedLead ? (
              <LeadDetail lead={selectedLead} onStatusChange={handleStatusChange} />
            ) : (
              <Card>
                <CardContent className="p-6 text-gray-600 dark:text-gray-300">
                  Selecione um lead para ver detalhes.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
