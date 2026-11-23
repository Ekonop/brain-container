"""
Kaggle TPU LLM Inference Server
================================
Runs an LLM on Kaggle TPU with maximum tokens/sec.
Exposes an OpenAI-compatible API for Brain Container backend.

Models are pulled directly from HuggingFace Hub — no manual dataset upload needed.

Usage in Kaggle notebook:
    !python inference.py --model "google/gemma-2-9b-it" --port 8000

    # For gated models (Llama, Mistral), set HF_TOKEN:
    !HF_TOKEN=hf_xxx python inference.py --model "meta-llama/Llama-3.1-8B-Instruct" --port 8000
"""

import argparse
import asyncio
import json
import os
import time
import uuid

# ---------- TPU Setup ----------
os.environ.setdefault("XLA_FLAGS", "--xla_force_host_platform_device_count=8")
os.environ.setdefault("TPU_CHIPS_PER_HOST_BOUNDS", "8")

# ---------- Imports ----------
import jax
import jax.numpy as jnp
from jax.sharding import Mesh, PartitionSpec as P
from jax.experimental import mesh_utils

import torch
import torch_xla
import torch_xla.core.xla_model as xm
from transformers import AutoTokenizer, AutoModelForCausalLM

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: Optional[str] = None
    messages: List[Message]
    temperature: float = 0.7
    max_tokens: int = 512
    stream: bool = False


app = FastAPI(title="Kaggle TPU LLM Server")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Global state
_model = None
_tokenizer = None
_device = None
_mesh = None
_model_name = "default"


def init_tpu():
    """Initialize TPU device and mesh for tensor parallelism."""
    global _device, _mesh
    _device = xm.xla_device()
    print(f"TPU device: {_device}")
    print(f"JAX devices: {jax.device_count()}")
    device_ids = list(range(jax.device_count()))
    _mesh = Mesh(mesh_utils.create_device_mesh((len(device_ids),), device_ids), ("tp",))
    print(f"Mesh created with {len(device_ids)} TPU cores")
    return _device


def load_model(model_name: str, hf_token: str = None):
    """Pull model from HuggingFace and load onto TPU with bfloat16."""
    global _model, _tokenizer, _model_name
    print(f"Pulling model from HuggingFace: {model_name}")

    token = hf_token or os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")

    # Download tokenizer
    _tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,
        token=token,
    )
    if _tokenizer.pad_token is None:
        _tokenizer.pad_token = _tokenizer.eos_token

    # Download and load model in bfloat16 (native TPU precision)
    print("Downloading model weights (this may take a few minutes)...")
    _model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        trust_remote_code=True,
        token=token,
        low_cpu_mem_usage=True,
    )
    _model = _model.to(_device)
    _model.eval()
    _model_name = model_name
    print(f"Model loaded on TPU: {_model_name}")

    # Warmup
    print("Warming up...")
    dummy = _tokenizer("Hello", return_tensors="pt").to(_device)
    with torch.no_grad():
        _model.generate(**dummy, max_new_tokens=1)
    print("Warmup complete — ready for inference")


def generate(messages: list[dict], temperature: float = 0.7, max_tokens: int = 512) -> str:
    """Generate response with TPU-optimized inference."""
    if hasattr(_tokenizer, "apply_chat_template"):
        prompt = _tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    else:
        prompt = "\n".join(f"{m['role']}: {m['content']}" for m in messages) + "\nassistant:"

    inputs = _tokenizer(prompt, return_tensors="pt").to(_device)
    input_len = inputs["input_ids"].shape[1]

    with torch.no_grad():
        outputs = _model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            temperature=temperature if temperature > 0 else 1.0,
            do_sample=temperature > 0,
            top_p=0.9,
            repetition_penalty=1.1,
        )

    response = _tokenizer.decode(outputs[0][input_len:], skip_special_tokens=True)
    return response.strip()


@app.get("/health")
async def health():
    return {"status": "ok", "device": str(_device), "model": _model_name, "tpu_cores": jax.device_count()}


@app.get("/v1/models")
async def list_models():
    return {"object": "list", "data": [{"id": _model_name, "object": "model", "owned_by": "kaggle-tpu"}]}


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatRequest):
    import time
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    start = time.time()
    answer = generate(messages, temperature=req.temperature, max_tokens=req.max_tokens)
    elapsed = time.time() - start
    tokens = len(_tokenizer.encode(answer))
    tps = tokens / elapsed if elapsed > 0 else 0
    print(f"Generated {tokens} tokens in {elapsed:.2f}s = {tps:.1f} tok/s")

    return {
        "id": f"chatcmpl-{uuid.uuid4().hex[:12]}",
        "object": "chat.completion",
        "created": int(time.time()),
        "model": req.model or _model_name,
        "choices": [{"index": 0, "message": {"role": "assistant", "content": answer}, "finish_reason": "stop"}],
        "usage": {"prompt_tokens": 0, "completion_tokens": tokens, "total_tokens": tokens},
        "performance": {"tokens_per_second": round(tps, 1), "elapsed_seconds": round(elapsed, 2)},
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="google/gemma-2-9b-it", help="HuggingFace model name or path")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--max-tokens", type=int, default=512)
    parser.add_argument("--hf-token", default=None, help="HuggingFace token for gated models")
    args = parser.parse_args()

    init_tpu()
    load_model(args.model, hf_token=args.hf_token)

    print(f"\n{'='*60}")
    print(f"TPU LLM Server running on port {args.port}")
    print(f"Model: {args.model}")
    print(f"TPU cores: {jax.device_count()}")
    print(f"OpenAI-compatible API: http://0.0.0.0:{args.port}/v1/chat/completions")
    print(f"{'='*60}\n")

    uvicorn.run(app, host="0.0.0.0", port=args.port)


if __name__ == "__main__":
    main()
