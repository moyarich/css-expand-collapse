import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["list-style-position", "outside"],
  ["list-style-image", "none"],
  ["list-style-type", "disc"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];

const expand: ShorthandExpander = (value, context) => {
  if (value === "none") {
    return {
      "list-style-position": initialValues[0],
      "list-style-image": "none",
      "list-style-type": "none",
    };
  }

  const tokens = context.splitWhitespace(value);
  if (!tokens.length) return null;
  const result: DeclarationMap = {
    "list-style-position": initialValues[0],
    "list-style-image": initialValues[1],
    "list-style-type": initialValues[2],
  };
  const assigned = new Set<string>();

  for (const token of tokens) {
    const priority = [longhandNames[0], longhandNames[1], longhandNames[2]];
    const candidates = priority.filter(
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
    const position = declarations[longhandNames[0]];
    const image = declarations[longhandNames[1]];
    const type = declarations[longhandNames[2]];
    if (!position || !image || !type) return null;

    if (image === "none" && type === "none" && position === initialValues[0]) return "none";

    const full = `${position} ${image} ${type}`;
    if (context.matchProperty("list-style", full)) return full;

    const compact = [
      position === initialValues[0] ? "" : position,
      image === initialValues[1] ? "" : image,
      type === initialValues[2] ? "" : type,
    ].filter(Boolean).join(" ");
    return compact && context.matchProperty("list-style", compact) ? compact : null;
  },
} satisfies ShorthandModule;
