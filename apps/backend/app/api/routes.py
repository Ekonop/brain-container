import json
import re
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.config import settings
from app.services import (
    ingest_document,
    query_collection,
    calculator,
    web_search,
    llm_chat,
    PLUGIN_REGISTRY,
)

router = APIRouter()


def require_api_key(x_api_key: Optional[str] = Header(default=None, alias="X-API-Key")):
    if x_api_key is None or x_api_key == "":
        raise HTTPException(status_code=401, detail="Missing X-API-Key")
    if x_api_key != settings.api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key


class QueryRequest(BaseModel):
    query: str
    collection_id: Optional[str] = "default"


class IngestResponse(BaseModel):
    status: str
    message: str
    chunks: int = 0


@router.get("/health")
async def health():
    from app.providers import get_provider
    import httpx
    provider = get_provider()
    tpu_status = "unknown"
    if type(provider).__name__ == "TPUProvider":
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                resp = await client.get(f"{provider.base_url}/health")
                tpu_status = resp.json().get("status", "unknown")
        except Exception:
            tpu_status = "unreachable"
    return {"status": "ok", "service": "brain-container-backend", "llm_provider": type(provider).__name__, "tpu_status": tpu_status}


@router.post("/tpu/connect")
async def tpu_connect(payload: dict, _=Depends(require_api_key)):
    """Test and save TPU connection."""
    import httpx
    url = payload.get("url", "").rstrip("/")
    if not url:
        raise HTTPException(status_code=400, detail="URL required")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{url}/health")
            data = resp.json()
            return {"status": "connected", "model": data.get("model"), "tpu_cores": data.get("tpu_cores"), "url": url}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Cannot reach TPU: {e}")


@router.get("/providers")
async def list_providers(_=Depends(require_api_key)):
    from app.config import settings
    return {
        "current": settings.llm_provider,
        "available": ["llamacpp", "deepseek", "openai_compatible", "tpu"],
        "note": "Set LLM_PROVIDER env var to switch. Data stays local with llamacpp (default).",
    }


@router.get("/plugins")
async def list_plugins(_=Depends(require_api_key)):
    return [
        {"name": "web_search", "enabled": True, "description": "Search the web via SearXNG"},
        {"name": "calculator", "enabled": True, "description": "Safe math expression evaluation"},
        {"name": "python_executor", "enabled": False, "description": "Sandboxed Python (RestrictedPython)"},
        {"name": "file_browser", "enabled": True, "description": "Browse indexed files (scoped)"},
    ]


@router.post("/plugins/{name}/run")
async def run_plugin(name: str, payload: dict, _=Depends(require_api_key)):
    if name not in PLUGIN_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Plugin '{name}' not found")
    plugin = PLUGIN_REGISTRY[name]
    try:
        if plugin["async"]:
            result = await plugin["handler"](**payload)
        else:
            result = plugin["handler"](**payload)
        return {"plugin": name, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest", response_model=IngestResponse)
async def ingest(
    file: UploadFile = File(...),
    collection_id: Optional[str] = "default",
    _=Depends(require_api_key),
):
    try:
        content = await file.read()
        text = content.decode("utf-8", errors="replace")
        chunks = ingest_document(collection_id or "default", text, file.filename or "untitled")
        return IngestResponse(status="ok", message=f"Ingested {file.filename}", chunks=chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query")
async def query(req: QueryRequest, _=Depends(require_api_key)):
    collection_id = req.collection_id or "default"
    sources = query_collection(collection_id, req.query, top_k=5)

    # Build context from retrieved chunks
    context_parts = []
    source_names = []
    for s in sources:
        context_parts.append(s["text"])
        if s["source"] not in source_names:
            source_names.append(s["source"])

    # Detect tool calls in query
    tools_used = []
    answer = ""

    # Check for calculator requests
    calc_match = re.search(r"calculate\s+(.+)", req.query, re.IGNORECASE)
    if calc_match:
        expr = calc_match.group(1).strip()
        result = calculator(expr)
        tools_used.append("calculator")
        answer = f"Calculation result: {result}"

    # Check for web search requests
    search_match = re.search(r"search\s+(?:for\s+)?(.+)", req.query, re.IGNORECASE)
    if search_match and not calc_match:
        search_query = search_match.group(1).strip()
        results = await web_search(search_query)
        tools_used.append("web_search")
        if results and "error" not in results[0]:
            snippets = [f"- {r['title']}: {r['snippet']}" for r in results]
            answer = "Search results:\n" + "\n".join(snippets)
        else:
            answer = f"Search failed: {results}"

    # Default: RAG + LLM
    if not answer:
        context = "\n\n".join(context_parts) if context_parts else "No relevant documents found."
        messages = [
            {"role": "system", "content": f"You are a helpful assistant. Use the following context to answer the question.\n\nContext:\n{context}"},
            {"role": "user", "content": req.query},
        ]
        answer = await llm_chat(messages)
        if sources:
            tools_used.append("rag_retrieval")

    return {
        "answer": answer,
        "sources": source_names,
        "tools_used": tools_used,
    }


@router.websocket("/chat/stream")
async def chat_stream(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data) if data.startswith("{") else {"query": data}
            query_text = msg.get("query", data)
            collection_id = msg.get("collection_id", "default")

            # Retrieve context
            sources = query_collection(collection_id, query_text, top_k=3)
            context = "\n\n".join(s["text"] for s in sources) if sources else "No relevant documents."

            messages = [
                {"role": "system", "content": f"You are a helpful assistant. Context:\n{context}"},
                {"role": "user", "content": query_text},
            ]

            # Stream response token by token (simulated for now)
            answer = await llm_chat(messages)
            # Send as chunks for streaming feel
            for i in range(0, len(answer), 20):
                chunk = answer[i : i + 20]
                await ws.send_text(f"data: {chunk}\n\n")
            await ws.send_text("data: [DONE]\n\n")
    except WebSocketDisconnect:
        return
    except Exception as e:
        await ws.send_text(f"data: Error: {e}\n\n")
        await ws.send_text("data: [DONE]\n\n")


# ---------- OpenAI-compatible API ----------
class ChatCompletionMessage(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model: Optional[str] = None
    messages: list[ChatCompletionMessage]
    temperature: Optional[float] = 0.7
    stream: Optional[bool] = False
    collection_id: Optional[str] = "default"


@router.post("/v1/chat/completions")
async def chat_completions(req: ChatCompletionRequest, _=Depends(require_api_key)):
    """OpenAI-compatible chat completions endpoint with optional RAG."""
    import time
    import uuid

    collection_id = req.collection_id or "default"
    last_user_msg = ""
    for m in reversed(req.messages):
        if m.role == "user":
            last_user_msg = m.content
            break

    # RAG retrieval
    sources = query_collection(collection_id, last_user_msg, top_k=3)
    context = "\n\n".join(s["text"] for s in sources) if sources else ""

    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    if context and messages and messages[-1]["role"] == "user":
        messages[-1]["content"] = f"Context:\n{context}\n\nQuestion: {messages[-1]['content']}"

    answer = await llm_chat(messages, temperature=req.temperature or 0.7)

    return {
        "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": req.model or settings.llm_model,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": answer},
                "finish_reason": "stop",
            }
        ],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }


@router.get("/v1/models")
async def list_models(_=Depends(require_api_key)):
    """OpenAI-compatible models listing."""
    return {
        "object": "list",
        "data": [{"id": settings.llm_model, "object": "model", "owned_by": "brain-container"}],
    }
