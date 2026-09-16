import { withCssomFallback } from "../expanders.js";
import type { DeclarationMap, ShorthandDefinition, ShorthandExpander } from "../types.js";

const longhands = ["flex-direction", "flex-wrap"] as const;

const expandPure: ShorthandExpander = (value, context) => {
  const tokens = context.splitWhitespace(value);
  if (tokens.length < 1 || tokens.length > 2) return null;

  const result: DeclarationMap = { "flex-direction": "row", "flex-wrap": "nowrap" };
  for (const token of tokens) {
    const direction = context.matchProperty("flex-direction", token);
    const wrap = context.matchProperty("flex-wrap", token);
    if (direction === wrap) return null;
    result[direction ? "flex-direction" : "flex-wrap"] = token;
  }
  return result;
};

const expand = withCssomFallback(expandPure);

export default { longhands, strategy: "flex-flow", expand } satisfies ShorthandDefinition;
