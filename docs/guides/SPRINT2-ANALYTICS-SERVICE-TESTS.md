# 🧪 Sprint 2: Analytics Service Tests - Template Completo

**Módulo**: Analytics Service (Métricas + Charts)
**Tempo estimado**: 3 horas
**Prioridade**: ⭐⭐ IMPORTANTE

---

## 📋 Checklist

### Métricas Tests (2h)
- [ ] T090a - Contar leads por status
- [ ] T090b - Calcular média de score
- [ ] T090c - Calcular taxa de conversão
- [ ] T090d - Tempo médio de resposta

### Charts Tests (1h)
- [ ] T090e - Dados para pie chart
- [ ] T090f - Dados para bar chart
- [ ] T090g - Filtro por data

---

## 🧪 Template Completo

**Arquivo**: `tests/unit/lib/services/analytics-service.test.ts`

```typescript
/**
 * Analytics Service Tests
 *
 * Testa cálculo de métricas, agregações e formatação de dados para charts.
 * Garante precisão dos indicadores de performance do consultor.
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
import { mockLeads } from '@/tests/fixtures/leads'

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

    it('deve contar corretamente quando todos têm o mesmo status', () => {
      const leads = [
        { ...mockLeads[0], status: 'qualificado' },
        { ...mockLeads[0], id: 'lead-2', status: 'qualificado' },
        { ...mockLeads[0], id: 'lead-3', status: 'qualificado' },
      ]

      const result = getLeadCountByStatus(leads)

      expect(result.qualificado).toBe(3)
      expect(result.novo).toBe(0)
      expect(result.fechado).toBe(0)
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

    it('deve ignorar leads com score null ou undefined', () => {
      const leads = [
        { ...mockLeads[0], score: 80 },
        { ...mockLeads[0], id: 'lead-2', score: null },
        { ...mockLeads[0], id: 'lead-3', score: undefined },
        { ...mockLeads[0], id: 'lead-4', score: 90 },
      ]

      const result = getAverageScore(leads)

      // Média: (80 + 90) / 2 = 85
      expect(result).toBe(85)
    })

    it('deve arredondar para 2 casas decimais', () => {
      const leads = [
        { ...mockLeads[0], score: 85 },
        { ...mockLeads[0], id: 'lead-2', score: 86 },
        { ...mockLeads[0], id: 'lead-3', score: 87 },
      ]

      const result = getAverageScore(leads)

      // Média: (85 + 86 + 87) / 3 = 86.00
      expect(result).toBe(86)
    })

    it('deve lidar com valores extremos', () => {
      const leads = [
        { ...mockLeads[0], score: 0 },
        { ...mockLeads[0], id: 'lead-2', score: 100 },
      ]

      const result = getAverageScore(leads)

      expect(result).toBe(50)
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

    it('deve retornar 0 quando nenhum lead está fechado', () => {
      const leads = [
        { ...mockLeads[0], status: 'novo' },
        { ...mockLeads[0], id: 'lead-2', status: 'qualificado' },
        { ...mockLeads[0], id: 'lead-3', status: 'perdido' },
      ]

      const result = getConversionRate(leads)

      expect(result).toBe(0)
    })

    it('deve retornar 100 quando todos os leads estão fechados', () => {
      const leads = [
        { ...mockLeads[0], status: 'fechado' },
        { ...mockLeads[0], id: 'lead-2', status: 'fechado' },
      ]

      const result = getConversionRate(leads)

      expect(result).toBe(100)
    })

    it('deve arredondar para 2 casas decimais', () => {
      const leads = [
        { ...mockLeads[0], status: 'fechado' },
        { ...mockLeads[0], id: 'lead-2', status: 'novo' },
        { ...mockLeads[0], id: 'lead-3', status: 'novo' },
      ]

      const result = getConversionRate(leads)

      // Taxa: 1 / 3 = 33.33...
      expect(result).toBe(33.33)
    })
  })

  describe('Average Response Time', () => {
    it('deve calcular tempo médio de resposta em minutos', () => {
      const conversations = [
        {
          lead_id: 'lead-1',
          created_at: '2026-01-12T10:00:00Z',
          first_response_at: '2026-01-12T10:05:00Z', // 5 min
        },
        {
          lead_id: 'lead-2',
          created_at: '2026-01-12T11:00:00Z',
          first_response_at: '2026-01-12T11:10:00Z', // 10 min
        },
        {
          lead_id: 'lead-3',
          created_at: '2026-01-12T12:00:00Z',
          first_response_at: '2026-01-12T12:15:00Z', // 15 min
        },
      ]

      const result = getAverageResponseTime(conversations)

      // Média: (5 + 10 + 15) / 3 = 10 minutos
      expect(result).toBe(10)
    })

    it('deve retornar 0 quando não há conversas', () => {
      const conversations: any[] = []

      const result = getAverageResponseTime(conversations)

      expect(result).toBe(0)
    })

    it('deve ignorar conversas sem primeira resposta', () => {
      const conversations = [
        {
          lead_id: 'lead-1',
          created_at: '2026-01-12T10:00:00Z',
          first_response_at: '2026-01-12T10:05:00Z', // 5 min
        },
        {
          lead_id: 'lead-2',
          created_at: '2026-01-12T11:00:00Z',
          first_response_at: null, // Sem resposta ainda
        },
      ]

      const result = getAverageResponseTime(conversations)

      // Só considera a primeira conversa: 5 minutos
      expect(result).toBe(5)
    })

    it('deve converter horas em minutos corretamente', () => {
      const conversations = [
        {
          lead_id: 'lead-1',
          created_at: '2026-01-12T10:00:00Z',
          first_response_at: '2026-01-12T12:00:00Z', // 2 horas = 120 min
        },
      ]

      const result = getAverageResponseTime(conversations)

      expect(result).toBe(120)
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

    it('deve calcular percentagens corretamente', () => {
      const leads = [
        { ...mockLeads[0], status: 'fechado' },
        { ...mockLeads[0], id: 'lead-2', status: 'novo' },
        { ...mockLeads[0], id: 'lead-3', status: 'novo' },
        { ...mockLeads[0], id: 'lead-4', status: 'novo' },
      ]

      const result = getPieChartData(leads)

      const novoData = result.find(item => item.label === 'Novo')
      const fechadoData = result.find(item => item.label === 'Fechado')

      expect(novoData?.percentage).toBe(75)    // 3/4 = 75%
      expect(fechadoData?.percentage).toBe(25) // 1/4 = 25%
    })

    it('deve retornar array vazio quando não há leads', () => {
      const leads: any[] = []

      const result = getPieChartData(leads)

      expect(result).toHaveLength(5) // 5 status possíveis
      result.forEach(item => {
        expect(item.value).toBe(0)
        expect(item.percentage).toBe(0)
      })
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

    it('deve agrupar por semana quando solicitado', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-06T10:00:00Z' }, // Semana 1
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-07T10:00:00Z' }, // Semana 1
        { ...mockLeads[0], id: 'lead-3', created_at: '2026-01-13T10:00:00Z' }, // Semana 2
      ]

      const result = getBarChartData(leads, 'week')

      expect(result).toHaveLength(2)
      expect(result[0].count).toBe(2) // Semana 1
      expect(result[1].count).toBe(1) // Semana 2
    })

    it('deve agrupar por mês quando solicitado', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-05T10:00:00Z' }, // Jan
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-20T10:00:00Z' }, // Jan
        { ...mockLeads[0], id: 'lead-3', created_at: '2026-02-01T10:00:00Z' }, // Fev
      ]

      const result = getBarChartData(leads, 'month')

      expect(result).toEqual([
        { date: '2026-01', count: 2 },
        { date: '2026-02', count: 1 },
      ])
    })

    it('deve ordenar resultados por data (mais antigo primeiro)', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-15T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-10T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-3', created_at: '2026-01-20T10:00:00Z' },
      ]

      const result = getBarChartData(leads, 'day')

      expect(result[0].date).toBe('2026-01-10')
      expect(result[1].date).toBe('2026-01-15')
      expect(result[2].date).toBe('2026-01-20')
    })
  })

  describe('Filter by Date Range', () => {
    it('deve filtrar leads dentro do range', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-10T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-15T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-3', created_at: '2026-01-20T10:00:00Z' },
      ]

      const result = filterByDateRange(leads, {
        startDate: '2026-01-12',
        endDate: '2026-01-18',
      })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('lead-2')
    })

    it('deve incluir datas de início e fim (inclusive)', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-10T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-15T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-3', created_at: '2026-01-20T10:00:00Z' },
      ]

      const result = filterByDateRange(leads, {
        startDate: '2026-01-10',
        endDate: '2026-01-20',
      })

      expect(result).toHaveLength(3)
    })

    it('deve retornar todos os leads quando não há filtro', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-10T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-15T10:00:00Z' },
      ]

      const result = filterByDateRange(leads, {})

      expect(result).toHaveLength(2)
    })

    it('deve filtrar apenas por startDate quando endDate não fornecido', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-10T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-15T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-3', created_at: '2026-01-20T10:00:00Z' },
      ]

      const result = filterByDateRange(leads, {
        startDate: '2026-01-15',
      })

      expect(result).toHaveLength(2) // lead-2 e lead-3
    })

    it('deve filtrar apenas por endDate quando startDate não fornecido', () => {
      const leads = [
        { ...mockLeads[0], created_at: '2026-01-10T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-2', created_at: '2026-01-15T10:00:00Z' },
        { ...mockLeads[0], id: 'lead-3', created_at: '2026-01-20T10:00:00Z' },
      ]

      const result = filterByDateRange(leads, {
        endDate: '2026-01-15',
      })

      expect(result).toHaveLength(2) // lead-1 e lead-2
    })
  })
})

describe('Analytics Service - Edge Cases', () => {
  it('deve lidar com leads sem timestamps', () => {
    const leads = [
      { ...mockLeads[0], created_at: null },
      { ...mockLeads[0], id: 'lead-2', created_at: undefined },
    ]

    const result = getBarChartData(leads, 'day')

    // Deve ignorar leads sem data
    expect(result).toHaveLength(0)
  })

  it('deve lidar com dados malformados gracefully', () => {
    const leads = [
      { ...mockLeads[0], score: 'invalid' }, // Score inválido
      { ...mockLeads[0], id: 'lead-2', score: -10 }, // Score negativo
      { ...mockLeads[0], id: 'lead-3', score: 150 }, // Score > 100
    ]

    // Não deve lançar erro
    expect(() => getAverageScore(leads as any)).not.toThrow()
  })

  it('deve retornar métricas vazias para array vazio', () => {
    const leads: any[] = []

    expect(getLeadCountByStatus(leads).novo).toBe(0)
    expect(getAverageScore(leads)).toBe(0)
    expect(getConversionRate(leads)).toBe(0)
    expect(getPieChartData(leads)).toBeDefined()
  })
})
```

**Como usar**:
1. Copie o código acima
2. Cole em `tests/unit/lib/services/analytics-service.test.ts`
3. Execute: `npm run test tests/unit/lib/services/analytics-service.test.ts`
4. Marque `[x]` em T090a-T090g quando passar

---

## 📊 Coverage Esperado

Após completar todos os testes:
- **Analytics Service**: ~70-80% coverage
- **Tempo total**: ~3 horas

---

## 🎉 Conclusão Sprint 2

Após completar este último módulo, você terá:
- ✅ Flow Engine testado (80% coverage)
- ✅ AI Service testado (90% coverage) ⭐ CRÍTICO
- ✅ Lead Service testado (70% coverage)
- ✅ Analytics Service testado (70% coverage)
- ✅ **Coverage geral: 40-50%** 🎯

---

**Última atualização**: 2026-01-12
**Status**: ✅ PRONTO PARA USO
**Próximo**: Documentar progresso e celebrar! 🎉
