import { expandPair } from "../expanders.js";
import { logicalPair } from "../helpers.js";
import type { ShorthandModule } from "../types.js";

const longhands = logicalPair("padding", "inline");
const expand = expandPair(longhands);

export default { longhands, strategy: "pair", expand } satisfies ShorthandModule;
