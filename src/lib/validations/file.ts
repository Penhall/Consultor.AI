/**
 * Zod validation schemas for file upload API inputs.
 */

import { z } from 'zod';

/** Allowed MIME types for file uploads */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

/** Maximum file size in bytes (10MB) */
export const MAX_FILE_SIZE_BYTES = 10_485_760;

/** Human-readable max file size */
export const MAX_FILE_SIZE_LABEL = '10MB';

/** POST /api/files request body */
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'Nome do arquivo é obrigatório').max(255, 'Nome do arquivo muito longo'),
  type: z.enum(ALLOWED_FILE_TYPES, {
    errorMap: () => ({
      message: `Invalid file type. Allowed: PDF, PNG, JPG, WEBP`,
    }),
  }),
  sizeBytes: z
    .number()
    .int()
    .positive('Tamanho do arquivo inválido')
    .max(MAX_FILE_SIZE_BYTES, `File size exceeds ${MAX_FILE_SIZE_LABEL} limit`),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
