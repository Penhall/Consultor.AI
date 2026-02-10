/**
 * Follow-up Detail API Routes
 *
 * GET    /api/follow-ups/[id] - Get a specific follow-up
 * PATCH  /api/follow-ups/[id] - Update a follow-up
 * DELETE /api/follow-ups/[id] - Delete a follow-up
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getFollowUpById,
  updateFollowUp,
  completeFollowUp,
  cancelFollowUp,
  deleteFollowUp,
  type FollowUp,
  type UpdateFollowUpInput,
} from '@/lib/services/follow-up-service'
import type { ApiResponse } from '@/types/api'

type RouteContext = {
  params: {
    id: string
  }
}

/**
 * GET /api/follow-ups/[id]
 *
 * Get a specific follow-up by ID
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<FollowUp>>> {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    const { id } = context.params
    const result = await getFollowUpById(id)

    if (!result.success) {
      const status = result.error === 'Follow-up nao encontrado' ? 404 : 500
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/follow-ups/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/follow-ups/[id]
 *
 * Update a follow-up
 * Special actions: status=completed, status=cancelled
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<FollowUp>>> {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    const { id } = context.params
    const body = await request.json()

    // Handle special status actions
    if (body.status === 'completed') {
      const result = await completeFollowUp(id, body.notes)
      if (!result.success) {
        const status = result.error === 'Follow-up nao encontrado' ? 404 : 500
        return NextResponse.json(
          { success: false, error: result.error },
          { status }
        )
      }
      return NextResponse.json(
        { success: true, data: result.data },
        { status: 200 }
      )
    }

    if (body.status === 'cancelled') {
      const result = await cancelFollowUp(id)
      if (!result.success) {
        const status = result.error === 'Follow-up nao encontrado' ? 404 : 500
        return NextResponse.json(
          { success: false, error: result.error },
          { status }
        )
      }
      return NextResponse.json(
        { success: true, data: result.data },
        { status: 200 }
      )
    }

    // Regular update
    const input: UpdateFollowUpInput = {}
    if (body.title !== undefined) input.title = body.title
    if (body.message !== undefined) input.message = body.message
    if (body.notes !== undefined) input.notes = body.notes
    if (body.scheduled_at !== undefined) input.scheduled_at = body.scheduled_at
    if (body.reminder_at !== undefined) input.reminder_at = body.reminder_at
    if (body.auto_send !== undefined) input.auto_send = body.auto_send

    const result = await updateFollowUp(id, input)

    if (!result.success) {
      const status = result.error === 'Follow-up nao encontrado' ? 404 : 500
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in PATCH /api/follow-ups/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/follow-ups/[id]
 *
 * Delete a follow-up
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    const { id } = context.params
    const result = await deleteFollowUp(id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/follow-ups/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
