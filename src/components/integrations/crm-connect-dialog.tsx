'use client';

import { useState } from 'react';
import {
  useCreateCRMIntegration,
  useUpdateCRMIntegration,
  getProviderDisplayName,
  type CRMIntegrationResponse,
} from '@/hooks/useCRM';
import type { CRMProvider, CreateCRMIntegrationInput } from '@/lib/validations/crm';

interface CRMConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingIntegration?: CRMIntegrationResponse | null;
}

const PROVIDERS: CRMProvider[] = ['rd-station', 'pipedrive', 'hubspot', 'agendor'];

const PROVIDER_DESCRIPTIONS: Record<CRMProvider, string> = {
  'rd-station': 'Integre com RD Station Marketing/CRM para sincronizar leads automaticamente.',
  pipedrive: 'Sincronize leads e negocios com o Pipedrive CRM.',
  hubspot: 'Conecte com HubSpot CRM para gerenciamento completo de leads.',
  agendor: 'Integre com Agendor, CRM brasileiro focado em vendas.',
};

const PROVIDER_PLACEHOLDERS: Record<CRMProvider, { apiKey: string; apiSecret?: string }> = {
  'rd-station': { apiKey: 'Token de acesso do RD Station' },
  pipedrive: { apiKey: 'API Token do Pipedrive' },
  hubspot: { apiKey: 'Private App Token (pat-...)' },
  agendor: { apiKey: 'API Key do Agendor' },
};

export function CRMConnectDialog({ isOpen, onClose, editingIntegration }: CRMConnectDialogProps) {
  const isEditing = !!editingIntegration;

  const [provider, setProvider] = useState<CRMProvider>(
    editingIntegration?.provider || 'rd-station'
  );
  const [name, setName] = useState(editingIntegration?.name || '');
  const [apiKey, setApiKey] = useState('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(
    editingIntegration?.auto_sync_enabled ?? true
  );
  const [syncOnQualification, setSyncOnQualification] = useState(
    editingIntegration?.sync_on_qualification ?? true
  );
  const [syncOnStatusChange, setSyncOnStatusChange] = useState(
    editingIntegration?.sync_on_status_change ?? false
  );
  const [syncOnScoreThreshold, setSyncOnScoreThreshold] = useState<number | null>(
    editingIntegration?.sync_on_score_threshold ?? null
  );
  const [error, setError] = useState<string | null>(null);

  const createIntegration = useCreateCRMIntegration();
  const updateIntegration = useUpdateCRMIntegration();

  const isPending = createIntegration.isPending || updateIntegration.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isEditing) {
        await updateIntegration.mutateAsync({
          integrationId: editingIntegration.id,
          updates: {
            name,
            ...(apiKey && { api_key: apiKey }),
            auto_sync_enabled: autoSyncEnabled,
            sync_on_qualification: syncOnQualification,
            sync_on_status_change: syncOnStatusChange,
            sync_on_score_threshold: syncOnScoreThreshold,
          },
        });
      } else {
        const data: CreateCRMIntegrationInput = {
          provider,
          name: name || getProviderDisplayName(provider),
          api_key: apiKey,
          field_mappings: {}, // Use defaults from API
          auto_sync_enabled: autoSyncEnabled,
          sync_on_qualification: syncOnQualification,
          sync_on_status_change: syncOnStatusChange,
          sync_on_score_threshold: syncOnScoreThreshold,
        };
        await createIntegration.mutateAsync(data);
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleClose = () => {
    setProvider('rd-station');
    setName('');
    setApiKey('');
    setAutoSyncEnabled(true);
    setSyncOnQualification(true);
    setSyncOnStatusChange(false);
    setSyncOnScoreThreshold(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white dark:bg-gray-800">
        <div className="border-b p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Integracao CRM' : 'Conectar CRM'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEditing
              ? 'Atualize as configuracoes da integracao'
              : 'Configure uma nova integracao com seu CRM'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 p-6">
            {/* Provider Selection (only for new integrations) */}
            {!isEditing && (
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Escolha o Provedor
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PROVIDERS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className={`rounded-lg border-2 p-4 text-left transition-colors ${
                        provider === p
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getProviderDisplayName(p)}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {PROVIDER_DESCRIPTIONS[p]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Integration Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nome da Integracao
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={`Meu ${getProviderDisplayName(provider)}`}
                className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* API Key */}
            <div>
              <label
                htmlFor="apiKey"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {isEditing ? 'Nova Chave de API (opcional)' : 'Chave de API'}
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={PROVIDER_PLACEHOLDERS[provider].apiKey}
                required={!isEditing}
                className="w-full rounded-lg border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              {isEditing && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Deixe em branco para manter a chave atual
                </p>
              )}
            </div>

            {/* Auto-sync Settings */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Configuracoes de Sincronizacao
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={autoSyncEnabled}
                  onChange={e => setAutoSyncEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Sincronizacao automatica ativada
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncOnQualification}
                  onChange={e => setSyncOnQualification(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Sincronizar quando lead for qualificado
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncOnStatusChange}
                  onChange={e => setSyncOnStatusChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Sincronizar em qualquer mudanca de status
                </span>
              </label>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={syncOnScoreThreshold !== null}
                    onChange={e => setSyncOnScoreThreshold(e.target.checked ? 70 : null)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Sincronizar quando score atingir
                  </span>
                </label>
                {syncOnScoreThreshold !== null && (
                  <div className="ml-7 mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={syncOnScoreThreshold}
                      onChange={e => setSyncOnScoreThreshold(Number(e.target.value))}
                      className="w-20 rounded border bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">pontos</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t p-6 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : isEditing ? 'Salvar Alteracoes' : 'Conectar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
