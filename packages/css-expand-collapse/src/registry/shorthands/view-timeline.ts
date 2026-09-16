import { splitTopLevelComma } from "../expanders.js";
import type { DeclarationMap, ShorthandDefinition, ShorthandExpander } from "../types.js";

const longhands = ["view-timeline-name", "view-timeline-axis", "view-timeline-inset"] as const;
const initialValues = ["none", "block", "auto"] as const;

const expand: ShorthandExpander = (value, context) => {
  const layers = splitTopLevelComma(value);
  if (!layers.length || layers.some((layer) => !layer)) return null;

  const results: DeclarationMap[] = [];
  for (const layer of layers) {
    const tokens = context.splitWhitespace(layer);
    const result: DeclarationMap = {
      [longhands[0]]: initialValues[0],
      [longhands[1]]: initialValues[1],
      [longhands[2]]: initialValues[2],
    };
    const leftovers: string[] = [];

    for (const token of tokens) {
      if (result[longhands[1]] === initialValues[1] && context.matchProperty(longhands[1], token)) {
        result[longhands[1]] = token;
        continue;
      }
      if (result[longhands[0]] === initialValues[0] && context.matchProperty(longhands[0], token)) {
        result[longhands[0]] = token;
        continue;
      }
      leftovers.push(token);
    }

    if (leftovers.length) {
      const inset = leftovers.join(" ");
      if (!context.matchProperty(longhands[2], inset)) return null;
      result[longhands[2]] = inset;
    }
    results.push(result);
  }

  return Object.fromEntries(
    longhands.map((longhand) => [longhand, results.map((result) => result[longhand]).join(", ")]),
  );
};

export default {
  longhands,
  strategy: "csstree",
  initialValues,
  expand,
  collapse(declarations, context) {
    const values = longhands.map((longhand) => splitTopLevelComma(declarations[longhand] ?? ""));
    const layerCount = values[0]?.length ?? 0;
    if (!layerCount || values.some((layers) => layers.length !== layerCount)) return null;
    const candidate = Array.from({ length: layerCount }, (_, index) =>
      `${values[0]![index]} ${values[1]![index]} ${values[2]![index]}`,
    ).join(", ");
    return context.matchProperty("view-timeline", candidate) ? candidate : null;
  },
} satisfies ShorthandDefinition;
