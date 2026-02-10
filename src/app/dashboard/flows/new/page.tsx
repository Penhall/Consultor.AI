'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateFlow } from '@/hooks/useFlows';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { FlowDefinition } from '@/lib/flow-engine/types';

type FlowVertical = 'saude' | 'imoveis' | 'geral';

const verticalOptions: { value: FlowVertical; label: string; description: string }[] = [
  {
    value: 'saude',
    label: 'Planos de Saúde',
    description: 'Qualificação de leads para consultores de planos de saúde',
  },
  {
    value: 'imoveis',
    label: 'Imóveis',
    description: 'Qualificação de leads para corretores de imóveis',
  },
  {
    value: 'geral',
    label: 'Geral',
    description: 'Fluxo genérico para outros tipos de negócio',
  },
];

const defaultDefinitions: Record<FlowVertical, FlowDefinition> = {
  saude: {
    versao: '1.0.0',
    inicio: 'boas_vindas',
    passos: [
      {
        id: 'boas_vindas',
        tipo: 'mensagem',
        mensagem:
          'Olá! Sou o assistente virtual. Vou te ajudar a encontrar o plano de saúde ideal. Vamos começar?',
        proxima: 'tipo_plano',
      },
      {
        id: 'tipo_plano',
        tipo: 'escolha',
        pergunta: 'Qual tipo de plano você está buscando?',
        opcoes: [
          { texto: 'Individual', valor: 'individual', proxima: 'faixa_etaria' },
          { texto: 'Familiar', valor: 'familiar', proxima: 'faixa_etaria' },
          { texto: 'Empresarial', valor: 'empresarial', proxima: 'faixa_etaria' },
        ],
      },
      {
        id: 'faixa_etaria',
        tipo: 'escolha',
        pergunta: 'Qual sua faixa etária?',
        opcoes: [
          { texto: 'Até 30 anos', valor: 'ate_30', proxima: 'coparticipacao' },
          { texto: '31 a 45 anos', valor: '31_45', proxima: 'coparticipacao' },
          { texto: '46 a 60 anos', valor: '46_60', proxima: 'coparticipacao' },
          { texto: 'Acima de 60', valor: 'acima_60', proxima: 'coparticipacao' },
        ],
      },
      {
        id: 'coparticipacao',
        tipo: 'escolha',
        pergunta: 'Prefere plano com coparticipação (mais barato)?',
        opcoes: [
          { texto: 'Sim', valor: 'sim', proxima: 'gerar_recomendacao' },
          { texto: 'Não', valor: 'nao', proxima: 'gerar_recomendacao' },
        ],
      },
      {
        id: 'gerar_recomendacao',
        tipo: 'executar',
        acao: 'gerar_resposta_ia',
        proxima: 'agradecimento',
      },
      {
        id: 'agradecimento',
        tipo: 'mensagem',
        mensagem: 'Obrigado pelas informações! Um consultor entrará em contato em breve.',
        proxima: null,
      },
    ],
  },
  imoveis: {
    versao: '1.0.0',
    inicio: 'boas_vindas',
    passos: [
      {
        id: 'boas_vindas',
        tipo: 'mensagem',
        mensagem: 'Olá! Sou o assistente virtual. Vou te ajudar a encontrar o imóvel ideal!',
        proxima: 'tipo_imovel',
      },
      {
        id: 'tipo_imovel',
        tipo: 'escolha',
        pergunta: 'Você está procurando imóvel para:',
        opcoes: [
          { texto: 'Comprar', valor: 'compra', proxima: 'localizacao' },
          { texto: 'Alugar', valor: 'aluguel', proxima: 'localizacao' },
        ],
      },
      {
        id: 'localizacao',
        tipo: 'escolha',
        pergunta: 'Em qual região?',
        opcoes: [
          { texto: 'Centro', valor: 'centro', proxima: 'faixa_preco' },
          { texto: 'Zona Norte', valor: 'zona_norte', proxima: 'faixa_preco' },
          { texto: 'Zona Sul', valor: 'zona_sul', proxima: 'faixa_preco' },
        ],
      },
      {
        id: 'faixa_preco',
        tipo: 'escolha',
        pergunta: 'Qual sua faixa de preço?',
        opcoes: [
          { texto: 'Até R$ 300 mil', valor: 'ate_300k', proxima: 'agradecimento' },
          { texto: 'R$ 300 a 500 mil', valor: '300_500k', proxima: 'agradecimento' },
          { texto: 'Acima de R$ 500 mil', valor: 'acima_500k', proxima: 'agradecimento' },
        ],
      },
      {
        id: 'agradecimento',
        tipo: 'mensagem',
        mensagem: 'Perfeito! Vou buscar opções para você. Um corretor entrará em contato!',
        proxima: null,
      },
    ],
  },
  geral: {
    versao: '1.0.0',
    inicio: 'boas_vindas',
    passos: [
      {
        id: 'boas_vindas',
        tipo: 'mensagem',
        mensagem: 'Olá! Como posso ajudá-lo hoje?',
        proxima: null,
      },
    ],
  },
};

export default function NewFlowPage() {
  const router = useRouter();
  const createFlow = useCreateFlow();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vertical, setVertical] = useState<FlowVertical>('saude');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nome do fluxo é obrigatório');
      return;
    }

    try {
      const flow = await createFlow.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        vertical,
        definition: defaultDefinitions[vertical],
        is_active: false,
      });
      router.push(`/dashboard/flows/${flow.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar fluxo';
      setError(message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/flows">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Fluxo</h1>
          <p className="text-gray-600 dark:text-gray-400">Crie um novo fluxo de conversação</p>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Fluxo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Fluxo</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Qualificação de Leads Saúde"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreva o objetivo deste fluxo..."
                className="mt-1 min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div>
              <Label>Vertical</Label>
              <div className="mt-2 grid gap-3">
                {verticalOptions.map(option => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      vertical === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vertical"
                      value={option.value}
                      checked={vertical === option.value}
                      onChange={() => setVertical(option.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
              <h4 className="mb-2 font-medium">Template Inicial</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Um fluxo com {defaultDefinitions[vertical].passos.length} passos será criado como
                ponto de partida. Você poderá personalizar completamente após a criação.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Link href="/dashboard/flows">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={createFlow.isPending}>
            {createFlow.isPending ? 'Criando...' : 'Criar Fluxo'}
          </Button>
        </div>
      </form>
    </div>
  );
}
