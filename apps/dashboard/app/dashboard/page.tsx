"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = "dev-key";

export default function DashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [providers, setProviders] = useState<any>(null);
  const [plugins, setPlugins] = useState<any[]>([]);

  useEffect(() => {
    const headers = { "X-API-Key": API_KEY };
    fetch(`${API_BASE}/health`).then((r) => r.json()).then(setHealth).catch(() => {});
    fetch(`${API_BASE}/providers`, { headers }).then((r) => r.json()).then(setProviders).catch(() => {});
    fetch(`${API_BASE}/plugins`, { headers }).then((r) => r.json()).then(setPlugins).catch(() => {});
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>System Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ fontWeight: 600, fontSize: "0.875rem" }}>Backend Status</h3>
            <span className={`badge ${health ? "badge-success" : "badge-error"}`}>
              {health ? "Online" : "Offline"}
            </span>
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            <div>Service: {health?.service || "—"}</div>
            <div>Provider: {health?.llm_provider || "—"}</div>
            <div>TPU: {health?.tpu_status || "—"}</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem" }}>LLM Provider</h3>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent)", marginBottom: "0.25rem" }}>
            {providers?.current || "—"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {providers?.available?.length || 0} providers available
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem" }}>Plugins</h3>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--success)", marginBottom: "0.25rem" }}>
            {plugins.filter((p: any) => p.enabled).length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            of {plugins.length} enabled
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem" }}>Installed Plugins</h3>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {plugins.map((p: any) => (
            <div key={p.name} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.5rem 0.75rem", borderRadius: "8px", background: "var(--surface-2)",
            }}>
              <div>
                <span style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>{p.name}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>{p.description}</span>
              </div>
              <span className={`badge ${p.enabled ? "badge-success" : "badge-warning"}`}>
                {p.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
