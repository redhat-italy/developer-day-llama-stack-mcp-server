# MCP Server Creation (Llama Stack)

This kickstart demonstrates how to create and integrate a Model Context Protocol (MCP) server with Llama Stack. It provides a practical example of exposing custom services that can be invoked by agents within the Llama Stack environment. By following this guide, you'll learn how to register an MCP server and make agentic calls to retrieve real-time weather information.

To see how it's done, jump straight to [installation](#install).

## Table of contents

- [Description](#description)
- [See it in action](#see-it-in-action)
- [Architecture diagrams](#architecture-diagrams)
- [References](#references)
- [Requirements](#requirements)
- [Install](#install)

## Description

This kickstart provides a hands-on tutorial for integrating a simple weather MCP server with Llama Stack. It demonstrates how to:
- Deploy a Weather MCP server using Podman
- Register the server in Llama Stack as a toolgroup
- Query the weather service using natural language prompts through a Python agent

This setup enables you to expose real-world data to AI agents with minimal effort, demonstrating practical tool use using MCP and Llama Stack.

## See it in action

The kickstart includes a Python script that demonstrates how to:
1. Set up a Llama Stack agent with access to the weather toolgroup
2. Submit natural language prompts to query weather information
3. Process and display weather forecasts for specified locations

Example output shows detailed weather forecasts including temperature, wind conditions, and precipitation chances for multiple days.

## Architecture diagrams

*[Place architecture diagram in assets/images folder]*

## References

- [Llama Stack Documentation](https://rh-aiservices-bu.github.io/llama-stack-tutorial/)
- [Model Context Protocol (MCP) Tutorial](https://rh-aiservices-bu.github.io/llama-stack-tutorial/modules/elementary-02-mcp.html)

## Requirements

### Minimum hardware requirements

- Any system capable of running Podman containers
- Sufficient storage for container images and Python environment

### Required software

- Llama Stack server running
- Python 3.10 or higher
- Podman
- Python virtual environment
- Llama Stack Client SDK (version 0.2.2)

### Required permissions

- Local system access to run Podman containers
- Network access to run the MCP server and connect to Llama Stack

## Install

1. Ensure you have the prerequisites installed:
   ```bash
   # Install Python 3.10+ if not already installed
   # Set up and activate a Python virtual environment
   ```

2. Run the Weather MCP server using Podman:
   ```bash
   # For Intel Macs (AMD64)
   podman run -p 3001:3001 quay.io/rh-aiservices-bu/mcp-weather:0.1.0-amd64

   # For Apple Silicon Macs (ARM64/M1/M2/M3)
   podman run -p 3001:3001 quay.io/rh-aiservices-bu/mcp-weather:0.1.0
   ```

3. Register the MCP Server in Llama Stack:
   ```bash
   # For macOS
   curl -X POST -H "Content-Type: application/json" \
   --data '{ "provider_id" : "model-context-protocol", "toolgroup_id" : "mcp::weather", "mcp_endpoint" : { "uri" : "http://host.containers.internal:3001/sse"}}' \
   http://localhost:8321/v1/toolgroups
   ```

4. Install the Llama Stack Client SDK:
   ```bash
   pip install llama-stack-client==0.2.2
   ```

5. Create and run the test script:
   ```bash
   # Create test_weather.py with the provided code
   python test_weather.py
   ```

The server will be available at http://localhost:3001/sse and ready to process weather queries through Llama Stack.
