/**
 * Individual Flow API Routes
 *
 * GET    /api/flows/[id] - Get flow by ID
 * PATCH  /api/flows/[id] - Update a flow
 * DELETE /api/flows/[id] - Delete a flow
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFlowById, updateFlow, deleteFlow, type Flow } from '@/lib/services/flow-service';
import { updateFlowSchema } from '@/lib/validations/flow';
import type { ApiResponse } from '@/types/api';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/flows/[id]
 *
 * Get a flow by ID
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    // Get flow
    const result = await getFlowById(id);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 404 }
      );
    }

    // Verify the flow belongs to the consultant
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const consultantId = consultant ? (consultant as { id: string }).id : null;

    if (consultantError || !consultantId || result.data.consultant_id !== consultantId) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Fluxo não encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<Flow>>(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/flows/[id]:', error);
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
 * PATCH /api/flows/[id]
 *
 * Update a flow
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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
    const { data: consultantData, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (consultantError || !consultantData) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Perfil de consultor não encontrado',
        },
        { status: 404 }
      );
    }

    const patchConsultantId = (consultantData as { id: string }).id;

    // Verify flow ownership
    const existingFlow = await getFlowById(id);
    if (!existingFlow.success || existingFlow.data.consultant_id !== patchConsultantId) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Fluxo não encontrado',
        },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateFlowSchema.safeParse(body);

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

    // Update flow
    const result = await updateFlow(id, validation.data);

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
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/flows/[id]:', error);
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
 * DELETE /api/flows/[id]
 *
 * Delete a flow
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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
    const { data: deleteConsultant, error: deleteConsultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (deleteConsultantError || !deleteConsultant) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Perfil de consultor não encontrado',
        },
        { status: 404 }
      );
    }

    const deleteConsultantId = (deleteConsultant as { id: string }).id;

    // Verify flow ownership
    const existingFlow = await getFlowById(id);
    if (!existingFlow.success || existingFlow.data.consultant_id !== deleteConsultantId) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Fluxo não encontrado',
        },
        { status: 404 }
      );
    }

    // Delete flow
    const result = await deleteFlow(id);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<{ deleted: true }>>(
      {
        success: true,
        data: { deleted: true },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/flows/[id]:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
