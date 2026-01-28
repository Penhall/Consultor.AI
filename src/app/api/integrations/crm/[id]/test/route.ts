/**
 * CRM Connection Test API Route
 *
 * POST /api/integrations/crm/[id]/test - Test CRM connection
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCRMIntegrationById, testCRMConnection } from '@/lib/services/crm-service';
import type { ApiResponse } from '@/types/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface TestConnectionResult {
  connected: boolean;
  accountName?: string;
}

/**
 * POST /api/integrations/crm/[id]/test
 *
 * Test CRM connection
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Nao autenticado' },
        { status: 401 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'ID de integracao invalido' },
        { status: 400 }
      );
    }

    // Verify ownership and get integration
    const integrationResult = await getCRMIntegrationById(id);
    if (!integrationResult.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: integrationResult.error },
        { status: integrationResult.error === 'Integracao CRM nao encontrada' ? 404 : 500 }
      );
    }

    const { data: consultant } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const consultantId = (consultant as { id: string } | null)?.id;
    if (!consultantId || consultantId !== integrationResult.data.consultant_id) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Integracao CRM nao encontrada' },
        { status: 404 }
      );
    }

    // Test connection
    const result = await testCRMConnection(id);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<TestConnectionResult>>(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/integrations/crm/[id]/test:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
