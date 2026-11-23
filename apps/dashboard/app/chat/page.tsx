"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = "dev-key";

interface Msg { role: string; content: string; tools?: string[]; sources?: string[]; }

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setMessages((p) => [...p, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
        body: JSON.stringify({ query: q }),
      });
      const d = await res.json();
      setMessages((p) => [...p, { role: "assistant", content: d.answer, tools: d.tools_used, sources: d.sources }]);
    } catch (e) {
      setMessages((p) => [...p, { role: "assistant", content: `Error: ${e}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>Chat</h1>
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "75%" }}>
            <div style={{
              background: m.role === "user" ? "var(--accent)" : "var(--surface)",
              border: m.role === "user" ? "none" : "1px solid var(--border)",
              borderRadius: "8px", padding: "10px 14px", fontSize: "13px", lineHeight: 1.6,
            }}>
              {m.content}
            </div>
            {m.tools && m.tools.length > 0 && (
              <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
                {m.tools.map((t) => <span key={t} className="badge badge-info">{t}</span>)}
              </div>
            )}
            {m.sources && m.sources.length > 0 && (
              <div className="text-muted" style={{ fontSize: "11px", marginTop: "4px" }}>
                {m.sources.join(", ")}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-muted" style={{ fontSize: "13px" }}>Thinking...</div>}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything..."
          className="input"
          style={{ flex: 1 }}
        />
        <button onClick={send} disabled={loading} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
}
