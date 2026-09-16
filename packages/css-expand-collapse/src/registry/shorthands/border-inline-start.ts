import { expandTriple, withCssomFallback } from "../expanders.js";
import { logicalBorderSide } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = logicalBorderSide("inline-start");
const expand = withCssomFallback(expandTriple(longhands));

export default { longhands, strategy: "triple", expand } satisfies ShorthandDefinition;
