import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = ["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"] as const;
const initialValues = ["auto", "auto", "auto", "auto"] as const;

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

  if (values.some((candidate, index) => !context.matchProperty(longhands[index]!, candidate))) {
    return null;
  }

  return Object.fromEntries(longhands.map((longhand, index) => [longhand, values[index]!])) as Record<string, string>;
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  initialValues,
  expand,
  collapse(declarations, context) {
    const values = longhands.map((longhand) => declarations[longhand]);
    if (values.some((value) => !value)) return null;
    const candidate = values.join(" / ");
    return context.matchProperty("grid-area", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
