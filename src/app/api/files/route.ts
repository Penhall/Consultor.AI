/**
 * Files API Route
 *
 * GET  /api/files - List user files
 * POST /api/files - Create presigned upload URL
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fileUploadSchema } from '@/lib/validations/file';
import { listUserFiles, createUploadUrl } from '@/lib/services/file-service';
import type { ApiResponse } from '@/types/api';
import type { Database } from '@/types/database';

type Consultant = Database['public']['Tables']['consultants']['Row'];

export async function GET() {
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

    const { data: rawData } = await supabase
      .from('consultants')
      .select()
      .eq('user_id', session.user.id)
      .single();
    const consultant = rawData as Consultant | null;

    if (!consultant) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Consultor não encontrado' },
        { status: 404 }
      );
    }

    const files = await listUserFiles(consultant.id);

    return NextResponse.json<ApiResponse<typeof files>>({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error('GET /api/files error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const { data: rawData } = await supabase
      .from('consultants')
      .select()
      .eq('user_id', session.user.id)
      .single();
    const consultant = rawData as Consultant | null;

    if (!consultant) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Consultor não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = fileUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Dados inválidos',
        },
        { status: 400 }
      );
    }

    const result = await createUploadUrl(
      consultant.id,
      parsed.data.name,
      parsed.data.type,
      parsed.data.sizeBytes
    );

    if ('error' in result) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('POST /api/files error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
