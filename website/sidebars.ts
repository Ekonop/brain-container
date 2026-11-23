import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    { type: "doc", id: "intro", label: "Introduction" },
    { type: "doc", id: "installation", label: "Installation" },
    { type: "doc", id: "usage", label: "Usage" },
    { type: "doc", id: "plugins", label: "Plugin Development" },
    { type: "doc", id: "architecture", label: "Architecture" },
    { type: "doc", id: "deployment", label: "Deployment" },
    { type: "doc", id: "troubleshooting", label: "Troubleshooting" },
  ],
};

export default sidebars;
