#!/bin/bash

# ==================================
# Rollback Deployment
# ==================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NAMESPACE="${NAMESPACE:-consultorai}"
DEPLOYMENT="${1:-consultorai-app}"
REVISION="${2}"

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}Rollback Deployment${NC}"
echo -e "${GREEN}===================================${NC}"

# Check kubectl
if ! command -v kubectl &> /dev/null; then
  echo -e "${RED}Error: kubectl is not installed${NC}"
  exit 1
fi

# Show rollout history
echo -e "\n${BLUE}Rollout History for ${DEPLOYMENT}:${NC}"
kubectl rollout history deployment/${DEPLOYMENT} -n ${NAMESPACE}

# Confirm rollback
if [ -z "$REVISION" ]; then
  echo -e "\n${YELLOW}Rolling back to previous revision${NC}"
  read -p "Continue? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Rollback cancelled${NC}"
    exit 0
  fi

  echo -e "\n${BLUE}Rolling back...${NC}"
  kubectl rollout undo deployment/${DEPLOYMENT} -n ${NAMESPACE}
else
  echo -e "\n${YELLOW}Rolling back to revision ${REVISION}${NC}"
  read -p "Continue? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Rollback cancelled${NC}"
    exit 0
  fi

  echo -e "\n${BLUE}Rolling back...${NC}"
  kubectl rollout undo deployment/${DEPLOYMENT} -n ${NAMESPACE} --to-revision=${REVISION}
fi

# Wait for rollout
echo -e "\n${BLUE}Waiting for rollout to complete...${NC}"
kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE}

echo -e "\n${GREEN}✓ Rollback complete${NC}"

# Show new status
echo -e "\n${BLUE}Current Status:${NC}"
kubectl get pods -n ${NAMESPACE} -l app=${DEPLOYMENT}

echo -e "\n${YELLOW}To check logs:${NC}"
echo -e "  kubectl logs -f deployment/${DEPLOYMENT} -n ${NAMESPACE}"
