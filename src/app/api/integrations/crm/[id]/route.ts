/**
 * CRM Integration by ID API Routes
 *
 * GET    /api/integrations/crm/[id] - Get a specific CRM integration
 * PATCH  /api/integrations/crm/[id] - Update a CRM integration
 * DELETE /api/integrations/crm/[id] - Delete a CRM integration
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCRMIntegrationById,
  updateCRMIntegration,
  deleteCRMIntegration,
  getMaskedApiKey,
  type CRMIntegration,
} from '@/lib/services/crm-service';
import { updateCRMIntegrationSchema } from '@/lib/validations/crm';
import type { ApiResponse } from '@/types/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * CRM Integration with masked API key for response
 */
interface CRMIntegrationResponse extends Omit<
  CRMIntegration,
  'api_key' | 'api_secret' | 'refresh_token' | 'oauth_access_token'
> {
  api_key_masked: string;
}

/**
 * GET /api/integrations/crm/[id]
 *
 * Get a specific CRM integration
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
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

    // Get integration
    const result = await getCRMIntegrationById(id);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: result.error === 'Integracao CRM nao encontrada' ? 404 : 500 }
      );
    }

    // Verify ownership
    const { data: consultant } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const consultantId = (consultant as { id: string } | null)?.id;
    if (!consultantId || consultantId !== result.data.consultant_id) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Integracao CRM nao encontrada' },
        { status: 404 }
      );
    }

    // Mask sensitive data in response
    const {
      api_key,
      api_secret: _apiSecret,
      refresh_token: _refreshToken,
      oauth_access_token: _oauthToken,
      ...rest
    } = result.data;
    const response: CRMIntegrationResponse = {
      ...rest,
      api_key_masked: getMaskedApiKey(api_key),
    };

    return NextResponse.json<ApiResponse<CRMIntegrationResponse>>(
      { success: true, data: response },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/integrations/crm/[id]:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/integrations/crm/[id]
 *
 * Update a CRM integration
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Verify ownership first
    const existingResult = await getCRMIntegrationById(id);
    if (!existingResult.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: existingResult.error },
        { status: existingResult.error === 'Integracao CRM nao encontrada' ? 404 : 500 }
      );
    }

    const { data: consultant } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const consultantId = (consultant as { id: string } | null)?.id;
    if (!consultantId || consultantId !== existingResult.data.consultant_id) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Integracao CRM nao encontrada' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = updateCRMIntegrationSchema.safeParse(body);
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

    // Update integration
    const result = await updateCRMIntegration(id, validation.data);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Mask sensitive data in response
    const {
      api_key,
      api_secret: _apiSecret,
      refresh_token: _refreshToken,
      oauth_access_token: _oauthToken,
      ...rest
    } = result.data;
    const response: CRMIntegrationResponse = {
      ...rest,
      api_key_masked: getMaskedApiKey(api_key),
    };

    return NextResponse.json<ApiResponse<CRMIntegrationResponse>>(
      { success: true, data: response },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/integrations/crm/[id]:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/crm/[id]
 *
 * Delete a CRM integration
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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

    // Verify ownership first
    const existingResult = await getCRMIntegrationById(id);
    if (!existingResult.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: existingResult.error },
        { status: existingResult.error === 'Integracao CRM nao encontrada' ? 404 : 500 }
      );
    }

    const { data: consultant } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const consultantIdDel = (consultant as { id: string } | null)?.id;
    if (!consultantIdDel || consultantIdDel !== existingResult.data.consultant_id) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Integracao CRM nao encontrada' },
        { status: 404 }
      );
    }

    // Delete integration
    const result = await deleteCRMIntegration(id);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ deleted: boolean }>>(
      { success: true, data: { deleted: true } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/integrations/crm/[id]:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
