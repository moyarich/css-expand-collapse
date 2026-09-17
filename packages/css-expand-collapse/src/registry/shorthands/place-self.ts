import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["align-self", "justify-self"] as const;
const expand = expandPair(longhands);

export default { longhands, strategy: "pair", expand } satisfies ShorthandModule;
