'use client';

import { useState } from 'react';
import { useCRMSyncLogs, type CRMSyncLog } from '@/hooks/useCRM';

interface CRMSyncHistoryProps {
  integrationId?: string;
  leadId?: string;
}

const STATUS_STYLES: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pendente', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  in_progress: { label: 'Em Andamento', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  success: { label: 'Sucesso', color: 'text-green-700', bgColor: 'bg-green-100' },
  failed: { label: 'Falhou', color: 'text-red-700', bgColor: 'bg-red-100' },
  partial: { label: 'Parcial', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

export function CRMSyncHistory({ integrationId, leadId }: CRMSyncHistoryProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useCRMSyncLogs({
    integration_id: integrationId,
    lead_id: leadId,
    page,
    limit,
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded bg-gray-200 dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-red-600 dark:text-red-400">
          Erro ao carregar historico: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </div>
      </div>
    );
  }

  const logs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b p-4 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Historico de Sincronizacoes</h3>
        {pagination && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {pagination.total} sincronizacoes no total
          </p>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Nenhuma sincronizacao realizada ainda.
        </div>
      ) : (
        <>
          <div className="divide-y dark:divide-gray-700">
            {logs.map((log: CRMSyncLog) => {
              const defaultStyle = {
                label: 'Pendente',
                color: 'text-yellow-700',
                bgColor: 'bg-yellow-100',
              };
              const statusStyleLookup = STATUS_STYLES[log.status] || defaultStyle;
              const label = statusStyleLookup.label;
              const bgColor = statusStyleLookup.bgColor;
              const color = statusStyleLookup.color;

              return (
                <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${bgColor} ${color}`}
                        >
                          {label}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {log.operation === 'create' ? 'Criacao' : 'Atualizacao'}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-4 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatDate(log.started_at)}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500">
                          Duracao: {formatDuration(log.duration_ms)}
                        </span>
                      </div>

                      {log.error_message && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                          Erro: {log.error_message}
                        </div>
                      )}

                      {log.crm_record_url && (
                        <div className="mt-2">
                          <a
                            href={log.crm_record_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Ver no CRM
                          </a>
                        </div>
                      )}
                    </div>

                    {log.lead_id && (
                      <a
                        href={`/dashboard/leads/${log.lead_id}`}
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Ver Lead
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4 dark:border-gray-700">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Pagina {page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Proxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
