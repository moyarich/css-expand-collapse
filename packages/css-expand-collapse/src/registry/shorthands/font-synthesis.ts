import { expandCsstreeComponents } from "../expanders.js";
import type { ShorthandDefinition, ShorthandExpander } from "../types.js";

const longhands = [
  "font-synthesis-weight",
  "font-synthesis-style",
  "font-synthesis-small-caps",
  "font-synthesis-position",
] as const;
const initialValues = ["auto", "auto", "auto", "auto"] as const;
const expandComponents = expandCsstreeComponents(longhands, { initialValues });

const expand: ShorthandExpander = (value, context) => {
  if (value === "none") {
    return Object.fromEntries(longhands.map((longhand) => [longhand, "none"]));
  }
  return expandComponents(value, context);
};

export default {
  longhands,
  strategy: "csstree",
  initialValues,
  expand,
  collapse(declarations, context) {
    const values = longhands.map((longhand) => declarations[longhand]);
    if (values.some((value) => !value)) return null;
    if (values.every((value) => value === "none")) return "none";
    const candidate = values
      .filter((value, index) => value !== initialValues[index])
      .join(" ");
    if (candidate && context.matchProperty("font-synthesis", candidate)) return candidate;
    const full = values.join(" ");
    return context.matchProperty("font-synthesis", full) ? full : null;
  },
} satisfies ShorthandDefinition;
