#!/bin/bash
# Full Test Suite
# Roda todos os testes com coverage

echo "🧪 Running full test suite..."
echo "=============================="

# Type check
echo ""
echo "📝 Type checking..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Type check failed!"
  exit 1
fi

# Lint
echo ""
echo "🔍 Linting..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint failed!"
  exit 1
fi

# Unit + Integration tests with coverage
echo ""
echo "🧪 Running tests with coverage..."
npm run test:coverage
if [ $? -ne 0 ]; then
  echo "❌ Tests failed!"
  exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "📊 Coverage report: coverage/index.html"
