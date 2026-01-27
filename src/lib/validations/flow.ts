/**
 * Flow Validation Schemas
 *
 * Zod schemas for validating flow-related operations
 */

import { z } from 'zod';

/**
 * Flow vertical enum
 */
export const flowVerticalSchema = z.enum(['saude', 'imoveis', 'geral']);

export type FlowVertical = z.infer<typeof flowVerticalSchema>;

/**
 * Flow step option schema
 */
export const flowOptionSchema = z.object({
  texto: z.string().min(1, 'Texto da opção é obrigatório'),
  valor: z.string().min(1, 'Valor da opção é obrigatório'),
  proxima: z.string().min(1, 'Próximo passo é obrigatório'),
});

/**
 * Flow step schema
 */
export const flowStepSchema = z.discriminatedUnion('tipo', [
  // Message step
  z.object({
    id: z.string().min(1, 'ID do passo é obrigatório'),
    tipo: z.literal('mensagem'),
    mensagem: z.string().min(1, 'Mensagem é obrigatória'),
    proxima: z.string().nullable(),
  }),
  // Choice step
  z.object({
    id: z.string().min(1, 'ID do passo é obrigatório'),
    tipo: z.literal('escolha'),
    pergunta: z.string().min(1, 'Pergunta é obrigatória'),
    opcoes: z.array(flowOptionSchema).min(1, 'Pelo menos uma opção é obrigatória'),
  }),
  // Execute step
  z.object({
    id: z.string().min(1, 'ID do passo é obrigatório'),
    tipo: z.literal('executar'),
    acao: z.string().min(1, 'Ação é obrigatória'),
    parametros: z.record(z.unknown()).optional(),
    proxima: z.string().nullable(),
  }),
]);

/**
 * Flow definition schema (matches FlowDefinition type from flow-engine/types.ts)
 */
export const flowDefinitionSchema = z.object({
  versao: z.string().min(1, 'Versão é obrigatória'),
  inicio: z.string().min(1, 'Passo inicial é obrigatório'),
  passos: z.array(flowStepSchema).min(1, 'Pelo menos um passo é obrigatório'),
});

export type FlowDefinitionInput = z.infer<typeof flowDefinitionSchema>;

/**
 * Schema for creating a new flow
 */
export const createFlowSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  description: z.string().optional(),
  vertical: flowVerticalSchema,
  definition: flowDefinitionSchema,
  is_active: z.boolean().optional().default(true),
});

export type CreateFlowInput = z.infer<typeof createFlowSchema>;

/**
 * Schema for updating a flow
 */
export const updateFlowSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  description: z.string().optional(),
  definition: flowDefinitionSchema.optional(),
  is_active: z.boolean().optional(),
});

export type UpdateFlowInput = z.infer<typeof updateFlowSchema>;

/**
 * Schema for listing flows with filters
 */
export const listFlowsSchema = z.object({
  vertical: flowVerticalSchema.optional(),
  activeOnly: z
    .string()
    .optional()
    .transform(val => val === 'true'),
});

export type ListFlowsParams = z.infer<typeof listFlowsSchema>;

/**
 * Schema for duplicating a flow
 */
export const duplicateFlowSchema = z.object({
  newName: z.string().min(2, 'Novo nome deve ter no mínimo 2 caracteres'),
});

export type DuplicateFlowInput = z.infer<typeof duplicateFlowSchema>;
