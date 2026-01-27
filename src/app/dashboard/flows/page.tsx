'use client';

import { useState } from 'react';
import { useFlows, useDeleteFlow, useActivateFlow, useDuplicateFlow } from '@/hooks/useFlows';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import {
  Plus,
  RefreshCw,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

type FlowVertical = 'saude' | 'imoveis' | 'geral';

const verticalLabels: Record<FlowVertical, string> = {
  saude: 'Saúde',
  imoveis: 'Imóveis',
  geral: 'Geral',
};

const verticalColors: Record<FlowVertical, string> = {
  saude: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  imoveis: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  geral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export default function FlowsPage() {
  const [error, setError] = useState<string | null>(null);
  const [verticalFilter, setVerticalFilter] = useState<FlowVertical | undefined>(undefined);
  const [duplicateDialog, setDuplicateDialog] = useState<{
    open: boolean;
    flowId: string;
    flowName: string;
  }>({ open: false, flowId: '', flowName: '' });
  const [newFlowName, setNewFlowName] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    flowId: string;
    flowName: string;
  }>({ open: false, flowId: '', flowName: '' });

  const {
    data: flows,
    isLoading: loading,
    isFetching,
    refetch,
    error: queryError,
  } = useFlows({ vertical: verticalFilter });

  const deleteFlow = useDeleteFlow();
  const activateFlow = useActivateFlow();
  const duplicateFlow = useDuplicateFlow();

  const handleActivate = async (flowId: string) => {
    setError(null);
    try {
      await activateFlow.mutateAsync(flowId);
    } catch (err) {
      console.error(err);
      setError('Erro ao ativar fluxo.');
    }
  };

  const handleDuplicate = async () => {
    if (!newFlowName.trim()) return;
    setError(null);
    try {
      await duplicateFlow.mutateAsync({
        flowId: duplicateDialog.flowId,
        newName: newFlowName,
      });
      setDuplicateDialog({ open: false, flowId: '', flowName: '' });
      setNewFlowName('');
    } catch (err) {
      console.error(err);
      setError('Erro ao duplicar fluxo.');
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteFlow.mutateAsync(deleteDialog.flowId);
      setDeleteDialog({ open: false, flowId: '', flowName: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir fluxo.';
      setError(message);
    }
  };

  const openDuplicateDialog = (flowId: string, flowName: string) => {
    setDuplicateDialog({ open: true, flowId, flowName });
    setNewFlowName(`${flowName} (Cópia)`);
  };

  const openDeleteDialog = (flowId: string, flowName: string) => {
    setDeleteDialog({ open: true, flowId, flowName });
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Fluxos</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie seus fluxos de conversação personalizados.
            {flows && flows.length > 0 && (
              <span className="ml-2 text-sm">
                ({flows.length} {flows.length === 1 ? 'fluxo' : 'fluxos'})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={loading || isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Link href="/dashboard/flows/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Fluxo
            </Button>
          </Link>
        </div>
      </div>

      {/* Vertical Filter */}
      <div className="flex gap-2">
        <Button
          variant={verticalFilter === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setVerticalFilter(undefined)}
        >
          Todos
        </Button>
        {(['saude', 'imoveis', 'geral'] as FlowVertical[]).map(v => (
          <Button
            key={v}
            variant={verticalFilter === v ? 'default' : 'outline'}
            size="sm"
            onClick={() => setVerticalFilter(v)}
          >
            {verticalLabels[v]}
          </Button>
        ))}
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {queryError && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            Erro ao carregar fluxos.
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !flows || flows.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="mb-2 text-gray-500">Nenhum fluxo encontrado</p>
            <p className="mb-4 text-sm text-gray-400">
              Crie seu primeiro fluxo de conversação para começar.
            </p>
            <Link href="/dashboard/flows/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Fluxo
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flows.map(flow => (
            <Card key={flow.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {flow.name}
                      {flow.is_active && (
                        <span title="Ativo">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </span>
                      )}
                      {flow.is_default && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Padrão
                        </span>
                      )}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${verticalColors[flow.vertical]}`}
                      >
                        {verticalLabels[flow.vertical]}
                      </span>
                      <span className="text-xs text-gray-500">v{flow.version}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/dashboard/flows/${flow.id}`}>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      </Link>
                      {!flow.is_active && (
                        <DropdownMenuItem onClick={() => handleActivate(flow.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Ativar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => openDuplicateDialog(flow.id, flow.name)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(flow.id, flow.name)}
                        className="text-red-600 focus:text-red-600"
                        disabled={flow.is_default}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {flow.description || 'Sem descrição'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{flow.definition.passos.length} passos</span>
                  <span>
                    {flow.usage_count} {flow.usage_count === 1 ? 'uso' : 'usos'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Duplicate Dialog */}
      <Dialog
        open={duplicateDialog.open}
        onOpenChange={open => setDuplicateDialog({ open, flowId: '', flowName: '' })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Fluxo</DialogTitle>
            <DialogDescription>
              Crie uma cópia de &quot;{duplicateDialog.flowName}&quot; com um novo nome.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="newFlowName">Nome do novo fluxo</Label>
            <Input
              id="newFlowName"
              value={newFlowName}
              onChange={e => setNewFlowName(e.target.value)}
              placeholder="Nome do fluxo"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateDialog({ open: false, flowId: '', flowName: '' })}
            >
              Cancelar
            </Button>
            <Button onClick={handleDuplicate} disabled={!newFlowName.trim()}>
              Duplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={open => setDeleteDialog({ open, flowId: '', flowName: '' })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Excluir Fluxo
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o fluxo &quot;{deleteDialog.flowName}&quot;? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, flowId: '', flowName: '' })}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
