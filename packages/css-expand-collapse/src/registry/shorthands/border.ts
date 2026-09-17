import { expandTriple } from "../expanders.js";
import type { DeclarationMap, ShorthandCollapser, ShorthandExpander, ShorthandModule } from "../types.js";

const longhands = new Map([
  ["border-top-width", "medium"],
  ["border-top-style", "none"],
  ["border-top-color", "currentcolor"],
  ["border-right-width", "medium"],
  ["border-right-style", "none"],
  ["border-right-color", "currentcolor"],
  ["border-bottom-width", "medium"],
  ["border-bottom-style", "none"],
  ["border-bottom-color", "currentcolor"],
  ["border-left-width", "medium"],
  ["border-left-style", "none"],
  ["border-left-color", "currentcolor"],
] as const);
const expandTop = expandTriple(new Map([...longhands].slice(0, 3)));

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
  expand,
  collapse,
  safeToDropWhenFullyShadowed: false,
} satisfies ShorthandModule;
