import { expandTriple, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["column-rule-width", "column-rule-style", "column-rule-color"] as const;
const expand = withCssomFallback(expandTriple(longhands));

export default { longhands, strategy: "triple", expand } satisfies ShorthandDefinition;
