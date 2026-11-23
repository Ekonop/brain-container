# Troubleshooting Guide

## Backend Issues

### "LLM unavailable: Name or service not known"
- **Cause**: No LLM provider is reachable
- **Fix**: Set `LLM_PROVIDER=llamacpp` and ensure llamacpp container is running with a model file, OR set `LLM_PROVIDER=tpu` with a valid `TPU_BASE_URL`

### "Invalid API key"
- **Cause**: X-API-Key header doesn't match API_KEY env var
- **Fix**: Ensure `API_KEY` env var matches the key sent in requests

### ChromaDB errors
- **Cause**: Permission issues on `/data/chroma` volume
- **Fix**: `chmod -R 777 /var/lib/docker/volumes/brain-container_backend_data`

### Port already allocated
- **Cause**: Old container still running
- **Fix**: `docker rm -f <container_name>` then restart

## Docker/Kiri Issues

### "Device or resource busy" during build
- **Cause**: Kiri BuildKit mount failure on btrfs
- **Fix**: Clean stale state: `sudo rm -rf /var/lib/kiri/containers/<id>` then rebuild

### Container can't reach internet
- **Cause**: Outbound firewall rules missing
- **Fix**: Add iptables rules for kiri bridges (see deployment guide)

### Build fails with DNS timeout
- **Cause**: Container DNS resolver unreachable
- **Fix**: Add `dns: [1.1.1.1, 8.8.8.8]` to docker-compose service

## Flutter Issues

### "Connection refused"
- **Cause**: Backend not running or wrong URL
- **Fix**: Ensure backend is running and URL is correct (use LAN IP, not localhost, on mobile)

### Offline queue not syncing
- **Cause**: Backend unreachable
- **Fix**: Check network connectivity, tap "Sync offline queue" in Collections

## Dashboard Issues

### API calls fail (CORS)
- **Cause**: Backend CORS not configured
- **Fix**: Backend allows all origins by default; check `NEXT_PUBLIC_API_URL`

### Pages show no data
- **Cause**: Backend not running or API key mismatch
- **Fix**: Check backend health: `curl http://localhost:8000/health`
