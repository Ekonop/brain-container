"use client";
import { useState, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = "dev-key";

export default function CollectionsPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatus("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/ingest?collection_id=default`, {
        method: "POST",
        headers: { "X-API-Key": API_KEY },
        body: form,
      });
      const data = await res.json();
      setStatus(`Ingested: ${data.message} (${data.chunks} chunks)`);
    } catch (e) {
      setStatus(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Collections</h2>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem" }}>Upload Document</h3>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input type="file" ref={fileRef} accept=".txt,.md,.pdf,.csv" style={{ flex: 1, fontSize: "0.875rem" }} />
          <button onClick={upload} disabled={loading} className="btn-primary" style={{ opacity: loading ? 0.5 : 1 }}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {status && <p style={{ marginTop: "0.75rem", fontSize: "0.8125rem", color: "var(--text-muted)" }}>{status}</p>}
      </div>
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem" }}>How it works</h3>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          Upload text documents to create a RAG knowledge base. Documents are chunked, embedded, and stored in ChromaDB.
          Query them via the Chat page or the OpenAI-compatible API.
        </p>
      </div>
    </div>
  );
}
