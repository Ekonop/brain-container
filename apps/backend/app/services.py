"""Backend services: ChromaDB RAG, plugins, LLM client."""

import ast
import math
import operator
import re
from typing import Optional

import chromadb
import httpx
from chromadb.config import Settings as ChromaSettings

from app.config import settings


# ---------- ChromaDB ----------
_chroma_client: Optional[chromadb.ClientAPI] = None


def get_chroma() -> chromadb.ClientAPI:
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _chroma_client


def get_or_create_collection(collection_id: str = "default"):
    client = get_chroma()
    return client.get_or_create_collection(name=collection_id, metadata={"hnsw:space": "cosine"})


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """Split text into overlapping chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def ingest_document(collection_id: str, text: str, filename: str) -> int:
    """Chunk, embed, and store a document. Returns number of chunks."""
    collection = get_or_create_collection(collection_id)
    chunks = chunk_text(text)
    if not chunks:
        return 0
    ids = [f"{filename}::chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"source": filename, "chunk_index": i} for i in range(len(chunks))]
    collection.add(documents=chunks, ids=ids, metadatas=metadatas)
    return len(chunks)


def query_collection(collection_id: str, query: str, top_k: int = 5) -> list[dict]:
    """Retrieve top-k relevant chunks from a collection."""
    collection = get_or_create_collection(collection_id)
    try:
        results = collection.query(query_texts=[query], n_results=top_k)
    except Exception:
        return []
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    out = []
    for doc, meta, dist in zip(docs, metas, distances):
        out.append({"text": doc, "source": meta.get("source", ""), "distance": dist})
    return out


# ---------- Plugins ----------
_SAFE_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.USub: operator.neg,
}


def _safe_eval(node):
    if isinstance(node, ast.Expression):
        return _safe_eval(node.body)
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise ValueError("Unsupported constant")
    if isinstance(node, ast.BinOp):
        op = _SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError("Unsupported operator")
        return op(_safe_eval(node.left), _safe_eval(node.right))
    if isinstance(node, ast.UnaryOp):
        op = _SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError("Unsupported operator")
        return op(_safe_eval(node.operand))
    raise ValueError("Unsupported expression")


def calculator(expr: str) -> str:
    """Safely evaluate a math expression."""
    try:
        tree = ast.parse(expr, mode="eval")
        result = _safe_eval(tree)
        return str(result)
    except Exception as e:
        return f"Error: {e}"


async def web_search(query: str) -> list[dict]:
    """Search via SearXNG."""
    url = f"{settings.searxng_url}/search"
    params = {"q": query, "format": "json", "categories": "general"}
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            results = data.get("results", [])[:5]
            return [{"title": r.get("title", ""), "url": r.get("url", ""), "snippet": r.get("content", "")} for r in results]
    except Exception as e:
        return [{"error": str(e)}]


# ---------- LLM client ----------
from app.providers import get_provider

async def llm_chat(messages: list[dict], temperature: float = 0.7) -> str:
    """Call the configured LLM provider."""
    provider = get_provider()
    return await provider.chat(messages, temperature)


PLUGIN_REGISTRY = {
    "calculator": {"handler": calculator, "async": False},
    "web_search": {"handler": web_search, "async": True},
}
