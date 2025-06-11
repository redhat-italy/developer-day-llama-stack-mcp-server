# Custom MCP Server for HR API Integration

This directory contains a custom Model Context Protocol (MCP) server that integrates with the HR Enterprise API, providing AI agents with access to employee data, vacation management, job postings, and performance analytics.

## Overview

The custom MCP server (`server.py`) provides comprehensive HR functionality including:
- **Employee Management**: Search, retrieve, and manage employee records
- **Vacation Management**: View balances, submit requests, track approvals
- **Job Management**: Browse postings, view details, track applications
- **Performance Management**: Access reviews and analytics

## Key Features

- Integrates with the HR Enterprise API via REST calls
- Handles authentication with X-API-Key headers
- Provides detailed error handling and logging
- Supports all major HR operations through 9 specialized tools

## Prerequisites

Before using the custom MCP server, make sure you have deployed the HR Enterprise API:

```bash
# Deploy the HR API first (if not already deployed)
helm install hr-api ../helm/hr-api \
  --set image.repository=quay.io/rh-aiservices-bu/sample-hr-app \
  --set image.tag=0.0.1

# Verify HR API is running
oc get pods -l app.kubernetes.io/name=hr-enterprise-api
oc get route hr-enterprise-api
```

## Local Development

### Setup Python environment

```bash
# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required dependencies
pip install -r requirements.txt
```

### Test locally

```bash
# Make the server executable
chmod +x server.py

# Set environment variables for local HR API
export HR_API_BASE_URL="http://localhost:3000"
export HR_API_KEY="test-api-key"

# Make sure HR API is running first
cd ../hr-api && npm start &
cd ../custom-mcp-server

# Run the MCP server directly (it will wait for JSON-RPC input)
python server.py
```

## Building and Pushing Container Image

### Build Container Image

Build for single architecture:
```bash
podman build -t custom-mcp-server:latest .
```

Build for multiple architectures (recommended for production):
```bash
# Build multi-arch image for AMD64 and ARM64
podman build --platform=linux/amd64,linux/arm64 -t custom-mcp-server:latest .

# Or build specific architecture
podman build --platform=linux/amd64 -t custom-mcp-server:amd64 .
podman build --platform=linux/arm64 -t custom-mcp-server:arm64 .

# For pushing multi-arch images to registry
podman manifest create custom-mcp-server:latest
podman build --platform=linux/amd64 -t custom-mcp-server:amd64 .
podman build --platform=linux/arm64 -t custom-mcp-server:arm64 .
podman manifest add custom-mcp-server:latest custom-mcp-server:amd64
podman manifest add custom-mcp-server:latest custom-mcp-server:arm64
podman manifest push custom-mcp-server:latest quay.io/your-org/custom-mcp-server:latest
```

### Push to Registry

```bash
# Set your variables
QUAY_USERNAME="your-username"
IMAGE_NAME="custom-mcp-server"
IMAGE_TAG="v1.0.0"

# Build the image
podman build -t quay.io/${QUAY_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} .

# Tag as latest
podman tag quay.io/${QUAY_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG} quay.io/${QUAY_USERNAME}/${IMAGE_NAME}:latest

# Login to Quay.io (you'll be prompted for credentials)
podman login quay.io

# Push the images
podman push quay.io/${QUAY_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
podman push quay.io/${QUAY_USERNAME}/${IMAGE_NAME}:latest

# Verify the push
echo "Image pushed to: quay.io/${QUAY_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
```

## Deploy to OpenShift

Once you have built and pushed your custom MCP server image:

```bash
# Deploy your custom MCP server using Helm
helm install custom-mcp-server ../helm/custom-mcp-server \
  --set image.repository=quay.io/rh-aiservices-bu/custom-mcp-server \
  --set image.tag=1.0.0 \
  --set hrApi.baseUrl="http://hr-enterprise-api:80"

# Check the deployment status
oc get pods -l app.kubernetes.io/name=custom-mcp-server

# View logs to ensure it's working
oc logs -l app.kubernetes.io/name=custom-mcp-server
```

## Available Tools

The MCP server provides the following tools for AI agents:

1. **get_employees** - Get list of employees with optional filtering
2. **get_employee** - Get detailed information about a specific employee
3. **get_vacation_requests** - Get vacation requests with filtering
4. **get_vacation_balance** - Get vacation balance for an employee
5. **submit_vacation_request** - Submit a new vacation request
6. **get_job_postings** - Get list of job postings with filtering
7. **get_job_details** - Get detailed job information
8. **get_performance_reviews** - Get performance reviews with filtering
9. **get_performance_analytics** - Get performance analytics and metrics

## Testing in the Playground

Once deployed, you can test the HR MCP server tools in the Llama Stack playground:

```bash
# Get the playground route URL
PLAYGROUND_URL=$(oc get route llama-stack-playground -o jsonpath='{.spec.host}')
echo "Playground URL: https://${PLAYGROUND_URL}"
```

Test with sample queries:
- "Show me all employees in the Engineering department"
- "What is the vacation balance for employee EMP001?"
- "Show me all open job postings in San Francisco"
- "Submit a vacation request for employee EMP001"

## Configuration

The MCP server uses the following environment variables:

- `HR_API_BASE_URL` - Base URL for the HR API (default: "http://hr-enterprise-api:80")
- `HR_API_KEY` - API key for authentication (loaded from secret in OpenShift)

## Troubleshooting

```bash
# Check MCP server status
oc get pods -l app.kubernetes.io/name=custom-mcp-server
oc logs -l app.kubernetes.io/name=custom-mcp-server

# Check HR API connectivity
oc exec -it deployment/custom-mcp-server -- curl http://hr-enterprise-api:80/health

# Check environment variables in MCP server
oc exec -it deployment/custom-mcp-server -- env | grep HR_API
```