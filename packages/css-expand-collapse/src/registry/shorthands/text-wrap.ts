import { expandComponents, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["text-wrap-mode", "text-wrap-style"] as const;
const initialValues = ["wrap", "auto"] as const;
const expand = withCssomFallback(expandComponents(longhands, initialValues));

export default { longhands, strategy: "components", initialValues, expand } satisfies ShorthandDefinition;
