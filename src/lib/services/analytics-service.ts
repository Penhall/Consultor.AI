/**
 * Analytics Service
 *
 * Provides metrics and analytics data for consultants
 */

import { createClient } from '@/lib/supabase/server'

type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Overview metrics for dashboard
 */
export interface OverviewMetrics {
  totalLeads: number
  leadsThisMonth: number
  activeConversations: number
  completedConversations: number
  averageScore: number
  conversionRate: number // % of leads that completed conversations
}

/**
 * Leads distribution by status
 */
export interface LeadsByStatus {
  novo: number
  em_contato: number
  qualificado: number
  fechado: number
  perdido: number
}

/**
 * Time series data for charts
 */
export interface TimeSeriesData {
  date: string
  leads: number
  conversations: number
  conversions: number
}

/**
 * Profile distribution (health vertical)
 */
export interface ProfileDistribution {
  individual: number
  casal: number
  familia: number
  empresarial: number
}

/**
 * Get overview metrics for consultant dashboard
 */
export async function getOverviewMetrics(
  consultantId: string
): Promise<ServiceResult<OverviewMetrics>> {
  try {
    const supabase = await createClient()

    // Get total leads
    const { count: totalLeads } = await (supabase as any)
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('consultant_id', consultantId)

    // Get leads this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: leadsThisMonth } = await (supabase as any)
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('consultant_id', consultantId)
      .gte('created_at', startOfMonth.toISOString())

    // Get active conversations
    const { count: activeConversations } = await (supabase as any)
      .from('conversations')
      .select('lead:leads!inner(consultant_id)', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('lead.consultant_id', consultantId)

    // Get completed conversations
    const { count: completedConversations } = await (supabase as any)
      .from('conversations')
      .select('lead:leads!inner(consultant_id)', { count: 'exact', head: true })
      .eq('status', 'completed')
      .eq('lead.consultant_id', consultantId)

    // Get average score
    const { data: scoreData } = await (supabase as any)
      .from('leads')
      .select('score')
      .eq('consultant_id', consultantId)
      .not('score', 'is', null)

    const averageScore = scoreData?.length
      ? scoreData.reduce((sum: number, lead: any) => sum + (lead.score || 0), 0) /
        scoreData.length
      : 0

    // Calculate conversion rate
    const totalConversations = (activeConversations || 0) + (completedConversations || 0)
    const conversionRate =
      totalConversations > 0
        ? ((completedConversations || 0) / totalConversations) * 100
        : 0

    return {
      success: true,
      data: {
        totalLeads: totalLeads || 0,
        leadsThisMonth: leadsThisMonth || 0,
        activeConversations: activeConversations || 0,
        completedConversations: completedConversations || 0,
        averageScore: Math.round(averageScore),
        conversionRate: Math.round(conversionRate * 10) / 10,
      },
    }
  } catch (error) {
    console.error('Error getting overview metrics:', error)
    return {
      success: false,
      error: `Failed to get overview metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Get leads distribution by status
 */
export async function getLeadsByStatus(
  consultantId: string
): Promise<ServiceResult<LeadsByStatus>> {
  try {
    const supabase = await createClient()

    const { data: leads } = await (supabase as any)
      .from('leads')
      .select('status')
      .eq('consultant_id', consultantId)

    const distribution: LeadsByStatus = {
      novo: 0,
      em_contato: 0,
      qualificado: 0,
      fechado: 0,
      perdido: 0,
    }

    leads?.forEach((lead: any) => {
      if (lead.status in distribution) {
        distribution[lead.status as keyof LeadsByStatus]++
      }
    })

    return {
      success: true,
      data: distribution,
    }
  } catch (error) {
    console.error('Error getting leads by status:', error)
    return {
      success: false,
      error: `Failed to get leads by status: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Get time series data for last 30 days
 */
export async function getTimeSeriesData(
  consultantId: string,
  days: number = 30
): Promise<ServiceResult<TimeSeriesData[]>> {
  try {
    const supabase = await createClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Get leads created per day
    const { data: leadsData } = await (supabase as any)
      .from('leads')
      .select('created_at')
      .eq('consultant_id', consultantId)
      .gte('created_at', startDate.toISOString())

    // Get conversations started per day
    const { data: conversationsData } = await (supabase as any)
      .from('conversations')
      .select('created_at, status, lead:leads!inner(consultant_id)')
      .eq('lead.consultant_id', consultantId)
      .gte('created_at', startDate.toISOString())

    // Aggregate by date
    const dateMap = new Map<string, TimeSeriesData>()

    // Initialize all dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]!
      dateMap.set(dateStr, {
        date: dateStr,
        leads: 0,
        conversations: 0,
        conversions: 0,
      })
    }

    // Count leads
    leadsData?.forEach((lead: any) => {
      const dateStr = new Date(lead.created_at).toISOString().split('T')[0]!
      const data = dateMap.get(dateStr)
      if (data) {
        data.leads++
      }
    })

    // Count conversations and conversions
    conversationsData?.forEach((conv: any) => {
      const dateStr = new Date(conv.created_at).toISOString().split('T')[0]!
      const data = dateMap.get(dateStr)
      if (data) {
        data.conversations++
        if (conv.status === 'completed') {
          data.conversions++
        }
      }
    })

    return {
      success: true,
      data: Array.from(dateMap.values()),
    }
  } catch (error) {
    console.error('Error getting time series data:', error)
    return {
      success: false,
      error: `Failed to get time series data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Get profile distribution for health vertical
 */
export async function getProfileDistribution(
  consultantId: string
): Promise<ServiceResult<ProfileDistribution>> {
  try {
    const supabase = await createClient()

    // Get all conversations with state data
    const { data: conversations } = await (supabase as any)
      .from('conversations')
      .select('state, lead:leads!inner(consultant_id)')
      .eq('lead.consultant_id', consultantId)

    const distribution: ProfileDistribution = {
      individual: 0,
      casal: 0,
      familia: 0,
      empresarial: 0,
    }

    conversations?.forEach((conv: any) => {
      const state = conv.state as any
      const profile =
        state?.variables?.pergunta_perfil ||
        state?.responses?.pergunta_perfil

      if (profile && profile in distribution) {
        distribution[profile as keyof ProfileDistribution]++
      }
    })

    return {
      success: true,
      data: distribution,
    }
  } catch (error) {
    console.error('Error getting profile distribution:', error)
    return {
      success: false,
      error: `Failed to get profile distribution: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Get recent activity (last 10 leads)
 */
export async function getRecentActivity(consultantId: string) {
  try {
    const supabase = await createClient()

    const { data: leads } = await (supabase as any)
      .from('leads')
      .select('id, name, whatsapp_number, status, score, created_at')
      .eq('consultant_id', consultantId)
      .order('created_at', { ascending: false })
      .limit(10)

    return {
      success: true,
      data: leads || [],
    }
  } catch (error) {
    console.error('Error getting recent activity:', error)
    return {
      success: false,
      error: `Failed to get recent activity: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Get top performing leads (highest scores)
 */
export async function getTopLeads(consultantId: string, limit: number = 5) {
  try {
    const supabase = await createClient()

    const { data: leads } = await (supabase as any)
      .from('leads')
      .select('id, name, whatsapp_number, status, score, created_at')
      .eq('consultant_id', consultantId)
      .not('score', 'is', null)
      .order('score', { ascending: false })
      .limit(limit)

    return {
      success: true,
      data: leads || [],
    }
  } catch (error) {
    console.error('Error getting top leads:', error)
    return {
      success: false,
      error: `Failed to get top leads: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
