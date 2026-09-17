import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = ["list-style-position", "list-style-image", "list-style-type"] as const;
const initialValues = ["outside", "none", "disc"] as const;

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
    const priority = [longhands[0], longhands[1], longhands[2]];
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
  initialValues,
  expand,
  collapse(declarations, context) {
    const position = declarations[longhands[0]];
    const image = declarations[longhands[1]];
    const type = declarations[longhands[2]];
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
