import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Tulkun",
  description: "Official documentation for Tulkun: local AI coding runtime, gateway APIs, memory systems, tools, skills, subagents, sandboxing, and workboards.",
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
      { text: "Docs", link: "/guide/getting-started" },
      { text: "Core Mechanics", link: "/mechanics/architecture" },
      { text: "Configuration", link: "/config/overview" },
      { text: "Develop", link: "/develop/build-and-release" },
      { text: "GitHub", link: "https://github.com/tulkun-lab/tulkun" }
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Start Here",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "First Session Tutorial", link: "/guide/first-session-tutorial" },
            { text: "CLI and Surfaces", link: "/guide/cli-and-surfaces" },
            { text: "Telemetry", link: "/guide/telemetry" },
            { text: "CLI Command Reference", link: "/guide/cli-command-reference" },
            { text: "GitHub Issue Autofix", link: "/guide/github-issue-autofix" }
          ]
        }
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
            { text: "Hooks, TUI, And Skill Extensions", link: "/config/hooks-tui-and-skill-extensions" }
          ]
        }
      ],
      "/mechanics/": [
        {
          text: "Core Mechanics",
          items: [
            { text: "Architecture", link: "/mechanics/architecture" },
            { text: "Context and Compaction", link: "/mechanics/context-and-compaction" },
            { text: "Memory Systems", link: "/mechanics/memory-systems" },
            { text: "Skills and Tools", link: "/mechanics/skills-and-tools" },
            { text: "Subagents and Workboards", link: "/mechanics/subagents-and-workboards" },
            { text: "Safety Model", link: "/mechanics/safety-model" }
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
