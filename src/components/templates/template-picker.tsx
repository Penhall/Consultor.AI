'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Star, RefreshCw, Plus, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  use_count: number;
  is_active: boolean;
}

interface TemplatePickerProps {
  onSelect: (template: Template, appliedContent: string) => void;
  variables?: Record<string, string>;
  category?: string;
  className?: string;
}

const categoryConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  greeting: {
    label: 'Saudacao',
    color: 'bg-green-100 text-green-800',
    icon: <MessageSquare className="h-3 w-3" />,
  },
  follow_up: {
    label: 'Follow-up',
    color: 'bg-blue-100 text-blue-800',
    icon: <Clock className="h-3 w-3" />,
  },
  qualification: {
    label: 'Qualificacao',
    color: 'bg-purple-100 text-purple-800',
    icon: <Star className="h-3 w-3" />,
  },
  closing: {
    label: 'Fechamento',
    color: 'bg-orange-100 text-orange-800',
    icon: <Check className="h-3 w-3" />,
  },
  reengagement: {
    label: 'Reengajamento',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <RefreshCw className="h-3 w-3" />,
  },
  custom: {
    label: 'Personalizado',
    color: 'bg-gray-100 text-gray-800',
    icon: <Plus className="h-3 w-3" />,
  },
};

function applyVariables(content: string, variables: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return variables[variable] || match;
  });
}

export function TemplatePicker({
  onSelect,
  variables = {},
  category,
  className,
}: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [category]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('active', 'true');

      const res = await fetch(`/api/templates?${params.toString()}`, {
        credentials: 'include',
      });

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

  const handleSelect = (template: Template) => {
    const appliedContent = applyVariables(template.content, variables);
    onSelect(template, appliedContent);
  };

  const handleCopy = async (template: Template) => {
    const appliedContent = applyVariables(template.content, variables);
    await navigator.clipboard.writeText(appliedContent);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchTemplates} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-gray-500">Nenhum template disponivel</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4" />
          Templates ({templates.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {templates.map(template => {
            const config = categoryConfig[template.category] ?? categoryConfig.custom;
            const previewContent = applyVariables(template.content, variables);

            return (
              <div
                key={template.id}
                className="group cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50"
                onClick={() => handleSelect(template)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{template.name}</span>
                      <Badge className={cn('text-xs', config?.color)}>
                        {config?.icon}
                        <span className="ml-1">{config?.label}</span>
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-xs text-gray-500">{previewContent}</p>
                    {template.use_count > 0 && (
                      <p className="mt-1 text-xs text-gray-400">Usado {template.use_count}x</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={e => {
                      e.stopPropagation();
                      handleCopy(template);
                    }}
                  >
                    {copiedId === template.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
