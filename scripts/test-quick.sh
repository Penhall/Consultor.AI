#!/bin/bash
# Quick Test Script
# Roda testes apenas dos arquivos modificados

echo "🧪 Running quick tests on modified files..."

# Get modified TypeScript files (excluding test files)
MODIFIED_FILES=$(git diff --name-only --diff-filter=ACMR HEAD | grep -E '\.(ts|tsx)$' | grep -v '.test.' | grep -v '.spec.')

if [ -z "$MODIFIED_FILES" ]; then
  echo "✅ No modified files to test"
  exit 0
fi

echo "📝 Modified files:"
echo "$MODIFIED_FILES"
echo ""

# Run tests related to modified files
npm run test -- --related $MODIFIED_FILES --run

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo ""
  echo "✅ Quick tests passed!"
else
  echo ""
  echo "❌ Quick tests failed!"
  exit $EXIT_CODE
fi
