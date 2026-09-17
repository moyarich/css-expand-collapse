import { expandTriple } from "../expanders.js";
import type { DeclarationMap, ShorthandCollapser, ShorthandExpander, ShorthandModule } from "../types.js";

const longhands = [
  "border-top-width", "border-top-style", "border-top-color",
  "border-right-width", "border-right-style", "border-right-color",
  "border-bottom-width", "border-bottom-style", "border-bottom-color",
  "border-left-width", "border-left-style", "border-left-color",
] as const;
const initialValues = ["medium", "none", "currentcolor", "medium", "none", "currentcolor", "medium", "none", "currentcolor", "medium", "none", "currentcolor"] as const;
const expandTop = expandTriple(longhands.slice(0, 3), initialValues.slice(0, 3));

const expand: ShorthandExpander = (value, context) => {
  const top = expandTop(value, context);
  if (!top) return null;
  const result: DeclarationMap = {};
  for (const side of ["top", "right", "bottom", "left"] as const) {
    result[`border-${side}-width`] = top["border-top-width"]!;
    result[`border-${side}-style`] = top["border-top-style"]!;
    result[`border-${side}-color`] = top["border-top-color"]!;
  }
  return result;
};

const collapse: ShorthandCollapser = (declarations, context) => {
  const sides = ["top", "right", "bottom", "left"].map((side) => [
    declarations[`border-${side}-width`]?.trim(),
    declarations[`border-${side}-style`]?.trim(),
    declarations[`border-${side}-color`]?.trim(),
  ]);
  if (sides.some((side) => side.some((value) => !value))) return null;
  const first = sides[0]!.join(" ");
  if (!sides.every((side) => side.join(" ") === first)) return null;
  return context.matchProperty("border", first) ? first : null;
};

export default {
  longhands,
  initialValues,
  expand,
  collapse,
  safeToDropWhenFullyShadowed: false,
} satisfies ShorthandModule;
