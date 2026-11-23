"""Brain Container Plugin SDK (minimal)."""

from dataclasses import dataclass
from typing import Any, Callable


@dataclass
class PluginContext:
    api_key: str | None = None


class Plugin:
    name: str = "example"
    description: str = "Example plugin"

    def run(self, payload: dict[str, Any], ctx: PluginContext) -> dict[str, Any]:
        raise NotImplementedError
