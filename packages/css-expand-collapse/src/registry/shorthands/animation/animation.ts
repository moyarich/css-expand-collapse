import { activeLonghands } from "../../helpers.js";
import { splitTopLevelComma } from "../../context.js";
import type {
  DeclarationMap,
  ShorthandModule,
  ShorthandExpander,
} from "../../types.js";

const longhands = new Map([
  ["animation-name", "none"],
  ["animation-duration", "0s"],
  ["animation-timing-function", "ease"],
  ["animation-delay", "0s"],
  ["animation-iteration-count", "1"],
  ["animation-direction", "normal"],
  ["animation-fill-mode", "none"],
  ["animation-play-state", "running"],
  ["animation-timeline", "auto"],
  ["animation-range-start", "normal"],
  ["animation-range-end", "normal"],
  ["animation-trigger", "none"],
] as const);
// The draft-defined trigger reset is retained, but native equivalence is not yet established.
const excludedLonghands = ["animation-trigger"] as const;
const active = activeLonghands(longhands, excludedLonghands);
const longhandNames = [...active.keys()];
const initialValues = [...active.values()];

const expand: ShorthandExpander = (value, context) => {
  const layers = splitTopLevelComma(value);
  if (!layers.length || layers.some((layer) => !layer)) return null;
  const expanded: DeclarationMap[] = [];

  for (const layer of layers) {
    const result: DeclarationMap = Object.fromEntries(
      longhandNames.map((longhand, index) => [longhand, initialValues[index]!]),
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
        (candidate) =>
          !assigned.has(candidate) && context.matchProperty(candidate, token),
      );
      if (!property) return null;
      result[property] = token;
      assigned.add(property);
    }

    // Timeline, range and trigger constituents are reset-only; their initial values
    // were populated above and cannot be assigned by shorthand tokens.
    expanded.push(result);
  }

  return Object.fromEntries(
    longhandNames.map((longhand, index) => [
      longhand,
      index >= 8 ? initialValues[index]! : expanded.map((layer) => layer[longhand]).join(", "),
    ]),
  );
};

export default {
  longhands,
  excludedLonghands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const values = longhandNames.map((longhand) =>
      splitTopLevelComma(declarations[longhand] ?? ""),
    );
    const count = values[0]?.length ?? 0;
    if (!count || values.slice(0, 8).some((layers) => layers.length !== count)) return null;
    if (values.slice(8).some((layers, index) =>
      layers.length !== 1 || layers[0] !== initialValues[index + 8],
    )) return null;

    const candidate = Array.from({ length: count }, (_, index) =>
      [
        values[1]![index],
        values[2]![index],
        values[3]![index],
        values[4]![index],
        values[5]![index],
        values[6]![index],
        values[7]![index],
        values[0]![index],
      ].join(" "),
    ).join(", ");

    return context.matchProperty("animation", candidate) ? candidate : null;
  },
} satisfies ShorthandModule;
