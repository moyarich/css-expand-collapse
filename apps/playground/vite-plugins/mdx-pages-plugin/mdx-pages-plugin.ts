import mdx from "@mdx-js/rollup";
import type { Plugin } from "vite";
import { mdxOptions } from "./mdx-options";

/** Compile pages while leaving explicit Vite raw/URL imports as data. */
export function mdxPagesPlugin(): Plugin {
  const plugin = mdx(mdxOptions);
  return {
    ...plugin,
    // Match moyaforge-cli: MDX must compile before React/Babel sees YAML frontmatter.
    enforce: "pre",
    transform(code, id) {
      const query = new URLSearchParams(id.split("?")[1]);
      if (query.has("raw") || query.has("url")) return;
      return plugin.transform.call(this, code, id);
    },
  };
}
