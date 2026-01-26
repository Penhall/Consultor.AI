'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Save,
  X,
  Clock,
  Star,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  use_count: number;
  is_active: boolean;
  created_at: string;
}

type TemplateCategory =
  | 'greeting'
  | 'follow_up'
  | 'qualification'
  | 'closing'
  | 'reengagement'
  | 'custom';

const categoryOptions: { value: TemplateCategory; label: string }[] = [
  { value: 'greeting', label: 'Saudacao' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'qualification', label: 'Qualificacao' },
  { value: 'closing', label: 'Fechamento' },
  { value: 'reengagement', label: 'Reengajamento' },
  { value: 'custom', label: 'Personalizado' },
];

const categoryConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  greeting: { color: 'bg-green-100 text-green-800', icon: <MessageSquare className="h-3 w-3" /> },
  follow_up: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" /> },
  qualification: { color: 'bg-purple-100 text-purple-800', icon: <Star className="h-3 w-3" /> },
  closing: { color: 'bg-orange-100 text-orange-800', icon: <Check className="h-3 w-3" /> },
  reengagement: { color: 'bg-yellow-100 text-yellow-800', icon: <RefreshCw className="h-3 w-3" /> },
  custom: { color: 'bg-gray-100 text-gray-800', icon: <Plus className="h-3 w-3" /> },
};

interface TemplateForm {
  name: string;
  category: TemplateCategory;
  content: string;
}

const emptyForm: TemplateForm = {
  name: '',
  category: 'custom',
  content: '',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/templates?active=all', { credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao carregar templates');
      const data = await res.json();
      setTemplates(data.data || []);
    } catch (err) {
      console.error(err);
      setError('Nao foi possivel carregar os templates.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.content) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Falha ao criar template');

      setShowCreate(false);
      setForm(emptyForm);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      setError('Erro ao criar template.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!form.name || !form.content) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Falha ao atualizar template');

      setEditingId(null);
      setForm(emptyForm);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    setError(null);
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Falha ao excluir template');

      fetchTemplates();
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir template.');
    }
  };

  const startEdit = (template: Template) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      category: template.category as TemplateCategory,
      content: template.content,
    });
    setShowCreate(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowCreate(false);
    setForm(emptyForm);
  };

  const extractedVariables = form.content.match(/\{\{(\w+)\}\}/g) || [];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Templates de Mensagens</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crie e gerencie seus templates de mensagens reutilizaveis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchTemplates} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={() => {
              setShowCreate(true);
              setEditingId(null);
              setForm(emptyForm);
            }}
            disabled={showCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* Create/Edit Form */}
      {(showCreate || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? 'Editar Template' : 'Novo Template'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome do template"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value as TemplateCategory })}
                  className="h-10 w-full rounded-md border bg-background px-3"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteudo</Label>
              <textarea
                id="content"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Digite o conteudo do template. Use {{variavel}} para variaveis dinamicas."
                className="min-h-[120px] w-full resize-y rounded-md border bg-background px-3 py-2"
              />
              <p className="text-xs text-gray-500">
                Variaveis disponiveis: {'{{nome_lead}}'}, {'{{nome_consultor}}'}, {'{{data}}'}
              </p>
            </div>

            {extractedVariables.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Variaveis detectadas:</span>
                {extractedVariables.map((v, i) => (
                  <Badge key={i} variant="outline">
                    {v}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelEdit}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={() => (editingId ? handleUpdate(editingId) : handleCreate())}
                disabled={saving || !form.name || !form.content}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">Nenhum template criado</h3>
            <p className="mb-4 text-gray-500">
              Crie seu primeiro template para agilizar suas conversas.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => {
            const config = categoryConfig[template.category] ?? categoryConfig.custom;

            return (
              <Card key={template.id} className={cn(!template.is_active && 'opacity-60')}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base">{template.name}</CardTitle>
                      <Badge className={cn('mt-1 text-xs', config?.color)}>
                        {config?.icon}
                        <span className="ml-1">
                          {categoryOptions.find(o => o.value === template.category)?.label}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(template)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 line-clamp-3 text-sm text-gray-600">{template.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Usado {template.use_count}x</span>
                    {template.variables.length > 0 && (
                      <span>{template.variables.length} variavel(is)</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
