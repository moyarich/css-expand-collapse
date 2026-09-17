import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["overflow-x", "overflow-y"] as const;
const expand = expandPair(longhands);

export default { longhands, strategy: "pair", expand } satisfies ShorthandModule;
