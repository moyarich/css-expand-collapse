declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { TocEntry } from "../../../examples/types";
  export const frontmatter: Record<string, unknown>;
  export const tableOfContents: TocEntry[];
  const MDXContent: ComponentType;
  export default MDXContent;
}

declare module "*.md" {
  export { default, frontmatter, tableOfContents } from "*.mdx";
}

declare module "virtual:example-registry" {
  export const registry: {
    APIPlayground: readonly import("../../../examples/APIPlayground").FunctionExample[];
    CSSConverter: readonly import("../../../examples/CSSConverter").CSSConverterExample[];
  };
}
