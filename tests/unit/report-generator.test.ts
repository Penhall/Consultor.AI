import { describe, it, expect } from 'vitest';
import { generateReport, generateSummaryTable } from '../../diagnostics/lib/report-generator';
import type { DiagnosticReport, CrawlResult } from '../../diagnostics/lib/types';

function createMockResult(overrides: Partial<CrawlResult> = {}): CrawlResult {
  return {
    url: 'http://127.0.0.1:3000/dashboard',
    path: '/dashboard',
    method: 'GET',
    role: 'admin',
    statusCode: 200,
    responseTimeMs: 100,
    contentType: 'text/html',
    category: 'funcionando',
    redirectTo: null,
    notes: 'OK',
    contentFlags: [],
    ...overrides,
  };
}

function createMockReport(overrides: Partial<DiagnosticReport> = {}): DiagnosticReport {
  return {
    timestamp: new Date('2026-02-20T12:00:00Z'),
    environment: 'Docker Full-Stack',
    roles: ['admin', 'consultant'],
    results: [
      createMockResult({ category: 'funcionando', role: 'admin' }),
      createMockResult({
        category: 'quebrado',
        role: 'admin',
        statusCode: 500,
        notes: 'Server error',
      }),
      createMockResult({ category: 'placeholder', role: 'consultant', notes: 'TODO found' }),
      createMockResult({
        category: 'acesso_negado',
        role: 'consultant',
        statusCode: 403,
        notes: 'Unexpected 403',
      }),
    ],
    brokenLinks: [],
    skippedRoutes: [],
    summary: {
      byCategory: { funcionando: 1, quebrado: 1, placeholder: 1, acesso_negado: 1 },
      byRole: {
        admin: { funcionando: 1, quebrado: 1, placeholder: 0, acesso_negado: 0 },
        consultant: { funcionando: 0, quebrado: 0, placeholder: 1, acesso_negado: 1 },
      },
      totalRoutes: 4,
      totalBrokenLinks: 0,
      totalSkipped: 0,
    },
    ...overrides,
  };
}

describe('Report Generator', () => {
  it('should generate valid Markdown', () => {
    const report = createMockReport();
    const markdown = generateReport(report);
    expect(markdown).toContain('# Diagnóstico de Navegação - Consultor.AI');
    expect(markdown).toContain('## Resumo');
  });

  it('should include all four category sections', () => {
    const report = createMockReport();
    const markdown = generateReport(report);
    expect(markdown).toContain('## Funcionando');
    expect(markdown).toContain('## Quebrado');
    expect(markdown).toContain('## Placeholder');
    expect(markdown).toContain('## Acesso Negado Inesperado');
  });

  it('should include broken links section', () => {
    const report = createMockReport();
    const markdown = generateReport(report);
    expect(markdown).toContain('## Links Internos Quebrados');
  });

  it('should include skipped routes section', () => {
    const report = createMockReport();
    const markdown = generateReport(report);
    expect(markdown).toContain('## Rotas Não Testadas');
  });

  it('should include date and environment in header', () => {
    const report = createMockReport();
    const markdown = generateReport(report);
    expect(markdown).toContain('2026-02-20');
    expect(markdown).toContain('Docker Full-Stack');
  });

  it('should handle empty categories gracefully', () => {
    const report = createMockReport({
      results: [createMockResult({ category: 'funcionando' })],
      summary: {
        byCategory: { funcionando: 1, quebrado: 0, placeholder: 0, acesso_negado: 0 },
        byRole: {
          admin: { funcionando: 1, quebrado: 0, placeholder: 0, acesso_negado: 0 },
        },
        totalRoutes: 1,
        totalBrokenLinks: 0,
        totalSkipped: 0,
      },
    });

    const markdown = generateReport(report);
    expect(markdown).toContain('*Nenhuma rota nesta categoria.*');
  });

  it('should include broken links when present', () => {
    const report = createMockReport({
      brokenLinks: [
        {
          sourcePath: '/dashboard',
          targetPath: '/missing-page',
          linkText: 'Missing Link',
          statusCode: 404,
          role: 'admin',
        },
      ],
      summary: {
        ...createMockReport().summary,
        totalBrokenLinks: 1,
      },
    });

    const markdown = generateReport(report);
    expect(markdown).toContain('/missing-page');
    expect(markdown).toContain('Missing Link');
    expect(markdown).toContain('404');
  });

  it('should include skipped routes when present', () => {
    const report = createMockReport({
      skippedRoutes: [{ path: '/api/billing/checkout', reason: 'POST-only' }],
      summary: {
        ...createMockReport().summary,
        totalSkipped: 1,
      },
    });

    const markdown = generateReport(report);
    expect(markdown).toContain('/api/billing/checkout');
    expect(markdown).toContain('POST-only');
  });

  describe('generateSummaryTable', () => {
    it('should generate a valid Markdown table', () => {
      const report = createMockReport();
      const table = generateSummaryTable(report);
      expect(table).toContain('| Categoria');
      expect(table).toContain('| Funcionando');
      expect(table).toContain('| Quebrado');
      expect(table).toContain('| Placeholder');
      expect(table).toContain('| Acesso Negado Inesperado');
      expect(table).toContain('| **Total**');
    });

    it('should include per-role columns', () => {
      const report = createMockReport();
      const table = generateSummaryTable(report);
      expect(table).toContain('admin');
      expect(table).toContain('consultant');
    });
  });
});
