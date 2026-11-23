#!/usr/bin/env bash
set -euo pipefail

echo "Brain Container installer (Linux)"
echo "This script assumes Docker and Docker Compose are available."

REPO_DIR="${BRAIN_CONTAINER_DIR:-$HOME/brain-container}"
COMPOSE_URL="${COMPOSE_URL:-https://raw.githubusercontent.com/your-org/brain-container/main/docker/docker-compose.yml}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Please install Docker first: https://docs.docker.com/engine/install/"
  exit 1
fi

mkdir -p "$REPO_DIR/docker/models"
echo "Note: Download Qwen3-14B GGUF (Q4) to $REPO_DIR/docker/models/qwen3-14b-q4.gguf on first run."
echo "Example (adjust URL): place the model file in docker/models/ then run docker compose up -d"

if [ -f "docker/docker-compose.yml" ]; then
  echo "Using local docker/docker-compose.yml"
  (cd docker && docker compose up -d)
else
  echo "Fetching compose file from $COMPOSE_URL"
  curl -fsSL "$COMPOSE_URL" -o /tmp/brain-container-compose.yml
  docker compose -f /tmp/brain-container-compose.yml up -d
fi

echo "Done. Backend: http://localhost:8000, Dashboard: http://localhost:3000"
