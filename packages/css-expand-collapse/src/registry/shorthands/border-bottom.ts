import { expandTriple, withCssomFallback } from "../expanders.js";
import { sideBorder } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = sideBorder("bottom");
const expand = withCssomFallback(expandTriple(longhands));

export default { longhands, strategy: "triple", expand } satisfies ShorthandDefinition;
