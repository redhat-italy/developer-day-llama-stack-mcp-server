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
- Sample HR application providing restful services to HR data e.g. vacation booking
- MCP Weather Server for real-time weather data access
- Custom MCP server providing access to the sample HR application


It's designed for environments where you want to:
- Serve Llama 3.2-3B efficiently using vLLM
- Enable LLMs to interact with external tools through Llama Stack
- Demonstrate real-world tool integration using the MCP HR server


## Architecture diagrams

![Llama Stack with MCP Servers Architecture](assets/images/architecture-diagram.png)

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
- HR MCP Server
- Llama Stack Playground


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
  - `get_vacation_balance` - Check employee vacation balances
  - `create_vacation_request` - Submit new vacation requests


3. **Test with sample queries**:


**Test vacation balance:**
```
What is the vacation balance for employee EMP001?
```


**Test vacation request:**
```
book some annual vacation time off for EMP001 for June 8th and 9th
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


### Option 2: Delete the entire project
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