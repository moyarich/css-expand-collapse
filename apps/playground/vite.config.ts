/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { mdxPagesPlugin } from "./vite-plugins/mdx-pages-plugin/mdx-pages-plugin";
import registry from "./registry.config";
import { contentRegistryPlugin } from "./vite-plugins/content-registry/content-registry-plugin";

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project beneath /css-expand-collapse/.
  // Preserve root-relative assets for local development and allow explicit overrides.
  base:
    process.env.PLAYGROUND_BASE_PATH ||
    (command === "build" ? "/css-expand-collapse/" : "/"),
  plugins: [
    contentRegistryPlugin(registry),
    mdxPagesPlugin(),
    react({ include: /\.(jsx|tsx|mdx?)$/ }),
  ],
  css: { devSourcemap: true },
  build: { sourcemap: true },
  define: {
    "process.env": JSON.stringify({
      NODE_ENV: "development",
      BStyle_CSSTREE_LOG_LEVEL: "ERROR",
    }),
  },
  resolve: {
    alias: {
      "@moyarich/css-expand-collapse": fileURLToPath(
        new URL(
          "../../packages/css-expand-collapse/src/index.ts",
          import.meta.url,
        ),
      ),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
