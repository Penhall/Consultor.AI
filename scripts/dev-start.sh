#!/bin/bash

# ==================================
# Consultor.AI - Development Start Script
# ==================================
# Inicia todo o ambiente de desenvolvimento (Supabase + App)

set -e

echo "🚀 Iniciando Consultor.AI - Ambiente de Desenvolvimento"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project root
cd "$(dirname "$0")/.."

# Step 1: Verificar se Supabase está rodando
echo -e "${BLUE}[1/4]${NC} Verificando Supabase..."
if docker ps | grep -q "supabase_kong_consultor-ai-local"; then
    echo -e "${GREEN}✓${NC} Supabase já está rodando"
else
    echo -e "${YELLOW}⚠${NC}  Supabase não encontrado. Iniciando..."
    npx supabase start
    echo -e "${GREEN}✓${NC} Supabase iniciado"
fi
echo ""

# Step 2: Verificar variáveis de ambiente
echo -e "${BLUE}[2/4]${NC} Verificando variáveis de ambiente..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠${NC}  Arquivo .env não encontrado!"
    echo "   Copie .env.example para .env e configure as variáveis"
    exit 1
fi
echo -e "${GREEN}✓${NC} Variáveis de ambiente configuradas"
echo ""

# Step 3: Parar servidor local se estiver rodando
echo -e "${BLUE}[3/4]${NC} Verificando processos existentes..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠${NC}  Porta 3000 em uso. Parando processo..."
    pkill -f "next dev" || true
    sleep 2
fi
echo -e "${GREEN}✓${NC} Porta 3000 liberada"
echo ""

# Step 4: Iniciar aplicação com Docker Compose
echo -e "${BLUE}[4/4]${NC} Iniciando aplicação Next.js..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for app to be healthy
echo ""
echo "⏳ Aguardando aplicação inicializar..."
sleep 10

# Check if app is running
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ Consultor.AI iniciado com sucesso!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🌐 URLs disponíveis:"
    echo "   • Aplicação:       http://localhost:3000"
    echo "   • Dashboard:       http://localhost:3000/dashboard"
    echo "   • Simulador:       http://localhost:3000/dashboard/test/whatsapp-simulator"
    echo "   • Supabase Studio: http://localhost:54323"
    echo ""
    echo "📊 Comandos úteis:"
    echo "   • Ver logs:        docker-compose -f docker-compose.dev.yml logs -f app"
    echo "   • Parar:           docker-compose -f docker-compose.dev.yml down"
    echo "   • Reiniciar:       docker-compose -f docker-compose.dev.yml restart app"
    echo ""
else
    echo ""
    echo -e "${YELLOW}⚠${NC}  Aplicação não respondeu no tempo esperado."
    echo "   Verifique os logs: docker-compose -f docker-compose.dev.yml logs app"
    echo ""
fi
