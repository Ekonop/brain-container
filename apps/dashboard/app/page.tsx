export default function HomePage() {
  return (
    <div>
      <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>🧠 Brain Container</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "1rem" }}>
        Privacy-first local AI platform. Run RAG, plugins, and chat — all in your container.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        {[
          { title: "Chat", desc: "Test queries with RAG + tool calling", href: "/chat", icon: "💬" },
          { title: "Collections", desc: "Upload documents for RAG", href: "/collections", icon: "📁" },
          { title: "Plugins", desc: "Manage and run plugins", href: "/plugins", icon: "🔌" },
          { title: "Dashboard", desc: "System monitoring", href: "/dashboard", icon: "📊" },
          { title: "Settings", desc: "Configure LLM provider", href: "/settings", icon: "⚙️" },
          { title: "Connectors", desc: "External data sources", href: "/connectors", icon: "🔗" },
        ].map((item) => (
          <a key={item.href} href={item.href} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "1.25rem", textDecoration: "none",
            color: "var(--text)", transition: "border-color 0.15s",
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "0.25rem" }}>{item.title}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
