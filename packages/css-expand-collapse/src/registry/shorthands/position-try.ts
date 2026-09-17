import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["position-try-order", "normal"],
  ["position-try-fallbacks", "none"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];

const expand: ShorthandExpander = (value, context) => {
  if (context.matchProperty(longhandNames[1], value)) {
    return { [longhandNames[0]]: initialValues[0], [longhandNames[1]]: value };
  }

  const tokens = context.splitWhitespace(value);
  if (tokens.length < 2) return null;
  const order = tokens[0]!;
  const fallbacks = tokens.slice(1).join(" ");
  if (!context.matchProperty(longhandNames[0], order) || !context.matchProperty(longhandNames[1], fallbacks)) {
    return null;
  }
  return { [longhandNames[0]]: order, [longhandNames[1]]: fallbacks };
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const order = declarations[longhandNames[0]];
    const fallbacks = declarations[longhandNames[1]];
    if (!order || !fallbacks) return null;
    const candidates = order === initialValues[0]
      ? [fallbacks, `${order} ${fallbacks}`]
      : [`${order} ${fallbacks}`];
    return candidates.find((candidate) => context.matchProperty("position-try", candidate)) ?? null;
  },
} satisfies ShorthandModule;
