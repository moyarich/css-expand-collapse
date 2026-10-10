import type { TocEntry } from "../types";
import type { ComponentType } from "react";

export interface FunctionExampleMeta {
  id: string;
  label: string;
  description: string;
  order: number;
}

export interface FunctionExample {
  id: string;
  label: string;
  description: string;
  source: string;
  pageFile: string;
  Component: ComponentType;
  tableOfContents: TocEntry[];
}

const sourceModules = import.meta.glob("./*/source.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const pageModules = import.meta.glob("./*/page.{md,mdx}", {
  eager: true,
}) as Record<
  string,
  {
    frontmatter: FunctionExampleMeta;
    default: ComponentType;
    tableOfContents: TocEntry[];
  }
>;

export const FUNCTION_EXAMPLES: readonly FunctionExample[] = Object.entries(
  pageModules,
)
  .map(([path, page]) => {
    const metadata = page.frontmatter;
    const id = path.split("/").at(-2)!;
    const source = sourceModules[`./${id}/source.tsx`];
    if (!source) throw new Error(`Missing source.tsx for API example: ${id}`);
    if (metadata.id !== id)
      throw new Error(`API example metadata id mismatch: ${id}`);
    return {
      ...metadata,
      source,
      pageFile: path.split("/").at(-1)!,
      Component: page.default,
      tableOfContents: page.tableOfContents,
    };
  })
  .sort((a, b) => a.order - b.order)
  .map(({ order: _order, ...example }) => example);

export const DEFAULT_FUNCTION_EXAMPLE = FUNCTION_EXAMPLES.find(
  (example) => example.id === "expand-shorthand",
)!;
