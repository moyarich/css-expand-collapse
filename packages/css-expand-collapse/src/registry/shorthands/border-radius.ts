import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["border-top-left-radius", "0"],
  ["border-top-right-radius", "0"],
  ["border-bottom-right-radius", "0"],
  ["border-bottom-left-radius", "0"],
] as const);
const longhandNames = [...longhands.keys()];

function expandQuadValues(tokens: string[]): string[] | null {
  if (tokens.length < 1 || tokens.length > 4) return null;
  const [a, b = a, c = a, d = b] = tokens;
  return tokens.length === 3 ? [a!, b!, c!, b!] : [a!, b!, c!, d!];
}

function compressQuad(values: readonly string[]): string {
  const [a, b, c, d] = values;
  if (a === b && a === c && a === d) return a!;
  if (a === c && b === d) return `${a} ${b}`;
  if (b === d) return `${a} ${b} ${c}`;
  return values.join(" ");
}

const expand: ShorthandExpander = (value, context) => {
  if (!context.matchProperty("border-radius", value)) return null;
  const parts = context.splitSlash(value);
  if (parts.length > 2 || parts.some((part) => !part)) return null;
  const horizontal = expandQuadValues(context.splitWhitespace(parts[0]!));
  const vertical = expandQuadValues(context.splitWhitespace(parts[1] ?? parts[0]!));
  if (!horizontal || !vertical) return null;

  return Object.fromEntries(
    longhandNames.map((longhand, index) => [
      longhand,
      horizontal[index] === vertical[index]
        ? horizontal[index]!
        : `${horizontal[index]} ${vertical[index]}`,
    ]),
  );
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: true,
  expand,
  collapse(declarations, context) {
    const horizontal: string[] = [];
    const vertical: string[] = [];
    for (const longhand of longhandNames) {
      const value = declarations[longhand];
      if (!value) return null;
      const tokens = context.matchProperty(longhand, value) ? value.trim().split(/\s+/) : [];
      if (tokens.length < 1 || tokens.length > 2) return null;
      horizontal.push(tokens[0]!);
      vertical.push(tokens[1] ?? tokens[0]!);
    }
    const h = compressQuad(horizontal);
    const v = compressQuad(vertical);
    const candidate = h === v ? h : `${h} / ${v}`;
    return context.matchProperty("border-radius", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
