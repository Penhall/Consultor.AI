/**
 * Admin Users API Route
 *
 * GET  /api/admin/users - List users with filters and pagination
 * PATCH /api/admin/users - Toggle admin flag on a user
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { adminUsersQuerySchema, adminUserPatchSchema } from '@/lib/validations/admin';
import type { ApiResponse } from '@/types/api';
import type { AdminUsersResponse } from '@/types/admin';
import type { Database } from '@/types/database';

type Consultant = Database['public']['Tables']['consultants']['Row'];

async function getAdminConsultant(session: { user: { id: string } }) {
  const supabase = await createClient();
  const consultantQuery = supabase
    .from('consultants')
    .select()
    .eq('user_id', session.user.id)
    .single();
  const { data: rawData } = await consultantQuery;
  return rawData as Consultant | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const admin = await getAdminConsultant(session);
    if (!admin?.is_admin) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = adminUsersQuerySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      email: searchParams.get('email') || undefined,
      status: searchParams.get('status') || undefined,
    });

    const params = parsed.success
      ? parsed.data
      : { page: 1, limit: 20, email: undefined, status: undefined };

    const serviceClient = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (serviceClient.from('consultants') as any).select('*', {
      count: 'exact',
    });

    if (params.email) {
      query = query.ilike('email', `%${params.email}%`);
    }

    if (params.status) {
      query = query.eq('subscription_status', params.status);
    }

    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;

    const {
      data: users,
      count,
      error,
    } = await query.order('created_at', { ascending: false }).range(from, to);

    if (error) {
      console.error('Failed to fetch users:', error);
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Erro ao buscar usuários' },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / params.limit);

    const response: AdminUsersResponse = {
      users: users ?? [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };

    return NextResponse.json<ApiResponse<AdminUsersResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const admin = await getAdminConsultant(session);
    if (!admin?.is_admin) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = adminUserPatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    const { userId, isAdmin } = parsed.data;

    // Prevent self-demotion
    if (userId === admin.id && !isAdmin) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Não é possível remover seu próprio acesso admin' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = serviceClient.from('consultants') as any;
    const { error: updateError } = await table.update({ is_admin: isAdmin }).eq('id', userId);

    if (updateError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Erro ao atualizar usuário' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ updated: true }>>({
      success: true,
      data: { updated: true },
    });
  } catch (error) {
    console.error('PATCH /api/admin/users error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
