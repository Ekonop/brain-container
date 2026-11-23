"use client";

const connectors = [
  { name: "Local Folder", icon: "📂", status: "available", desc: "Index files from a local directory" },
  { name: "Notion", icon: "📝", status: "coming soon", desc: "Sync Notion workspace pages" },
  { name: "Obsidian", icon: "💎", status: "coming soon", desc: "Import Obsidian vault notes" },
];

export default function ConnectorsPage() {
  return (
    <div>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "24px" }}>Connectors</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {connectors.map((c) => (
          <div key={c.name} className="surface" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}>{c.icon}</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: "13px" }}>{c.name}</div>
                <div className="text-muted" style={{ fontSize: "12px" }}>{c.desc}</div>
              </div>
            </div>
            <span className={`badge ${c.status === "available" ? "badge-success" : "badge-warning"}`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
