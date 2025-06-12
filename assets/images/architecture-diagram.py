#!/usr/bin/env python3
"""
Generate architecture diagram for Llama Stack MCP Server project.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Ellipse, Rectangle
import numpy as np

# Create figure and axis with RAG-style proportions
fig, ax = plt.subplots(1, 1, figsize=(14, 10))
ax.set_xlim(0, 14)
ax.set_ylim(0, 10)
ax.axis('off')

# RAG-style color scheme - primarily red and white
PRIMARY_RED = '#FF0000'
STROKE_WIDTH = 2
TEXT_COLOR = '#000000'
FILL_COLOR = '#FFFFFF'

# Helper function to create rectangles with red borders
def create_rect(ax, x, y, width, height, text, fontsize=10, dashed=False):
    linestyle = '--' if dashed else '-'
    rect = Rectangle((x, y), width, height, 
                    facecolor=FILL_COLOR, 
                    edgecolor=PRIMARY_RED, 
                    linewidth=STROKE_WIDTH,
                    linestyle=linestyle)
    ax.add_patch(rect)
    ax.text(x + width/2, y + height/2, text, 
            ha='center', va='center', fontsize=fontsize, 
            color=TEXT_COLOR, weight='normal')

# Helper function to create ellipses with red borders  
def create_ellipse(ax, x, y, width, height, text, fontsize=10):
    ellipse = Ellipse((x + width/2, y + height/2), width, height,
                     facecolor=FILL_COLOR,
                     edgecolor=PRIMARY_RED,
                     linewidth=STROKE_WIDTH)
    ax.add_patch(ellipse)
    ax.text(x + width/2, y + height/2, text,
            ha='center', va='center', fontsize=fontsize,
            color=TEXT_COLOR, weight='normal')

# Helper function to create cylinders (databases)
def create_cylinder(ax, x, y, width, height, text, fontsize=10):
    # Main cylinder body
    rect = Rectangle((x, y + height*0.1), width, height*0.8,
                    facecolor=FILL_COLOR,
                    edgecolor=PRIMARY_RED,
                    linewidth=STROKE_WIDTH)
    ax.add_patch(rect)
    
    # Top ellipse
    top_ellipse = Ellipse((x + width/2, y + height*0.9), width, height*0.2,
                         facecolor=FILL_COLOR,
                         edgecolor=PRIMARY_RED,
                         linewidth=STROKE_WIDTH)
    ax.add_patch(top_ellipse)
    
    # Bottom ellipse
    bottom_ellipse = Ellipse((x + width/2, y + height*0.1), width, height*0.2,
                           facecolor=FILL_COLOR,
                           edgecolor=PRIMARY_RED,
                           linewidth=STROKE_WIDTH)
    ax.add_patch(bottom_ellipse)
    
    ax.text(x + width/2, y + height/2, text,
            ha='center', va='center', fontsize=fontsize,
            color=TEXT_COLOR, weight='normal')

# Helper function to create arrows
def create_arrow(ax, start, end, style='->', linewidth=2):
    ax.annotate('', xy=end, xytext=start,
                arrowprops=dict(arrowstyle=style, color=PRIMARY_RED, lw=linewidth))

# Title
ax.text(7, 9.5, 'Llama Stack with MCP Servers Architecture', 
        ha='center', va='center', fontsize=16, weight='bold', color=TEXT_COLOR)

# Input Layer (left side)
create_ellipse(ax, 0.5, 7.5, 2, 1, 'User\nRequest', fontsize=10)

# UI Layer
create_rect(ax, 3.5, 7.5, 2.5, 1, 'Llama Stack\nPlayground\n(Streamlit)', fontsize=9)

# Core Orchestration Layer
create_rect(ax, 7, 7, 2.5, 1.5, 'Llama Stack\nServer\n(port 8001)', fontsize=10)

# Model Layer
create_rect(ax, 11, 7.5, 2.5, 1, 'Llama 3.2-3B\nvLLM/KServe', fontsize=9)

# MCP Servers (positioned below Llama Stack for vertical alignment)
create_rect(ax, 6, 5, 2.2, 1, 'Weather\nMCP Server\n(port 3001)', fontsize=9)
create_rect(ax, 8.5, 5, 2.2, 1, 'HR Tools\nMCP Server\n(port 8000)', fontsize=9)

# External APIs/Services (positioned at same level as MCP servers)
create_cylinder(ax, 1, 5, 2, 1, 'Weather\nService', fontsize=8)
create_cylinder(ax, 12.5, 5, 1.5, 1, 'HR Enterprise\nAPI\n(Node.js)', fontsize=7)

# Infrastructure Layer (bottom)
create_rect(ax, 1, 2, 12, 1.5, 'OpenShift / Kubernetes Infrastructure\nPods • Services • Routes • InferenceService • ServingRuntime', fontsize=10, dashed=True)

# Data Flow Arrows
# User to Playground
create_arrow(ax, (2.5, 8), (3.5, 8))

# Playground to Llama Stack
create_arrow(ax, (6, 8), (7, 8))

# Llama Stack to Model
create_arrow(ax, (9.5, 8), (11, 8))

# Llama Stack to MCP Servers (vertical connections)
create_arrow(ax, (7.8, 7), (7.1, 6))
create_arrow(ax, (8.5, 7), (9.6, 6))

# MCP Servers to External APIs (horizontal connections at same level)
create_arrow(ax, (6, 5.5), (3, 5.5))
create_arrow(ax, (10.7, 5.5), (12.5, 5.5))

# Add protocol labels along arrows
ax.text(3, 8.3, 'HTTP', ha='center', fontsize=8, color=PRIMARY_RED, style='italic')
ax.text(6.5, 8.3, 'WebSocket', ha='center', fontsize=8, color=PRIMARY_RED, style='italic')
ax.text(10.2, 8.3, 'OpenAI API', ha='center', fontsize=8, color=PRIMARY_RED, style='italic')
ax.text(7.5, 6.5, 'SSE/MCP', ha='center', fontsize=8, color=PRIMARY_RED, style='italic')
ax.text(4.5, 5.8, 'REST API', ha='center', fontsize=8, color=PRIMARY_RED, style='italic')
ax.text(11.6, 5.8, 'REST API', ha='center', fontsize=8, color=PRIMARY_RED, style='italic')

# Add component descriptions (bottom section)
ax.text(1, 1.5, 'Key Technologies:', fontsize=11, weight='bold', color=TEXT_COLOR)
ax.text(1, 1.2, '• Model Context Protocol (MCP): Tool integration framework', fontsize=9, color=TEXT_COLOR)
ax.text(1, 0.9, '• Server-Sent Events (SSE): Real-time communication', fontsize=9, color=TEXT_COLOR)
ax.text(1, 0.6, '• vLLM: High-performance LLM inference engine', fontsize=9, color=TEXT_COLOR)
ax.text(1, 0.3, '• Helm Charts: Kubernetes deployment automation', fontsize=9, color=TEXT_COLOR)

# Tool capabilities (right section)
ax.text(8.5, 1.5, 'Available Tools:', fontsize=11, weight='bold', color=TEXT_COLOR)
ax.text(8.5, 1.2, '• Weather forecasts and alerts', fontsize=9, color=TEXT_COLOR)
ax.text(8.5, 0.9, '• Employee vacation balance queries', fontsize=9, color=TEXT_COLOR)
ax.text(8.5, 0.6, '• Vacation request creation', fontsize=9, color=TEXT_COLOR)
ax.text(8.5, 0.3, '• HR data access and management', fontsize=9, color=TEXT_COLOR)

plt.tight_layout()
plt.savefig('/Users/phayes/projects/kickstart-llama-stack-mcp-server/assets/images/architecture-diagram.png', 
            dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')
plt.close()

print("Architecture diagram created successfully!")