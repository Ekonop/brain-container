# Deployment Guide

## Local Development

### Backend (Python)
```bash
cd apps/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export API_KEY=dev-key
uvicorn app.main:app --reload --port 8000
```

### Dashboard (Next.js)
```bash
pnpm install
pnpm --filter @brain-container/dashboard dev
# http://localhost:3000
```

### Mobile (Flutter)
```bash
cd apps/mobile
flutter pub get
flutter run
```

## Docker Deployment

### Full Stack
```bash
cd docker
export API_KEY=your-secret-key
docker compose up -d --build
```

### Services
| Service | Port | Description |
|---------|------|-------------|
| backend | 8000 | FastAPI backend |
| dashboard | 3000 | Next.js dashboard |
| redis | 6379 | Message queue |
| searxng | 8081 | Web search |
| llamacpp | 8082 | LLM inference (optional) |

### With Model
```bash
# Place model file
cp qwen3-14b-q4.gguf docker/models/
# Start llamacpp
docker compose up -d llamacpp
```

## Production Checklist

- [ ] Set strong `API_KEY`
- [ ] Configure `LLM_PROVIDER` (tpu recommended for speed)
- [ ] Place model file or set TPU_BASE_URL
- [ ] Enable HTTPS (reverse proxy or Cloudflare Tunnel)
- [ ] Set up basic auth for dashboard
- [ ] Configure firewall (only expose needed ports)
- [ ] Set up monitoring (health endpoint)
- [ ] Configure backups for ChromaDB volume

## Cloudflare Tunnel (Remote Access)
```bash
cloudflared tunnel --url http://localhost:8000
# Use generated URL in Flutter app or clients
```

## Kaggle TPU Setup
1. Create Kaggle notebook, enable TPU
2. Upload `apps/kaggle-tpu/` files
3. Run all cells (model auto-downloads)
4. Copy ngrok URL
5. Set `LLM_PROVIDER=tpu TPU_BASE_URL=<url>` in Brain Container
