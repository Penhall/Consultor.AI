#!/bin/bash

#############################################
# Script Name: db-seed.sh
# Description: Apply development seeds to database
# Author: Consultor.AI Team
# Date: 2025-12-17
#############################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🌱 Seeding database with development data...${NC}"
echo ""

# Check if Supabase is running
if ! supabase status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase is not running. Starting...${NC}"
    supabase start
    echo ""
fi

# Get database connection string
DB_URL=$(supabase status | grep "DB URL" | awk '{print $3}')

if [ -z "$DB_URL" ]; then
    echo -e "${RED}❌ Could not get database URL${NC}"
    exit 1
fi

# Apply seed file
echo -e "${GREEN}Applying seed file...${NC}"
psql "$DB_URL" -f supabase/seed/dev_seed.sql

echo ""
echo -e "${GREEN}✅ Database seeded successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Important:${NC}"
echo -e "   1. Create a test user in Supabase Studio (http://localhost:54323)"
echo -e "   2. Email: demo@consultor.ai"
echo -e "   3. Password: Demo@123456"
echo -e "   4. Update supabase/seed/dev_seed.sql with the user_id"
echo -e "   5. Re-run this script"
