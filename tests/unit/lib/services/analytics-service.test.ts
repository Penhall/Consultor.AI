/**
 * Analytics Service Tests
 *
 * Testa cálculo de métricas, agregações e formatação de dados para charts.
 * Garante precisão dos indicadores de performance do consultor.
 *
 * Template completo em: docs/guides/SPRINT2-ANALYTICS-SERVICE-TESTS.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getLeadCountByStatus,
  getAverageScore,
  getConversionRate,
  getAverageResponseTime,
  getPieChartData,
  getBarChartData,
  filterByDateRange,
} from '@/lib/services/analytics-service'
import { mockLeads } from '@tests/fixtures/leads'

describe('Analytics Service - Métricas', () => {
  describe('Lead Count by Status', () => {
    it('deve contar leads por status corretamente', () => {
      const leads = [
        { ...mockLeads[0], status: 'novo' },
        { ...mockLeads[1], status: 'novo' },
        { ...mockLeads[0], id: 'lead-3', status: 'qualificado' },
        { ...mockLeads[0], id: 'lead-4', status: 'fechado' },
      ]

      const result = getLeadCountByStatus(leads)

      expect(result).toEqual({
        novo: 2,
        em_contato: 0,
        qualificado: 1,
        fechado: 1,
        perdido: 0,
      })
    })

    it('deve retornar 0 para todos os status quando não há leads', () => {
      const leads: any[] = []

      const result = getLeadCountByStatus(leads)

      expect(result).toEqual({
        novo: 0,
        em_contato: 0,
        qualificado: 0,
        fechado: 0,
        perdido: 0,
      })
    })
  })

  describe('Average Score', () => {
    it('deve calcular média de score corretamente', () => {
      const leads = [
        { ...mockLeads[0], score: 80 },
        { ...mockLeads[0], id: 'lead-2', score: 90 },
        { ...mockLeads[0], id: 'lead-3', score: 70 },
      ]

      const result = getAverageScore(leads)

      // Média: (80 + 90 + 70) / 3 = 80
      expect(result).toBe(80)
    })

    it('deve retornar 0 quando não há leads', () => {
      const leads: any[] = []

      const result = getAverageScore(leads)

      expect(result).toBe(0)
    })
  })

  describe('Conversion Rate', () => {
    it('deve calcular taxa de conversão corretamente', () => {
      const leads = [
        { ...mockLeads[0], status: 'novo' },
        { ...mockLeads[0], id: 'lead-2', status: 'qualificado' },
        { ...mockLeads[0], id: 'lead-3', status: 'fechado' },
        { ...mockLeads[0], id: 'lead-4', status: 'fechado' },
        { ...mockLeads[0], id: 'lead-5', status: 'perdido' },
      ]

      const result = getConversionRate(leads)

      // Taxa: 2 fechados / 5 total = 40%
      expect(result).toBe(40)
    })

    it('deve retornar 0 quando não há leads', () => {
      const leads: any[] = []

      const result = getConversionRate(leads)

      expect(result).toBe(0)
    })
  })
})

describe('Analytics Service - Charts', () => {
  describe('Pie Chart Data', () => {
    it('deve formatar dados para pie chart corretamente', () => {
      const leads = [
        { ...mockLeads[0], status: 'novo' },
        { ...mockLeads[0], id: 'lead-2', status: 'novo' },
        { ...mockLeads[0], id: 'lead-3', status: 'qualificado' },
        { ...mockLeads[0], id: 'lead-4', status: 'fechado' },
      ]

      const result = getPieChartData(leads)

      expect(result).toEqual([
        { label: 'Novo', value: 2, percentage: 50 },
        { label: 'Em Contato', value: 0, percentage: 0 },
        { label: 'Qualificado', value: 1, percentage: 25 },
        { label: 'Fechado', value: 1, percentage: 25 },
        { label: 'Perdido', value: 0, percentage: 0 },
      ])
    })
  })

  describe('Bar Chart Data', () => {
    it('deve agrupar leads por data corretamente', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-10T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-10T14:00:00Z' },
        { ...mockLeads[0], id: 'lead-3', created_at: '2026-01-11T10:00:00Z' },
      ]

      const result = getBarChartData(leads, 'day')

      expect(result).toEqual([
        { date: '2026-01-10', count: 2 },
        { date: '2026-01-11', count: 1 },
      ])
    })
  })
})

describe('Analytics Service - Edge Cases', () => {
  it('deve retornar métricas vazias para array vazio', () => {
    const leads: any[] = []

    expect(getLeadCountByStatus(leads).novo).toBe(0)
    expect(getAverageScore(leads)).toBe(0)
    expect(getConversionRate(leads)).toBe(0)
    expect(getPieChartData(leads)).toBeDefined()
  })
})
