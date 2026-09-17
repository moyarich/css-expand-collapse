import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["grid-template-rows", "none"],
  ["grid-template-columns", "none"],
  ["grid-template-areas", "none"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];

function isStringToken(token: string): boolean {
  return (token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"));
}

const expand: ShorthandExpander = (value, context) => {
  if (value === "none") {
    return Object.fromEntries(longhandNames.map((longhand, index) => [longhand, initialValues[index]!])) as Record<string, string>;
  }
  if (!context.matchProperty("grid-template", value)) return null;

  const slash = context.splitSlash(value);
  if (slash.length > 2 || slash.some((part) => !part)) return null;
  const left = slash[0]!;
  const columns = slash[1] ?? "none";
  if (columns !== "none" && !context.matchProperty("grid-template-columns", columns)) return null;

  if (context.matchProperty("grid-template-rows", left)) {
    return {
      "grid-template-rows": left,
      "grid-template-columns": columns,
      "grid-template-areas": "none",
    };
  }

  const tokens = context.splitWhitespace(left);
  const areaTokens = tokens.filter(isStringToken);
  if (!areaTokens.length) return null;
  const areas = areaTokens.join(" ");
  const rows = tokens.filter((token) => !isStringToken(token)).join(" ") || "auto";
  if (!context.matchProperty("grid-template-areas", areas)) return null;
  if (!context.matchProperty("grid-template-rows", rows)) return null;

  return {
    "grid-template-rows": rows,
    "grid-template-columns": columns,
    "grid-template-areas": areas,
  };
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const rows = declarations["grid-template-rows"];
    const columns = declarations["grid-template-columns"];
    const areas = declarations["grid-template-areas"];
    if (!rows || !columns || !areas) return null;
    if (rows === "none" && columns === "none" && areas === "none") return "none";

    if (areas === "none") {
      const candidate = `${rows} / ${columns}`;
      return context.matchProperty("grid-template", candidate) ? candidate : null;
    }

    // Interleaving area strings with row track sizes cannot be recovered from the
    // three computed longhands without additional source-order information.
    return null;
  },
} satisfies ShorthandModule;
