# Llama Stack with MCP Weather Server

Welcome to the Llama Stack with MCP Weather Server Kickstart!

Use this to quickly deploy Llama 3.2-3B on vLLM with Llama Stack and an MCP weather server in your OpenShift AI environment.

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

## Description

This kickstart provides a complete setup for deploying:
- Llama 3.2-3B model using vLLM on OpenShift AI
- Llama Stack for agent-based interactions
- MCP Weather Server for real-time weather data access

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
4. Combine all components to create weather-aware AI applications

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

This example was tested on Red Hat OpenShift 4.16.24 & Red Hat OpenShift AI v2.16.2.

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

### Deploy Llama 3.2-3B on vLLM

```bash
# Deploy Llama 3.2-3B using vLLM
oc apply -k kustomize/llama3.2-3b
```

### Deploy MCP Weather Server

```bash
# Deploy the MCP Weather Server
oc apply -k kustomize/mcp-weather
```

### Deploy Llama Stack

```bash
# Create ConfigMap from run-vllm.yaml
oc create configmap llama-stack-config --from-file=./files/run-vllm.yaml -n llama-stack-mcp-demo

# Deploy Llama Stack components
oc apply -k kustomize/llama-stack
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

