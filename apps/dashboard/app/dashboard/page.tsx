"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = "dev-key";

export default function DashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [plugins, setPlugins] = useState<any[]>([]);

  useEffect(() => {
    const h = { "X-API-Key": API_KEY };
    fetch(`${API_BASE}/health`).then((r) => r.json()).then(setHealth).catch(() => {});
    fetch(`${API_BASE}/plugins`, { headers: h }).then((r) => r.json()).then(setPlugins).catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        <div className="surface" style={{ padding: "16px" }}>
          <div className="label">Backend</div>
          <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>
            {health ? "Online" : "Offline"}
          </div>
          <div className="text-muted" style={{ fontSize: "12px", marginTop: "2px" }}>
            {health?.service || "—"}
          </div>
        </div>
        <div className="surface" style={{ padding: "16px" }}>
          <div className="label">Provider</div>
          <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>
            {health?.llm_provider || "—"}
          </div>
          <div className="text-muted" style={{ fontSize: "12px", marginTop: "2px" }}>
            TPU: {health?.tpu_status || "—"}
          </div>
        </div>
        <div className="surface" style={{ padding: "16px" }}>
          <div className="label">Plugins</div>
          <div style={{ fontSize: "14px", fontWeight: 500, marginTop: "4px" }}>
            {plugins.filter((p: any) => p.enabled).length} / {plugins.length}
          </div>
          <div className="text-muted" style={{ fontSize: "12px", marginTop: "2px" }}>
            active
          </div>
        </div>
      </div>

      <div className="surface" style={{ padding: "16px" }}>
        <div className="label" style={{ marginBottom: "12px" }}>Plugins</div>
        {plugins.map((p: any) => (
          <div key={p.name} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 0", borderBottom: "1px solid var(--border-subtle)",
          }}>
            <div>
              <span style={{ fontFamily: "monospace", fontSize: "13px" }}>{p.name}</span>
              <span className="text-muted" style={{ fontSize: "12px", marginLeft: "8px" }}>{p.description}</span>
            </div>
            <span className={`badge ${p.enabled ? "badge-success" : "badge-warning"}`}>
              {p.enabled ? "active" : "disabled"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
