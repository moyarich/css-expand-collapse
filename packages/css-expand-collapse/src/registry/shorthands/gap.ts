import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["row-gap", "column-gap"] as const;
const expand = expandPair(longhands);

export default { longhands, strategy: "pair", expand } satisfies ShorthandModule;
