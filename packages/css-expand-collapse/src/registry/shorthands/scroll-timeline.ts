import { splitTopLevelComma } from "../expanders.js";
import type { DeclarationMap, ShorthandDefinition, ShorthandExpander } from "../types.js";

const longhands = ["scroll-timeline-name", "scroll-timeline-axis"] as const;
const initialValues = ["none", "block"] as const;

const expand: ShorthandExpander = (value, context) => {
  const layers = splitTopLevelComma(value);
  if (!layers.length || layers.some((layer) => !layer)) return null;

  const results: DeclarationMap[] = [];
  for (const layer of layers) {
    const result: DeclarationMap = {
      [longhands[0]]: initialValues[0],
      [longhands[1]]: initialValues[1],
    };
    const assigned = new Set<string>();
    for (const token of context.splitWhitespace(layer)) {
      if (!assigned.has(longhands[1]) && context.matchProperty(longhands[1], token)) {
        result[longhands[1]] = token;
        assigned.add(longhands[1]);
        continue;
      }
      if (!assigned.has(longhands[0]) && context.matchProperty(longhands[0], token)) {
        result[longhands[0]] = token;
        assigned.add(longhands[0]);
        continue;
      }
      return null;
    }
    results.push(result);
  }

  return {
    [longhands[0]]: results.map((result) => result[longhands[0]]).join(", "),
    [longhands[1]]: results.map((result) => result[longhands[1]]).join(", "),
  };
};

export default {
  longhands,
  strategy: "csstree",
  initialValues,
  expand,
  collapse(declarations, context) {
    const names = splitTopLevelComma(declarations[longhands[0]] ?? "");
    const axes = splitTopLevelComma(declarations[longhands[1]] ?? "");
    if (!names.length || names.length !== axes.length) return null;
    const candidate = names.map((name, index) => `${name} ${axes[index]}`).join(", ");
    return context.matchProperty("scroll-timeline", candidate) ? candidate : null;
  },
} satisfies ShorthandDefinition;
