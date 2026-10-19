import type { PlaygroundExamplesConfig } from "./vite-plugins/playground-examples/playground-examples";

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
} satisfies PlaygroundExamplesConfig;
