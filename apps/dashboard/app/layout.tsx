import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brain Container Dashboard",
  description: "Privacy-first local AI platform dashboard",
};

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/collections", label: "Collections", icon: "📁" },
  { href: "/plugins", label: "Plugins", icon: "🔌" },
  { href: "/connectors", label: "Connectors", icon: "🔗" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "var(--bg)", color: "var(--text)" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside style={{
            width: 240, borderRight: "1px solid var(--border)",
            padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.25rem",
          }}>
            <div style={{ marginBottom: "1.5rem", paddingLeft: "0.5rem" }}>
              <h1 style={{ fontSize: "1.125rem", fontWeight: 700 }}>🧠 Brain Container</h1>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>Privacy-first AI</p>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.5rem 0.75rem", borderRadius: "8px",
                  fontSize: "0.875rem", color: "var(--text-muted)",
                  textDecoration: "none", transition: "all 0.15s",
                }}
              >
                <span>{item.icon}</span> {item.label}
              </Link>
            ))}
          </aside>
          <main style={{ flex: 1, padding: "2rem", overflow: "auto" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
