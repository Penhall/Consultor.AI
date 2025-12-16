#!/bin/bash

# ==================================
# View Application Logs
# ==================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NAMESPACE="${NAMESPACE:-consultorai}"
DEPLOYMENT="${1:-consultorai-app}"
FOLLOW="${2:--f}"

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}Viewing Logs: ${DEPLOYMENT}${NC}"
echo -e "${GREEN}===================================${NC}"

echo -e "\n${YELLOW}Press Ctrl+C to exit${NC}\n"

# Check if we should follow logs
if [ "$FOLLOW" = "-f" ] || [ "$FOLLOW" = "--follow" ]; then
  kubectl logs -f deployment/${DEPLOYMENT} -n ${NAMESPACE} --all-containers=true
else
  kubectl logs deployment/${DEPLOYMENT} -n ${NAMESPACE} --all-containers=true --tail=${FOLLOW}
fi
