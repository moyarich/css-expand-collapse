import { expandQuad, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["top", "right", "bottom", "left"] as const;
const initialValues = ["auto", "auto", "auto", "auto"] as const;
const expand = withCssomFallback(expandQuad(longhands));

export default { longhands, strategy: "quad", initialValues, expand } satisfies ShorthandDefinition;
