import { collapsePair } from "../collapsers.js";
import { expandPair } from "../expanders.js";
import { logicalPair } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = logicalPair("margin", "inline");
const expand = expandPair(longhands);

const collapse = collapsePair(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
