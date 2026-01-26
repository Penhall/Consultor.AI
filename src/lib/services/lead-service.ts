/**
 * Lead Service
 *
 * Service layer for lead management operations
 * Handles CRUD operations with RLS security
 */

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import type { CreateLeadInput, UpdateLeadInput, ListLeadsParams } from '@/lib/validations/lead';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadInsert = Database['public']['Tables']['leads']['Insert'];
type LeadUpdate = Database['public']['Tables']['leads']['Update'];

/**
 * Result type for service operations
 */
type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Paginated result type
 */
type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * Create a new lead
 */
export async function createLead(
  consultantId: string,
  input: CreateLeadInput
): Promise<ServiceResult<Lead>> {
  try {
    const supabase = await createClient();

    const leadData: LeadInsert = {
      consultant_id: consultantId,
      whatsapp_number: input.whatsapp_number,
      name: input.name || null,
      email: input.email || null,
      status: input.status || 'novo',
      score: input.score || null,
      metadata: (input.metadata as any) || {},
      source: input.source || 'manual',
      utm_source: input.utm_source || null,
      utm_medium: input.utm_medium || null,
      utm_campaign: input.utm_campaign || null,
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(leadData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);

      // Handle unique constraint violation
      if (error.code === '23505') {
        return {
          success: false,
          error: 'Este número de WhatsApp já está cadastrado',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Unexpected error creating lead:', error);
    return {
      success: false,
      error: 'Erro ao criar lead',
    };
  }
}

/**
 * Get a lead by ID
 */
export async function getLeadById(leadId: string): Promise<ServiceResult<Lead>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from('leads').select().eq('id', leadId).single();

    if (error) {
      console.error('Error fetching lead:', error);

      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Lead não encontrado',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Unexpected error fetching lead:', error);
    return {
      success: false,
      error: 'Erro ao buscar lead',
    };
  }
}

/**
 * List leads with filters and pagination
 */
export async function listLeads(
  consultantId: string,
  params: ListLeadsParams
): Promise<ServiceResult<PaginatedResult<Lead>>> {
  try {
    const supabase = await createClient();
    const {
      page,
      limit,
      status,
      statuses,
      search,
      orderBy,
      order,
      dateFrom,
      dateTo,
      scoreMin,
      scoreMax,
      source,
    } = params;

    // Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('consultant_id', consultantId);

    // Apply status filter (single or multiple)
    if (statuses) {
      const statusList = statuses.split(',').filter(Boolean);
      if (statusList.length > 0) {
        query = query.in('status', statusList);
      }
    } else if (status) {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,whatsapp_number.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    // Apply date range filters
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      // Add 1 day to include the entire end date
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Apply score range filters
    if (scoreMin !== undefined) {
      query = query.gte('score', scoreMin);
    }
    if (scoreMax !== undefined) {
      query = query.lte('score', scoreMax);
    }

    // Apply source filter
    if (source) {
      query = query.eq('source', source);
    }

    // Apply ordering
    query = query.order(orderBy, { ascending: order === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error listing leads:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error('Unexpected error listing leads:', error);
    return {
      success: false,
      error: 'Erro ao listar leads',
    };
  }
}

/**
 * Update a lead
 */
export async function updateLead(
  leadId: string,
  input: UpdateLeadInput
): Promise<ServiceResult<Lead>> {
  try {
    const supabase = await createClient();

    const updateData: LeadUpdate = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.score !== undefined && { score: input.score }),
      ...(input.metadata !== undefined && { metadata: input.metadata as any }),
    };

    const { data, error } = await (supabase as any)
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);

      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'Lead não encontrado',
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Unexpected error updating lead:', error);
    return {
      success: false,
      error: 'Erro ao atualizar lead',
    };
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(leadId: string): Promise<ServiceResult<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('leads').delete().eq('id', leadId);

    if (error) {
      console.error('Error deleting lead:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Unexpected error deleting lead:', error);
    return {
      success: false,
      error: 'Erro ao deletar lead',
    };
  }
}

/**
 * Get lead statistics for a consultant
 */
export async function getLeadStats(consultantId: string): Promise<
  ServiceResult<{
    total: number;
    byStatus: Record<string, number>;
    thisMonth: number;
    averageScore: number | null;
  }>
> {
  try {
    const supabase = await createClient();

    // Get all leads for stats
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, score, created_at')
      .eq('consultant_id', consultantId);

    if (error) {
      console.error('Error fetching lead stats:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    const total = leads?.length || 0;

    // Count by status
    const byStatus = (leads || []).reduce(
      (acc, lead: any) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Count this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = (leads || []).filter(
      (lead: any) => new Date(lead.created_at!) >= startOfMonth
    ).length;

    // Calculate average score
    const leadsWithScore = (leads || []).filter((lead: any) => lead.score !== null);
    const averageScore =
      leadsWithScore.length > 0
        ? leadsWithScore.reduce((sum, lead: any) => sum + (lead.score || 0), 0) /
          leadsWithScore.length
        : null;

    return {
      success: true,
      data: {
        total,
        byStatus,
        thisMonth,
        averageScore,
      },
    };
  } catch (error) {
    console.error('Unexpected error fetching lead stats:', error);
    return {
      success: false,
      error: 'Erro ao buscar estatísticas',
    };
  }
}
