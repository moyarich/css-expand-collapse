import remarkCodeGroup from "./src/components/CodeGroup/remarkCodeGroup";
import rehypeShiki from "@shikijs/rehype";
import rehypeExtractToc from "@stefanprobst/rehype-extract-toc";
import rehypeExtractTocExport from "@stefanprobst/rehype-extract-toc/mdx";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { fileURLToPath, URL } from "node:url";
import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.PLAYGROUND_BASE_PATH || "/",
  plugins: [
    {
      ...mdx({
        format: "mdx",
        mdxExtensions: [".md", ".mdx"],
        include: /\.mdx?$/,
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [
          remarkGfm,
          remarkCodeGroup,
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
        ],
        rehypePlugins: [
          rehypeSlug,
          rehypeExtractToc,
          rehypeExtractTocExport,
          [rehypeShiki, { theme: "github-light", fallbackLanguage: "text" }],
        ],
      }),
      enforce: "pre",
    },
    react({ include: /\.(jsx|tsx|mdx?)$/ }),
  ],
  resolve: {
    alias: {
      "@moyarich/css-expand-collapse": fileURLToPath(
        new URL(
          "../../packages/css-expand-collapse/src/index.ts",
          import.meta.url,
        ),
      ),
    },
  },
});
