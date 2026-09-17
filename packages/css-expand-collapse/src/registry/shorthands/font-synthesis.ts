import { expandCsstreeComponents } from "../expanders.js";
import type { ShorthandModule, ShorthandExpander } from "../types.js";

const longhands = new Map([
  ["font-synthesis-weight", "auto"],
  ["font-synthesis-style", "auto"],
  ["font-synthesis-small-caps", "auto"],
  ["font-synthesis-position", "none"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];
const expandComponents = expandCsstreeComponents(longhands);

const expand: ShorthandExpander = (value, context) => {
  if (value === "none") {
    return Object.fromEntries(longhandNames.map((longhand) => [longhand, "none"]));
  }
  return expandComponents(value, context);
};

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const values = longhandNames.map((longhand) => declarations[longhand]);
    if (values.some((value) => !value)) return null;
    if (values.every((value) => value === "none")) return "none";
    const candidate = values
      .filter((value, index) => value !== initialValues[index])
      .join(" ");
    if (candidate && context.matchProperty("font-synthesis", candidate)) return candidate;
    const full = values.join(" ");
    return context.matchProperty("font-synthesis", full) ? full : null;
  },
} satisfies ShorthandModule;
