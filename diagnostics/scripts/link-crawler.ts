#!/usr/bin/env npx tsx
/**
 * Navigation Diagnostic & Link Crawler
 *
 * Crawls all Consultor.AI routes as admin and consultant roles,
 * analyzes content quality, validates internal links, and
 * generates a structured Markdown report.
 *
 * Usage: npx tsx diagnostics/scripts/link-crawler.ts
 */

import { preflightCheck, authenticate, resolveSeedIds, SEED_CREDENTIALS } from '../lib/auth';
import { crawlRoute } from '../lib/crawler';
import { classifyContent } from '../lib/content-classifier';
import { extractInternalLinks } from '../lib/link-extractor';
import { generateReport } from '../lib/report-generator';
import { getAllRoutes, getSkippedRoutes, getRouteCounts } from '../lib/route-registry';
import type {
  AuthSession,
  BrokenLink,
  CrawlResult,
  DiagnosticReport,
  ExtractedLink,
} from '../lib/types';

import * as fs from 'fs';
import * as path from 'path';

const APP_URL = 'http://127.0.0.1:3000';

async function main(): Promise<void> {
  console.log('🔍 Consultor.AI - Navigation Diagnostic');
  console.log('========================================\n');

  // Step 1: Preflight check
  console.log('Preflight check...');
  try {
    await preflightCheck(APP_URL);
    console.log(`  ✓ App is running at ${APP_URL}`);
    console.log('  ✓ Supabase Auth is accessible\n');
  } catch (error) {
    console.error(`  ✗ ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  // Step 2: Authenticate
  console.log('Authenticating...');
  const sessions: AuthSession[] = [];
  for (const cred of Object.values(SEED_CREDENTIALS)) {
    try {
      const session = await authenticate(cred.email, cred.password, cred.role);
      sessions.push(session);
      console.log(`  ✓ ${cred.role}: ${cred.email}`);
    } catch (error) {
      console.error(`  ✗ ${cred.role}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`  Ensure seed data is applied: npx tsx scripts/seed-diagnostic.ts`);
      process.exit(1);
    }
  }
  console.log();

  // Step 3: Resolve seed IDs
  console.log('Resolving seed data IDs...');
  const seedIds = await resolveSeedIds();
  const resolvedCount = Object.values(seedIds).filter(v => v !== null).length;
  const totalFields = Object.keys(seedIds).length;
  for (const [key, value] of Object.entries(seedIds)) {
    if (value) {
      console.log(`  ✓ ${key}: ${value.slice(0, 12)}...`);
    } else {
      console.log(`  - ${key}: (no data)`);
    }
  }
  console.log(`  ${resolvedCount}/${totalFields} entities resolved\n`);

  // Step 4: Crawl routes for each role
  const allResults: CrawlResult[] = [];
  const routes = getAllRoutes();
  const _counts = getRouteCounts();

  for (const session of sessions) {
    console.log(`Crawling as ${session.role} (${routes.length} routes)...`);
    let idx = 0;
    for (const route of routes) {
      idx++;
      const result = await crawlRoute(route, session, seedIds);

      // Apply content classification
      if (result.statusCode === 200 && result.responseBody) {
        const classification = classifyContent(result.responseBody, result.contentType, route.type);
        if (classification.category !== 'funcionando' || classification.contentFlags.length > 0) {
          result.category = classification.category;
          result.contentFlags = [...result.contentFlags, ...classification.contentFlags];
          result.notes = classification.notes || result.notes;
        }
      }

      // Remove body from stored result to save memory
      delete result.responseBody;

      allResults.push(result);

      const statusIcon =
        result.category === 'funcionando'
          ? '✓'
          : result.category === 'quebrado'
            ? '✗'
            : result.category === 'placeholder'
              ? '◇'
              : '⊘';
      const categoryLabel =
        result.category === 'funcionando'
          ? 'Funcionando'
          : result.category === 'quebrado'
            ? 'Quebrado'
            : result.category === 'placeholder'
              ? 'Placeholder'
              : 'Acesso Negado';

      console.log(
        `  [${String(idx).padStart(2)}/${routes.length}] ${result.method} ${result.path.padEnd(45)} ${String(result.statusCode).padStart(3)}  ${String(result.responseTimeMs).padStart(5)}ms  ${statusIcon} ${categoryLabel}`
      );
    }
    console.log();
  }

  // Step 5: Extract and validate internal links
  console.log('Extracting internal links...');
  const allBrokenLinks: BrokenLink[] = [];
  const allExtractedLinks: ExtractedLink[] = [];

  // Collect links from page crawl results that have response bodies
  // We need to re-crawl pages to get bodies for link extraction
  for (const session of sessions) {
    const pageRoutes = routes.filter(r => r.type === 'page');
    const pageLinks: ExtractedLink[] = [];

    for (const route of pageRoutes) {
      // Re-fetch the page to extract links
      const tempResult = await crawlRoute(route, session, seedIds);
      if (tempResult.statusCode === 200 && tempResult.responseBody) {
        const links = extractInternalLinks(tempResult.responseBody, tempResult.path);
        pageLinks.push(...links);
      }
    }

    // Deduplicate links
    const uniqueTargets = new Set<string>();
    const uniqueLinks: ExtractedLink[] = [];
    for (const link of pageLinks) {
      if (!uniqueTargets.has(link.targetPath)) {
        uniqueTargets.add(link.targetPath);
        uniqueLinks.push(link);
      }
    }

    allExtractedLinks.push(...uniqueLinks);
    console.log(`  Found ${uniqueLinks.length} unique internal links for ${session.role}`);

    // Test each internal link
    for (const link of uniqueLinks) {
      try {
        const headers: Record<string, string> = {
          Cookie: session.cookieHeader,
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const response = await fetch(`${APP_URL}${link.targetPath}`, {
          headers,
          redirect: 'manual',
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const isRedirectToLogin =
          response.status >= 300 &&
          response.status < 400 &&
          (response.headers.get('location') || '').includes('/auth/login');

        if (response.status >= 400 || response.status === 0 || isRedirectToLogin) {
          allBrokenLinks.push({
            sourcePath: link.sourcePath,
            targetPath: link.targetPath,
            linkText: link.linkText,
            statusCode: isRedirectToLogin ? 302 : response.status,
            role: session.role,
          });
        }
      } catch {
        allBrokenLinks.push({
          sourcePath: link.sourcePath,
          targetPath: link.targetPath,
          linkText: link.linkText,
          statusCode: 0,
          role: session.role,
        });
      }
    }
  }

  if (allBrokenLinks.length > 0) {
    console.log(`  ⚠ ${allBrokenLinks.length} broken internal links found`);
  } else {
    console.log('  ✓ No broken internal links found');
  }
  console.log();

  // Step 6: Generate report
  console.log('Generating report...');
  const skippedRoutes = getSkippedRoutes();

  const report: DiagnosticReport = {
    timestamp: new Date(),
    environment: 'Docker Full-Stack',
    roles: sessions.map(s => s.role),
    results: allResults,
    brokenLinks: allBrokenLinks,
    skippedRoutes,
    summary: buildSummary(allResults, allBrokenLinks, skippedRoutes),
  };

  const reportContent = generateReport(report);
  const reportPath = path.resolve(__dirname, '..', 'reports', '01-link-crawler.md');

  // Ensure reports directory exists
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  console.log(`  ✓ Written to ${path.relative(process.cwd(), reportPath)}\n`);

  // Step 7: Print summary
  console.log('========================================');
  console.log('Summary:');
  const s = report.summary;
  const total = s.totalRoutes;
  const pct = (n: number) => (total > 0 ? `(${Math.round((n / total) * 100)}%)` : '');
  console.log(
    `  Funcionando:              ${String(s.byCategory.funcionando).padStart(3)} ${pct(s.byCategory.funcionando)}`
  );
  console.log(
    `  Quebrado:                 ${String(s.byCategory.quebrado).padStart(3)} ${pct(s.byCategory.quebrado)}`
  );
  console.log(
    `  Placeholder:              ${String(s.byCategory.placeholder).padStart(3)} ${pct(s.byCategory.placeholder)}`
  );
  console.log(
    `  Acesso Negado Inesperado: ${String(s.byCategory.acesso_negado).padStart(3)} ${pct(s.byCategory.acesso_negado)}`
  );
  console.log(`  Não Testado:              ${String(s.totalSkipped).padStart(3)}`);
  console.log(`  Links Internos Quebrados: ${String(s.totalBrokenLinks).padStart(3)}`);
  console.log(`  Total:                    ${String(total).padStart(3)}`);
  console.log('========================================');
}

function buildSummary(
  results: CrawlResult[],
  brokenLinks: BrokenLink[],
  skippedRoutes: { path: string; reason: string }[]
): DiagnosticReport['summary'] {
  const byCategory = {
    funcionando: 0,
    quebrado: 0,
    placeholder: 0,
    acesso_negado: 0,
  };

  const byRole: Record<string, Record<string, number>> = {};

  for (const result of results) {
    byCategory[result.category]++;
    if (!byRole[result.role]) {
      byRole[result.role] = { funcionando: 0, quebrado: 0, placeholder: 0, acesso_negado: 0 };
    }
    byRole[result.role][result.category]++;
  }

  return {
    byCategory,
    byRole: byRole as Record<string, Record<import('./types').ContentCategory, number>>,
    totalRoutes: results.length,
    totalBrokenLinks: brokenLinks.length,
    totalSkipped: skippedRoutes.length,
  };
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
