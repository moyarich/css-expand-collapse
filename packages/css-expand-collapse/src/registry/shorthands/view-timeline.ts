import { splitTopLevelComma } from "../context.js";
import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["view-timeline-name", "none"],
  ["view-timeline-axis", "block"],
  ["view-timeline-inset", "auto"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];

const expand: ShorthandExpander = (value, context) => {
  const layers = splitTopLevelComma(value);
  if (!layers.length || layers.some((layer) => !layer)) return null;

  const results: DeclarationMap[] = [];
  for (const layer of layers) {
    const tokens = context.splitWhitespace(layer);
    const result: DeclarationMap = {
      [longhandNames[0]]: initialValues[0],
      [longhandNames[1]]: initialValues[1],
      [longhandNames[2]]: initialValues[2],
    };
    const leftovers: string[] = [];

    for (const token of tokens) {
      if (result[longhandNames[1]] === initialValues[1] && context.matchProperty(longhandNames[1], token)) {
        result[longhandNames[1]] = token;
        continue;
      }
      if (result[longhandNames[0]] === initialValues[0] && context.matchProperty(longhandNames[0], token)) {
        result[longhandNames[0]] = token;
        continue;
      }
      leftovers.push(token);
    }

    if (leftovers.length) {
      const inset = leftovers.join(" ");
      if (!context.matchProperty(longhandNames[2], inset)) return null;
      result[longhandNames[2]] = inset;
    }
    results.push(result);
  }

  return Object.fromEntries(
    longhandNames.map((longhand) => [longhand, results.map((result) => result[longhand]).join(", ")]),
  );
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const values = longhandNames.map((longhand) => splitTopLevelComma(declarations[longhand] ?? ""));
    const layerCount = values[0]?.length ?? 0;
    if (!layerCount || values.some((layers) => layers.length !== layerCount)) return null;
    const candidate = Array.from({ length: layerCount }, (_, index) =>
      `${values[0]![index]} ${values[1]![index]} ${values[2]![index]}`,
    ).join(", ");
    return context.matchProperty("view-timeline", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
