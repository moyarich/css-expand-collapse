import type { DeclarationMap, ShorthandCollapser, ShorthandExpander, ShorthandModule } from "../types.js";

const longhands = new Map([
  ["text-decoration-line", "none"],
  ["text-decoration-style", "solid"],
  ["text-decoration-color", "currentcolor"],
  ["text-decoration-thickness", "auto"],
] as const);
const longhandNames = [...longhands.keys()];

const expand: ShorthandExpander = (value, context) => {
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
    const candidates = longhandNames.filter((property) => property !== "text-decoration-line" && !assigned.has(property))
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

const collapse: ShorthandCollapser = (declarations, context) => {
  const line = declarations["text-decoration-line"]?.trim();
  const style = declarations["text-decoration-style"]?.trim();
  const color = declarations["text-decoration-color"]?.trim();
  const thickness = declarations["text-decoration-thickness"]?.trim();
  if (!line || !style || !color || !thickness) return null;
  const parts = [line];
  if (style !== "solid") parts.push(style);
  if (color !== "currentcolor") parts.push(color);
  if (thickness !== "auto") parts.push(thickness);
  const candidate = parts.join(" ");
  return context.matchProperty("text-decoration", candidate) ? candidate : null;
};

export default { longhands, expand, collapse } satisfies ShorthandModule;
