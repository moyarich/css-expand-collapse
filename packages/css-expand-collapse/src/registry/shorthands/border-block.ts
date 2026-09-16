import { expandLogicalBorderAxis, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = [
  "border-block-start-width", "border-block-start-style", "border-block-start-color",
  "border-block-end-width", "border-block-end-style", "border-block-end-color",
] as const;
const expand = withCssomFallback(expandLogicalBorderAxis(longhands));

export default { longhands, strategy: "logical-border-axis", expand } satisfies ShorthandDefinition;
