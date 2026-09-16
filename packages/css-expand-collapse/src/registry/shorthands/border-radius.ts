import { expandQuad, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = [
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
] as const;
const expand = withCssomFallback(expandQuad(longhands));

export default { longhands, strategy: "quad", expand } satisfies ShorthandDefinition;
