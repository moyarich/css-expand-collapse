import { expandPair, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["contain-intrinsic-width", "contain-intrinsic-height"] as const;
const initialValues = ["none", "none"] as const;
const expand = withCssomFallback(expandPair(longhands));

export default { longhands, strategy: "pair", initialValues, expand } satisfies ShorthandDefinition;
