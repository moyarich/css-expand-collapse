import { expandComponents, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["column-width", "column-count"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = withCssomFallback(expandComponents(longhands, initialValues));

export default { longhands, strategy: "components", initialValues, expand } satisfies ShorthandDefinition;
