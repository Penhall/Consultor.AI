#!/bin/bash

# ==================================
# Update Deployment with New Image
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
DEPLOYMENT="consultorai-app"
CONTAINER="app"
IMAGE="${1}"

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}Update Deployment${NC}"
echo -e "${GREEN}===================================${NC}"

# Check if image is provided
if [ -z "$IMAGE" ]; then
  echo -e "${RED}Error: Image not specified${NC}"
  echo -e "Usage: $0 <image:tag>"
  echo -e "Example: $0 your-registry/consultorai:v2.0.0"
  exit 1
fi

# Check kubectl
if ! command -v kubectl &> /dev/null; then
  echo -e "${RED}Error: kubectl is not installed${NC}"
  exit 1
fi

# Show current image
echo -e "\n${BLUE}Current Image:${NC}"
CURRENT_IMAGE=$(kubectl get deployment ${DEPLOYMENT} -n ${NAMESPACE} -o jsonpath='{.spec.template.spec.containers[0].image}')
echo -e "  ${CURRENT_IMAGE}"

echo -e "\n${YELLOW}New Image:${NC}"
echo -e "  ${IMAGE}"

# Confirm update
read -p "Continue with update? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Update cancelled${NC}"
  exit 0
fi

# Update image
echo -e "\n${BLUE}Updating deployment...${NC}"
kubectl set image deployment/${DEPLOYMENT} ${CONTAINER}=${IMAGE} -n ${NAMESPACE}

# Watch rollout
echo -e "\n${BLUE}Rolling out new version...${NC}"
kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE}

echo -e "\n${GREEN}✓ Update complete${NC}"

# Show status
echo -e "\n${BLUE}New Pods:${NC}"
kubectl get pods -n ${NAMESPACE} -l app=${DEPLOYMENT}

# Save rollout history
echo -e "\n${BLUE}Rollout History:${NC}"
kubectl rollout history deployment/${DEPLOYMENT} -n ${NAMESPACE}

echo -e "\n${YELLOW}To rollback:${NC}"
echo -e "  ./deployment/scripts/rollback.sh ${DEPLOYMENT}"

echo -e "\n${YELLOW}To check logs:${NC}"
echo -e "  kubectl logs -f deployment/${DEPLOYMENT} -n ${NAMESPACE}"
