import { collapsePair } from "../collapsers.js";
import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["align-items", "justify-items"] as const;
const expand = expandPair(longhands);

const collapse = collapsePair(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
