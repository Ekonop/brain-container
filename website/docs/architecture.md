---
sidebar_position: 4
---

# Architecture

## Overview

Brain Container OS is a monorepo with 3 apps and 3 shared packages, orchestrated by Turborepo.

## Components

### Backend (FastAPI)
- **RAG Engine**: ChromaDB for vector storage, text chunking, semantic retrieval
- **Plugin Runtime**: Sandboxed Python execution via RestrictedPython
- **LLM Providers**: llama.cpp (local), DeepSeek, OpenAI-compatible, Kaggle TPU
- **WebSocket**: Streaming chat at `/chat/stream`
- **WebRTC**: Signaling server for P2P connections

### Dashboard (Next.js 14)
- Pages: Home, Dashboard, Chat, Collections, Plugins, Connectors, Settings
- Dark theme with design tokens
- Chat playground with RAG + tool calling
- System monitoring

### Mobile (Flutter)
- Chat with streaming markdown
- Document upload with offline queue (Hive)
- Settings with provider info
- WebRTC P2P with Cloudflare Tunnel fallback

## Data Flow

1. User uploads document → `/ingest` → chunked → embedded → ChromaDB
2. User asks question → `/query` → semantic retrieval → LLM with context → answer
3. Tool calls detected in query → executed → result included in answer

## Network Architecture

- **Local**: Backend on :8000, Dashboard on :3000
- **Remote**: Cloudflare Tunnel (free, HTTPS, no port forwarding)
- **P2P**: WebRTC data channels (lowest latency, NAT traversal via STUN)
