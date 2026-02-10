'use client';

import { use, useState } from 'react';
import { useFlow, useUpdateFlow } from '@/hooks/useFlows';
import { FlowEditor } from '@/components/flows/flow-editor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import type { FlowDefinition } from '@/lib/flow-engine/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FlowEditorPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: flow, isLoading, error: queryError } = useFlow(id);
  const updateFlow = useUpdateFlow();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [localDefinition, setLocalDefinition] = useState<FlowDefinition | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleDefinitionChange = (newDefinition: FlowDefinition) => {
    setLocalDefinition(newDefinition);
    setHasChanges(true);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!localDefinition || !flow) return;

    setError(null);
    setSuccess(null);

    try {
      await updateFlow.mutateAsync({
        flowId: flow.id,
        updates: { definition: localDefinition },
      });
      setHasChanges(false);
      setSuccess('Fluxo salvo com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar fluxo';
      setError(message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex items-center gap-4">
          <CardSkeleton className="h-10 w-10" />
          <CardSkeleton className="h-8 w-64" />
        </div>
        <CardSkeleton className="h-[600px]" />
      </div>
    );
  }

  if (queryError || !flow) {
    return (
      <div className="space-y-6 p-8">
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            Fluxo não encontrado ou erro ao carregar.
          </AlertDescription>
        </Alert>
        <Link href="/dashboard/flows">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Fluxos
          </Button>
        </Link>
      </div>
    );
  }

  const currentDefinition = localDefinition || flow.definition;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/flows">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{flow.name}</h1>
            <p className="text-sm text-gray-500">
              Versão {flow.version} • {flow.definition.passos.length} passos
              {hasChanges && <span className="ml-2 text-amber-600">• Alterações não salvas</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-sm text-red-600">{error}</span>}
          {success && <span className="text-sm text-green-600">{success}</span>}
          <Button onClick={handleSave} disabled={!hasChanges || updateFlow.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateFlow.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <FlowEditor definition={currentDefinition} onChange={handleDefinitionChange} />
      </div>
    </div>
  );
}
