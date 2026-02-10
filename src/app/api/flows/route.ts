/**
 * Flows API Routes
 *
 * GET  /api/flows - List flows with filters
 * POST /api/flows - Create a new flow
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFlow, listFlows, type Flow } from '@/lib/services/flow-service';
import { createFlowSchema, listFlowsSchema } from '@/lib/validations/flow';
import type { ApiResponse } from '@/types/api';

/**
 * GET /api/flows
 *
 * List flows for the authenticated consultant
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      );
    }

    // Get consultant profile
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (consultantError || !consultant) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Perfil de consultor não encontrado',
        },
        { status: 404 }
      );
    }

    const getConsultantId = (consultant as { id: string }).id;

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const params = {
      vertical: searchParams.get('vertical') ?? undefined,
      activeOnly: searchParams.get('activeOnly') ?? undefined,
    };

    // Validate params
    const validation = listFlowsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Get flows
    const result = await listFlows(getConsultantId, {
      vertical: validation.data.vertical,
      activeOnly: validation.data.activeOnly,
    });

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Flow[]>>(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/flows:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/flows
 *
 * Create a new flow
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      );
    }

    // Get consultant profile
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (consultantError || !consultant) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Perfil de consultor não encontrado',
        },
        { status: 404 }
      );
    }

    const postConsultantId = (consultant as { id: string }).id;

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = createFlowSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Create flow
    const result = await createFlow(postConsultantId, validation.data);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<Flow>>(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/flows:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
