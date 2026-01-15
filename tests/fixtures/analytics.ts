/**
 * Analytics Test Fixtures
 *
 * Mock data for analytics service testing
 */

import type {
  OverviewMetrics,
  LeadsByStatus,
  TimeSeriesData,
  ProfileDistribution,
} from '@/lib/services/analytics-service'

/**
 * Mock overview metrics
 */
export const mockOverviewMetrics: OverviewMetrics = {
  totalLeads: 45,
  leadsThisMonth: 12,
  activeConversations: 8,
  completedConversations: 15,
  averageScore: 72.5,
  conversionRate: 33.3,
}

/**
 * Mock leads by status
 */
export const mockLeadsByStatus: LeadsByStatus = {
  novo: 10,
  em_contato: 15,
  qualificado: 12,
  fechado: 5,
  perdido: 3,
}

/**
 * Mock time series data (30 days)
 */
export const mockTimeSeriesData: TimeSeriesData[] = [
  { date: '2026-01-01', leads: 2, conversations: 1, conversions: 0 },
  { date: '2026-01-02', leads: 3, conversations: 2, conversions: 1 },
  { date: '2026-01-03', leads: 1, conversations: 1, conversions: 0 },
  { date: '2026-01-04', leads: 0, conversations: 0, conversions: 0 },
  { date: '2026-01-05', leads: 4, conversations: 3, conversions: 2 },
]

/**
 * Mock profile distribution
 */
export const mockProfileDistribution: ProfileDistribution = {
  individual: 20,
  casal: 15,
  familia: 8,
  empresarial: 2,
}

/**
 * Mock recent activity (lead data)
 */
export const mockRecentActivity = [
  {
    id: 'lead-1',
    name: 'João Silva',
    status: 'qualificado',
    score: 85,
    created_at: '2026-01-14T10:30:00Z',
    updated_at: '2026-01-14T15:45:00Z',
  },
  {
    id: 'lead-2',
    name: 'Maria Santos',
    status: 'em_contato',
    score: 70,
    created_at: '2026-01-14T09:20:00Z',
    updated_at: '2026-01-14T14:30:00Z',
  },
  {
    id: 'lead-3',
    name: 'Pedro Costa',
    status: 'novo',
    score: 60,
    created_at: '2026-01-14T08:15:00Z',
    updated_at: '2026-01-14T08:15:00Z',
  },
]

/**
 * Mock top leads
 */
export const mockTopLeads = [
  {
    id: 'lead-top-1',
    name: 'Ana Paula',
    status: 'qualificado',
    score: 95,
    whatsapp_number: '+5511999991111',
  },
  {
    id: 'lead-top-2',
    name: 'Carlos Eduardo',
    status: 'qualificado',
    score: 90,
    whatsapp_number: '+5511999992222',
  },
  {
    id: 'lead-top-3',
    name: 'Beatriz Oliveira',
    status: 'fechado',
    score: 88,
    whatsapp_number: '+5511999993333',
  },
  {
    id: 'lead-top-4',
    name: 'Roberto Alves',
    status: 'qualificado',
    score: 85,
    whatsapp_number: '+5511999994444',
  },
  {
    id: 'lead-top-5',
    name: 'Fernanda Lima',
    status: 'em_contato',
    score: 82,
    whatsapp_number: '+5511999995555',
  },
]
