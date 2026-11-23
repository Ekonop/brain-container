# Changelog

## [0.2.0] - 2026-11-24

### Added
- Real ChromaDB RAG: document ingestion, chunking, semantic retrieval
- OpenAI-compatible API (`/v1/chat/completions`, `/v1/models`)
- Plugin system: calculator, web_search, file_browser
- WebRTC P2P signaling endpoints
- TPU provider support (Kaggle TPU integration)
- Dark-themed Next.js dashboard with chat playground
- Flutter mobile app with chat, collections, settings
- Kaggle TPU inference server with HuggingFace auto-pull
- Kiri build fix (mount_rootfs cleanup + outbound firewall rules)

### Changed
- Backend upgraded to real RAG with LLM provider abstraction
- Dashboard redesigned with dark theme and system monitoring
- Flutter app improved with markdown rendering, tool chips, source citations

### Fixed
- Kiri BuildKit mount failure on btrfs (stale overlay state)
- Container networking (outbound DNS/HTTPS for dependency download)
- RestrictedPython version compatibility (7.4 → 8.5 for Python 3.11)

## [0.1.0] - 2026-11-18

### Added
- Initial monorepo structure (pnpm + Turborepo)
- FastAPI backend with stub endpoints
- Next.js 14 dashboard skeleton
- Flutter mobile app skeleton
- Docker Compose with 5 services
- CI/CD workflows (GitHub Actions)
- Docusaurus website
- README with architecture diagram
