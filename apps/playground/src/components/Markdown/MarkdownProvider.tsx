import { CodeBlock } from "../CodeBlock";
import { CodeGroup, CodeTab } from "../CodeGroup";
import "./Markdown.css";
import { MDXProvider } from "@mdx-js/react";
import { icons } from "lucide-react";
import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import { Outline } from "../Outline/Outline";

const components: MDXComponents = {
  ...icons,
  Outline,
  CodeGroup,
  CodeTab,
  pre: CodeBlock,
};

export function MarkdownProvider({ children }: { children: ReactNode }) {
  return (
    <div className="markdown-content">
      <MDXProvider components={components}>{children}</MDXProvider>
    </div>
  );
}
