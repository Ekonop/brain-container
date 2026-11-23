import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

export default function Home(): JSX.Element {
  return (
    <Layout title="Home" description="Privacy-first local AI platform">
      <main style={{ padding: "4rem 1rem", maxWidth: 960, margin: "0 auto" }}>
        <h1>Brain Container OS</h1>
        <p>Privacy-first local AI platform. Run your own RAG + plugins locally, connect from web or mobile.</p>
        <p>
          <Link to="/docs/intro">Get Started →</Link>
        </p>
        <section style={{ marginTop: "2rem" }}>
          <h2>Features</h2>
          <ul>
            <li>Local RAG with ChromaDB + llama.cpp</li>
            <li>Plugin system (sandboxed)</li>
            <li>Cloudflare Tunnel pairing for remote access</li>
            <li>Flutter mobile client + Next.js dashboard</li>
          </ul>
        </section>
      </main>
    </Layout>
  );
}
