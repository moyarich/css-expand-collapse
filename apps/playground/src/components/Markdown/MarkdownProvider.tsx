import "./Markdown.css";
import { MDXProvider } from "@mdx-js/react";
import { mdxComponents } from "../../mdx/mdx-components";
import type { ReactNode } from "react";

export function MarkdownProvider({ children }: { children: ReactNode }) {
  return (
    <div className="markdown-content">
      <MDXProvider components={mdxComponents}>{children}</MDXProvider>
    </div>
  );
}
