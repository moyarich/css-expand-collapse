import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["animation-range-start", "normal"],
  ["animation-range-end", "normal"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];

const expand: ShorthandExpander = (value, context) => {
  const tokens = context.splitWhitespace(value);
  if (!tokens.length) return null;

  for (let split = 1; split < tokens.length; split += 1) {
    const start = tokens.slice(0, split).join(" ");
    const end = tokens.slice(split).join(" ");
    if (
      context.matchProperty(longhandNames[0]!, start) &&
      context.matchProperty(longhandNames[1]!, end)
    ) {
      return { [longhandNames[0]!]: start, [longhandNames[1]!]: end };
    }
  }

  return context.matchProperty(longhandNames[0]!, value)
    ? { [longhandNames[0]!]: value, [longhandNames[1]!]: initialValues[1]! }
    : null;
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const start = declarations[longhandNames[0]];
    const end = declarations[longhandNames[1]];
    if (!start || !end) return null;
    const candidates = end === initialValues[1]
      ? [start, `${start} ${end}`]
      : [`${start} ${end}`];
    return candidates.find((candidate) => context.matchProperty("animation-range", candidate)) ?? null;
  },
} satisfies ShorthandModule;
