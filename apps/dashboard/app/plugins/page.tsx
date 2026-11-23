"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = "dev-key";

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/plugins`, { headers: { "X-API-Key": API_KEY } })
      .then((r) => r.json())
      .then(setPlugins)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Plugins</h2>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {plugins.map((p) => (
          <div key={p.name} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.875rem" }}>{p.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{p.description}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className={`badge ${p.enabled ? "badge-success" : "badge-warning"}`}>
                {p.enabled ? "Enabled" : "Disabled"}
              </span>
              <button className="btn-secondary" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                {p.enabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
