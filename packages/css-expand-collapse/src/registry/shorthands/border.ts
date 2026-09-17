import { expandTriple } from "../expanders.js";
import type { DeclarationMap, ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = [
  "border-top-width", "border-top-style", "border-top-color",
  "border-right-width", "border-right-style", "border-right-color",
  "border-bottom-width", "border-bottom-style", "border-bottom-color",
  "border-left-width", "border-left-style", "border-left-color",
] as const;
const expandTop = expandTriple(longhands.slice(0, 3));

const expandPure: ShorthandExpander = (value, context) => {
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

const expand = expandPure;

export default { longhands, strategy: "border-all", expand } satisfies ShorthandModule;
