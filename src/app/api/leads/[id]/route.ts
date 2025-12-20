/**
 * Lead Detail API Routes
 *
 * GET    /api/leads/[id] - Get a specific lead
 * PATCH  /api/leads/[id] - Update a specific lead
 * DELETE /api/leads/[id] - Delete a specific lead
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getLeadById,
  updateLead,
  deleteLead,
} from '@/lib/services/lead-service'
import { updateLeadSchema } from '@/lib/validations/lead'
import type { ApiResponse } from '@/types/api'
import type { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']

type RouteContext = {
  params: {
    id: string
  }
}

/**
 * GET /api/leads/[id]
 *
 * Get a specific lead by ID
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      )
    }

    const { id } = context.params

    // Get lead (RLS will ensure user can only access their own leads)
    const result = await getLeadById(id)

    if (!result.success) {
      const status = result.error === 'Lead não encontrado' ? 404 : 500
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status }
      )
    }

    return NextResponse.json<ApiResponse<Lead>>(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/leads/[id]:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/leads/[id]
 *
 * Update a specific lead
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      )
    }

    const { id } = context.params

    // Parse request body
    const body = await request.json()

    // Validate input
    const validation = updateLeadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    // Update lead (RLS will ensure user can only update their own leads)
    const result = await updateLead(id, validation.data)

    if (!result.success) {
      const status = result.error === 'Lead não encontrado' ? 404 : 500
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status }
      )
    }

    return NextResponse.json<ApiResponse<Lead>>(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in PATCH /api/leads/[id]:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/leads/[id]
 *
 * Delete a specific lead
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      )
    }

    const { id } = context.params

    // Delete lead (RLS will ensure user can only delete their own leads)
    const result = await deleteLead(id)

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse<{ message: string }>>(
      {
        success: true,
        data: {
          message: 'Lead deletado com sucesso',
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/leads/[id]:', error)
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 }
    )
  }
}
