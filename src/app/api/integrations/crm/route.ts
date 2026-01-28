/**
 * CRM Integrations API Routes
 *
 * GET  /api/integrations/crm - List CRM integrations
 * POST /api/integrations/crm - Create a new CRM integration
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  createCRMIntegration,
  listCRMIntegrations,
  getDefaultFieldMappings,
  getMaskedApiKey,
  type CRMIntegration,
} from '@/lib/services/crm-service';
import { createCRMIntegrationSchema, listCRMIntegrationsSchema } from '@/lib/validations/crm';
import type { ApiResponse } from '@/types/api';

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
 * GET /api/integrations/crm
 *
 * List CRM integrations for the authenticated consultant
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get consultant profile
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const consultantId = (consultant as { id: string } | null)?.id;
    if (consultantError || !consultantId) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Perfil de consultor nao encontrado' },
        { status: 404 }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const params = {
      provider: searchParams.get('provider') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    };

    // Validate params
    const validation = listCRMIntegrationsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Parametros invalidos',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Get integrations
    const result = await listCRMIntegrations(consultantId, validation.data);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Mask sensitive data in response
    const integrations: CRMIntegrationResponse[] = result.data.map(integration => {
      const {
        api_key,
        api_secret: _apiSecret,
        refresh_token: _refreshToken,
        oauth_access_token: _oauthToken,
        ...rest
      } = integration;
      return {
        ...rest,
        api_key_masked: getMaskedApiKey(api_key),
      };
    });

    return NextResponse.json<ApiResponse<CRMIntegrationResponse[]>>(
      { success: true, data: integrations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/integrations/crm:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/crm
 *
 * Create a new CRM integration
 */
export async function POST(request: NextRequest) {
  try {
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

    // Get consultant profile
    const { data: consultant, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const consultantIdPost = (consultant as { id: string } | null)?.id;
    if (consultantError || !consultantIdPost) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Perfil de consultor nao encontrado' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = createCRMIntegrationSchema.safeParse(body);
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

    // Get default field mappings if not provided
    let fieldMappings = validation.data.field_mappings;
    if (!fieldMappings || Object.keys(fieldMappings).length === 0) {
      const defaultMappings = await getDefaultFieldMappings(validation.data.provider);
      if (defaultMappings.success) {
        fieldMappings = defaultMappings.data;
      }
    }

    // Create integration
    const result = await createCRMIntegration(consultantIdPost, {
      ...validation.data,
      field_mappings: fieldMappings,
    });

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
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/integrations/crm:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
