#!/bin/bash

# Exit on any error encountered
set -e

# Define colors for pretty output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to log in green
log() {
  echo -e "${GREEN}$1${NC}"
}

# Step 1: Delete existing Kubernetes resources
log "Deleting existing Kubernetes resources..."
kubectl delete -f k8s/ --ignore-not-found=true
log "Resources deleted successfully."

# Step 2: Build Docker images
# Build Server
log "Building Docker image for the server..."
cd server
docker build -t cs590-group-5-server .
cd ..
log "Server image built successfully."

# Build UI
log "Building Docker image for the UI..."
cd ui
docker build -t cs590-group-5-ui .
cd ..
log "UI image built successfully."

# Step 3: Deploy on Kubernetes
log "Deploying on Kubernetes..."
kubectl create -f k8s/
log "Deployment completed successfully."

log "All operations completed successfully."