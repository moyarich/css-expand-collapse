import { withCssomFallback } from "../expanders.js";
import type { DeclarationMap, ShorthandDefinition, ShorthandExpander } from "../types.js";

const longhands = [
  "text-decoration-line",
  "text-decoration-style",
  "text-decoration-color",
  "text-decoration-thickness",
] as const;

const expandPure: ShorthandExpander = (value, context) => {
  const tokens = context.splitWhitespace(value);
  if (!tokens.length) return null;

  const result: DeclarationMap = {
    "text-decoration-line": "none",
    "text-decoration-style": "solid",
    "text-decoration-color": "currentcolor",
    "text-decoration-thickness": "auto",
  };
  const lineTokens: string[] = [];
  const assigned = new Set<string>();

  for (const token of tokens) {
    if (context.matchProperty("text-decoration-line", token)) {
      lineTokens.push(token);
      continue;
    }

    const candidates = longhands
      .filter((property) => property !== "text-decoration-line" && !assigned.has(property))
      .filter((property) => context.matchProperty(property, token));
    if (candidates.length !== 1) return null;
    result[candidates[0]!] = token;
    assigned.add(candidates[0]!);
  }

  if (lineTokens.length) {
    const joined = lineTokens.join(" ");
    if (!context.matchProperty("text-decoration-line", joined)) return null;
    result["text-decoration-line"] = joined;
  }

  return result;
};

const expand = withCssomFallback(expandPure);

export default { longhands, strategy: "text-decoration", expand } satisfies ShorthandDefinition;
