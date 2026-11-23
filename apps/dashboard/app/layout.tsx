import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brain Container",
  description: "Privacy-first local AI platform",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat" },
  { href: "/collections", label: "Collections" },
  { href: "/plugins", label: "Plugins" },
  { href: "/connectors", label: "Connectors" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <nav style={{
            width: 200, borderRight: "1px solid var(--border)", padding: "20px 12px",
            display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0,
          }}>
            <div style={{ padding: "0 8px 16px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "8px" }}>
              <span style={{ fontWeight: 600, fontSize: "14px" }}>Brain Container</span>
            </div>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="btn btn-ghost" style={{ justifyContent: "flex-start", width: "100%" }}>
                {item.label}
              </Link>
            ))}
          </nav>
          <main style={{ flex: 1, padding: "32px 40px", maxWidth: 960, overflow: "auto" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
