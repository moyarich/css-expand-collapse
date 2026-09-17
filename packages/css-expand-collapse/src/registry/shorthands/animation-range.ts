import { expandOrderedPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = new Map([
  ["animation-range-start", "normal"],
  ["animation-range-end", "normal"],
] as const);
const longhandNames = [...longhands.keys()];
const initialValues = [...longhands.values()];
const expand = expandOrderedPair(longhands);

export default {
  longhands,
  safeToDropWhenFullyShadowed: false,
  expand,
  collapse(declarations, context) {
    const start = declarations[longhandNames[0]];
    const end = declarations[longhandNames[1]];
    if (!start || !end) return null;
    const candidates = end === initialValues[1]
      ? [start, `${start} ${end}`]
      : [`${start} ${end}`];
    return candidates.find((candidate) => context.matchProperty("animation-range", candidate)) ?? null;
  },
} satisfies ShorthandModule;
