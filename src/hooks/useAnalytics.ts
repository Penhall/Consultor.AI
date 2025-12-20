/**
 * Analytics Hooks
 *
 * Custom hooks for fetching analytics data
 */

'use client'

import { useQuery } from '@tanstack/react-query'

/**
 * Overview metrics type
 */
export interface OverviewMetrics {
  totalLeads: number
  leadsThisMonth: number
  activeConversations: number
  completedConversations: number
  averageScore: number
  conversionRate: number
}

/**
 * Leads by status type
 */
export interface LeadsByStatus {
  novo: number
  em_contato: number
  qualificado: number
  fechado: number
  perdido: number
}

/**
 * Time series data type
 */
export interface TimeSeriesData {
  date: string
  leads: number
  conversations: number
  conversions: number
}

/**
 * Profile distribution type
 */
export interface ProfileDistribution {
  individual: number
  casal: number
  familia: number
  empresarial: number
}

/**
 * Chart data type
 */
export interface ChartData {
  leadsByStatus: LeadsByStatus
  timeSeries: TimeSeriesData[]
  profileDistribution: ProfileDistribution
}

/**
 * Recent lead type
 */
export interface RecentLead {
  id: string
  name: string | null
  whatsapp_number: string
  status: string
  score: number | null
  created_at: string
}

/**
 * Activity data type
 */
export interface ActivityData {
  recent: RecentLead[]
  topLeads: RecentLead[]
}

/**
 * Hook to fetch overview metrics
 */
export function useOverviewMetrics() {
  return useQuery<OverviewMetrics>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/overview')
      if (!response.ok) {
        throw new Error('Failed to fetch overview metrics')
      }
      const json = await response.json()
      return json.data
    },
    refetchInterval: 60000, // Refetch every minute
  })
}

/**
 * Hook to fetch chart data
 */
export function useChartData(days: number = 30) {
  return useQuery<ChartData>({
    queryKey: ['analytics', 'charts', days],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/charts?days=${days}`)
      if (!response.ok) {
        throw new Error('Failed to fetch chart data')
      }
      const json = await response.json()
      return json.data
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  })
}

/**
 * Hook to fetch activity data
 */
export function useActivityData() {
  return useQuery<ActivityData>({
    queryKey: ['analytics', 'activity'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/activity')
      if (!response.ok) {
        throw new Error('Failed to fetch activity data')
      }
      const json = await response.json()
      return json.data
    },
    refetchInterval: 60000, // Refetch every minute
  })
}
