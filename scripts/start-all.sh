#!/bin/bash

# ==================================
# Consultor.AI - Start All Services
# ==================================
# Inicia Supabase + Aplicação via Docker

set -e

echo "🚀 Iniciando Consultor.AI - Stack Completo"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Change to project root
cd "$(dirname "$0")/.."

# Step 1: Check if Supabase is running
echo -e "${BLUE}[1/3]${NC} Verificando Supabase..."

if curl -s http://localhost:54321/rest/v1/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Supabase já está rodando"
else
    echo -e "${YELLOW}⚠${NC}  Supabase não encontrado. Iniciando..."
    npx supabase start

    # Wait for Supabase to be ready
    echo "   Aguardando Supabase ficar pronto..."
    sleep 10

    if curl -s http://localhost:54321/rest/v1/ > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Supabase iniciado com sucesso"
    else
        echo -e "${RED}✗${NC} Erro: Supabase não respondeu"
        exit 1
    fi
fi
echo ""

# Step 2: Check environment variables
echo -e "${BLUE}[2/3]${NC} Verificando variáveis de ambiente..."
if [ ! -f .env ]; then
    echo -e "${RED}✗${NC} Arquivo .env não encontrado!"
    echo "   Crie o arquivo .env com as variáveis necessárias"
    exit 1
fi
echo -e "${GREEN}✓${NC} Variáveis de ambiente OK"
echo ""

# Step 3: Start application via Docker Compose
echo -e "${BLUE}[3/3]${NC} Iniciando aplicação Next.js..."
docker-compose -f docker-compose.full.yml up --build -d

# Wait for app
echo ""
echo "⏳ Aguardando aplicação inicializar..."
sleep 15

# Check if app is responding
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Aplicação respondendo!"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Tentativa $RETRY_COUNT/$MAX_RETRIES..."
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}⚠${NC}  Aplicação demorou para responder"
    echo "   Verifique os logs: docker logs consultorai-app"
else
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ Consultor.AI iniciado com sucesso!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🌐 URLs disponíveis:"
    echo "   • Aplicação:       http://localhost:3000"
    echo "   • Login:           http://localhost:3000/auth/login"
    echo "   • Dashboard:       http://localhost:3000/dashboard"
    echo "   • Simulador:       http://localhost:3000/dashboard/test/whatsapp-simulator"
    echo "   • Supabase Studio: http://localhost:54323"
    echo ""
    echo "📊 Comandos úteis:"
    echo "   • Ver logs app:    docker logs -f consultorai-app"
    echo "   • Ver logs Supabase: npx supabase logs"
    echo "   • Parar tudo:      ./scripts/stop-all.sh"
    echo "   • Reiniciar app:   docker restart consultorai-app"
    echo ""
fi
