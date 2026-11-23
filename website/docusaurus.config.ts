import type { Config } from "@docusaurus/types";

const config: Config = {
  title: "Brain Container",
  tagline: "Privacy-first local AI platform",
  url: "https://braincontainer.dev",
  baseUrl: "/",
  favicon: "img/favicon.ico",
  organizationName: "your-org",
  projectName: "brain-container",
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: "Brain Container",
      items: [
        { to: "/docs/intro", label: "Docs", position: "left" },
        { to: "/blog", label: "Blog", position: "left" },
        { href: "https://github.com/your-org/brain-container", label: "GitHub", position: "right" },
      ],
    },
  },
};

export default config;
