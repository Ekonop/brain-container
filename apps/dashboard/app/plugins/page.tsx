"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = "dev-key";

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/plugins`, { headers: { "X-API-Key": API_KEY } })
      .then((r) => r.json()).then(setPlugins).catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Plugins</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {plugins.map((p) => (
          <div key={p.name} className="surface" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 500 }}>{p.name}</div>
              <div className="text-muted" style={{ fontSize: "12px", marginTop: "2px" }}>{p.description}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={`badge ${p.enabled ? "badge-success" : "badge-warning"}`}>
                {p.enabled ? "active" : "disabled"}
              </span>
              <button className="btn btn-secondary" style={{ fontSize: "12px", padding: "4px 8px" }}>
                {p.enabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
