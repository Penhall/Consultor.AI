#!/bin/bash

# ==================================
# Consultor.AI - Stop All Services
# ==================================

set -e

echo "🛑 Parando Consultor.AI - Stack Completo"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Change to project root
cd "$(dirname "$0")/.."

# Step 1: Stop application
echo -e "${BLUE}[1/2]${NC} Parando aplicação Next.js..."
docker-compose -f docker-compose.full.yml down
echo -e "${GREEN}✓${NC} Aplicação parada"
echo ""

# Step 2: Stop Supabase (optional)
read -p "Parar Supabase também? (s/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${BLUE}[2/2]${NC} Parando Supabase..."
    npx supabase stop
    echo -e "${GREEN}✓${NC} Supabase parado"
else
    echo -e "${BLUE}[2/2]${NC} Mantendo Supabase rodando"
fi

echo ""
echo -e "${GREEN}✓ Todos os serviços parados!${NC}"
echo ""
