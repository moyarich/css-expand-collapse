import { collapsePair } from "../collapsers.js";
import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["align-content", "justify-content"] as const;
const expand = expandPair(longhands);

const collapse = collapsePair(longhands);

export default { longhands, expand, collapse } satisfies ShorthandModule;
