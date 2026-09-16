import { expandPair, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["inset-inline-start", "inset-inline-end"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = withCssomFallback(expandPair(longhands));

export default { longhands, strategy: "pair", initialValues, expand } satisfies ShorthandDefinition;
