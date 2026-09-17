import { expandPair } from "../expanders.js";
import { logicalPair } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = logicalPair("scroll-margin", "inline");
const expand = expandPair(longhands);

export default { longhands, strategy: "pair", expand } satisfies ShorthandModule;
