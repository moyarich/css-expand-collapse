import { expandTriple, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["outline-width", "outline-style", "outline-color"] as const;
const expand = withCssomFallback(expandTriple(longhands, ["medium", "none", "auto"]));

export default { longhands, strategy: "triple", expand } satisfies ShorthandDefinition;
