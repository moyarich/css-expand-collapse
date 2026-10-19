import { registry } from "virtual:content-registry";
import type { TocEntry } from "../types";
import type { ComponentType } from "react";

export type CSSConverterMode = "expand" | "collapse";

export interface CSSConverterExampleMeta {
  id: string;
  label: string;
  description: string;
  group: string;
  groupOrder: number;
  order: number;
  fillMissingLonghands: boolean;
}

export interface CSSConverterExample extends CSSConverterExampleMeta {
  key: string;
  mode: CSSConverterMode;
  source: string;
  pageFile: string;
  Component: ComponentType;
  tableOfContents: TocEntry[];
}

export const CSS_CONVERTER_EXAMPLES: readonly CSSConverterExample[] =
  registry.CSSConverter;

const groupOrder = new Map<string, number>();
for (const example of CSS_CONVERTER_EXAMPLES) {
  const current = groupOrder.get(example.group);
  if (current === undefined || example.groupOrder < current) {
    groupOrder.set(example.group, example.groupOrder);
  }
}

export const CSS_CONVERTER_GROUPS = [...groupOrder]
  .sort((a, b) => a[1] - b[1])
  .map(([group]) => group);

export const DEFAULT_CSS_CONVERTER_EXAMPLE = CSS_CONVERTER_EXAMPLES.find(
  (example) => example.key === "expand/text-decoration",
)!;
