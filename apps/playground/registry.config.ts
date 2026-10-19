import type { PresetRegistryConfig } from "./vite-plugins/preset-registry/preset-registry";

export default {
  sources: {
    APIPlayground: {
      base: "../../examples/APIPlayground",
      source: "source.tsx",
      kind: "api",
    },
    CSSConverter: {
      base: "../../examples/CSSConverter",
      source: "source.css",
      kind: "converter",
    },
  },
} satisfies PresetRegistryConfig;
