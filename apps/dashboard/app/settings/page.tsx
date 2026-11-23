"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = "dev-key";

export default function SettingsPage() {
  const [provider, setProvider] = useState("llamacpp");
  const [providers, setProviders] = useState<any>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/providers`, { headers: { "X-API-Key": API_KEY } })
      .then((r) => r.json()).then(setProviders).catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Settings</h1>

      <div className="surface" style={{ padding: "20px", marginBottom: "16px" }}>
        <div className="label" style={{ marginBottom: "12px" }}>LLM Provider</div>
        {providers && (
          <div className="text-muted" style={{ fontSize: "12px", marginBottom: "12px" }}>
            Current: <span style={{ color: "var(--text)", fontWeight: 500 }}>{providers.current}</span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { id: "llamacpp", label: "Local (llama.cpp)", desc: "Privacy-first. No data leaves container." },
            { id: "deepseek", label: "DeepSeek API", desc: "Remote. Requires API key." },
            { id: "openai_compatible", label: "OpenAI-compatible", desc: "Any OpenAI-compatible endpoint." },
            { id: "tpu", label: "Kaggle TPU", desc: "Highest throughput. Model from HuggingFace." },
          ].map((opt) => (
            <label key={opt.id} style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
              borderRadius: "var(--radius)", border: "1px solid var(--border)",
              cursor: "pointer", background: provider === opt.id ? "var(--accent-dim)" : "transparent",
              borderColor: provider === opt.id ? "var(--accent)" : "var(--border)",
            }}>
              <input type="radio" name="provider" value={opt.id} checked={provider === opt.id}
                onChange={() => { setProvider(opt.id); setStatus(`Set LLM_PROVIDER=${opt.id} and restart backend`); }}
                style={{ accentColor: "var(--accent)" }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 500 }}>{opt.label}</div>
                <div className="text-muted" style={{ fontSize: "11px" }}>{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
        {status && (
          <div style={{ marginTop: "12px", padding: "8px 12px", borderRadius: "var(--radius)", background: "var(--accent-dim)", fontSize: "12px", color: "var(--accent)" }}>
            {status}
          </div>
        )}
      </div>

      <div className="surface" style={{ padding: "20px", marginBottom: "16px" }}>
        <div className="label" style={{ marginBottom: "8px" }}>Environment Variables</div>
        <pre style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
{`# Local (default)
LLM_PROVIDER=llamacpp

# DeepSeek
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxx

# OpenAI-compatible (Ollama)
LLM_PROVIDER=openai_compatible
OPENAI_BASE_URL=http://host:11434/v1
OPENAI_MODEL=llama3

# Kaggle TPU
LLM_PROVIDER=tpu
TPU_BASE_URL=https://xxx.ngrok.io
TPU_MODEL=google/gemma-2-9b-it`}
        </pre>
      </div>

      <div className="surface" style={{ padding: "20px" }}>
        <div className="label" style={{ marginBottom: "8px" }}>API Key</div>
        <p className="text-muted" style={{ fontSize: "12px", marginBottom: "8px" }}>
          Backend requires X-API-Key header. Set API_KEY env var.
        </p>
        <code>API_KEY=your-secret-key</code>
      </div>
    </div>
  );
}
