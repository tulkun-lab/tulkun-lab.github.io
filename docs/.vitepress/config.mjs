import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Tulkun",
  description: "Official documentation for Tulkun: local AI coding runtime, gateway APIs, memory systems, tools, skills, subagents, and sandboxing.",
  cleanUrls: true,
  ignoreDeadLinks: true,
  lastUpdated: true,
  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark"
    }
  },
  themeConfig: {
    logo: "/mark.svg",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Configuration", link: "/config/overview" },
      { text: "Develop", link: "/develop/build-and-release" },
      { text: "GitHub", link: "https://github.com/tulkun-lab/tulkun" }
    ],
    sidebar: {
      "/guide/": [
        { text: "Getting Started", link: "/guide/getting-started" },
        { text: "CLI and Surfaces", link: "/guide/cli-and-surfaces" },
        { text: "Architecture", link: "/guide/architecture" },
        { text: "Context and Compaction", link: "/guide/context-and-compaction" },
        { text: "Memory Systems", link: "/guide/memory-systems" },
        { text: "Skills and Tools", link: "/guide/skills-and-tools" },
        { text: "Subagents", link: "/guide/subagents" },
        { text: "Agent Collaboration Modes", link: "/guide/agent-collaboration-modes" },
        { text: "Safety Model", link: "/guide/safety-model" },
        { text: "GitHub Issue Autofix", link: "/guide/github-issue-autofix" },
        { text: "CLI Command Reference", link: "/guide/cli-command-reference" },
        { text: "Telemetry", link: "/guide/telemetry" }
      ],
      "/config/": [
        {
          text: "Configuration Reference",
          items: [
            { text: "Configuration Reference", link: "/config/overview" },
            { text: "Runtime, Gateway, And Channels", link: "/config/runtime-gateway-and-channels" },
            { text: "Agents and Models", link: "/config/agents-and-models" },
            { text: "Sandbox and Permissions", link: "/config/sandbox-and-permissions" },
            { text: "Memory, Compaction, And Runtime Features", link: "/config/memory-and-runtime-features" },
            { text: "Hooks And Skill Extensions", link: "/config/hooks-and-skill-extensions" }
          ]
        }
      ],
      "/develop/": [
        {
          text: "Develop",
          items: [
            { text: "Build and Release", link: "/develop/build-and-release" }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/tulkun-lab/tulkun" }
    ],
    footer: {
      message: "Official product documentation for Tulkun.",
      copyright: "Copyright © Tulkun Lab"
    },
    outline: {
      level: [2, 3]
    },
    search: {
      provider: "local"
    }
  }
});
