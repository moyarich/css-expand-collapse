import remarkCodeGroup from "../../src/components/CodeGroup/remarkCodeGroup";
import rehypeShiki from "@shikijs/rehype";
import rehypeExtractToc from "@stefanprobst/rehype-extract-toc";
import rehypeExtractTocExport from "@stefanprobst/rehype-extract-toc/mdx";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import type { Options } from "@mdx-js/rollup";

export const mdxOptions: Options = {
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
};
