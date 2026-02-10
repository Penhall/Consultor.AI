/**
 * Zod validation schemas for admin API inputs.
 */

import { z } from 'zod';

/** GET /api/admin/stats query parameters */
export const adminStatsQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .transform(val => {
      const num = val ? parseInt(val, 10) : 7;
      return isNaN(num) ? 7 : Math.min(Math.max(num, 1), 30);
    }),
});

export type AdminStatsQuery = z.infer<typeof adminStatsQuerySchema>;

/** GET /api/admin/users query parameters */
export const adminUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => {
      const num = val ? parseInt(val, 10) : 1;
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  limit: z
    .string()
    .optional()
    .transform(val => {
      const num = val ? parseInt(val, 10) : 10;
      return isNaN(num) ? 10 : Math.min(Math.max(num, 1), 50);
    }),
  email: z.string().optional(),
  status: z.string().optional(),
  isAdmin: z
    .string()
    .optional()
    .transform(val => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;

/** PATCH /api/admin/users request body */
export const adminUserPatchSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  isAdmin: z.boolean(),
});

export type AdminUserPatchInput = z.infer<typeof adminUserPatchSchema>;
