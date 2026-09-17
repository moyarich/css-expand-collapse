import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = ["text-emphasis-style", "text-emphasis-color"] as const;
const initialValues = ["none", "currentcolor"] as const;

const expand: ShorthandExpander = (value, context) => {
  const tokens = context.splitWhitespace(value);
  if (!tokens.length) return null;

  if (context.matchProperty(longhands[0], value)) {
    return { [longhands[0]]: value, [longhands[1]]: initialValues[1] };
  }
  if (context.matchProperty(longhands[1], value)) {
    return { [longhands[0]]: initialValues[0], [longhands[1]]: value };
  }

  for (let split = 1; split < tokens.length; split += 1) {
    const left = tokens.slice(0, split).join(" ");
    const right = tokens.slice(split).join(" ");
    if (context.matchProperty(longhands[0], left) && context.matchProperty(longhands[1], right)) {
      return { [longhands[0]]: left, [longhands[1]]: right };
    }
    if (context.matchProperty(longhands[1], left) && context.matchProperty(longhands[0], right)) {
      return { [longhands[0]]: right, [longhands[1]]: left };
    }
  }

  return null;
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  initialValues,
  expand,
  collapse(declarations, context) {
    const style = declarations[longhands[0]];
    const color = declarations[longhands[1]];
    if (!style || !color) return null;
    const candidates = [
      `${style} ${color}`,
      color === initialValues[1] ? style : "",
      style === initialValues[0] ? color : "",
    ].filter(Boolean);
    return candidates.find((candidate) => context.matchProperty("text-emphasis", candidate)) ?? null;
  },
} satisfies ShorthandModule;
