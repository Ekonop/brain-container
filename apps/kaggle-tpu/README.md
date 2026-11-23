# Kaggle TPU LLM Inference

Run an LLM on Kaggle TPU with maximum tokens/sec. Models pull directly from HuggingFace — no manual dataset upload.

## Quick Start
1. Create a Kaggle notebook, enable TPU (Settings → Accelerator → TPU v3-8 or v5e-8)
2. Run the cells in `kaggle_notebook.py`
3. Copy the ngrok URL
4. Set in Brain Container: `LLM_PROVIDER=tpu TPU_BASE_URL=<ngrok_url> TPU_MODEL=<model>`

## Supported Models (TPU-optimized)
- `google/gemma-2-9b-it` (recommended, TPU-native)
- `google/gemma-2-27b-it` (larger, needs v5e-8)
- `meta-llama/Llama-3.1-8B-Instruct` (gated — needs HF_TOKEN)
- `mistralai/Mistral-7B-Instruct-v0.3` (gated — needs HF_TOKEN)

## No manual upload needed
Models download from HuggingFace Hub automatically. Just set the model name.

## For gated models
Set `HF_TOKEN` in the notebook cell or as env var.

## Performance
- bfloat16 (native TPU dtype) — no quantization needed
- Tensor parallelism across all TPU cores
- Warmup on startup for consistent latency
- Reports tokens/sec in every response
