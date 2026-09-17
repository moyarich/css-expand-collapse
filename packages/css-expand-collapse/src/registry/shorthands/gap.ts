import { collapsePair } from "../collapsers.js";
import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["row-gap", "column-gap"] as const;
const initialValues = ["normal", "normal"] as const;
const expand = expandPair(longhands);

const collapse = collapsePair(longhands);

export default { longhands, initialValues, expand, collapse } satisfies ShorthandModule;
