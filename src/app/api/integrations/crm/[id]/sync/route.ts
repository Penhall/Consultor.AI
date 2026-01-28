/**
 * CRM Sync API Route
 *
 * POST /api/integrations/crm/[id]/sync - Sync leads to CRM
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCRMIntegrationById,
  syncLeadsBatch,
  type BatchSyncResult,
} from '@/lib/services/crm-service';
import { syncLeadsSchema } from '@/lib/validations/crm';
import type { ApiResponse } from '@/types/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/integrations/crm/[id]/sync
 *
 * Sync leads to CRM
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Check if integration is active
    if (integrationResult.data.status !== 'active') {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Integracao nao esta ativa' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = syncLeadsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Dados invalidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Verify leads belong to this consultant
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .eq('consultant_id', consultantId)
      .in('id', validation.data.lead_ids);

    if (leadsError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Erro ao verificar leads' },
        { status: 500 }
      );
    }

    const validLeadIds = (leads as { id: string }[] | null)?.map(l => l.id) || [];
    const invalidLeadIds = validation.data.lead_ids.filter(
      leadId => !validLeadIds.includes(leadId)
    );

    if (invalidLeadIds.length > 0) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `Leads nao encontrados ou sem permissao: ${invalidLeadIds.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Perform sync
    const result = await syncLeadsBatch(id, {
      lead_ids: validLeadIds,
      force: validation.data.force,
    });

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<BatchSyncResult>>(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/integrations/crm/[id]/sync:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
