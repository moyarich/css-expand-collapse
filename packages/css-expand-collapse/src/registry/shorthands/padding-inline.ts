import { expandPair, withCssomFallback } from "../expanders.js";
import { logicalPair } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = logicalPair("padding", "inline");
const expand = withCssomFallback(expandPair(longhands));

export default { longhands, strategy: "pair", expand } satisfies ShorthandDefinition;
