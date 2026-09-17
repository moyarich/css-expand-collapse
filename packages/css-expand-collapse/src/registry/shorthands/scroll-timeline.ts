import { splitTopLevelComma } from "../context.js";
import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["scroll-timeline-name", "none"],
  ["scroll-timeline-axis", "block"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];

const expand: ShorthandExpander = (value, context) => {
  const layers = splitTopLevelComma(value);
  if (!layers.length || layers.some((layer) => !layer)) return null;

  const results: DeclarationMap[] = [];
  for (const layer of layers) {
    const result: DeclarationMap = {
      [longhandNames[0]]: initialValues[0],
      [longhandNames[1]]: initialValues[1],
    };
    const assigned = new Set<string>();
    for (const token of context.splitWhitespace(layer)) {
      if (!assigned.has(longhandNames[1]) && context.matchProperty(longhandNames[1], token)) {
        result[longhandNames[1]] = token;
        assigned.add(longhandNames[1]);
        continue;
      }
      if (!assigned.has(longhandNames[0]) && context.matchProperty(longhandNames[0], token)) {
        result[longhandNames[0]] = token;
        assigned.add(longhandNames[0]);
        continue;
      }
      return null;
    }
    results.push(result);
  }

  return {
    [longhandNames[0]]: results.map((result) => result[longhandNames[0]]).join(", "),
    [longhandNames[1]]: results.map((result) => result[longhandNames[1]]).join(", "),
  };
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const names = splitTopLevelComma(declarations[longhandNames[0]] ?? "");
    const axes = splitTopLevelComma(declarations[longhandNames[1]] ?? "");
    if (!names.length || names.length !== axes.length) return null;
    const candidate = names.map((name, index) => `${name} ${axes[index]}`).join(", ");
    return context.matchProperty("scroll-timeline", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
