import { expandLogicalBorderAxis, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = [
  "border-inline-start-width", "border-inline-start-style", "border-inline-start-color",
  "border-inline-end-width", "border-inline-end-style", "border-inline-end-color",
] as const;
const expand = withCssomFallback(expandLogicalBorderAxis(longhands));

export default { longhands, strategy: "logical-border-axis", expand } satisfies ShorthandDefinition;
