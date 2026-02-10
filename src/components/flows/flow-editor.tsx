'use client';

import { useState, useCallback } from 'react';
import type { FlowDefinition, FlowStep } from '@/lib/flow-engine/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MessageSquare,
  ListChecks,
  Zap,
  Plus,
  Trash2,
  GripVertical,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FlowEditorProps {
  definition: FlowDefinition;
  onChange: (definition: FlowDefinition) => void;
}

type StepType = 'mensagem' | 'escolha' | 'executar';

const stepTypeIcons: Record<StepType, React.ReactNode> = {
  mensagem: <MessageSquare className="h-4 w-4" />,
  escolha: <ListChecks className="h-4 w-4" />,
  executar: <Zap className="h-4 w-4" />,
};

const stepTypeLabels: Record<StepType, string> = {
  mensagem: 'Mensagem',
  escolha: 'Escolha',
  executar: 'Ação',
};

const stepTypeColors: Record<StepType, string> = {
  mensagem: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  escolha: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  executar: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

export function FlowEditor({ definition, onChange }: FlowEditorProps) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(definition.inicio || null);
  const [addStepDialog, setAddStepDialog] = useState<{
    open: boolean;
    afterStepId: string | null;
  }>({ open: false, afterStepId: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    stepId: string;
  }>({ open: false, stepId: '' });

  const selectedStep = definition.passos.find(s => s.id === selectedStepId);

  const updateStep = useCallback(
    (stepId: string, updates: Partial<FlowStep>) => {
      const newPassos = definition.passos.map(step => {
        if (step.id === stepId) {
          return { ...step, ...updates } as FlowStep;
        }
        return step;
      });
      onChange({ ...definition, passos: newPassos });
    },
    [definition, onChange]
  );

  const addStep = useCallback(
    (type: StepType, afterStepId: string | null) => {
      const newId = `step_${Date.now()}`;
      let newStep: FlowStep;

      if (type === 'mensagem') {
        newStep = {
          id: newId,
          tipo: 'mensagem',
          mensagem: 'Nova mensagem',
          proxima: null,
        };
      } else if (type === 'escolha') {
        newStep = {
          id: newId,
          tipo: 'escolha',
          pergunta: 'Nova pergunta',
          opcoes: [{ texto: 'Opção 1', valor: 'opcao_1', proxima: '' }],
        };
      } else {
        newStep = {
          id: newId,
          tipo: 'executar',
          acao: 'nova_acao',
          proxima: null,
        };
      }

      const newPassos = [...definition.passos, newStep];

      // If adding after a step, update that step's proxima
      if (afterStepId) {
        const afterStepIndex = newPassos.findIndex(s => s.id === afterStepId);
        const afterStep = newPassos[afterStepIndex];
        if (afterStepIndex !== -1 && afterStep) {
          if (afterStep.tipo === 'mensagem' || afterStep.tipo === 'executar') {
            newPassos[afterStepIndex] = { ...afterStep, proxima: newId };
          }
        }
      }

      // If no steps exist, set as inicio
      let newInicio = definition.inicio;
      if (definition.passos.length === 0) {
        newInicio = newId;
      }

      onChange({ ...definition, inicio: newInicio, passos: newPassos });
      setSelectedStepId(newId);
      setAddStepDialog({ open: false, afterStepId: null });
    },
    [definition, onChange]
  );

  const deleteStep = useCallback(
    (stepId: string) => {
      // Remove the step
      const newPassos = definition.passos.filter(s => s.id !== stepId);

      // Update any references to this step
      const updatedPassos = newPassos.map(step => {
        if (step.tipo === 'mensagem' && step.proxima === stepId) {
          return { ...step, proxima: null };
        }
        if (step.tipo === 'executar' && step.proxima === stepId) {
          return { ...step, proxima: null };
        }
        if (step.tipo === 'escolha') {
          return {
            ...step,
            opcoes: step.opcoes.map(o => (o.proxima === stepId ? { ...o, proxima: '' } : o)),
          };
        }
        return step;
      });

      // Update inicio if needed
      let newInicio = definition.inicio;
      if (newInicio === stepId) {
        newInicio = updatedPassos[0]?.id || '';
      }

      onChange({ ...definition, inicio: newInicio, passos: updatedPassos });
      setSelectedStepId(null);
      setDeleteDialog({ open: false, stepId: '' });
    },
    [definition, onChange]
  );

  const setStartStep = useCallback(
    (stepId: string) => {
      onChange({ ...definition, inicio: stepId });
    },
    [definition, onChange]
  );

  return (
    <div className="flex h-full">
      {/* Steps List */}
      <div className="w-80 overflow-y-auto border-r bg-gray-50 p-4 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Passos do Fluxo</h2>
          <Button size="sm" onClick={() => setAddStepDialog({ open: true, afterStepId: null })}>
            <Plus className="mr-1 h-3 w-3" />
            Adicionar
          </Button>
        </div>

        {definition.passos.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <p className="mb-2 text-sm text-gray-500">Nenhum passo ainda</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddStepDialog({ open: true, afterStepId: null })}
            >
              <Plus className="mr-1 h-3 w-3" />
              Criar primeiro passo
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {definition.passos.map(step => (
              <div
                key={step.id}
                onClick={() => setSelectedStepId(step.id)}
                className={`cursor-pointer rounded-lg border-l-4 p-3 transition-colors ${
                  stepTypeColors[step.tipo]
                } ${
                  selectedStepId === step.id
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'hover:ring-1 hover:ring-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  {stepTypeIcons[step.tipo]}
                  <span className="flex-1 truncate text-sm font-medium">{step.id}</span>
                  {definition.inicio === step.id && (
                    <span className="rounded bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                      Início
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-400">
                  {step.tipo === 'mensagem' && step.mensagem.substring(0, 50)}
                  {step.tipo === 'escolha' && step.pergunta.substring(0, 50)}
                  {step.tipo === 'executar' && `Ação: ${step.acao}`}
                </p>
                {(step.tipo === 'mensagem' || step.tipo === 'executar') && step.proxima && (
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <ChevronRight className="h-3 w-3" />
                    {step.proxima}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedStep ? (
          <StepEditor
            step={selectedStep}
            allSteps={definition.passos}
            isStart={definition.inicio === selectedStep.id}
            onUpdate={updates => updateStep(selectedStep.id, updates)}
            onDelete={() => setDeleteDialog({ open: true, stepId: selectedStep.id })}
            onSetStart={() => setStartStep(selectedStep.id)}
            onAddAfter={() => setAddStepDialog({ open: true, afterStepId: selectedStep.id })}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>Selecione um passo para editar</p>
              <p className="text-sm">ou crie um novo passo</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Step Dialog */}
      <Dialog
        open={addStepDialog.open}
        onOpenChange={open => setAddStepDialog({ open, afterStepId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Passo</DialogTitle>
            <DialogDescription>
              Escolha o tipo de passo que deseja adicionar ao fluxo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <button
              onClick={() => addStep('mensagem', addStepDialog.afterStepId)}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <span className="text-sm font-medium">Mensagem</span>
              <span className="text-xs text-gray-500">Enviar texto</span>
            </button>
            <button
              onClick={() => addStep('escolha', addStepDialog.afterStepId)}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <ListChecks className="h-8 w-8 text-green-500" />
              <span className="text-sm font-medium">Escolha</span>
              <span className="text-xs text-gray-500">Múltiplas opções</span>
            </button>
            <button
              onClick={() => addStep('executar', addStepDialog.afterStepId)}
              className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Zap className="h-8 w-8 text-purple-500" />
              <span className="text-sm font-medium">Ação</span>
              <span className="text-xs text-gray-500">Executar comando</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog({ open, stepId: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Excluir Passo
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este passo? Esta ação não pode ser desfeita e pode
              quebrar conexões existentes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, stepId: '' })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => deleteStep(deleteDialog.stepId)}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StepEditorProps {
  step: FlowStep;
  allSteps: FlowStep[];
  isStart: boolean;
  onUpdate: (updates: Partial<FlowStep>) => void;
  onDelete: () => void;
  onSetStart: () => void;
  onAddAfter: () => void;
}

function StepEditor({
  step,
  allSteps,
  isStart,
  onUpdate,
  onDelete,
  onSetStart,
  onAddAfter,
}: StepEditorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stepTypeIcons[step.tipo]}
            <CardTitle>{stepTypeLabels[step.tipo]}</CardTitle>
            {isStart && (
              <span className="rounded bg-blue-500 px-2 py-0.5 text-xs text-white">
                Passo Inicial
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!isStart && (
              <Button variant="outline" size="sm" onClick={onSetStart}>
                Definir como Início
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onAddAfter}>
              <Plus className="mr-1 h-3 w-3" />
              Adicionar Depois
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step ID */}
        <div>
          <Label htmlFor="stepId">ID do Passo</Label>
          <Input
            id="stepId"
            value={step.id}
            onChange={e => onUpdate({ id: e.target.value })}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">Identificador único usado para referências</p>
        </div>

        {/* Message Step */}
        {step.tipo === 'mensagem' && (
          <>
            <div>
              <Label htmlFor="mensagem">Mensagem</Label>
              <textarea
                id="mensagem"
                value={step.mensagem}
                onChange={e => onUpdate({ mensagem: e.target.value })}
                className="mt-1 min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                placeholder="Digite a mensagem..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Use {'{{variavel}}'} para inserir variáveis
              </p>
            </div>
            <div>
              <Label htmlFor="proxima">Próximo Passo</Label>
              <select
                id="proxima"
                value={step.proxima || ''}
                onChange={e => onUpdate({ proxima: e.target.value || null })}
                className="mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Fim do fluxo</option>
                {allSteps
                  .filter(s => s.id !== step.id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        {/* Choice Step */}
        {step.tipo === 'escolha' && (
          <>
            <div>
              <Label htmlFor="pergunta">Pergunta</Label>
              <textarea
                id="pergunta"
                value={step.pergunta}
                onChange={e => onUpdate({ pergunta: e.target.value })}
                className="mt-1 min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                placeholder="Digite a pergunta..."
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Opções</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newOpcoes = [
                      ...step.opcoes,
                      {
                        texto: `Opção ${step.opcoes.length + 1}`,
                        valor: `opcao_${step.opcoes.length + 1}`,
                        proxima: '',
                      },
                    ];
                    onUpdate({ opcoes: newOpcoes });
                  }}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {step.opcoes.map((opcao, index) => (
                  <div key={index} className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Opção {index + 1}</span>
                      {step.opcoes.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newOpcoes = step.opcoes.filter((_, i) => i !== index);
                            onUpdate({ opcoes: newOpcoes });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Input
                        placeholder="Texto da opção"
                        value={opcao.texto}
                        onChange={e => {
                          const newOpcoes = [...step.opcoes];
                          newOpcoes[index] = {
                            ...opcao,
                            texto: e.target.value,
                          };
                          onUpdate({ opcoes: newOpcoes });
                        }}
                      />
                      <Input
                        placeholder="Valor (ID)"
                        value={opcao.valor}
                        onChange={e => {
                          const newOpcoes = [...step.opcoes];
                          newOpcoes[index] = {
                            ...opcao,
                            valor: e.target.value,
                          };
                          onUpdate({ opcoes: newOpcoes });
                        }}
                      />
                      <select
                        value={opcao.proxima}
                        onChange={e => {
                          const newOpcoes = [...step.opcoes];
                          newOpcoes[index] = {
                            ...opcao,
                            proxima: e.target.value,
                          };
                          onUpdate({ opcoes: newOpcoes });
                        }}
                        className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                      >
                        <option value="">Selecione o próximo passo</option>
                        {allSteps
                          .filter(s => s.id !== step.id)
                          .map(s => (
                            <option key={s.id} value={s.id}>
                              {s.id}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Execute Step */}
        {step.tipo === 'executar' && (
          <>
            <div>
              <Label htmlFor="acao">Ação</Label>
              <select
                id="acao"
                value={step.acao}
                onChange={e => onUpdate({ acao: e.target.value })}
                className="mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              >
                <option value="gerar_resposta_ia">Gerar Resposta IA</option>
                <option value="calcular_score">Calcular Score</option>
                <option value="atualizar_lead">Atualizar Lead</option>
                <option value="enviar_notificacao">Enviar Notificação</option>
                <option value="agendar_followup">Agendar Follow-up</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Selecione a ação a ser executada</p>
            </div>
            <div>
              <Label htmlFor="proxima">Próximo Passo</Label>
              <select
                id="proxima"
                value={step.proxima || ''}
                onChange={e => onUpdate({ proxima: e.target.value || null })}
                className="mt-1 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Fim do fluxo</option>
                {allSteps
                  .filter(s => s.id !== step.id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
