import { splitTopLevelComma } from "../context.js";
import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = [
  "transition-property",
  "transition-duration",
  "transition-timing-function",
  "transition-delay",
  "transition-behavior",
] as const;
const initialValues = ["all", "0s", "ease", "0s", "normal"] as const;

const expand: ShorthandExpander = (value, context) => {
  const layers = splitTopLevelComma(value);
  if (!layers.length || layers.some((layer) => !layer)) return null;
  const expanded: DeclarationMap[] = [];

  for (const layer of layers) {
    const result: DeclarationMap = Object.fromEntries(
      longhands.map((longhand, index) => [longhand, initialValues[index]!]),
    );
    let propertyAssigned = false;
    let timingAssigned = false;
    let behaviorAssigned = false;
    let timeCount = 0;

    for (const token of context.splitWhitespace(layer)) {
      if (!timingAssigned && context.matchProperty("transition-timing-function", token)) {
        result["transition-timing-function"] = token;
        timingAssigned = true;
        continue;
      }
      if (!behaviorAssigned && context.matchProperty("transition-behavior", token)) {
        result["transition-behavior"] = token;
        behaviorAssigned = true;
        continue;
      }
      if (context.matchProperty("transition-duration", token)) {
        if (timeCount === 0) result["transition-duration"] = token;
        else if (timeCount === 1) result["transition-delay"] = token;
        else return null;
        timeCount += 1;
        continue;
      }
      if (!propertyAssigned && context.matchProperty("transition-property", token)) {
        result["transition-property"] = token;
        propertyAssigned = true;
        continue;
      }
      return null;
    }

    expanded.push(result);
  }

  return Object.fromEntries(
    longhands.map((longhand) => [longhand, expanded.map((layer) => layer[longhand]).join(", ")]),
  );
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  initialValues,
  expand,
  collapse(declarations, context) {
    const values = longhands.map((longhand) => splitTopLevelComma(declarations[longhand] ?? ""));
    const count = values[0]?.length ?? 0;
    if (!count || values.some((layers) => layers.length !== count)) return null;

    const candidate = Array.from({ length: count }, (_, index) =>
      `${values[0]![index]} ${values[1]![index]} ${values[2]![index]} ${values[3]![index]} ${values[4]![index]}`,
    ).join(", ");
    return context.matchProperty("transition", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
