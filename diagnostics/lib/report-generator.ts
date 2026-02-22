/**
 * Markdown Report Generator
 *
 * Generates a structured diagnostic report grouped by category.
 */

import type {
  CrawlResult,
  DiagnosticReport,
  BrokenLink,
  SkippedRoute,
  ContentCategory,
} from './types';

const CATEGORY_LABELS: Record<ContentCategory, string> = {
  funcionando: 'Funcionando',
  quebrado: 'Quebrado',
  placeholder: 'Placeholder',
  acesso_negado: 'Acesso Negado Inesperado',
};

/**
 * Generate the full Markdown report
 */
export function generateReport(report: DiagnosticReport): string {
  const lines: string[] = [];

  // Header
  lines.push('# Diagnóstico de Navegação - Consultor.AI');
  lines.push('');
  lines.push(`**Data**: ${formatDate(report.timestamp)}`);
  lines.push(`**Ambiente**: ${report.environment}`);
  lines.push(`**Roles testados**: ${report.roles.map(r => r).join(', ')}`);
  lines.push('');

  // Summary table
  lines.push('## Resumo');
  lines.push('');
  lines.push(generateSummaryTable(report));
  lines.push('');

  // Category sections
  for (const category of [
    'funcionando',
    'quebrado',
    'placeholder',
    'acesso_negado',
  ] as ContentCategory[]) {
    const results = report.results.filter(r => r.category === category);
    lines.push(`## ${CATEGORY_LABELS[category]}`);
    lines.push('');
    if (results.length === 0) {
      lines.push('*Nenhuma rota nesta categoria.*');
    } else {
      lines.push(generateRouteTable(results));
    }
    lines.push('');
  }

  // Broken links section
  lines.push('## Links Internos Quebrados');
  lines.push('');
  if (report.brokenLinks.length === 0) {
    lines.push('*Nenhum link interno quebrado encontrado.*');
  } else {
    lines.push(generateBrokenLinksTable(report.brokenLinks));
  }
  lines.push('');

  // Skipped routes section
  lines.push('## Rotas Não Testadas');
  lines.push('');
  if (report.skippedRoutes.length === 0) {
    lines.push('*Todas as rotas foram testadas.*');
  } else {
    lines.push(generateSkippedTable(report.skippedRoutes));
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate summary table with per-category and per-role counts
 */
export function generateSummaryTable(report: DiagnosticReport): string {
  const { summary } = report;
  const roles = report.roles;
  const lines: string[] = [];

  // Header row
  const headerCols = ['Categoria', ...roles, 'Total'];
  lines.push(`| ${headerCols.join(' | ')} |`);
  lines.push(`| ${headerCols.map(() => '---').join(' | ')} |`);

  // Category rows
  for (const category of [
    'funcionando',
    'quebrado',
    'placeholder',
    'acesso_negado',
  ] as ContentCategory[]) {
    const roleCounts = roles.map(role => {
      const roleData = summary.byRole[role];
      return roleData ? String(roleData[category] || 0) : '0';
    });
    const total = summary.byCategory[category];
    lines.push(`| ${CATEGORY_LABELS[category]} | ${roleCounts.join(' | ')} | ${total} |`);
  }

  // Total row
  const roleTotals = roles.map(role => {
    const roleData = summary.byRole[role];
    if (!roleData) return '0';
    return String(Object.values(roleData).reduce((sum, n) => sum + n, 0));
  });
  lines.push(`| **Total** | ${roleTotals.join(' | ')} | ${summary.totalRoutes} |`);

  return lines.join('\n');
}

/**
 * Generate a table of route results
 */
function generateRouteTable(results: CrawlResult[]): string {
  const lines: string[] = [];

  lines.push('| Rota | Método | Status | Tempo (ms) | Role | Notas |');
  lines.push('| --- | --- | --- | --- | --- | --- |');

  for (const r of results) {
    const flags = r.contentFlags.length > 0 ? ` [${r.contentFlags.join(', ')}]` : '';
    const notes = `${r.notes}${flags}`.slice(0, 80);
    lines.push(
      `| ${r.path} | ${r.method} | ${r.statusCode} | ${r.responseTimeMs} | ${r.role} | ${escapeMarkdown(notes)} |`
    );
  }

  return lines.join('\n');
}

/**
 * Generate broken links table
 */
function generateBrokenLinksTable(links: BrokenLink[]): string {
  const lines: string[] = [];

  lines.push('| Página Origem | Link Destino | Texto do Link | Status | Role |');
  lines.push('| --- | --- | --- | --- | --- |');

  for (const link of links) {
    lines.push(
      `| ${link.sourcePath} | ${link.targetPath} | ${escapeMarkdown(link.linkText.slice(0, 50))} | ${link.statusCode} | ${link.role} |`
    );
  }

  return lines.join('\n');
}

/**
 * Generate skipped routes table
 */
function generateSkippedTable(routes: SkippedRoute[]): string {
  const lines: string[] = [];

  lines.push('| Rota | Motivo |');
  lines.push('| --- | --- |');

  for (const route of routes) {
    lines.push(`| ${route.path} | ${escapeMarkdown(route.reason)} |`);
  }

  return lines.join('\n');
}

/**
 * Format date for report header
 */
function formatDate(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

/**
 * Escape markdown special characters in table cells
 */
function escapeMarkdown(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
