import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["grid-row-start", "auto"],
  ["grid-column-start", "auto"],
  ["grid-row-end", "auto"],
  ["grid-column-end", "auto"],
] as const);
const longhandNames = [...longhands.keys()];

function omittedValue(start: string): string {
  return /^-?[_a-zA-Z][-_a-zA-Z0-9]*$/.test(start) && start !== "auto" && start !== "span"
    ? start
    : "auto";
}

const expand: ShorthandExpander = (value, context) => {
  const parts = context.splitSlash(value);
  if (!parts.length || parts.length > 4 || parts.some((part) => !part)) return null;

  const rowStart = parts[0]!;
  const columnStart = parts[1] ?? omittedValue(rowStart);
  const rowEnd = parts[2] ?? omittedValue(rowStart);
  const columnEnd = parts[3] ?? omittedValue(columnStart);
  const values = [rowStart, columnStart, rowEnd, columnEnd] as const;

  if (values.some((candidate, index) => !context.matchProperty(longhandNames[index]!, candidate))) {
    return null;
  }

  return Object.fromEntries(longhandNames.map((longhand, index) => [longhand, values[index]!])) as Record<string, string>;
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const values = longhandNames.map((longhand) => declarations[longhand]);
    if (values.some((value) => !value)) return null;
    const candidate = values.join(" / ");
    return context.matchProperty("grid-area", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
