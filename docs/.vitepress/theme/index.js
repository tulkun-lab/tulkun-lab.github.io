import DefaultTheme from "vitepress/theme";
import mermaid from "mermaid";
import "./style.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof window === "undefined") {
      return;
    }
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "neutral"
    });
    const renderMermaid = async () => {
      const blocks = document.querySelectorAll(".language-mermaid pre code");
      for (const block of blocks) {
        if (block.dataset.mermaidRendered === "true") {
          continue;
        }
        const source = block.textContent || "";
        if (!source.trim()) {
          continue;
        }
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        try {
          const { svg } = await mermaid.render(id, source);
          const wrapper = document.createElement("div");
          wrapper.className = "mermaid-render";
          wrapper.innerHTML = svg;
          const host = block.closest(".language-mermaid");
          if (!host) {
            continue;
          }
          const existing = host.querySelector(".mermaid-render");
          if (existing) {
            existing.remove();
          }
          host.appendChild(wrapper);
          block.dataset.mermaidRendered = "true";
        } catch (error) {
          console.error("Failed to render mermaid diagram", error);
        }
      }
    };
    router.onAfterRouteChanged = () => {
      requestAnimationFrame(() => {
        renderMermaid();
      });
    };
    requestAnimationFrame(() => {
      renderMermaid();
    });
  }
};
