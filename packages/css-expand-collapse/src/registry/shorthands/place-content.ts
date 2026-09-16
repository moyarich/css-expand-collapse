import { expandPair, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["align-content", "justify-content"] as const;
const expand = withCssomFallback(expandPair(longhands));

export default { longhands, strategy: "pair", expand } satisfies ShorthandDefinition;
