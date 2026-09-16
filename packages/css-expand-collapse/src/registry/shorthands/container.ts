import { expandSlashPair, withCssomFallback } from "../expanders.js";
import type { ShorthandDefinition } from "../types.js";

const longhands = ["container-name", "container-type"] as const;
const initialValues = ["none", "normal"] as const;
const expand = withCssomFallback(expandSlashPair(longhands, initialValues));

export default { longhands, strategy: "slash-pair", initialValues, expand } satisfies ShorthandDefinition;
