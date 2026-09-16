import { expandPair, withCssomFallback } from "../expanders.js";
import { logicalPair } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = logicalPair("margin", "block");
const expand = withCssomFallback(expandPair(longhands));

export default { longhands, strategy: "pair", expand } satisfies ShorthandDefinition;
