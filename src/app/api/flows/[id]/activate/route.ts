/**
 * Flow Activate API Route
 *
 * POST /api/flows/[id]/activate - Activate a flow (deactivates others of same vertical)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { activateFlow, getFlowById, type Flow } from '@/lib/services/flow-service';
import type { ApiResponse } from '@/types/api';

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/flows/[id]/activate
 *
 * Activate a flow (deactivates others of the same vertical)
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
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

    const consultantId = (consultant as { id: string }).id;

    // Verify flow ownership
    const existingFlow = await getFlowById(id);
    if (!existingFlow.success || existingFlow.data.consultant_id !== consultantId) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Fluxo não encontrado',
        },
        { status: 404 }
      );
    }

    // Activate flow
    const result = await activateFlow(consultantId, id);

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
    console.error('Error in POST /api/flows/[id]/activate:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
