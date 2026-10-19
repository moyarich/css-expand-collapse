import { registry } from "virtual:content-registry";
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
  pageFile: string;
  Component: ComponentType;
  tableOfContents: TocEntry[];
}

export const FUNCTION_EXAMPLES: readonly FunctionExample[] =
  registry.APIPlayground;

export const DEFAULT_FUNCTION_EXAMPLE = FUNCTION_EXAMPLES.find(
  (example) => example.id === "expand-shorthand",
)!;
