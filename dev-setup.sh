#!/bin/bash

# ==================================
# Consultor.AI - Script de Desenvolvimento Local
# ==================================
#
# Este script facilita a configuração e execução do ambiente de desenvolvimento
#
# Uso:
#   ./dev-setup.sh [comando]
#
# Comandos:
#   start     - Inicia todos os serviços
#   stop      - Para todos os serviços
#   restart   - Reinicia todos os serviços
#   logs      - Mostra logs dos serviços
#   status    - Mostra status dos serviços
#   clean     - Remove volumes e limpa o ambiente
#   env       - Cria arquivo .env.local a partir do .env.example

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_header() {
    echo -e "\n${BLUE}===================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Verifica dependências
check_dependencies() {
    print_header "Verificando dependências"

    local missing_deps=()

    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        missing_deps+=("docker-compose")
    fi

    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi

    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Dependências faltando: ${missing_deps[*]}"
        echo ""
        echo "Instale as dependências necessárias:"
        echo "  - Docker: https://docs.docker.com/get-docker/"
        echo "  - Node.js: https://nodejs.org/"
        exit 1
    fi

    print_success "Todas as dependências instaladas"
}

# Cria arquivo .env.local
create_env() {
    print_header "Criando arquivo .env.local"

    if [ -f ".env.local" ]; then
        print_warning "Arquivo .env.local já existe"
        read -p "Deseja sobrescrever? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operação cancelada"
            return
        fi
    fi

    cp .env.example .env.local

    # Gera secrets aleatórios
    NEXTAUTH_SECRET=$(openssl rand -base64 32)

    # Substitui valores no .env.local
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXTAUTH_SECRET=your-nextauth-secret-here|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|g" .env.local
        sed -i '' "s|SMTP_HOST=smtp.gmail.com|SMTP_HOST=localhost|g" .env.local
        sed -i '' "s|SMTP_PORT=587|SMTP_PORT=1025|g" .env.local
        sed -i '' "s|WHATSAPP_API_URL=https://api.weni.ai/v1|WHATSAPP_API_URL=http://localhost:3001/v1|g" .env.local
        sed -i '' "s|GOOGLE_AI_API_KEY=.*|GOOGLE_AI_API_KEY=mock-google-ai-key|g" .env.local
    else
        # Linux
        sed -i "s|NEXTAUTH_SECRET=your-nextauth-secret-here|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|g" .env.local
        sed -i "s|SMTP_HOST=smtp.gmail.com|SMTP_HOST=localhost|g" .env.local
        sed -i "s|SMTP_PORT=587|SMTP_PORT=1025|g" .env.local
        sed -i "s|WHATSAPP_API_URL=https://api.weni.ai/v1|WHATSAPP_API_URL=http://localhost:3001/v1|g" .env.local
        sed -i "s|GOOGLE_AI_API_KEY=.*|GOOGLE_AI_API_KEY=mock-google-ai-key|g" .env.local
    fi

    print_success "Arquivo .env.local criado com sucesso"
    print_info "Configure suas chaves de API reais se necessário"
}

# Inicia serviços
start_services() {
    print_header "Iniciando serviços"

    # Inicia Docker Compose
    print_info "Iniciando serviços Docker..."
    docker-compose -f docker-compose.dev.yml up -d

    # Inicia Supabase
    print_info "Iniciando Supabase..."
    npx supabase start

    # Aguarda serviços ficarem prontos
    print_info "Aguardando serviços..."
    sleep 5

    print_success "Todos os serviços iniciados"

    show_urls
}

# Para serviços
stop_services() {
    print_header "Parando serviços"

    print_info "Parando Docker Compose..."
    docker-compose -f docker-compose.dev.yml down

    print_info "Parando Supabase..."
    npx supabase stop

    print_success "Todos os serviços parados"
}

# Reinicia serviços
restart_services() {
    stop_services
    start_services
}

# Mostra logs
show_logs() {
    print_header "Logs dos serviços"
    docker-compose -f docker-compose.dev.yml logs -f
}

# Mostra status
show_status() {
    print_header "Status dos serviços"

    echo "Docker Compose:"
    docker-compose -f docker-compose.dev.yml ps

    echo -e "\nSupabase:"
    npx supabase status
}

# Limpa ambiente
clean_environment() {
    print_header "Limpando ambiente"

    print_warning "ATENÇÃO: Isso removerá TODOS os dados locais!"
    read -p "Tem certeza? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Operação cancelada"
        return
    fi

    print_info "Parando serviços..."
    docker-compose -f docker-compose.dev.yml down -v
    npx supabase stop --no-backup

    print_info "Removendo volumes..."
    docker volume prune -f

    print_success "Ambiente limpo"
}

# Mostra URLs de acesso
show_urls() {
    print_header "URLs de Acesso"

    echo -e "${GREEN}Aplicação:${NC}"
    echo "  Next.js App:         http://localhost:3000"
    echo ""
    echo -e "${GREEN}Infraestrutura:${NC}"
    echo "  Supabase Studio:     http://localhost:54323"
    echo "  PostgreSQL:          postgresql://postgres:postgres@localhost:54322/postgres"
    echo ""
    echo -e "${GREEN}Desenvolvimento:${NC}"
    echo "  MailHog (Email):     http://localhost:8025"
    echo "  Redis Commander:     http://localhost:8081"
    echo "  Mock Server:         http://localhost:3001"
    echo ""
    echo -e "${GREEN}Credenciais Locais:${NC}"
    echo "  Supabase Anon Key:   Execute 'npx supabase status' para ver"
    echo "  Redis Password:      consultorai_dev_password"
}

# Menu de ajuda
show_help() {
    echo "Consultor.AI - Script de Desenvolvimento Local"
    echo ""
    echo "Uso: ./dev-setup.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start      Inicia todos os serviços"
    echo "  stop       Para todos os serviços"
    echo "  restart    Reinicia todos os serviços"
    echo "  logs       Mostra logs dos serviços"
    echo "  status     Mostra status dos serviços"
    echo "  clean      Remove volumes e limpa o ambiente"
    echo "  env        Cria arquivo .env.local"
    echo "  urls       Mostra URLs de acesso"
    echo "  help       Mostra esta mensagem"
    echo ""
    echo "Exemplos:"
    echo "  ./dev-setup.sh start    # Inicia ambiente completo"
    echo "  ./dev-setup.sh logs     # Monitora logs"
    echo "  ./dev-setup.sh clean    # Limpa e reseta tudo"
}

# Comando principal
main() {
    local command=${1:-help}

    case $command in
        start)
            check_dependencies
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        clean)
            clean_environment
            ;;
        env)
            create_env
            ;;
        urls)
            show_urls
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Comando desconhecido: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Executa
main "$@"
