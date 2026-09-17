import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = ["text-box-trim", "text-box-edge"] as const;
const initialValues = ["none", "auto"] as const;

const expand: ShorthandExpander = (value, context) => {
  if (context.matchProperty(longhands[0], value)) {
    return { [longhands[0]]: value, [longhands[1]]: initialValues[1] };
  }
  if (context.matchProperty(longhands[1], value)) {
    return { [longhands[0]]: initialValues[0], [longhands[1]]: value };
  }

  const tokens = context.splitWhitespace(value);
  for (let split = 1; split < tokens.length; split += 1) {
    const trim = tokens.slice(0, split).join(" ");
    const edge = tokens.slice(split).join(" ");
    if (context.matchProperty(longhands[0], trim) && context.matchProperty(longhands[1], edge)) {
      return { [longhands[0]]: trim, [longhands[1]]: edge };
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
    const trim = declarations[longhands[0]];
    const edge = declarations[longhands[1]];
    if (!trim || !edge) return null;
    const candidates = [
      `${trim} ${edge}`,
      edge === initialValues[1] ? trim : "",
      trim === initialValues[0] ? edge : "",
    ].filter(Boolean);
    return candidates.find((candidate) => context.matchProperty("text-box", candidate)) ?? null;
  },
} satisfies ShorthandModule;
