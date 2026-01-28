'use client';

import { useState } from 'react';
import {
  type CRMIntegrationResponse,
  getProviderDisplayName,
  getStatusDisplayInfo,
  useTestCRMConnection,
  useDeleteCRMIntegration,
  useUpdateCRMIntegration,
} from '@/hooks/useCRM';

interface CRMIntegrationCardProps {
  integration: CRMIntegrationResponse;
  onSyncClick: (integrationId: string) => void;
  onEditClick: (integration: CRMIntegrationResponse) => void;
}

export function CRMIntegrationCard({
  integration,
  onSyncClick,
  onEditClick,
}: CRMIntegrationCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const testConnection = useTestCRMConnection();
  const deleteIntegration = useDeleteCRMIntegration();
  const updateIntegration = useUpdateCRMIntegration();

  const statusInfo = getStatusDisplayInfo(integration.status);
  const providerName = getProviderDisplayName(integration.provider);

  const handleTestConnection = async () => {
    try {
      const result = await testConnection.mutateAsync(integration.id);
      if (result.connected) {
        alert(`Conexao estabelecida com sucesso! Conta: ${result.accountName || 'N/A'}`);
      } else {
        alert('Falha na conexao. Verifique suas credenciais.');
      }
    } catch (error) {
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateIntegration.mutateAsync({
        integrationId: integration.id,
        updates: {
          status: integration.status === 'active' ? 'inactive' : 'active',
        },
      });
    } catch (error) {
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIntegration.mutateAsync(integration.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const syncSuccessRate =
    integration.total_syncs > 0
      ? Math.round((integration.successful_syncs / integration.total_syncs) * 100)
      : 0;

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b p-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
              <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                {providerName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{integration.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{providerName}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 border-b p-4 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Sincronizacoes</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {integration.total_syncs}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Taxa de Sucesso</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{syncSuccessRate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ultima Sincronizacao</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(integration.last_sync_at)}
          </p>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="border-b p-4 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {integration.auto_sync_enabled && (
            <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Auto-sync ativo
            </span>
          )}
          {integration.sync_on_qualification && (
            <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Sync ao qualificar
            </span>
          )}
          {integration.sync_on_score_threshold && (
            <span className="rounded bg-purple-50 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Score &gt;= {integration.sync_on_score_threshold}
            </span>
          )}
        </div>
        {integration.last_sync_error && (
          <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
            Ultimo erro: {integration.last_sync_error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testConnection.isPending}
            className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {testConnection.isPending ? 'Testando...' : 'Testar Conexao'}
          </button>
          <button
            onClick={() => onSyncClick(integration.id)}
            disabled={integration.status !== 'active'}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Sincronizar
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleActive}
            disabled={updateIntegration.isPending}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              integration.status === 'active'
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
            }`}
          >
            {integration.status === 'active' ? 'Desativar' : 'Ativar'}
          </button>
          <button
            onClick={() => onEditClick(integration)}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Editar
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Confirmar Exclusao
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Tem certeza que deseja excluir a integracao &quot;{integration.name}&quot;? Esta acao
              nao pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteIntegration.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteIntegration.isPending ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
