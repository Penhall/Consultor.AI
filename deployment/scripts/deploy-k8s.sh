#!/bin/bash

# ==================================
# Deploy to Kubernetes
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
MANIFESTS_DIR="deployment/kubernetes"

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}Deploying Consultor.AI to Kubernetes${NC}"
echo -e "${GREEN}===================================${NC}"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
  echo -e "${RED}Error: kubectl is not installed${NC}"
  exit 1
fi

# Check cluster connection
echo -e "\n${BLUE}Checking cluster connection...${NC}"
if ! kubectl cluster-info > /dev/null 2>&1; then
  echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
  exit 1
fi

CURRENT_CONTEXT=$(kubectl config current-context)
echo -e "${GREEN}✓ Connected to: ${CURRENT_CONTEXT}${NC}"

# Confirm deployment
echo -e "\n${YELLOW}You are about to deploy to:${NC}"
echo -e "  Cluster: ${CURRENT_CONTEXT}"
echo -e "  Namespace: ${NAMESPACE}"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${RED}Deployment cancelled${NC}"
  exit 0
fi

# Check if secrets exist
echo -e "\n${BLUE}Checking secrets...${NC}"
if ! kubectl get secret consultorai-secrets -n ${NAMESPACE} > /dev/null 2>&1; then
  echo -e "${RED}Error: Secret 'consultorai-secrets' not found in namespace '${NAMESPACE}'${NC}"
  echo -e "${YELLOW}Please create secrets first. See deployment/kubernetes/README.md${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Secrets found${NC}"

# Apply manifests
echo -e "\n${BLUE}Applying Kubernetes manifests...${NC}"

# Apply in specific order
MANIFESTS=(
  "00-namespace.yaml"
  "01-configmap.yaml"
  "02-secret.yaml"
  "03-redis-pvc.yaml"
  "04-redis-deployment.yaml"
  "05-app-deployment.yaml"
  "06-ingress.yaml"
  "07-hpa.yaml"
  "08-network-policy.yaml"
)

for manifest in "${MANIFESTS[@]}"; do
  if [ -f "${MANIFESTS_DIR}/${manifest}" ]; then
    echo -e "${YELLOW}Applying ${manifest}...${NC}"
    kubectl apply -f "${MANIFESTS_DIR}/${manifest}"
  fi
done

echo -e "\n${GREEN}✓ Manifests applied${NC}"

# Wait for deployments
echo -e "\n${BLUE}Waiting for deployments to be ready...${NC}"

echo -e "${YELLOW}Waiting for Redis...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/consultorai-redis -n ${NAMESPACE}

echo -e "${YELLOW}Waiting for App...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/consultorai-app -n ${NAMESPACE}

echo -e "${GREEN}✓ All deployments ready${NC}"

# Display status
echo -e "\n${GREEN}===================================${NC}"
echo -e "${GREEN}Deployment Complete${NC}"
echo -e "${GREEN}===================================${NC}"

echo -e "\n${BLUE}Pods:${NC}"
kubectl get pods -n ${NAMESPACE}

echo -e "\n${BLUE}Services:${NC}"
kubectl get svc -n ${NAMESPACE}

echo -e "\n${BLUE}Ingress:${NC}"
kubectl get ingress -n ${NAMESPACE}

echo -e "\n${YELLOW}To view logs:${NC}"
echo -e "  kubectl logs -f deployment/consultorai-app -n ${NAMESPACE}"

echo -e "\n${YELLOW}To check status:${NC}"
echo -e "  ./deployment/scripts/status.sh"
