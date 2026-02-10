/**
 * Lead Export API Routes
 *
 * GET /api/leads/export - Export leads as CSV
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listLeadsSchema } from '@/lib/validations/lead'
import type { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']

/**
 * Escape a value for CSV
 */
function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // If the value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Convert leads to CSV string
 */
function leadsToCSV(leads: Lead[]): string {
  const headers = [
    'ID',
    'Nome',
    'WhatsApp',
    'Email',
    'Status',
    'Score',
    'Fonte',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'Criado em',
    'Atualizado em',
    'Ultimo contato',
    'Qualificado em',
    'Metadata',
  ]

  const statusLabels: Record<string, string> = {
    novo: 'Novo',
    em_contato: 'Em contato',
    qualificado: 'Qualificado',
    agendado: 'Agendado',
    fechado: 'Fechado',
    perdido: 'Perdido',
  }

  const rows = leads.map((lead) => [
    escapeCSV(lead.id),
    escapeCSV(lead.name),
    escapeCSV(lead.whatsapp_number),
    escapeCSV(lead.email),
    escapeCSV(statusLabels[lead.status || 'novo'] || lead.status),
    escapeCSV(lead.score?.toString()),
    escapeCSV(lead.source),
    escapeCSV(lead.utm_source),
    escapeCSV(lead.utm_medium),
    escapeCSV(lead.utm_campaign),
    escapeCSV(lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : ''),
    escapeCSV(lead.updated_at ? new Date(lead.updated_at).toLocaleString('pt-BR') : ''),
    escapeCSV(
      lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleString('pt-BR') : ''
    ),
    escapeCSV(lead.qualified_at ? new Date(lead.qualified_at).toLocaleString('pt-BR') : ''),
    escapeCSV(lead.metadata ? JSON.stringify(lead.metadata) : ''),
  ])

  // Add BOM for UTF-8 encoding support in Excel
  const BOM = '\uFEFF'
  return BOM + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

/**
 * GET /api/leads/export
 *
 * Export leads as CSV file
 */
export async function GET(request: NextRequest) {
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

    // Get consultant profile
    const { data: consultantData, error: consultantError } = await supabase
      .from('consultants')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    type ConsultantRow = Database['public']['Tables']['consultants']['Row']
    const consultant = consultantData as Pick<ConsultantRow, 'id'> | null

    if (consultantError || !consultant) {
      return NextResponse.json(
        { success: false, error: 'Consultor nao encontrado' },
        { status: 404 }
      )
    }

    const consultantId = consultant.id

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      orderBy: searchParams.get('orderBy') || 'created_at',
      order: searchParams.get('order') || 'desc',
    }

    // Validate params (without pagination)
    const paramsValidation = listLeadsSchema.safeParse({
      ...params,
      page: 1,
      limit: 100,
    })

    // Build query
    let query = supabase
      .from('leads')
      .select('*')
      .eq('consultant_id', consultantId)

    // Apply filters
    if (paramsValidation.success) {
      const { status, search, orderBy, order } = paramsValidation.data

      if (status) {
        query = query.eq('status', status)
      }

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,email.ilike.%${search}%,whatsapp_number.ilike.%${search}%`
        )
      }

      // Apply ordering
      query = query.order(orderBy, { ascending: order === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Execute query (no limit for export)
    const { data: leads, error: leadsError } = await query

    if (leadsError) {
      console.error('Error fetching leads for export:', leadsError)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar leads' },
        { status: 500 }
      )
    }

    // Convert to CSV
    const csv = leadsToCSV((leads || []) as Lead[])

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0]
    const filename = `leads-${date}.csv`

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/leads/export:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
