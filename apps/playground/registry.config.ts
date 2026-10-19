import type { PresetRegistryConfig } from "./vite-plugins/preset-registry/preset-registry";

export default {
  sources: {
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
} satisfies PresetRegistryConfig;
