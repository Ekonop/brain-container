"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SettingsPage() {
  const [provider, setProvider] = useState("llamacpp");
  const [apiKey, setApiKey] = useState("");
  const [deepseekKey, setDeepseekKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiUrl, setOpenaiUrl] = useState("");
  const [openaiModel, setOpenaiModel] = useState("");
  const [status, setStatus] = useState("");
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/providers`, { headers: { "X-API-Key": "dev-key" } })
      .then((r) => r.json())
      .then((d) => setProviders(d))
      .catch(() => {});
  }, []);

  async function saveProvider(p: string) {
    setProvider(p);
    setStatus("Provider selection saved locally. Restart backend with LLM_PROVIDER=" + p + " to apply.");
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <section className="mb-6">
        <h3 className="text-lg font-medium mb-2">LLM Provider</h3>
        <p className="text-sm text-zinc-600 mb-3">
          Choose the inference backend. Local (llamacpp) keeps all data in the container.
          Remote providers send data to external servers.
        </p>
        {providers && (
          <p className="text-sm mb-3">
            Current: <span className="font-mono font-bold">{providers.current}</span>
          </p>
        )}
        <div className="space-y-2">
          {[
            { id: "llamacpp", label: "Local (llama.cpp)", desc: "Privacy-first. Runs in container. No data leaves." },
            { id: "deepseek", label: "DeepSeek API", desc: "Remote. Requires API key. Data sent to DeepSeek." },
            { id: "openai_compatible", label: "OpenAI-compatible", desc: "Any OpenAI-compatible endpoint (local or remote)." },
          ].map((opt) => (
            <label key={opt.id} className="flex items-start gap-3 rounded border p-3 cursor-pointer hover:bg-zinc-50">
              <input
                type="radio"
                name="provider"
                value={opt.id}
                checked={provider === opt.id}
                onChange={() => saveProvider(opt.id)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-sm">{opt.label}</div>
                <div className="text-xs text-zinc-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {provider === "deepseek" && (
        <section className="mb-6 rounded border p-4 bg-zinc-50">
          <h3 className="font-medium mb-2">DeepSeek Configuration</h3>
          <input
            type="password"
            placeholder="DeepSeek API Key"
            value={deepseekKey}
            onChange={(e) => setDeepseekKey(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm mb-2"
          />
          <p className="text-xs text-zinc-500">
            Set as env: DEEPSEEK_API_KEY=sk-xxx and LLM_PROVIDER=deepseek
          </p>
        </section>
      )}

      {provider === "openai_compatible" && (
        <section className="mb-6 rounded border p-4 bg-zinc-50">
          <h3 className="font-medium mb-2">OpenAI-compatible Configuration</h3>
          <input
            type="text"
            placeholder="Base URL (e.g. http://localhost:11434/v1)"
            value={openaiUrl}
            onChange={(e) => setOpenaiUrl(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm mb-2"
          />
          <input
            type="text"
            placeholder="Model name"
            value={openaiModel}
            onChange={(e) => setOpenaiModel(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm mb-2"
          />
          <input
            type="password"
            placeholder="API Key (optional)"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm mb-2"
          />
          <p className="text-xs text-zinc-500">
            Set as env: OPENAI_BASE_URL, OPENAI_MODEL, OPENAI_API_KEY, LLM_PROVIDER=openai_compatible
          </p>
        </section>
      )}

      {provider === "llamacpp" && (
        <section className="mb-6 rounded border p-4 bg-green-50">
          <h3 className="font-medium mb-2">Local Inference (Privacy-first)</h3>
          <p className="text-sm text-zinc-600">
            All data stays in the container. No external API calls.
            Place a GGUF model in <code>docker/models/</code> and ensure llamacpp service is running.
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Current model: qwen3-14b (configurable via LLM_MODEL env)
          </p>
        </section>
      )}

      {status && (
        <div className="rounded bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          {status}
        </div>
      )}

      <section className="mt-6 text-sm text-zinc-500">
        <h3 className="font-medium text-zinc-700 mb-1">How to apply</h3>
        <p>Provider changes require a backend restart with the appropriate environment variables:</p>
        <pre className="bg-zinc-100 rounded p-2 mt-2 text-xs overflow-x-auto">
{`# Local (default, privacy-first)
LLM_PROVIDER=llamacpp docker compose up -d backend

# DeepSeek
LLM_PROVIDER=deepseek DEEPSEEK_API_KEY=sk-xxx docker compose up -d backend

# OpenAI-compatible (e.g. Ollama)
LLM_PROVIDER=openai_compatible OPENAI_BASE_URL=http://host:11434/v1 OPENAI_MODEL=llama3 docker compose up -d backend`}
        </pre>
      </section>
    </div>
  );
}
