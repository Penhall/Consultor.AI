/**
 * File by ID API Route
 *
 * GET    /api/files/[id] - Get download URL for a file
 * DELETE /api/files/[id] - Delete a file
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDownloadUrl, deleteFile } from '@/lib/services/file-service';
import type { ApiResponse } from '@/types/api';
import type { Database } from '@/types/database';

type Consultant = Database['public']['Tables']['consultants']['Row'];

async function getConsultant(session: { user: { id: string } }) {
  const supabase = await createClient();
  const { data: rawData } = await supabase
    .from('consultants')
    .select()
    .eq('user_id', session.user.id)
    .single();
  return rawData as Consultant | null;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
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

    const consultant = await getConsultant(session);
    if (!consultant) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Consultor não encontrado' },
        { status: 404 }
      );
    }

    const result = await createDownloadUrl(consultant.id, params.id);

    if ('error' in result) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET /api/files/[id] error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
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

    const consultant = await getConsultant(session);
    if (!consultant) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Consultor não encontrado' },
        { status: 404 }
      );
    }

    const result = await deleteFile(consultant.id, params.id);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error || 'Erro ao excluir arquivo' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<{ deleted: true }>>({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('DELETE /api/files/[id] error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
