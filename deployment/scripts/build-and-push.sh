#!/bin/bash

# ==================================
# Build and Push Docker Image
# ==================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="${DOCKER_REGISTRY:-your-registry.io}"
IMAGE_NAME="${IMAGE_NAME:-consultorai}"
VERSION="${1:-latest}"

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}Building Consultor.AI Docker Image${NC}"
echo -e "${GREEN}===================================${NC}"

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running${NC}"
  exit 1
fi

# Build production image
echo -e "\n${YELLOW}Building image: ${REGISTRY}/${IMAGE_NAME}:${VERSION}${NC}"
docker build \
  -t "${REGISTRY}/${IMAGE_NAME}:${VERSION}" \
  -t "${REGISTRY}/${IMAGE_NAME}:latest" \
  -f Dockerfile \
  .

echo -e "\n${GREEN}✓ Image built successfully${NC}"

# Ask for confirmation before pushing
read -p "Push to registry ${REGISTRY}? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "\n${YELLOW}Pushing to registry...${NC}"
  docker push "${REGISTRY}/${IMAGE_NAME}:${VERSION}"
  docker push "${REGISTRY}/${IMAGE_NAME}:latest"
  echo -e "\n${GREEN}✓ Image pushed successfully${NC}"
else
  echo -e "\n${YELLOW}Skipping push${NC}"
fi

echo -e "\n${GREEN}===================================${NC}"
echo -e "${GREEN}Build Complete${NC}"
echo -e "${GREEN}===================================${NC}"
echo -e "Image: ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
echo -e "Tag: ${REGISTRY}/${IMAGE_NAME}:latest"
