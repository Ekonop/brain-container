"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = "dev-key";

interface Message { role: string; content: string; tools?: string[]; sources?: string[]; }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.answer || "No response",
        tools: data.tools_used,
        sources: data.sources,
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${e}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Chat Playground</h2>
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "80%",
          }}>
            <div style={{
              background: m.role === "user" ? "var(--accent)" : "var(--surface)",
              border: m.role === "user" ? "none" : "1px solid var(--border)",
              borderRadius: "12px", padding: "0.75rem 1rem", fontSize: "0.875rem",
            }}>
              {m.content}
            </div>
            {m.tools && m.tools.length > 0 && (
              <div style={{ display: "flex", gap: "0.25rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                {m.tools.map((t) => (
                  <span key={t} className="badge badge-info" style={{ fontSize: "0.625rem" }}>{t}</span>
                ))}
              </div>
            )}
            {m.sources && m.sources.length > 0 && (
              <div style={{ fontSize: "0.625rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Sources: {m.sources.join(", ")}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Thinking...
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything... (try 'calculate 2+3' or 'search AI news')"
          style={{
            flex: 1, background: "var(--surface-2)", border: "1px solid var(--border)",
            color: "var(--text)", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.875rem",
          }}
        />
        <button onClick={send} disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  );
}
