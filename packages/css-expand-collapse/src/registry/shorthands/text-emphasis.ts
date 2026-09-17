import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["text-emphasis-style", "none"],
  ["text-emphasis-color", "currentcolor"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];

const expand: ShorthandExpander = (value, context) => {
  const tokens = context.splitWhitespace(value);
  if (!tokens.length) return null;

  if (context.matchProperty(longhandNames[0], value)) {
    return { [longhandNames[0]]: value, [longhandNames[1]]: initialValues[1] };
  }
  if (context.matchProperty(longhandNames[1], value)) {
    return { [longhandNames[0]]: initialValues[0], [longhandNames[1]]: value };
  }

  for (let split = 1; split < tokens.length; split += 1) {
    const left = tokens.slice(0, split).join(" ");
    const right = tokens.slice(split).join(" ");
    if (context.matchProperty(longhandNames[0], left) && context.matchProperty(longhandNames[1], right)) {
      return { [longhandNames[0]]: left, [longhandNames[1]]: right };
    }
    if (context.matchProperty(longhandNames[1], left) && context.matchProperty(longhandNames[0], right)) {
      return { [longhandNames[0]]: right, [longhandNames[1]]: left };
    }
  }

  return null;
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const style = declarations[longhandNames[0]];
    const color = declarations[longhandNames[1]];
    if (!style || !color) return null;
    const candidates = [
      `${style} ${color}`,
      color === initialValues[1] ? style : "",
      style === initialValues[0] ? color : "",
    ].filter(Boolean);
    return candidates.find((candidate) => context.matchProperty("text-emphasis", candidate)) ?? null;
  },
} satisfies ShorthandModule;
