@echo off
setlocal enabledelayedexpansion

set OUTPUT_FILE=E:\PROJETOS\Consultor.AI\e2e-output.txt
set PROJECT_DIR=E:\PROJETOS\Consultor.AI

echo === E2E TEST RUNNER === > "%OUTPUT_FILE%"
echo Started: %date% %time% >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

cd /d "%PROJECT_DIR%"

echo --- Step 1: Checking app accessibility (http://localhost:3000) --- >> "%OUTPUT_FILE%"
curl -s -o nul -w "HTTP Status: %%{http_code}" http://localhost:3000 >> "%OUTPUT_FILE%" 2>&1
echo. >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"

echo --- Step 2: Checking playwright auth directory --- >> "%OUTPUT_FILE%"
if exist "playwright\.auth\" (
    echo Auth directory exists: >> "%OUTPUT_FILE%"
    dir "playwright\.auth\" >> "%OUTPUT_FILE%" 2>&1
) else (
    echo Auth directory NOT found - creating it... >> "%OUTPUT_FILE%"
    mkdir "playwright\.auth"
    echo Auth directory created. >> "%OUTPUT_FILE%"
)
echo. >> "%OUTPUT_FILE%"

echo --- Step 3: Running diagnostic seed --- >> "%OUTPUT_FILE%"
set NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
npx tsx scripts/seed-diagnostic.ts >> "%OUTPUT_FILE%" 2>&1
echo. >> "%OUTPUT_FILE%"

echo --- Step 4: Running Playwright E2E tests (setup + chromium only) --- >> "%OUTPUT_FILE%"
set CI=true
set PLAYWRIGHT_BASE_URL=http://localhost:3000
npx playwright test --project=setup --project=chromium >> "%OUTPUT_FILE%" 2>&1
echo. >> "%OUTPUT_FILE%"

echo === COMPLETED: %date% %time% === >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"
echo Output written to: %OUTPUT_FILE%
type "%OUTPUT_FILE%"
