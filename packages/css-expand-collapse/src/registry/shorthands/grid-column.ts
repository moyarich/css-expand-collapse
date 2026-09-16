import { expandSlashPair, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["grid-column-start", "grid-column-end"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = withCssomFallback(expandSlashPair(longhands, initialValues));

export default { longhands, strategy: "slash-pair", initialValues, expand } satisfies ShorthandDefinition;
