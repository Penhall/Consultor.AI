/**
 * Message Template by ID API Route
 *
 * GET    /api/templates/[id] - Get a specific template
 * PATCH  /api/templates/[id] - Update a template
 * DELETE /api/templates/[id] - Delete a template
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  type UpdateTemplateInput,
} from '@/lib/services/template-service';
import { z } from 'zod';

// Validation schema for updating templates
const updateTemplateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  category: z
    .enum(['greeting', 'follow_up', 'qualification', 'closing', 'reengagement', 'custom'])
    .optional(),
  content: z.string().min(10).max(1000).optional(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/templates/[id]
 * Get a specific template by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    // Get template
    const result = await getTemplateById(id);

    if (!result.success) {
      const status = result.error.includes('nao encontrado') ? 404 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error in GET /api/templates/[id]:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * PATCH /api/templates/[id]
 * Update a template
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const validation = updateTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Update template
    const result = await updateTemplate(id, validation.data as UpdateTemplateInput);

    if (!result.success) {
      const status = result.error.includes('nao encontrado') ? 404 : 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error in PATCH /api/templates/[id]:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete a template
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    // Delete template
    const result = await deleteTemplate(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error in DELETE /api/templates/[id]:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
