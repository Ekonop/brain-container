"""LLM provider abstraction supporting multiple backends."""

import httpx
from typing import Optional

from app.config import settings


class LLMProvider:
    """Base LLM provider interface."""

    async def chat(self, messages: list[dict], temperature: float = 0.7) -> str:
        raise NotImplementedError

    async def chat_stream(self, messages: list[dict], temperature: float = 0.7):
        raise NotImplementedError


class LlamaCppProvider(LLMProvider):
    """Local llama.cpp server (OpenAI-compatible). All data stays local."""

    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def chat(self, messages: list[dict], temperature: float = 0.7) -> str:
        url = f"{self.base_url}/chat/completions"
        payload = {"model": self.model, "messages": messages, "temperature": temperature, "stream": False}
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            return f"[llama.cpp unavailable: {e}]"

    async def chat_stream(self, messages: list[dict], temperature: float = 0.7):
        url = f"{self.base_url}/chat/completions"
        payload = {"model": self.model, "messages": messages, "temperature": temperature, "stream": True}
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream("POST", url, json=payload) as resp:
                    async for line in resp.aiter_lines():
                        if line.startswith("data: ") and line != "data: [DONE]":
                            import json
                            try:
                                chunk = json.loads(line[6:])
                                delta = chunk["choices"][0].get("delta", {}).get("content", "")
                                if delta:
                                    yield delta
                            except Exception:
                                pass
        except Exception as e:
            yield f"[llama.cpp stream error: {e}]"


class DeepSeekProvider(LLMProvider):
    """DeepSeek API provider. Data is sent to DeepSeek servers."""

    def __init__(self, api_key: str, model: str = "deepseek-chat", base_url: str = "https://api.deepseek.com/v1"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")

    async def chat(self, messages: list[dict], temperature: float = 0.7) -> str:
        url = f"{self.base_url}/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {"model": self.model, "messages": messages, "temperature": temperature, "stream": False}
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            return f"[DeepSeek unavailable: {e}]"

    async def chat_stream(self, messages: list[dict], temperature: float = 0.7):
        url = f"{self.base_url}/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        payload = {"model": self.model, "messages": messages, "temperature": temperature, "stream": True}
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    async for line in resp.aiter_lines():
                        if line.startswith("data: ") and line != "data: [DONE]":
                            import json
                            try:
                                chunk = json.loads(line[6:])
                                delta = chunk["choices"][0].get("delta", {}).get("content", "")
                                if delta:
                                    yield delta
                            except Exception:
                                pass
        except Exception as e:
            yield f"[DeepSeek stream error: {e}]"


class OpenAICompatibleProvider(LLMProvider):
    """Generic OpenAI-compatible provider (local or remote)."""

    def __init__(self, base_url: str, model: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.api_key = api_key

    async def chat(self, messages: list[dict], temperature: float = 0.7) -> str:
        url = f"{self.base_url}/chat/completions"
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        payload = {"model": self.model, "messages": messages, "temperature": temperature, "stream": False}
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(url, json=payload, headers=headers)
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            return f"[OpenAI-compatible unavailable: {e}]"

    async def chat_stream(self, messages: list[dict], temperature: float = 0.7):
        url = f"{self.base_url}/chat/completions"
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        payload = {"model": self.model, "messages": messages, "temperature": temperature, "stream": True}
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    async for line in resp.aiter_lines():
                        if line.startswith("data: ") and line != "data: [DONE]":
                            import json
                            try:
                                chunk = json.loads(line[6:])
                                delta = chunk["choices"][0].get("delta", {}).get("content", "")
                                if delta:
                                    yield delta
                            except Exception:
                                pass
        except Exception as e:
            yield f"[OpenAI-compatible stream error: {e}]"


class TPUProvider(LLMProvider):
    """Kaggle TPU inference server (OpenAI-compatible)."""

    def __init__(self, base_url: str, model: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.api_key = api_key

    async def chat(self, messages: list[dict], temperature: float = 0.7) -> str:
        return await OpenAICompatibleProvider(self.base_url, self.model, self.api_key).chat(messages, temperature)

    async def chat_stream(self, messages: list[dict], temperature: float = 0.7):
        async for chunk in OpenAICompatibleProvider(self.base_url, self.model, self.api_key).chat_stream(messages, temperature):
            yield chunk


def get_provider() -> LLMProvider:
    """Factory: create the configured LLM provider."""
    provider_type = getattr(settings, "llm_provider", "llamacpp")
    if provider_type == "deepseek":
        api_key = getattr(settings, "deepseek_api_key", "")
        model = getattr(settings, "deepseek_model", "deepseek-chat")
        return DeepSeekProvider(api_key=api_key, model=model)
    elif provider_type == "tpu":
        base_url = getattr(settings, "tpu_base_url", "")
        model = getattr(settings, "tpu_model", "gemma-2-9b-it")
        return TPUProvider(base_url=base_url, model=model)
    elif provider_type == "openai_compatible":
        base_url = getattr(settings, "openai_base_url", settings.llm_base_url)
        model = getattr(settings, "openai_model", settings.llm_model)
        api_key = getattr(settings, "openai_api_key", None)
        return OpenAICompatibleProvider(base_url=base_url, model=model, api_key=api_key)
    else:
        return LlamaCppProvider(base_url=settings.llm_base_url, model=settings.llm_model)
