import { expandTriple, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = [
  "-webkit-border-before-width",
  "-webkit-border-before-style",
  "-webkit-border-before-color",
] as const;
const expand = withCssomFallback(expandTriple(longhands));

export default { longhands, strategy: "triple", expand } satisfies ShorthandDefinition;
