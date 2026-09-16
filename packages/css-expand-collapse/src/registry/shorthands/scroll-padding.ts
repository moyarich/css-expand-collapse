import { expandQuad, withCssomFallback } from "../expanders.js";
import { quad } from "../helpers.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = quad("scroll-padding");
const expand = withCssomFallback(expandQuad(longhands));

export default { longhands, strategy: "quad", expand } satisfies ShorthandDefinition;
