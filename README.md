# Llama Stack with MCP Server

Welcome to the Llama Stack with MCP Server Kickstart!

Use this to quickly deploy Llama 3.2-3B on vLLM with Llama Stack and an MCP server in your OpenShift AI environment.

To see how it's done, jump straight to [installation](#install).

## Table of Contents

1. [Description](#description)
2. [See it in action](#see-it-in-action)
3. [Architecture diagrams](#architecture-diagrams)
4. [References](#references)
5. [Prerequisites](#prerequisites)
   - [Minimum hardware requirements](#minimum-hardware-requirements)
   - [Required software](#required-software)
   - [Required permissions](#required-permissions)
6. [Install](#install)
   - [Clone the repository](#clone-the-repository)
   - [Create the project](#create-the-project)
   - [Deploy Llama 3.2-3B on vLLM](#deploy-llama-32-3b-on-vllm)
   - [Deploy Llama Stack](#deploy-llama-stack)
   - [Deploy MCP Weather Server](#deploy-mcp-weather-server)
7. [Test](#test)
8. [Creating a Custom Python MCP Server](#creating-a-custom-python-mcp-server)
   - [Setup Python environment](#setup-python-environment)
   - [Create the MCP server](#create-the-mcp-server)
   - [Test locally](#test-locally)
9. [Building and Pushing Container Image](#building-and-pushing-container-image)
   - [Create Containerfile](#create-containerfile)
   - [Build and push to Quay.io](#build-and-push-to-quayio)
10. [Deploy Custom MCP Server to OpenShift](#deploy-custom-mcp-server-to-openshift)
   - [Deploy to OpenShift](#deploy-to-openshift)
11. [Cleanup](#cleanup)

## Description

This kickstart provides a complete setup for deploying:
- Llama 3.2-3B model using vLLM on OpenShift AI
- Llama Stack for agent-based interactions
- MCP Weather Server for real-time weather data access
- Custom MCP servers using Podman and Containerfile with UBI base images
- Quay.io integration with robot accounts for secure container registry access

It's designed for environments where you want to:
- Serve Llama 3.2-3B efficiently using vLLM
- Enable LLMs to interact with external tools through Llama Stack
- Demonstrate real-world tool integration using the MCP Weather Server
- Create a complete AI agent system with weather data capabilities

## See it in action

The deployment enables you to:
1. Query the Llama 3.2-3B model directly through vLLM
2. Use Llama Stack to create AI agents
3. Access real-time weather data through the MCP Weather Server
4. Test the integration with the Llama Stack playground

## Architecture diagrams

*[Place architecture diagram in assets/images folder]*

## References

- [Llama Stack Documentation](https://rh-aiservices-bu.github.io/llama-stack-tutorial/)
- [Model Context Protocol (MCP) Tutorial](https://rh-aiservices-bu.github.io/llama-stack-tutorial/modules/elementary-02-mcp.html)
- [vLLM Documentation](https://github.com/vllm-project/vllm)
- [Red Hat OpenShift AI Documentation](https://access.redhat.com/documentation/en-us/red_hat_openshift_ai)


## Prerequisites

### Minimum hardware requirements

- 1 GPU required (NVIDIA L40, A10, or similar)
- 8+ vCPUs
- 24+ GiB RAM
- Storage: 30Gi minimum in PVC (larger models may require more)

### Required software

- Red Hat OpenShift
- Red Hat OpenShift AI 2.16+


### Required permissions

- Standard user. No elevated cluster permissions required

## Install

**Please note before you start**

This example was tested on Red Hat OpenShift 4.17.30 & Red Hat OpenShift AI v2.19.0.

All components are deployed using Helm charts located in the `helm/` directory:
- `helm/llama3.2-3b/` - Llama 3.2-3B model on vLLM
- `helm/llama-stack/` - Llama Stack server
- `helm/mcp-weather/` - Weather MCP server
- `helm/llama-stack-playground/` - Playground UI
- `helm/custom-mcp-server/` - Custom HR API MCP server
- `helm/hr-api/` - HR Enterprise API
- `helm/llama-stack-mcp/` - Umbrella chart for single-command deployment

**Custom MCP Server**: See `custom-mcp-server/` directory for building and deploying a custom MCP server that integrates with the HR API.

### Clone the repository

```bash
git clone https://github.com/rh-ai-kickstart/llama-stack-mcp-server.git && \
    cd llama-stack-mcp-server/
```

### Create the project

```bash
PROJECT="llama-stack-mcp-demo"
oc new-project ${PROJECT}
```

## Single Command Installation (Recommended)

Deploy the complete Llama Stack with MCP servers using the umbrella chart:

```bash

# Update Helm dependencies
helm dependency update ./helm/llama-stack-mcp

# Update build dependencies
helm dependency build ./helm/llama-stack-mcp

# Deploy everything with a single command
helm install llama-stack-mcp ./helm/llama-stack-mcp 
```

This will deploy all components including:
- Llama 3.2-3B model on vLLM
- Llama Stack server with automatic configuration
- MCP Weather Server
- HR Enterprise API  
- Llama Stack Playground


## Individual Component Installation (Advanced)

For advanced users who want granular control, you can deploy components individually:

### Deploy Llama 3.2-3B on vLLM

```bash
# Deploy Llama 3.2-3B using Helm
helm install llama3-2-3b ./helm/llama3.2-3b \
  --set model.name="meta-llama/Llama-3.2-3B-Instruct" \
  --set resources.limits."nvidia\.com/gpu"=1 \
  --set nodeSelector."nvidia\.com/gpu\.present"="true"
```

### Deploy MCP Weather Server

```bash


# Deploy the MCP Weather Server using Helm
helm install mcp-weather ./helm/mcp-weather 
```

### Deploy Llama Stack

```bash
# Deploy Llama Stack using Helm
helm install llama-stack ./helm/llama-stack \
  --set inference.endpoints[0].url="http://llama3-2-3b:80/v1" \
  --set mcpServers[0].uri="http://mcp-weather:80" 
```

### Deploy the playground
```bash
# Deploy the Llama Stack playground using Helm
helm install llama-stack-playground ./helm/llama-stack-playground \
  --set playground.llamaStackUrl="http://llama-stack:80"
```

### (Optional) Deploy your custom HR API MCP server

If you have created a custom MCP server following the instructions above:

```bash
# First deploy the HR API (if not already deployed)
helm install hr-api ./helm/hr-api \
  --set image.repository=quay.io/rh-aiservices-bu/sample-hr-app \
  --set image.tag=0.0.1

# Create secret for HR API access
oc create secret generic hr-api-secret \
  --from-literal=api-key="hr-api-production-key-change-me"

```

## Test

1. Get the Llama Stack playground route:
```bash
oc get route llama-stack-playground -n llama-stack-mcp-demo
```

2. Open the playground URL in your browser (it will look something like `https://llama-stack-playground-llama-stack-mcp-demo.apps.openshift-cluster.company.com`)

3. In the playground:
   - Click on the "Tools" tab
   - Select "Weather MCP Server" from the available tools
   - In the chat interface, type: "What's the weather in New York?"

4. You should receive a response similar to:
```
🛠 Using "getforecast" tool:

The current weather in New York is mostly sunny with a temperature of 75°F and a gentle breeze coming from the southwest at 7 mph. There is a chance of showers and thunderstorms this afternoon. Tonight, the temperature will drop to 66°F with a wind coming from the west at 9 mph. The forecast for the rest of the week is mostly sunny with temperatures ranging from 69°F to 85°F. There is a slight chance of showers and thunderstorms on Thursday and Friday nights.
```

This confirms that the Llama Stack is successfully communicating with the MCP Weather Server and can process weather-related queries.

## Creating a Custom Python MCP Server

This section guides you through creating a Python-based MCP (Model Context Protocol) server that integrates with the HR Enterprise API, providing AI agents with access to employee data, vacation management, job postings, and performance analytics.

### Prerequisites

Before creating the MCP server, make sure you have deployed the HR Enterprise API:

```bash
# Deploy the HR API first (if not already deployed)
helm install hr-api ./helm/hr-api \
  --set image.repository=quay.io/rh-aiservices-bu/sample-hr-app \
  --set image.tag=0.0.1

# Verify HR API is running
oc get pods -l app.kubernetes.io/name=hr-enterprise-api
oc get route hr-enterprise-api
```

### Setup Python environment

First, create a new directory for your MCP server and set up the Python environment:

```bash
mkdir my-custom-mcp-server
cd my-custom-mcp-server

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required dependencies
pip install mcp fastmcp uvicorn[standard]
```

### Create the MCP server

Copy the pre-built HR API MCP server from the repository:

```bash
# Copy the custom MCP server code
cp files/custom-mcp-server.py server.py
```

The MCP server (`files/custom-mcp-server.py`) provides comprehensive HR functionality including:
- **Employee Management**: Search, retrieve, and manage employee records
- **Vacation Management**: View balances, submit requests, track approvals
- **Job Management**: Browse postings, view details, track applications
- **Performance Management**: Access reviews and analytics

Key features:
- Integrates with the HR Enterprise API via REST calls
- Handles authentication with X-API-Key headers
- Provides detailed error handling and logging
- Supports all major HR operations through 9 specialized tools

Create a `requirements.txt` file:

```text
mcp>=1.0.0
aiohttp>=3.9.0
fastmcp>=0.4.0
uvicorn[standard]>=0.24.0
```

## Building and Pushing Container Image

### Create Containerfile

Create a `Containerfile` in your MCP server directory:

```containerfile
FROM registry.access.redhat.com/ubi9/python-311:latest

# Set working directory
WORKDIR /app

# Install system dependencies
RUN microdnf update -y && \
    microdnf install -y \
    gcc \
    python3-devel \
    && microdnf clean all

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY server.py .

# Create non-root user for OpenShift
RUN groupadd -r mcpuser && useradd -r -g mcpuser -u 1001 mcpuser
RUN chown -R mcpuser:mcpuser /app
USER 1001

# Expose port (if needed for HTTP mode)
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Run the server
CMD ["python", "server.py"]
```

Create a `.containerignore` file:

```text
venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.git/
.gitignore
test_server.py
README.md
.DS_Store
```

### Setup Quay.io Repository

Before building and pushing your container image, you need to set up a Quay.io repository and robot account:

#### Create Quay.io Repository

1. **Sign up/Login to Quay.io**:
   - Go to [https://quay.io](https://quay.io)
   - Sign up for a new account or login with your existing account

2. **Create a new repository**:
   - Click the "+" button in the top right corner
   - Select "New Repository"
   - Enter repository name: `custom-mcp-server` (or your preferred name)
   - Choose visibility: Public or Private (based on your needs)
   - Click "Create Public Repository" or "Create Private Repository"

#### Create Robot Account

3. **Create a robot account for automated access**:
   - Go to your repository settings
   - Click on the "Robot Accounts" tab
   - Click "Create Robot Account"
   - Enter a name like `mcp-server-builder`
   - Select permissions: "Write" (this includes read and write access)
   - Click "Create robot account"

4. **Save robot credentials**:
   - Copy the robot account username (format: `username+robotname`)
   - Copy the robot account token/password
   - Store these securely - you'll need them for authentication

5. **Test robot account access** (optional):
   ```bash
   # Login using robot account
   podman login quay.io
   # When prompted, use:
   # Username: your-username+mcp-server-builder
   # Password: [robot-token]
   ```

### Build and push to Quay.io

Build and push your container image to your Quay.io registry:

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

**Note**: Make sure your Quay.io repository is configured with the appropriate visibility settings (public/private) according to your needs.

## Deploy Custom MCP Server to OpenShift

### Create deployment files

The following OpenShift YAML files are provided in the `kustomize/custom-mcp-server/` directory:

#### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: custom-mcp-server
  labels:
    app: custom-mcp-server
    component: mcp-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: custom-mcp-server
  template:
    metadata:
      labels:
        app: custom-mcp-server
        component: mcp-server
    spec:
      containers:
      - name: custom-mcp-server
        image: quay.io/your-username/custom-mcp-server:latest
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: PYTHONUNBUFFERED
          value: "1"
        - name: PYTHONPATH
          value: "/app"
        - name: HR_API_BASE_URL
          value: "http://hr-enterprise-api:80"
        - name: HR_API_KEY
          valueFrom:
            secretKeyRef:
              name: hr-api-secret
              key: api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
            - ALL
          runAsNonRoot: true
          runAsUser: 1000
          runAsGroup: 1000
```

#### service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: custom-mcp-server
  labels:
    app: custom-mcp-server
    component: mcp-server
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: 8000
    protocol: TCP
    name: http
  selector:
    app: custom-mcp-server
```

#### route.yaml
```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: custom-mcp-server
  labels:
    app: custom-mcp-server
    component: mcp-server
spec:
  to:
    kind: Service
    name: custom-mcp-server
  port:
    targetPort: http
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
```

#### kustomization.yaml
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

metadata:
  name: custom-mcp-server

resources:
- deployment.yaml
- service.yaml
- route.yaml
- configmap.yaml

commonLabels:
  app.kubernetes.io/name: custom-mcp-server
  app.kubernetes.io/component: mcp-server
  app.kubernetes.io/part-of: llama-stack-mcp-demo

images:
- name: quay.io/your-username/custom-mcp-server
  newTag: latest
```

### Deploy to OpenShift

Deploy your custom HR API MCP server to OpenShift using Helm:

```bash
# Ensure you're in the correct project
oc project llama-stack-mcp-demo

# First, make sure HR API is deployed (if not already)
helm install hr-api ./helm/hr-api \
  --set image.repository=quay.io/rh-aiservices-bu/sample-hr-app \
  --set image.tag=0.0.1

# Create secret for HR API access
oc create secret generic hr-api-secret \
  --from-literal=api-key="hr-api-production-key-change-me"

# Deploy the custom MCP server using Helm
helm install custom-mcp-server ./helm/custom-mcp-server \
  --set image.repository=quay.io/rh-aiservices-bu/custom-mcp-server \
  --set image.tag=1.0.0 \
  --set hrApi.baseUrl="http://hr-enterprise-api:80"

# Check the deployment status
oc get pods -l app.kubernetes.io/name=custom-mcp-server

# Wait for the pod to be ready
oc wait --for=condition=Ready pod -l app.kubernetes.io/name=custom-mcp-server --timeout=300s

# Get the service endpoint
oc get svc -l app.kubernetes.io/name=custom-mcp-server

# Get the external route
oc get route -l app.kubernetes.io/name=custom-mcp-server

# View logs to ensure it's working
oc logs -l app.kubernetes.io/name=custom-mcp-server
```

### Register Custom MCP Server with Llama Stack

Use the Llama Stack CLI to register your custom MCP server with the running Llama Stack instance:

1. **Install Llama Stack CLI** (if not already installed):

```bash
# Install the Llama Stack CLI
pip install llama-stack-client
```

2. **Get the Llama Stack endpoint**:

```bash
# Get the Llama Stack service endpoint
LLAMA_STACK_URL=$(oc get route llama-stack -o jsonpath='{.spec.host}')
echo "Llama Stack URL: https://${LLAMA_STACK_URL}"
```

3. **Register the custom MCP server**:

```bash
# Set the Llama Stack endpoint
export LLAMA_STACK_ENDPOINT="https://${LLAMA_STACK_URL}"

# Register the HR API MCP server using the CLI
llama-stack-client mcp register \
  --name "hr-api-tools" \
  --uri "http://custom-mcp-server:8000" \
  --description "HR API MCP server with employee, vacation, job, and performance tools"

# Verify registration
llama-stack-client mcp list
```

4. **Alternative: Register via API call**:

If the CLI method doesn't work, you can register directly via API:

```bash
# Register the HR API MCP server via REST API
curl -X POST "https://${LLAMA_STACK_URL}/v1/mcp/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "hr-api-tools",
    "uri": "http://custom-mcp-server:8000",
    "description": "HR API MCP server with employee, vacation, job, and performance tools"
  }'

# List registered MCP servers
curl -X GET "https://${LLAMA_STACK_URL}/v1/mcp/list"
```

### Test HR API MCP Server in Playground

Test your HR API MCP server integration using the Llama Stack playground:

1. **Access the playground**:

```bash
# Get the playground route URL
PLAYGROUND_URL=$(oc get route llama-stack-playground -o jsonpath='{.spec.host}')
echo "Playground URL: https://${PLAYGROUND_URL}"

# Open in browser or visit manually
echo "Visit: https://${PLAYGROUND_URL}"
```

2. **Test HR API MCP server tools**:

In the playground interface:

- **Navigate to Tools**: Click on the "Tools" tab
- **Verify availability**: Look for your HR API MCP server tools:
  - `get_employees` - List employees with filtering options
  - `get_employee` - Get detailed employee information
  - `get_vacation_requests` - View vacation requests
  - `get_vacation_balance` - Check employee vacation balances
  - `submit_vacation_request` - Submit new vacation requests
  - `get_job_postings` - Browse available job postings
  - `get_job_details` - Get detailed job information
  - `get_performance_reviews` - View performance reviews
  - `get_performance_analytics` - Get performance metrics

3. **Test with sample queries**:

**Test employee lookup:**
```
Show me all employees in the Engineering department
```

**Test specific employee details:**
```
Get details for employee ID 1
```

**Test vacation balance:**
```
What is the vacation balance for employee EMP001?
```

**Test job postings:**
```
Show me all open job postings in San Francisco
```

**Test vacation request:**
```
Submit a vacation request for employee EMP001 for annual leave from 2024-08-01 to 2024-08-05 (5 days) for summer vacation
```

**Test performance analytics:**
```
Show me the current performance analytics for the company
```

4. **Troubleshoot if needed**:

```bash
# Check custom MCP server and HR API status
oc get pods -l app=custom-mcp-server
oc get pods -l app.kubernetes.io/name=hr-enterprise-api
oc logs -l app=custom-mcp-server
oc logs -l app.kubernetes.io/name=hr-enterprise-api

# Verify MCP server registration
llama-stack-client mcp list

# Test connectivity between services
oc exec -it deployment/llama-stack -- curl http://custom-mcp-server:8000/health
oc exec -it deployment/custom-mcp-server -- curl http://hr-enterprise-api:80/health

# Check environment variables in MCP server
oc exec -it deployment/custom-mcp-server -- env | grep HR_API
```

### Verification

Verify that your custom MCP server is working correctly:

```bash
# Check all pods are running
oc get pods

# Check the custom MCP server logs
oc logs -l app=custom-mcp-server

# Test the service connectivity
oc exec -it deployment/llama-stack -- curl http://custom-mcp-server:8000/health

# Get the route URL for external access
ROUTE_URL=$(oc get route custom-mcp-server -o jsonpath='{.spec.host}')
echo "Custom MCP Server URL: https://${ROUTE_URL}"
```

## Cleanup

To remove all components from OpenShift:

### Option 1: Remove umbrella chart (if using single command installation)
```bash
# Remove the complete deployment
helm uninstall llama-stack-mcp
```

### Option 2: Remove individual Helm releases (if using individual installation)
```bash
# Remove individual components
helm uninstall llama-stack-playground
helm uninstall llama-stack
helm uninstall mcp-weather
helm uninstall llama3-2-3b
helm uninstall custom-mcp-server  # if deployed
helm uninstall hr-api            # if deployed

# Remove secrets
oc delete secret weather-api-secret hr-api-secret
```

### Option 3: Delete the entire project
```bash
# Delete the project and all its resources
oc delete project llama-stack-mcp-demo
```

This will remove:
- Llama 3.2-3B vLLM deployment
- Llama Stack services and playground
- MCP Weather Server
- Custom MCP Server (if deployed)
- HR Enterprise API (if deployed)
- All associated ConfigMaps, Services, Routes, and Secrets

