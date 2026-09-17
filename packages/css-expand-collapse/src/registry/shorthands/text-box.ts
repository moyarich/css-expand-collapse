import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["text-box-trim", "none"],
  ["text-box-edge", "auto"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];

const expand: ShorthandExpander = (value, context) => {
  if (context.matchProperty(longhandNames[0], value)) {
    return { [longhandNames[0]]: value, [longhandNames[1]]: initialValues[1] };
  }
  if (context.matchProperty(longhandNames[1], value)) {
    return { [longhandNames[0]]: initialValues[0], [longhandNames[1]]: value };
  }

  const tokens = context.splitWhitespace(value);
  for (let split = 1; split < tokens.length; split += 1) {
    const trim = tokens.slice(0, split).join(" ");
    const edge = tokens.slice(split).join(" ");
    if (context.matchProperty(longhandNames[0], trim) && context.matchProperty(longhandNames[1], edge)) {
      return { [longhandNames[0]]: trim, [longhandNames[1]]: edge };
    }
  }
  return null;
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const trim = declarations[longhandNames[0]];
    const edge = declarations[longhandNames[1]];
    if (!trim || !edge) return null;
    const candidates = [
      `${trim} ${edge}`,
      edge === initialValues[1] ? trim : "",
      trim === initialValues[0] ? edge : "",
    ].filter(Boolean);
    return candidates.find((candidate) => context.matchProperty("text-box", candidate)) ?? null;
  },
} satisfies ShorthandModule;
