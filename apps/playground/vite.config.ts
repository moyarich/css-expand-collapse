import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/css-expand-collapse/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@moyarich/css-expand-collapse": fileURLToPath(
        new URL("../../packages/css-expand-collapse/src/index.ts", import.meta.url),
      ),
    },
  },
});
