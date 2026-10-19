import type { ContentRegistryConfig } from "./vite-plugins/content-registry/content-registry";

export default {
  sources: {
    Docs: { base: "../../docs", kind: "docs", pages: ["page.mdx"] },
    APIPlayground: {
      base: "../../examples/APIPlayground",
      source: "source.tsx",
      kind: "api",
      pages: ["page.md", "page.mdx"],
    },
    CSSConverter: {
      base: "../../examples/CSSConverter",
      source: "source.css",
      kind: "converter",
      pages: ["page.md", "page.mdx"],
      modes: ["expand", "collapse"],
    },
  },
} satisfies ContentRegistryConfig;
