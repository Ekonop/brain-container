---
sidebar_position: 1
---

# Brain Container OS

Privacy-first local AI platform. Run RAG, plugins, and chat — all in your own container.

## Quick Start

```bash
git clone https://github.com/your-org/brain-container.git
cd brain-container
pnpm install
cd docker && docker compose up -d --build
```

Backend: http://localhost:8000 | Dashboard: http://localhost:3000

## Documentation

- [Installation](./installation.md)
- [Usage](./usage.md)
- [Plugin Development](./plugins.md)
- [Architecture](./architecture.md)
- [Deployment](./deployment.md)
- [Troubleshooting](./troubleshooting.md)

## Features

- **Local RAG** with ChromaDB
- **Plugin System** with sandboxed Python
- **Multi-Provider LLM** (llama.cpp, DeepSeek, OpenAI, Kaggle TPU)
- **Web Dashboard** (Next.js 14, dark theme)
- **Mobile Client** (Flutter, offline support)
- **OpenAI-Compatible API**
- **WebRTC P2P** for low-latency connections
