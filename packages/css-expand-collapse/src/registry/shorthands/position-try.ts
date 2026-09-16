import type { ShorthandDefinition, ShorthandExpander } from "../types.js";

const longhands = ["position-try-order", "position-try-fallbacks"] as const;
const initialValues = ["normal", "none"] as const;

const expand: ShorthandExpander = (value, context) => {
  if (context.matchProperty(longhands[1], value)) {
    return { [longhands[0]]: initialValues[0], [longhands[1]]: value };
  }

  const tokens = context.splitWhitespace(value);
  if (tokens.length < 2) return null;
  const order = tokens[0]!;
  const fallbacks = tokens.slice(1).join(" ");
  if (!context.matchProperty(longhands[0], order) || !context.matchProperty(longhands[1], fallbacks)) {
    return null;
  }
  return { [longhands[0]]: order, [longhands[1]]: fallbacks };
};

export default {
  longhands,
  strategy: "csstree",
  initialValues,
  expand,
  collapse(declarations, context) {
    const order = declarations[longhands[0]];
    const fallbacks = declarations[longhands[1]];
    if (!order || !fallbacks) return null;
    const candidates = order === initialValues[0]
      ? [fallbacks, `${order} ${fallbacks}`]
      : [`${order} ${fallbacks}`];
    return candidates.find((candidate) => context.matchProperty("position-try", candidate)) ?? null;
  },
} satisfies ShorthandDefinition;
