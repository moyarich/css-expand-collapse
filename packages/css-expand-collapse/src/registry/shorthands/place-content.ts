import { expandPair } from "../expanders.js";
import type { ShorthandModule } from "../types.js";

const longhands = ["align-content", "justify-content"] as const;
const expand = expandPair(longhands);

export default { longhands, strategy: "pair", expand } satisfies ShorthandModule;
