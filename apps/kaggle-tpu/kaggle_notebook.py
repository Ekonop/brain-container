# Kaggle TPU LLM Inference Notebook
# =================================
# No manual dataset upload needed — models pull from HuggingFace automatically.

# ── Cell 1: Install dependencies ──
"""
!pip install -q torch torch_xla transformers fastapi uvicorn pyngrok
"""

# ── Cell 2: Verify TPU ──
"""
import os
os.environ['XLA_FLAGS'] = '--xla_force_host_platform_device_count=8'
os.environ['TPU_CHIPS_PER_HOST_BOUNDS'] = '8'

import jax
print(f"JAX devices: {jax.device_count()}")
print(f"JAX backend: {jax.default_backend()}")
assert jax.device_count() >= 1, "No TPU detected — enable TPU in notebook settings"
"""

# ── Cell 3: Run inference server (model auto-downloads from HuggingFace) ──
"""
MODEL = "google/gemma-2-9b-it"   # Change to any HF model
# For gated models (Llama, Mistral): set HF_TOKEN below
HF_TOKEN = ""  # e.g. "hf_xxxxxxxxxxxx"

import os
os.environ['HF_TOKEN'] = HF_TOKEN

# Copy inference.py to working dir
import shutil
shutil.copy('/kaggle/input/brain-container-tpu/inference.py', '/kaggle/working/inference.py')

# Run server (model downloads automatically, ~2-5 min depending on size)
!python /kaggle/working/inference.py --model {MODEL} --port 8000
"""

# ── Cell 4: Expose via ngrok (run in separate cell while server runs) ──
"""
from pyngrok import ngrok
tunnel = ngrok.connect(8000)
print(f"Public URL: {tunnel.public_url}")
print(f"")
print(f"Set in Brain Container:")
print(f"  LLM_PROVIDER=tpu")
print(f"  TPU_BASE_URL={tunnel.public_url}")
print(f"  TPU_MODEL={MODEL}")
"""

# ── Cell 5: Test inference ──
"""
import requests
resp = requests.post("http://localhost:8000/v1/chat/completions", json={
    "messages": [{"role": "user", "content": "Hello, what can you do?"}],
    "max_tokens": 100
})
print(resp.json()["choices"][0]["message"]["content"])
print(f"Tokens/sec: {resp.json()['performance']['tokens_per_second']}")
"""
