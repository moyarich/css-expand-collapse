import { expandSlashPair, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["grid-row-start", "grid-row-end"] as const;
const initialValues = ["auto", "auto"] as const;
const expand = withCssomFallback(expandSlashPair(longhands, initialValues));

export default { longhands, strategy: "slash-pair", initialValues, expand } satisfies ShorthandDefinition;
