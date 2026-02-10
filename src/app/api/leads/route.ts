/**
 * Leads API Routes
 *
 * GET  /api/leads - List leads with filters and pagination
 * POST /api/leads - Create a new lead
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createLead, listLeads } from '@/lib/services/lead-service';
import { createLeadSchema, listLeadsSchema } from '@/lib/validations/lead';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Database } from '@/types/database';

type Lead = Database['public']['Tables']['leads']['Row'];

/**
 * GET /api/leads
 *
 * List leads with optional filters and pagination
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
    const consultantQuery = supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    const consultantResult = await consultantQuery;

    if (consultantResult.error || !consultantResult.data) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Perfil de consultor não encontrado',
        },
        { status: 404 }
      );
    }

    const consultantId = (consultantResult as any).data.id as string;

    // Parse query params
    // Note: searchParams.get() returns null if param doesn't exist,
    // but Zod .optional() expects undefined. Use ?? to convert null to undefined.
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      statuses: searchParams.get('statuses') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      orderBy: searchParams.get('orderBy') ?? undefined,
      order: searchParams.get('order') ?? undefined,
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
      scoreMin: searchParams.get('scoreMin') ?? undefined,
      scoreMax: searchParams.get('scoreMax') ?? undefined,
      source: searchParams.get('source') ?? undefined,
    };

    // Validate params
    const validation = listLeadsSchema.safeParse(params);
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

    // Get leads
    const result = await listLeads(consultantId, validation.data);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<PaginatedResponse<Lead>>>(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/leads:', error);
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
 * POST /api/leads
 *
 * Create a new lead
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
    const consultantResult = await supabase
      .from('consultants')
      .select('id, monthly_lead_limit, leads_count_current_month')
      .eq('user_id', session.user.id)
      .single();

    if (consultantResult.error || !consultantResult.data) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Perfil de consultor não encontrado',
        },
        { status: 404 }
      );
    }

    type ConsultantData = {
      id: string;
      monthly_lead_limit: number | null;
      leads_count_current_month: number | null;
    };
    const consultant = (consultantResult as any).data as ConsultantData;

    // Check monthly limit
    const currentCount = consultant.leads_count_current_month || 0;
    const limit = consultant.monthly_lead_limit || 20;
    if (currentCount >= limit) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: `Limite mensal de ${limit} leads atingido. Faça upgrade do seu plano.`,
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = createLeadSchema.safeParse(body);
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

    // Create lead
    const result = await createLead(consultant.id, validation.data);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<Lead>>(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/leads:', error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
