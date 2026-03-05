# Playwright E2E Test Runner for Consultor.AI
# Usage: .\run-e2e-tests.ps1
# Usage (skip seed): .\run-e2e-tests.ps1 -SkipSeed
# Usage (all browsers): .\run-e2e-tests.ps1 -AllBrowsers
#
# Prerequisites: Docker containers running
#   docker-compose --env-file .env.docker -f docker-compose.full.yml up -d

param(
    [switch]$SkipSeed,
    [switch]$AllBrowsers,
    [string]$Project = "chromium"
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Consultor.AI - Playwright E2E Tests    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Environment variables for local Docker Supabase
$env:NEXT_PUBLIC_SUPABASE_URL      = "http://localhost:54321"
$env:SUPABASE_URL                  = "http://localhost:54321"
$env:SUPABASE_SERVICE_ROLE_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
$env:PLAYWRIGHT_BASE_URL           = "http://localhost:3000"
$env:TEST_EMAIL                    = "consultor1@seed.local"
$env:TEST_PASSWORD                 = "seed123456"
# PLAYWRIGHT_BASE_URL being set triggers reuseExistingServer in playwright.config.ts
# (do NOT set CI=true - it would prevent reuseExistingServer from activating)

# ---- Step 1: Wait for App (retry loop, up to 60 s) ----
# auth.setup flakiness root cause: a single check that warns and continues
# even when the app isn't ready yet. auth.setup then times out immediately.
Write-Host "[1/5] Waiting for app at http://localhost:3000 (up to 60 s)..." -ForegroundColor Yellow
$appReady = $false
for ($i = 1; $i -le 12; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop
        Write-Host "  OK - App running (HTTP $($r.StatusCode)) after ~$($i * 5) s" -ForegroundColor Green
        $appReady = $true
        break
    } catch {
        Write-Host "  Attempt $i/12 - not ready yet, waiting 5 s..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}
if (-not $appReady) {
    Write-Host "  ERROR - App did not respond in 60 s. Aborting." -ForegroundColor Red
    Write-Host "  Ensure Docker is up: docker-compose --env-file .env.docker -f docker-compose.full.yml up -d" -ForegroundColor Red
    exit 1
}
Write-Host ""

# ---- Step 2: Wait for Supabase (retry loop, up to 60 s) ----
# A single check that warns-and-continues causes cascade failures: Next.js middleware
# hangs on Supabase auth, page.goto times out at 30-60 s across every test.
Write-Host "[2/5] Waiting for Supabase at http://localhost:54321 (up to 60 s)..." -ForegroundColor Yellow
$sbReady = $false
for ($i = 1; $i -le 12; $i++) {
    try {
        $sb = Invoke-WebRequest -Uri "http://localhost:54321/rest/v1/" -Headers @{apikey=$env:SUPABASE_SERVICE_ROLE_KEY} -TimeoutSec 8 -UseBasicParsing -ErrorAction Stop
        Write-Host "  OK - Supabase running (HTTP $($sb.StatusCode)) after ~$($i * 5) s" -ForegroundColor Green
        $sbReady = $true
        break
    } catch {
        Write-Host "  Attempt $i/12 - Supabase not ready yet, waiting 5 s..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}
if (-not $sbReady) {
    Write-Host "  WARN - Supabase did not respond in 60 s. Tests may fail due to auth timeouts." -ForegroundColor Red
    Write-Host "  Check: docker logs consultorai-kong" -ForegroundColor Yellow
}
Write-Host ""

# ---- Step 3: Apply migrations to existing DB volume ----
# Docker postgres init scripts only run on first boot (empty data volume).
# Both migrations below are idempotent (IF NOT EXISTS / CREATE OR REPLACE / DROP IF EXISTS).
Write-Host "[3/5] Applying migrations to Docker postgres..." -ForegroundColor Yellow

# 3a: Billing fields (credits, is_admin, stripe_customer_id, etc.)
$migrationSql = Get-Content (Join-Path $ScriptDir "supabase\migrations\20260208000001_add_billing_fields.sql") -Raw
$result = $migrationSql | docker exec -i consultorai-db psql -U postgres -d postgres 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK - Billing columns present (credits, is_admin, etc.)" -ForegroundColor Green
} else {
    Write-Host "  WARN - Billing migration may have failed: $result" -ForegroundColor Yellow
}

# 3b: RLS fix (20260224000001) — replaces the broken recursive policy from 20260208000006
# Root cause of admin test failure: 20260208000006 creates consultants_admin_select_all
# with (a) wrong column 'id' instead of 'user_id' and (b) recursive EXISTS on the same
# RLS-protected table → PostgreSQL error 42P17.
# Fix creates auth_is_admin() SECURITY DEFINER function that bypasses RLS safely.
Write-Host "  Applying RLS fix migration (20260224000001)..." -ForegroundColor Gray
$rlsFixSql = Get-Content (Join-Path $ScriptDir "supabase\migrations\20260224000001_fix_consultants_rls_recursion.sql") -Raw
$rlsResult = $rlsFixSql | docker exec -i consultorai-db psql -U postgres -d postgres 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK - RLS policy fixed (auth_is_admin SECURITY DEFINER in place)" -ForegroundColor Green
} else {
    Write-Host "  WARN - RLS fix may have failed: $rlsResult" -ForegroundColor Yellow
    Write-Host "  Admin tests may fail. To reset: docker-compose -f docker-compose.full.yml down -v && up -d" -ForegroundColor Yellow
}

# Restart PostgREST to force a full schema cache reload.
# NOTIFY pgrst is unreliable when PostgREST wasn't listening at migration time.
# A container restart guarantees schema changes (columns, functions, policies) are visible via REST.
Write-Host "  Restarting PostgREST to reload schema cache..." -ForegroundColor Gray
docker restart consultorai-rest 2>&1 | Out-Null
Start-Sleep -Seconds 8
Write-Host "  PostgREST restarted - schema now fully up to date" -ForegroundColor Gray
Write-Host ""

# ---- Create auth dir ----
$authDir = Join-Path $ScriptDir "playwright\.auth"
if (-not (Test-Path $authDir)) {
    New-Item -ItemType Directory -Path $authDir -Force | Out-Null
    Write-Host "  Created playwright/.auth directory" -ForegroundColor Gray
}

# ---- Step 4: Seed Database ----
if (-not $SkipSeed) {
    Write-Host "[4/5] Running diagnostic seed..." -ForegroundColor Yellow
    Write-Host "  Creates 6 consultants + 90 leads + conversations + follow-ups" -ForegroundColor Gray
    Write-Host "  Accounts: consultor0@seed.local through consultor5@seed.local (pw: seed123456)" -ForegroundColor Gray
    Write-Host ""
    npx tsx scripts/seed-diagnostic.ts
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "  WARN: Seed exited with code $LASTEXITCODE - tests may fail if DB is empty" -ForegroundColor Red
    } else {
        Write-Host ""
        Write-Host "  Seed OK" -ForegroundColor Green
    }

    # Belt-and-suspenders: force is_admin=true directly in postgres.
    # Needed when the seed script's hasBillingColumns() check returned false (stale PostgREST cache).
    docker exec consultorai-db psql -U postgres -d postgres -c "UPDATE public.consultants SET is_admin = true WHERE email = 'consultor0@seed.local';" 2>&1 | Out-Null
    $adminCheck = docker exec consultorai-db psql -U postgres -d postgres -t -c "SELECT is_admin FROM public.consultants WHERE email = 'consultor0@seed.local';" 2>&1
    Write-Host "  is_admin for consultor0@seed.local: $adminCheck" -ForegroundColor Gray
} else {
    Write-Host "[4/5] Seed skipped (-SkipSeed)" -ForegroundColor Gray
}
Write-Host ""

# ---- Step 5: Run Playwright Tests ----
Write-Host "[5/5] Running Playwright tests..." -ForegroundColor Yellow
if ($AllBrowsers) {
    Write-Host "  Running ALL projects (chromium, firefox, webkit, mobile)..." -ForegroundColor Gray
    Write-Host ""
    npx playwright test
} else {
    Write-Host "  Running: setup + $Project  (use -AllBrowsers for full suite)" -ForegroundColor Gray
    Write-Host ""
    npx playwright test --project=setup --project=$Project
}

$exitCode = $LASTEXITCODE
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
if ($exitCode -eq 0) {
    Write-Host "  ALL TESTS PASSED  " -ForegroundColor Green
} else {
    Write-Host "  SOME TESTS FAILED (exit=$exitCode)" -ForegroundColor Red
    Write-Host "  See playwright-report/index.html for details" -ForegroundColor Yellow
}
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open HTML report:" -ForegroundColor Gray
Write-Host "  npx playwright show-report" -ForegroundColor Gray
Write-Host ""

exit $exitCode
