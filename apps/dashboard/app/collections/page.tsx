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
      setStatus(`${data.message} (${data.chunks} chunks)`);
    } catch (e) {
      setStatus(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Collections</h1>

      <div className="surface" style={{ padding: "20px", marginBottom: "16px" }}>
        <div className="label" style={{ marginBottom: "12px" }}>Upload Document</div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input type="file" ref={fileRef} accept=".txt,.md" style={{ flex: 1, fontSize: "13px" }} />
          <button onClick={upload} disabled={loading} className="btn btn-primary" style={{ opacity: loading ? 0.5 : 1 }}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {status && <p className="text-muted" style={{ marginTop: "12px", fontSize: "12px" }}>{status}</p>}
      </div>

      <div className="surface" style={{ padding: "20px" }}>
        <div className="label" style={{ marginBottom: "8px" }}>How it works</div>
        <p className="text-muted" style={{ fontSize: "13px", lineHeight: 1.6 }}>
          Upload text documents to create a RAG knowledge base. Documents are chunked, embedded, and stored in ChromaDB.
          Query them via Chat or the OpenAI-compatible API. Supported formats: TXT, MD.
        </p>
      </div>
    </div>
  );
}
