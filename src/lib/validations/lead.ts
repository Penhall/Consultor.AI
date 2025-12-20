/**
 * Lead Validation Schemas
 *
 * Zod schemas for validating lead-related operations
 */

import { z } from 'zod'

/**
 * Lead status enum
 */
export const leadStatusSchema = z.enum([
  'novo',
  'em_contato',
  'qualificado',
  'agendado',
  'fechado',
  'perdido',
])

export type LeadStatus = z.infer<typeof leadStatusSchema>

/**
 * Schema for creating a new lead
 */
export const createLeadSchema = z.object({
  whatsapp_number: z
    .string()
    .regex(/^\+55[0-9]{11}$/, 'Número de WhatsApp deve estar no formato +5511999999999'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  status: leadStatusSchema.optional().default('novo'),
  score: z.number().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
  source: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>

/**
 * Schema for updating a lead
 */
export const updateLeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  status: leadStatusSchema.optional(),
  score: z.number().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>

/**
 * Schema for listing leads with filters
 */
export const listLeadsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  status: leadStatusSchema.optional(),
  search: z.string().optional(),
  orderBy: z.enum(['created_at', 'updated_at', 'score', 'name']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export type ListLeadsParams = z.infer<typeof listLeadsSchema>
