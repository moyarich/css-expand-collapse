import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["align-items", "justify-items"] as const;
const expand = expandPair(longhands);

export default { longhands, strategy: "pair", expand } satisfies ShorthandModule;
