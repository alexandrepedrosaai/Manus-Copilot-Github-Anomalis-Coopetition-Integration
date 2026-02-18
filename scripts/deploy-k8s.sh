#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-manus-copilot}
DEPLOYMENT_DIR="deployments/kubernetes"

echo -e "${GREEN}🚀 Deploying Manus Copilot Integration to Kubernetes${NC}"
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig.${NC}"
    exit 1
fi

# Create namespace if it doesn't exist
echo -e "${YELLOW}📦 Creating namespace: ${NAMESPACE}${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Check if secrets file exists
if [ ! -f "${DEPLOYMENT_DIR}/secrets.yaml" ]; then
    echo -e "${YELLOW}⚠️  secrets.yaml not found. Creating from template...${NC}"
    if [ -f "${DEPLOYMENT_DIR}/secrets.yaml.template" ]; then
        cp "${DEPLOYMENT_DIR}/secrets.yaml.template" "${DEPLOYMENT_DIR}/secrets.yaml"
        echo -e "${RED}❌ Please edit ${DEPLOYMENT_DIR}/secrets.yaml with your actual secrets before deploying.${NC}"
        exit 1
    else
        echo -e "${RED}❌ Template file not found. Please create secrets.yaml manually.${NC}"
        exit 1
    fi
fi

# Apply secrets
echo -e "${YELLOW}🔐 Applying secrets...${NC}"
kubectl apply -f ${DEPLOYMENT_DIR}/secrets.yaml -n ${NAMESPACE}

# Apply deployment
echo -e "${YELLOW}🚢 Deploying application...${NC}"
kubectl apply -f ${DEPLOYMENT_DIR}/deployment.yaml -n ${NAMESPACE}

# Apply service
echo -e "${YELLOW}🌐 Creating service...${NC}"
kubectl apply -f ${DEPLOYMENT_DIR}/service.yaml -n ${NAMESPACE}

# Apply HPA
echo -e "${YELLOW}📊 Configuring auto-scaling...${NC}"
kubectl apply -f ${DEPLOYMENT_DIR}/hpa.yaml -n ${NAMESPACE}

# Wait for deployment to be ready
echo -e "${YELLOW}⏳ Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/manus-copilot-server -n ${NAMESPACE} --timeout=300s

# Get service information
echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo -e "${YELLOW}Service Information:${NC}"
kubectl get service manus-copilot-service -n ${NAMESPACE}

echo ""
echo -e "${YELLOW}Pod Status:${NC}"
kubectl get pods -n ${NAMESPACE} -l app=manus-copilot

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "To view logs, run:"
echo "  kubectl logs -f -l app=manus-copilot -n ${NAMESPACE}"
echo ""
echo "To access the service:"
echo "  kubectl port-forward service/manus-copilot-service 8080:80 -n ${NAMESPACE}"
