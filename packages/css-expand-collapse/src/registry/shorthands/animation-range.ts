import { expandOrderedPair } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["animation-range-start", "animation-range-end"] as const;
const initialValues = ["normal", "normal"] as const;
const expand = expandOrderedPair(longhands, initialValues);

export default {
  longhands,
  strategy: "csstree",
  initialValues,
  expand,
  collapse(declarations, context) {
    const start = declarations[longhands[0]];
    const end = declarations[longhands[1]];
    if (!start || !end) return null;
    const candidates = end === initialValues[1]
      ? [start, `${start} ${end}`]
      : [`${start} ${end}`];
    return candidates.find((candidate) => context.matchProperty("animation-range", candidate)) ?? null;
  },
} satisfies ShorthandDefinition;
