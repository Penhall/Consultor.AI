#!/usr/bin/env npx tsx

/**
 * Release Verification Script
 *
 * Automated checks to verify the codebase is ready for release.
 * Run with: npx tsx scripts/verify-release.ts
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
}

const results: CheckResult[] = [];

function runCheck(name: string, fn: () => { passed: boolean; message: string }): void {
  const start = Date.now();
  console.log(`\n📋 Checking: ${name}...`);

  try {
    const result = fn();
    results.push({
      name,
      ...result,
      duration: Date.now() - start,
    });

    if (result.passed) {
      console.log(`   ✅ ${result.message}`);
    } else {
      console.log(`   ❌ ${result.message}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    results.push({
      name,
      passed: false,
      message,
      duration: Date.now() - start,
    });
    console.log(`   ❌ ${message}`);
  }
}

function exec(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string };
    return err.stdout || err.stderr || '';
  }
}

// Check 1: TypeScript compilation
runCheck('TypeScript Compilation', () => {
  const output = exec('npm run type-check 2>&1');
  const hasErrors = output.includes('error TS') || output.includes('error:');

  return {
    passed: !hasErrors,
    message: hasErrors ? 'TypeScript errors found' : 'No TypeScript errors',
  };
});

// Check 2: ESLint
runCheck('ESLint', () => {
  const output = exec('npm run lint 2>&1');
  const hasErrors = output.includes('error') && !output.includes('0 errors');
  const hasWarnings = output.includes('warning');

  if (hasErrors) {
    return { passed: false, message: 'ESLint errors found' };
  }
  if (hasWarnings) {
    return { passed: true, message: 'ESLint passed (warnings present)' };
  }
  return { passed: true, message: 'ESLint passed with no issues' };
});

// Check 3: Required files exist
runCheck('Required Files', () => {
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    '.env.example',
    'CHANGELOG.md',
    'CLAUDE.md',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/lib/supabase/client.ts',
    'src/lib/supabase/server.ts',
    'docs/guides/DEPLOYMENT.md',
    'docs/guides/MONITORING.md',
  ];

  const missing = requiredFiles.filter(f => !existsSync(f));

  return {
    passed: missing.length === 0,
    message:
      missing.length === 0
        ? `All ${requiredFiles.length} required files present`
        : `Missing files: ${missing.join(', ')}`,
  };
});

// Check 4: Dependencies
runCheck('Dependencies', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const deps = Object.keys(packageJson.dependencies || {});
  const devDeps = Object.keys(packageJson.devDependencies || {});

  const requiredDeps = ['next', 'react', '@supabase/ssr', 'zod', '@tanstack/react-query'];
  const requiredDevDeps = ['typescript', 'vitest', '@playwright/test'];

  const missingDeps = requiredDeps.filter(d => !deps.includes(d));
  const missingDevDeps = requiredDevDeps.filter(d => !devDeps.includes(d));

  const allMissing = [...missingDeps, ...missingDevDeps];

  return {
    passed: allMissing.length === 0,
    message:
      allMissing.length === 0
        ? `All required dependencies present (${deps.length} deps, ${devDeps.length} devDeps)`
        : `Missing: ${allMissing.join(', ')}`,
  };
});

// Check 5: Environment example
runCheck('Environment Example', () => {
  if (!existsSync('.env.example')) {
    return { passed: false, message: '.env.example not found' };
  }

  const envExample = readFileSync('.env.example', 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ENCRYPTION_KEY',
  ];

  const missing = requiredVars.filter(v => !envExample.includes(v));

  return {
    passed: missing.length === 0,
    message:
      missing.length === 0
        ? 'All required env vars documented'
        : `Missing env vars in example: ${missing.join(', ')}`,
  };
});

// Check 6: Database migrations
runCheck('Database Migrations', () => {
  const migrations = [
    'supabase/migrations/20251217000001_initial_schema.sql',
    'supabase/migrations/20251217000002_rls_policies.sql',
    'supabase/migrations/20260127000001_add_crm_integrations.sql',
  ];

  const existing = migrations.filter(m => existsSync(m));

  return {
    passed: existing.length >= 3,
    message: `${existing.length} migrations found`,
  };
});

// Check 7: API Routes
runCheck('API Routes', () => {
  const routes = [
    'src/app/api/health/route.ts',
    'src/app/api/leads/route.ts',
    'src/app/api/integrations/crm/route.ts',
  ];

  const existing = routes.filter(r => existsSync(r));

  return {
    passed: existing.length === routes.length,
    message: `${existing.length}/${routes.length} API routes present`,
  };
});

// Check 8: Build
runCheck('Production Build', () => {
  console.log('   Building... (this may take a while)');
  const start = Date.now();
  const output = exec('npm run build 2>&1');

  const buildTime = Date.now() - start;
  const success = !output.includes('Build error') && !output.includes('Error:');

  if (!success) {
    return { passed: false, message: 'Build failed' };
  }

  const buildTimeMinutes = (buildTime / 1000 / 60).toFixed(1);
  const withinLimit = buildTime < 5 * 60 * 1000; // 5 minutes

  return {
    passed: withinLimit,
    message: withinLimit
      ? `Build succeeded in ${buildTimeMinutes}min`
      : `Build took ${buildTimeMinutes}min (exceeds 5min limit)`,
  };
});

// Summary
console.log(`\n${'='.repeat(60)}`);
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
const total = results.length;

console.log(`\nResults: ${passed}/${total} checks passed`);
console.log('\nDetails:');
results.forEach(r => {
  const status = r.passed ? '✅' : '❌';
  const duration = r.duration ? ` (${(r.duration / 1000).toFixed(1)}s)` : '';
  console.log(`  ${status} ${r.name}${duration}`);
  if (!r.passed) {
    console.log(`     └─ ${r.message}`);
  }
});

if (failed > 0) {
  console.log(`\n⚠️  ${failed} check(s) failed. Review issues above.`);
  process.exit(1);
} else {
  console.log('\n🎉 All checks passed! Ready for release.');
  process.exit(0);
}
