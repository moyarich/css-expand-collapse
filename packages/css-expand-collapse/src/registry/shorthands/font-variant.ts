import type { DeclarationMap, ShorthandDefinition, ShorthandExpander } from "../types.js";

const longhands = [
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
] as const;
const initialValues = longhands.map(() => "normal") as readonly string[];

const expand: ShorthandExpander = (value, context) => {
  if (value === "normal") {
    return Object.fromEntries(longhands.map((longhand) => [longhand, "normal"]));
  }
  if (value === "none") {
    return Object.fromEntries(
      longhands.map((longhand) => [longhand, longhand === "font-variant-ligatures" ? "none" : "normal"]),
    );
  }

  const result = Object.fromEntries(longhands.map((longhand) => [longhand, "normal"])) as DeclarationMap;
  const assigned = new Set<string>();

  for (const token of context.splitWhitespace(value)) {
    const candidates = longhands.flatMap((longhand) => {
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
  strategy: "csstree",
  initialValues,
  expand,
  collapse(declarations, context) {
    const values = longhands.map((longhand) => declarations[longhand]);
    if (values.some((value) => !value)) return null;
    if (values.every((value) => value === "normal")) return "normal";
    if (
      declarations["font-variant-ligatures"] === "none" &&
      longhands.filter((longhand) => longhand !== "font-variant-ligatures")
        .every((longhand) => declarations[longhand] === "normal")
    ) return "none";

    const compact = values.filter((value) => value !== "normal").join(" ");
    if (compact && context.matchProperty("font-variant", compact)) return compact;
    const full = values.join(" ");
    return context.matchProperty("font-variant", full) ? full : null;
  },
} satisfies ShorthandDefinition;
