# Plugin Development Guide

## Overview
Plugins extend Brain Container with custom tools. They run in a sandboxed environment and are exposed via the API.

## Plugin Structure

### Backend Plugin (Python)
```python
from plugin_sdk import Plugin, PluginContext

class MyPlugin(Plugin):
    name = "my_plugin"
    description = "Does something useful"

    def run(self, payload: dict, ctx: PluginContext) -> dict:
        # Your logic here
        return {"result": f"Hello, {payload.get('name', 'world')}!"}
```

### Register in Backend
Add to `PLUGIN_REGISTRY` in `app/services.py`:
```python
PLUGIN_REGISTRY = {
    "my_plugin": {"handler": my_plugin.run, "async": False},
}
```

## Built-in Plugins

| Plugin | Description | Status |
|--------|-------------|--------|
| `web_search` | Search via SearXNG | ✅ Active |
| `calculator` | Safe math evaluation | ✅ Active |
| `python_executor` | Sandboxed Python | 🔧 Disabled |
| `file_browser` | Browse indexed files | ✅ Active |

## Plugin Manifest (plugin.json)
```json
{
  "name": "my_plugin",
  "version": "1.0.0",
  "description": "Does something useful",
  "author": "your-name",
  "entry": "my_plugin.py",
  "permissions": ["network:searxng", "filesystem:data"],
  "config": {
    "api_key": { "type": "string", "required": false }
  }
}
```

## Security Rules
- No outbound network except approved services (SearXNG)
- Filesystem access limited to `/data`
- Execution via RestrictedPython (no `import os`, `exec`, `eval`)
- Plugin timeout: 30 seconds

## Testing Plugins
```bash
# Via API
curl -X POST http://localhost:8000/plugins/my_plugin/run \
  -H "X-API-Key: dev-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'

# Via Python
python -c "from app.services import PLUGIN_REGISTRY; print(PLUGIN_REGISTRY)"
```

## Publishing
1. Create a PR with your plugin
2. Include tests
3. Add to plugin marketplace (dashboard)
