/**
 * Message Templates API Route
 *
 * GET  /api/templates - List templates for the authenticated consultant
 * POST /api/templates - Create a new template
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createTemplate,
  listTemplates,
  type CreateTemplateInput,
  type TemplateCategory,
} from '@/lib/services/template-service';
import { z } from 'zod';

// Validation schema for creating templates
const createTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  category: z
    .enum(['greeting', 'follow_up', 'qualification', 'closing', 'reengagement', 'custom'])
    .optional(),
  content: z.string().min(10).max(1000),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/templates
 * List templates for the authenticated consultant
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    // Get consultant
    const { data: consultantData, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (consultantError || !consultantData) {
      return NextResponse.json({ error: 'Consultor nao encontrado' }, { status: 404 });
    }

    const consultant = consultantData as { id: string };

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as TemplateCategory | null;
    const activeOnly = searchParams.get('active') !== 'false';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // List templates
    const result = await listTemplates(consultant.id, {
      category: category || undefined,
      activeOnly,
      limit,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Error in GET /api/templates:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

/**
 * POST /api/templates
 * Create a new template
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    // Get consultant
    const { data: consultantData2, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (consultantError || !consultantData2) {
      return NextResponse.json({ error: 'Consultor nao encontrado' }, { status: 404 });
    }

    const consultant = consultantData2 as { id: string };

    // Parse and validate body
    const body = await request.json();
    const validation = createTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Create template
    const result = await createTemplate(consultant.id, validation.data as CreateTemplateInput);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/templates:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
