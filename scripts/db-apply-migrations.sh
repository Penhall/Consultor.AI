#!/bin/bash

#############################################
# Script Name: db-apply-migrations.sh
# Description: Apply Supabase migrations to local database
# Author: Consultor.AI Team
# Date: 2025-12-17
#############################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔄 Applying Supabase migrations...${NC}"
echo ""

# Check if Supabase is running
if ! supabase status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase is not running${NC}"
    echo -e "${YELLOW}Starting Supabase...${NC}"
    supabase start
    echo ""
fi

# Apply migrations
echo -e "${GREEN}Applying migrations...${NC}"
supabase db push

echo ""
echo -e "${GREEN}✅ Migrations applied successfully!${NC}"
