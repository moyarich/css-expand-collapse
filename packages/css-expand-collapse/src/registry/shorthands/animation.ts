import { splitTopLevelComma } from "../context.js";
import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = [
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "animation-delay",
  "animation-iteration-count",
  "animation-direction",
  "animation-fill-mode",
  "animation-play-state",
  "animation-timeline",
] as const;
const initialValues = ["none", "0s", "ease", "0s", "1", "normal", "none", "running", "auto"] as const;

const expand: ShorthandExpander = (value, context) => {
  const layers = splitTopLevelComma(value);
  if (!layers.length || layers.some((layer) => !layer)) return null;
  const expanded: DeclarationMap[] = [];

  for (const layer of layers) {
    const result: DeclarationMap = Object.fromEntries(
      longhands.map((longhand, index) => [longhand, initialValues[index]!]),
    );
    const assigned = new Set<string>();
    let timeCount = 0;

    for (const token of context.splitWhitespace(layer)) {
      if (context.matchProperty("animation-duration", token)) {
        if (timeCount === 0) result["animation-duration"] = token;
        else if (timeCount === 1) result["animation-delay"] = token;
        else return null;
        timeCount += 1;
        continue;
      }

      const priority = [
        "animation-timing-function",
        "animation-iteration-count",
        "animation-direction",
        "animation-fill-mode",
        "animation-play-state",
        "animation-name",
      ] as const;
      const property = priority.find(
        (candidate) => !assigned.has(candidate) && context.matchProperty(candidate, token),
      );
      if (!property) return null;
      result[property] = token;
      assigned.add(property);
    }

    // animation-timeline is reset by the animation shorthand but is not settable
    // through the shorthand grammar itself.
    result["animation-timeline"] = "auto";
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
    if (values[8]!.some((timeline) => timeline !== "auto")) return null;

    const candidate = Array.from({ length: count }, (_, index) => [
      values[1]![index],
      values[2]![index],
      values[3]![index],
      values[4]![index],
      values[5]![index],
      values[6]![index],
      values[7]![index],
      values[0]![index],
    ].join(" ")).join(", ");

    return context.matchProperty("animation", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
