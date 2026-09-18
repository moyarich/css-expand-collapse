import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["font-synthesis-weight", "auto"],
  ["font-synthesis-style", "auto"],
  ["font-synthesis-small-caps", "auto"],
  ["font-synthesis-position", "none"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];

const expand: ShorthandExpander = (value, context) => {
  if (value === "none") {
    return Object.fromEntries(longhandNames.map((longhand) => [longhand, "none"]));
  }

  const tokens = context.splitWhitespace(value);
  if (!tokens.length) return null;

  const result = Object.fromEntries(
    longhandNames.map((longhand, index) => [longhand, initialValues[index]!]),
  ) as DeclarationMap;
  const assigned = new Set<string>();

  for (const token of tokens) {
    const candidates = longhandNames.filter(
      (property) => !assigned.has(property) && context.matchProperty(property, token),
    );
    if (!candidates.length) return null;

    const property = candidates[0]!;
    result[property] = token;
    assigned.add(property);
  }

  return result;
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const values = longhandNames.map((longhand) => declarations[longhand]);
    if (values.some((value) => !value)) return null;
    if (values.every((value) => value === "none")) return "none";
    const candidate = values
      .filter((value, index) => value !== initialValues[index])
      .join(" ");
    if (candidate && context.matchProperty("font-synthesis", candidate)) return candidate;
    const full = values.join(" ");
    return context.matchProperty("font-synthesis", full) ? full : null;
  },
} satisfies ShorthandModule;
