import { expandPair, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["overflow-x", "overflow-y"] as const;
const expand = withCssomFallback(expandPair(longhands));

export default { longhands, strategy: "pair", expand } satisfies ShorthandDefinition;
