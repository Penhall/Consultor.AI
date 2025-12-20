#!/bin/bash

#############################################
# Script Name: db-generate-types.sh
# Description: Generate TypeScript types from Supabase schema
# Author: Consultor.AI Team
# Date: 2025-12-17
#############################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}📝 Generating TypeScript types from database schema...${NC}"
echo ""

# Check if Supabase is running
if ! supabase status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase is not running. Starting...${NC}"
    supabase start
    echo ""
fi

# Generate types
echo -e "${GREEN}Generating types...${NC}"
supabase gen types typescript --local > src/types/database.ts

echo ""
echo -e "${GREEN}✅ Types generated successfully!${NC}"
echo -e "   📄 Output: src/types/database.ts"
