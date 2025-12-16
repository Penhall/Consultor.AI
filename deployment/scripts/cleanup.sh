#!/bin/bash

# ==================================
# Cleanup Deployment
# ==================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
NAMESPACE="${NAMESPACE:-consultorai}"

echo -e "${RED}===================================${NC}"
echo -e "${RED}WARNING: Cleanup Deployment${NC}"
echo -e "${RED}===================================${NC}"

echo -e "\n${YELLOW}This will DELETE:${NC}"
echo -e "  - All pods in namespace: ${NAMESPACE}"
echo -e "  - All services"
echo -e "  - All deployments"
echo -e "  - All persistent volume claims (DATA LOSS)"
echo -e "  - The namespace itself"

echo -e "\n${RED}THIS CANNOT BE UNDONE!${NC}"
read -p "Type 'DELETE' to confirm: " -r
echo

if [ "$REPLY" != "DELETE" ]; then
  echo -e "${GREEN}Cleanup cancelled${NC}"
  exit 0
fi

# Final confirmation
read -p "Are you absolutely sure? (yes/NO) " -r
echo

if [ "$REPLY" != "yes" ]; then
  echo -e "${GREEN}Cleanup cancelled${NC}"
  exit 0
fi

echo -e "\n${YELLOW}Deleting namespace ${NAMESPACE}...${NC}"
kubectl delete namespace ${NAMESPACE}

echo -e "\n${GREEN}✓ Cleanup complete${NC}"
echo -e "${YELLOW}Note: PersistentVolumes may need manual cleanup${NC}"
