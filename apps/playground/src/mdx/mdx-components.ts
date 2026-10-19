import { CodeBlock } from "../components/CodeBlock";
import { CodeGroup, CodeTab } from "../components/CodeGroup";
import { Outline } from "../components/Outline/Outline";
import { icons } from "lucide-react";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  ...icons,
  Outline,
  CodeGroup,
  CodeTab,
  pre: CodeBlock,
};
