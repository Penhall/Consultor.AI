#!/bin/bash

# ==================================
# Check Deployment Status
# ==================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
NAMESPACE="${NAMESPACE:-consultorai}"

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}Consultor.AI - Deployment Status${NC}"
echo -e "${GREEN}===================================${NC}"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
  echo -e "${RED}Error: kubectl is not installed${NC}"
  exit 1
fi

# Check namespace
if ! kubectl get namespace ${NAMESPACE} > /dev/null 2>&1; then
  echo -e "${RED}Error: Namespace '${NAMESPACE}' not found${NC}"
  exit 1
fi

# Pods
echo -e "\n${BLUE}━━━ Pods ━━━${NC}"
kubectl get pods -n ${NAMESPACE} -o wide

# Deployments
echo -e "\n${BLUE}━━━ Deployments ━━━${NC}"
kubectl get deployments -n ${NAMESPACE}

# Services
echo -e "\n${BLUE}━━━ Services ━━━${NC}"
kubectl get svc -n ${NAMESPACE}

# Ingress
echo -e "\n${BLUE}━━━ Ingress ━━━${NC}"
kubectl get ingress -n ${NAMESPACE}

# HPA
echo -e "\n${BLUE}━━━ Horizontal Pod Autoscaler ━━━${NC}"
if kubectl get hpa -n ${NAMESPACE} > /dev/null 2>&1; then
  kubectl get hpa -n ${NAMESPACE}
else
  echo -e "${YELLOW}No HPA configured${NC}"
fi

# PVC
echo -e "\n${BLUE}━━━ Persistent Volume Claims ━━━${NC}"
kubectl get pvc -n ${NAMESPACE}

# Resource Usage
echo -e "\n${BLUE}━━━ Resource Usage ━━━${NC}"
if kubectl top pods -n ${NAMESPACE} > /dev/null 2>&1; then
  kubectl top pods -n ${NAMESPACE}
else
  echo -e "${YELLOW}Metrics server not available${NC}"
fi

# Recent Events
echo -e "\n${BLUE}━━━ Recent Events ━━━${NC}"
kubectl get events -n ${NAMESPACE} --sort-by='.lastTimestamp' | tail -10

# Pod Health
echo -e "\n${BLUE}━━━ Pod Health ━━━${NC}"
UNHEALTHY=$(kubectl get pods -n ${NAMESPACE} --no-headers | grep -v "Running\|Completed" | wc -l)
if [ $UNHEALTHY -eq 0 ]; then
  echo -e "${GREEN}✓ All pods are healthy${NC}"
else
  echo -e "${RED}⚠ ${UNHEALTHY} pod(s) are not healthy${NC}"
  kubectl get pods -n ${NAMESPACE} | grep -v "Running\|Completed"
fi

echo -e "\n${GREEN}===================================${NC}"
