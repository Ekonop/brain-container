export default function HomePage() {
  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "4px" }}>Brain Container</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px", fontSize: "14px" }}>
        Privacy-first local AI platform
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
        {[
          { title: "Chat", desc: "Query with RAG + tools", href: "/chat" },
          { title: "Collections", desc: "Manage documents", href: "/collections" },
          { title: "Plugins", desc: "Extend functionality", href: "/plugins" },
          { title: "Dashboard", desc: "System status", href: "/dashboard" },
          { title: "Settings", desc: "Configure provider", href: "/settings" },
          { title: "Connectors", desc: "Data sources", href: "/connectors" },
        ].map((item) => (
          <a key={item.href} href={item.href} className="surface" style={{
            padding: "16px", textDecoration: "none", color: "var(--text)",
            transition: "border-color 0.1s", display: "block",
          }}>
            <div style={{ fontWeight: 500, fontSize: "14px", marginBottom: "4px" }}>{item.title}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
