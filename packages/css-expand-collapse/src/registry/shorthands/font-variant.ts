import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["font-variant-alternates", "normal"],
  ["font-variant-caps", "normal"],
  ["font-variant-east-asian", "normal"],
  ["font-variant-emoji", "normal"],
  ["font-variant-ligatures", "normal"],
  ["font-variant-numeric", "normal"],
  ["font-variant-position", "normal"],
] as const);
const longhandNames = [...longhands.keys()];

const expand: ShorthandExpander = (value, context) => {
  if (value === "normal") {
    return Object.fromEntries(longhandNames.map((longhand) => [longhand, "normal"]));
  }
  if (value === "none") {
    return Object.fromEntries(
      longhandNames.map((longhand) => [longhand, longhand === "font-variant-ligatures" ? "none" : "normal"]),
    );
  }

  const result = Object.fromEntries(longhandNames.map((longhand) => [longhand, "normal"])) as DeclarationMap;
  const assigned = new Set<string>();

  for (const token of context.splitWhitespace(value)) {
    const candidates = longhandNames.flatMap((longhand) => {
      const candidate = assigned.has(longhand) ? `${result[longhand]} ${token}` : token;
      return context.matchProperty(longhand, candidate) ? [{ longhand, candidate }] : [];
    });
    if (!candidates.length) return null;

    const choice = candidates[0]!;
    result[choice.longhand] = choice.candidate;
    assigned.add(choice.longhand);
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
    if (values.every((value) => value === "normal")) return "normal";
    if (
      declarations["font-variant-ligatures"] === "none" &&
      longhandNames.filter((longhand) => longhand !== "font-variant-ligatures")
        .every((longhand) => declarations[longhand] === "normal")
    ) return "none";

    const compact = values.filter((value) => value !== "normal").join(" ");
    if (compact && context.matchProperty("font-variant", compact)) return compact;
    const full = values.join(" ");
    return context.matchProperty("font-variant", full) ? full : null;
  },
} satisfies ShorthandModule;
