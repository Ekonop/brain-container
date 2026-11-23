"use client";

export default function ConnectorsPage() {
  const connectors = [
    { name: "Local Folder", icon: "📂", status: "Available", desc: "Index files from a local directory" },
    { name: "Notion", icon: "📝", status: "Coming Soon", desc: "Sync Notion workspace pages" },
    { name: "Obsidian", icon: "💎", status: "Coming Soon", desc: "Import Obsidian vault notes" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Connectors</h2>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {connectors.map((c) => (
          <div key={c.name} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{c.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{c.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.desc}</div>
              </div>
            </div>
            <span className={`badge ${c.status === "Available" ? "badge-success" : "badge-warning"}`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
