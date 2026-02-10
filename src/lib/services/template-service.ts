/**
 * Message Template Service
 *
 * Handles CRUD operations and business logic for reusable message templates
 */

import { createClient } from '@/lib/supabase/server';

// Types
export type TemplateCategory =
  | 'greeting'
  | 'follow_up'
  | 'qualification'
  | 'closing'
  | 'reengagement'
  | 'custom';

export interface MessageTemplate {
  id: string;
  consultant_id: string;
  name: string;
  category: TemplateCategory;
  content: string;
  variables: string[];
  use_count: number;
  last_used_at: string | null;
  is_active: boolean;
  is_default: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  name: string;
  category?: TemplateCategory;
  content: string;
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  category?: TemplateCategory;
  content?: string;
  variables?: string[];
  is_active?: boolean;
}

export type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

// Default templates for new consultants
export const DEFAULT_TEMPLATES: Omit<CreateTemplateInput, 'consultant_id'>[] = [
  {
    name: 'Saudacao Inicial',
    category: 'greeting',
    content:
      'Ola {{nome_lead}}! Sou {{nome_consultor}}, consultor de planos de saude. Como posso ajudar voce hoje?',
    variables: ['nome_lead', 'nome_consultor'],
  },
  {
    name: 'Follow-up 24h',
    category: 'follow_up',
    content:
      'Ola {{nome_lead}}! Passando para saber se voce teve tempo de avaliar as opcoes que conversamos. Posso ajudar com alguma duvida?',
    variables: ['nome_lead'],
  },
  {
    name: 'Reengajamento',
    category: 'reengagement',
    content:
      'Ola {{nome_lead}}! Faz um tempo que conversamos. Gostaria de retomar nossa conversa sobre planos de saude?',
    variables: ['nome_lead'],
  },
  {
    name: 'Agradecimento',
    category: 'closing',
    content:
      'Muito obrigado pelo seu interesse, {{nome_lead}}! Fico a disposicao para qualquer duvida. Um abraco!',
    variables: ['nome_lead'],
  },
];

/**
 * Extract variables from template content
 * Finds patterns like {{variable_name}}
 */
export function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const variable = match[1];
    if (variable && !variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
}

/**
 * Replace variables in template content
 */
export function applyTemplate(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return values[variable] || match;
  });
}

/**
 * Create a new message template
 */
export async function createTemplate(
  consultantId: string,
  input: CreateTemplateInput
): Promise<ServiceResult<MessageTemplate>> {
  try {
    const supabase = await createClient();

    // Auto-extract variables if not provided
    const variables = input.variables || extractVariables(input.content);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('message_templates')
      .insert({
        consultant_id: consultantId,
        name: input.name,
        category: input.category || 'custom',
        content: input.content,
        variables,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return { success: false, error: 'Erro ao criar template' };
    }

    return { success: true, data: data as MessageTemplate };
  } catch (error) {
    console.error('Error in createTemplate:', error);
    return { success: false, error: 'Erro interno ao criar template' };
  }
}

/**
 * Get a template by ID
 */
export async function getTemplateById(templateId: string): Promise<ServiceResult<MessageTemplate>> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('message_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Template nao encontrado' };
      }
      console.error('Error fetching template:', error);
      return { success: false, error: 'Erro ao buscar template' };
    }

    return { success: true, data: data as MessageTemplate };
  } catch (error) {
    console.error('Error in getTemplateById:', error);
    return { success: false, error: 'Erro interno ao buscar template' };
  }
}

/**
 * List templates for a consultant
 */
export async function listTemplates(
  consultantId: string,
  options?: {
    category?: TemplateCategory;
    activeOnly?: boolean;
    limit?: number;
  }
): Promise<ServiceResult<MessageTemplate[]>> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('message_templates')
      .select('*')
      .eq('consultant_id', consultantId)
      .order('use_count', { ascending: false });

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.activeOnly !== false) {
      query = query.eq('is_active', true);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing templates:', error);
      return { success: false, error: 'Erro ao listar templates' };
    }

    return { success: true, data: (data || []) as MessageTemplate[] };
  } catch (error) {
    console.error('Error in listTemplates:', error);
    return { success: false, error: 'Erro interno ao listar templates' };
  }
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  input: UpdateTemplateInput
): Promise<ServiceResult<MessageTemplate>> {
  try {
    const supabase = await createClient();

    // Auto-extract variables if content is updated
    const updateData: Record<string, unknown> = { ...input };
    if (input.content && !input.variables) {
      updateData.variables = extractVariables(input.content);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('message_templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Template nao encontrado' };
      }
      console.error('Error updating template:', error);
      return { success: false, error: 'Erro ao atualizar template' };
    }

    return { success: true, data: data as MessageTemplate };
  } catch (error) {
    console.error('Error in updateTemplate:', error);
    return { success: false, error: 'Erro interno ao atualizar template' };
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(
  templateId: string
): Promise<ServiceResult<{ message: string }>> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('message_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting template:', error);
      return { success: false, error: 'Erro ao deletar template' };
    }

    return { success: true, data: { message: 'Template deletado com sucesso' } };
  } catch (error) {
    console.error('Error in deleteTemplate:', error);
    return { success: false, error: 'Erro interno ao deletar template' };
  }
}

/**
 * Increment template use count
 */
export async function incrementTemplateUse(
  templateId: string
): Promise<ServiceResult<MessageTemplate>> {
  try {
    const supabase = await createClient();

    // First get current template to increment count
    const result = await getTemplateById(templateId);
    if (!result.success) return result;

    // Update with incremented count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updated, error: updateError } = await (supabase as any)
      .from('message_templates')
      .update({
        use_count: result.data.use_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: 'Erro ao atualizar uso do template' };
    }

    return { success: true, data: updated as MessageTemplate };
  } catch (error) {
    console.error('Error in incrementTemplateUse:', error);
    return { success: false, error: 'Erro interno ao atualizar uso' };
  }
}

/**
 * Initialize default templates for a new consultant
 */
export async function initializeDefaultTemplates(
  consultantId: string
): Promise<ServiceResult<MessageTemplate[]>> {
  try {
    const results: MessageTemplate[] = [];

    for (const template of DEFAULT_TEMPLATES) {
      const result = await createTemplate(consultantId, template);
      if (result.success) {
        results.push(result.data);
      }
    }

    return { success: true, data: results };
  } catch (error) {
    console.error('Error in initializeDefaultTemplates:', error);
    return { success: false, error: 'Erro ao inicializar templates padrao' };
  }
}
