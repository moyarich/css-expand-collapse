import type { ExampleRegistryConfig } from "./vite-plugins/example-registry/example-registry";

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
} satisfies ExampleRegistryConfig;
