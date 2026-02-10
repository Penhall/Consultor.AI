'use client';

import { useState } from 'react';
import { useCRMIntegrations, useSyncLeadsToCRM, type CRMIntegrationResponse } from '@/hooks/useCRM';
import { CRMIntegrationCard } from '@/components/integrations/crm-integration-card';
import { CRMConnectDialog } from '@/components/integrations/crm-connect-dialog';
import { CRMSyncHistory } from '@/components/integrations/crm-sync-history';
import { useLeads } from '@/hooks/useLeads';

export default function IntegracoesPage() {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<CRMIntegrationResponse | null>(null);
  const [syncDialogIntegration, setSyncDialogIntegration] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { data: integrations, isLoading, error } = useCRMIntegrations();
  const { data: leadsData } = useLeads({ statuses: ['qualificado'] });
  const syncLeads = useSyncLeadsToCRM();

  const handleSyncClick = (integrationId: string) => {
    setSyncDialogIntegration(integrationId);
    setSelectedLeads([]);
  };

  const handleEditClick = (integration: CRMIntegrationResponse) => {
    setEditingIntegration(integration);
    setShowConnectDialog(true);
  };

  const handleCloseDialog = () => {
    setShowConnectDialog(false);
    setEditingIntegration(null);
  };

  const handleSync = async () => {
    if (!syncDialogIntegration || selectedLeads.length === 0) return;

    try {
      const result = await syncLeads.mutateAsync({
        integrationId: syncDialogIntegration,
        data: { lead_ids: selectedLeads, force: false },
      });

      alert(
        `Sincronizacao concluida!\n` +
          `Total: ${result.totalLeads}\n` +
          `Sucesso: ${result.successCount}\n` +
          `Falhas: ${result.failedCount}`
      );
      setSyncDialogIntegration(null);
      setSelectedLeads([]);
    } catch (err) {
      alert(`Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const selectAllLeads = () => {
    const allIds = leadsData?.data.map(l => l.id) || [];
    setSelectedLeads(allIds);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map(i => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        Erro ao carregar integracoes: {error instanceof Error ? error.message : 'Erro desconhecido'}
      </div>
    );
  }

  const hasIntegrations = integrations && integrations.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integracoes CRM</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Conecte seu CRM para sincronizar leads automaticamente
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasIntegrations && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {showHistory ? 'Ver Integracoes' : 'Ver Historico'}
            </button>
          )}
          <button
            onClick={() => setShowConnectDialog(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            + Conectar CRM
          </button>
        </div>
      </div>

      {/* Content */}
      {showHistory ? (
        <CRMSyncHistory />
      ) : hasIntegrations ? (
        <div className="grid gap-6 md:grid-cols-2">
          {integrations.map(integration => (
            <CRMIntegrationCard
              key={integration.id}
              integration={integration}
              onSyncClick={handleSyncClick}
              onEditClick={handleEditClick}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Nenhuma integracao configurada
          </h3>
          <p className="mx-auto mb-6 max-w-md text-gray-500 dark:text-gray-400">
            Conecte seu CRM para sincronizar leads automaticamente. Suportamos RD Station,
            Pipedrive, HubSpot e Agendor.
          </p>
          <button
            onClick={() => setShowConnectDialog(true)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Conectar Primeiro CRM
          </button>
        </div>
      )}

      {/* Connect/Edit Dialog */}
      <CRMConnectDialog
        isOpen={showConnectDialog}
        onClose={handleCloseDialog}
        editingIntegration={editingIntegration}
      />

      {/* Sync Dialog */}
      {syncDialogIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800">
            <div className="border-b p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sincronizar Leads
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selecione os leads para sincronizar com o CRM
              </p>
            </div>

            <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedLeads.length} leads selecionados
              </span>
              <button
                onClick={selectAllLeads}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Selecionar todos
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {leadsData?.data && leadsData.data.length > 0 ? (
                <div className="space-y-2">
                  {leadsData.data.map(lead => (
                    <label
                      key={lead.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {lead.name || 'Sem nome'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {lead.whatsapp_number}
                        </div>
                      </div>
                      {lead.score && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Score: {lead.score}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhum lead qualificado disponivel para sincronizacao.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t p-4 dark:border-gray-700">
              <button
                onClick={() => {
                  setSyncDialogIntegration(null);
                  setSelectedLeads([]);
                }}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSync}
                disabled={selectedLeads.length === 0 || syncLeads.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {syncLeads.isPending
                  ? 'Sincronizando...'
                  : `Sincronizar ${selectedLeads.length} Leads`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
